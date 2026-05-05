"use client";

/**
 * ChatBase -- WhatsApp AI for Indian SMBs
 * Route: /chatbase on addon90days.vercel.app
 *
 * Component tree:
 *   ChatBasePage
 *     HeroBadge + HeroHeading + CTAs
 *     StatsBar
 *     WhatItDoes (4 feature cards)
 *     ICPExamples (4 business-type cards)
 *     HowItWorks (prose + dark code block)
 *     WaitlistForm (email capture -> POST /api/p02-waitlist)
 *     Footer
 *
 * Design: identical CSS variables as P01 (var(--bg-base), etc.)
 * No payment UI, no pricing display. Waitlist-only.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Calendar,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const STATS = [
  { value: "200+", label: "Messages/day (avg SMB)" },
  { value: "80%",  label: "Auto-handled target" },
  { value: "24/7", label: "Response coverage" },
  { value: "Free", label: "During beta" },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Lead capture & FAQ auto-reply",
    description:
      'Customers ask "what are your timings?", "do you deliver?", "price of X?" -- the bot answers instantly from your knowledge base. No missed leads at midnight.',
    color: "#22c55e",
  },
  {
    icon: Calendar,
    title: "Appointment booking",
    description:
      "Syncs with Google Calendar. Bot checks real availability, offers 3 slots, books on confirmation, sends reminder 2 hours before. Zero back-and-forth.",
    color: "#06b6d4",
  },
  {
    icon: Zap,
    title: "Order collection bot",
    description:
      "Detects purchase intent, collects product/quantity/address/time slot, sends Razorpay link on confirmation, and creates an order record in your dashboard.",
    color: "#f59e0b",
  },
  {
    icon: Globe,
    title: "Hindi / Hinglish / Gujarati / English",
    description:
      "Detects the customer's language and replies in kind. Not a translation layer -- Claude understands colloquial mixed-language messages natively.",
    color: "#8b5cf6",
  },
];

const ICP_EXAMPLES = [
  {
    type: "Restaurant",
    emoji: "\u{1F35B}",
    color: "#f97316",
    scenario:
      'Customer sends "2 butter paneer + 1 garlic naan, deliver by 8pm" at 6:45pm. Bot collects address, confirms order, sends Razorpay link. Owner gets one notification.',
  },
  {
    type: "Salon",
    emoji: "\u{2702}️",
    color: "#ec4899",
    scenario:
      '"Is 4pm Saturday free for a haircut?" -- bot checks Google Calendar -- "Yes, slot available. Confirm?" -- booked. Calendar updated, no phone call needed.',
  },
  {
    type: "D2C Brand",
    emoji: "\u{1F4E6}",
    color: "#3b82f6",
    scenario:
      '500 messages a week asking "where is my order?" -- bot pulls Shiprocket tracking and replies automatically. Owner inbox drops from 500 to ~40 messages.',
  },
  {
    type: "Clinic",
    emoji: "\u{1F3E5}",
    color: "#14b8a6",
    scenario:
      'Patient asks "is Dr. Patel free tomorrow for a checkup?" in Gujarati. Bot checks availability, books slot, sends confirmation in Gujarati. Reception handles zero of this.',
  },
];

// Code snippet as plain string -- no backtick template to confuse the TS parser.
const CODE_SNIPPET = [
  "// Inbound WhatsApp message flow",
  "Customer message -> 360dialog webhook",
  "  -> classify intent (Claude Haiku, <500ms)",
  "  -> retrieve from knowledge base (Qdrant RAG)",
  "  -> generate reply in customer's language",
  "",
  "// Confidence threshold",
  "if (confidence >= 0.75) {",
  "  sendWhatsAppReply(response)      // auto-handled",
  "} else {",
  "  routeToHumanInbox(conversation)  // owner takes over",
  '  notifyOwner({ channel: "push" }) // 1-click "Take over"',
  "}",
  "",
  "// Result",
  'automationRate: "80%"  // 4 of 5 messages need 0 owner input',
].join("\n");

// ---------------------------------------------------------------------------
// Waitlist form state type
// ---------------------------------------------------------------------------

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

// ---------------------------------------------------------------------------
// WaitlistForm
// ---------------------------------------------------------------------------

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
      const res = await fetch("/api/p02-waitlist", {
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
        className="flex items-center gap-3 rounded-xl px-5 py-4 border border-green-500/30 bg-green-500/10 text-green-500 text-sm font-medium"
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        You&apos;re on the list. We&apos;ll email you when ChatBase opens for beta.
      </div>
    );
  }

  if (state === "duplicate") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 border border-green-500/20 text-green-400 text-sm"
        style={{ backgroundColor: "rgba(34,197,94,0.06)" }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        Already registered. We have your email -- you&apos;ll hear from us at launch.
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
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
          style={{
            backgroundColor: "var(--bg-s2)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          aria-label="Email address for ChatBase waitlist"
        />
        <button
          type="submit"
          disabled={state === "loading" || !email.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
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

export default function ChatBasePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs mb-8 border border-green-500/30 bg-green-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-green-500 uppercase tracking-wider">
            Coming Day 30
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            &middot; Free for the first year &middot; Join waitlist
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          ChatBase &mdash;{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            WhatsApp AI for Indian SMBs
          </span>
        </h1>

        <p
          className="text-base max-w-xl mx-auto mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Your WhatsApp handles 200+ customer messages a day -- manually. ChatBase puts an AI
          agent on your number that answers questions, books appointments, and takes orders
          around the clock. You get notified only when a human touch is genuinely needed.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <a
            href="#waitlist"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors text-sm"
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
            Browse SKILON
          </Link>
        </div>

        {/* Response-time badge */}
        <div
          className="inline-flex items-center gap-3 text-sm font-mono rounded-xl px-4 py-3 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <span style={{ color: "#22c55e" }}>&#9658;</span>
          <span style={{ color: "var(--text-muted)" }}>
            &quot;Do you have a red kurta in size M under &#x20B9;800?&quot; &rarr;{" "}
          </span>
          <span className="text-green-500">answered in 400ms</span>
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
              <div className="text-2xl font-bold text-green-500">{value}</div>
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
        <p className="text-xs text-green-400 font-medium uppercase tracking-widest mb-2 text-center">
          Core capabilities
        </p>
        <h2 className="text-2xl font-bold text-center mb-8">What the bot handles for you</h2>
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
          <p className="text-xs text-green-400 font-medium uppercase tracking-widest mb-2 text-center">
            Real scenarios
          </p>
          <h2 className="text-2xl font-bold text-center mb-8">
            Works for the businesses that run on WhatsApp
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
            <p className="text-xs text-green-400 font-medium uppercase tracking-widest mb-2">
              How it works
            </p>
            <h2 className="text-2xl font-bold mb-3">
              Every message.
              <br />
              Classified in 500ms.
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              You upload your product catalog, pricing, FAQs, and business hours once -- plain
              text, PDF, or Google Sheet. The bot reads it, indexes it, and answers from it.
              When it is confident, it replies. When it is not, it routes to you with a summary
              of the conversation so far.
            </p>
            <div className="space-y-2.5">
              {[
                "No flow diagrams to configure. Upload knowledge base, go live.",
                "Confidence threshold you control (default 75%). Below it: human inbox.",
                "All conversation history stored. Review what the bot said, correct it.",
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Dark code block -- same aesthetic as P01 hero */}
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
                message-handler.ts
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
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] mb-5 border border-green-500/30 bg-green-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-green-500 uppercase tracking-wider">
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
            We&apos;re starting with 50 Indian businesses in the first cohort -- salons, clinics,
            restaurants, D2C brands. Drop your email and we&apos;ll reach out when your slot opens.
          </p>

          <WaitlistForm />

          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            No credit card. No obligation. No Meta API headaches -- we handle the setup.
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
              <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center">
                <MessageCircle size={11} className="text-white" />
              </div>
              <span className="font-semibold text-sm">ChatBase</span>
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
              <Link href="/legal/terms" className="hover:text-green-400 transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-green-400 transition-colors">
                Privacy
              </Link>
              <Link href="/" className="hover:text-green-400 transition-colors">
                SKILON
              </Link>
              <a
                href="mailto:support@addonweb.io"
                className="hover:text-green-400 transition-colors"
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
