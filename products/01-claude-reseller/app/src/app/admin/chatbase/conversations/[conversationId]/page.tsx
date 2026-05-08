/**
 * /admin/chatbase/conversations/[conversationId]
 *
 * Full conversation transcript with all messages + admin actions
 * (take over, close, send manual reply).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AdminConversationActions } from "./AdminConversationActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02(table: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(table);
}

interface ConvRow {
  id: string; workspace_id: string; customer_phone: string; customer_name: string | null;
  status: string; last_intent: string | null; created_at: string; updated_at: string;
}
interface MsgRow {
  id: string; direction: string; role: string; intent: string | null;
  confidence: string | number | null; body: string; meta_message_id: string | null;
  created_at: string;
}
interface WorkspaceRow {
  id: string; business_name: string; whatsapp_phone_number_id: string | null;
  mock_mode: boolean; escalation_threshold: number | string;
}

export default async function ConversationAdminDetail(ctx: RouteContext) {
  const { conversationId } = await ctx.params;

  const convRes = await p02("p02_conversations").select("*").eq("id", conversationId).maybeSingle();
  const conversation = convRes.data as ConvRow | null;
  if (conversation === null) notFound();

  const [wsRes, msgRes] = await Promise.all([
    p02("p02_workspaces")
      .select("id, business_name, whatsapp_phone_number_id, mock_mode, escalation_threshold")
      .eq("id", conversation.workspace_id)
      .maybeSingle(),
    p02("p02_messages")
      .select("id, direction, role, intent, confidence, body, meta_message_id, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(500),
  ]);

  const workspace = wsRes.data as WorkspaceRow | null;
  const messages  = (msgRes.data ?? []) as MsgRow[];

  return (
    <div className="space-y-5">
      <Link
        href={workspace !== null ? `/admin/chatbase/workspaces/${workspace.id}` : "/admin/chatbase"}
        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} />
        {workspace !== null ? `Back to ${workspace.business_name}` : "Back to ChatBase admin"}
      </Link>

      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            Conversation
          </p>
          <h1 className="text-2xl font-bold font-mono">{conversation.customer_phone}</h1>
          {conversation.customer_name !== null && (
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{conversation.customer_name}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>workspace: {workspace?.business_name ?? "(unknown)"}</span>
            <span>·</span>
            <span>created: {new Date(conversation.created_at).toISOString().slice(0, 19).replace("T", " ")}</span>
          </div>
        </div>
        <StatusPill status={conversation.status} />
      </header>

      {/* Actions */}
      <section
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          Admin actions
        </h2>
        <AdminConversationActions conversationId={conversation.id} status={conversation.status} />
      </section>

      {/* Transcript */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <header
          className="px-4 py-3 border-b flex items-baseline justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold">Transcript</h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {messages.length} messages · oldest first
          </p>
        </header>
        <div className="p-4 space-y-2 max-h-[640px] overflow-y-auto subtle-scrollbar">
          {messages.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
              No messages yet.
            </p>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} msg={m} />)
          )}
        </div>
      </section>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function StatusPill({ status }: { status: string }) {
  const palette = status === "active"
    ? { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)",   text: "#4ade80" }
    : status === "escalated"
      ? { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" }
      : status === "closed"
        ? { bg: "rgba(107,114,128,0.18)", border: "rgba(107,114,128,0.35)", text: "#9ca3af" }
        : { bg: "var(--bg-base)", border: "var(--border-subtle)", text: "var(--text-secondary)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border"
      style={{ backgroundColor: palette.bg, borderColor: palette.border, color: palette.text }}
    >
      {status}
    </span>
  );
}

function MessageBubble({ msg }: { msg: MsgRow }) {
  const isInbound  = msg.direction === "inbound";
  const isAi       = msg.role === "ai";
  const isHuman    = msg.role === "human";
  const conf = msg.confidence !== null ? Number(msg.confidence) : null;

  // Customer messages on the left, outbound on the right.
  const containerClass = isInbound ? "" : "flex-row-reverse";
  const bubbleStyle    = isInbound
    ? { backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }
    : isAi
      ? { backgroundColor: "rgba(139,92,246,0.10)", borderColor: "rgba(139,92,246,0.30)" }
      : { backgroundColor: "rgba(34,197,94,0.10)",  borderColor: "rgba(34,197,94,0.30)" };

  return (
    <div className={`flex gap-2 ${containerClass}`}>
      <div className="max-w-[78%] min-w-0 space-y-1">
        <div
          className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold ${isInbound ? "" : "justify-end"}`}
          style={{ color: "var(--text-muted)" }}
        >
          <span>{isInbound ? "↓ customer" : isAi ? "↑ AI" : isHuman ? "↑ human" : `↑ ${msg.role}`}</span>
          {msg.intent !== null && (
            <>
              <span>·</span>
              <span className="font-mono normal-case">{msg.intent}</span>
            </>
          )}
          {conf !== null && (
            <>
              <span>·</span>
              <span className="tabular-nums normal-case">conf {conf.toFixed(2)}</span>
            </>
          )}
          <span className="normal-case">{new Date(msg.created_at).toISOString().slice(11, 19)} UTC</span>
        </div>
        <div
          className="px-3 py-2 rounded-xl border text-sm leading-snug whitespace-pre-wrap break-words"
          style={bubbleStyle}
        >
          {msg.body}
        </div>
        {msg.meta_message_id !== null && (
          <div
            className={`text-[9px] font-mono truncate ${isInbound ? "" : "text-right"}`}
            style={{ color: "var(--text-muted)" }}
          >
            {msg.meta_message_id}
          </div>
        )}
      </div>
    </div>
  );
}
