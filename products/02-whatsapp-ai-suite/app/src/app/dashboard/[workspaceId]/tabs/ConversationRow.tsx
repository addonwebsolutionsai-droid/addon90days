"use client";

/**
 * ConversationRow + ConversationDrawer — client component.
 *
 * Row is clickable. Clicking opens the drawer which fetches message history.
 * Take-over and human-send are handled inside the drawer.
 */

import { useState, useEffect, useRef } from "react";
import type { P02Conversation, P02Message } from "@/lib/p02/types";
import { X, Bot, User, UserCheck, Send, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// Phone masking: +91 98765 43210 → +91 XXXX X3210
// ---------------------------------------------------------------------------
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  const last4 = digits.slice(-4);
  const prefix = digits.slice(0, 2); // country code digits
  return `+${prefix} XXXX X${last4}`;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: P02Conversation["status"] }) {
  const styles = {
    active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    escalated: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    closed: { color: "var(--text-muted)", bg: "var(--bg-s2)" },
  };
  const s = styles[status];
  return (
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Intent badge
// ---------------------------------------------------------------------------
function IntentBadge({ intent }: { intent: string | null }) {
  if (!intent) return <span style={{ color: "var(--text-muted)" }} className="text-xs">—</span>;
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
      style={{
        color: "#06b6d4",
        borderColor: "rgba(6,182,212,0.3)",
        backgroundColor: "rgba(6,182,212,0.06)",
      }}
    >
      {intent}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ msg }: { msg: P02Message }) {
  const isCustomer = msg.role === "customer";
  const isAi = msg.role === "ai";
  const isHuman = msg.role === "human";

  const bubbleStyle = isCustomer
    ? { backgroundColor: "rgba(34,197,94,0.12)", color: "var(--text-primary)" }
    : isAi
    ? { backgroundColor: "var(--bg-s2)", color: "var(--text-secondary)" }
    : { backgroundColor: "rgba(6,182,212,0.1)", color: "var(--text-primary)" };

  return (
    <div className="flex flex-col gap-1 max-w-[80%]">
      {/* Role label */}
      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
        {isCustomer && <User size={10} />}
        {isAi && <Bot size={10} />}
        {isHuman && <UserCheck size={10} />}
        <span className="capitalize">{msg.role}</span>
        {isAi && msg.confidence !== null && (
          <span
            className="px-1 py-0.5 rounded text-[9px] font-mono"
            style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }}
          >
            {msg.confidence.toFixed(2)}
          </span>
        )}
        <span className="ml-0.5">
          {new Date(msg.created_at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div
        className="px-3 py-2 rounded-xl text-sm leading-relaxed"
        style={bubbleStyle}
      >
        {msg.body}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation Drawer
// ---------------------------------------------------------------------------
interface DrawerProps {
  conversation: P02Conversation;
  onClose: () => void;
}

function ConversationDrawer({ conversation, onClose }: DrawerProps) {
  const [messages, setMessages] = useState<P02Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(conversation.status);
  const [sendBody, setSendBody] = useState("");
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/conversations/${conversation.id}/messages`);
        if (!res.ok) throw new Error("Failed to load messages");
        const data = (await res.json()) as { data: P02Message[] };
        if (!cancelled) setMessages(data.data);
      } catch {
        if (!cancelled) setError("Could not load messages. Try closing and reopening.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [conversation.id]);

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleTakeOver() {
    setTakingOver(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/take-over`, {
        method: "POST",
      });
      if (res.ok) setStatus("escalated");
    } finally {
      setTakingOver(false);
    }
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = sendBody.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const data = (await res.json()) as { data: P02Message };
        setMessages((prev) => [...prev, data.data]);
        setSendBody("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col border-l"
        style={{
          backgroundColor: "var(--bg-base)",
          borderColor: "var(--border-subtle)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Conversation with ${maskPhone(conversation.customer_phone)}`}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <div className="font-semibold text-sm">{maskPhone(conversation.customer_phone)}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={status} />
              {conversation.last_intent && <IntentBadge intent={conversation.last_intent} />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            aria-label="Close conversation"
          >
            <X size={15} />
          </button>
        </div>

        {/* Take-over sticky bar (shows when not yet escalated) */}
        {status === "active" && (
          <div
            className="px-4 py-2.5 border-b flex items-center justify-between gap-3 shrink-0"
            style={{
              backgroundColor: "rgba(245,158,11,0.06)",
              borderColor: "rgba(245,158,11,0.2)",
            }}
          >
            <div className="flex items-center gap-2 text-xs" style={{ color: "#f59e0b" }}>
              <AlertTriangle size={12} />
              AI is handling this conversation
            </div>
            <button
              onClick={handleTakeOver}
              disabled={takingOver}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
              style={{
                backgroundColor: "rgba(245,158,11,0.15)",
                color: "#f59e0b",
              }}
            >
              {takingOver ? "Taking over..." : "Take over"}
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {loading && (
            <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              Loading messages...
            </div>
          )}
          {error && (
            <div className="text-center py-10 text-sm text-red-400" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && messages.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No messages yet.
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Human send composer — only active when escalated */}
        {status === "escalated" && (
          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 px-4 py-3 border-t shrink-0"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <textarea
              value={sendBody}
              onChange={(e) => setSendBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
              disabled={sending}
              maxLength={1600}
              rows={2}
              className="flex-1 px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
              style={{
                backgroundColor: "var(--bg-s2)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              aria-label="Reply message"
            />
            <button
              type="submit"
              disabled={sending || !sendBody.trim()}
              className="p-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </form>
        )}

        {status === "closed" && (
          <div
            className="px-4 py-3 border-t text-center text-xs shrink-0"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            This conversation is closed.
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ConversationRow
// ---------------------------------------------------------------------------
interface RowProps {
  conversation: P02Conversation;
  workspaceId: string;
}

export function ConversationRow({ conversation }: RowProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="w-full grid grid-cols-[1fr_auto_auto_auto_2fr_auto] gap-3 items-center px-4 py-3 rounded-lg border text-left transition-all hover:border-green-500/30"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Customer phone */}
        <span className="text-sm font-medium truncate">
          {maskPhone(conversation.customer_phone)}
        </span>

        {/* Intent */}
        <IntentBadge intent={conversation.last_intent} />

        {/* Status */}
        <StatusBadge status={conversation.status} />

        {/* Message count placeholder — not in the conversation type, show dash */}
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          —
        </span>

        {/* Last message preview placeholder */}
        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          Click to view messages
        </span>

        {/* Timestamp */}
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
          {new Date(conversation.updated_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </button>

      {drawerOpen && (
        <ConversationDrawer
          conversation={conversation}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
