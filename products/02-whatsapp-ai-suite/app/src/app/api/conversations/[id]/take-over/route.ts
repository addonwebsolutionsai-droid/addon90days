/**
 * POST /api/conversations/:id/take-over
 *
 * Marks conversation as escalated (human pickup).
 * Future inbound messages for this conversation will be stored but no AI reply sent.
 *
 * Auth: Clerk required. Must own the workspace that owns the conversation.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConversation, updateConversationStatus, getWorkspaceByOwner } from "@/lib/p02/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const { id: conversationId } = await ctx.params;
  const conversation = await getConversation(conversationId);
  if (conversation === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Conversation not found" } },
      { status: 404 }
    );
  }

  // Verify ownership
  const workspace = await getWorkspaceByOwner(userId, conversation.workspace_id);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Access denied" } },
      { status: 403 }
    );
  }

  await updateConversationStatus(conversationId, "escalated");
  return NextResponse.json({ data: { id: conversationId, status: "escalated" } });
}
