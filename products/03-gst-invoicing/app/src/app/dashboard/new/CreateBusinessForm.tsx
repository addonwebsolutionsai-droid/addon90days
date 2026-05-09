"use client";

/**
 * CreateBusinessForm — client island for /dashboard/new.
 *
 * Posts to POST /api/businesses. Auth is via the Clerk session cookie
 * which the API route reads via auth() — no Bearer token needed for same-
 * origin form submits.
 *
 * After success, navigates to /dashboard/<id>.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { INDIAN_STATES } from "@/lib/p03/types";

export function CreateBusinessForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [legalName, setLegalName]   = useState("");
  const [tradeName, setTradeName]   = useState("");
  const [gstin, setGstin]           = useState("");
  const [pan, setPan]               = useState("");
  const [stateCode, setStateCode]   = useState("24"); // Gujarat default — most common founder state
  const [address1, setAddress1]     = useState("");
  const [city, setCity]             = useState("");
  const [pincode, setPincode]       = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [scheme, setScheme]         = useState<"regular" | "composition" | "unregistered">("regular");
  const [compRate, setCompRate]     = useState("1");
  const [invoicePrefix, setPrefix]  = useState("INV-");
  const [busy, setBusy]             = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      legal_name:     legalName.trim(),
      state_code:     stateCode,
      gst_scheme:     scheme,
      invoice_prefix: invoicePrefix.trim() || "INV-",
    };
    if (tradeName.trim() !== "")           payload["trade_name"]   = tradeName.trim();
    if (gstin.trim() !== "")               payload["gstin"]        = gstin.trim().toUpperCase();
    if (pan.trim() !== "")                 payload["pan"]          = pan.trim().toUpperCase();
    if (address1.trim() !== "")            payload["address_line1"] = address1.trim();
    if (city.trim() !== "")                payload["city"]         = city.trim();
    if (pincode.trim() !== "")             payload["pincode"]      = pincode.trim();
    if (email.trim() !== "")               payload["email"]        = email.trim();
    if (phone.trim() !== "")               payload["phone"]        = phone.trim();
    if (scheme === "composition" && compRate.trim() !== "") {
      payload["composition_rate_percent"] = Number(compRate);
    }

    try {
      const res = await fetch("/api/businesses", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      const id = data?.data?.id as string | undefined;
      if (id === undefined) throw new Error("Server did not return business id");
      startTransition(() => router.push(`/dashboard/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Legal entity */}
      <Section title="Legal entity">
        <Field label="Legal name" required>
          <input
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="As registered (e.g. AddonWeb Solutions)"
            required
            maxLength={200}
            className={inputClass}
          />
        </Field>
        <Field label="Trade name" hint="The brand customers see, if different">
          <input
            type="text"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            maxLength={200}
            className={inputClass}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="GSTIN" hint="15-char alphanumeric. Optional for unregistered.">
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="24AAACR5055K1Z5"
              maxLength={15}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="PAN" hint="10-char">
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="AAACR5055K"
              maxLength={10}
              className={`${inputClass} font-mono`}
            />
          </Field>
        </div>
      </Section>

      {/* Address */}
      <Section title="Address">
        <Field label="State" required hint="Used to compute intra/inter-state GST split on every invoice">
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            required
            className={inputClass}
          >
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Address line 1">
          <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} maxLength={200} className={inputClass} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="City">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className={inputClass} />
          </Field>
          <Field label="Pincode">
            <input
              type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6}
              pattern="[0-9]{6}"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Scheme */}
      <Section title="GST scheme">
        <Field label="Scheme" required>
          <select value={scheme} onChange={(e) => setScheme(e.target.value as typeof scheme)} className={inputClass}>
            <option value="regular">Regular (CGST+SGST or IGST per invoice)</option>
            <option value="composition">Composition (flat % on turnover, no per-invoice tax)</option>
            <option value="unregistered">Unregistered (no GST)</option>
          </select>
        </Field>
        {scheme === "composition" && (
          <Field label="Composition rate %" required hint="1% trader · 2% manufacturer · 5% restaurant · 6% services">
            <input
              type="number" step="0.01" min="0" max="10"
              value={compRate} onChange={(e) => setCompRate(e.target.value)}
              required className={inputClass}
            />
          </Field>
        )}
      </Section>

      {/* Invoice numbering */}
      <Section title="Invoice numbering">
        <Field label="Prefix" hint="Each invoice will be <prefix><4-digit zero-padded sequence>, e.g. INV-0001">
          <input type="text" value={invoicePrefix} onChange={(e) => setPrefix(e.target.value)} maxLength={20} className={inputClass} />
        </Field>
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
          disabled={busy || isPending || legalName.trim().length === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {busy || isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          Create business
        </button>
      </div>
    </form>
  );
}

// --- helpers --------------------------------------------------------------

const inputClass =
  "w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:border-violet-500 transition-colors " +
  "border-[var(--border-subtle)] text-[var(--text-primary)]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl border p-5 space-y-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label, required = false, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
        {hint !== undefined && (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
