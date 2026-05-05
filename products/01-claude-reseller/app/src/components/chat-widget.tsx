"use client";

/**
 * ChatWidget — floating support bubble, bottom-right, every page.
 *
 * Behavior:
 *   - Idle: round violet bubble with chat icon. Click to expand.
 *   - Open: 380×600 chat panel; localStorage-backed history; streaming
 *     replies from /api/chat (Gemini 2.5 Flash).
 *   - Auto-greet on first ever open.
 *   - "Talk to founder" button forces escalation any time.
 *   - When the bot decides to escalate, panel shows a confirmation that
 *     the founder has been pinged on Telegram.
 *   - Close button collapses; messages persist via localStorage.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, AlertCircle, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role:        "user" | "assistant";
  content:     string;
  escalated?:  boolean;
}

const STORAGE_KEY  = "addonweb-chat-history-v1";
const MAX_PERSIST  = 30;

const GREETING: ChatMessage = {
  role:    "assistant",
  content: "Hi — SKILON support here. I can help with installing skills, fixing Claude Desktop config, or anything else about the marketplace. What's up?",
};

export function ChatWidget() {
  const [open, setOpen]                 = useState(false);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [input, setInput]               = useState("");
  const [sending, setSending]           = useState(false);
  const [streamingReply, setStreaming]  = useState("");
  const [hasGreeted, setHasGreeted]     = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  // Load history once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_PERSIST));
        if (parsed && parsed.length > 0) setHasGreeted(true);
      }
    } catch {
      // bad json — clear and continue
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist history (debounced via state change)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length === 0) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_PERSIST)));
    } catch { /* quota; ignore */ }
  }, [messages]);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingReply]);

  // Greet on first open
  useEffect(() => {
    if (!open) return;
    if (hasGreeted) return;
    if (messages.length > 0) { setHasGreeted(true); return; }
    setMessages([GREETING]);
    setHasGreeted(true);
  }, [open, hasGreeted, messages.length]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string, forceEscalate: boolean = false) => {
    if (text.trim().length === 0 || sending) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    const baseMessages = [...messages, userMsg];
    setMessages(baseMessages);
    setInput("");
    setSending(true);
    setStreaming("");

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const apiMessages = baseMessages.map((m) => ({ role: m.role, content: m.content }));
      if (forceEscalate) {
        // Hint to the model — it's allowed to escalate anyway, this nudges it.
        apiMessages.push({ role: "user", content: "[user requested human handoff — please escalate]" });
      }

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: apiMessages }),
        signal:  ac.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf      = "";
      let assembled = "";
      let escalated = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as { delta?: string; done?: boolean; escalated?: boolean; error?: string };
            if (event.error) throw new Error(event.error);
            if (event.delta) {
              assembled += event.delta;
              setStreaming(assembled);
            }
            if (event.done) escalated = !!event.escalated;
          } catch { /* skip bad chunk */ }
        }
      }

      const cleanReply = assembled.replace(/\[ESCALATE\][\s\S]*$/, "").trim() || "(no response)";
      setMessages((prev) => [...prev, { role: "assistant", content: cleanReply, escalated }]);
      setStreaming("");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const isHttpError = err instanceof Error && /^HTTP \d+/.test(err.message);
      const friendly = isHttpError
        ? "Network blip — the server didn't respond. This is usually transient (deploy or cold start). Try sending again in 5 seconds."
        : "Couldn't reach the support service right now. Try again, or click \"Talk to founder\" below — I'll forward your question directly.";
      setMessages((prev) => [...prev, {
        role:    "assistant",
        content: friendly,
      }]);
      setStreaming("");
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }, [messages, sending]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleEscalate() {
    if (sending) return;
    const text = input.trim().length > 0 ? input : "I need to talk to a human about this.";
    void sendMessage(text, true);
  }

  function handleClear() {
    setMessages([]);
    setHasGreeted(false);
    setStreaming("");
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className={cn(
          "fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center",
          "shadow-lg transition-all duration-200",
          "bg-violet-600 hover:bg-violet-500 text-white",
          open ? "scale-90" : "hover:scale-105"
        )}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Support chat"
          className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(600px,calc(100vh-8rem))] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
          style={{
            backgroundColor: "var(--bg-base)",
            borderColor:     "var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center">
                <Sparkles size={14} className="text-violet-400" />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SKILON Support</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  AI assistant · 24/7 · escalates to founder when needed
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear conversation"
                  className="text-[10px] px-2 py-1 rounded transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
              >
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ backgroundColor: "var(--bg-base)" }}
          >
            {messages.map((m, i) => (
              <MessageRow
                key={i}
                role={m.role}
                content={m.content}
                escalated={m.escalated}
              />
            ))}
            {sending && streamingReply && (
              <MessageRow role="assistant" content={streamingReply} streaming />
            )}
            {sending && !streamingReply && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border w-fit"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t px-3 py-3"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about SKILON…"
                disabled={sending}
                className="flex-1 h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                style={{
                  backgroundColor: "var(--bg-base)",
                  borderColor:     "var(--border)",
                  color:           "var(--text-primary)",
                }}
              />
              <button
                type="submit"
                disabled={sending || input.trim().length === 0}
                aria-label="Send"
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                  sending || input.trim().length === 0
                    ? "bg-violet-600/40 text-violet-300/40 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                )}
              >
                <Send size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleEscalate}
                disabled={sending}
                className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-violet-400 disabled:opacity-40"
                style={{ color: "var(--text-muted)" }}
              >
                <Headphones size={11} />
                Talk to founder
              </button>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Powered by Gemini
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Single message row
// ---------------------------------------------------------------------------

function MessageRow({ role, content, escalated, streaming }: { role: "user" | "assistant"; content: string; escalated?: boolean; streaming?: boolean }) {
  const isUser = role === "user";
  // Strip [ESCALATE] tokens from displayed content
  const displayContent = content.replace(/\[ESCALATE\][\s\S]*$/, "").trim();

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-violet-600 text-white rounded-br-md"
            : "border rounded-bl-md"
        )}
        style={isUser ? {} : {
          backgroundColor: "var(--bg-surface)",
          borderColor:     "var(--border-subtle)",
          color:           "var(--text-primary)",
        }}
      >
        {displayContent || (streaming ? "…" : "")}
      </div>
      {escalated && !isUser && (
        <div className="flex items-center gap-1.5 text-[10px] mt-0.5 px-1" style={{ color: "var(--text-muted)" }}>
          <AlertCircle size={10} className="text-orange-400" />
          Founder pinged on Telegram — they&apos;ll follow up.
        </div>
      )}
    </div>
  );
}
