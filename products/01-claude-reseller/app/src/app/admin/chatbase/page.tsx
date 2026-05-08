/**
 * /admin/chatbase — P02 ChatBase analytics + ops dashboard.
 *
 * Server component. Single round-trip data load via loadChatbaseAdminDashboard().
 * Auth gate inherited from /admin/layout.tsx (requireAdmin via ADMIN_USER_IDS env).
 *
 * Layout (top → bottom):
 *   1. Title + status pill (real mode vs mock mode at the env level)
 *   2. KPI strip — 6 cards
 *   3. Two-column grid:
 *        left: Intent breakdown (last 7d) + Recent messages
 *        right: Workspaces table + Recent conversations
 *
 * Dark, dense, no fluff. Same design tokens as the rest of the app.
 */

import Link from "next/link";
import {
  Building2, MessageSquare, Activity, AlertTriangle, Gauge, Inbox, ArrowRight,
} from "lucide-react";
import {
  loadChatbaseAdminDashboard,
  type IntentBreakdownRow,
  type WorkspaceRow,
  type RecentConversationRow,
  type RecentMessageRow,
} from "@/lib/p02/admin-stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "ChatBase · Admin" };

export default async function ChatbaseAdminPage() {
  const data = await loadChatbaseAdminDashboard();
  const { kpis } = data;

  // Whether we're sending real WhatsApp or stuck in mock mode (env-level)
  const isRealMode = process.env["MOCK_MODE"] === "false" && process.env["WHATSAPP_PHONE_NUMBER_ID"] !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            P02 · ChatBase
          </p>
          <h1 className="text-2xl font-bold">Analytics &amp; ops</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Live data across every workspace. Refreshes on every visit (no cache).
          </p>
        </div>
        <ModePill isRealMode={isRealMode} />
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={Building2}      iconColor="#22c55e"  label="Workspaces"            value={kpis.totalWorkspaces.toLocaleString()} />
        <KpiCard icon={MessageSquare}  iconColor="#06b6d4"  label="Conversations · today" value={kpis.conversationsToday.toLocaleString()} sub={`${kpis.conversationsAllTime.toLocaleString()} all-time`} />
        <KpiCard icon={Activity}       iconColor="#8b5cf6"  label="Messages · today"      value={kpis.messagesToday.toLocaleString()}     sub={`${kpis.messagesAllTime.toLocaleString()} all-time`} />
        <KpiCard icon={AlertTriangle}  iconColor="#f59e0b"  label="Escalation rate · 7d"  value={`${kpis.escalationRate7d.toFixed(1)}%`}  sub="of conversations" />
        <KpiCard icon={Gauge}          iconColor="#ec4899"  label="Avg confidence · 7d"   value={kpis.avgConfidence7d > 0 ? kpis.avgConfidence7d.toFixed(2) : "—"} sub="0.0 – 1.0" />
        <KpiCard icon={Inbox}          iconColor="#ef4444"  label="Escalated queue"       value={kpis.escalatedQueueDepth.toLocaleString()} sub="awaiting takeover" />
      </section>

      {/* Two-column body */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: intent breakdown + recent messages */}
        <div className="space-y-6">
          <PanelCard title="Intent breakdown · last 7d" subtitle={`${data.intentBreakdown7d.reduce((s, r) => s + r.count, 0)} classified messages`}>
            {data.intentBreakdown7d.length === 0 ? (
              <EmptyState>No intent classifications in the last 7 days.</EmptyState>
            ) : (
              <IntentBars rows={data.intentBreakdown7d} />
            )}
          </PanelCard>

          <PanelCard title="Recent messages" subtitle="Last 50 across all workspaces">
            {data.recentMessages.length === 0 ? (
              <EmptyState>No messages yet.</EmptyState>
            ) : (
              <MessagesList rows={data.recentMessages} />
            )}
          </PanelCard>
        </div>

        {/* RIGHT: workspaces + recent conversations */}
        <div className="space-y-6">
          <PanelCard title="Workspaces" subtitle={`${data.workspaces.length} total — newest first`}>
            {data.workspaces.length === 0 ? (
              <EmptyState>No workspaces yet.</EmptyState>
            ) : (
              <WorkspacesTable rows={data.workspaces} />
            )}
          </PanelCard>

          <PanelCard title="Recent conversations" subtitle="Last 20 by activity">
            {data.recentConversations.length === 0 ? (
              <EmptyState>No conversations yet.</EmptyState>
            ) : (
              <ConversationsTable rows={data.recentConversations} />
            )}
          </PanelCard>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Components — kept inline for first ship; split if they grow large
// ===========================================================================

function ModePill({ isRealMode }: { isRealMode: boolean }) {
  if (isRealMode) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
        style={{ backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#4ade80" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Real WhatsApp · LIVE
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
      style={{ backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.35)", color: "#fbbf24" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Mock mode (env)
    </span>
  );
}

interface KpiCardProps {
  icon:      typeof Building2;
  iconColor: string;
  label:     string;
  value:     string;
  sub?:      string;
}

function KpiCard({ icon: Icon, iconColor, label, value, sub }: KpiCardProps) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color: iconColor }} />
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub !== undefined && (
        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
      )}
    </div>
  );
}

