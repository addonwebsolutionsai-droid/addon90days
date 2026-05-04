"use client";

/**
 * MockChat — the founder's primary demo tool.
 *
 * Simulates a customer WhatsApp message by POSTing to /api/p02/mock/inbound.
 * The reply engine runs synchronously before the route returns 200, so the
 * AI reply (or escalation note) is available directly in the response body.
 * No polling needed.
 *
 * Uses a fixed test phone number (+919999000001) to keep mock conversations
 * consistent across demo sessions.
 */

import { useState, useRef } from "react";
import { Send, Bot, User, RefreshCw } from "lucide-react";

interface Props {
  workspaceId: string;
}

interface ChatMessage {
  id: string;
  role: "customer" | "ai" | "human";
  body: string;
  confidence: number | null;
  created_at: string;
}

const TEST_PHONE = "+919999000001";
const TEST_NAME = "Test Customer";

// Shape returned by /api/p02/mock/inbound
interface MockInboundResult {
  conversation_id: string;
  customer_phone: string;
  message_processed: boolean;
  intent: string;
  confidence: number;
  replied: boolean;
  escalated: boolean;
  reply_body: string | null;
  meta_message_id: string | null;
  mock: boolean;
}

export function MockChat({ workspaceId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "waiting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;

    setSending(true);
    setStatus("waiting");
    setErrorMsg("");

    // Optimistically add the customer message
    const customerMsg: ChatMessage = {
      id: `customer-${Date.now()}`,
      role: "customer",
      body,
      confidence: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, customerMsg]);
    setInput("");

    try {
      const res = await fetch("/api/p02/mock/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          customer_phone: TEST_PHONE,
          body,
          customer_name: TEST_NAME,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setStatus("error");
        setErrorMsg(data.error?.message ?? "Mock inbound request failed.");
        setSending(false);
        return;
      }

      const data = (await res.json()) as { data: MockInboundResult };
      const result = data.data;
      setConversationId(result.conversation_id);

      // The reply engine runs synchronously in the route handler.
      // reply_body is populated if confidence >= threshold; null if escalated.
      if (result.reply_body !== null) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          body: result.reply_body,
          confidence: result.confidence,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (result.escalated) {
        const noteMsg: ChatMessage = {
          id: `note-${Date.now()}`,
          role: "ai",
          body: `[Escalated to human — confidence ${result.confidence.toFixed(2)} below threshold. Check your inbox.]`,
          confidence: result.confidence,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, noteMsg]);
      } else {
        // Processed but no reply (e.g. unknown error in reply engine)
        const noteMsg: ChatMessage = {
          id: `note-${Date.now()}`,
          role: "ai",
          body: "[No reply generated. Check GROQ_API_KEY and migration status.]",
          confidence: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, noteMsg]);
      }

      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  function handleReset() {
    setMessages([]);
    setConversationId(null);
    setStatus("idle");
    setErrorMsg("");
    setInput("");
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Widget header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22c55e, #06b6d4)" }}
          >
            <Bot size={12} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold">MockChat — {TEST_NAME}</div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {TEST_PHONE} &middot; Mock mode
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
            style={{ color: "var(--text-muted)" }}
            title="Reset conversation"
          >
            <RefreshCw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Message area */}
      <div className="h-64 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 && (
          <div
            className="flex items-center justify-center h-full text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Type a message below to test the AI bot.
          </div>
        )}

        {messages.map((msg) => {
          const isCustomer = msg.role === "customer";
          const isAi = msg.role === "ai";

          return (
            <div key={msg.id} className="flex flex-col gap-1 max-w-[85%]">
              <div
                className="flex items-center gap-1 text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {isCustomer ? <User size={9} /> : <Bot size={9} />}
                <span className="capitalize">{msg.role}</span>
                {isAi && msg.confidence !== null && (
                  <span
                    className="px-1 py-0.5 rounded text-[9px] font-mono"
                    style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }}
                  >
                    {msg.confidence.toFixed(2)} confidence
                  </span>
                )}
              </div>
              <div
                className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                style={
                  isCustomer
                    ? { backgroundColor: "rgba(34,197,94,0.12)", color: "var(--text-primary)" }
                    : { backgroundColor: "var(--bg-base)", color: "var(--text-secondary)" }
                }
              >
                {msg.body}
              </div>
            </div>
          );
        })}

        {status === "waiting" && (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--text-muted)" }}
            role="status"
            aria-live="polite"
          >
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#22c55e",
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </span>
            AI is thinking...
          </div>
        )}

        {status === "error" && (
          <div className="text-xs text-red-400" role="alert">
            {errorMsg}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 px-4 py-3 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a customer message..."
          disabled={sending || status === "waiting"}
          maxLength={4096}
          className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 transition-colors"
          style={{
            backgroundColor: "var(--bg-base)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          aria-label="Customer test message"
        />
        <button
          type="submit"
          disabled={sending || status === "waiting" || !input.trim()}
          className="p-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors shrink-0"
          aria-label="Send test message"
        >
          <Send size={14} />
        </button>
      </form>

      {conversationId !== null && (
        <div
          className="px-4 py-2 border-t text-[10px]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          Conversation ID: {conversationId} &middot;
          <a
            href={`?tab=conversations`}
            className="ml-1 text-green-400 hover:text-green-300 transition-colors"
          >
            View in Conversations tab
          </a>
        </div>
      )}
    </div>
  );
}
