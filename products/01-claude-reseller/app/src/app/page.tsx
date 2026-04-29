import Link from "next/link";
import { ArrowRight, Terminal, Zap, Shield, Package, ExternalLink } from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const STATS = [
  { value: "130+", label: "Skills" },
  { value: "11",   label: "Categories" },
  { value: "Free", label: "Starter tier" },
  { value: "Daily", label: "New skills" },
];

const CATEGORIES = [
  { key: "ai-llm",                  emoji: "🤖", label: "AI & LLM",           color: "#8b5cf6" },
  { key: "iot",                     emoji: "📡", label: "IoT & Hardware",      color: "#06b6d4" },
  { key: "developer-tools",         emoji: "⚡", label: "Developer Tools",     color: "#f59e0b" },
  { key: "startup-product",         emoji: "🚀", label: "Startup & Product",   color: "#ec4899" },
  { key: "ui-ux",                   emoji: "🎨", label: "UI/UX Design",        color: "#10b981" },
  { key: "indian-business",         emoji: "🇮🇳", label: "Indian Business",   color: "#f97316" },
  { key: "data-analytics",          emoji: "📊", label: "Data & Analytics",    color: "#3b82f6" },
  { key: "devops-infra",            emoji: "🛠", label: "DevOps & Infra",      color: "#6366f1" },
  { key: "communication-protocols", emoji: "🔗", label: "Protocols",           color: "#14b8a6" },
  { key: "marketing-growth",        emoji: "📈", label: "Marketing & Growth",  color: "#f43f5e" },
  { key: "trading-finance",         emoji: "📉", label: "Trading & Finance",   color: "#eab308" },
];

const FEATURED_SKILLS = [
  { slug: "invoice-generator",         title: "Invoice Generator",          tagline: "GST-compliant invoices in seconds. Supports multi-item, HSN codes, and PDF export.", category: "Indian Business", color: "#f97316", free: true,  steps: 4 },
  { slug: "sql-query-builder",         title: "SQL Query Builder",          tagline: "Natural language to optimised SQL. Supports joins, CTEs, window functions.",           category: "Developer Tools", color: "#f59e0b", free: false, steps: 3 },
  { slug: "esp32-firmware-scaffold",   title: "ESP32 Firmware Scaffold",    tagline: "FreeRTOS boilerplate with MQTT, OTA updates, and power management baked in.",         category: "IoT & Hardware",  color: "#06b6d4", free: false, steps: 6 },
  { slug: "stock-screener-ai",         title: "AI Stock Screener",          tagline: "Scan BSE/NSE with technical + fundamental filters. Exports to Google Sheets.",        category: "Trading & Finance",color: "#eab308", free: false, steps: 5 },
  { slug: "pr-description",            title: "PR Description Writer",      tagline: "Auto-generates structured PR descriptions from git diff. Markdown-ready.",            category: "Developer Tools", color: "#f59e0b", free: true,  steps: 2 },
  { slug: "product-roadmap-generator", title: "Product Roadmap Generator",  tagline: "RICE-scored roadmap from problem statement + user goals. Exports to Notion.",         category: "Startup & Product",color: "#ec4899", free: false, steps: 4 },
];

