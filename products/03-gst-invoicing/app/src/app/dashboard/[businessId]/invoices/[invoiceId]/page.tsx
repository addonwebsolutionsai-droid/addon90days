/**
 * /dashboard/[businessId]/invoices/[invoiceId]
 *
 * Invoice detail. Server-renders the entire invoice in HTML form so the
 * user can read / verify / print. PDF download lands in a follow-up
 * (@react-pdf/renderer or print-stylesheet).
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { getBusiness, getInvoiceWithLines, getCustomer } from "@/lib/p03/db";

interface RouteContext { params: Promise<{ businessId: string; invoiceId: string }> }

export default async function InvoiceDetailPage(ctx: RouteContext) {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/dashboard");

  const { businessId, invoiceId } = await ctx.params;
  const [business, invoiceWithLines] = await Promise.all([
    getBusiness(businessId, userId),
    getInvoiceWithLines(invoiceId, businessId, userId),
  ]);
  if (business === null || invoiceWithLines === null) notFound();
  const { invoice, lines } = invoiceWithLines;

  const customer = await getCustomer(invoice.customer_id, businessId, userId);

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <Link
          href={`/dashboard/${businessId}`}
          className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={12} /> Back to {business.legal_name}
        </Link>
        <PrintButton />
      </div>

      <article
        id="invoice"
        className="rounded-xl border p-8 print:border-0 print:p-0"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-6 mb-8 pb-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{kindLabel(invoice.invoice_kind)}</h1>
            <p className="text-sm font-mono mt-1" style={{ color: "var(--text-muted)" }}>{invoice.invoice_number}</p>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{business.legal_name}</p>
            {business.gstin !== null && <p className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>GSTIN: {business.gstin}</p>}
            {business.address_line1 !== null && <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{business.address_line1}</p>}
            {business.city !== null && (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {business.city}{business.pincode !== null ? ` — ${business.pincode}` : ""}, {business.state_name}
              </p>
            )}
          </div>
        </header>

        {/* Bill to + meta */}
        <section className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Bill to</p>
            {customer !== null ? (
              <>
                <p className="font-semibold">{customer.name}</p>
                {customer.gstin !== null && <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>GSTIN: {customer.gstin}</p>}
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{customer.place_of_supply_state_name}</p>
              </>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>(customer deleted)</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Details</p>
            <p className="text-xs"><span style={{ color: "var(--text-muted)" }}>Date:</span> {invoice.invoice_date}</p>
            {invoice.due_date !== null && (
              <p className="text-xs"><span style={{ color: "var(--text-muted)" }}>Due:</span> {invoice.due_date}</p>
            )}
            <p className="text-xs"><span style={{ color: "var(--text-muted)" }}>Supply:</span> {invoice.supply_type.replace("_", "-")}</p>
            {invoice.reverse_charge && <p className="text-xs"><span style={{ color: "var(--text-muted)" }}>Reverse charge:</span> Yes</p>}
          </div>
        </section>

        {/* Line items table */}
        <section className="mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider font-semibold text-left border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}>
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Item</th>
                <th className="py-2 pr-3">HSN</th>
                <th className="py-2 pr-3 text-right">Qty</th>
                <th className="py-2 pr-3 text-right">Rate</th>
                <th className="py-2 pr-3 text-right">GST%</th>
                <th className="py-2 pr-3 text-right">Taxable</th>
                {invoice.supply_type === "intra_state" && (
                  <>
                    <th className="py-2 pr-3 text-right">CGST</th>
                    <th className="py-2 pr-3 text-right">SGST</th>
                  </>
                )}
                {invoice.supply_type === "inter_state" && (
                  <th className="py-2 pr-3 text-right">IGST</th>
                )}
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <td className="py-2 pr-3 align-top text-xs tabular-nums">{l.line_number}</td>
                  <td className="py-2 pr-3 align-top">{l.item_description}</td>
                  <td className="py-2 pr-3 align-top text-xs font-mono">{l.hsn_code}</td>
                  <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{Number(l.quantity)} {l.unit}</td>
                  <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{formatINR(Number(l.unit_price))}</td>
                  <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{Number(l.gst_rate_percent)}%</td>
                  <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{formatINR(Number(l.taxable_amount))}</td>
                  {invoice.supply_type === "intra_state" && (
                    <>
                      <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{formatINR(Number(l.cgst_amount))}</td>
                      <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{formatINR(Number(l.sgst_amount))}</td>
                    </>
                  )}
                  {invoice.supply_type === "inter_state" && (
                    <td className="py-2 pr-3 align-top text-right text-xs tabular-nums">{formatINR(Number(l.igst_amount))}</td>
                  )}
                  <td className="py-2 align-top text-right text-xs tabular-nums font-semibold">{formatINR(Number(l.line_total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="ml-auto w-full sm:max-w-xs space-y-1 text-sm">
          <Row label="Subtotal" value={formatINR(Number(invoice.subtotal_amount))} />
          {Number(invoice.cgst_amount) > 0 && <Row label="CGST" value={formatINR(Number(invoice.cgst_amount))} />}
          {Number(invoice.sgst_amount) > 0 && <Row label="SGST" value={formatINR(Number(invoice.sgst_amount))} />}
          {Number(invoice.igst_amount) > 0 && <Row label="IGST" value={formatINR(Number(invoice.igst_amount))} />}
          {Number(invoice.cess_amount) > 0 && <Row label="Cess" value={formatINR(Number(invoice.cess_amount))} />}
          {Number(invoice.round_off_amount) !== 0 && (
            <Row label="Round-off" value={(Number(invoice.round_off_amount) > 0 ? "+" : "") + formatINR(Number(invoice.round_off_amount))} />
          )}
          <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--border-subtle)" }}>
            <Row label="Grand total" value={formatINR(Number(invoice.total_amount))} bold />
          </div>
          {Number(invoice.paid_amount) > 0 && (
            <Row label="Paid" value={formatINR(Number(invoice.paid_amount))} muted />
          )}
        </section>

        {(invoice.notes !== null || invoice.terms !== null) && (
          <footer className="mt-8 pt-4 border-t text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            {invoice.notes !== null && (
              <p className="mb-2"><span className="font-semibold">Notes:</span> {invoice.notes}</p>
            )}
            {invoice.terms !== null && (
              <p><span className="font-semibold">Terms:</span> {invoice.terms}</p>
            )}
          </footer>
        )}
      </article>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function PrintButton() {
  // Server component: render a tiny client island just for the print() call.
  return <PrintLink />;
}

function PrintLink() {
  return (
    <form action="javascript:window.print()" className="inline">
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        <Printer size={12} /> Print / Save as PDF
      </button>
    </form>
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
      className="inline-flex items-center mt-2 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold"
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Row({ label, value, bold = false, muted = false }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={`${bold ? "font-semibold text-sm" : "text-xs"}`} style={{ color: muted ? "var(--text-muted)" : bold ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</dt>
      <dd className={`tabular-nums ${bold ? "text-lg font-bold" : muted ? "text-xs" : "text-sm"}`} style={muted ? { color: "var(--text-muted)" } : {}}>{value}</dd>
    </div>
  );
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "tax_invoice":    return "Tax Invoice";
    case "bill_of_supply": return "Bill of Supply";
    case "export_invoice": return "Export Invoice";
    case "credit_note":    return "Credit Note";
    case "debit_note":     return "Debit Note";
    default:               return "Invoice";
  }
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
