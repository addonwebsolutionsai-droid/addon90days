/**
 * /admin/chatbase — P02 ChatBase admin dashboard.
 *
 * Conversation-first design. The 90% use case is: "show me conversations
 * that need attention, let me jump in." So the page leads with that, not
 * with stats.
 *
 * Layout (top → bottom, single column for clarity):
 *   1. Compact stats strip (4 numbers, no chart fluff)
 *   2. Status filter tabs: All · Active · Needs attention · Closed
 *   3. Conversations list — phone/name + last-message preview + workspace + time
 *   4. Workspaces summary (small, secondary)
 *   5. Link to detailed views (intent breakdown, recent messages timeline)
 */

import Link from "next/link";
import { ArrowRight, Clock, Building2, RefreshCw, ChevronRight } from "lucide-react";
import { loadChatbaseAdminDashboard, type RecentConversationRow } from "@/lib/p02/admin-stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "ChatBase · Admin" };

type StatusFilter = "all" | "active" | "escalated" | "closed";
const STATUS_TABS: { key: StatusFilter; label: string; description: string }[] = [
  { key: "all",        label: "All",             description: "every conversation" },
  { key: "active",     label: "Active",          description: "AI is handling" },
  { key: "escalated",  label: "Needs attention", description: "human takeover required" },
  { key: "closed",     label: "Closed",          description: "resolved / archived" },
];

