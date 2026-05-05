"use client";

/**
 * ConditionalSidebar — renders the marketplace sidebar only on pages
 * that aren't account pages (which have their own sidebar layout).
 *
 * Also suppresses the sidebar on sign-in / sign-up pages so Clerk's
 * centered auth UI isn't offset by the 220px sidebar.
 */

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

// Prefixes that should NOT show the marketplace sidebar.
// Includes per-product landing pages (/chatbase, /taxpilot, etc.) — each
// product is its own brand and should not appear inside the Claude Toolkit
// shell. This matters for the exit-strategy goal: each product becomes a
// transferable asset only when it stands alone visually.
const SIDEBAR_EXCLUDED_PREFIXES = [
  "/account",
  "/admin",
  "/sign-in",
  "/sign-up",
  "/dashboard",
  // Per-product brands
  "/chatbase",
  "/taxpilot",
  "/tableflow",
  "/connectone",
  "/machineguard",
];

export function ConditionalSidebar() {
  const pathname = usePathname();

  const excluded = SIDEBAR_EXCLUDED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (excluded) {
    return null;
  }

  return <Sidebar />;
}
