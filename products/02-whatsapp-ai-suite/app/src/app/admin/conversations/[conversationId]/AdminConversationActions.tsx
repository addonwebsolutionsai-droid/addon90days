"use client";

/**
 * AdminConversationActions — client island that wraps the take-over /
 * close / send-reply buttons for the admin conversation detail page.
 *
 * Posts to /api/admin/conversations/{id}/{action}. After a
 * successful action, calls router.refresh() so the server-rendered
 * message list re-renders with the new row.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, UserRoundCheck, Lock, Loader2 } from "lucide-react";

interface Props {
  conversationId: string;
  status:         string;
}

export function AdminConversationActions({ conversationId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy]       = useState<"send" | "take-over" | "close" | null>(null);
  const [body, setBody]       = useState("");
  const [error, setError]     = useState<string | null>(null);

  async function action(kind: "take-over" | "close") {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/${kind}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    if (body.trim().length === 0) return;
    setBusy("send");
    setError(null);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/send`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      setBody("");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Status actions */}
      <div className="flex flex-wrap gap-2">
        {status !== "escalated" && (
          <button
            type="button"
            onClick={() => action("take-over")}
            disabled={busy !== null || isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
            style={{ backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.35)", color: "#fbbf24" }}
          >
            {busy === "take-over" ? <Loader2 size={12} className="animate-spin" /> : <UserRoundCheck size={12} />}
            Take over
          </button>
        )}
        {status !== "closed" && (
          <button
            type="button"
            onClick={() => action("close")}
            disabled={busy !== null || isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            {busy === "close" ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
            Close conversation
          </button>
        )}
      </div>

      {/* Manual reply input */}
      <div className="rounded-xl border p-3" style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}>
        <label className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 block" style={{ color: "var(--text-muted)" }}>
          Send manual reply (as &quot;human&quot;)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a reply to send via WhatsApp…"
          rows={3}
          maxLength={1600}
          className="w-full bg-transparent text-sm focus:outline-none resize-none"
          style={{ color: "var(--text-primary)" }}
          disabled={busy !== null}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {body.length}/1600 chars
          </span>
          <button
            type="button"
            onClick={send}
            disabled={busy !== null || isPending || body.trim().length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {busy === "send" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Send
          </button>
        </div>
      </div>

      {error !== null && (
        <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p>
      )}
    </div>
  );
}
