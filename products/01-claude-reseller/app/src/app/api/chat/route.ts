/**
 * POST /api/chat
 *
 * Streaming chat endpoint backed by Gemini 2.5 Flash. Used by the
 * floating support widget. Returns Server-Sent-Event style chunks
 * (one JSON line per chunk).
 *
 * Request body:
 *   { messages: [{ role: "user"|"assistant", content: string }, ...] }
 *
 * Response (text/plain stream):
 *   {"delta": "..."}
 *   {"delta": "..."}
 *   ...
 *   {"done": true, "escalated": boolean}
 */

import type { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "@/lib/chat-knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY        = 24;        // last 24 turns; older trimmed
const MAX_REPLY_TOKENS   = 800;       // ~600 words max
const MAX_USER_MSG_CHARS = 4000;
// Gemini free-tier daily quotas (per Google docs, Apr 2026):
//   2.5 Flash:      250 RPD   ← exhausted in normal use, do not pick
//   2.0 Flash:    1,500 RPD   ← chosen — 6× headroom for support chat
//   2.5 Flash-Lite: 1,000 RPD
// If you upgrade to a paid plan later, switch back to 2.5 Flash.
const MODEL              = "gemini-2.0-flash";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/**
 * Convert our chat history to Gemini's required shape, enforcing:
 *   - first turn is "user"
 *   - strict user/model/user/model alternation (consecutive same-role
 *     turns are merged with a blank line between them)
 *   - all turns have non-empty content
 *
 * The widget injects a synthetic greeting as the first assistant message
 * — this drops it cleanly because the loop only starts once a user turn
 * is seen.
 */
function sanitizeHistoryForGemini(messages: ChatMessage[]): GeminiContent[] {
  const result: GeminiContent[] = [];
  let started = false;
  for (const m of messages) {
    const text = (m.content ?? "").trim();
    if (text.length === 0) continue;
    const geminiRole: "user" | "model" = m.role === "assistant" ? "model" : "user";
    // Don't start with a model turn — drop until we see the first user.
    if (!started) {
      if (geminiRole !== "user") continue;
      started = true;
    }
    const last = result[result.length - 1];
    if (last && last.role === geminiRole) {
      // Merge consecutive same-role turns (Gemini rejects them).
      last.parts[0]!.text = `${last.parts[0]!.text}\n\n${text}`;
    } else {
      result.push({ role: geminiRole, parts: [{ text }] });
    }
  }
  // History must END with a model turn — sendMessage(userText) appends a
  // user turn next, so a trailing user turn would create two-user-in-a-row.
  // (Common case: previous attempt failed mid-reply, so history ends with
  // the user's retry.)
  while (result.length > 0 && result[result.length - 1]!.role === "user") {
    result.pop();
  }
  return result;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Body must be an object" }, { status: 400 });
  }
  const incoming = (body as { messages?: unknown }).messages;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return Response.json({ error: "messages must be a non-empty array" }, { status: 400 });
  }

  // Validate + sanitize
  const messages: ChatMessage[] = [];
  for (const m of incoming.slice(-MAX_HISTORY)) {
    if (!m || typeof m !== "object") continue;
    const mm = m as { role?: unknown; content?: unknown };
    if ((mm.role !== "user" && mm.role !== "assistant") || typeof mm.content !== "string") continue;
    if (mm.content.length === 0) continue;
    messages.push({
      role:    mm.role,
      content: mm.content.slice(0, MAX_USER_MSG_CHARS),
    });
  }
  if (messages.length === 0) return Response.json({ error: "No valid messages" }, { status: 400 });
  if (messages[messages.length - 1]!.role !== "user") {
    return Response.json({ error: "Last message must be from user" }, { status: 400 });
  }

  // Build Gemini chat history. Three Gemini constraints we must satisfy:
  //   1. History must START with a user turn (the bot's synthetic greeting
  //      is an assistant message — it MUST be dropped from history).
  //   2. Roles must strictly alternate user/model/user/model — consecutive
  //      same-role turns must be merged or dropped.
  //   3. Content must be non-empty.
  //
  // Sending raw history (without sanitisation) caused "model init failed"
  // for the customer who tried "How can I create Algo Trading System Scaffold"
  // because the widget's greeting was the first item.
  const lastUserMessage = messages[messages.length - 1]!.content;
  const history = sanitizeHistoryForGemini(messages.slice(0, -1));

  // Build everything that can fail before the stream starts INSIDE a try/catch.
  // If anything goes wrong (Supabase slow, cold start, key issue), we return
  // a graceful streamed error to the client instead of a bare HTTP 500 — the
  // widget knows how to render this as a friendly fallback.
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const sendError = (errMsg: string) => {
        try {
          controller.enqueue(enc.encode(JSON.stringify({
            delta: `Sorry — I had trouble fetching that just now (${errMsg}). Please try again, or click "Talk to founder" to forward your question directly.`,
          }) + "\n"));
          controller.enqueue(enc.encode(JSON.stringify({ done: true, escalated: false }) + "\n"));
        } catch { /* controller may already be closed */ }
      };

      let systemInstruction: string;
      try { systemInstruction = await buildSystemPrompt(); }
      catch (err) {
        sendError("knowledge base load failed");
        controller.close();
        // Fire-and-forget escalation so we know about systemic failures
        void escalateToTelegram(messages, `[SYSTEM ERROR — buildSystemPrompt failed] ${String(err)}`).catch(() => undefined);
        return;
      }

      // Gemini's streaming endpoint occasionally fails with transient
      // network errors (~20% of the time observed in production).
      // Retry up to MAX_RETRIES times before giving up. Each retry
      // creates a fresh chat session — same systemInstruction + history.
      const MAX_RETRIES = 2;
      let fullText = "";
      let succeeded = false;
      let lastError: unknown = null;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction,
        generationConfig: {
          temperature:     0.5,
          maxOutputTokens: MAX_REPLY_TOKENS,
        },
      });

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 200 * 3 ** (attempt - 1)));
        }
        fullText = "";
        try {
          const chat   = model.startChat({ history });
          const result = await chat.sendMessageStream(lastUserMessage);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullText += text;
              controller.enqueue(enc.encode(JSON.stringify({ delta: text }) + "\n"));
            }
          }
          succeeded = true;
          break;
        } catch (err) {
          lastError = err;
          // 429 = rate limit. Retrying just burns more quota; bail
          // immediately so the user gets a useful "try again soon" message.
          const errMsg = err instanceof Error ? err.message : String(err);
          if (/\b429\b|Too Many Requests|exceeded your current quota/i.test(errMsg)) break;
          // If partial text was already streamed, don't retry — would dupe content.
          if (fullText.length > 0) break;
        }
      }

      if (succeeded) {
        const escalated = /\[ESCALATE\]/.test(fullText);
        if (escalated) {
          void escalateToTelegram(messages, fullText).catch(() => undefined);
        }
        controller.enqueue(enc.encode(JSON.stringify({ done: true, escalated }) + "\n"));
      } else if (fullText.length > 0) {
        // Stream errored mid-reply on a non-first attempt
        controller.enqueue(enc.encode(JSON.stringify({ done: true, escalated: false, partial: true }) + "\n"));
      } else {
        // All retries failed — surface friendly error + escalate to founder
        const msg = lastError instanceof Error ? lastError.message : String(lastError);
        const isRateLimit = /\b429\b|Too Many Requests|exceeded your current quota/i.test(msg);
        const userMessage = isRateLimit
          ? "We're at our daily AI quota — please try again tomorrow, or click \"Talk to founder\" below to forward your question now."
          : "Gemini API is having a moment — please retry in a few seconds";
        sendError(userMessage);
        void escalateToTelegram(messages, `[STREAM ERROR${isRateLimit ? " — RATE LIMITED" : ""} after ${MAX_RETRIES + 1} attempts] ${msg.slice(0, 300)}`).catch(() => undefined);
      }
      try { controller.close(); } catch { /* may already be closed */ }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type":   "application/x-ndjson; charset=utf-8",
      "Cache-Control":  "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

