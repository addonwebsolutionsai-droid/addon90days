/**
 * GET /api/p03/businesses/{id}/invoices/{invoiceId} — invoice + lines
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getInvoiceWithLines } from "@/lib/p03/db";

interface RouteContext {
  params: Promise<{ id: string; invoiceId: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  const { id: businessId, invoiceId } = await ctx.params;
  const result = await getInvoiceWithLines(invoiceId, businessId, userId);
  if (result === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Invoice not found" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: result });
}
