"use client";

/**
 * InvoiceComposer — invoice creator client island.
 *
 * Computes per-line tax splits + invoice totals locally using the same
 * lib/p03/gst-calc engine the server uses on POST. That keeps the preview
 * the user sees identical to what they get back from /api/p03/...invoices.
 *
 * HSN autocomplete: 200ms-debounced fetch to /api/p03/hsn/search. Pulls
 * common defaults on focus, narrows on type. Picking a code auto-fills the
 * GST rate from the master.
 *
 * Submit: POST /api/p03/businesses/{id}/invoices with the line drafts. The
 * server re-runs the calc and returns the final row. Redirect to detail page.
 */

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import {
  computeLine,
  computeInvoiceTotals,
  classifySupply,
  type SupplyType,
} from "@/lib/p03/gst-calc";
import type { GstScheme } from "@/lib/p03/types";

interface CustomerLite {
  id:           string;
  name:         string;
  gstin:        string | null;
  country_code: string;
  state_code:   string;
  state_name:   string;
}

interface HsnHit {
  code:             string;
  kind:             string;
  description:      string;
  gst_rate_percent: number;
  is_common:        boolean;
}

interface LineDraft {
  uid:               string; // local-only id for React key; server doesn't see it
  item_description:  string;
  hsn_code:          string;
  unit:              string;
  quantity:          number;
  unit_price:        number;
  discount_percent:  number;
  gst_rate_percent:  number;
  cess_rate_percent: number;
}

interface Props {
  businessId:      string;
  sellerStateCode: string;
  gstScheme:       GstScheme;
  customers:       CustomerLite[];
}

const todayYmd = (): string => new Date().toISOString().slice(0, 10);

function blankLine(): LineDraft {
  return {
    uid:               crypto.randomUUID(),
    item_description:  "",
    hsn_code:          "",
    unit:              "NOS",
    quantity:          1,
    unit_price:        0,
    discount_percent:  0,
    gst_rate_percent:  18,
    cess_rate_percent: 0,
  };
}

