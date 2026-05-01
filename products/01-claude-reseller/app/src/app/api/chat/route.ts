/**
 * POST /api/chat
 *
 * Streaming chat endpoint backed by Groq (Llama 3.3 70B Versatile).
 * Used by the floating support widget. Returns ndjson chunks.
 *
 * Why Groq: 14,400 RPD on the free tier (10× Gemini), no card required,
 * fastest inference of any major provider, OpenAI-compatible API so we
 * can swap providers later (OpenAI / OpenRouter / Together) by just
 * changing the URL + key.
 *
 * Request body:
 *   { messages: [{ role: "user"|"assistant", content: string }, ...] }
 *
 * Response (text/x-ndjson stream):
 *   {"delta": "..."}
 *   {"delta": "..."}
 *   ...
 *   {"done": true, "escalated": boolean}
 */

import type { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/chat-knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY        = 24;
const MAX_REPLY_TOKENS   = 800;
const MAX_USER_MSG_CHARS = 4000;
const MAX_RETRIES        = 2;

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
// Groq free-tier limits (Apr 2026):
//   llama-3.3-70b-versatile : 30 RPM, 14,400 RPD ← chosen, best quality/quota
//   llama-3.1-8b-instant    : 30 RPM, 14,400 RPD, faster but worse
//   mixtral-8x7b-32768      : 30 RPM, 14,400 RPD, good for long context
const MODEL = "llama-3.3-70b-versatile";

interface ChatMessage {
  role:    "user" | "assistant";
  content: string;
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
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    return Response.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
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

  // Validate + sanitize incoming messages
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

      // ---- Build system prompt + OpenAI-shape messages ----
      let systemPrompt: string;
      try { systemPrompt = await buildSystemPrompt(); }
      catch (err) {
        sendError("knowledge base load failed");
        controller.close();
        void escalateToTelegram(messages, `[SYSTEM ERROR — buildSystemPrompt failed] ${String(err)}`).catch(() => undefined);
        return;
      }

      const groqMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      // ---- Retry loop ----
      let fullText = "";
      let succeeded = false;
      let lastError: unknown = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 200 * 3 ** (attempt - 1)));
        }
        fullText = "";
        try {
          const groqRes = await fetch(GROQ_API, {
            method:  "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type":  "application/json",
            },
            body: JSON.stringify({
              model:       MODEL,
              messages:    groqMessages,
              stream:      true,
              max_tokens:  MAX_REPLY_TOKENS,
              temperature: 0.5,
            }),
          });

          if (!groqRes.ok || groqRes.body === null) {
            const text = await groqRes.text().catch(() => "");
            throw new Error(`Groq HTTP ${groqRes.status} ${groqRes.statusText} — ${text.slice(0, 300)}`);
          }

          const reader = groqRes.body.getReader();
          const dec    = new TextDecoder();
          let buf      = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            // SSE: lines separated by \n, each event prefixed with "data: "
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (payload === "" || payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  controller.enqueue(enc.encode(JSON.stringify({ delta }) + "\n"));
                }
              } catch { /* skip malformed SSE chunk */ }
            }
          }
          succeeded = true;
          break;
        } catch (err) {
          lastError = err;
          const errMsg = err instanceof Error ? err.message : String(err);
          // 429 = rate limit. Retrying just burns more quota; bail out.
          if (/\b429\b|Too Many Requests|rate.?limit/i.test(errMsg)) break;
          // If we already streamed any text, don't retry — would dupe content.
          if (fullText.length > 0) break;
        }
      }

      // ---- Final state ----
      if (succeeded) {
        const escalated = /\[ESCALATE\]/.test(fullText);
        if (escalated) {
          void escalateToTelegram(messages, fullText).catch(() => undefined);
        }
        controller.enqueue(enc.encode(JSON.stringify({ done: true, escalated }) + "\n"));
      } else if (fullText.length > 0) {
        controller.enqueue(enc.encode(JSON.stringify({ done: true, escalated: false, partial: true }) + "\n"));
      } else {
        const msg = lastError instanceof Error ? lastError.message : String(lastError);
        const isRateLimit = /\b429\b|Too Many Requests|rate.?limit/i.test(msg);
        const userMessage = isRateLimit
          ? "We're being rate-limited briefly — try again in 30 seconds, or click \"Talk to founder\" below."
          : "Couldn't reach the AI service right now. Try again, or click \"Talk to founder\" below.";
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
      "Content-Type":      "application/x-ndjson; charset=utf-8",
      "Cache-Control":     "no-store",
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