const PACKS = [
  {
    id: "iot-developer-pack",
    accentHex: "#06b6d4",
    name: "IoT Developer Pack",
    price: "₹4,067",
    tag: "Hardware engineers",
    skills: ["esp32-firmware-scaffold", "mqtt-iot-setup", "coap-iot-protocol", "modbus-rtu-tcp"],
    desc: "ESP32 FreeRTOS firmware, MQTT broker, CoAP, Modbus for industrial IoT.",
  },
  {
    id: "developer-productivity-pack",
    accentHex: "#8b5cf6",
    name: "Developer Productivity Pack",
    price: "₹2,407",
    tag: "Most popular",
    skills: ["sql-query-builder", "data-schema-designer", "wireframe-spec-to-code", "product-roadmap-generator"],
    desc: "NL→SQL, schema design, wireframe-to-React, and RICE-scored product roadmaps.",
  },
  {
    id: "trading-pack",
    accentHex: "#eab308",
    name: "Trading & Finance Pack",
    price: "₹5,999",
    tag: "Traders & quants",
    skills: ["stock-screener-ai", "options-strategy-builder", "algo-trading-scaffold", "backtesting-framework"],
    desc: "AI stock screener, options strategy builder, Zerodha Kite algo scaffold, and backtesting.",
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

// ---------------------------------------------------------------------------
// Page — no Nav (sidebar in layout handles navigation)
// ---------------------------------------------------------------------------

export default function HomePage() {
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
          className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs mb-8"
          style={{
            backgroundColor: "var(--bg-s2)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          New skills added daily · 130+ production-ready skills live now
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
          The AI skills marketplace{" "}
          <span className="text-gradient-violet">
            that ships real work
          </span>
        </h1>

        <p
          className="text-base max-w-xl mx-auto mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          130+ skills across IoT, trading, developer tools, Indian business, and more.
          Step-by-step guides. Copy-paste code. Runs in Claude Code, your API, or the MCP server.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <Link
            href="/skills"
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
          >
            Browse Marketplace <ArrowRight size={14} />
          </Link>
          <a
            href="https://github.com/addonwebsolutionsai-droid/addon90days"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <Terminal size={14} /> View on GitHub
          </a>
        </div>

        {/* Install command badge */}
        <div
          className="inline-flex items-center gap-3 text-sm font-mono rounded-xl px-4 py-3 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>$</span>
          <span className="text-green-500">npm install @addonweb/claude-toolkit</span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS BAR                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="border-y py-6"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold">{value}</div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CATEGORY GRID                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2 text-center">
          Browse by category
        </p>
        <h2 className="text-2xl font-bold text-center mb-8">11 categories. One toolkit.</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {CATEGORIES.map(({ key, emoji, label, color }) => (
            <Link
              key={key}
              href={`/skills?category=${key}`}
              className="flex items-center gap-2.5 rounded-xl p-3.5 border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                {emoji}
              </span>
              <span className="text-xs font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                {label}
              </span>
            </Link>
          ))}
          <Link
            href="/skills"
            className="flex items-center gap-2.5 rounded-xl p-3.5 border border-dashed transition-all hover:border-violet-500/50"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <ArrowRight size={13} className="text-violet-400" />
            </span>
            <span className="text-xs font-medium">View all</span>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURED SKILLS                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="py-12 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2 text-center">
            Featured skills
          </p>
          <h2 className="text-2xl font-bold text-center mb-8">Top picks this week</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FEATURED_SKILLS.map((skill) => (
              <Link
                key={skill.slug}
                href={`/skills/${skill.slug}`}
                className="group flex flex-col rounded-xl border p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                  borderLeftColor: skill.color,
                  borderLeftWidth: "3px",
                }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color: skill.color, backgroundColor: `${skill.color}15` }}
                  >
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-s2)" }}
                    >
                      {skill.steps}s
                    </span>
                    {skill.free && (
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-green-500/15 text-green-500">
                        Free
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                  {skill.title}
                </h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                  {skill.tagline}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-violet-400 group-hover:text-violet-300 transition-colors font-medium">
                  View skill <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:border-violet-500/50"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Browse all 130+ skills <ExternalLink size={13} />
            </Link>
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
            <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2">
              How it works
            </p>
            <h2 className="text-2xl font-bold mb-3">One function call.<br />Real output.</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Every skill has a typed Zod schema. Pass structured input, get structured output.
              No prompt engineering. No parsing. Works in any Node.js project.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Shield size={14} className="text-green-500 shrink-0" />
                Input validated before any API call
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Package size={14} className="text-violet-400 shrink-0" />
                Output parsed against typed schema
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Zap size={14} className="text-amber-400 shrink-0" />
                Step-by-step guide with every skill
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "#0f0f12",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="text-xs font-mono ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                invoice.ts
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
      {/* PRICING / PACKS                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="pricing"
        className="py-12 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2 text-center">
            Pricing
          </p>
          <h2 className="text-2xl font-bold text-center mb-8">Pick what you need</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {PACKS.map((pack) => (
              <div
                key={pack.id}
                className="rounded-xl border p-5 flex flex-col"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
                    style={{ color: pack.accentHex, backgroundColor: `${pack.accentHex}15` }}
                  >
                    {pack.tag}
                  </span>
                  <span className="text-base font-bold">{pack.price}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{pack.name}</h3>
                <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: "var(--text-muted)" }}>
                  {pack.desc}
                </p>
                <div className="space-y-1 mb-5">
                  {pack.skills.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: pack.accentHex }}>›</span>
                      <code>{s}</code>
                    </div>
                  ))}
                </div>
                <Link
                  href="/skills"
                  className="text-center py-2 rounded-lg text-sm font-medium transition-colors border"
                  style={{ borderColor: `${pack.accentHex}40`, color: pack.accentHex }}
                >
                  Buy pack
                </Link>
              </div>
            ))}
          </div>

          {/* All-Access banner */}
          <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 via-yellow-900/5 to-pink-900/15 p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1">
                Best value · Most popular
              </div>
              <h3 className="text-lg font-bold mb-1">All-Access — ₹2,407/mo</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                130+ skills and growing. Trading strategies, IoT, GST, AI — everything.
                New skills added daily, no extra charge.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="shrink-0 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
            >
              Start All-Access
            </Link>
          </div>
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
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <Zap size={11} className="text-white" />
              </div>
              <span className="font-semibold text-sm">Claude Toolkit</span>
            </div>
            <div className="flex items-center gap-5 text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/legal/terms"    className="hover:text-violet-400 transition-colors">Terms</Link>
              <Link href="/legal/privacy"  className="hover:text-violet-400 transition-colors">Privacy</Link>
              <a href="https://github.com/addonwebsolutionsai-droid/addon90days" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">GitHub</a>
              <a href="mailto:support@addonweb.io" className="hover:text-violet-400 transition-colors">support@addonweb.io</a>
            </div>
          </div>
          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 AddonWeb Solutions · Ahmedabad, India
          </p>
        </div>
      </footer>
    </div>
  );
}
