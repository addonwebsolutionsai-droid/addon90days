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

const MAX_HISTORY        = 24;       // last 24 turns; older trimmed
const MAX_REPLY_TOKENS   = 800;      // ~600 words max
const MAX_USER_MSG_CHARS = 4000;
const MODEL              = "gemini-2.5-flash";

interface ChatMessage {
  role: "user" | "assistant";
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

  // Build Gemini chat history. Gemini uses { role: "user"|"model", parts: [{ text }] }
  const history = messages.slice(0, -1).map((m) => ({
    role:  m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastUserMessage = messages[messages.length - 1]!.content;

  const systemInstruction = await buildSystemPrompt();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction,
    generationConfig: {
      temperature:     0.5,
      maxOutputTokens: MAX_REPLY_TOKENS,
    },
  });

  const chat = model.startChat({ history });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let fullText = "";
      try {
        const result = await chat.sendMessageStream(lastUserMessage);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullText += text;
            controller.enqueue(enc.encode(JSON.stringify({ delta: text }) + "\n"));
          }
        }
        const escalated = /\[ESCALATE\]/.test(fullText);
        if (escalated) {
          // Fire-and-forget Telegram escalation — never block the user.
          void escalateToTelegram(messages, fullText).catch(() => undefined);
        }
        controller.enqueue(enc.encode(JSON.stringify({ done: true, escalated }) + "\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(enc.encode(JSON.stringify({ error: msg, done: true }) + "\n"));
      } finally {
        controller.close();
      }
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

  const escalateNote = (finalReply.split("[ESCALATE]")[1] ?? "").trim().slice(0, 300);

  const text =
    `🚨 *Support escalation*\n\n` +
    (escalateNote ? `_Bot summary: ${escalateNote}_\n\n` : "") +
    `*Last ${messages.length} messages:*\n\n${transcript.slice(0, 3500)}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({ chat_id: chatId, parse_mode: "Markdown", text }).toString(),
  }).catch(() => undefined);
}
