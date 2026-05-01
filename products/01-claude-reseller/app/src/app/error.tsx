"use client";

/**
 * Root error boundary — caught by Next.js App Router for any uncaught
 * server or client error in a route segment.
 *
 * Must be a client component (Next.js requirement). Keep it minimal:
 * no Clerk, no Supabase. The chat widget already lives in the root
 * layout and remains available even when the route segment errors.
 */

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, MessageCircle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Sentry/PostHog will be wired here once founder provisions DSN keys.
    // For now we surface the digest in dev only — never the full message
    // (it can leak server-side details).
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Route error:", error);
    }
  }, [error]);

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
          Something broke
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          That&apos;s on us, not you.
        </h1>
        <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
          We hit an unexpected error rendering this page. The team has been
          notified. You can retry, or jump back to the marketplace.
        </p>
        {error.digest !== undefined ? (
          <p className="text-xs font-mono mb-7" style={{ color: "var(--text-muted)" }}>
            Reference: {error.digest}
          </p>
        ) : (
          <div className="mb-7" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:border-violet-500/50"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={14} />
            Back to skills
          </Link>
        </div>

        <p className="mt-10 text-xs flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <MessageCircle size={12} />
          Still stuck? The chat widget in the corner reaches the founder directly.
        </p>
      </div>
    </main>
  );
}
