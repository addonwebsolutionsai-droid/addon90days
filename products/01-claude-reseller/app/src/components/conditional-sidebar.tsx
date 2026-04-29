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

// Prefixes that should NOT show the marketplace sidebar
const SIDEBAR_EXCLUDED_PREFIXES = [
  "/account",
  "/sign-in",
  "/sign-up",
  "/dashboard",
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
