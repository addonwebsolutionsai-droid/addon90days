"use client";

/**
 * MachineGuard -- IoT Predictive Maintenance
 * Route: /machineguard on addon90days.vercel.app
 *
 * Component tree:
 *   MachineGuardPage
 *     HeroBadge + HeroHeading + CTAs
 *     StatsBar
 *     WhatItDoes (4 feature cards)
 *     ICPExamples (4 industry vertical cards)
 *     HowItWorks (prose + dark code block -- sample anomaly JSON payload)
 *     WaitlistForm (email capture -> POST /api/p06-waitlist)
 *     Footer
 *
 * Design: identical CSS variable system as P01/P02. Accent: indigo #6366f1.
 * Tone: enterprise-grade. No payment UI. Waitlist-only. Pilot ROI study framing.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Brain,
  AlertTriangle,
  Network,
  CheckCircle,
  AlertCircle,
  Cog,
  Building2,
  TrendingDown,
  Wrench,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ACCENT = "#6366f1";

const STATS = [
  { value: "70%",   label: "Unplanned downtime reduction target" },
  { value: "1",     label: "Sensor per machine to start" },
  { value: "3-modal", label: "Vibration + thermal + acoustic AI" },
  { value: "Free",  label: "During pilot program" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Single-sensor multi-modal AI",
    description:
      "One sensor captures vibration, surface temperature, and acoustic signatures simultaneously. A single Claude-powered model ingests all three channels and produces a unified health score per machine. No fleet of specialized sensors.",
    color: ACCENT,
  },
  {
    icon: Shield,
    title: "Real-time anomaly scoring",
    description:
      "Each telemetry packet receives an anomaly score (0-100) against a learned baseline. Scores above configurable thresholds trigger structured alerts with confidence level and time-to-failure estimate window.",
    color: "#8b5cf6",
  },
  {
    icon: AlertTriangle,
    title: "Root-cause classification",
    description:
      "Beyond anomaly detection, the model classifies probable fault type: bearing wear, shaft imbalance, belt slip, thermal overload, lubrication failure. Maintenance teams arrive with the right parts, not just a work order.",
    color: "#f59e0b",
  },
  {
    icon: Network,
    title: "ERP and CMMS integration via ConnectOne",
    description:
      "MachineGuard connects to SAP PM, Tally, Oracle EAM, and custom CMMS systems through the ConnectOne IoT platform. Maintenance work orders are created automatically. Downtime and repair cost tracked end-to-end.",
    color: "#22c55e",
  },
];

const ICP_EXAMPLES = [
  {
    type: "Discrete Manufacturing",
    icon: Cog,
    color: ACCENT,
    scenario:
      "A 300-person precision engineering plant monitors 24 CNC spindles. MachineGuard detects bearing wear 72 hours before failure on a high-value machine. Planned replacement during scheduled maintenance. Zero unplanned stoppage.",
  },
  {
    type: "Process Industry",
    icon: Building2,
    color: "#8b5cf6",
    scenario:
      "A chemical plant runs centrifugal pumps 24/7. Acoustic anomaly scoring catches cavitation onset on a critical transfer pump. Operations team replaces impeller during the next planned shutdown. Avoided: catastrophic seal failure and 4-day unplanned outage.",
  },
  {
    type: "Cost-Reduction Mandate",
    icon: TrendingDown,
    color: "#f59e0b",
    scenario:
      "A Mexico-based auto-parts supplier under OEM cost pressure needs to cut maintenance spend 20% without increasing downtime risk. MachineGuard shifts them from scheduled-replacement to condition-based maintenance. Parts spend drops 22% in the first quarter.",
  },
  {
    type: "Maintenance Team Uplift",
    icon: Wrench,
    color: "#22c55e",
    scenario:
      "An Eastern European food processing plant has three maintenance technicians covering 80 machines. MachineGuard triages the entire fleet automatically. Technicians act only on scored alerts, in priority order. Effective coverage improves without headcount.",
  },
];

// Sample anomaly detection JSON payload -- demonstrates technical substance
const CODE_SNIPPET = [
  "// MachineGuard telemetry event (per 10-second window)",
  "{",
  '  "device_id":       "spindle-cnc-07",',
  '  "timestamp":       "2026-05-01T06:42:10Z",',
  '  "health_score":    31,',
  '  "anomaly":         true,',
  '  "confidence":      0.91,',
  '  "fault_class":     "bearing_wear",',
  '  "ttf_hours":       "48-96",',
  '  "channels": {',
  '    "vibration_rms":   4.72,    // mm/s  -- ISO 10816 zone C',
  '    "surface_temp_c":  68.3,    // +12C above 30-day baseline',
  '    "acoustic_db":     83.1     // +7dB above idle signature',
  "  },",
  '  "recommended_action": "Schedule bearing replacement before next shift"',
  "}",
  "",
  "// Downstream: SAP PM work order auto-created via ConnectOne",
].join("\n");

// ---------------------------------------------------------------------------
// Types
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
      const res = await fetch("/api/p06-waitlist", {
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
        style={{ borderColor: `${ACCENT}50`, backgroundColor: `${ACCENT}12`, color: ACCENT }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        You&apos;re registered for the MachineGuard pilot ROI study. Our team will contact you within 48 hours.
      </div>
    );
  }

  if (state === "duplicate") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 border text-sm"
        style={{ borderColor: `${ACCENT}30`, backgroundColor: `${ACCENT}08`, color: ACCENT }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        Already registered. You will be contacted when your pilot slot is confirmed.
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
          placeholder="cto@yourplant.com"
          disabled={state === "loading"}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 transition-colors"
          style={{
            backgroundColor: "var(--bg-s2)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          aria-label="Work email address for MachineGuard pilot ROI study"
        />
        <button
          type="submit"
          disabled={state === "loading" || !email.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
          style={{ backgroundColor: ACCENT }}
        >
          {state === "loading" ? (
            "Registering..."
          ) : (
            <>
              Apply for pilot <ArrowRight size={13} />
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

function MachineGuardPage() {
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
          style={{ borderColor: `${ACCENT}40`, backgroundColor: `${ACCENT}12` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: ACCENT }}
          />
          <span
            className="font-semibold uppercase tracking-wider"
            style={{ color: ACCENT }}
          >
            Pilots Opening Day 75
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            &middot; ROI study included &middot; Limited cohort
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          MachineGuard &mdash;{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #8b5cf6 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Predict failures before they stop your line
          </span>
        </h1>

        <p
          className="text-base max-w-xl mx-auto mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          A single sensor per machine captures vibration, thermal, and acoustic signals simultaneously.
          Claude-powered AI learns your machine&apos;s baseline and scores anomalies in real time --
          classifying fault type and estimating time-to-failure window. Maintenance teams act on
          intelligence, not schedules.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <a
            href="#waitlist"
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-opacity hover:opacity-90 text-sm"
            style={{ backgroundColor: ACCENT }}
          >
            Apply for pilot <ArrowRight size={14} />
          </a>
          <Link
            href="/connectone"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            See ConnectOne platform
          </Link>
        </div>

        {/* Technical proof badge */}
        <div
          className="inline-flex items-center gap-3 text-sm font-mono rounded-xl px-4 py-3 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <span style={{ color: ACCENT }}>&#9658;</span>
          <span style={{ color: "var(--text-muted)" }}>
            health_score: 31 &middot; fault_class: bearing_wear &middot; ttf:{" "}
          </span>
          <span style={{ color: ACCENT }}>48-96 hours</span>
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
              <div className="text-2xl font-bold" style={{ color: ACCENT }}>{value}</div>
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
          Platform capabilities
        </p>
        <h2 className="text-2xl font-bold text-center mb-8">
          From sensor signal to maintenance action.
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
            Where it creates value
          </p>
          <h2 className="text-2xl font-bold text-center mb-8">
            Built for industrial operations under cost and reliability pressure
          </h2>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {ICP_EXAMPLES.map(({ type, icon: Icon, color, scenario }) => (
              <div
                key={type}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
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
              Structured intelligence.
              <br />
              Not just alerts.
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              Each telemetry event produces a structured JSON payload: health score, anomaly flag,
              fault classification, and a time-to-failure estimate window. The payload drives
              downstream actions automatically -- WhatsApp notification to plant manager, SAP PM
              work order creation, CMMS ticket. Your maintenance team receives ranked priorities,
              not an undifferentiated alarm flood.
            </p>
            <div className="space-y-2.5">
              {[
                "Baseline learning period: 7-14 days on your actual operating profile.",
                "Pilot ROI study: we document downtime avoided and parts cost delta in case study format.",
                "White-glove onboarding: AddonWeb engineer on-site or remote for sensor placement and calibration.",
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
                anomaly-event.json
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
            style={{ borderColor: `${ACCENT}40`, backgroundColor: `${ACCENT}10` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: ACCENT }}
            />
            <span
              className="font-semibold uppercase tracking-wider"
              style={{ color: ACCENT }}
            >
              Pilots Opening Day 75
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Apply for the pilot ROI study.
            <br />
            Complimentary for the first cohort.
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            We are selecting 8 manufacturing or process industry facilities for the first pilot cohort.
            Participants receive white-glove sensor deployment, a structured ROI analysis in
            case study format, and priority access to the commercial release. NDA available.
            India, Mexico, and Eastern Europe facilities preferred for this cohort.
          </p>

          <WaitlistForm />

          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            No vendor lock-in. Sensor data stored in your own cloud instance. Pilot agreement available for review on request.
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
                <Shield size={11} className="text-white" />
              </div>
              <span className="font-semibold text-sm">MachineGuard</span>
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
              <Link href="/legal/terms" className="transition-colors hover:opacity-80">
                Terms
              </Link>
              <Link href="/legal/privacy" className="transition-colors hover:opacity-80">
                Privacy
              </Link>
              <Link href="/connectone" className="transition-colors hover:opacity-80">
                ConnectOne
              </Link>
              <Link href="/" className="transition-colors hover:opacity-80">
                Claude Toolkit
              </Link>
              <a
                href="mailto:iot@addonweb.io"
                className="transition-colors hover:opacity-80"
              >
                iot@addonweb.io
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

export default MachineGuardPage;
