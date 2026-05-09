/**
 * POST /api/admin/conversations/{id}/take-over
 *
 * Marks the conversation as `escalated` (= human-handled). Subsequent messages
 * from the customer will NOT trigger the AI reply pipeline. Use this when the
 * admin / human takes over from the AI.
 *
 * Auth: requireAdmin.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getConversation, updateConversationStatus } from "@/lib/p02/db";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_req: Request, ctx: RouteContext): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { id: conversationId } = await ctx.params;
  const conversation = await getConversation(conversationId);
  if (conversation === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, { status: 404 });
  }

  await updateConversationStatus(conversationId, "escalated", conversation.last_intent ?? undefined);
  return NextResponse.json({ data: { ok: true, status: "escalated" } });
}
