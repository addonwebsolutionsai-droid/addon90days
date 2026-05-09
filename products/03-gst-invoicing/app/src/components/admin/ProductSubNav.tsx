// AUTO-SYNCED FROM packages/admin-shell/src/ProductSubNav.tsx — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:15:37.490Z
"use client";
/**
 * ProductSubNav — thin client component for per-product admin sub-navigation.
 *
 * Must be client-only because it calls usePathname() for active-link styling.
 * Kept intentionally small — the parent layout is a server component.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SubNavItem {
  label: string;
  href: string;
}

interface ProductSubNavProps {
  items: SubNavItem[];
  accentColor: string; // CSS color value for the active indicator
}

export function ProductSubNav({ items, accentColor }: ProductSubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-0.5 overflow-x-auto px-3 py-1.5"
      aria-label="Product admin sub-navigation"
    >
      {items.map((item) => {
        // Exact match for overview (no trailing segment), prefix match for sub-pages
        const isOverview = item.href === items[0]?.href;
        const active = isOverview
          ? pathname === item.href || pathname === item.href + "/"
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
            style={
              active
                ? { color: accentColor, backgroundColor: `${accentColor}18` }
                : { color: "var(--text-secondary)" }
            }
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
