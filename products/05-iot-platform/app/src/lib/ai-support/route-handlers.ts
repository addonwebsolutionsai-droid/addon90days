// AUTO-SYNCED FROM packages/ai-support/src/route-handlers.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:20:51.937Z
/**
 * lib/ai-support/route-handlers.ts
 *
 * Shared public-facing support route logic.
 * Each product's thin route files call these with their productId.
 *
 * Inbound pipeline:
 *   1. Rate-limit (30 msg/hr per visitor_id+IP)
 *   2. Validate body (visitor_id + message)
 *   3. Find or create conversation
 *   4. Load recent history + KB docs + global intents
 *   5. Classify intent
 *   6. Retrieve KB context
 *   7. Generate reply (or escalate)
 *   8. Persist inbound + outbound messages
 *   9. Return reply
 */

import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { checkRateLimit, clientIdentifier, rateLimitedResponse } from "@/lib/rate-limit";
import {
  upsertConversation,
  getRecentMessages,
  getActiveKbDocs,
  getGlobalIntents,
  insertMessage,
  updateConversationStatus,
  getConversation,
  type ProductId,
} from "./db";
import {
  classifyIntent,
  retrieveTopChunks,
  buildKbContext,
  generateReply,
} from "./engine";

// Per-product name map — used in the system prompt so the AI knows its context
const PRODUCT_NAMES: Record<ProductId, string> = {
  p01: "Claude Toolkit",
  p02: "ChatBase",
  p03: "TaxPilot",
  p04: "TableFlow",
  p05: "ConnectOne",
  p06: "MachineGuard",
};

// Per-product default system prompts for reply generation
const PRODUCT_SYSTEM_PROMPTS: Record<ProductId, string> = {
  p01: "You help developers and teams get the most out of the Claude Toolkit — skills, MCP servers, and agent bundles.",
  p02: "You assist WhatsApp Business users with the ChatBase platform — onboarding, integrations, and automation.",
  p03: "You help Indian businesses with GST compliance, invoicing, IRN generation, and GSTR filings on TaxPilot.",
  p04: "You support restaurant operators using TableFlow — table management, POS, KDS, and online ordering.",
  p05: "You help IoT teams connect, provision, and manage devices on the ConnectOne platform.",
  p06: "You assist industrial teams with MachineGuard — predictive maintenance, anomaly detection, and alert configuration.",
};

// Escalation confidence threshold — below this, hand off to human
const ESCALATION_THRESHOLD = 0.4;

