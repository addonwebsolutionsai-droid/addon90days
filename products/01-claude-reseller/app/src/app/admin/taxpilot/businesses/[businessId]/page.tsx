/**
 * /admin/taxpilot/businesses/[businessId]
 *
 * Cross-tenant admin view of a single business: full metadata, all invoices,
 * all customers, totals. Read-only — actual edits happen through the owner's
 * own dashboard.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, FileText, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext { params: Promise<{ businessId: string }> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p03(table: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(table);
}

interface BusinessFull {
  id: string; owner_clerk_user_id: string;
  legal_name: string; trade_name: string | null; gstin: string | null; pan: string | null;
  state_code: string; state_name: string; address_line1: string | null;
  address_line2: string | null; city: string | null; pincode: string | null;
  email: string | null; phone: string | null;
  gst_scheme: string; composition_rate_percent: string | number | null;
  invoice_prefix: string; next_invoice_number: number;
  bank_ifsc: string | null; default_terms: string | null;
  created_at: string; updated_at: string;
}

interface CustomerLite {
  id: string; name: string; gstin: string | null; place_of_supply_state_name: string;
  email: string | null; phone: string | null; country_code: string;
}

interface InvoiceLite {
  id: string; invoice_number: string; status: string; supply_type: string;
  invoice_date: string; total_amount: string | number; paid_amount: string | number;
  customer_id: string;
}

export default async function BusinessAdminDetail(ctx: RouteContext) {
  const { businessId } = await ctx.params;

  const [bizRes, customersRes, invoicesRes] = await Promise.all([
    p03("p03_businesses").select("*").eq("id", businessId).maybeSingle(),
    p03("p03_customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    p03("p03_invoices").select("id, invoice_number, status, supply_type, invoice_date, total_amount, paid_amount, customer_id").eq("business_id", businessId).order("invoice_date", { ascending: false }).limit(200),
  ]);

  const biz = bizRes.data as BusinessFull | null;
  if (biz === null) notFound();

  const customers = (customersRes.data ?? []) as CustomerLite[];
  const invoices  = (invoicesRes.data ?? [])  as InvoiceLite[];

  const customerNameById = new Map(customers.map((c) => [c.id, c.name]));

  const totalInvoiced = invoices.filter((i) => i.status !== "cancelled").reduce((s, i) => s + Number(i.total_amount), 0);
  const totalPaid     = invoices.reduce((s, i) => s + Number(i.paid_amount), 0);
  const outstanding   = totalInvoiced - totalPaid;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/taxpilot"
        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to TaxPilot admin
      </Link>

      {/* Header */}
      <header>
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
          Business
        </p>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 size={20} className="text-violet-400" />
          {biz.legal_name}
        </h1>
        {biz.trade_name !== null && (
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>doing business as {biz.trade_name}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-[11px] flex-wrap" style={{ color: "var(--text-muted)" }}>
          {biz.gstin !== null && <span className="font-mono">{biz.gstin}</span>}
          {biz.pan   !== null && <span className="font-mono">PAN: {biz.pan}</span>}
          <span>{biz.state_name}</span>
          <span>·</span>
          <span>{biz.gst_scheme}</span>
          {biz.gst_scheme === "composition" && biz.composition_rate_percent !== null && (
            <span>@ {Number(biz.composition_rate_percent)}%</span>
          )}
        </div>
      </header>

      {/* Money KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Invoiced"       value={formatINR(totalInvoiced)} sub={`${invoices.filter((i) => i.status !== "cancelled").length} invoices`} />
        <Stat label="Collected"      value={formatINR(totalPaid)} />
        <Stat label="Outstanding"    value={formatINR(outstanding)} highlight={outstanding > 0} />
        <Stat label="Customers"      value={String(customers.length)} sub={`next inv #${biz.invoice_prefix}${String(biz.next_invoice_number).padStart(4, "0")}`} />
      </section>

      {/* Metadata grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Meta label="Owner Clerk ID" value={biz.owner_clerk_user_id} mono />
        <Meta label="State code" value={biz.state_code} mono />
        <Meta label="Created" value={new Date(biz.created_at).toISOString().slice(0, 10)} />
        <Meta label="Updated" value={new Date(biz.updated_at).toISOString().slice(0, 10)} />
        <Meta label="Email" value={biz.email ?? "—"} />
        <Meta label="Phone" value={biz.phone ?? "—"} />
        <Meta label="City" value={biz.city ?? "—"} />
        <Meta label="Pincode" value={biz.pincode ?? "—"} />
      </section>

      {/* Invoices */}
      <Panel title="All invoices" subtitle={`${invoices.length} total`} icon={FileText}>
        {invoices.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No invoices yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {invoices.map((inv) => (
              <li key={inv.id} className="px-4 py-2.5 flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{inv.invoice_number}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {inv.invoice_date} · {customerNameById.get(inv.customer_id) ?? "(unknown customer)"} · {inv.supply_type.replace("_", "-")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold tabular-nums">{formatINR(Number(inv.total_amount))}</div>
                  {Number(inv.paid_amount) > 0 && Number(inv.paid_amount) < Number(inv.total_amount) && (
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatINR(Number(inv.paid_amount))} paid</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Customers */}
      <Panel title="Customers" subtitle={`${customers.length} total`} icon={Users}>
        {customers.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No customers yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {customers.map((c) => (
              <li key={c.id} className="px-4 py-2" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="text-xs font-medium truncate">{c.name}</div>
                <div className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {c.gstin !== null ? <span className="font-mono">{c.gstin}</span> : (c.email ?? c.phone ?? "—")} · {c.place_of_supply_state_name}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value, sub, highlight = false }: { label: string; value: string; sub?: string; highlight?: boolean }) {
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
      {sub !== undefined && <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className={`text-xs ${mono ? "font-mono" : ""} truncate`}>{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <header
        className="px-4 py-3 border-b flex items-baseline justify-between gap-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Icon size={13} className="text-violet-400" />
          {title}
        </h2>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      </header>
      {children}
    </section>
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
