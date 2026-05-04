"use client";

/**
 * TableFlow — Smart Restaurant OS
 * Route: /tableflow on addon90days.vercel.app
 *
 * Component tree:
 *   TableFlowPage (server shell — all data is static)
 *     HeroBadge + HeroHeading + CTAs
 *     StatsBar
 *     WhatItDoes (4 feature cards)
 *     ICPExamples (4 business-type cards)
 *     HowItWorks (prose + WhatsApp conversation flow code block)
 *     WaitlistForm ("use client" island — POST /api/p04-waitlist)
 *     Footer
 *
 * Accent: #ec4899 (pink — startup-product color)
 * No payment UI. No pricing display. Waitlist-only.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  QrCode,
  Gift,
  BarChart2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ACCENT = "#ec4899";

const STATS = [
  { value: "60%",  label: "Orders via WhatsApp (India)" },
  { value: "3x",   label: "Loyalty retention vs no program" },
  { value: "₹0",  label: "During beta" },
  { value: "Day 45", label: "Beta opens" },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "WhatsApp ordering with menu carousel",
    description:
      "Customer sends \"menu\" to your number. Bot replies with interactive carousel — categories, items, prices, photos. They tap, add to cart, confirm. Order lands in your dashboard.",
    color: ACCENT,
  },
  {
    icon: QrCode,
    title: "Table-side QR menu",
    description:
      "Each table has a unique QR code. Scan to open the digital menu in WhatsApp — no app install. Order goes straight to the kitchen display with table number attached.",
    color: "#a855f7",
  },
  {
    icon: Gift,
    title: "Loyalty + cashback automation",
    description:
      "Every order accrues points. Bot sends cashback balance via WhatsApp after each visit. Redemption is a single message reply — no loyalty card, no app, no friction.",
    color: "#f59e0b",
  },
  {
    icon: BarChart2,
    title: "Daily dashboard via WhatsApp",
    description:
      "Every night at 10pm: total orders, revenue, top items, table turnover, cashback issued. One WhatsApp message, no login required. Know your numbers before you sleep.",
    color: "#22c55e",
  },
];

const ICP_EXAMPLES = [
  {
    type: "QSR / Fast Food",
    emoji: "\u{1F354}",
    color: ACCENT,
    scenario:
      "Customer scans table QR, sees menu in WhatsApp, orders 2 burgers + drinks. Order pops on kitchen display with table 7. Payment via UPI link in the same chat. Zero waiter needed.",
  },
  {
    type: "Cloud Kitchen",
    emoji: "\u{1F373}",
    color: "#a855f7",
    scenario:
      "Running 3 brands from one kitchen. WhatsApp numbers per brand, unified dashboard. Orders from all three land in one kitchen display, sorted by brand. Staff never confused.",
  },
  {
    type: "Cafe",
    emoji: "\u{2615}",
    color: "#f59e0b",
    scenario:
      "Regular sends \"the usual\" on WhatsApp at 8:55am. Bot knows their order history, confirms their flat white + avocado toast, marks it ready in 5 minutes. Loyalty points added.",
  },
  {
    type: "Dine-in Restaurant",
    emoji: "\u{1F37D}️",
    color: "#22c55e",
    scenario:
      "Table of 4 orders via QR. One person pays via UPI split. Bot sends individual payment links. Cashback credited to each phone number. No bill confusion, no waiter math.",
  },
];

// WhatsApp conversation flow — rendered as monospace to show the product UX
const CODE_SNIPPET = [
  "// WhatsApp ordering flow (customer perspective)",
  "",
  'Customer: "menu"',
  "Bot:      [Interactive carousel — 4 categories]",
  "          [Main Course] [Starters] [Beverages] [Desserts]",
  "",
  'Customer: [taps Main Course] -> [taps Butter Chicken] -> [Add]',
  'Customer: [taps Beverages] -> [taps Lassi] -> [Add]',
  'Customer: "confirm"',
  "",
  "Bot:      Your order:",
  "          1x Butter Chicken  ₹320",
  "          1x Lassi           ₹80",
  "          Table: 7 | Total: ₹400",
  "          Pay via UPI? [Yes] [No, pay at counter]",
  "",
  'Customer: [taps Yes]',
  "Bot:      [UPI deep link - opens PhonePe/GPay]",
  "          Order confirmed. Est. ready: 18 mins.",
  "          +40 loyalty points added to your account.",
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
      const res = await fetch("/api/p04-waitlist", {
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
        You&apos;re on the list. We&apos;ll email you when TableFlow opens for beta.
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
          aria-label="Email address for TableFlow waitlist"
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

export default function TableFlowPage() {
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
            Coming Day 45
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            &middot; Free during beta &middot; Join waitlist
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          TableFlow &mdash;{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            restaurant OS on WhatsApp
          </span>
        </h1>

        <p
          className="text-base max-w-xl mx-auto mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Your customers are already on WhatsApp. TableFlow turns it into your order channel,
          table management system, loyalty program, and daily reporting tool — all from one
          phone, zero new apps for staff or customers.
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
            Customer scans QR &rarr; orders on WhatsApp &rarr; kitchen notified&nbsp;
          </span>
          <span style={{ color: ACCENT }}>in 90 seconds</span>
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
          Run your entire restaurant from WhatsApp
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
            Works for every format that serves food
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
              One scan.
              <br />
              Full order flow.
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              You upload your menu once — items, prices, photos, categories. TableFlow generates
              QR codes per table and a WhatsApp number menu flow. Customers order via WhatsApp,
              kitchen gets the ticket, payment happens in-chat. No POS terminal, no staff app,
              no training overhead.
            </p>
            <div className="space-y-2.5">
              {[
                "Menu changes reflect instantly — edit once, live everywhere.",
                "Kitchen display updates in real-time. No chit-printing, no runner needed.",
                "Loyalty points auto-credited after every confirmed payment.",
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

          {/* WhatsApp conversation code block */}
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
                whatsapp-order-flow.txt
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
              Beta opens Day 45
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Get early access.
            <br />
            Free during beta.
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            First cohort: 30 food businesses — QSRs, cloud kitchens, cafes, dine-in restaurants
            across India and SE Asia. Drop your email and we will reach out when your slot opens.
          </p>

          <WaitlistForm />

          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            No credit card. No obligation. We handle the WhatsApp Business API setup — you just upload your menu.
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
                <MessageCircle size={11} className="text-white" />
              </div>
              <span className="font-semibold text-sm">TableFlow</span>
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
              <Link href="/legal/terms" className="transition-colors" style={{ color: "inherit" }}>
                Terms
              </Link>
              <Link href="/legal/privacy" className="transition-colors" style={{ color: "inherit" }}>
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
