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
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import type { Skill } from "@/lib/database.types";
import { SkillDetailTabs } from "@/components/skill-detail-tabs";
import { InstallMethods } from "@/components/install-methods";
import { TrySkillLive } from "@/components/try-skill-live";
import { ShareSkill } from "@/components/share-skill";
import { ViewBeacon } from "@/components/view-beacon";

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
    const canonicalUrl = `${baseUrl}/skills/${skill.slug}`;
    const title       = `${skill.title} — SKILOON`;
    const description = skill.tagline;
    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: "article",
        url: canonicalUrl,
        title,
        description,
        siteName: "SKILOON",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: "SKILOON Skills" };
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

  const installCommand = `npx addonweb-claude-skills@latest install ${skill.slug}`;

  const { userId } = await auth();
  const isSignedIn = userId !== null;

  // ---------------------------------------------------------------------- //
  // JSON-LD structured data (schema.org SoftwareApplication)               //
  // Helps Google surface skill cards in rich results / sidebar.            //
  // Kept as a server-rendered <script> tag — no client bundle cost.        //
  // ---------------------------------------------------------------------- //
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
  const skillJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": skill.title,
    "description": skill.tagline,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform (Claude Code, Claude.ai, MCP)",
    "url": `${appUrl}/skills/${skill.slug}`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
    },
    "publisher": {
      "@type": "Organization",
      "name": "AddonWeb Solutions",
      "url": "https://addonweb.io",
    },
    ...(skill.view_count > 0
      ? {
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/ViewAction",
            "userInteractionCount": skill.view_count,
          },
        }
      : {}),
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        // Server-rendered only; safe payload built from validated DB fields.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillJsonLd) }}
      />

      {/* Fires one bump per IP per skill per 24h */}
      <ViewBeacon slug={skill.slug} />

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

            {/* Live status badge */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-green-500/15 text-green-500">
                <Sparkles size={11} />
                Free
              </span>
              <a
                href="#install"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors"
              >
                <Download size={12} /> See install instructions
              </a>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* TRY LIVE — top-of-funnel demo, in-browser execution              */}
        {/* ---------------------------------------------------------------- */}
        <TrySkillLive slug={skill.slug} title={skill.title} isSignedIn={isSignedIn} />

        {/* ---------------------------------------------------------------- */}
        {/* INSTALL METHODS — beginner-friendly, 3 tabs                      */}
        {/* ---------------------------------------------------------------- */}
        <div id="install" className="mb-4 scroll-mt-20">
          <InstallMethods slug={skill.slug} isSignedIn={isSignedIn} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SKILL CONTENT TABS (Steps / Preview / Overview)                   */}
        {/* ---------------------------------------------------------------- */}
        <SkillDetailTabs
          skill={skill}
          installCommand={installCommand}
          categoryColor={color}
          relatedSkills={relatedSkills}
          categoryLabel={label}
        />

        {/* ---------------------------------------------------------------- */}
        {/* SHARE — viral surface; placed below the install/try CTAs so the   */}
        {/* user has already converted before being asked to share.           */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-10">
          <ShareSkill slug={skill.slug} title={skill.title} tagline={skill.tagline} />
        </div>

      </div>
    </div>
  );
}
