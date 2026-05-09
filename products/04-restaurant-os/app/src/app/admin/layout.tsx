/**
 * /admin/p04-tableflow — P04 TableFlow per-product admin shell.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductSubNav } from "@/components/admin/ProductSubNav";

export const metadata = { title: "TableFlow · Admin" };

const PRODUCT_KEY = "p04-tableflow";
const PRODUCT_NAME = "TableFlow";
// Orange — P04 brand color
const ACCENT = "#f97316";

const SUB_NAV = [
  { label: "Overview",  href: `/admin/${PRODUCT_KEY}` },
  { label: "Team",      href: `/admin/${PRODUCT_KEY}/team` },
  { label: "Users",     href: `/admin/${PRODUCT_KEY}/users` },
  { label: "Plans",     href: `/admin/${PRODUCT_KEY}/plans` },
  { label: "Billing",   href: `/admin/${PRODUCT_KEY}/billing` },
  { label: "CMS",       href: `/admin/${PRODUCT_KEY}/cms` },
  { label: "Settings",  href: `/admin/${PRODUCT_KEY}/settings` },
  { label: "Activity",  href: `/admin/${PRODUCT_KEY}/activity` },
  { label: "Tutorials", href: `/admin/${PRODUCT_KEY}/tutorials` },
  { label: "Support",   href: `/admin/${PRODUCT_KEY}/support` },
];

export default function TableflowAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-0">
      <div
        className="border-b px-4 py-2 flex items-center justify-between gap-3"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          borderLeftWidth: 3,
          borderLeftColor: ACCENT,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }}
          />
          <span className="text-sm font-semibold">{PRODUCT_NAME}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider"
            style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
          >
            P04
          </span>
        </div>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[11px]">
          <Link href="/admin" className="transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>
            Admin
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>{PRODUCT_NAME}</span>
        </nav>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-[11px] transition-colors hover:text-white"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={11} /> Admin home
        </Link>
      </div>

      <div
        className="border-b"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <ProductSubNav items={SUB_NAV} accentColor={ACCENT} />
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}