// ---------------------------------------------------------------------------
// Telegram escalation
// ---------------------------------------------------------------------------

async function escalateToTelegram(messages: ChatMessage[], finalReply: string): Promise<void> {
  const token  = process.env["TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["TELEGRAM_CHAT_ID"];
  if (!token || !chatId) return;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content.slice(0, 600)}`)
    .join("\n\n");

  // Two flavours of escalation:
  //   1. Bot decided to escalate — finalReply contains "[ESCALATE] <summary>"
  //   2. System error — finalReply starts with "[SYSTEM ERROR" or "[STREAM ERROR"
  // Surface both clearly so the founder sees what actually happened.
  let header = "🚨 *Support escalation*";
  let note   = "";
  if (finalReply.startsWith("[SYSTEM ERROR") || finalReply.startsWith("[STREAM ERROR")) {
    header = "⚠️ *Chat system error — auto-escalated*";
    note   = `\n\n_Error: ${finalReply.slice(0, 400)}_`;
  } else {
    const m = /\[ESCALATE\][\s\S]*$/.exec(finalReply);
    if (m) note = `\n\n_Bot summary: ${m[0].replace("[ESCALATE]", "").trim().slice(0, 300)}_`;
  }

  const text = `${header}${note}\n\n*Last ${messages.length} messages:*\n\n${transcript.slice(0, 3500)}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({ chat_id: chatId, parse_mode: "Markdown", text }).toString(),
  }).catch(() => undefined);
}
