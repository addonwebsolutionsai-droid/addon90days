"use client";

import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = [
  "/account",
  "/sign-in",
  "/sign-up",
  "/dashboard",
  // Per-product brands have their own layouts
  "/chatbase",
  "/taxpilot",
  "/tableflow",
  "/connectone",
  "/machineguard",
];

/**
 * Mobile spacer — occupies the height of the mobile top bar
 * so page content doesn't sit under the hamburger button.
 * Hidden on pages that have their own full-screen layout.
 */
export function MobileSpacer() {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
  if (excluded) return null;
  return <div className="lg:hidden h-14 shrink-0" aria-hidden />;
}
