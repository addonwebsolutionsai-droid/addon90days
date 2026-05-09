/**
 * /dashboard/taxpilot/[businessId]/customers/new
 *
 * Server-renders shell. Client form posts to /api/p03/businesses/{id}/customers.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBusiness } from "@/lib/p03/db";
import { CreateCustomerForm } from "./CreateCustomerForm";

interface RouteContext { params: Promise<{ businessId: string }> }

export default async function NewCustomerPage(ctx: RouteContext) {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/dashboard/taxpilot");

  const { businessId } = await ctx.params;
  const business = await getBusiness(businessId, userId);
  if (business === null) notFound();

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link
        href={`/dashboard/taxpilot/${businessId}`}
        className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to {business.legal_name}
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add customer</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Customers you invoice. The state you pick here decides whether GST is split
          intra-state (CGST + SGST) or inter-state (IGST) on every invoice.
        </p>
      </header>

      <CreateCustomerForm businessId={businessId} sellerStateCode={business.state_code} />
    </div>
  );
}
