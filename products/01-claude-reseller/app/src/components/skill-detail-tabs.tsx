"use client";

/**
 * SkillDetailTabs — client component for the skill detail page.
 *
 * Renders:
 *   1. INSTALL COMMAND card with animated copy button
 *   2. Tab bar: Steps | Preview | Overview
 *   3. Tab content areas
 *   4. Related skills (passed from server component)
 *
 * Kept as a single client component to minimise the client boundary.
 * The parent server component fetches data and passes it as props.
 */

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ArrowRight, Search } from "lucide-react";
import type { Skill, SkillStep } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { BuyButton } from "@/components/buy-button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "steps" | "preview" | "overview";

interface SkillDetailTabsProps {
  skill: Skill;
  installCommand: string;
  categoryColor: string;
  relatedSkills: Skill[];
  categoryLabel: string;
}

// ---------------------------------------------------------------------------
// Install Command Card
// ---------------------------------------------------------------------------

interface InstallCommandProps {
  command: string;
}

function InstallCommand({ command }: InstallCommandProps) {
  const [state, setState] = useState<"idle" | "copied" | "shake">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      // Non-secure context — animate shake to indicate failure
      setState("shake");
      setTimeout(() => setState("idle"), 600);
    }
  }

  return (
    <div
      className="rounded-2xl border mb-4 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Install Command
        </span>
        <button
          onClick={() => void handleCopy()}
          aria-label={state === "copied" ? "Copied!" : "Copy install command"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
            state === "copied"
              ? "bg-green-500/15 text-green-400 border border-green-500/30"
              : "bg-blue-600 hover:bg-blue-500 text-white",
            state === "shake" && "animate-shake"
          )}
        >
          {state === "copied" ? (
            <>
              <Check size={11} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={11} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="px-4 py-3.5 font-mono text-sm overflow-x-auto">
        <span style={{ color: "var(--text-muted)" }}>$ </span>
        <span style={{ color: "#f87171" }}>{command}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code Block with copy button
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  code: string;
  language?: string;
  stepNumber?: number;
}

function CodeBlock({ code, language, stepNumber }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          backgroundColor: "#0f0f12",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
          {language ?? "code"}
          {stepNumber !== undefined && ` · step ${stepNumber}`}
        </span>
        <button
          onClick={() => void handleCopy()}
          aria-label={copied ? "Copied!" : "Copy code"}
          className="flex items-center gap-1.5 text-[10px] font-medium transition-colors"
          style={{ color: copied ? "#4ade80" : "rgba(255,255,255,0.4)" }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="p-4 overflow-x-auto text-xs font-mono leading-relaxed"
        style={{
          backgroundColor: "#080809",
          color: "rgba(255,255,255,0.75)",
        }}
        aria-label={stepNumber !== undefined ? `Code for step ${stepNumber}` : "Code block"}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Steps tab
// ---------------------------------------------------------------------------

function StepsTab({ steps, categoryColor }: { steps: SkillStep[]; categoryColor: string }) {
  if (steps.length === 0) {
    return (
      <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
        <p className="text-sm">No steps available yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0" role="list">
      {steps.map((step, i) => (
        <li
          key={step.number}
          className="relative flex gap-4 step-item"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Connecting line */}
          {i < steps.length - 1 && (
            <div
              className="absolute left-3.5 top-8 bottom-0 w-px"
              style={{ backgroundColor: "var(--border-subtle)" }}
              aria-hidden
            />
          )}

          {/* Step number */}
          <div
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 relative"
            style={{ backgroundColor: categoryColor }}
            aria-hidden
          >
            {step.number}
          </div>

          <div className="flex-1 min-w-0 pb-8">
            <h3
              className="font-semibold text-sm mb-1 leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              Step {step.number} — {step.title}
            </h3>
            {step.description && (
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {step.description}
              </p>
            )}
            {step.code && (
              <CodeBlock
                code={step.code}
                language={step.language}
                stepNumber={step.number}
              />
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Preview tab
// ---------------------------------------------------------------------------

function PreviewTab({ skill }: { skill: Skill }) {
  const firstStep = skill.steps[0];

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-5"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          What you get
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {skill.description}
        </p>
      </div>

      {firstStep?.code && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Quick look — Step 1
          </p>
          <CodeBlock code={firstStep.code} language={firstStep.language} />
        </div>
      )}

      <div
        className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/15 to-pink-900/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
      >
        <div>
          <p className="text-xs text-violet-400 font-medium mb-0.5">Ready to use this skill?</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Install with one command and run in Claude Code
          </p>
        </div>
        <Link
          href="/sign-in"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
        >
          Try it now <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({ skill }: { skill: Skill }) {
  const difficultyColor: Record<string, string> = {
    beginner:     "#10b981",
    intermediate: "#f59e0b",
    advanced:     "#ef4444",
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
          Description
        </p>
        <div className="space-y-3">
          {skill.description.split("\n\n").map((para, i) => (
            // Using index is safe here — paragraphs are static server content
            // eslint-disable-next-line react/no-array-index-key
            <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {para}
            </p>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border p-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Steps</p>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{skill.steps.length}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Difficulty</p>
          <p
            className="text-sm font-bold capitalize"
            style={{ color: difficultyColor[skill.difficulty] ?? "#8b5cf6" }}
          >
            {skill.difficulty}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Price</p>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {skill.is_free ? "Free" : `₹${skill.price_inr.toLocaleString("en-IN")}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Views</p>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {skill.view_count.toLocaleString()}
          </p>
        </div>
      </div>

      {skill.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg border text-xs font-mono"
                style={{
                  backgroundColor: "var(--bg-s2)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Related skills
// ---------------------------------------------------------------------------

interface RelatedSkillsProps {
  skills: Skill[];
  categoryLabel: string;
  categoryColor: string;
}

const RELATED_CATEGORY_META = {
  "ai-llm":                  { label: "AI & LLM",           color: "#8b5cf6", emoji: "🤖" },
  "iot":                     { label: "IoT & Hardware",      color: "#06b6d4", emoji: "📡" },
  "developer-tools":         { label: "Developer Tools",     color: "#f59e0b", emoji: "⚡" },
  "startup-product":         { label: "Startup & Product",   color: "#ec4899", emoji: "🚀" },
  "ui-ux":                   { label: "UI/UX Design",        color: "#10b981", emoji: "🎨" },
  "indian-business":         { label: "Indian Business",     color: "#f97316", emoji: "🇮🇳" },
  "data-analytics":          { label: "Data & Analytics",    color: "#3b82f6", emoji: "📊" },
  "devops-infra":            { label: "DevOps & Infra",      color: "#6366f1", emoji: "🛠" },
  "communication-protocols": { label: "Protocols",           color: "#14b8a6", emoji: "🔗" },
  "marketing-growth":        { label: "Marketing & Growth",  color: "#f43f5e", emoji: "📈" },
  "trading-finance":         { label: "Trading & Finance",   color: "#eab308", emoji: "📉" },
} as const;

type RelCategoryKey = keyof typeof RELATED_CATEGORY_META;

function RelatedSkills({ skills, categoryLabel }: RelatedSkillsProps) {
  if (skills.length === 0) return null;

  return (
    <div
      className="mt-8 rounded-2xl border p-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        More in {categoryLabel}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((rel) => {
          const relMeta  = RELATED_CATEGORY_META[rel.category as RelCategoryKey];
          const relColor = relMeta?.color ?? "#8b5cf6";
          return (
            <Link
              key={rel.id}
              href={`/skills/${rel.slug}`}
              className="flex items-start gap-3 p-3 rounded-xl border transition-all hover:border-violet-500/30 group"
              style={{
                backgroundColor: "var(--bg-s2)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${relColor}20` }}
              >
                {relMeta?.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="font-medium text-xs group-hover:text-violet-400 transition-colors leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {rel.title}
                  </p>
                  <span className="shrink-0 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                    {rel.is_free ? "Free" : `₹${rel.price_inr.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                  {rel.tagline}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function SkillDetailTabs({
  skill,
  installCommand,
  categoryColor,
  relatedSkills,
  categoryLabel,
}: SkillDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("steps");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter steps by search query when search is open
  const filteredSteps = searchOpen && searchQuery.trim().length > 0
    ? skill.steps.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.code ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : skill.steps;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "steps",    label: "Steps",    icon: "<>" },
    { id: "preview",  label: "Preview",  icon: "👁" },
    { id: "overview", label: "Overview", icon: "≡" },
  ];

  return (
    <>
      {/* Tab bar */}
      <div
        className="rounded-2xl border mb-0 overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Tab header */}
        <div
          className="flex items-center border-b px-1"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent hover:text-violet-400"
              )}
              style={
                activeTab !== tab.id
                  ? { color: "var(--text-muted)" }
                  : {}
              }
            >
              <span className="font-mono text-[11px]" aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          {/* Search — only visible on Steps tab */}
          {activeTab === "steps" && (
            <div className="ml-auto flex items-center gap-2 pr-3">
              {searchOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search steps..."
                    autoFocus
                    aria-label="Search steps"
                    className="h-7 px-2.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    style={{
                      backgroundColor: "var(--bg-s2)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                      width: "160px",
                    }}
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="text-[10px] font-medium transition-colors hover:text-violet-400"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-1.5 text-[10px] font-medium transition-colors hover:text-violet-400"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Search steps (Ctrl+F)"
                >
                  <Search size={11} />
                  Search
                  <kbd
                    className="text-[9px] px-1 rounded"
                    style={{ backgroundColor: "var(--bg-s3)", color: "var(--text-muted)" }}
                  >
                    Ctrl+F
                  </kbd>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "steps" && (
            <StepsTab
              steps={filteredSteps}
              categoryColor={categoryColor}
            />
          )}
          {activeTab === "preview" && (
            <PreviewTab skill={skill} />
          )}
          {activeTab === "overview" && (
            <OverviewTab skill={skill} />
          )}
        </div>
      </div>

      {/* Related skills */}
      <RelatedSkills
        skills={relatedSkills}
        categoryLabel={categoryLabel}
        categoryColor={categoryColor}
      />

      {/* Footer CTA */}
      <div
        className="mt-8 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-pink-900/10 p-6 text-center"
      >
        {skill.is_free ? (
          <>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>This skill is free.</p>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Start using it now
            </h2>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm text-white"
            >
              Sign in to access <ArrowRight size={13} />
            </Link>
          </>
        ) : (
          <>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>One-time purchase.</p>
            <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {skill.title}
            </h2>
            <p className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              ₹{skill.price_inr.toLocaleString("en-IN")}
            </p>
            {skill.pack_id ? (
              <BuyButton
                packId={skill.pack_id}
                packLabel={skill.title}
                priceDisplay={`₹${skill.price_inr.toLocaleString("en-IN")}`}
              />
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm text-white"
              >
                Get started <ArrowRight size={13} />
              </Link>
            )}
          </>
        )}
        <p className="text-xs mt-5" style={{ color: "rgba(255,255,255,0.2)" }}>
          Questions?{" "}
          <a href="mailto:support@addonweb.io" className="hover:text-violet-400 transition-colors">
            support@addonweb.io
          </a>
        </p>
      </div>
    </>
  );
}

