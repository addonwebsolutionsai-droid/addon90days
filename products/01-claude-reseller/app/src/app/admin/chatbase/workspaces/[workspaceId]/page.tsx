/**
 * /admin/chatbase/workspaces/[workspaceId]
 *
 * Per-workspace deep dive — KB summary, intents config, all conversations,
 * raw env hints. Read-only for now; takeover + manual reply lives on the
 * conversation detail page.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Tag, MessageCircle, Clock, Plus, Pencil } from "lucide-react";
import { KbDeleteButton } from "./_KbDeleteButton";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02(table: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(table);
}

interface WorkspaceFull {
  id: string;
  business_name: string;
  owner_clerk_user_id: string;
  timezone: string;
  locale: string;
  escalation_threshold: number;
  mock_mode: boolean;
  whatsapp_phone_number_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ConversationRow {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  status: string;
  last_intent: string | null;
  created_at: string;
  updated_at: string;
}

interface KbDocRow {
  id: string;
  kind: string;
  source_url: string | null;
  raw_content: string;
  created_at: string;
}

interface IntentRow {
  id: string;
  intent_key: string;
  name: string;
  threshold: string | number;
  workspace_id: string | null;
}

export default async function WorkspaceAdminDetail(ctx: RouteContext) {
  const { workspaceId } = await ctx.params;

  // Pull workspace, conversations, kb docs, intents in parallel
  const [wsRes, convRes, kbRes, intentRes, msgCountRes] = await Promise.all([
    p02("p02_workspaces").select("*").eq("id", workspaceId).maybeSingle(),
    p02("p02_conversations")
      .select("id, customer_phone, customer_name, status, last_intent, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(50),
    p02("p02_kb_docs")
      .select("id, kind, source_url, raw_content, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    // Workspace-specific intents OR global defaults
    p02("p02_intents")
      .select("id, intent_key, name, threshold, workspace_id")
      .or(`workspace_id.eq.${workspaceId},workspace_id.is.null`)
      .order("workspace_id", { ascending: true }),
    p02("p02_messages")
      .select("id, conversation_id", { count: "exact", head: false })
      .in(
        "conversation_id",
        // Will be filled in after we know conversation IDs; deferred to a follow-up below
        ["00000000-0000-0000-0000-000000000000"],
      ),
  ]);

  const workspace = wsRes.data as WorkspaceFull | null;
  if (workspace === null) notFound();

  const conversations = (convRes.data ?? []) as ConversationRow[];
  const kbDocs        = (kbRes.data ?? [])   as KbDocRow[];
  const allIntents    = (intentRes.data ?? []) as IntentRow[];

  // Per-conversation message counts. N+1 here is fine — admin page, max 50 convs.
  const messageCounts = new Map<string, number>();
  await Promise.all(conversations.map(async (c) => {
    const { count } = await p02("p02_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", c.id);
    messageCounts.set(c.id, count ?? 0);
  }));
  void msgCountRes;

  const customIntents  = allIntents.filter((i) => i.workspace_id !== null);
  const globalIntents  = allIntents.filter((i) => i.workspace_id === null);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/chatbase"
        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to ChatBase admin
      </Link>

      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            Workspace
          </p>
          <h1 className="text-2xl font-bold">{workspace.business_name}</h1>
          <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
            {workspace.id}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge color={workspace.mock_mode ? "amber" : "green"}>
            {workspace.mock_mode ? "MOCK MODE" : "LIVE"}
          </Badge>
          {workspace.whatsapp_phone_number_id !== null && (
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              phone_id: {workspace.whatsapp_phone_number_id}
            </span>
          )}
        </div>
      </header>

      {/* Workspace metadata */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetaCard label="Owner Clerk ID" value={workspace.owner_clerk_user_id} mono />
        <MetaCard label="Timezone" value={workspace.timezone} />
        <MetaCard label="Locale" value={workspace.locale} />
        <MetaCard label="Escalation threshold" value={String(workspace.escalation_threshold)} />
        <MetaCard label="Created" value={new Date(workspace.created_at).toISOString().slice(0, 19).replace("T", " ")} />
        <MetaCard label="Updated" value={new Date(workspace.updated_at).toISOString().slice(0, 19).replace("T", " ")} />
        <MetaCard label="Conversations" value={String(conversations.length)} />
        <MetaCard label="KB docs" value={String(kbDocs.length)} />
      </section>

      {/* Intents configuration */}
      <Panel
        title="Intents config"
        subtitle={`${customIntents.length} custom · ${globalIntents.length} inherited from defaults`}
        icon={Tag}
        action={
          <Link
            href={`/admin/chatbase/workspaces/${workspaceId}/intents/new`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-medium transition-colors"
          >
            <Plus size={11} /> Add custom intent
          </Link>
        }
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {[...customIntents, ...globalIntents].map((i) => (
            <div
              key={`${i.intent_key}-${i.workspace_id ?? "global"}`}
              className="rounded-lg border p-3"
              style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs font-mono">{i.intent_key}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  threshold {Number(i.threshold).toFixed(2)}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{i.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {i.workspace_id === null && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>
                    default
                  </span>
                )}
                {i.workspace_id !== null && (
                  <Link
                    href={`/admin/chatbase/intents/${i.id}/edit`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium transition-colors hover:text-violet-400"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Pencil size={9} /> Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* KB docs */}
      <Panel
        title="Knowledge base"
        subtitle={`${kbDocs.length} documents`}
        icon={BookOpen}
        action={
          <Link
            href={`/admin/chatbase/workspaces/${workspaceId}/kb/new`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-medium transition-colors"
          >
            <Plus size={11} /> Add KB doc
          </Link>
        }
      >
        {kbDocs.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
            No KB docs uploaded.
          </p>
        ) : (
          <div className="space-y-2">
            {kbDocs.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border p-3"
                style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                  <span>{d.kind}</span>
                  {d.source_url !== null && <span className="font-mono normal-case">· {d.source_url}</span>}
                  <span className="ml-auto normal-case">{new Date(d.created_at).toISOString().slice(0, 10)}</span>
                  <KbDeleteButton docId={d.id} workspaceId={workspaceId} />
                </div>
                <p className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
                  {d.raw_content.length > 360 ? `${d.raw_content.slice(0, 360)}…` : d.raw_content}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Conversations */}
      <Panel title="All conversations" subtitle={`${conversations.length} conversations · click to inspect`} icon={MessageCircle}>
        {conversations.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
            No conversations yet.
          </p>
        ) : (
          <div className="space-y-1.5">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/admin/chatbase/conversations/${c.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <StatusDot status={c.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{c.customer_phone}</span>
                    {c.customer_name !== null && (
                      <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>· {c.customer_name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] mt-0.5">
                    <span style={{ color: "var(--text-muted)" }}>{c.status}</span>
                    {c.last_intent !== null && (
                      <span className="font-mono" style={{ color: "var(--text-muted)" }}>· {c.last_intent}</span>
                    )}
                    <span style={{ color: "var(--text-muted)" }}>
                      <Clock size={10} className="inline mr-0.5" />
                      {relativeTime(c.updated_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold tabular-nums">{messageCounts.get(c.id) ?? 0}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>msgs</div>
                  </div>
                  <ArrowRight size={13} className="text-violet-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function MetaCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className={`text-xs ${mono ? "font-mono" : ""} truncate`}>{value}</div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: "green" | "amber" | "red" }) {
  const palette = color === "green"
    ? { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)",   text: "#4ade80" }
    : color === "amber"
      ? { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" }
      : { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)",  text: "#fca5a5" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
      style={{ backgroundColor: palette.bg, borderColor: palette.border, color: palette.text }}
    >
      {children}
    </span>
  );
}

function Panel({
  title, subtitle, icon: Icon, children, action,
}: {
  title: string; subtitle: string; icon: typeof Tag; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <header
        className="px-4 py-3 border-b flex items-center justify-between gap-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-sm font-semibold flex items-center gap-2 shrink-0">
            <Icon size={13} className="text-violet-400" />
            {title}
          </h2>
          <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        </div>
        {action !== undefined && <div className="shrink-0">{action}</div>}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "active"
    ? "#4ade80"
    : status === "escalated"
      ? "#fbbf24"
      : status === "closed"
        ? "#6b7280"
        : "#a8a8b3";
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
      title={status}
    />
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const diff = Math.max(0, now - then);
  const min  = Math.floor(diff / 60_000);
  if (min < 1)    return "just now";
  if (min < 60)   return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)    return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30)   return `${day}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}
