import Link from "next/link";
import {
  ArrowRight,
  Github,
  Terminal,
  Cpu,
  FileText,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/skill-card";
import type { SkillCardProps } from "@/components/skill-card";

// --- Static data: featured skills for the hero grid -------------------------

const FEATURED_SKILLS: SkillCardProps[] = [
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    description:
      "Generate professional GST-compliant invoices from a single prompt. Outputs PDF-ready HTML + JSON. Handles CGST/SGST/IGST splits automatically.",
    category: "finance",
    priceUsd: 19,
    tags: ["gst", "invoice", "pdf", "finance"],
    featured: true,
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description:
      "Deep code review with actionable suggestions. Catches security issues, perf anti-patterns, and TypeScript pitfalls. Returns structured JSON diff.",
    category: "developer",
    priceUsd: 14,
    tags: ["typescript", "security", "review", "ci"],
    featured: true,
  },
  {
    id: "pr-description",
    name: "PR Description Writer",
    description:
      "Turn a git diff into a full pull request description with summary, test plan, and risk flags. Reads your existing PR template.",
    category: "developer",
    priceUsd: 9,
    tags: ["git", "github", "pr", "docs"],
    featured: false,
  },
];

// --- Stat row data -----------------------------------------------------------

type Stat = { label: string; value: string };

const STATS: Stat[] = [
  { value: "6", label: "Skill Packs" },
  { value: "$49", label: "avg price" },
  { value: "1-line", label: "install" },
  { value: "100%", label: "TypeScript" },
];

// --- Terminal snippet (static, no JS needed) ---------------------------------

const INSTALL_SNIPPET = `npx @addonweb/claude-toolkit add invoice-generator
# ✓ Skill installed in .claude/skills/
# ✓ Use: /invoice-generator`;

// --- Page -------------------------------------------------------------------

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* Aurora background blobs — design system spec: 10-15% opacity, blur 80px */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px] animate-aurora-1" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-pink-500/8 blur-[100px] animate-aurora-2" />
      </div>

      <div className="relative z-10">
        {/* ------------------------------------------------------------------ */}
        {/* NAV                                                                 */}
        {/* ------------------------------------------------------------------ */}
        <nav className="sticky top-0 z-50 glass-panel border-b border-border-subtle">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-violet-500 font-mono text-lg font-bold">⚡</span>
              <span className="font-semibold text-white text-sm tracking-tight">
                Claude Toolkit
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/skills">
                <Button variant="ghost" size="sm">
                  Browse Skills
                </Button>
              </Link>
              <a
                href="https://github.com/addonwebsolutions-AI/aws-90days"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost" size="sm">
                  <Github size={15} />
                  GitHub
                </Button>
              </a>
              <Link href="/dashboard">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ------------------------------------------------------------------ */}
        {/* HERO                                                                */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
          {/* Eyebrow badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/8 text-violet-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Day 15 Launch — Now Available
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black text-center leading-[1.05] tracking-[-1.5px] mb-6 max-w-4xl mx-auto">
            Production-Ready{" "}
            <span className="text-gradient-violet">Claude Skills</span>,{" "}
            MCP Servers{" "}
            <span className="text-white/40">&amp;</span> Agent Packs
          </h1>

          {/* Sub */}
          <p className="text-center text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Built by practitioners who run a 13-agent AI company. Every tool is
            tested in real production — not a demo.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/skills">
              <Button size="lg">
                Browse Skill Packs
                <ArrowRight size={16} />
              </Button>
            </Link>
            <a
              href="https://github.com/addonwebsolutions-AI/aws-90days"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="lg">
                <Github size={16} />
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 rounded-16 overflow-hidden border border-border-subtle bg-border-subtle">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 py-5 bg-bg-surface"
              >
                <span className="text-2xl font-black text-white tabular-nums">
                  {value}
                </span>
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* TERMINAL SNIPPET                                                    */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="rounded-16 border border-border bg-bg-surface overflow-hidden">
            {/* Terminal chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-s2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-white/30 font-mono">
                terminal
              </span>
            </div>
            <pre className="p-6 text-sm font-mono text-green-400 leading-relaxed overflow-x-auto whitespace-pre">
              {INSTALL_SNIPPET}
            </pre>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* FEATURED SKILLS — bento grid                                        */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1">
                Featured Skills
              </p>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Ship faster with battle-tested tools
              </h2>
            </div>
            <Link href="/skills">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          {/* 3-column grid on md+; single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_SKILLS.map((skill) => (
              <SkillCard key={skill.id} {...skill} />
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* USE CASES — 3 icon bento tiles                                      */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <p className="text-xs text-white/30 font-medium uppercase tracking-widest mb-4 text-center">
            What you can do
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Terminal size={20} className="text-violet-400" />,
                title: "Supercharge Claude Code",
                body: "Install skills as slash commands. /invoice-generator, /code-reviewer, /pr-description — ready in seconds.",
              },
              {
                icon: <Cpu size={20} className="text-cyan-400" />,
                title: "IoT Firmware Scaffolding",
                body: "Generate ESP32 / STM32 firmware skeletons with pin configs, interrupt handlers, and MQTT publishing code.",
              },
              {
                icon: <FileText size={20} className="text-green-400" />,
                title: "Finance & GST Automation",
                body: "GST-compliant invoice generation, GSTR-1 summary prep, HSN code validation — all from plain English prompts.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-16 border border-border-subtle bg-bg-surface p-6 hover:border-violet-500/20 transition-colors"
              >
                <div className="w-9 h-9 rounded-12 bg-bg-s2 border border-border-subtle flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-semibold text-white text-sm">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* FINAL CTA                                                           */}
        {/* ------------------------------------------------------------------ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-20 border border-violet-500/20 bg-violet-glow bg-bg-surface p-12 text-center relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-violet-glow pointer-events-none" />
            <Code2 size={32} className="text-violet-400 mx-auto mb-4 relative" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight relative">
              Start building with Claude Toolkit
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto relative">
              Individual skills from $9. All-Access subscription at $29/mo. No
              lock-in.
            </p>
            <Link href="/skills">
              <Button size="lg" className="relative">
                Browse all skills
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* FOOTER                                                              */}
        {/* ------------------------------------------------------------------ */}
        <footer className="border-t border-border-subtle">
          <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
            <span className="text-white/30 text-sm">
              © 2026 AddonWeb Solutions · Built with Claude
            </span>
            <div className="flex items-center gap-6">
              <Link
                href="/skills"
                className="text-white/30 hover:text-white text-sm transition-colors"
              >
                Skills
              </Link>
              <a
                href="https://github.com/addonwebsolutions-AI/aws-90days"
                target="_blank"
                rel="noreferrer"
                className="text-white/30 hover:text-white text-sm transition-colors"
              >
                GitHub
              </a>
              <Link
                href="/dashboard"
                className="text-white/30 hover:text-white text-sm transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
