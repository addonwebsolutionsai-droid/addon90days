/**
 * GET /api/p02/workspaces/:id/intents — list intents (global + workspace overrides)
 *
 * Auth: Clerk required. Owner-scoped.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceByOwner, getIntents } from "@/lib/p02/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
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

  const intents = await getIntents(workspaceId);
  return NextResponse.json({ data: intents });
}
