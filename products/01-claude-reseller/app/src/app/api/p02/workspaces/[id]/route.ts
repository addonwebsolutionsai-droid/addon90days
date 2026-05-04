/**
 * GET /api/p02/workspaces/:id — get workspace (owner only)
 *
 * Auth: Clerk required. Scoped by owner_clerk_user_id.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceByOwner } from "@/lib/p02/db";
import type { P02Workspace } from "@/lib/p02/types";

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

  const { id } = await ctx.params;
  const workspace = await getWorkspaceByOwner(userId, id);

  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: sanitizeWorkspace(workspace) });
}

function sanitizeWorkspace(w: P02Workspace): Omit<P02Workspace, "whatsapp_access_token_enc"> {
  const { whatsapp_access_token_enc: _enc, ...safe } = w;
  return safe;
}
