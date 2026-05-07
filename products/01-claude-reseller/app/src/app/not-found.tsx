import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getSkillCountLabel } from "@/lib/catalog-stats";

/**
 * Custom 404 — branded with the same violet/pink accents as the marketplace.
 *
 * This is rendered for any unmatched route (Next.js App Router convention).
 * Kept light: no Clerk, no Supabase calls, no client islands. Must always
 * render even if the rest of the app has crashed.
 */

export const metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist on SKILON.",
};

export default async function NotFound() {
  const skillCountLabel = await getSkillCountLabel();
  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="max-w-md w-full text-center">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404 · Not found
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          We can&apos;t find that page.
        </h1>
        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--text-secondary)" }}>
          The skill or page you&apos;re looking for may have been renamed,
          moved, or never existed. Try the marketplace — {skillCountLabel} skills, all free
          for the first year.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
          >
            <Search size={14} />
            Browse skills
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:border-violet-500/50"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={14} />
            Back home
          </Link>
        </div>

        <p className="mt-10 text-xs" style={{ color: "var(--text-muted)" }}>
          Need help? Email{" "}
          <a
            href="mailto:support@addonweb.io"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            support@addonweb.io
          </a>{" "}
          or use the chat widget.
        </p>
      </div>
    </main>
  );
}
