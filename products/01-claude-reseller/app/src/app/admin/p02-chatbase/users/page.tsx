/**
 * /admin/p02-chatbase/users
 *
 * Cross-workspace view: who's actually using ChatBase, sorted by most
 * active. One row per Clerk user, aggregating their workspaces +
 * conversations + messages + last-active timestamp.
 */

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, MessageCircle } from "lucide-react";
import { loadChatbaseUsers, type ChatbaseUserRow } from "@/lib/p02/admin-stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Users · ChatBase Admin" };

export default async function ChatbaseUsersPage() {
  const rows = await loadChatbaseUsers();

  const totalUsers       = rows.length;
  const totalWorkspaces  = rows.reduce((s, r) => s + r.workspace_count, 0);
  const totalMessages    = rows.reduce((s, r) => s + r.total_messages, 0);
  const activeUsers7d    = rows.filter((r) => r.last_active_at !== null && r.last_active_at >= sevenDaysAgoIso()).length;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/p02-chatbase"
        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to ChatBase admin
      </Link>

      <header>
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
          ChatBase
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          One row per Clerk user. Sorted by most active (highest message count).
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Users"          value={totalUsers.toLocaleString()} />
        <Stat label="Workspaces"     value={totalWorkspaces.toLocaleString()} sub={`avg ${totalUsers > 0 ? (totalWorkspaces / totalUsers).toFixed(1) : "0"} per user`} />
        <Stat label="Messages"       value={totalMessages.toLocaleString()} />
        <Stat label="Active · 7d"    value={activeUsers7d.toLocaleString()} sub={totalUsers > 0 ? `${Math.round((activeUsers7d / totalUsers) * 100)}% of users` : "—"} highlight={activeUsers7d > 0} />
      </section>

      <section
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <header
          className="px-4 py-3 border-b flex items-baseline justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold">All users</h2>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {totalUsers} {totalUsers === 1 ? "user" : "users"}
          </span>
        </header>

        {rows.length === 0 ? (
          <div className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
            No users yet. Once someone signs up + creates a workspace, they appear here.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {rows.map((row) => (
              <li key={row.clerk_user_id} style={{ borderColor: "var(--border-subtle)" }}>
                <UserRow row={row} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function Stat({
  label, value, sub, highlight = false,
}: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: highlight ? "rgba(34,197,94,0.08)" : "var(--bg-surface)",
        borderColor:     highlight ? "rgba(34,197,94,0.35)" : "var(--border-subtle)",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className={`text-xl font-bold tabular-nums ${highlight ? "text-green-400" : ""}`}>{value}</div>
      {sub !== undefined && <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

function UserRow({ row }: { row: ChatbaseUserRow }) {
  const isActive7d = row.last_active_at !== null && row.last_active_at >= sevenDaysAgoIso();

  return (
    <Link
      href={`/admin/p02-chatbase`}
      className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono">{row.clerk_user_id}</span>
          {row.whatsapp_linked > 0 && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80" }}>
              {row.whatsapp_linked} WA
            </span>
          )}
          {isActive7d && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#93c5fd" }}>
              Active 7d
            </span>
          )}
        </div>
        <div className="text-[11px] mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
          {row.workspace_names.slice(0, 3).join(" · ")}
          {row.workspace_names.length > 3 && ` +${row.workspace_names.length - 3} more`}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted)" }}>
          <span>joined {new Date(row.joined_at).toISOString().slice(0, 10)}</span>
          {row.last_active_at !== null && (
            <>
              <span>·</span>
              <span><Clock size={10} className="inline mr-0.5" />last active {relativeTime(row.last_active_at)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums">{row.workspace_count}</div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>workspaces</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums flex items-center gap-1 justify-end">
            <MessageCircle size={11} className="text-violet-400" />
            {row.total_messages.toLocaleString()}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{row.total_conversations} convs</div>
        </div>
        <ArrowRight size={14} className="text-violet-400" />
      </div>
    </Link>
  );
}

function sevenDaysAgoIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const diff = Math.max(0, now - then);
  const min  = Math.floor(diff / 60_000);
  if (min < 1)  return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}
