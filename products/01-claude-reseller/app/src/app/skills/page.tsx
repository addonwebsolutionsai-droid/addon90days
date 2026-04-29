"use client";

/**
 * Skills Marketplace — Browse & Search
 *
 * Component tree:
 *   SkillsPage (client, owns all filter state)
 *     ├── Nav
 *     ├── SearchBar
 *     ├── CategoryPills
 *     ├── FilterBar
 *     ├── TrendingSection  (only when no active filter)
 *     ├── SkillsGrid / SkillSkeleton / EmptyState
 *     └── Pagination
 *
 * Data flow: all fetch calls go to /api/skills with URLSearchParams.
 * No hardcoded skill data — empty state shown while API boots.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Flame,
  ArrowLeft,
  ArrowRight,
  Zap,
  ChevronDown,
} from "lucide-react";
import type { Skill } from "@/lib/database.types";
import { cn } from "@/lib/utils";

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

const DIFFICULTY_OPTIONS = ["All", "beginner", "intermediate", "advanced"] as const;
type DifficultyOption = (typeof DIFFICULTY_OPTIONS)[number];

const SORT_OPTIONS = [
  { value: "trending",  label: "Trending"   },
  { value: "newest",    label: "Newest"     },
  { value: "most-used", label: "Most Used"  },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkillSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0f0f12] p-5 flex flex-col gap-3 animate-pulse">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="h-3 w-full rounded bg-white/10" />
      <div className="h-3 w-5/6 rounded bg-white/10" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-5 w-12 rounded bg-white/10" />
        <div className="h-5 w-14 rounded bg-white/10" />
        <div className="h-5 w-10 rounded bg-white/10" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-12 rounded bg-white/10" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill Card
// ---------------------------------------------------------------------------

interface SkillGridCardProps {
  skill: Skill;
}

function SkillGridCard({ skill }: SkillGridCardProps) {
  const meta = CATEGORY_META[skill.category as CategoryKey];
  const color = meta?.color ?? "#8b5cf6";
  const label = meta?.label ?? skill.category;

  const difficultyDot: Record<string, string> = {
    beginner:     "bg-green-400",
    intermediate: "bg-amber-400",
    advanced:     "bg-red-400",
  };

  return (
    <article className="group relative flex flex-col rounded-xl border border-white/5 bg-[#0f0f12] p-5 transition-all duration-200 hover:border-white/15 hover:shadow-lg hover:shadow-black/40">
      {/* Trending badge — top right */}
      {skill.is_trending && (
        <span
          aria-label="Trending"
          className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-orange-400"
        >
          <Flame size={11} className="fill-orange-400" />
          TRENDING
        </span>
      )}

      {/* Category + NEW badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ color, background: `${color}18` }}
        >
          {label}
        </span>
        {skill.is_new && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/15 text-green-400">
            NEW
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white text-sm leading-snug mb-1">
        {skill.title}
      </h3>

      {/* Tagline */}
      <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
        {skill.tagline}
      </p>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Skill tags">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              difficultyDot[skill.difficulty] ?? "bg-white/30"
            )}
          />
          <span className="text-[10px] text-white/40 capitalize">{skill.difficulty}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">
            {skill.is_free ? "Free" : `₹${skill.price_inr.toLocaleString("en-IN")}`}
          </span>
          <Link
            href={`/skills/${skill.slug}`}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            View <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SkillsPage() {
  const [skills, setSkills]               = useState<Skill[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // Filters
  const [query, setQuery]                 = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [difficulty, setDifficulty]       = useState<DifficultyOption>("All");
  const [freeOnly, setFreeOnly]           = useState(false);
  const [sort, setSort]                   = useState<SortOption>("trending");
  const [page, setPage]                   = useState(1);

  // Debounce search input — 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeCategory, difficulty, freeOnly, sort]);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery)       params.set("q", debouncedQuery);
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (difficulty !== "All") params.set("difficulty", difficulty);
      if (freeOnly)             params.set("free", "true");
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/skills?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { skills: Skill[]; total: number };
      setSkills(data.skills ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeCategory, difficulty, freeOnly, sort, page]);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  const isFiltered =
    debouncedQuery !== "" ||
    activeCategory !== "all" ||
    difficulty !== "All" ||
    freeOnly ||
    sort !== "trending";

  const trendingSkills = skills.filter((s) => s.is_trending).slice(0, 6);
  const showTrending   = !isFiltered && !loading && trendingSkills.length > 0;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex   = Math.min(page * PAGE_SIZE, total);

  return (
    <main className="min-h-screen bg-[#07070a] text-white">

      {/* ------------------------------------------------------------------ */}
      {/* NAV                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#07070a]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={14} className="text-white/40 group-hover:text-white transition-colors" />
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <Zap size={12} />
            </div>
            <span className="font-semibold text-sm">Claude Toolkit</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ---------------------------------------------------------------- */}
        {/* PAGE HEADER                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-10">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2">
            Marketplace
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Skills Marketplace
          </h1>
          <p className="text-white/45 text-sm max-w-lg">
            New skills added daily. Browse, preview, and run in seconds.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SEARCH                                                            */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative mb-6">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills by name, tag, or category..."
            aria-label="Search skills"
            className={cn(
              "w-full h-11 pl-10 pr-4 rounded-xl bg-[#0f0f12] border border-white/10",
              "text-white text-sm placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
              "transition-colors"
            )}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* CATEGORY PILLS                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
              activeCategory === "all"
                ? "bg-violet-600 text-white"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
            )}
          >
            All
          </button>
          {(Object.entries(CATEGORY_META) as [CategoryKey, (typeof CATEGORY_META)[CategoryKey]][]).map(
            ([key, { label, color, emoji }]) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeCategory === key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border",
                  activeCategory === key
                    ? "text-white border-transparent"
                    : "text-white/50 border-white/10 bg-white/5 hover:text-white hover:bg-white/10"
                )}
                style={
                  activeCategory === key
                    ? { background: color, borderColor: color }
                    : {}
                }
              >
                <span aria-hidden>{emoji}</span>
                {label}
              </button>
            )
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FILTER BAR                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Difficulty */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyOption)}
              aria-label="Filter by difficulty"
              className={cn(
                "appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#0f0f12] border border-white/10",
                "text-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500",
                "cursor-pointer transition-colors hover:border-white/20"
              )}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d} className="bg-[#0f0f12]">
                  {d === "All" ? "All difficulties" : d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Free toggle */}
          <button
            onClick={() => setFreeOnly((v) => !v)}
            aria-pressed={freeOnly}
            className={cn(
              "h-9 px-4 rounded-lg text-xs font-medium transition-all border",
              freeOnly
                ? "bg-green-500/15 border-green-500/40 text-green-400"
                : "bg-[#0f0f12] border-white/10 text-white/50 hover:text-white hover:border-white/20"
            )}
          >
            Free only
          </button>

          {/* Sort */}
          <div className="relative ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label="Sort skills"
              className={cn(
                "appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#0f0f12] border border-white/10",
                "text-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500",
                "cursor-pointer transition-colors hover:border-white/20"
              )}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0f0f12]">
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* TRENDING SECTION                                                  */}
        {/* ---------------------------------------------------------------- */}
        {showTrending && (
          <section className="mb-12" aria-label="Trending skills">
            <div className="flex items-center gap-2 mb-5">
              <Flame size={15} className="text-orange-400 fill-orange-400" />
              <h2 className="font-semibold text-sm text-white">Trending right now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSkills.map((skill) => (
                <SkillGridCard key={skill.id} skill={skill} />
              ))}
            </div>
            <div className="mt-8 border-b border-white/5" />
            <h2 className="font-semibold text-sm text-white mt-8 mb-5">All Skills</h2>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* SKILLS GRID                                                       */}
        {/* ---------------------------------------------------------------- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkillSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-white/40 text-sm mb-2">{error}</p>
            <button
              onClick={() => void fetchSkills()}
              className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin mb-6" />
            <p className="text-white/50 text-sm mb-1">Skills are loading...</p>
            <p className="text-white/30 text-xs">Check back shortly</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <SkillGridCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* PAGINATION                                                        */}
        {/* ---------------------------------------------------------------- */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-10">
            <span className="text-xs text-white/30">
              Showing {startIndex}–{endIndex} of {total} skills
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  page === 1
                    ? "border-white/5 text-white/20 cursor-not-allowed"
                    : "border-white/10 text-white/60 hover:text-white hover:border-white/20"
                )}
              >
                <ArrowLeft size={12} /> Prev
              </button>
              <span className="text-xs text-white/30">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  page === totalPages
                    ? "border-white/5 text-white/20 cursor-not-allowed"
                    : "border-white/10 text-white/60 hover:text-white hover:border-white/20"
                )}
              >
                Next <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* ALL-ACCESS UPSELL                                                 */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-16 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-pink-900/10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1">
              All-Access
            </p>
            <h2 className="text-lg font-bold mb-1">
              Get every skill for ₹2,407/mo
            </h2>
            <p className="text-white/40 text-sm">
              All current + future skills. API access included. Cancel anytime.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm"
          >
            Start All-Access
          </Link>
        </div>
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