const InboundSchema = z.object({
  visitor_id:       z.string().min(1).max(200),
  message:          z.string().min(1).max(4000),
  is_authenticated: z.boolean().optional().default(false),
  conversation_id:  z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Public inbound handler
// ---------------------------------------------------------------------------

export async function handleSupportInbound(
  productId: ProductId,
  req:       NextRequest,
): Promise<NextResponse> {
  // Rate limit: 30 messages per hour per visitor_id+IP combo
  const ip         = clientIdentifier(req);
  let   visitorId  = "anon";

  // Pre-parse visitor_id for rate-limit key without full Zod parse yet
  try {
    const raw = (await req.clone().json()) as Record<string, unknown>;
    if (typeof raw["visitor_id"] === "string") visitorId = raw["visitor_id"].slice(0, 200);
  } catch {
    // ignore — full parse below will catch it
  }

  const rlKey    = `support:${productId}:${visitorId}:${ip}`;
  const { allowed, retryAfterSec } = await checkRateLimit({
    key:           rlKey,
    limit:         30,
    windowSeconds: 3600,
  });
  if (!allowed) return rateLimitedResponse(retryAfterSec) as unknown as NextResponse;

  // Parse body
  let body: unknown;
  try { body = await req.json(); }
  catch { return jsonError("BAD_REQUEST", "Invalid JSON", 400); }

  const parsed = InboundSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", parsed.error.message, 400);
  }

  const { visitor_id, message, is_authenticated, conversation_id } = parsed.data;

  try {
    // Find or create conversation
    const conversation = conversation_id !== undefined
      ? (await getConversation(productId, conversation_id)) ??
        (await upsertConversation(productId, { visitor_id, is_authenticated }))
      : await upsertConversation(productId, { visitor_id, is_authenticated });

    const convId = conversation.id;

    // Load data in parallel
    const [history, kbDocs, intents] = await Promise.all([
      getRecentMessages(productId, convId, 10),
      getActiveKbDocs(productId),
      getGlobalIntents(),
    ]);

    const historyForEngine = history.map((m) => ({ role: m.role, body: m.body }));

    // Classify intent
    const classification = await classifyIntent(message, intents, historyForEngine);
    const { intent_key, confidence } = classification;

    // Retrieve KB context
    const topChunks = retrieveTopChunks(kbDocs, message);
    const kbContext  = buildKbContext(topChunks);

    // Persist inbound
    await insertMessage(productId, {
      conversation_id: convId,
      direction:       "inbound",
      role:            "visitor",
      body:            message,
      intent:          intent_key,
      confidence,
    });

    // Decide: escalate or reply?
    const matchedIntent = intents.find((i) => i.intent_key === intent_key);
    const intentThreshold = matchedIntent?.threshold ?? 0.5;
    const shouldEscalate  = confidence < ESCALATION_THRESHOLD || intentThreshold >= 1.0;

    if (shouldEscalate) {
      await updateConversationStatus(productId, convId, "escalated", intent_key);
      return NextResponse.json({
        data: {
          conversation_id: convId,
          replied:         false,
          escalated:       true,
          intent:          intent_key,
          confidence,
          reply:           null,
        },
      });
    }

    // Generate reply
    const systemPrompt = matchedIntent?.name
      ? `${PRODUCT_SYSTEM_PROMPTS[productId]}\nHandle intents of type: ${matchedIntent.name}.`
      : PRODUCT_SYSTEM_PROMPTS[productId];

    const replyBody = await generateReply({
      productName:     PRODUCT_NAMES[productId],
      systemPrompt,
      kbContext,
      customerMessage: message,
      history:         historyForEngine,
    });

    if (replyBody === null) {
      await updateConversationStatus(productId, convId, "escalated", intent_key);
      return NextResponse.json({
        data: {
          conversation_id: convId,
          replied:         false,
          escalated:       true,
          intent:          intent_key,
          confidence,
          reply:           null,
        },
      });
    }

    // Persist outbound
    await insertMessage(productId, {
      conversation_id: convId,
      direction:       "outbound",
      role:            "ai",
      body:            replyBody,
      intent:          intent_key,
      confidence,
    });

    await updateConversationStatus(productId, convId, "active", intent_key);

    return NextResponse.json({
      data: {
        conversation_id: convId,
        replied:         true,
        escalated:       false,
        intent:          intent_key,
        confidence,
        reply:           replyBody,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ai-support/${productId}] inbound error: ${msg}`);
    return jsonError("INTERNAL_ERROR", "Support system error", 500);
  }
}

// ---------------------------------------------------------------------------
// Conversation history (visitor sees their own thread)
// ---------------------------------------------------------------------------

export async function handleSupportConversationGet(
  productId:      ProductId,
  conversationId: string,
  visitorId:      string,
): Promise<NextResponse> {
  try {
    const conversation = await getConversation(productId, conversationId);
    if (conversation === null || conversation.visitor_id !== visitorId) {
      return jsonError("NOT_FOUND", "Conversation not found", 404);
    }

    const messages = await getRecentMessages(productId, conversationId, 50);
    return NextResponse.json({ data: { conversation, messages } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ai-support/${productId}] get-conversation error: ${msg}`);
    return jsonError("INTERNAL_ERROR", "Support system error", 500);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function jsonError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
