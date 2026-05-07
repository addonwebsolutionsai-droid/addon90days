import Link from "next/link";
import { ArrowRight, Terminal, Zap, Infinity as InfinityIcon, Shield, Package, ExternalLink, UserPlus } from "lucide-react";
import { SITE_BASE_URL } from "@/lib/site-config";
import { getCatalogTotal, formatSkillCount } from "@/lib/catalog-stats";

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

// Featured skills shown on the homepage. Slugs MUST exist in the live catalog
// (Supabase `skills` table) — broken links here surface as 404s for every
// landing-page visitor. If you add or rename, verify with:
//   curl -o /dev/null -w "%{http_code}" https://addon90days.vercel.app/skills/<slug>
const FEATURED_SKILLS = [
  { slug: "gst-invoice-generator",   title: "GST Invoice Generator",   tagline: "GST-compliant invoices with CGST/SGST/IGST calculations. Multi-item, HSN codes, PDF export.", category: "Indian Business",  color: "#f97316", free: true,  steps: 4 },
  { slug: "sql-query-builder",       title: "SQL Query Builder",       tagline: "Natural language to optimised SQL. Supports joins, CTEs, window functions.",                category: "Developer Tools",  color: "#f59e0b", free: false, steps: 3 },
  { slug: "esp32-firmware-scaffold", title: "ESP32 Firmware Scaffold", tagline: "FreeRTOS boilerplate with MQTT, OTA updates, and power management baked in.",               category: "IoT & Hardware",   color: "#06b6d4", free: false, steps: 6 },
  { slug: "stock-screener-ai",       title: "AI Stock Screener",       tagline: "Scan BSE/NSE with technical + fundamental filters. Exports to Google Sheets.",              category: "Trading & Finance",color: "#eab308", free: false, steps: 5 },
  { slug: "code-reviewer",           title: "Code Reviewer",           tagline: "Security-focused AI code review: OWASP top 10, type safety, performance.",                  category: "Developer Tools",  color: "#f59e0b", free: true,  steps: 3 },
  { slug: "product-roadmap-builder", title: "Product Roadmap Builder", tagline: "RICE-scored quarterly roadmap from goals and user feedback. Exports to Notion.",            category: "Startup & Product",color: "#ec4899", free: false, steps: 4 },
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

// Organization + WebSite JSON-LD — gives Google a stable identity for the
// brand (knowledge panel eligibility) and enables sitelinks search box.
function buildHomepageJsonLd(skillCountLabel: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SKILON",
      "alternateName": "SkilOn",
      "url": SITE_BASE_URL,
      "logo": `${SITE_BASE_URL}/opengraph-image`,
      "description": `Marketplace of ${skillCountLabel} production-ready Claude skills, MCP servers, and agent bundles. Free for the first year.`,
      "sameAs": [
        "https://github.com/addonwebsolutionsai-droid/addon90days",
        "https://www.npmjs.com/package/addonweb-claude-skills",
      ],
      "founder":      { "@type": "Organization", "name": "AddonWeb Solutions" },
      "areaServed":   { "@type": "Country",      "name": "Worldwide" },
      "foundingDate": "2026-04",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SKILON",
      "url": SITE_BASE_URL,
      "potentialAction": {
        "@type":  "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_BASE_URL}/skills?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export default async function HomePage() {
  const totalSkills = await getCatalogTotal();
  const skillCountLabel = formatSkillCount(totalSkills);
  const HOMEPAGE_JSON_LD = buildHomepageJsonLd(skillCountLabel);
  const STATS = [
    { value: skillCountLabel, label: "Skills" },
    { value: "11",            label: "Categories" },
    { value: "Free",          label: "Every skill" },
    { value: "Daily",         label: "New skills" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* JSON-LD: Organization + WebSite for Google brand panel + sitelinks search */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_JSON_LD) }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs mb-8 border border-green-500/30 bg-green-500/10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-green-500 uppercase tracking-wider">Live · {skillCountLabel} skills</span>
          <span style={{ color: "var(--text-muted)" }}>· every skill free · sign-in to install</span>
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
          {skillCountLabel} skills across IoT, trading, developer tools, Indian business, and more.
          Step-by-step guides. Copy-paste code. Runs in Claude Code, your API, or the MCP server.
          <span className="block mt-2 text-green-500 font-medium">Every skill is free. Sign in to install.</span>
        </p>

        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <Link
            href="/skills"
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
          >
            Browse Marketplace <ArrowRight size={14} />
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <UserPlus size={14} /> Create free account
          </Link>
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
          <span className="text-green-500">npx addonweb-claude-skills install &lt;skill-slug&gt;</span>
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
      {/* FEATURED INTEGRATIONS                                               */}
      {/* The infra we actually run on. Real tools, real usage = real        */}
      {/* credibility. No fake partner logos.                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="py-10 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-5 text-center">
            Powered by best-in-class infrastructure
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Anthropic",  role: "Claude AI engine" },
              { name: "Vercel",     role: "Hosting + Edge"   },
              { name: "Supabase",   role: "Database + Auth"  },
              { name: "Clerk",      role: "User management"  },
              { name: "Groq",       role: "Fast inference"   },
              { name: "PostHog",    role: "Analytics"        },
            ].map(({ name, role }) => (
              <div
                key={name}
                className="rounded-xl border px-4 py-3 text-center transition-all hover:border-violet-500/40"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor:     "var(--border-subtle)",
                }}
              >
                <div className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {name}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {role}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
            We use this stack ourselves to run a 13-agent AI factory in production. Skills are
            tested against the same infra you'll deploy on.
          </p>
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
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-s2)" }}
                      title={`${skill.steps} step${skill.steps === 1 ? "" : "s"}`}
                    >
                      {skill.steps} {skill.steps === 1 ? "step" : "steps"}
                    </span>
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
              Browse all {skillCountLabel} skills <ExternalLink size={13} />
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
      {/* BETA CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="get-started"
        className="py-14 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] mb-5 border border-green-500/30 bg-green-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-green-500 uppercase tracking-wider">Live now</span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            All {skillCountLabel} skills.<br />Free for the first year.
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Every skill, every install, every MCP call — free until you ship something we&apos;re proud of together.
            Sign up, install any skill in 30 seconds, share with your team.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
            >
              Create free account <ArrowRight size={14} />
            </Link>
            <Link
              href="/skills"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors text-sm border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Browse skills first
            </Link>
          </div>

          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            No credit card. No paywall. Sign in once, install any skill any time.
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
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <InfinityIcon size={12} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm tracking-wide">SKILON</span>
            </div>
            <div className="flex items-center gap-5 text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/legal/terms"    className="hover:text-violet-400 transition-colors">Terms</Link>
              <Link href="/legal/privacy"  className="hover:text-violet-400 transition-colors">Privacy</Link>
              <a href="mailto:support@addonweb.io" className="hover:text-violet-400 transition-colors">support@addonweb.io</a>
            </div>
          </div>
          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 SkilOn · Ahmedabad, India · Powered by Addon Web Solutions
          </p>
        </div>
      </footer>
    </div>
  );
}
