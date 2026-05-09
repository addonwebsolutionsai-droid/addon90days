/**
 * /dashboard/[businessId]/invoices/new
 *
 * Server-renders shell + loads customer list (we need them for the dropdown).
 * Renders the InvoiceComposer client island.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { getBusiness, listCustomers } from "@/lib/p03/db";
import { InvoiceComposer } from "./InvoiceComposer";

interface RouteContext { params: Promise<{ businessId: string }> }

export default async function NewInvoicePage(ctx: RouteContext) {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/dashboard");

  const { businessId } = await ctx.params;
  const business  = await getBusiness(businessId, userId);
  if (business === null) notFound();
  const customers = await listCustomers(businessId, userId);

  // Need at least one customer to create an invoice
  if (customers.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link
          href={`/dashboard/${businessId}`}
          className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-violet-400"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={12} /> Back to {business.legal_name}
        </Link>
        <div
          className="rounded-xl border p-8 text-center"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
          >
            <Users size={24} className="text-white" />
          </div>
          <h2 className="text-base font-bold mb-1.5">Add a customer first</h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            Every invoice needs a billing customer. Add one and come back to this page.
          </p>
          <Link
            href={`/dashboard/${businessId}/customers/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add customer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <Link
        href={`/dashboard/${businessId}`}
        className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to {business.legal_name}
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New invoice</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Pick a customer, add line items. Tax splits compute live based on the customer&apos;s state.
          Next number: <span className="font-mono">{business.invoice_prefix}{String(business.next_invoice_number).padStart(4, "0")}</span>
        </p>
      </header>

      <InvoiceComposer
        businessId={businessId}
        sellerStateCode={business.state_code}
        gstScheme={business.gst_scheme}
        customers={customers.map((c) => ({
          id:                 c.id,
          name:               c.name,
          gstin:              c.gstin,
          country_code:       c.country_code,
          state_code:         c.place_of_supply_state_code,
          state_name:         c.place_of_supply_state_name,
        }))}
      />
    </div>
  );
}
