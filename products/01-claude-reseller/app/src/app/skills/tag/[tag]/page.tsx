/**
 * Tag Landing Page — /skills/tag/[tag]
 *
 * Component tree:
 *   TagPage (server)
 *     ├── Breadcrumb (back to /skills)
 *     ├── H1 + hero paragraph (auto-composed, 60-100 words)
 *     ├── Skills grid (server-fetched, published only, tags @> ARRAY[tag])
 *     ├── Body section (200 words, SEO depth)
 *     ├── Related tags (co-occurrence computed at request time)
 *     └── JSON-LD CollectionPage + ItemList
 *
 * Why this route exists: every tag is a long-tail query surface
 * ("claude skills for firmware", "GST claude tools"). Programmatic pages
 * are low effort, high leverage. They link back to skill detail pages,
 * spreading link equity across the catalog.
 *
 * generateStaticParams: pre-builds the top 50 tags with >= 3 skills at
 * build time. Rarer tags are served on-demand (ISR). notFound() is only
 * called when zero published skills match the tag.
 *
 * Title template: root layout appends " | SKILON" automatically.
 * Do NOT include "SKILON" in the title string here — that causes the
 * "X | SKILON | SKILON" double-suffix bug.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE_BASE_URL } from "@/lib/site-config";
import { formatTagLabel } from "@/lib/tag-format";
import type { Skill } from "@/lib/database.types";

export const revalidate = 1800; // 30 min — new Skill Smith outputs surface within an hour

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RouteParams { params: Promise<{ tag: string }> }

type SlimSkill = Pick<Skill, "slug" | "title" | "tagline" | "difficulty" | "view_count" | "is_new" | "tags">;

// ---------------------------------------------------------------------------
// Tag data helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all published skills that carry the given tag.
 * Uses PostgreSQL array containment: tags @> ARRAY[tag]
 */
async function fetchSkillsForTag(tag: string): Promise<SlimSkill[]> {
  const { data } = await supabase
    .from("skills")
    .select("slug, title, tagline, difficulty, view_count, is_new, tags")
    .contains("tags", [tag])
    .eq("published", true)
    .order("trending_score", { ascending: false })
    .limit(60);
  return (data ?? []) as SlimSkill[];
}

/**
 * Compute top 50 tags with >= 3 published skills for generateStaticParams.
 * Queries all published skills, flattens tags array, counts frequency.
 * Hard-cap: 50 entries. If > 200 distinct tags found, logs a warning but
 * continues — caller still caps at 50.
 */
