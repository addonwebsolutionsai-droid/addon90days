/**
 * POST /api/admin/chatbase/conversations/{id}/send
 *
 * Admin-scoped manual reply. Identical contract to /api/p02/conversations/{id}/send
 * but bypasses workspace-ownership scoping in favour of the admin gate. Useful
 * for the founder to take over and reply to any test workspace.
 *
 * Auth: requireAdmin (ADMIN_USER_IDS env list).
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getConversation, getWorkspace, insertMessage } from "@/lib/p02/db";
import { sendTextMessage } from "@/lib/p02/meta-api";

const SendSchema = z.object({ body: z.string().min(1).max(1600) });

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
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
  const workspace = await getWorkspace(conversation.workspace_id);
  if (workspace === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workspace not found" } }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.message } }, { status: 400 });
  }

  try {
    const sendResult = await sendTextMessage({
      to:              conversation.customer_phone,
      body:            parsed.data.body,
      phone_number_id: workspace.whatsapp_phone_number_id ?? undefined,
    });

    const msg = await insertMessage({
      conversation_id: conversationId,
      direction:       "outbound",
      body:            parsed.data.body,
      role:            "human",
      meta_message_id: sendResult.meta_message_id ?? undefined,
    });

    return NextResponse.json({ data: msg });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[admin/chatbase/send] ${message}`);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Send failed" } }, { status: 500 });
  }
}
