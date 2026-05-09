/**
 * /admin/p06-machineguard — MachineGuard overview placeholder.
 */

export const metadata = { title: "MachineGuard · Admin Overview" };

export default function MachineguardOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">MachineGuard</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          IoT Predictive Maintenance — anomaly detection, alerts, maintenance scheduling.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Machines monitored" value="—" sub="backend not wired" />
        <Stat label="Alerts today" value="—" sub="backend not wired" />
        <Stat label="Enterprise tenants" value="—" sub="backend not wired" />
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
          Machine fleet health, active alert queue, and anomaly trends will appear here once the
          P06 stats API is wired.
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