export async function getTopTags(
  minSkills = 3,
  limit = 50,
): Promise<{ tag: string; count: number }[]> {
  // Pull only the tags column — minimal payload
  const { data } = await supabase
    .from("skills")
    .select("tags")
    .eq("published", true);

  if (data === null) return [];

  const freq = new Map<string, number>();
  for (const row of data) {
    for (const t of row.tags ?? []) {
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
  }

  // Developer note: if catalog grows spammy, this number will balloon.
  // Flag threshold: > 200 distinct tags is a sign of tag hygiene issues.
  if (freq.size > 200) {
    console.warn(
      `[tag-page] Found ${freq.size} distinct tags in the catalog (> 200). ` +
        "Review tag hygiene in Skill Smith — too many one-off tags dilute SEO value.",
    );
  }

  return Array.from(freq.entries())
    .filter(([, count]) => count >= minSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

/**
 * Compute related tags: tags that most frequently co-occur with `currentTag`
 * in the same published skills. Returns up to `limit` tag slugs.
 */
function computeRelatedTags(
  skills: SlimSkill[],
  currentTag: string,
  limit = 5,
): string[] {
  const coFreq = new Map<string, number>();
  for (const skill of skills) {
    for (const t of skill.tags) {
      if (t === currentTag) continue;
      coFreq.set(t, (coFreq.get(t) ?? 0) + 1);
    }
  }
  return Array.from(coFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

// ---------------------------------------------------------------------------
// generateStaticParams — pre-build top 50 tags at build time
// ---------------------------------------------------------------------------

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const topTags = await getTopTags(3, 50);
  return topTags.map(({ tag }) => ({ tag }));
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { tag } = await params;
  const label = formatTagLabel(tag);

  // Title: keep under 60 chars; root layout adds " | SKILON"
  const title = `${label} Claude Skills`;
  // Description: under 160 chars
  const description =
    `Browse production-ready Claude skills tagged "${label}". Install in 30 seconds via Claude Code or MCP. Free to use.`.slice(0, 158);

  const canonicalUrl = `${SITE_BASE_URL}/skills/tag/${tag}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type:        "website",
      url:         canonicalUrl,
      siteName:    "SKILON",
      title,
      description,
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Auto-compose hero paragraph (60-100 words)
// ---------------------------------------------------------------------------

function buildHero(label: string, count: number, topTitles: string[]): string {
  const skillWord = count === 1 ? "skill" : "skills";
  const topList =
    topTitles.length > 0
      ? ` Top picks include: ${topTitles.slice(0, 3).join(", ")}.`
      : "";

  if (count < 3) {
    // "small but mighty" variant for thin-content pages
    return (
      `A focused set of ${count} production-ready ${label} ${skillWord} built for engineers who ship. ` +
      `Small in number, high in specificity.${topList} ` +
      `Each skill installs in 30 seconds via Claude Code or MCP, and runs against your actual codebase — ` +
      `not a toy sandbox. Free to try live in your browser before installing.`
    );
  }

  return (
    `${count} production-ready ${label} ${skillWord} built for practitioners, not demos.${topList} ` +
    `Each skill installs in under 30 seconds via Claude Code or MCP and ships real output — ` +
    `code, queries, strategies, configs. No chatbot back-and-forth. No credit card. ` +
    `Built by AddonWeb, a team with 10+ years of custom software for clients across India, USA, and Europe.`
  );
}

// ---------------------------------------------------------------------------
// Auto-compose body section (~200 words, SEO depth)
// ---------------------------------------------------------------------------

function buildBody(label: string, count: number): string[] {
  return [
    `The ${label} tag on SKILON collects every Claude skill that belongs in a ${label} workflow. ` +
      `With ${count} published skill${count === 1 ? "" : "s"} in this group, you get a focused toolkit ` +
      `rather than a firehose — every entry is published because it solves a real, recurring task that ` +
      `engineers and practitioners face regularly.`,

    `SKILON skills are different from prompts. A skill is an installable unit: it runs as a ` +
      `slash command in Claude Code (\`/skill-name\`) or as an MCP tool in Claude Desktop. ` +
      `Install with one \`npx\` command, run against your real codebase, get production-grade output. ` +
      `No copy-pasting prompts. No tab-switching to a chatbot. The workflow stays in your editor.`,

    `All ${label} skills are free during SKILON's beta. No credit card required. Sign in with Google ` +
      `or GitHub to install. Each skill ships with a live demo you can run in your browser before ` +
      `committing to an install — try the output, then decide. If you don't find what you need in ` +
      `this tag, browse the full catalog or request a skill — Skill Smith ships new skills daily.`,
  ];
}

// ---------------------------------------------------------------------------
// Difficulty color helper
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
// Page component
// ---------------------------------------------------------------------------

export default async function TagPage({ params }: RouteParams) {
  const { tag } = await params;
  const label   = formatTagLabel(tag);

  const skills = await fetchSkillsForTag(tag);

  // No published skills → hard 404 (thin content, bad SEO, waste of crawl budget)
  if (skills.length === 0) notFound();

  const relatedTags = computeRelatedTags(skills, tag, 5);
  const topTitles   = skills.slice(0, 3).map((s) => s.title);
  const hero        = buildHero(label, skills.length, topTitles);
  const bodyParas   = buildBody(label, skills.length);

  const canonicalUrl = `${SITE_BASE_URL}/skills/tag/${tag}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    "name":     `${label} Claude Skills`,
    "description": `Production-ready Claude skills tagged ${label}. Install in 30 seconds.`,
    "url":      canonicalUrl,
    "mainEntity": {
      "@type":           "ItemList",
      "numberOfItems":   skills.length,
      "itemListElement": skills.slice(0, 20).map((s, i) => ({
        "@type":    "ListItem",
        "position": i + 1,
        "url":      `${SITE_BASE_URL}/skills/${s.slug}`,
        "name":     s.title,
      })),
    },
  };

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <script
        type="application/ld+json"
        // Server-rendered, payload built from validated DB strings.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <Link
          href="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-7 transition-colors hover:text-violet-400"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={13} /> All skills
        </Link>

        {/* Hero */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Tag size={16} className="text-violet-400" aria-hidden />
            <span
              className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
              style={{ color: "#8b5cf6", backgroundColor: "#8b5cf615" }}
            >
              Tag
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
            Claude Skills tagged: {label}
          </h1>

          <p
            className="text-base leading-relaxed max-w-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            {hero}
          </p>
        </header>

        {/* Skills grid */}
        <section className="mb-12" aria-label={`${label} tagged skills`}>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {skills.length} skill{skills.length === 1 ? "" : "s"} tagged {label}
            </h2>
          </div>

          <ul className="grid sm:grid-cols-2 gap-3.5 list-none p-0">
            {skills.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/skills/${s.slug}`}
                  className="group flex flex-col rounded-xl border p-4 h-full transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor:     "var(--border-subtle)",
                    borderLeftColor: "#8b5cf6",
                    borderLeftWidth: "3px",
                  }}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {s.title}
                    </h3>
                    {s.is_new === true && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">
                        New
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs leading-relaxed flex-1 mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {s.tagline}
                  </p>
                  <div
                    className="flex items-center justify-between text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span
                      style={{ color: getDifficultyColor(s.difficulty) }}
                      className="capitalize font-medium"
                    >
                      {s.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-violet-400 group-hover:text-violet-300 transition-colors font-medium">
                      View skill <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Long-form body — SEO depth */}
        <section
          className="rounded-2xl border p-6 sm:p-8 mb-12"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor:     "var(--border-subtle)",
          }}
        >
          <h2
            className="flex items-center gap-2 text-base font-semibold mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            <Tag size={14} className="text-violet-400" />
            About the {label} tag
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {bodyParas.map((para, i) => (
              // Static server-rendered content — index key is safe here
              // eslint-disable-next-line react/no-array-index-key
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Related tags — internal linking for SEO equity */}
        {relatedTags.length > 0 && (
          <section aria-label="Related tags">
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Related tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((relTag) => (
                <Link
                  key={relTag}
                  href={`/skills/tag/${relTag}`}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all hover:border-violet-500/40 hover:text-violet-400"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor:     "var(--border-subtle)",
                    color:           "var(--text-secondary)",
                  }}
                >
                  <Tag size={11} className="text-violet-400" />
                  {formatTagLabel(relTag)}
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:border-violet-500/50"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor:     "var(--border)",
              color:           "var(--text-secondary)",
            }}
          >
            Browse all skills <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}
