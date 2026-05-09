/**
 * /dashboard/taxpilot/[businessId] — business overview.
 *
 * Top-of-funnel for a single business: KPIs (paid vs outstanding amounts,
 * customer + invoice counts), recent invoices list, recent customers.
 *
 * Tabbed deeper views (full Customers list, full Invoices list, Settings)
 * land at /[businessId]/customers, /invoices, /settings — for now the
 * overview is enough to see the business state at a glance.
 */

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, FileText, Users, Plus, ArrowRight, Receipt } from "lucide-react";
import {
  getBusiness,
  listCustomers,
  listInvoices,
} from "@/lib/p03/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ businessId: string }>;
}

export default async function BusinessOverview(ctx: RouteContext) {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/dashboard/taxpilot");

  const { businessId } = await ctx.params;
  const business = await getBusiness(businessId, userId);
  if (business === null) notFound();

  const [customers, invoices] = await Promise.all([
    listCustomers(businessId, userId),
    listInvoices(businessId, userId),
  ]);

  // Compute KPIs from invoice rows
  const totalInvoiced     = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const totalPaid         = invoices.reduce((s, i) => s + Number(i.paid_amount), 0);
  const outstanding       = totalInvoiced - totalPaid;
  const draftCount        = invoices.filter((i) => i.status === "draft").length;
  const sentCount         = invoices.filter((i) => i.status === "sent").length;
  const paidCount         = invoices.filter((i) => i.status === "paid").length;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <Link
        href="/dashboard/taxpilot"
        className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> All businesses
      </Link>

      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{business.legal_name}</h1>
          <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
            {business.gstin !== null && <span className="font-mono">{business.gstin}</span>}
            <span>{business.state_name}</span>
            <span>·</span>
            <span>{business.gst_scheme}</span>
            <span>·</span>
            <span>next invoice: {business.invoice_prefix}{String(business.next_invoice_number).padStart(4, "0")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/taxpilot/${business.id}/customers/new`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:border-violet-500/40"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            <Users size={13} /> Add customer
          </Link>
          <Link
            href={`/dashboard/taxpilot/${business.id}/invoices/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={13} /> New invoice
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <KpiCard label="Invoiced" value={formatINR(totalInvoiced)} sub={`${invoices.length} invoices`} />
        <KpiCard label="Paid"        value={formatINR(totalPaid)}    sub={`${paidCount} paid · ${sentCount} sent`} />
        <KpiCard label="Outstanding" value={formatINR(outstanding)}  sub={outstanding > 0 ? "due from customers" : "—"} highlight={outstanding > 0} />
        <KpiCard label="Drafts"      value={draftCount.toString()}   sub={draftCount > 0 ? "not sent yet" : "—"} />
      </section>

      {/* Two-up: invoices left, customers right */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <header className="px-4 py-3 border-b flex items-baseline justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="text-sm font-semibold flex items-center gap-2"><Receipt size={13} className="text-violet-400" /> Recent invoices</h2>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{invoices.length} total</span>
          </header>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>No invoices yet.</p>
              <Link
                href={`/dashboard/taxpilot/${business.id}/invoices/new`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                <Plus size={13} /> Create your first invoice
              </Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {invoices.slice(0, 10).map((inv) => (
                <li key={inv.id} style={{ borderColor: "var(--border-subtle)" }}>
                  <Link
                    href={`/dashboard/taxpilot/${business.id}/invoices/${inv.id}`}
                    className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{inv.invoice_number}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {inv.invoice_date} · {inv.supply_type.replace("_", "-")}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold tabular-nums">{formatINR(Number(inv.total_amount))}</div>
                      {Number(inv.paid_amount) > 0 && Number(inv.paid_amount) < Number(inv.total_amount) && (
                        <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {formatINR(Number(inv.paid_amount))} paid
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <header className="px-4 py-3 border-b flex items-baseline justify-between" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="text-sm font-semibold flex items-center gap-2"><Users size={13} className="text-violet-400" /> Customers</h2>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{customers.length}</span>
          </header>
          {customers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>No customers yet.</p>
              <Link
                href={`/dashboard/taxpilot/${business.id}/customers/new`}
                className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
              >
                <Plus size={11} /> Add a customer
              </Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {customers.slice(0, 8).map((c) => (
                <li key={c.id} className="px-4 py-2" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="text-xs font-medium truncate">{c.name}</div>
                  <div className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                    {c.gstin !== null
                      ? <span className="font-mono">{c.gstin}</span>
                      : c.email ?? c.phone ?? c.place_of_supply_state_name}
                  </div>
                </li>
              ))}
              {customers.length > 8 && (
                <li className="px-4 py-2 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
                  + {customers.length - 8} more
                </li>
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function KpiCard({ label, value, sub, highlight = false }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: highlight ? "rgba(245,158,11,0.08)" : "var(--bg-surface)",
        borderColor: highlight ? "rgba(245,158,11,0.35)" : "var(--border-subtle)",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className={`text-xl font-bold tabular-nums ${highlight ? "text-amber-400" : ""}`}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </div>
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
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/** Format ₹ with Indian numbering (12,34,567 not 1,234,567). */
function formatINR(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(amount);
  const fixed = v.toFixed(2);
  const [int, dec] = fixed.split(".");
  // Indian comma format: 1,23,45,678 — last 3 then groups of 2
  const intStr = int ?? "0";
  const last3 = intStr.slice(-3);
  const rest  = intStr.slice(0, -3);
  const restFormatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = restFormatted.length > 0 ? `${restFormatted},${last3}` : last3;
  return `${sign}₹${formatted}.${dec ?? "00"}`;
}
