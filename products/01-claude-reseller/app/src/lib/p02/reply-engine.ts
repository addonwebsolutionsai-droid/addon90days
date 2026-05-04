/**
 * P02 ChatBase — Reply Engine.
 *
 * Pipeline:
 *   1. Load workspace config + intents + KB docs
 *   2. Retrieve top-K KB chunks (keyword match MVP)
 *   3. Classify intent via Groq
 *   4. If confidence < escalation_threshold OR intent threshold == 1.0:
 *        mark conversation escalated, persist inbound, return null reply
 *   5. Else: generate reply via Groq using KB context + intent system prompt
 *   6. Persist outbound message
 *   7. Send via Meta API (or mock)
 */

import { getWorkspace, getIntents, getKbDocs, insertMessage, updateConversationStatus } from "./db";
import { retrieveTopChunks, buildKbContext } from "./kb";
import { classifyIntent } from "./intent";
import { sendTextMessage } from "./meta-api";
import type { ReplyEngineInput, ReplyEngineResult, P02Intent } from "./types";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_REPLY_TOKENS = 400; // keep replies well under 1600 WhatsApp chars

export async function processMessage(input: ReplyEngineInput): Promise<ReplyEngineResult> {
  const { workspace_id, conversation_id, customer_message, history } = input;

  // 1. Load workspace
  const workspace = await getWorkspace(workspace_id);
  if (workspace === null) {
    throw new Error(`Workspace not found: ${workspace_id}`);
  }

  // 2. Load intents + KB
  const [intents, kbDocs] = await Promise.all([
    getIntents(workspace_id),
    getKbDocs(workspace_id),
  ]);

  // 3. Retrieve KB context
  const topChunks = retrieveTopChunks(kbDocs, customer_message);
  const kbContext = buildKbContext(topChunks);

  // 4. Classify intent
  const classification = await classifyIntent(customer_message, intents, history);
  const { intent_key, confidence } = classification;

  // Find the matched intent definition
  const matchedIntent: P02Intent | undefined = intents.find(
    (i) => i.intent_key === intent_key
  );

  // Persist inbound message with classification metadata
  await insertMessage({
    conversation_id,
    direction: "inbound",
    body: customer_message,
    intent: intent_key,
    confidence,
    role: "customer",
  });

  // 5. Decide: escalate or reply?
  const intentThreshold = matchedIntent?.threshold ?? workspace.escalation_threshold;
  const escalationThreshold = workspace.escalation_threshold;

  // Escalate if:
  //   - confidence below workspace threshold
  //   - OR intent has threshold=1.0 (complaint, unknown with forced escalation)
  const shouldEscalate =
    confidence < escalationThreshold || intentThreshold >= 1.0;

  if (shouldEscalate) {
    await updateConversationStatus(conversation_id, "escalated", intent_key);

    // For 'unknown' intent: send a clarification request instead of going silent
    if (intent_key === "unknown" && matchedIntent !== undefined) {
      const clarificationReply = await generateReply({
        systemPrompt: matchedIntent.system_prompt,
        kbContext,
        customerMessage: customer_message,
        history,
        businessName: workspace.business_name,
      });

      if (clarificationReply !== null) {
        const sendResult = await sendTextMessage({
          to: extractPhoneFromHistory(history),
          body: clarificationReply,
        });

        const outbound = await insertMessage({
          conversation_id,
          direction: "outbound",
          body: clarificationReply,
          intent: intent_key,
          confidence,
          role: "ai",
          meta_message_id: sendResult.meta_message_id ?? undefined,
        });

        return {
          replied: true,
          escalated: false,
          intent: intent_key,
          confidence,
          reply_body: clarificationReply,
          meta_message_id: outbound.meta_message_id,
        };
      }
    }

    return {
      replied: false,
      escalated: true,
      intent: intent_key,
      confidence,
      reply_body: null,
      meta_message_id: null,
    };
  }

  // 6. Generate reply
  if (matchedIntent === undefined) {
    return {
      replied: false,
      escalated: false,
      intent: intent_key,
      confidence,
      reply_body: null,
      meta_message_id: null,
    };
  }

  const replyBody = await generateReply({
    systemPrompt: matchedIntent.system_prompt,
    kbContext,
    customerMessage: customer_message,
    history,
    businessName: workspace.business_name,
  });

  if (replyBody === null) {
    return {
      replied: false,
      escalated: false,
      intent: intent_key,
      confidence,
      reply_body: null,
      meta_message_id: null,
    };
  }

  // 7. Send via Meta API
  // We need the customer phone — extract from history or conversation record
  // The webhook caller sets customer phone on the conversation; we pass it through
  // the context via a convention: history items may carry phone in metadata.
  // For MVP: the mock/inbound endpoint passes customer_phone as an extra field.
  // Real webhook hydrates from the Meta payload. We pull it from the DB conversation.
  const { getConversation } = await import("./db");
  const conversation = await getConversation(conversation_id);
  const customerPhone = conversation?.customer_phone ?? "unknown";

  const sendResult = await sendTextMessage({
    to: customerPhone,
    body: replyBody,
  });

  // 8. Persist outbound
  const outboundMsg = await insertMessage({
    conversation_id,
    direction: "outbound",
    body: replyBody,
    intent: intent_key,
    confidence,
    role: "ai",
    meta_message_id: sendResult.meta_message_id ?? undefined,
  });

  // Update conversation intent
  await updateConversationStatus(conversation_id, "active", intent_key);

  return {
    replied: true,
    escalated: false,
    intent: intent_key,
    confidence,
    reply_body: replyBody,
    meta_message_id: outboundMsg.meta_message_id,
  };
}

// ---------------------------------------------------------------------------
// Groq reply generation
// ---------------------------------------------------------------------------

interface GenerateParams {
  systemPrompt: string;
  kbContext: string;
  customerMessage: string;
  history: Array<{ role: string; body: string }>;
  businessName: string;
}

async function generateReply(params: GenerateParams): Promise<string | null> {
  const groqKey = process.env["GROQ_API_KEY"];
  if (!groqKey) {
    console.error("[p02/reply-engine] GROQ_API_KEY not set");
    return null;
  }

  const { systemPrompt, kbContext, customerMessage, history, businessName } = params;

  const systemFull = [
    `You are an AI assistant for ${businessName}, responding via WhatsApp.`,
    systemPrompt,
    kbContext.length > 0 ? `\n${kbContext}` : "",
    "\nIMPORTANT: Keep your response under 1600 characters. Be natural and conversational.",
  ]
    .filter(Boolean)
    .join("\n");

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemFull },
  ];

  // Inject last 6 turns of history
  for (const h of history.slice(-6)) {
    const role: "user" | "assistant" = h.role === "customer" ? "user" : "assistant";
    messages.push({ role, content: h.body });
  }

  messages.push({ role: "user", content: customerMessage });

  try {
    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: MAX_REPLY_TOKENS,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[p02/reply-engine] Groq HTTP ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return content.length > 0 ? content.slice(0, 1600) : null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[p02/reply-engine] Generate error: ${msg}`);
    return null;
  }
}

/** Extract phone from history (fallback only — real code uses DB conversation). */
function extractPhoneFromHistory(
  history: Array<{ role: string; body: string }>
): string {
  // This is a fallback. Real phone comes from the DB conversation record.
  return "unknown";
}
