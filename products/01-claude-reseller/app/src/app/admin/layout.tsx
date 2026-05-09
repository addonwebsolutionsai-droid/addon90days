import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import Link from "next/link";
import { Shield, Users, MessageCircle, FileText, ArrowLeft } from "lucide-react";

export const metadata = { title: "Admin · SKILON" };

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
        className="hidden md:flex flex-col w-56 shrink-0 border-r"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-5 h-14 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <span className="font-semibold text-sm">Admin</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <Users size={15} />
            Users
          </Link>
          <Link
            href="/admin/chatbase"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <MessageCircle size={15} />
            ChatBase (P02)
          </Link>
          <Link
            href="/admin/taxpilot"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <FileText size={15} />
            TaxPilot (P03)
          </Link>
        </nav>

        <Link
          href="/"
          className="px-4 py-3 border-t flex items-center gap-2 text-xs transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          <ArrowLeft size={12} />
          Back to site
        </Link>
      </aside>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
