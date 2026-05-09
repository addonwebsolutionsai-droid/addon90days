// AUTO-SYNCED FROM packages/admin-shell/src/PlaceholderPanel.tsx — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:11:45.342Z
/**
 * PlaceholderPanel — reusable "coming soon" panel for per-product admin sub-pages.
 *
 * Keeps placeholder pages at 5 lines each. When a sub-page is built out,
 * replace this with the real implementation; don't change the import path.
 */

import Link from "next/link";
import { Clock } from "lucide-react";

interface PlaceholderPanelProps {
  title: string;
  description: string;
  /** Optional href to a related panel that IS already built. */
  crossLinkHref?: string;
  crossLinkLabel?: string;
}

export function PlaceholderPanel({
  title,
  description,
  crossLinkHref,
  crossLinkLabel,
}: PlaceholderPanelProps) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </header>

      <div
        className="rounded-xl border p-8 flex flex-col items-center text-center gap-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          borderStyle: "dashed",
        }}
      >
        <Clock size={32} style={{ color: "var(--text-muted)" }} />

        <div className="space-y-1 max-w-sm">
          <p className="text-sm font-medium">{description}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            This panel is scaffolded and ready for implementation.
          </p>
        </div>

        {crossLinkHref !== undefined && crossLinkLabel !== undefined && (
          <Link
            href={crossLinkHref}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            {crossLinkLabel} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
