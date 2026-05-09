/**
 * lib/ai-support/admin-handlers.ts
 *
 * Shared admin-facing support route logic.
 * All functions require the caller to have already passed requireAdmin().
 * All mutations are audit-logged via logAdminAction (compact shape).
 */

import { NextResponse } from "next/server";
import { z }           from "zod";
import { logAdminAction } from "@/lib/audit";
import {
  listKb,
  createKbFromText,
  createKbFromUrl,
  deleteKb,
  listConversations,
  getConversation,
  getRecentMessages,
  insertMessage,
  updateConversationStatus,
  type ProductId,
  type ConvStatus,
} from "./db";

// ---------------------------------------------------------------------------
// KB
// ---------------------------------------------------------------------------

export async function handleAdminListKb(productId: ProductId): Promise<NextResponse> {
  try {
    const rows = await listKb(productId, { limit: 200 });
    return NextResponse.json({ data: rows });
  } catch (err) {
    return serverError(err);
  }
}

const CreateKbSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), raw_content: z.string().min(10).max(50_000) }),
  z.object({ kind: z.literal("url"),  source_url:  z.string().url() }),
]);

export async function handleAdminCreateKb(
  productId:      ProductId,
  adminClerkUserId: string,
  body:           unknown,
): Promise<NextResponse> {
  const parsed = CreateKbSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.message);

  try {
    const row =
      parsed.data.kind === "text"
        ? await createKbFromText(productId, { raw_content: parsed.data.raw_content })
        : await createKbFromUrl(productId, { source_url: parsed.data.source_url });

    void logAdminAction({
      adminClerkUserId,
      action:       `${productId}.support.kb.create`,
      resourceType: `${productId}_support_kb`,
      resourceId:   row.id,
      meta:         { kind: parsed.data.kind },
    });

    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}

export async function handleAdminDeleteKb(
  productId:       ProductId,
  adminClerkUserId: string,
  kbId:            string,
): Promise<NextResponse> {
  try {
    await deleteKb(productId, kbId);

    void logAdminAction({
      adminClerkUserId,
      action:       `${productId}.support.kb.delete`,
      resourceType: `${productId}_support_kb`,
      resourceId:   kbId,
    });

    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    return serverError(err);
  }
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function handleAdminListConversations(
  productId: ProductId,
  query: { status?: ConvStatus; limit?: string; cursor?: string },
): Promise<NextResponse> {
  try {
    const limit = query.limit !== undefined ? parseInt(query.limit, 10) : 50;
    const conversations = await listConversations(productId, {
      status: query.status,
      limit:  isNaN(limit) ? 50 : limit,
      cursor: query.cursor,
    });
    return NextResponse.json({ data: conversations });
  } catch (err) {
    return serverError(err);
  }
}

export async function handleAdminGetConversation(
  productId:      ProductId,
  conversationId: string,
): Promise<NextResponse> {
  try {
    const conversation = await getConversation(productId, conversationId);
    if (conversation === null) return notFound("Conversation not found");

    const messages = await getRecentMessages(productId, conversationId, 100);
    return NextResponse.json({ data: { conversation, messages } });
  } catch (err) {
    return serverError(err);
  }
}

// ---------------------------------------------------------------------------
// Conversation actions
// ---------------------------------------------------------------------------

export async function handleAdminTakeOver(
  productId:        ProductId,
  adminClerkUserId: string,
  conversationId:   string,
): Promise<NextResponse> {
  try {
    const conversation = await getConversation(productId, conversationId);
    if (conversation === null) return notFound("Conversation not found");

    await updateConversationStatus(productId, conversationId, "escalated");

    void logAdminAction({
      adminClerkUserId,
      action:       `${productId}.support.conversation.takeover`,
      resourceType: `${productId}_support_conversations`,
      resourceId:   conversationId,
    });

    return NextResponse.json({ data: { conversation_id: conversationId, status: "escalated" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function handleAdminClose(
  productId:        ProductId,
  adminClerkUserId: string,
  conversationId:   string,
): Promise<NextResponse> {
  try {
    const conversation = await getConversation(productId, conversationId);
    if (conversation === null) return notFound("Conversation not found");

    await updateConversationStatus(productId, conversationId, "closed");

    void logAdminAction({
      adminClerkUserId,
      action:       `${productId}.support.conversation.close`,
      resourceType: `${productId}_support_conversations`,
      resourceId:   conversationId,
    });

    return NextResponse.json({ data: { conversation_id: conversationId, status: "closed" } });
  } catch (err) {
    return serverError(err);
  }
}

const ManualReplySchema = z.object({
  body: z.string().min(1).max(4000),
});

export async function handleAdminSendManualReply(
  productId:        ProductId,
  adminClerkUserId: string,
  conversationId:   string,
  rawBody:          unknown,
): Promise<NextResponse> {
  const parsed = ManualReplySchema.safeParse(rawBody);
  if (!parsed.success) return validationError(parsed.error.message);

  try {
    const conversation = await getConversation(productId, conversationId);
    if (conversation === null) return notFound("Conversation not found");

    const message = await insertMessage(productId, {
      conversation_id: conversationId,
      direction:       "outbound",
      role:            "human",
      body:            parsed.data.body,
    });

    // Keep as escalated while human is handling
    await updateConversationStatus(productId, conversationId, "escalated");

    void logAdminAction({
      adminClerkUserId,
      action:       `${productId}.support.conversation.manual-reply`,
      resourceType: `${productId}_support_messages`,
      resourceId:   message.id,
      meta:         { conversation_id: conversationId },
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function serverError(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[ai-support/admin-handlers] ${msg}`);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Support system error" } }, { status: 500 });
}

function validationError(message: string): NextResponse {
  return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
}

function notFound(message: string): NextResponse {
  return NextResponse.json({ error: { code: "NOT_FOUND", message } }, { status: 404 });
}
