"use client";

/**
 * ConnectOne -- IoT Plug-and-Play Platform
 * Route: /connectone on addon90days.vercel.app
 *
 * Component tree:
 *   ConnectOnePage
 *     HeroBadge + HeroHeading + CTAs
 *     StatsBar
 *     WhatItDoes (4 feature cards)
 *     ICPExamples (4 industry vertical cards)
 *     HowItWorks (prose + dark code block -- Modbus/MQTT bridge config)
 *     WaitlistForm (email capture -> POST /api/p05-waitlist)
 *     Footer
 *
 * Design: identical CSS variable system as P01/P02. Accent: cyan #06b6d4.
 * Tone: enterprise-grade. No payment UI. Waitlist-only. Pilot programs framing.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Activity,
  LayoutDashboard,
  Bell,
  CheckCircle,
  AlertCircle,
  Factory,
  Droplets,
  Wheat,
  Thermometer,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ACCENT = "#06b6d4";

const STATS = [
  { value: "<4h",    label: "Sensor-to-dashboard time" },
  { value: "0",      label: "Firmware engineers needed" },
  { value: "MQTT",   label: "Open protocol, no lock-in" },
  { value: "Free",   label: "During pilot program" },
];

const FEATURES = [
  {
    icon: Cpu,
    title: "Pre-flashed ESP32 + Modbus gateway hardware",
    description:
      "Hardware ships pre-loaded with ConnectOne firmware. Plug the Modbus gateway into your RS-485 bus, connect the ESP32 to Wi-Fi, and the device appears in your dashboard. No custom firmware development. No JTAG programmer.",
    color: ACCENT,
  },
  {
    icon: Activity,
    title: "AI anomaly detection on telemetry",
    description:
      "Claude-powered anomaly scoring runs continuously against your sensor stream. Deviations from learned baselines trigger scored alerts with probable cause. Not threshold rules -- statistical learning on your actual operating profile.",
    color: "#8b5cf6",
  },
  {
    icon: LayoutDashboard,
    title: "Low-code dashboards",
    description:
      "Drag-and-drop chart builder. Temperature trends, flow rates, pressure differentials, custom calculated fields. Export to PDF for weekly operational reports. No BI tool license required.",
    color: "#f59e0b",
  },
  {
    icon: Bell,
    title: "Alerts to WhatsApp / Telegram / SMS",
    description:
      "Define alert conditions in plain language. 'Notify the plant manager on WhatsApp if chiller outlet temperature exceeds 42C for more than 5 minutes.' No code. Delivered in under 30 seconds of breach.",
    color: "#22c55e",
  },
];

const ICP_EXAMPLES = [
  {
    type: "Manufacturing",
    icon: Factory,
    color: ACCENT,
    scenario:
      "A 120-person auto-parts plant retrofits 8 CNC machines with vibration + temperature sensors in one afternoon. The operations manager sees live OEE scores on his phone. No PLC programmer involved.",
  },
  {
    type: "Water & Energy Utilities",
    icon: Droplets,
    color: "#3b82f6",
    scenario:
      "A municipal water utility adds flow and pressure monitoring across 12 pump stations using Modbus RTU sensors already installed. ConnectOne bridges them to a central dashboard. No SCADA upgrade required.",
  },
  {
    type: "Agritech",
    icon: Wheat,
    color: "#84cc16",
    scenario:
      "A 500-acre greenhouse operator monitors soil moisture, EC, and ambient CO2 from a single dashboard. WhatsApp alerts fire if any zone drops below setpoint during night hours when staff are off-site.",
  },
  {
    type: "Cold-Chain Logistics",
    icon: Thermometer,
    color: "#f97316",
    scenario:
      "A pharmaceutical distributor tracks temperature and humidity inside 40 refrigerated trucks via cellular-connected ESP32 units. Excursion events are timestamped, GPS-tagged, and exportable for regulatory audit.",
  },
];

// Modbus -> MQTT bridge configuration sample -- enterprise technical credibility
const CODE_SNIPPET = [
  "# ConnectOne bridge config (connectone.yaml)",
  "# Reads Modbus RTU registers -> publishes to MQTT broker",
  "",
  "device:",
  "  id: plant-chiller-01",
  "  transport: modbus_rtu",
  "  port: /dev/ttyUSB0",
  "  baud: 9600",
  "  slave_id: 1",
  "",
  "registers:",
  "  - name: outlet_temp_c",
  "    address: 0x0001",
  "    type: float32",
  "    scale: 0.1",
  "  - name: inlet_pressure_bar",
  "    address: 0x0003",
  "    type: float32",
  "    scale: 0.01",
  "",
  "mqtt:",
  "  broker: mqtt.connectone.io",
  "  topic_prefix: factory/{device_id}/telemetry",
  "  interval_sec: 10",
  "",
  "# That is all. Dashboard auto-discovers channels on first publish.",
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
      const res = await fetch("/api/p05-waitlist", {
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
        style={{ borderColor: `${ACCENT}80`, backgroundColor: `${ACCENT}18`, color: ACCENT }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        You&apos;re registered for the ConnectOne pilot program. We will reach out with onboarding details.
      </div>
    );
  }

  if (state === "duplicate") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 border text-sm"
        style={{ borderColor: `${ACCENT}50`, backgroundColor: `${ACCENT}10`, color: ACCENT }}
        role="status"
      >
        <CheckCircle size={16} className="shrink-0" />
        Already registered. We have your details -- you will be contacted when your pilot slot opens.
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
          placeholder="your@company.com"
          disabled={state === "loading"}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-60 transition-colors"
          style={{
            backgroundColor: "var(--bg-s2)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          aria-label="Work email address for ConnectOne pilot program"
        />
        <button
          type="submit"
          disabled={state === "loading" || !email.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-opacity hover:opacity-90 text-sm whitespace-nowrap"
          style={{ backgroundColor: ACCENT }}
        >
          {state === "loading" ? (
            "Registering..."
          ) : (
            <>
              Register for pilot <ArrowRight size={13} />
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

function ConnectOnePage() {
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
            Pilots Opening Day 60
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            &middot; Free during pilot &middot; Limited slots
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          ConnectOne &mdash;{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #8b5cf6 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Industrial IoT without the integration project
          </span>
        </h1>

        <p
          className="text-base max-w-xl mx-auto mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Pre-flashed ESP32 hardware and a Modbus gateway ship to your facility. Plug into your
          RS-485 bus. Connect to Wi-Fi. Telemetry appears in a live dashboard in under four hours.
          No firmware engineer. No SCADA project. No systems integrator invoice.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <a
            href="#waitlist"
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-opacity hover:opacity-90 text-sm"
            style={{ backgroundColor: ACCENT }}
          >
            Register for pilot <ArrowRight size={14} />
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
            ESP32 + Modbus RTU &rarr; MQTT &rarr; dashboard &rarr;{" "}
          </span>
          <span style={{ color: ACCENT }}>live in &lt;4 hours</span>
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
          From sensor to insight. No integration project.
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
            Target verticals
          </p>
          <h2 className="text-2xl font-bold text-center mb-8">
            Built for industrial SMBs across India and SE Asia
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
              Open protocol.
              <br />
              Zero lock-in.
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              ConnectOne uses standard Modbus RTU over RS-485 -- the protocol already running in
              your PLCs, VFDs, and sensors. The bridge config file is plain YAML that your
              maintenance engineer can read and modify. We do not require proprietary gateways,
              cloud-locked hardware, or ongoing professional services engagements.
            </p>
            <div className="space-y-2.5">
              {[
                "Modbus RTU, Modbus TCP, and MQTT natively supported.",
                "All data stays in your Supabase instance -- you own the schema.",
                "Pilot programs include white-glove onboarding and NDA on request.",
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
                connectone.yaml
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
              Pilots Opening Day 60
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Join the pilot program.
            <br />
            Complimentary for early facilities.
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            We are selecting 10 industrial facilities for the first cohort -- manufacturing, utilities,
            agritech, and cold-chain. Pilot participants receive hardware at cost, white-glove
            onboarding, and a case study report on operational impact. NDA available on request.
          </p>

          <WaitlistForm />

          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            No commitment. No vendor lock-in. Hardware uses open Modbus and MQTT protocols.
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
                <Cpu size={11} className="text-white" />
              </div>
              <span className="font-semibold text-sm">ConnectOne</span>
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
              <Link href="/machineguard" className="transition-colors hover:opacity-80">
                MachineGuard
              </Link>
              <Link href="/" className="transition-colors hover:opacity-80">
                SKILON
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

export default ConnectOnePage;
