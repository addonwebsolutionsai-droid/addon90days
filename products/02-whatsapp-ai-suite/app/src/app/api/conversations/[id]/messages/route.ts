/**
 * GET /api/conversations/:id/messages — list messages in a conversation
 *
 * Query params:
 *   limit — default 50, max 100
 *
 * Auth: Clerk required. Must own the workspace that owns this conversation.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getConversation, getWorkspaceByOwner, getRecentMessages } from "@/lib/p02/db";

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
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

  const { id: conversationId } = await ctx.params;
  const conversation = await getConversation(conversationId);
  if (conversation === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Conversation not found" } },
      { status: 404 }
    );
  }

  // Verify ownership via workspace
  const workspace = await getWorkspaceByOwner(userId, conversation.workspace_id);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Access denied" } },
      { status: 403 }
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

  const messages = await getRecentMessages(conversationId, parsed.data.limit);
  return NextResponse.json({ data: messages });
}
