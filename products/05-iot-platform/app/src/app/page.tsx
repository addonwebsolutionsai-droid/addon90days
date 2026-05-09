/**
 * ConnectOne — IoT Plug-and-Play Platform marketing landing page.
 *
 * Pre-launch placeholder. Email capture only — full landing page comes after
 * the MVP backend is wired up. The "Coming soon" framing is intentional:
 * we want a small list of interested device-maker prospects before going live.
 */

import Link from "next/link";
import { ArrowRight, Zap, Cpu, Layers } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Aurora gradient blobs */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.4) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(59,130,246,0.3) 0%, transparent 60%)",
        }}
      />

      {/* Sticky nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
          >
            <Cpu size={18} className="text-white" />
          </span>
          <span className="font-bold text-lg tracking-tight">ConnectOne</span>
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
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
          >
            Early access
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-12 pb-24 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "rgba(6,182,212,0.1)", color: "#06b6d4" }}
          >
            <Zap size={12} /> Coming soon · Early-access list open
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Stop building IoT backends from scratch.
          </h1>

          <p className="text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            ConnectOne is a plug-and-play platform for device makers. MQTT broker, multi-tenant
            fleet management, white-label mobile apps, and admin consoles — all working on day one.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
            >
              Join early access <ArrowRight size={16} />
            </Link>
            <Link
              href="https://github.com/addonwebsolutionsai-droid/addon90days"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              See the roadmap
            </Link>
          </div>
        </div>

        {/* Quick value props */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Feature
            icon={<Cpu size={20} style={{ color: "#06b6d4" }} />}
            title="MQTT + provisioning, ready"
            body="EMQX broker with multi-tenant topic isolation, certificate-based device auth, and QR/BLE/Wi-Fi provisioning flows."
          />
          <Feature
            icon={<Layers size={20} style={{ color: "#3b82f6" }} />}
            title="Three-role access built-in"
            body="Platform super-admin, vendor-admin (your SKU fleet), end-user (device owner). Most platforms half-bake this. We don't."
          />
          <Feature
            icon={<Zap size={20} style={{ color: "#06b6d4" }} />}
            title="White-label mobile, fast"
            body="React Native template that brands itself per vendor. Your customers ship apps in days, not months of build."
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
            <Link href="/sign-up" className="hover:underline">Early access</Link>
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
        style={{ backgroundColor: "rgba(6,182,212,0.1)" }}
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
