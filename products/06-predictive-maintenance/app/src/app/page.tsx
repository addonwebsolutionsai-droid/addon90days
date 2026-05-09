/**
 * MachineGuard — IoT Predictive Maintenance marketing landing page.
 *
 * Pre-launch placeholder. Email capture only — full landing page comes after
 * the pilot deployment with one Surat textile factory. The angle is concrete:
 * "₹50L–5Cr/year of unplanned motor downtime, predicted away."
 */

import Link from "next/link";
import { ArrowRight, Activity, Bell, Wrench } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,68,68,0.4) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(249,115,22,0.3) 0%, transparent 60%)",
        }}
      />

      <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }}
          >
            <Activity size={18} className="text-white" />
          </span>
          <span className="font-bold text-lg tracking-tight">MachineGuard</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }}
          >
            Pilot enquiry
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-12 pb-24 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          >
            <Bell size={12} className="animate-pulse-warn" /> Pilot deployment cohort open
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Predict motor failures 2–4 weeks before they stop production.
          </h1>

          <p className="text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Indian manufacturers lose ₹50L–5Cr/year to unplanned motor downtime. MachineGuard
            streams vibration + current + temperature data from every motor and scores risk in real
            time. We tell you which machine is sick before it stops.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }}
            >
              Request a pilot <ArrowRight size={16} />
            </Link>
            <Link
              href="https://github.com/addonwebsolutionsai-droid/addon90days"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              See the technical brief
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Feature
            icon={<Activity size={20} style={{ color: "#ef4444" }} />}
            title="Real-time vibration ML"
            body="Per-motor models trained on baseline + alarm signatures. Anomaly score every 60 seconds, alert before mechanical failure."
          />
          <Feature
            icon={<Bell size={20} style={{ color: "#f97316" }} />}
            title="Plant-floor alerts that work"
            body="WhatsApp, SMS, email, and dashboard alarms. Severity tiers. Routing rules so the right shift engineer hears about the right machine."
          />
          <Feature
            icon={<Wrench size={20} style={{ color: "#ef4444" }} />}
            title="Maintenance schedule built from data"
            body="Replace bearings when sensors say they need replacing — not on the calendar. Cuts spares spend 30–40% in pilot factories."
          />
        </div>
      </section>

      <footer
        className="relative z-10 px-6 py-12 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <div>© 2026 AddonWeb Solutions · Ahmedabad, India</div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hover:underline">Sign in</Link>
            <Link href="/sign-up" className="hover:underline">Pilot enquiry</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 border space-y-3"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>
    </div>
  );
}
