"use client";

/**
 * CreateCustomerForm — minimal customer-add form. Posts to
 * /api/p03/businesses/{id}/customers, redirects back to business overview
 * on success.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { INDIAN_STATES } from "@/lib/p03/types";

interface Props {
  businessId:      string;
  sellerStateCode: string; // pre-select buyer to seller's state (most common case → intra-state)
}

export function CreateCustomerForm({ businessId, sellerStateCode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [gstin, setGstin]         = useState("");
  const [country, setCountry]     = useState("IN");
  const [stateCode, setStateCode] = useState(sellerStateCode);
  const [address1, setAddress1]   = useState("");
  const [city, setCity]           = useState("");
  const [pincode, setPincode]     = useState("");
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // When user types a GSTIN, auto-set the state code from its prefix.
  function onGstinChange(v: string) {
    const upper = v.toUpperCase();
    setGstin(upper);
    if (upper.length >= 2) {
      const prefix = upper.slice(0, 2);
      if (INDIAN_STATES.some((s) => s.code === prefix)) setStateCode(prefix);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      name: name.trim(),
      country_code: country,
      place_of_supply_state_code: country === "IN" ? stateCode : "97",
    };
    if (email.trim() !== "")    payload["email"]         = email.trim();
    if (phone.trim() !== "")    payload["phone"]         = phone.trim();
    if (gstin.trim() !== "")    payload["gstin"]         = gstin.trim();
    if (address1.trim() !== "") payload["address_line1"] = address1.trim();
    if (city.trim() !== "")     payload["city"]          = city.trim();
    if (pincode.trim() !== "")  payload["pincode"]       = pincode.trim();

    try {
      const res = await fetch(`/api/p03/businesses/${businessId}/customers`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      startTransition(() => router.push(`/dashboard/taxpilot/${businessId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="Customer">
        <Field label="Name" required>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} className={inputClass} placeholder="As it should appear on the invoice" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} maxLength={20} />
          </Field>
        </div>
        <Field label="GSTIN" hint="If buyer is a registered business. State auto-detects from GSTIN.">
          <input
            value={gstin}
            onChange={(e) => onGstinChange(e.target.value)}
            placeholder="27AAAPL1234C1ZP"
            maxLength={15}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </Section>

      <Section title="Place of supply">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Country" required>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">UAE</option>
              <option value="SG">Singapore</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          {country === "IN" && (
            <Field label="State" required hint="Drives intra/inter-state GST split">
              <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={inputClass}>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {country !== "IN" && (
            <div
              className="rounded-lg border p-3 text-xs flex items-start gap-2"
              style={{ backgroundColor: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.30)", color: "#93c5fd" }}
            >
              Export — invoices to this customer will be zero-rated (no GST charged).
            </div>
          )}
        </div>
        <Field label="Address line 1">
          <input value={address1} onChange={(e) => setAddress1(e.target.value)} maxLength={200} className={inputClass} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="City">
            <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className={inputClass} />
          </Field>
          <Field label="Pincode">
            <input value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} pattern="[0-9]{6}" className={inputClass} />
          </Field>
        </div>
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
          disabled={busy || isPending || name.trim().length === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {(busy || isPending) && <Loader2 size={14} className="animate-spin" />}
          Save customer
        </button>
      </div>
    </form>
  );
}

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
