/**
 * /dashboard/taxpilot — TaxPilot owner dashboard.
 *
 * Auth-gated by /middleware.ts (matches "/dashboard(.*)"). This layout is
 * a thin pass-through with metadata.absolute so the tab title reads
 * "TaxPilot · ..." instead of "... | SKILON" — per-product brand isolation.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "TaxPilot · Dashboard" },
};

export default function TaxPilotDashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>{children}</div>;
}
