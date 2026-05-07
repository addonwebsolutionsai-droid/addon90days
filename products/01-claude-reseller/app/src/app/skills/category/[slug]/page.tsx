/**
 * Category Landing Page — /skills/category/[slug]
 *
 * Server-rendered, hand-written long-form copy per category, server-fetched
 * skill list. Built for SEO: every page targets "claude skills for [category]"
 * medium-tail queries (estimated 5-20k organic visitors/page/month at full
 * ranking). Internal links between categories spread link equity.
 *
 * Renders:
 *   <h1>           — category-specific
 *   Hero paragraph — ~80 words, brand voice
 *   Skills grid    — server-fetched from Supabase, no client JS for listing
 *   Body copy      — 200-300 words for SEO depth
 *   Related cats   — 3 internal links to adjacent categories
 *   JSON-LD        — CollectionPage + ItemList for rich results
 *
 * Why server-render the entire page (no "use client"): every byte is
 * crawlable on first request. The /skills hub bailed out to client
 * rendering because of useSearchParams — that bug doesn't apply here.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Skill, SkillCategory } from "@/lib/database.types";
import { CATEGORY_CONTENT, CATEGORY_SLUGS } from "@/lib/category-content";
import { formatTagLabel } from "@/lib/tag-format";
import { getSkillCountLabel } from "@/lib/catalog-stats";

export const revalidate = 1800;

interface RouteParams { params: Promise<{ slug: string }> }

// ----------------------------------------------------------------------------
// Metadata
// ----------------------------------------------------------------------------

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORY_CONTENT[slug];
  if (cat === undefined) return { title: "Category not found" };

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
  const canonicalUrl = `${baseUrl}/skills/category/${slug}`;

  return {
    title:       cat.titleTag,
    description: cat.metaDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type:        "website",
      url:         canonicalUrl,
      siteName:    "SKILON",
      title:       cat.titleTag,
      description: cat.metaDescription,
    },
    twitter: {
      card:        "summary_large_image",
      title:       cat.titleTag,
      description: cat.metaDescription,
    },
  };
}

// ----------------------------------------------------------------------------
// Static params — pre-generates all 11 routes at build time
// ----------------------------------------------------------------------------

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default async function CategoryPage({ params }: RouteParams) {
  const { slug } = await params;
  const cat = CATEGORY_CONTENT[slug];
  if (cat === undefined) notFound();

  const skillCountLabel = await getSkillCountLabel();

  // Server fetch — Supabase via the public anon client (only published skills).
  // Slug came from generateStaticParams (CATEGORY_SLUGS), so it's already
  // a valid SkillCategory enum value — narrow via cast for the typed client.
  const category = slug as SkillCategory;
  const { data: rows } = await supabase
    .from("skills")
    .select("slug, title, tagline, difficulty, view_count, is_new, trending_score, tags")
    .eq("category", category)
    .eq("published", true)
    .order("trending_score", { ascending: false })
    .limit(60);
  const skills = (rows ?? []) as Pick<Skill, "slug" | "title" | "tagline" | "difficulty" | "view_count" | "is_new" | "trending_score" | "tags">[];

  // Compute the 5 most-frequent tags from skills in this category for the
  // "Popular tags" internal linking row at the bottom of the page.
  const tagFreq = new Map<string, number>();
  for (const s of skills) {
    for (const t of s.tags ?? []) {
      tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1);
    }
  }
  const popularTags = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    "name":     cat.h1,
    "description": cat.metaDescription,
    "url":      `${baseUrl}/skills/category/${slug}`,
    "mainEntity": {
      "@type":           "ItemList",
      "numberOfItems":   skills.length,
      "itemListElement": skills.slice(0, 20).map((s, i) => ({
        "@type":    "ListItem",
        "position": i + 1,
        "url":      `${baseUrl}/skills/${s.slug}`,
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
            <span
              className="text-2xl"
              style={{
                filter: `drop-shadow(0 0 12px ${cat.color}60)`,
              }}
              aria-hidden
            >
              {cat.emoji}
            </span>
            <span
              className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
              style={{ color: cat.color, backgroundColor: `${cat.color}15` }}
            >
              {cat.label}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
            {cat.h1}
          </h1>
          <p
            className="text-base leading-relaxed max-w-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            {cat.hero}
          </p>
        </header>

        {/* Skills grid */}
        <section className="mb-12" aria-label={`${cat.label} skills`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {skills.length} skill{skills.length === 1 ? "" : "s"} in {cat.label}
            </h2>
          </div>

          {skills.length === 0 ? (
            <div
              className="rounded-xl border p-8 text-center text-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor:     "var(--border-subtle)",
                color:           "var(--text-muted)",
              }}
            >
              No skills published in this category yet. Check back soon — Skill Smith ships new
              skills daily, and {cat.label} is on the backlog.
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3.5 list-none p-0">
              {skills.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/skills/${s.slug}`}
                    className="group flex flex-col rounded-xl border p-4 h-full transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor:     "var(--border-subtle)",
                      borderLeftColor: cat.color,
                      borderLeftWidth: "3px",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {s.title}
                      </h3>
                      {s.is_new === true && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed flex-1 mb-3" style={{ color: "var(--text-secondary)" }}>
                      {s.tagline}
                    </p>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                      <span>{s.difficulty}</span>
                      <span className="flex items-center gap-1 text-violet-400 group-hover:text-violet-300 transition-colors font-medium">
                        View skill <ArrowRight size={11} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Long-form body — SEO depth */}
        <section
          className="rounded-2xl border p-6 sm:p-8 mb-12"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor:     "var(--border-subtle)",
          }}
        >
          <h2 className="flex items-center gap-2 text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
            <Sparkles size={14} className="text-violet-400" />
            Why this category exists
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {cat.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Related categories — internal linking for SEO */}
        <section aria-label="Related categories">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Related categories
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {cat.related.map((relSlug) => {
              const rel = CATEGORY_CONTENT[relSlug];
              if (rel === undefined) return null;
              return (
                <Link
                  key={relSlug}
                  href={`/skills/category/${relSlug}`}
                  className="group flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:border-violet-500/40"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor:     "var(--border-subtle)",
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base" aria-hidden>{rel.emoji}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {rel.label}
                    </span>
                  </span>
                  <ArrowRight size={13} className="text-violet-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular tags in this category — internal linking to tag landing pages */}
        {popularTags.length > 0 && (
          <section aria-label="Popular tags in this category" className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Popular tags in {cat.label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((t) => (
                <Link
                  key={t}
                  href={`/skills/tag/${t}`}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all hover:border-violet-500/40 hover:text-violet-400"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor:     "var(--border-subtle)",
                    color:           "var(--text-secondary)",
                  }}
                >
                  <Tag size={11} className="text-violet-400" aria-hidden />
                  {formatTagLabel(t)}
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA — bring users to the catalog hub */}
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
            Browse all {skillCountLabel} skills <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}
