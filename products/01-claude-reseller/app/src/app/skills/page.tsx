"use client";

/**
 * Skills Marketplace — Browse & Search
 *
 * Component tree:
 *   SkillsPage (client, owns all filter state)
 *     ├── SearchBar
 *     ├── CategoryPills (horizontal scroll, synced with sidebar selection via URL)
 *     ├── FilterBar (difficulty, free toggle, sort)
 *     ├── TrendingSection  (only when no active filter)
 *     ├── SkillsGrid / SkillSkeleton / EmptyState
 *     └── Pagination
 *
 * No Nav rendered here — the root layout sidebar provides navigation.
 * Category filter is also controlled from the sidebar via ?category= URL param.
 */

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Flame,
  ArrowLeft,
  ArrowRight,
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
  { value: "trending",  label: "Trending"  },
  { value: "newest",    label: "Newest"    },
  { value: "most-used", label: "Most Used" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkillSkeleton() {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 animate-pulse"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="h-3.5 w-20 rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
      <div className="h-4 w-3/4 rounded"  style={{ backgroundColor: "var(--bg-s2)" }} />
      <div className="h-3 w-full rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
      <div className="h-3 w-5/6 rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
      <div className="flex gap-1.5 mt-1">
        <div className="h-4 w-10 rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
        <div className="h-4 w-12 rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
      </div>
      <div
        className="flex items-center justify-between mt-auto pt-2 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="h-3.5 w-14 rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
        <div className="h-3.5 w-10 rounded" style={{ backgroundColor: "var(--bg-s2)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill Card
// ---------------------------------------------------------------------------

interface SkillGridCardProps {
  skill: Skill;
  index: number;
}

function SkillGridCard({ skill, index }: SkillGridCardProps) {
  const meta  = CATEGORY_META[skill.category as CategoryKey];
  const color = meta?.color ?? "#8b5cf6";
  const label = meta?.label ?? skill.category;

  const difficultyColor: Record<string, string> = {
    beginner:     "bg-green-500",
    intermediate: "bg-amber-400",
    advanced:     "bg-red-400",
  };

  const stepCount = Array.isArray(skill.steps) ? skill.steps.length : 0;

  return (
    <article
      className="skill-card group relative flex flex-col rounded-xl border transition-all duration-150"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        borderLeftColor: color,
        borderLeftWidth: "3px",
        // Stagger fade-in via CSS custom property
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="p-4 flex flex-col flex-1">
        {/* Trending badge */}
        {skill.is_trending && (
          <span
            aria-label="Trending"
            className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-orange-400"
          >
            <Flame size={10} className="fill-orange-400" />
            TRENDING
          </span>
        )}

        {/* Category + NEW badge */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color, backgroundColor: `${color}18` }}
          >
            {label}
          </span>
          {skill.is_new && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/15 text-green-500">
              NEW
            </span>
          )}
          {stepCount > 0 && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded ml-auto"
              style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-s2)" }}
            >
              {stepCount}s
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-sm leading-snug mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {skill.title}
        </h3>

        {/* Tagline */}
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-3 flex-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {skill.tagline}
        </p>

        {/* Tags */}
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3" aria-label="Skill tags">
            {skill.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
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
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                difficultyColor[skill.difficulty] ?? "bg-gray-400"
              )}
            />
            <span
              className="text-[10px] capitalize"
              style={{ color: "var(--text-muted)" }}
            >
              {skill.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-green-500/15 text-green-500">
              Free
            </span>
            <Link
              href={`/skills/${skill.slug}`}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              View <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

// Wrap in Suspense so useSearchParams doesn't break static generation
export default function SkillsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "#8b5cf6" }} />
      </div>
    }>
      <SkillsPage />
    </Suspense>
  );
}

function SkillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded: authLoaded } = useUser();

  const [skills, setSkills]                 = useState<Skill[]>([]);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // Filters — category comes from URL so sidebar stays in sync
  const [query, setQuery]                   = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [difficulty, setDifficulty]         = useState<DifficultyOption>("All");
  const [sort, setSort]                     = useState<SortOption>("trending");
  const [page, setPage]                     = useState(1);

  // Read category from URL param (sidebar writes this)
  const activeCategory = searchParams.get("category") ?? "all";

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeCategory, difficulty, sort]);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery)             params.set("q",         debouncedQuery);
      if (activeCategory !== "all")   params.set("category",  activeCategory);
      if (difficulty !== "All")       params.set("difficulty", difficulty);
      params.set("sort",     sort);
      params.set("page",     String(page));
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
  }, [debouncedQuery, activeCategory, difficulty, sort, page]);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  // Helper to update category in URL
  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/skills?${params.toString()}`);
  }

  const isFiltered =
    debouncedQuery !== "" ||
    activeCategory !== "all" ||
    difficulty !== "All" ||
    sort !== "trending";

  const trendingSkills = skills.filter((s) => s.is_trending).slice(0, 6);
  const showTrending   = !isFiltered && !loading && trendingSkills.length > 0;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex   = Math.min(page * PAGE_SIZE, total);

  const activeCategoryMeta = activeCategory !== "all"
    ? CATEGORY_META[activeCategory as CategoryKey]
    : null;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* Live banner — copy depends on auth state. Hidden during Clerk
            hydration so the wrong message never flashes. */}
        {authLoaded && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 flex items-center gap-3 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="font-semibold text-green-500 uppercase tracking-wider text-xs">Live</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {isSignedIn === true ? (
                <>All 130+ skills free for the first year. Pick one and run <code className="px-1.5 py-0.5 rounded font-mono text-[11px]" style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-primary)" }}>npx addonweb-claude-skills install &lt;slug&gt;</code> to install.</>
              ) : (
                <>All 130+ skills free for the first year. <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 underline">Sign up</Link> to install.</>
              )}
            </span>
          </div>
        )}

        {/* Page header */}
        <div className="mb-7">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1.5">
            Marketplace
          </p>
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">
            {activeCategoryMeta
              ? `${activeCategoryMeta.emoji} ${activeCategoryMeta.label}`
              : "Skills Marketplace"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            New skills added daily. Browse, preview, and install in seconds.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills by name, tag, or category..."
            aria-label="Search skills"
            className={cn(
              "w-full h-10 pl-9 pr-4 rounded-xl border text-sm",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
              "transition-colors"
            )}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Category pills — synced with sidebar */}
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => setCategory("all")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              activeCategory === "all" ? "bg-violet-600 text-white" : "border"
            )}
            style={
              activeCategory !== "all"
                ? {
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }
                : {}
            }
          >
            All
          </button>
          {(Object.entries(CATEGORY_META) as [CategoryKey, (typeof CATEGORY_META)[CategoryKey]][]).map(
            ([key, { label, color, emoji }]) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeCategory === key}
                onClick={() => setCategory(key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  activeCategory === key ? "text-white border-transparent" : ""
                )}
                style={
                  activeCategory === key
                    ? { background: color, borderColor: color }
                    : {
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                <span aria-hidden>{emoji}</span>
                {label}
              </button>
            )
          )}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-7">
          {/* Difficulty */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyOption)}
              aria-label="Filter by difficulty"
              className={cn(
                "appearance-none h-8 pl-3 pr-7 rounded-lg border",
                "text-xs focus:outline-none focus:ring-2 focus:ring-violet-500",
                "cursor-pointer transition-colors"
              )}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d} style={{ backgroundColor: "var(--bg-surface)" }}>
                  {d === "All" ? "All difficulties" : d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
          </div>

          {/* Sort */}
          <div className="relative ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label="Sort skills"
              className={cn(
                "appearance-none h-8 pl-3 pr-7 rounded-lg border",
                "text-xs focus:outline-none focus:ring-2 focus:ring-violet-500",
                "cursor-pointer transition-colors"
              )}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ backgroundColor: "var(--bg-surface)" }}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>

        {/* Trending section */}
        {showTrending && (
          <section className="mb-10" aria-label="Trending skills">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={14} className="text-orange-400 fill-orange-400" />
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Trending right now
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {trendingSkills.map((skill, i) => (
                <SkillGridCard key={skill.id} skill={skill} index={i} />
              ))}
            </div>
            <div className="mt-7 border-b" style={{ borderColor: "var(--border-subtle)" }} />
            <h2
              className="font-semibold text-sm mt-7 mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              All Skills
            </h2>
          </section>
        )}

        {/* Skills grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              // Index key is fine for static skeleton rows
              // eslint-disable-next-line react/no-array-index-key
              <SkillSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>{error}</p>
            <button
              onClick={() => void fetchSkills()}
              className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-violet-500 animate-spin mb-5"
              style={{ borderColor: "var(--border)", borderTopColor: "#8b5cf6" }}
            />
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Skills are loading...
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Check back shortly</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {skills.map((skill, i) => (
              <SkillGridCard key={skill.id} skill={skill} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-8">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing {startIndex}–{endIndex} of {total} skills
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  page === 1 ? "opacity-30 cursor-not-allowed" : "hover:border-violet-500/50"
                )}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <ArrowLeft size={11} /> Prev
              </button>
              <span className="text-xs px-2" style={{ color: "var(--text-muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:border-violet-500/50"
                )}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Next <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom CTA — show "Sign up" for anon, "Connect Claude Desktop"
            for signed-in users (the natural next action once they've signed
            up; pulls them into /account#connect for the MCP config copy). */}
        {authLoaded && isSignedIn !== true && (
          <div className="mt-14 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-900/20 to-violet-900/10 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-xs text-green-500 font-medium uppercase tracking-widest mb-1">
                Free for the first year
              </p>
              <h2 className="text-base font-bold mb-1">
                Sign up to install any skill
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No credit card. All 130+ skills free for the first year.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="shrink-0 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
            >
              Create free account
            </Link>
          </div>
        )}
        {authLoaded && isSignedIn === true && (
          <div className="mt-14 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-pink-900/10 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1">
                You&apos;re signed in
              </p>
              <h2 className="text-base font-bold mb-1">
                Connect Claude Desktop in 30 seconds
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Paste one MCP config block and all 130 skills appear as tools.
              </p>
            </div>
            <Link
              href="/account#connect"
              className="shrink-0 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
            >
              Open Connect
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="border-t py-7 text-center text-xs"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
      >
        © 2026 AddonWeb Solutions · Ahmedabad, India ·{" "}
        <a href="mailto:support@addonweb.io" className="hover:text-violet-400 transition-colors">
          support@addonweb.io
        </a>
      </footer>
    </div>
  );
}
