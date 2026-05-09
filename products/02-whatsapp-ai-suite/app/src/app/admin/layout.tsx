/**
 * /admin — P02 ChatBase per-product admin shell.
 *
 * Server component. Active-link state delegated to <ProductSubNav> (client).
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductSubNav } from "@/components/admin/ProductSubNav";

export const metadata = { title: "ChatBase · Admin" };

const PRODUCT_NAME = "ChatBase";
// Green — P02 brand color
const ACCENT = "#22c55e";

const SUB_NAV = [
  { label: "Overview",  href: "/admin" },
  { label: "Team",      href: "/admin/team" },
  { label: "Users",     href: "/admin/users" },
  { label: "Plans",     href: "/admin/plans" },
  { label: "Billing",   href: "/admin/billing" },
  { label: "CMS",       href: "/admin/cms" },
  { label: "Settings",  href: "/admin/settings" },
  { label: "Activity",  href: "/admin/activity" },
  { label: "Tutorials", href: "/admin/tutorials" },
  { label: "Support",   href: "/admin/support" },
];

export default function ChatbaseAdminLayout({ children }: { children: React.ReactNode }) {
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
            P02
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
