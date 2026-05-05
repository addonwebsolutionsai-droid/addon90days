/**
 * GET /api/admin/users — paginated list of all Clerk users.
 *
 * Auth: ADMIN_USER_IDS-gated. See `src/lib/admin-guard.ts`.
 *
 * Query:
 *   - page  (1-indexed, default 1)
 *   - limit (default 25, max 100)
 *   - search (substring match on email or name; passed straight to Clerk)
 *
 * Returns: { users: AdminUser[], total: number, page, limit }
 *
 * Why Clerk-direct (no Supabase mirror):
 *   We have no `users` table — Clerk is the source of truth. Pulling live
 *   keeps the admin view honest about ban/unban without us needing to sync.
 */

import { type NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  page:   z.coerce.number().int().min(1).max(1000).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
});

export interface AdminUser {
  id:               string;
  primaryEmail:     string | null;
  firstName:        string | null;
  lastName:         string | null;
  createdAt:        number;
  lastSignInAt:     number | null;
  banned:           boolean;
  imageUrl:         string;
  emailVerified:    boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.reason === "unauthenticated" ? "Sign in" : "Admin only" },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    page:   url.searchParams.get("page")   ?? undefined,
    limit:  url.searchParams.get("limit")  ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Bad query" }, { status: 400 });
  }
  const { page, limit, search } = parsed.data;

  const client = await clerkClient();
  const { data, totalCount } = await client.users.getUserList({
    limit,
    offset: (page - 1) * limit,
    orderBy: "-created_at",
    ...(search !== undefined && search.length > 0 ? { query: search } : {}),
  });

  const users: AdminUser[] = data.map((u) => {
    const primaryEmailObj = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId);
    return {
      id:            u.id,
      primaryEmail:  primaryEmailObj?.emailAddress ?? null,
      firstName:     u.firstName,
      lastName:      u.lastName,
      createdAt:     u.createdAt,
      lastSignInAt:  u.lastSignInAt,
      banned:        u.banned,
      imageUrl:      u.imageUrl,
      emailVerified: primaryEmailObj?.verification?.status === "verified",
    };
  });

  return NextResponse.json({ users, total: totalCount, page, limit });
}