export default async function ChatbaseAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: StatusFilter = (STATUS_TABS.some((t) => t.key === rawStatus)
    ? rawStatus
    : "all") as StatusFilter;

  const data = await loadChatbaseAdminDashboard();
  const { kpis, workspaces, recentConversations } = data;

  // Apply status filter to the conversations list
  const filteredConversations = status === "all"
    ? recentConversations
    : recentConversations.filter((c) => c.status === status);

  const isRealMode = process.env["MOCK_MODE"] === "false" && process.env["WHATSAPP_PHONE_NUMBER_ID"] !== undefined;

  return (
    <div className="space-y-6">
      {/* ----- Header ----- */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ChatBase</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Live WhatsApp conversations across every workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ModePill isRealMode={isRealMode} />
          <Link
            href="/admin/chatbase"
            prefetch={false}
            className="text-xs px-2.5 py-1.5 rounded-md border inline-flex items-center gap-1.5 transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            title="Reload"
          >
            <RefreshCw size={12} /> Refresh
          </Link>
        </div>
      </header>

      {/* ----- Compact stats strip ----- */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Workspaces"     value={kpis.totalWorkspaces.toLocaleString()} />
        <Stat label="Conversations"  value={kpis.conversationsAllTime.toLocaleString()} sub={`${kpis.conversationsToday} today`} />
        <Stat label="Messages"       value={kpis.messagesAllTime.toLocaleString()}      sub={`${kpis.messagesToday} today`} />
        <Stat
          label="Need attention"
          value={kpis.escalatedQueueDepth.toLocaleString()}
          sub={kpis.escalatedQueueDepth > 0 ? "click below to handle" : "all clear"}
          highlight={kpis.escalatedQueueDepth > 0}
        />
      </section>

      {/* ----- Status filter tabs ----- */}
      <nav
        className="flex flex-wrap gap-1 p-1 rounded-xl border"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {STATUS_TABS.map((tab) => {
          const active = tab.key === status;
          const count =
            tab.key === "all"
              ? recentConversations.length
              : recentConversations.filter((c) => c.status === tab.key).length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/chatbase" : `/admin/chatbase?status=${tab.key}`}
              className="flex-1 min-w-[140px] rounded-lg px-3 py-2 text-sm transition-colors text-left"
              style={
                active
                  ? { backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-medium ${tab.key === "escalated" && count > 0 ? "text-amber-400" : ""}`}>
                  {tab.label}
                </span>
                <span className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {count}
                </span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {tab.description}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ----- Conversations list (the main thing) ----- */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <header
          className="px-4 py-3 border-b flex items-baseline justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold">
            {status === "all" ? "Recent conversations" : STATUS_TABS.find((t) => t.key === status)?.label}
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {filteredConversations.length} shown
          </p>
        </header>

        {filteredConversations.length === 0 ? (
          <div className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
            {status === "all"
              ? "No conversations yet. Send a WhatsApp message to your test number to get started."
              : `No ${STATUS_TABS.find((t) => t.key === status)?.label.toLowerCase()} conversations.`}
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {filteredConversations.map((c) => (
              <li key={c.id} style={{ borderColor: "var(--border-subtle)" }}>
                <ConversationRow conversation={c} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ----- Workspaces (small secondary panel) ----- */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <header
          className="px-4 py-3 border-b flex items-baseline justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Building2 size={13} className="text-violet-400" /> Workspaces
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {workspaces.length} total
          </p>
        </header>

        {workspaces.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: "var(--text-muted)" }}>
            No workspaces yet.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {workspaces.slice(0, 6).map((w) => (
              <li key={w.id} style={{ borderColor: "var(--border-subtle)" }}>
                <Link
                  href={`/admin/chatbase/workspaces/${w.id}`}
                  className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{w.business_name}</span>
                      {w.whatsapp_phone_number_id !== null ? (
                        <Badge color="green">WhatsApp linked</Badge>
                      ) : (
                        <Badge color="muted">no WhatsApp</Badge>
                      )}
                    </div>
                    <div className="text-[11px] mt-0.5 font-mono truncate" style={{ color: "var(--text-muted)" }}>
                      {w.owner_clerk_user_id}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {w.conversations_count} conv
                    </span>
                    <ChevronRight size={14} className="text-violet-400" />
                  </div>
                </Link>
              </li>
            ))}
            {workspaces.length > 6 && (
              <li className="px-4 py-2 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
                + {workspaces.length - 6} more
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function ModePill({ isRealMode }: { isRealMode: boolean }) {
  if (isRealMode) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
        style={{ backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#4ade80" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Live WhatsApp
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
      style={{ backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.35)", color: "#fbbf24" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Mock mode
    </span>
  );
}

function Stat({
  label, value, sub, highlight = false,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: highlight ? "rgba(245,158,11,0.08)" : "var(--bg-surface)",
        borderColor: highlight ? "rgba(245,158,11,0.35)" : "var(--border-subtle)",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-amber-400" : ""}`}>
        {value}
      </div>
      {sub !== undefined && (
        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ConversationRow({ conversation: c }: { conversation: RecentConversationRow }) {
  const status = c.status;
  const dotColor = status === "active"
    ? "#4ade80"
    : status === "escalated"
      ? "#fbbf24"
      : status === "closed"
        ? "#6b7280"
        : "#a8a8b3";

  const preview = c.last_message_body !== null
    ? truncate(c.last_message_body, 110)
    : "(no messages yet)";

  // The displayed "name" — prefer customer_name, fall back to phone
  const headline = c.customer_name ?? c.customer_phone;
  const subline  = c.customer_name !== null ? c.customer_phone : null;

  return (
    <Link
      href={`/admin/chatbase/conversations/${c.id}`}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
    >
      {/* Status dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0 mt-2"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 4px ${dotColor}` }}
        title={status}
      />

      {/* Center: name + preview + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-sm font-medium truncate">{headline}</span>
            {subline !== null && (
              <span className="text-[11px] font-mono truncate" style={{ color: "var(--text-muted)" }}>
                {subline}
              </span>
            )}
          </div>
          <span className="text-[11px] tabular-nums shrink-0" style={{ color: "var(--text-muted)" }}>
            <Clock size={10} className="inline mr-0.5" />
            {relativeTime(c.last_message_at)}
          </span>
        </div>

        <p
          className={`text-xs leading-snug truncate ${c.last_message_is_inbound && status !== "closed" ? "font-medium" : ""}`}
          style={{ color: c.last_message_is_inbound && status !== "closed"
            ? "var(--text-primary)"
            : "var(--text-secondary)" }}
        >
          {c.last_message_is_inbound ? "↓ " : "↑ "}{preview}
        </p>

        <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <span className="truncate">{c.workspace_name}</span>
          <span>·</span>
          <span>{c.message_count} {c.message_count === 1 ? "message" : "messages"}</span>
          {c.last_intent !== null && (
            <>
              <span>·</span>
              <span className="font-mono">{c.last_intent}</span>
            </>
          )}
        </div>
      </div>

      <ArrowRight size={14} className="text-violet-400 shrink-0 mt-2" />
    </Link>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: "green" | "muted" }) {
  const palette = color === "green"
    ? { bg: "rgba(34,197,94,0.12)", text: "#4ade80" }
    : { bg: "rgba(168,168,179,0.10)", text: "var(--text-muted)" };
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold"
      style={{ backgroundColor: palette.bg, color: palette.text as string }}
    >
      {children}
    </span>
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