export function InvoiceComposer({ businessId, sellerStateCode, gstScheme, customers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [invoiceDate, setInvoiceDate] = useState(todayYmd());
  const [dueDate, setDueDate]         = useState("");
  const [notes, setNotes]             = useState("");
  const [terms, setTerms]             = useState("");

  const [lines, setLines] = useState<LineDraft[]>([blankLine()]);

  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customer = customers.find((c) => c.id === customerId) ?? customers[0];

  // -------- live tax computation -----------------------------------------
  const supplyType: SupplyType = classifySupply(
    { stateCode: sellerStateCode, countryCode: "IN" },
    { stateCode: customer?.state_code ?? "97", countryCode: customer?.country_code ?? "IN" },
  );

  const computedLines = lines.map((l) => {
    if (l.quantity <= 0 || l.unit_price < 0 || l.gst_rate_percent < 0) {
      return { taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, cessAmount: 0, lineTotal: 0 };
    }
    try {
      return computeLine(
        {
          quantity:        l.quantity,
          unitPrice:       l.unit_price,
          discountPercent: l.discount_percent,
          gstRatePercent:  l.gst_rate_percent,
          cessRatePercent: l.cess_rate_percent,
        },
        supplyType,
        gstScheme,
      );
    } catch {
      return { taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, cessAmount: 0, lineTotal: 0 };
    }
  });

  const totals = computeInvoiceTotals({ lines: computedLines, roundOffToNearestRupee: true });

  // -------- line ops -----------------------------------------------------
  function updateLine(uid: string, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  }
  function removeLine(uid: string) {
    setLines((prev) => prev.filter((l) => l.uid !== uid));
  }
  function addLine() {
    setLines((prev) => [...prev, blankLine()]);
  }

  // -------- submit -------------------------------------------------------
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (customerId === "") { setError("Pick a customer"); return; }
    if (lines.length === 0) { setError("At least one line item"); return; }
    for (const l of lines) {
      if (l.item_description.trim() === "") { setError("Every line needs a description"); return; }
      if (l.hsn_code.trim() === "")         { setError("Every line needs an HSN/SAC code"); return; }
      if (l.quantity <= 0)                  { setError("Quantity must be > 0"); return; }
    }

    setBusy(true);
    setError(null);

    const payload = {
      customer_id:    customerId,
      invoice_date:   invoiceDate,
      due_date:       dueDate || undefined,
      notes:          notes.trim() || undefined,
      terms:          terms.trim() || undefined,
      lines: lines.map((l) => ({
        item_description:  l.item_description.trim(),
        hsn_code:          l.hsn_code.trim(),
        unit:              l.unit || "NOS",
        quantity:          l.quantity,
        unit_price:        l.unit_price,
        discount_percent:  l.discount_percent,
        gst_rate_percent:  l.gst_rate_percent,
        cess_rate_percent: l.cess_rate_percent,
      })),
    };

    try {
      const res = await fetch(`/api/p03/businesses/${businessId}/invoices`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      const id = data?.data?.invoice?.id as string | undefined;
      if (id === undefined) throw new Error("Server did not return invoice id");
      startTransition(() => router.push(`/dashboard/taxpilot/${businessId}/invoices/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Header section: customer + dates */}
      <Section title="Bill to">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Customer" required>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className={inputClass}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.gstin !== null ? `· ${c.gstin}` : `· ${c.state_name}`}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Supply type" hint="Auto-derived from seller + buyer state">
            <div
              className="px-3 py-2 rounded-lg border text-sm font-mono"
              style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
            >
              {supplyType === "intra_state" ? "Intra-state · CGST + SGST" :
               supplyType === "inter_state" ? "Inter-state · IGST" :
                                              "Export · zero-rated"}
            </div>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Invoice date" required>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Due date" hint="Optional">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Line items */}
      <Section title="Line items">
        <div className="space-y-3">
          {lines.map((l, idx) => (
            <LineRow
              key={l.uid}
              line={l}
              computed={computedLines[idx]!}
              supplyType={supplyType}
              onChange={(patch) => updateLine(l.uid, patch)}
              onRemove={lines.length > 1 ? () => removeLine(l.uid) : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-violet-500/40"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          <Plus size={12} /> Add line
        </button>
      </Section>

      {/* Notes + terms */}
      <Section title="Notes &amp; terms">
        <Field label="Notes" hint="Visible on the invoice">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={2000} className={inputClass} />
        </Field>
        <Field label="Payment terms">
          <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} maxLength={2000} className={inputClass} placeholder="e.g. Payment due in 30 days" />
        </Field>
      </Section>

      {/* Totals preview */}
      <Section title="Totals (live preview)">
        <dl className="space-y-1.5 text-sm">
          <Row label="Subtotal"  value={formatINR(totals.subtotalAmount)} />
          {totals.cgstAmount > 0 && <Row label="CGST"  value={formatINR(totals.cgstAmount)} />}
          {totals.sgstAmount > 0 && <Row label="SGST"  value={formatINR(totals.sgstAmount)} />}
          {totals.igstAmount > 0 && <Row label="IGST"  value={formatINR(totals.igstAmount)} />}
          {totals.cessAmount > 0 && <Row label="Cess"  value={formatINR(totals.cessAmount)} />}
          {totals.roundOffAmount !== 0 && (
            <Row label="Round-off" value={(totals.roundOffAmount > 0 ? "+" : "") + formatINR(totals.roundOffAmount).replace("₹", "₹")} />
          )}
          <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--border-subtle)" }}>
            <Row label="Grand total" value={formatINR(totals.totalAmount)} bold />
          </div>
        </dl>
      </Section>

      {error !== null && (
        <p
          className="text-xs px-3 py-2 rounded-lg border"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.30)", color: "#fca5a5" }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={busy || isPending}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {(busy || isPending) && <Loader2 size={14} className="animate-spin" />}
          Create invoice
        </button>
      </div>
    </form>
  );
}

// ===========================================================================
// LineRow with HSN autocomplete + live tax preview
// ===========================================================================

function LineRow({
  line, computed, supplyType, onChange, onRemove,
}: {
  line:       LineDraft;
  computed:   { taxableAmount: number; cgstAmount: number; sgstAmount: number; igstAmount: number; cessAmount: number; lineTotal: number };
  supplyType: SupplyType;
  onChange:   (patch: Partial<LineDraft>) => void;
  onRemove?:  () => void;
}) {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-start gap-2">
        <input
          value={line.item_description}
          onChange={(e) => onChange({ item_description: e.target.value })}
          placeholder="Item description"
          maxLength={500}
          className={`${inputClass} flex-1`}
        />
        {onRemove !== undefined && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg border transition-colors hover:bg-white/5 hover:border-red-500/40"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
            title="Remove line"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <div className="col-span-2 sm:col-span-2">
          <HsnAutocomplete
            value={line.hsn_code}
            onPick={(hit) => onChange({ hsn_code: hit.code, gst_rate_percent: hit.gst_rate_percent })}
            onChange={(v) => onChange({ hsn_code: v.toUpperCase() })}
          />
        </div>
        <NumberInput label="Qty"    value={line.quantity}        step={0.001}  onChange={(v) => onChange({ quantity: v })} />
        <NumberInput label="Price"  value={line.unit_price}      step={0.01}   onChange={(v) => onChange({ unit_price: v })} />
        <NumberInput label="Disc %" value={line.discount_percent} step={0.5}   onChange={(v) => onChange({ discount_percent: v })} />
        <NumberInput label="GST %"  value={line.gst_rate_percent} step={1}     onChange={(v) => onChange({ gst_rate_percent: v })} />
      </div>

      {/* Per-line live preview */}
      <div className="flex items-center gap-3 text-[11px] flex-wrap" style={{ color: "var(--text-muted)" }}>
        <span>Taxable: <span className="text-[var(--text-primary)] font-medium">{formatINR(computed.taxableAmount)}</span></span>
        {supplyType === "intra_state" && (
          <>
            <span>· CGST: <span className="text-[var(--text-primary)]">{formatINR(computed.cgstAmount)}</span></span>
            <span>· SGST: <span className="text-[var(--text-primary)]">{formatINR(computed.sgstAmount)}</span></span>
          </>
        )}
        {supplyType === "inter_state" && (
          <span>· IGST: <span className="text-[var(--text-primary)]">{formatINR(computed.igstAmount)}</span></span>
        )}
        <span className="ml-auto">Total: <span className="text-[var(--text-primary)] font-bold">{formatINR(computed.lineTotal)}</span></span>
      </div>
    </div>
  );
}

function NumberInput({
  label, value, step, onChange,
}: { label: string; value: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClass}
      />
    </label>
  );
}

// ===========================================================================
// HsnAutocomplete
// ===========================================================================

function HsnAutocomplete({
  value, onChange, onPick,
}: { value: string; onChange: (v: string) => void; onPick: (hit: HsnHit) => void }) {
  const [open, setOpen]       = useState(false);
  const [hits, setHits]       = useState<HsnHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/p03/hsn/search?q=${encodeURIComponent(value)}&limit=10`);
        if (res.ok) {
          const data = await res.json() as { data: HsnHit[] };
          setHits(data.data ?? []);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [value, open]);

  // Click-away to close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!inputRef.current) return;
      if (!inputRef.current.parentElement?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative">
      <span className="text-[10px] uppercase tracking-wider font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>HSN/SAC</span>
      <div className="relative">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="998313 / Computer / Mug…"
          className={`${inputClass} pl-7 font-mono`}
        />
      </div>
      {open && hits.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 rounded-lg border shadow-lg max-h-64 overflow-y-auto subtle-scrollbar"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          {loading && <li className="px-3 py-2 text-[11px]" style={{ color: "var(--text-muted)" }}>Loading…</li>}
          {hits.map((h) => (
            <li key={h.code}>
              <button
                type="button"
                onClick={() => { onPick(h); setOpen(false); }}
                className="w-full text-left px-3 py-2 transition-colors hover:bg-white/5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-mono">{h.code}</span>
                  <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {h.gst_rate_percent}%
                  </span>
                </div>
                <div className="text-[11px] truncate" style={{ color: "var(--text-secondary)" }}>{h.description}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===========================================================================
// helpers
// ===========================================================================

const inputClass =
  "w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:border-violet-500 transition-colors " +
  "border-[var(--border-subtle)] text-[var(--text-primary)]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl border p-5 space-y-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, required = false, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium">{label} {required && <span className="text-red-400">*</span>}</span>
        {hint !== undefined && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={`text-xs ${bold ? "font-semibold" : ""}`} style={{ color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</dt>
      <dd className={`tabular-nums ${bold ? "text-base font-bold" : "text-sm"}`}>{value}</dd>
    </div>
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
