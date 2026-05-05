"use client";

/**
 * Sidebar — fixed left-side navigation for the marketplace.
 *
 * Replaces the top Nav for all public-facing pages.
 * Account pages use their own layout (account/layout.tsx) — untouched.
 *
 * Sections:
 *   Logo / brand
 *   WORKPLACE — My Skills (authenticated link)
 *   BROWSE — category links with live counts
 *   RESOURCES — Trending, Blog, Docs, GitHub
 *   Bottom — theme toggle + auth button
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Infinity as InfinityIcon,
  Menu,
  X,
  TrendingUp,
  BookOpen,
  FileText,
  ChevronLeft,
  Download,
  Sparkles,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

// ---------------------------------------------------------------------------
// Category data
// ---------------------------------------------------------------------------

const CATEGORY_META = [
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
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryCounts = Record<string, number>;

// ---------------------------------------------------------------------------
// Sidebar inner content — shared between desktop and mobile sheet
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  counts: CategoryCounts;
  total: number;
  activeCategory: string | null;
  onNavigate?: () => void;
}

function SidebarContent({ counts, total, activeCategory, onNavigate }: SidebarContentProps) {
  const { isSignedIn, isLoaded } = useUser();

  return (
    // Outer column: NO overflow on this layer. Brand stays pinned top,
    // bottom auth bar stays pinned bottom, only the middle nav scrolls.
    // Previously had nested overflow-y-auto on both this and the middle
    // div — they fought each other and bottom items got cut off.
    <div className="flex flex-col h-full">
      {/* Brand — entire group is the home link, not just the text */}
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="SKILON — AI Skills. Limitless Future."
        className="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
      >
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <InfinityIcon size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-sm leading-none tracking-wide">SKILON</span>
      </Link>

      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto subtle-scrollbar min-h-0">

        {/* WORKPLACE */}
        <section aria-label="Workplace">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Workplace
          </p>
          <Link
            href="/account/skills"
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:bg-violet-500/10 hover:text-violet-400"
            style={{ color: "var(--text-secondary)" }}
          >
            <Download size={13} />
            My Skills
          </Link>
        </section>

        {/* DISCOVER — quick filters across the catalog. Sit above Browse so
            users land on a curated view (trending / new / etc.) before they
            commit to a specific category. */}
        <section aria-label="Discover">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Discover
          </p>
          {[
            { href: "/skills?sort=trending", icon: TrendingUp, label: "Trending" },
            { href: "/skills?sort=newest",   icon: Sparkles,   label: "Newest"   },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:bg-violet-500/10 hover:text-violet-400"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </section>

        {/* BROWSE */}
        <section aria-label="Browse categories">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Browse
          </p>

          {/* All skills link */}
          <Link
            href="/skills"
            onClick={onNavigate}
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 sidebar-category-link ${
              activeCategory === null ? "bg-violet-600 text-white" : "hover:bg-violet-500/10 hover:text-violet-400"
            }`}
            style={activeCategory === null ? {} : { color: "var(--text-secondary)" }}
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none" aria-hidden>✦</span>
              Skills
            </span>
            <CountBadge value={total} active={activeCategory === null} />
          </Link>

          {CATEGORY_META.map(({ key, emoji, label, color }) => {
            const isActive = activeCategory === key;
            return (
              <Link
                key={key}
                href={`/skills/category/${key}`}
                onClick={onNavigate}
                className={`sidebar-category-link flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive ? "text-white" : "hover:bg-violet-500/10 hover:text-violet-400"
                }`}
                style={
                  isActive
                    ? { backgroundColor: color }
                    : { color: "var(--text-secondary)" }
                }
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none shrink-0" aria-hidden>{emoji}</span>
                  <span className="truncate">{label}</span>
                </span>
                {counts[key] !== undefined && (
                  <CountBadge value={counts[key] ?? 0} active={isActive} />
                )}
              </Link>
            );
          })}
        </section>

        {/* RESOURCES */}
        <section aria-label="Resources">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Resources
          </p>
          {[
            { href: "/skills?sort=trending", icon: TrendingUp, label: "Trending" },
            { href: "#",                     icon: BookOpen,   label: "Blog",         soon: true },
            { href: "#",                     icon: FileText,   label: "Docs",         soon: true },
          ].map(({ href, icon: Icon, label, soon, external }: { href: string; icon: typeof TrendingUp; label: string; soon?: boolean; external?: boolean }) => (
            <Link
              key={label}
              href={href}
              onClick={!external ? onNavigate : undefined}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:bg-violet-500/10 hover:text-violet-400"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon size={13} />
              {label}
              {soon && (
                <span
                  className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: "var(--bg-s3)", color: "var(--text-muted)" }}
                >
                  SOON
                </span>
              )}
            </Link>
          ))}
        </section>
      </div>

      {/* Bottom: theme toggle + auth */}
      <div
        className="px-3 py-3 border-t flex items-center gap-2 shrink-0"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <ThemeToggle />
        <div className="flex-1 min-w-0">
          {/* While Clerk hydrates, render a neutral placeholder so we don't
              flash "Sign in" at users who are already signed in. */}
          {!isLoaded ? (
            <div className="h-7 w-7 rounded-full bg-white/5 animate-pulse" aria-hidden />
          ) : isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
              <Link
                href="/account"
                className="text-xs truncate hover:text-violet-400 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Account
              </Link>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="text-xs font-medium hover:text-violet-400 transition-colors truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in
            </Link>
          )}
        </div>
        {isLoaded && !isSignedIn && (
          <Link
            href="/sign-up"
            className="shrink-0 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[11px] font-medium transition-colors"
          >
            Get started
          </Link>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Count badge
// ---------------------------------------------------------------------------

function CountBadge({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded ml-2"
      style={{
        backgroundColor: active ? "rgba(255,255,255,0.2)" : "var(--bg-s2)",
        color: active ? "rgba(255,255,255,0.85)" : "var(--text-muted)",
      }}
    >
      {value.toLocaleString()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Exported sidebar — handles desktop fixed + mobile drawer
// ---------------------------------------------------------------------------

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [counts, setCounts] = useState<CategoryCounts>({});
  const [total, setTotal] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive active category from URL. Two URL shapes are valid:
  //   /skills?category=indian-business         (legacy filter form)
  //   /skills/category/indian-business         (SEO landing page)
  // Either should highlight the same sidebar item.
  const fromQuery = searchParams.get("category");
  const fromPath  = pathname.startsWith("/skills/category/")
    ? pathname.slice("/skills/category/".length).split("/")[0] ?? null
    : null;
  const activeCategory = fromPath ?? fromQuery;

  // Fetch category counts — cache via SWR-style with 5min cache
  useEffect(() => {
    const cached = sessionStorage.getItem("sidebar_counts");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { counts: CategoryCounts; total: number; ts: number };
        if (Date.now() - parsed.ts < 5 * 60 * 1000) {
          setCounts(parsed.counts);
          setTotal(parsed.total);
          return;
        }
      } catch {
        // ignore invalid cache
      }
    }

    void (async () => {
      try {
        // /api/skills caps `limit` server-side at 100 — paginate until exhausted
        // so per-category counts match the actual catalog size. Without this
        // loop the sidebar undercounted any category whose skills landed past
        // the first 100 rows.
        const c: CategoryCounts = {};
        let total = 0;
        for (let page = 1; page <= 20; page++) {
          const res = await fetch(`/api/skills?limit=100&page=${page}`);
          if (!res.ok) break;
          const data = await res.json() as {
            skills:  Array<{ category: string }>;
            total?:  number;
            hasMore?: boolean;
          };
          if (typeof data.total === "number") total = data.total;
          for (const s of data.skills) {
            c[s.category] = (c[s.category] ?? 0) + 1;
          }
          if (data.hasMore === false || data.skills.length < 100) break;
        }
        setCounts(c);
        setTotal(total > 0 ? total : Object.values(c).reduce((a, b) => a + b, 0));
        sessionStorage.setItem("sidebar_counts", JSON.stringify({ counts: c, total, ts: Date.now() }));
      } catch {
        // non-critical
      }
    })();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      {/* Desktop sidebar — fixed */}
      <aside
        className="hidden lg:flex flex-col w-[220px] shrink-0 fixed top-0 left-0 h-screen z-40 border-r"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
        aria-label="Main navigation"
      >
        <SidebarContent
          counts={counts}
          total={total}
          activeCategory={activeCategory}
        />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg border"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
        aria-label="Open navigation"
      >
        <Menu size={16} />
      </button>

      {/* Mobile logo shown when sidebar is closed */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-center border-b pointer-events-none"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
            <InfinityIcon size={12} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>
            SKILON
          </span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="relative z-10 w-[260px] flex flex-col h-full border-r"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-violet-500/10"
              style={{ color: "var(--text-muted)" }}
              aria-label="Close navigation"
            >
              <X size={15} />
            </button>
            <SidebarContent
              counts={counts}
              total={total}
              activeCategory={activeCategory}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Spacer — pushes content right on desktop */}
      <div className="hidden lg:block w-[220px] shrink-0" aria-hidden />
    </>
  );
}

// Re-export collapse icon for potential future use — avoiding dead import lint
export { ChevronLeft };
