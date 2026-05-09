/**
 * /admin/p05-connectone — ConnectOne overview placeholder.
 */

export const metadata = { title: "ConnectOne · Admin Overview" };

export default function ConnectoneOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">ConnectOne</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          IoT Plug-and-Play Platform — device provisioning, telemetry, dashboards.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Devices" value="—" sub="backend not wired" />
        <Stat label="Telemetry / hr" value="—" sub="backend not wired" />
        <Stat label="Active tenants" value="—" sub="backend not wired" />
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
          Device fleet, telemetry ingestion rate, and tenant analytics will appear here once the
          P05 stats API is wired.
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
