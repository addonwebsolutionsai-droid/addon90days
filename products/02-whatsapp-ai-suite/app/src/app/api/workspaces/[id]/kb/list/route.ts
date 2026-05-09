/**
 * GET /api/workspaces/:id/kb/list — list KB documents for a workspace
 *
 * Auth: Clerk required. Owner-scoped.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceByOwner, getKbDocs } from "@/lib/p02/db";

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

  const docs = await getKbDocs(workspaceId);

  // Strip raw_content and parsed_chunks from list response — too large to send.
  const slim = docs.map((d) => ({
    id: d.id,
    workspace_id: d.workspace_id,
    kind: d.kind,
    source_url: d.source_url,
    chunk_count: d.parsed_chunks.length,
    // Show first 120 chars of raw content as preview
    preview: d.raw_content.slice(0, 120),
    created_at: d.created_at,
  }));

  return NextResponse.json({ data: slim });
}
