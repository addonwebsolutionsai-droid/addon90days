/**
 * /admin/audit — admin action audit log viewer.
 *
 * Filterable by scope (product), action prefix, actor.
 * Read-only — the table is append-only at the schema layer.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ScrollText, RefreshCw } from "lucide-react";
import { requirePermission } from "@/lib/rbac";
import { listAuditEntries, type AuditRow } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "Audit · Admin" };

const SCOPE_TABS: { key: string; label: string }[] = [
  { key: "all",    label: "All scopes" },
  { key: "global", label: "Global" },
  { key: "p01",    label: "P01" },
  { key: "p02",    label: "P02" },
  { key: "p03",    label: "P03" },
  { key: "p04",    label: "P04" },
  { key: "cms",    label: "CMS" },
  { key: "billing",label: "Billing" },
];

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; actor?: string; action?: string }>;
}) {
  const guard = await requirePermission("global.audit.read");
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/audit");
    redirect("/admin");
  }

  const { scope: rawScope, actor, action } = await searchParams;
  const scope = SCOPE_TABS.some((t) => t.key === rawScope) ? rawScope : "all";

  const entries = await listAuditEntries({
    scope:         scope === "all" ? undefined : scope,
    actor:         actor || undefined,
    action_prefix: action || undefined,
    limit:         100,
  });

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-baseline justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={12} /> Back to admin
        </Link>
        <Link href="/admin/audit" prefetch={false} className="text-xs px-2.5 py-1.5 rounded-md border inline-flex items-center gap-1.5 transition-colors hover:bg-white/5" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          <RefreshCw size={12} /> Refresh
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText size={22} className="text-violet-400" />
          Audit log
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Append-only log of every admin mutation. {entries.length === 100 ? "Showing the last 100 entries." : `${entries.length} entries.`}
        </p>
      </header>

      {/* Scope tabs */}
      <nav className="flex flex-wrap gap-1 p-1 rounded-xl border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        {SCOPE_TABS.map((tab) => {
          const active = tab.key === scope;
          const params = new URLSearchParams();
          if (tab.key !== "all") params.set("scope", tab.key);
          if (actor)             params.set("actor", actor);
          if (action)            params.set("action", action);
          const href = `/admin/audit${params.toString() !== "" ? `?${params.toString()}` : ""}`;
          return (
            <Link key={tab.key} href={href} className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors" style={active ? { backgroundColor: "var(--bg-base)", color: "var(--text-primary)" } : { color: "var(--text-secondary)" }}>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Entries */}
      <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        {entries.length === 0 ? (
          <div className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
            No audit entries match the current filter.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {entries.map((e) => <li key={e.id} style={{ borderColor: "var(--border-subtle)" }}><Entry entry={e} /></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

function Entry({ entry: e }: { entry: AuditRow }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-4 py-2.5 transition-colors hover:bg-white/5">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono">{e.action}</span>
              {e.scope !== null && (
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>
                  {e.scope}
                </span>
              )}
            </div>
            <div className="text-[11px] mt-0.5 font-mono truncate" style={{ color: "var(--text-muted)" }}>
              {e.actor_clerk_user_id} · {e.resource_type}{e.resource_id !== null ? ` · ${e.resource_id}` : ""}
            </div>
          </div>
          <span className="text-[11px] tabular-nums shrink-0" style={{ color: "var(--text-muted)" }}>
            {new Date(e.created_at).toISOString().slice(0, 19).replace("T", " ")} UTC
          </span>
        </div>
      </summary>
      <div className="px-4 pb-3 text-[11px] font-mono space-y-1.5" style={{ color: "var(--text-secondary)" }}>
        {e.before_json !== null && (
          <div>
            <div className="text-[9px] uppercase tracking-wider mt-1.5" style={{ color: "var(--text-muted)" }}>Before</div>
            <pre className="text-[10px] mt-1 px-2 py-1.5 rounded overflow-x-auto" style={{ backgroundColor: "var(--bg-base)" }}>{JSON.stringify(e.before_json, null, 2)}</pre>
          </div>
        )}
        {e.after_json !== null && (
          <div>
            <div className="text-[9px] uppercase tracking-wider mt-1.5" style={{ color: "var(--text-muted)" }}>After</div>
            <pre className="text-[10px] mt-1 px-2 py-1.5 rounded overflow-x-auto" style={{ backgroundColor: "var(--bg-base)" }}>{JSON.stringify(e.after_json, null, 2)}</pre>
          </div>
        )}
      </div>
    </details>
  );
}
