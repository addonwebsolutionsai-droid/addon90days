"use client";

/**
 * ViewBeacon — fires a single POST /api/skills/[slug]/view on mount to bump
 * the skill's view counter. Server-side dedup ensures one visitor refreshing
 * the page counts as one view per 24h, not N views.
 *
 * Renders nothing. Failures are silent — analytics shouldn't break UX.
 */

import { useEffect } from "react";

export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    // sendBeacon is fire-and-forget and survives navigation; falls back to
    // fetch if unavailable (older browsers / non-browser env).
    const url = `/api/skills/${encodeURIComponent(slug)}/view`;
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      try {
        navigator.sendBeacon(url, new Blob([], { type: "application/json" }));
        return;
      } catch {
        /* fall through to fetch */
      }
    }
    void fetch(url, { method: "POST", keepalive: true }).catch(() => undefined);
  }, [slug]);

  return null;
}
