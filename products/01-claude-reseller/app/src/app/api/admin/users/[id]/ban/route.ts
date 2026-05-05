/**
 * POST /api/admin/users/:id/ban  — flip user.banned to true
 * DELETE /api/admin/users/:id/ban — flip user.banned back to false
 *
 * A banned Clerk user cannot sign in or refresh tokens. Existing sessions
 * are revoked on next request. We keep the row (do NOT delete) so abuse
 * patterns are still queryable later.
 */

import { type NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function setBanned(req: NextRequest, ctx: RouteContext, banned: boolean): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.reason === "unauthenticated" ? "Sign in" : "Admin only" },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { id } = await ctx.params;
  if (id.length === 0 || id.length > 100) {
    return NextResponse.json({ error: "Bad user id" }, { status: 400 });
  }
  if (id === guard.userId) {
    return NextResponse.json({ error: "You can't ban yourself" }, { status: 400 });
  }

  const client = await clerkClient();
  try {
    if (banned) {
      await client.users.banUser(id);
    } else {
      await client.users.unbanUser(id);
    }
    return NextResponse.json({ ok: true, id, banned });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Clerk error";
    console.error("[admin/users/ban] failed:", msg);
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 });
  }
}

export function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  return setBanned(req, ctx, true);
}

export function DELETE(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  return setBanned(req, ctx, false);
}
