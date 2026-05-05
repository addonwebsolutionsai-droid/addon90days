"use client";

/**
 * TaxPilot — AI GST & Invoicing Platform for Indian SMBs
 * Route: /taxpilot on addon90days.vercel.app
 *
 * Component tree:
 *   TaxPilotPage (server shell — all data is static)
 *     HeroBadge + HeroHeading + CTAs
 *     StatsBar
 *     WhatItDoes (4 feature cards)
 *     ICPExamples (4 business-type cards)
 *     HowItWorks (prose + dark code block showing /api/taxpilot/file-gstr)
 *     WaitlistForm ("use client" island — POST /api/p03-waitlist)
 *     Footer
 *
 * Accent: #f97316 (orange — Indian Business category)
 * No payment UI. No pricing display. Waitlist-only.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  RefreshCw,
  CheckSquare,
  QrCode,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ACCENT = "#f97316";

const STATS = [
  { value: "37%",   label: "GST filers miss deadlines" },
  { value: "3 hrs", label: "Avg time per GSTR-1 filing" },
  { value: "Free", label: "First year" },
  { value: "Day 30", label: "Public launch" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "GST-compliant invoice generation",
    description:
      "Generate B2B and B2C invoices with correct CGST/SGST/IGST split, HSN codes, and e-invoice IRN in one click. PDF, WhatsApp share, and email delivery built in.",
    color: ACCENT,
  },
  {
    icon: RefreshCw,
    title: "Auto-categorisation of expenses",
    description:
      "Upload bank statements or GST purchase data. AI tags each line item to the right expense head and ITC eligibility bucket — no manual ledger work.",
    color: "#eab308",
  },
  {
    icon: CheckSquare,
    title: "GSTR-1 & GSTR-3B filing assistant",
    description:
      "Compiles your sales data, reconciles with purchase register, and pre-fills GSTR-1 / GSTR-3B returns. One-click push to the GSTN portal via API.",
    color: "#22c55e",
  },
  {
    icon: QrCode,
    title: "e-Invoicing with IRN & QR",
    description:
      "For businesses above the IRP threshold: auto-generate IRN from the IRP, embed QR code, and archive the signed JSON response. Stay audit-ready.",
    color: "#06b6d4",
  },
];

const ICP_EXAMPLES = [
  {
    type: "CA Firm",
    emoji: "\u{1F4CA}",
    color: ACCENT,
    scenario:
      "CA files GSTR-1 for 30+ clients every month. TaxPilot pulls sales data from Tally/ERP, validates against purchase register, and submits — batch-mode, zero copy-paste.",
  },
  {
    type: "Retail / Distribution",
    emoji: "\u{1F3EA}",
    color: "#eab308",
    scenario:
      "500 invoices a month across CGST, SGST, IGST. TaxPilot generates each invoice, reconciles with GSTR-2A, flags mismatches before the filing deadline. ITC never missed.",
  },
  {
    type: "E-commerce Seller",
    emoji: "\u{1F6D2}",
    color: "#22c55e",
    scenario:
      "Sells on Flipkart, Amazon, own site. TaxPilot ingests TCS deducted by marketplaces, reconciles GSTR-8 from platform reports, auto-adjusts GSTR-3B liability.",
  },
  {
    type: "Services Business",
    emoji: "\u{1F4BC}",
    color: "#8b5cf6",
    scenario:
      "IT consultancy with 15 employees. Raises 20 B2B invoices a month. TaxPilot generates e-invoices with IRN, tracks outstanding, and sends payment reminders over WhatsApp.",
  },
];

// Code snippet — curl calling hypothetical /api/taxpilot/file-gstr
const CODE_SNIPPET = [
  "# File GSTR-1 via TaxPilot API",
  "curl -X POST https://api.taxpilot.in/api/taxpilot/file-gstr \\",
  "  -H 'Authorization: Bearer $TAXPILOT_KEY' \\",
  "  -H 'Content-Type: application/json' \\",
  "  -d '{",
  '    "gstin": "24AABCU9603R1Z9",',
  '    "return_type": "GSTR1",',
  '    "period": "042026",',
  '    "auto_reconcile": true,',
  '    "dry_run": false',
  "  }'",
  "",
  "# Response",
  "{",
  '  "ok": true,',
  '  "arn": "AA240400123456",',
  '  "status": "filed",',
  '  "invoices_pushed": 142,',
  '  "itc_eligible": 184320,',
  '  "filed_at": "2026-04-20T11:42:31Z"',
  "}",
].join("\n");

// ---------------------------------------------------------------------------
// Waitlist form
// ---------------------------------------------------------------------------

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/p03-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; dedupe?: boolean };
        setState(data.dedupe === true ? "duplicate" : "success");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(data.error ?? "Something went wrong. Try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 border text-sm font-medium"
        style={{
          borderColor: `${ACCENT}50`,
          backgroundColor: `${ACCENT}18`,
          color: ACCENT,
        }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        You&apos;re on the list. We&apos;ll email you when TaxPilot opens for beta.
      </div>
    );
  }

  if (state === "duplicate") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 border text-sm"
        style={{
          borderColor: `${ACCENT}30`,
          backgroundColor: `${ACCENT}10`,
          color: ACCENT,
        }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        Already registered. We have your email — you&apos;ll hear from us at launch.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto w-full"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={state === "loading"}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 transition-colors"
          style={{
            backgroundColor: "var(--bg-s2)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          aria-label="Email address for TaxPilot waitlist"
        />
        <button
          type="submit"
          disabled={state === "loading" || !email.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
          style={{ backgroundColor: ACCENT }}
        >
          {state === "loading" ? (
            "Joining..."
          ) : (
            <>
              Join waitlist <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>
      {state === "error" && errorMsg && (
        <p
          className="flex items-center justify-center gap-2 text-xs text-red-400"
          role="alert"
        >
          <AlertCircle size={12} className="shrink-0" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TaxPilotPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs mb-8 border"
          style={{ borderColor: `${ACCENT}30`, backgroundColor: `${ACCENT}10` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: ACCENT }}
          />
          <span
            className="font-semibold uppercase tracking-wider"
            style={{ color: ACCENT }}
          >
            Coming Day 30
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            &middot; Free for the first year &middot; Join waitlist
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          TaxPilot &mdash;{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GST compliance on autopilot
          </span>
        </h1>

        <p
          className="text-base max-w-xl mx-auto mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Indian SMBs spend 3+ hours every month manually compiling GSTR-1 and GSTR-3B.
          TaxPilot pulls your sales data, reconciles with your purchase register, and files
          directly to the GSTN portal — with e-invoicing IRN and audit trail included.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <a
            href="#waitlist"
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-colors text-sm"
            style={{ backgroundColor: ACCENT }}
          >
            Join waitlist <ArrowRight size={14} />
          </a>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Browse Claude Toolkit
          </Link>
        </div>

        {/* Demo badge */}
        <div
          className="inline-flex items-center gap-3 text-sm font-mono rounded-xl px-4 py-3 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <span style={{ color: ACCENT }}>&#9658;</span>
          <span style={{ color: "var(--text-muted)" }}>
            142 invoices &rarr; GSTR-1 compiled &rarr; pushed to GSTN&nbsp;
          </span>
          <span style={{ color: ACCENT }}>in 8 seconds</span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS BAR                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="border-y py-6"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold" style={{ color: ACCENT }}>
                {value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WHAT IT DOES                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <p
          className="text-xs font-medium uppercase tracking-widest mb-2 text-center"
          style={{ color: ACCENT }}
        >
          Core capabilities
        </p>
        <h2 className="text-2xl font-bold text-center mb-8">
          What TaxPilot handles for your business
        </h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="flex flex-col rounded-xl border p-5 transition-all duration-150"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                borderLeftColor: color,
                borderLeftWidth: "3px",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <h3
                className="font-semibold text-sm mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ICP EXAMPLES                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="py-12 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2 text-center"
            style={{ color: ACCENT }}
          >
            Real scenarios
          </p>
          <h2 className="text-2xl font-bold text-center mb-8">
            Built for businesses drowning in GST paperwork
          </h2>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {ICP_EXAMPLES.map(({ type, emoji, color, scenario }) => (
              <div
                key={type}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    {emoji}
                  </span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color, backgroundColor: `${color}15` }}
                  >
                    {type}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {scenario}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="py-12 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-2"
              style={{ color: ACCENT }}
            >
              How it works
            </p>
            <h2 className="text-2xl font-bold mb-3">
              Connect your ERP.
              <br />
              File in seconds.
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              TaxPilot reads your sales and purchase data from Tally, Zoho Books, or a plain
              Excel export. It reconciles GSTR-2A mismatches automatically, pre-fills your
              returns, and pushes them via the GSTN sandbox or live API — with a full audit
              trail for every filed record.
            </p>
            <div className="space-y-2.5">
              {[
                "No manual data entry. Connect once, file every month automatically.",
                "GSTR-2A reconciliation flags ITC mismatches before submission.",
                "e-Invoice IRN generated and archived for audit compliance.",
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Dark code block */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "#0f0f12", borderColor: "var(--border-subtle)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span
                className="text-xs font-mono ml-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                file-gstr.sh
              </span>
            </div>
            <pre
              className="p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <code>{CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WAITLIST                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="waitlist"
        className="py-14 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] mb-5 border"
            style={{ borderColor: `${ACCENT}30`, backgroundColor: `${ACCENT}10` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: ACCENT }}
            />
            <span
              className="font-semibold uppercase tracking-wider"
              style={{ color: ACCENT }}
            >
              Beta opens Day 30
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Get early access.
            <br />
            Free for the first year.
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            First cohort: 50 Indian businesses — CA firms, retailers, e-commerce sellers,
            service businesses. Drop your email and we will reach out when your slot opens.
          </p>

          <WaitlistForm />

          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            No credit card. No obligation. GSTN sandbox testing included — no live credentials needed to start.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <footer
        className="border-t py-8"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: ACCENT }}
              >
                <FileText size={11} className="text-white" />
              </div>
              <span className="font-semibold text-sm">TaxPilot</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: "var(--bg-s2)",
                  color: "var(--text-muted)",
                }}
              >
                by AddonWeb
              </span>
            </div>
            <div
              className="flex items-center gap-5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Link
                href="/legal/terms"
                className="transition-colors"
                style={{ color: "inherit" }}
              >
                Terms
              </Link>
              <Link
                href="/legal/privacy"
                className="transition-colors"
                style={{ color: "inherit" }}
              >
                Privacy
              </Link>
              <Link href="/" className="transition-colors" style={{ color: "inherit" }}>
                Claude Toolkit
              </Link>
              <a
                href="mailto:support@addonweb.io"
                className="transition-colors"
                style={{ color: "inherit" }}
              >
                support@addonweb.io
              </a>
            </div>
          </div>
          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 AddonWeb Solutions &middot; Ahmedabad, India
          </p>
        </div>
      </footer>
    </div>
  );
}
