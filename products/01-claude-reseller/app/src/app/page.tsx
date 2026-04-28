import Link from "next/link";
import { ArrowRight, Terminal, Zap, Shield, Package } from "lucide-react";

const STATS = [
  { value: "10", label: "Skills" },
  { value: "3", label: "Packs" },
  { value: "Free", label: "Gemini tier" },
  { value: "1-line", label: "Install" },
];

const PACKS = [
  {
    id: "iot-developer-pack",
    accentHex: "#06b6d4",
    name: "IoT Developer Pack",
    price: "₹4,067",
    tag: "Hardware engineers",
    skills: ["iot-firmware-scaffold", "iot-device-registry-schema", "iot-ota-pipeline"],
    desc: "ESP32/STM32 firmware scaffold, TimescaleDB fleet schema, atomic OTA with staged rollout.",
  },
  {
    id: "developer-productivity-pack",
    accentHex: "#8b5cf6",
    name: "Developer Productivity Pack",
    price: "₹2,407",
    tag: "Most popular",
    skills: ["code-reviewer", "sql-query-builder", "test-generator", "pr-description"],
    desc: "Security-focused code review, NL→SQL, test generation, and PR descriptions from git diffs.",
  },
  {
    id: "smb-operations-pack",
    accentHex: "#22c55e",
    name: "SMB Operations Pack",
    price: "₹2,407",
    tag: "Indian businesses",
    skills: ["invoice-generator", "gst-calculator", "email-drafter"],
    desc: "GST-compliant invoices, CGST/SGST/IGST calculator, professional email drafting.",
  },
];

const CODE_SNIPPET = `import { invoiceGenerator, runSkill } from "@addonweb/claude-toolkit"

const result = await runSkill(invoiceGenerator, {
  sellerName: "AddonWeb Solutions",
  buyerName: "Acme Corp",
  invoiceNumber: "INV-2026-001",
  lineItems: [{
    description: "Software License",
    quantity: 1, unit: "Nos",
    ratePerUnit: 50000, gstRate: 18
  }],
  currency: "INR"
})
// result.data.summary →
// { subtotal: 50000, totalGst: 9000, totalAmount: 59000 }`;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07070a] text-white">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 backdrop-blur-md bg-[#07070a]/80 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={13} />
          </div>
          <span className="font-semibold text-sm">Claude Toolkit</span>
          <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-mono">v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/skills" className="text-sm text-white/50 hover:text-white transition-colors">Skills</Link>
          <Link href="/sign-in" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
          <Link href="/sign-up" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Built by practitioners who run a 13-agent AI company
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Production-ready{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            Claude Skills
          </span>
          <br />for real work
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
          10 skills across IoT, developer tooling, and Indian business ops.
          One npm install. Runs in Claude Code, your API, or the MCP server.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
          <Link href="/skills" className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors">
            Browse skill packs <ArrowRight size={15} />
          </Link>
          <a href="https://github.com/addonwebsolutionsai-droid/addon90days" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors text-sm">
            <Terminal size={15} /> View on GitHub
          </a>
        </div>

        <div className="bg-[#0f0f12] border border-white/5 rounded-xl p-4 inline-flex items-center gap-3 text-sm font-mono">
          <span className="text-white/30">$</span>
          <span className="text-green-400">npm install @addonweb/claude-toolkit</span>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 py-8">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Code + explainer */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-bold mb-4">One function call.<br />Real output.</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Every skill has a typed Zod schema. Pass structured input, get structured output.
              No prompt engineering. No parsing. Works in any Node.js project.
            </p>
            <div className="flex items-center gap-3 text-sm text-white/40 mb-2">
              <Shield size={14} className="text-green-400 shrink-0" />
              Input validated before any API call
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <Package size={14} className="text-violet-400 shrink-0" />
              Output parsed against typed schema
            </div>
          </div>
          <div className="bg-[#0f0f12] rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="text-xs text-white/30 ml-2 font-mono">invoice.ts</span>
            </div>
            <pre className="p-5 text-xs font-mono text-white/80 overflow-x-auto leading-relaxed whitespace-pre">
              <code>{CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Packs */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-3 text-center">Skill packs</p>
        <h2 className="text-3xl font-bold text-center mb-10">Pick what you need</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {PACKS.map((pack) => (
            <div key={pack.id} className="bg-[#0f0f12] rounded-xl border border-white/5 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
                  style={{ color: pack.accentHex, background: `${pack.accentHex}15` }}>
                  {pack.tag}
                </span>
                <span className="text-lg font-bold">{pack.price}</span>
              </div>
              <h3 className="font-semibold mb-2">{pack.name}</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-5 flex-1">{pack.desc}</p>
              <div className="space-y-1.5 mb-6">
                {pack.skills.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-white/50">
                    <span style={{ color: pack.accentHex }}>›</span>
                    <code>{s}</code>
                  </div>
                ))}
              </div>
              <Link href={`/skills?buy=${pack.id}`}
                className="text-center py-2.5 rounded-lg text-sm font-medium transition-colors border"
                style={{ borderColor: `${pack.accentHex}40`, color: pack.accentHex }}>
                Buy pack
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-gradient-to-r from-violet-900/30 to-pink-900/20 rounded-xl border border-violet-500/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1">Best value</div>
            <h3 className="text-xl font-bold mb-1">All-Access — ₹2,407/mo</h3>
            <p className="text-white/40 text-sm">Every skill, current and future. API access included.</p>
          </div>
          <Link href="/sign-up"
            className="shrink-0 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm">
            Start All-Access
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        © 2026 AddonWeb Solutions · Ahmedabad, India ·{" "}
        <a href="mailto:support@addonweb.io" className="hover:text-white/50 transition-colors">support@addonweb.io</a>
      </footer>
    </main>
  );
}
