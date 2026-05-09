/**
 * POST /api/conversations/:id/send
 *
 * Human agent sends a message from the dashboard.
 * Persists the message and sends via Meta API (or mock).
 *
 * Body: { body: string }
 *
 * Auth: Clerk required. Must own the workspace.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getConversation, getWorkspaceByOwner, insertMessage } from "@/lib/p02/db";
import { sendTextMessage } from "@/lib/p02/meta-api";

const SendSchema = z.object({
  body: z.string().min(1).max(1600),
});

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

  const workspace = await getWorkspaceByOwner(userId, conversation.workspace_id);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Access denied" } },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const sendResult = await sendTextMessage({
      to: conversation.customer_phone,
      body: parsed.data.body,
      phone_number_id: workspace.whatsapp_phone_number_id ?? undefined,
    });

    const msg = await insertMessage({
      conversation_id: conversationId,
      direction: "outbound",
      body: parsed.data.body,
      role: "human",
      meta_message_id: sendResult.meta_message_id ?? undefined,
    });

    return NextResponse.json({ data: msg });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[p02/conversations/send] ${message}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