interface PanelCardProps {
  title:    string;
  subtitle: string;
  children: React.ReactNode;
}

function PanelCard({ title, subtitle, children }: PanelCardProps) {
  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <header
        className="px-4 py-3 border-b flex items-baseline justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
      {children}
    </div>
  );
}

function IntentBars({ rows }: { rows: IntentBreakdownRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = (r.count / max) * 100;
        return (
          <div key={r.intent} className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{r.intent}</span>
              <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>{r.count}</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--bg-base)" }}
            >
              <div
                className="h-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkspacesTable({ rows }: { rows: WorkspaceRow[] }) {
  return (
    <div className="space-y-1.5">
      {rows.slice(0, 8).map((w) => (
        <Link
          key={w.id}
          href={`/admin/chatbase/workspaces/${w.id}`}
          className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{w.business_name}</span>
              {w.whatsapp_phone_number_id !== null && (
                <span
                  className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80" }}
                >
                  WA
                </span>
              )}
              {w.mock_mode && (
                <span
                  className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#fbbf24" }}
                >
                  MOCK
                </span>
              )}
            </div>
            <div className="text-[11px] mt-0.5 font-mono truncate" style={{ color: "var(--text-muted)" }}>
              {w.owner_clerk_user_id}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums">{w.conversations_count}</div>
              <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>convs</div>
            </div>
            <ArrowRight size={13} className="text-violet-400" />
          </div>
        </Link>
      ))}
      {rows.length > 8 && (
        <p className="text-[11px] text-center pt-2" style={{ color: "var(--text-muted)" }}>
          +{rows.length - 8} more workspaces
        </p>
      )}
    </div>
  );
}

function ConversationsTable({ rows }: { rows: RecentConversationRow[] }) {
  return (
    <div className="space-y-1.5">
      {rows.slice(0, 12).map((c) => (
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
              <span className="truncate" style={{ color: "var(--text-muted)" }}>{c.workspace_name}</span>
              {c.last_intent !== null && (
                <span className="font-mono shrink-0" style={{ color: "var(--text-muted)" }}>· {c.last_intent}</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-bold tabular-nums">{c.message_count}</div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>msgs</div>
          </div>
        </Link>
      ))}
    </div>
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

function MessagesList({ rows }: { rows: RecentMessageRow[] }) {
  return (
    <div className="space-y-2 max-h-[480px] overflow-y-auto subtle-scrollbar">
      {rows.map((m) => {
        const isInbound  = m.direction === "inbound";
        const dotColor   = isInbound ? "#06b6d4" : "#8b5cf6";
        const roleLabel  = m.role === "customer" ? "customer" : m.role === "ai" ? "AI" : "human";
        return (
          <div
            key={m.id}
            className="flex gap-3 px-3 py-2 rounded-lg"
            style={{ backgroundColor: "var(--bg-base)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ backgroundColor: dotColor }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
                <span>{isInbound ? "↓ in" : "↑ out"}</span>
                <span>·</span>
                <span>{roleLabel}</span>
                {m.intent !== null && (
                  <>
                    <span>·</span>
                    <span className="font-mono normal-case">{m.intent}</span>
                  </>
                )}
                {m.confidence !== null && (
                  <>
                    <span>·</span>
                    <span className="tabular-nums normal-case">conf {m.confidence.toFixed(2)}</span>
                  </>
                )}
                <span className="ml-auto normal-case" style={{ color: "var(--text-muted)" }}>{relativeTime(m.created_at)}</span>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--text-primary)" }}>
                {truncate(m.body, 200)}
              </p>
              <p className="text-[10px] mt-1 font-mono truncate" style={{ color: "var(--text-muted)" }}>
                {m.workspace_name} · {m.customer_phone}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
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
