/**
 * GET /api/p02/workspaces/:id/conversations
 *
 * Query params:
 *   status  — filter by conversation status (active | escalated | closed)
 *   limit   — max 100, default 50
 *   cursor  — ISO timestamp of the oldest updated_at in previous page (cursor pagination)
 *
 * Auth: Clerk required. Owner-scoped.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getWorkspaceByOwner, listConversations } from "@/lib/p02/db";
import type { ConvStatus } from "@/lib/p02/types";

const QuerySchema = z.object({
  status: z.enum(["active", "escalated", "closed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const { id: workspaceId } = await ctx.params;
  const workspace = await getWorkspaceByOwner(userId, workspaceId);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found" } },
      { status: 404 }
    );
  }

  const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = QuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const conversations = await listConversations(workspaceId, {
    limit: parsed.data.limit,
    cursor: parsed.data.cursor,
    status: parsed.data.status as ConvStatus | undefined,
  });

  const nextCursor =
    conversations.length === parsed.data.limit
      ? conversations[conversations.length - 1]?.updated_at
      : null;

  return NextResponse.json({
    data: conversations,
    pagination: { next_cursor: nextCursor, limit: parsed.data.limit },
  });
}
