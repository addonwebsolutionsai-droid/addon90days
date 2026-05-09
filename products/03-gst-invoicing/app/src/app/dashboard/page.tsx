/**
 * /dashboard/taxpilot — list businesses owned by the signed-in user.
 *
 * Server component. Loads businesses via lib/p03/db scoped by Clerk userId.
 * Shows an empty-state CTA when the user has none.
 */

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plus, Building2, ArrowRight, FileText } from "lucide-react";
import { listBusinesses } from "@/lib/p03/db";

export const dynamic = "force-dynamic";

export default async function TaxPilotDashboard() {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/dashboard");

  const businesses = await listBusinesses(userId);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3 mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            TaxPilot · Phase 1
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Your businesses</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Add a business to start creating GST-compliant invoices.
          </p>
        </div>
        {businesses.length > 0 && (
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add business
          </Link>
        )}
      </header>

      {/* Phase 2 status notice */}
      <div
        className="rounded-xl border p-3 mb-6 text-xs flex items-start gap-2"
        style={{ backgroundColor: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.30)", color: "#93c5fd" }}
      >
        <span className="mt-0.5">ⓘ</span>
        <p className="leading-relaxed">
          <strong>Phase 1 — invoicing only.</strong> Create invoices, manage customers,
          export PDFs. Direct GSTR filing + e-invoice IRN generation lands in Phase 2
          (after GSTN portal access is approved). Free during the entire beta.
        </p>
      </div>

      {/* List or empty state */}
      {businesses.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2">
          {businesses.map((b) => (
            <li key={b.id}>
              <Link
                href={`/dashboard/${b.id}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors hover:border-violet-500/40"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-violet-400 shrink-0" />
                    <span className="text-sm font-semibold truncate">{b.legal_name}</span>
                    {b.gstin !== null && (
                      <span
                        className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                        style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80" }}
                      >
                        GST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted)" }}>
                    {b.gstin !== null && <span className="font-mono">{b.gstin}</span>}
                    <span>{b.state_name}</span>
                    <span>·</span>
                    <span>{b.gst_scheme}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-violet-400 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-xl border p-8 text-center"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
      >
        <FileText size={24} className="text-white" />
      </div>
      <h2 className="text-base font-bold mb-1.5">No businesses yet</h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Add the legal entity you invoice from. You can add more later — each business
        gets its own GSTIN, invoice numbering, and brand.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
      >
        <Plus size={14} /> Add your first business
      </Link>
    </div>
  );
}
