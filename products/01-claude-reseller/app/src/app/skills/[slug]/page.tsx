/**
 * Skill Detail Page — /skills/[slug]
 *
 * Component tree:
 *   SkillDetailPage (server)
 *     ├── Back link
 *     ├── HeaderCard (icon square, title, category/difficulty badges, view count)
 *     ├── InstallCommandCard (copy-able npx command) — client island
 *     ├── TabBar (Steps | Preview | Overview) — client island
 *     └── RelatedSkillsGrid
 *
 * Design reference: aitmpl.com skill detail layout
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import type { Skill } from "@/lib/database.types";
import { BuyButton } from "@/components/buy-button";
import { SkillDetailTabs } from "@/components/skill-detail-tabs";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_META = {
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

type CategoryKey = keyof typeof CATEGORY_META;

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/skills/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Skill not found" };
    const skill = await res.json() as Skill;
    return {
      title:       `${skill.title} — Claude Toolkit`,
      description: skill.tagline,
    };
  } catch {
    return { title: "Claude Toolkit Skills" };
  }
}

// ---------------------------------------------------------------------------
// Difficulty helpers
// ---------------------------------------------------------------------------

function getDifficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    beginner:     "#10b981",
    intermediate: "#f59e0b",
    advanced:     "#ef4444",
  };
  return map[difficulty] ?? "#8b5cf6";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  // Fetch skill
  let skill: Skill;
  try {
    const res = await fetch(`${baseUrl}/api/skills/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) notFound();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    skill = await res.json() as Skill;
  } catch {
    notFound();
  }

  // Fetch related skills (same category, exclude current)
  let relatedSkills: Skill[] = [];
  try {
    const res = await fetch(
      `${baseUrl}/api/skills?category=${skill.category}&pageSize=5&sort=trending`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json() as { skills: Skill[] };
      relatedSkills = (data.skills ?? []).filter((s) => s.slug !== skill.slug).slice(0, 4);
    }
  } catch {
    // Related skills are non-critical — swallow error
  }

  const meta  = CATEGORY_META[skill.category as CategoryKey];
  const color = meta?.color ?? "#8b5cf6";
  const label = meta?.label ?? skill.category;
  const emoji = meta?.emoji ?? "";

  const installCommand = `npx @addonweb/claude-toolkit@latest install ${skill.slug}`;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Back link */}
        <Link
          href="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-7 transition-colors hover:text-violet-400"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={13} />
          Back to Skills
        </Link>

        {/* ---------------------------------------------------------------- */}
        {/* HEADER CARD                                                       */}
        {/* ---------------------------------------------------------------- */}
        <header
          className="rounded-2xl border p-5 mb-4 flex items-start gap-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Icon square with category gradient */}
          <div
            className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: `linear-gradient(135deg, ${color}40 0%, ${color}18 100%)`,
              border: `1px solid ${color}30`,
            }}
            aria-hidden
          >
            {emoji}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ color, backgroundColor: `${color}18` }}
              >
                {label}
              </span>
              <span
                className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full"
                style={{
                  color: getDifficultyColor(skill.difficulty),
                  backgroundColor: `${getDifficultyColor(skill.difficulty)}18`,
                }}
              >
                {skill.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 ml-auto">
                <Download size={10} />
                {skill.view_count.toLocaleString()} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold leading-snug mb-1" style={{ color: "var(--text-primary)" }}>
              {skill.title}
            </h1>

            {/* Tagline */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {skill.tagline}
            </p>

            {/* Price + CTA */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-lg font-bold">
                {skill.is_free ? "Free" : `₹${skill.price_inr.toLocaleString("en-IN")}`}
              </span>
              {!skill.is_free && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  (${skill.price_usd} USD) · one-time
                </span>
              )}
              {skill.pack_id ? (
                <BuyButton
                  packId={skill.pack_id}
                  packLabel={skill.title}
                  priceDisplay={skill.is_free ? "Free" : `₹${skill.price_inr.toLocaleString("en-IN")}`}
                />
              ) : (
                <Link
                  href="/sign-in"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors"
                >
                  {skill.is_free ? "Get for free" : "Buy now"} <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* INSTALL COMMAND CARD                                              */}
        {/* ---------------------------------------------------------------- */}
        {/* Client island handles the copy interaction */}
        <SkillDetailTabs
          skill={skill}
          installCommand={installCommand}
          categoryColor={color}
          relatedSkills={relatedSkills}
          categoryLabel={label}
        />

      </div>
    </div>
  );
}
