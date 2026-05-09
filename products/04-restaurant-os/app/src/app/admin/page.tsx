/**
 * /admin/p04-tableflow — TableFlow overview placeholder.
 */

export const metadata = { title: "TableFlow · Admin Overview" };

export default function TableflowOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">TableFlow</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Smart Restaurant OS — table management, orders, kitchen display.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Restaurants" value="—" sub="backend not wired" />
        <Stat label="Orders today" value="—" sub="backend not wired" />
        <Stat label="Active tables" value="—" sub="backend not wired" />
        <Stat label="MRR" value="—" sub="pre-launch" />
      </div>

      <div
        className="rounded-xl border p-6 text-center"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          borderStyle: "dashed",
        }}
      >
        <p className="text-sm font-medium">Coming soon — backend ready, dashboard not yet built.</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Restaurant registrations, daily order volume, and revenue stats will appear here once
          the P04 stats API is wired.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub !== undefined && (
        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
      )}
    </div>
  );
}
