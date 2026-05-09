import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import Link from "next/link";
import { Shield, Users, ArrowLeft, FileText, BookText } from "lucide-react";

export const metadata = { title: "Admin · SKILON" };

// Brand color per product — used for the sidebar dot indicator
const PRODUCTS = [
  { key: "p01-skilon",      label: "P01 SKILON",       color: "#8b5cf6" }, // violet
  { key: "p02-chatbase",    label: "P02 ChatBase",      color: "#22c55e" }, // green
  { key: "p03-taxpilot",    label: "P03 TaxPilot",      color: "#3b82f6" }, // blue
  { key: "p04-tableflow",   label: "P04 TableFlow",     color: "#f97316" }, // orange
  { key: "p05-connectone",  label: "P05 ConnectOne",    color: "#06b6d4" }, // cyan
  { key: "p06-machineguard",label: "P06 MachineGuard",  color: "#f59e0b" }, // amber
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin");
    redirect("/");
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center gap-2 px-5 h-14 border-b shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <span className="font-semibold text-sm">Admin</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {/* ── Global ── */}
          <section>
            <p
              className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Global
            </p>
            <SidebarLink href="/admin/users" icon={<Users size={14} />} label="Users" />
            <SidebarLink href="/admin/audit" icon={<FileText size={14} />} label="Audit" muted />
          </section>

          {/* ── Products ── */}
          <section>
            <p
              className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Products
            </p>
            {PRODUCTS.map((p) => (
              <Link
                key={p.key}
                href={`/admin/${p.key}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                {/* Brand color dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
              </Link>
            ))}
          </section>

          {/* ── Cross-product ── */}
          <section>
            <p
              className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Cross-product
            </p>
            <SidebarLink href="/admin/cms"     icon={<LayoutGrid size={14} />} label="CMS"     muted />
            <SidebarLink href="/admin/billing" icon={<FileText size={14} />}   label="Billing" muted />
          </section>
        </nav>

        <Link
          href="/"
          className="px-4 py-3 border-t flex items-center gap-2 text-xs transition-colors hover:bg-white/5 shrink-0"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          <ArrowLeft size={12} />
          Back to site
        </Link>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function SidebarLink({
  href,
  icon,
  label,
  muted = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
      style={{ color: muted ? "var(--text-muted)" : "var(--text-secondary)" }}
    >
      <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
        {icon}
      </span>
      {label}
      {muted && (
        <span
          className="ml-auto text-[9px] uppercase tracking-wider px-1 py-0.5 rounded"
          style={{ backgroundColor: "rgba(168,168,179,0.10)", color: "var(--text-muted)" }}
        >
          soon
        </span>
      )}
    </Link>
  );
}
