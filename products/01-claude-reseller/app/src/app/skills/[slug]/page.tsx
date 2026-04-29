/**
 * Skill Detail Page — /skills/[slug]
 *
 * Server component. Fetches from /api/skills/[slug].
 *
 * Component tree:
 *   SkillDetailPage (server)
 *     ├── Header (back, category badge, title, tagline, tags, stats, price/buy)
 *     ├── VideoSection (YouTube embed or placeholder)
 *     ├── DescriptionSection
 *     ├── StepsSection (step-by-step guide with copy-able code blocks)
 *     ├── RelatedSkillsSection (4 skills, same category)
 *     └── CTASection
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, ShoppingBag, Flame, Zap } from "lucide-react";
import type { Skill } from "@/lib/database.types";
import { CopyCodeButton } from "@/components/copy-code-button";
import { BuyButton } from "@/components/buy-button";

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
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] ?? null;
    if (u.searchParams.has("v")) return u.searchParams.get("v");
    // /embed/VIDEO_ID
    const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1] ?? null;
  } catch {
    // not a valid URL
  }
  return null;
}

function getDifficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    beginner:     "#10b981",
    intermediate: "#f59e0b",
    advanced:     "#ef4444",
  };
  return map[difficulty] ?? "#8b5cf6";
}

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

  const meta      = CATEGORY_META[skill.category as CategoryKey];
  const color     = meta?.color ?? "#8b5cf6";
  const label     = meta?.label ?? skill.category;
  const emoji     = meta?.emoji ?? "";
  const videoId   = skill.video_url ? extractYouTubeId(skill.video_url) : null;

  return (
    <main className="min-h-screen bg-[#07070a] text-white">

      {/* ------------------------------------------------------------------ */}
      {/* NAV                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#07070a]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/skills" className="flex items-center gap-2 group text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Skills
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <Zap size={12} />
            </div>
            <span className="font-semibold text-sm">Claude Toolkit</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="mb-10">
          {/* Category + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ color, background: `${color}18` }}
            >
              <span aria-hidden>{emoji}</span>
              {label}
            </span>
            {skill.is_trending && (
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full">
                <Flame size={11} className="fill-orange-400" /> Trending
              </span>
            )}
            {skill.is_new && (
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                NEW
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight mb-3 leading-tight">
            {skill.title}
          </h1>

          {/* Tagline */}
          <p className="text-white/50 text-lg mb-5">{skill.tagline}</p>

          {/* Tags */}
          {skill.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/40 mb-8">
            <span className="flex items-center gap-1.5">
              <Eye size={13} />
              {skill.view_count.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag size={13} />
              {skill.purchase_count.toLocaleString()} purchases
            </span>
            <span
              className="flex items-center gap-1.5 font-medium capitalize"
              style={{ color: getDifficultyColor(skill.difficulty) }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: getDifficultyColor(skill.difficulty) }}
              />
              {skill.difficulty}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-3xl font-bold">
                {skill.is_free ? "Free" : `₹${skill.price_inr.toLocaleString("en-IN")}`}
              </span>
              {!skill.is_free && (
                <span className="text-xs text-white/30 ml-2">
                  (${skill.price_usd} USD) · one-time
                </span>
              )}
            </div>
            {skill.pack_id ? (
              <BuyButton
                packId={skill.pack_id}
                packLabel={skill.title}
                priceDisplay={
                  skill.is_free
                    ? "Free"
                    : `₹${skill.price_inr.toLocaleString("en-IN")}`
                }
              />
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium text-sm transition-colors"
              >
                Free — Copy Steps <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* VIDEO TRAILER                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-12" aria-label="Video trailer">
          {videoId ? (
            <div className="relative w-full rounded-xl overflow-hidden border border-white/10" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={`${skill.title} — video tutorial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-white/10 bg-[#0f0f12] py-16 text-white/30">
              <span className="text-4xl mb-3">▶</span>
              <p className="text-sm">Video tutorial coming soon</p>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* DESCRIPTION                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-12" aria-label="Skill description">
          <h2 className="text-xl font-bold mb-4">About this skill</h2>
          <div className="text-white/60 text-sm leading-relaxed space-y-4">
            {skill.description.split("\n\n").map((paragraph, i) => (
              // Using index is safe here — description paragraphs are static
              // eslint-disable-next-line react/no-array-index-key
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* STEPS GUIDE                                                       */}
        {/* ---------------------------------------------------------------- */}
        {skill.steps.length > 0 && (
          <section className="mb-12" aria-label="Step-by-step guide">
            <h2 className="text-xl font-bold mb-1">Step-by-Step Guide — Copy &amp; Execute</h2>
            <p className="text-white/40 text-sm mb-8">
              Follow these steps exactly. Each step is self-contained and copy-paste ready.
            </p>

            <ol className="space-y-8" role="list">
              {skill.steps.map((step) => (
                <li key={step.number} className="flex gap-5">
                  {/* Step number circle */}
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: color }}
                    aria-hidden
                  >
                    {step.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Step title */}
                    <h3 className="font-semibold text-white mb-1">{step.title}</h3>

                    {/* Step description */}
                    <p className="text-white/50 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Code block */}
                    {step.code && (
                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        {/* Code header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f12] border-b border-white/10">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                            {step.language ?? "code"}
                          </span>
                          {/* Copy button — client component */}
                          <CopyCodeButton code={step.code} />
                        </div>
                        {/* Code body */}
                        <pre
                          className="bg-[#080809] p-5 overflow-x-auto text-xs font-mono text-white/80 leading-relaxed"
                          aria-label={`Code for step ${step.number}`}
                        >
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* RELATED SKILLS                                                    */}
        {/* ---------------------------------------------------------------- */}
        {relatedSkills.length > 0 && (
          <section className="mb-12" aria-label="Related skills">
            <h2 className="text-xl font-bold mb-6">More in {label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedSkills.map((rel) => {
                const relMeta  = CATEGORY_META[rel.category as CategoryKey];
                const relColor = relMeta?.color ?? "#8b5cf6";
                return (
                  <Link
                    key={rel.id}
                    href={`/skills/${rel.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-[#0f0f12] hover:border-white/15 transition-all group"
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: `${relColor}20` }}
                    >
                      {relMeta?.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-white group-hover:text-violet-300 transition-colors leading-snug">
                          {rel.title}
                        </p>
                        <span className="shrink-0 text-sm font-bold text-white/70">
                          {rel.is_free ? "Free" : `₹${rel.price_inr.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{rel.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* BOTTOM CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section
          className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-pink-900/10 p-8 text-center"
          aria-label="Get started"
        >
          {skill.is_free ? (
            <>
              <p className="text-white/50 text-sm mb-1">This skill is free.</p>
              <h2 className="text-xl font-bold mb-4">Start using it now</h2>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm"
              >
                Sign in to access <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm mb-1">One-time purchase.</p>
              <h2 className="text-xl font-bold mb-1">{skill.title}</h2>
              <p className="text-3xl font-bold mb-5">
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm"
                >
                  Get started <ArrowRight size={14} />
                </Link>
              )}
            </>
          )}
          <p className="text-white/25 text-xs mt-6">
            Questions?{" "}
            <a href="mailto:support@addonweb.io" className="hover:text-white/50 transition-colors">
              support@addonweb.io
            </a>
          </p>
        </section>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        © 2026 AddonWeb Solutions · Ahmedabad, India ·{" "}
        <a href="mailto:support@addonweb.io" className="hover:text-white/50 transition-colors">
          support@addonweb.io
        </a>
      </footer>
    </main>
  );
}
