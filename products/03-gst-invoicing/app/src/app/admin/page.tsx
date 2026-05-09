/**
 * /admin/taxpilot — P03 TaxPilot admin dashboard.
 *
 * Mirrors the conversation-first layout of /admin/chatbase but pivots to
 * money: gross invoiced, collected, outstanding. Lists every business
 * across every owner sorted by total invoiced (highest first).
 */

import Link from "next/link";
import { Building2, Receipt, ChevronRight, ArrowRight, RefreshCw } from "lucide-react";
import { loadTaxpilotAdminDashboard, type BusinessAdminRow, type InvoiceAdminRow } from "@/lib/p03/admin-stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "TaxPilot · Admin" };

type StatusFilter = "all" | "draft" | "sent" | "paid" | "partially_paid" | "cancelled";
const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",            label: "All" },
  { key: "draft",          label: "Drafts" },
  { key: "sent",           label: "Sent" },
  { key: "partially_paid", label: "Partial" },
  { key: "paid",           label: "Paid" },
  { key: "cancelled",      label: "Cancelled" },
];

export default async function TaxPilotAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: StatusFilter = (STATUS_TABS.some((t) => t.key === rawStatus)
    ? rawStatus
    : "all") as StatusFilter;

  const data = await loadTaxpilotAdminDashboard();
  const { kpis, businesses, recentInvoices, schemeBreakdown } = data;

  const filteredInvoices = status === "all"
    ? recentInvoices
    : recentInvoices.filter((i) => i.status === status);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">TaxPilot</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Cross-tenant view of all businesses, customers, and invoices.
          </p>
        </div>
        <Link
          href="/admin"
          prefetch={false}
          className="text-xs px-2.5 py-1.5 rounded-md border inline-flex items-center gap-1.5 transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          <RefreshCw size={12} /> Refresh
        </Link>
      </header>

      {/* KPI strip — money-first */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          label="Gross invoiced"
          value={formatINR(kpis.grossInvoicedAllTime)}
          sub={`${formatINR(kpis.grossInvoiced7d)} last 7d`}
        />
        <Stat
          label="Collected"
          value={formatINR(kpis.totalCollected)}
          sub={`${kpis.totalInvoices} invoices`}
        />
        <Stat
          label="Outstanding"
          value={formatINR(kpis.outstandingAllTime)}
          sub={kpis.outstandingAllTime > 0 ? "due from customers" : "all paid"}
          highlight={kpis.outstandingAllTime > 0}
        />
        <Stat
          label="Coverage"
          value={`${kpis.totalBusinesses} biz`}
          sub={`${kpis.totalCustomers} customers · ${kpis.invoicesToday} today`}
        />
      </section>

      {/* Status filter tabs for invoices */}
      <nav
        className="flex flex-wrap gap-1 p-1 rounded-xl border"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {STATUS_TABS.map((tab) => {
          const active = tab.key === status;
          const count =
            tab.key === "all"
              ? recentInvoices.length
              : recentInvoices.filter((i) => i.status === tab.key).length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin" : `/admin?status=${tab.key}`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                active
                  ? { backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              {tab.label} <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>· {count}</span>
            </Link>
          );
        })}
      </nav>

      {/* Recent invoices */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <header
          className="px-4 py-3 border-b flex items-baseline justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold flex items-center gap-2"><Receipt size={13} className="text-violet-400" /> Recent invoices</h2>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {filteredInvoices.length} shown · last 50 across all businesses
          </span>
        </header>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
            {status === "all" ? "No invoices yet." : `No ${STATUS_TABS.find((t) => t.key === status)?.label.toLowerCase()} invoices.`}
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {filteredInvoices.map((inv) => (
              <li key={inv.id} style={{ borderColor: "var(--border-subtle)" }}>
                <InvoiceRow inv={inv} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Businesses ranked by revenue */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <header
          className="px-4 py-3 border-b flex items-baseline justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 size={13} className="text-violet-400" /> Businesses</h2>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {businesses.length} total · ranked by gross invoiced
          </span>
        </header>

        {businesses.length === 0 ? (
          <div className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
            No businesses yet. The first user to register will appear here.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {businesses.slice(0, 15).map((b) => (
              <li key={b.id} style={{ borderColor: "var(--border-subtle)" }}>
                <BusinessRow biz={b} />
              </li>
            ))}
            {businesses.length > 15 && (
              <li className="px-4 py-2 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
                + {businesses.length - 15} more
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Scheme breakdown */}
      {schemeBreakdown.length > 0 && (
        <section
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            GST scheme distribution
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {schemeBreakdown.map((s) => (
              <div
                key={s.scheme}
                className="rounded-lg border p-3"
                style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
              >
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
                  {s.scheme}
                </div>
                <div className="text-base font-bold tabular-nums mt-1">{s.count}</div>
                <div className="text-[11px] mt-0.5 tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {formatINR(s.gross)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
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
        backgroundColor: highlight ? "rgba(245,158,11,0.08)" : "var(--bg-surface)",
        borderColor:     highlight ? "rgba(245,158,11,0.35)" : "var(--border-subtle)",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className={`text-xl font-bold tabular-nums ${highlight ? "text-amber-400" : ""}`}>{value}</div>
      {sub !== undefined && (
        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
      )}
    </div>
  );
}

function InvoiceRow({ inv }: { inv: InvoiceAdminRow }) {
  return (
    <Link
      href={`/admin/businesses/${inv.business_id}`}
      className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{inv.invoice_number}</span>
          <StatusBadge status={inv.status} />
          <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{inv.customer_name}</span>
        </div>
        <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
          {inv.business_name} · {inv.invoice_date} · {inv.supply_type.replace("_", "-")}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold tabular-nums">{formatINR(inv.total_amount)}</div>
        {inv.paid_amount > 0 && inv.paid_amount < inv.total_amount && (
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {formatINR(inv.paid_amount)} paid
          </div>
        )}
      </div>
    </Link>
  );
}

function BusinessRow({ biz: b }: { biz: BusinessAdminRow }) {
  return (
    <Link
      href={`/admin/businesses/${b.id}`}
      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{b.legal_name}</span>
          {b.gstin !== null && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80" }}>
              {b.gst_scheme === "regular" ? "GST" : b.gst_scheme.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] flex-wrap" style={{ color: "var(--text-muted)" }}>
          {b.gstin !== null && <span className="font-mono">{b.gstin}</span>}
          <span>{b.state_name}</span>
          <span>·</span>
          <span className="font-mono">{b.owner_clerk_user_id.slice(0, 18)}…</span>
          {b.last_invoice_at !== null && (
            <>
              <span>·</span>
              <span>last: {b.last_invoice_at}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums">{formatINR(b.total_invoiced)}</div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {b.invoice_count} {b.invoice_count === 1 ? "invoice" : "invoices"}
          </div>
        </div>
        <ChevronRight size={14} className="text-violet-400" />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === "paid"            ? { bg: "rgba(34,197,94,0.12)",   text: "#4ade80" } :
    status === "sent"            ? { bg: "rgba(59,130,246,0.12)",  text: "#93c5fd" } :
    status === "partially_paid"  ? { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" } :
    status === "cancelled"       ? { bg: "rgba(239,68,68,0.12)",   text: "#fca5a5" } :
                                    { bg: "rgba(168,168,179,0.10)", text: "var(--text-muted)" };
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold"
      style={{ backgroundColor: palette.bg, color: palette.text as string }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function formatINR(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(amount);
  const fixed = v.toFixed(2);
  const [int, dec] = fixed.split(".");
  const intStr = int ?? "0";
  const last3 = intStr.slice(-3);
  const rest  = intStr.slice(0, -3);
  const restFormatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = restFormatted.length > 0 ? `${restFormatted},${last3}` : last3;
  return `${sign}₹${formatted}.${dec ?? "00"}`;
}
