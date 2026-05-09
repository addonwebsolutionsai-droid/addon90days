/**
 * GET  /api/businesses/{id}/invoices — list invoices for a business
 * POST /api/businesses/{id}/invoices — create an invoice (header + lines)
 *
 * The POST handler is the heart of TaxPilot's Phase 1: client sends only the
 * line draft (item, hsn, qty, price, gst rate) and a customer_id. The route:
 *   1. Looks up business + customer
 *   2. Classifies supply (intra/inter/export) from party state codes
 *   3. Runs every line through computeLine() to derive CGST/SGST/IGST/cess
 *   4. Aggregates header totals via computeInvoiceTotals()
 *   5. Reserves the next invoice number via the per-business counter
 *   6. Inserts header + lines transactionally (best-effort rollback on failure)
 *
 * The client never sends tax fields. The server is the single source of
 * truth for the math — that way the audit-log invariant ("financial data is
 * not silently mutable client-side") holds.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  listInvoices,
  getBusiness,
  getCustomer,
  reserveNextInvoiceNumber,
  insertInvoiceWithLines,
} from "@/lib/p03/db";
import {
  computeLine,
  computeInvoiceTotals,
  classifySupply,
  type PartyLocation,
} from "@/lib/p03/gst-calc";
import type { P03Invoice, P03InvoiceLine } from "@/lib/p03/types";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const LineDraftSchema = z.object({
  item_description:   z.string().min(1).max(500),
  hsn_code:           z.string().min(2).max(10),
  unit:               z.string().max(10).default("NOS"),
  quantity:           z.number().positive(),
  unit_price:         z.number().nonnegative(),
  discount_percent:   z.number().min(0).max(100).default(0),
  gst_rate_percent:   z.number().min(0).max(50),
  cess_rate_percent:  z.number().min(0).max(50).default(0),
});

const CreateInvoiceSchema = z.object({
  customer_id:    z.string().uuid(),
  invoice_kind:   z.enum(["tax_invoice", "bill_of_supply", "export_invoice", "credit_note", "debit_note"]).default("tax_invoice"),
  invoice_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),  // YYYY-MM-DD
  due_date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reverse_charge: z.boolean().default(false),
  notes:          z.string().max(2000).optional(),
  terms:          z.string().max(2000).optional(),
  lines:          z.array(LineDraftSchema).min(1).max(50),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }
  const { id: businessId } = await ctx.params;
  const invoices = await listInvoices(businessId, userId);
  return NextResponse.json({ data: invoices });
}

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }
  const { id: businessId } = await ctx.params;

  const business = await getBusiness(businessId, userId);
  if (business === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Business not found" } }, { status: 404 });
  }

  // 200/hr per user. A heavy biller filing 100 invoices/day still fits.
  const rate = await checkRateLimit({
    key: `p03_create_invoice:${userId}`,
    limit: 200,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, issues: parsed.error.issues } },
      { status: 400 },
    );
  }
  const draft = parsed.data;

  const customer = await getCustomer(draft.customer_id, businessId, userId);
  if (customer === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Customer not found" } },
      { status: 404 },
    );
  }

  // ----- compute supply type + per-line tax breakdown ---------------------
  const seller: PartyLocation = { stateCode: business.state_code, countryCode: "IN" };
  const buyer:  PartyLocation = {
    stateCode: customer.place_of_supply_state_code,
    countryCode: customer.country_code,
  };
  const supplyType = classifySupply(seller, buyer);

  let computedLines;
  try {
    computedLines = draft.lines.map((l, idx) => {
      const computed = computeLine(
        {
          quantity:        l.quantity,
          unitPrice:       l.unit_price,
          discountPercent: l.discount_percent,
          gstRatePercent:  l.gst_rate_percent,
          cessRatePercent: l.cess_rate_percent,
        },
        supplyType,
        business.gst_scheme,
      );
      return { idx, draft: l, computed };
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: { code: "VALIDATION", message: `Line calculation: ${msg}` } },
      { status: 400 },
    );
  }

  const totals = computeInvoiceTotals({
    lines: computedLines.map((l) => l.computed),
    roundOffToNearestRupee: true,
  });

  const invoiceNumber = await reserveNextInvoiceNumber(business);
  const invoiceDate   = draft.invoice_date ?? new Date().toISOString().slice(0, 10);

  // ----- assemble rows for the DB layer -----------------------------------
  const headerRow: Omit<P03Invoice, "id" | "created_at" | "updated_at"> = {
    business_id:      businessId,
    customer_id:      draft.customer_id,
    invoice_number:   invoiceNumber,
    invoice_kind:     draft.invoice_kind,
    status:           "draft",
    supply_type:      supplyType,
    invoice_date:     invoiceDate,
    due_date:         draft.due_date ?? null,
    reverse_charge:   draft.reverse_charge,
    notes:            draft.notes ?? null,
    terms:            draft.terms ?? business.default_terms ?? null,
    subtotal_amount:  totals.subtotalAmount,
    discount_amount:  0,
    cgst_amount:      totals.cgstAmount,
    sgst_amount:      totals.sgstAmount,
    igst_amount:      totals.igstAmount,
    cess_amount:      totals.cessAmount,
    round_off_amount: totals.roundOffAmount,
    total_amount:     totals.totalAmount,
    paid_amount:      0,
    irn:              null,
    irn_signed_qr:    null,
    irn_ack_no:       null,
    irn_ack_date:     null,
    pdf_storage_path: null,
  };

  const lineRows: Array<Omit<P03InvoiceLine, "id" | "invoice_id" | "created_at">> = computedLines.map(({ idx, draft: d, computed }) => ({
    line_number:       idx + 1,
    item_description:  d.item_description,
    hsn_code:          d.hsn_code,
    unit:              d.unit,
    quantity:          d.quantity,
    unit_price:        d.unit_price,
    discount_percent:  d.discount_percent,
    taxable_amount:    computed.taxableAmount,
    gst_rate_percent:  d.gst_rate_percent,
    cgst_amount:       computed.cgstAmount,
    sgst_amount:       computed.sgstAmount,
    igst_amount:       computed.igstAmount,
    cess_rate_percent: d.cess_rate_percent,
    cess_amount:       computed.cessAmount,
    line_total:        computed.lineTotal,
  }));

  try {
    const result = await insertInvoiceWithLines(headerRow, lineRows);
    return NextResponse.json(
      {
        data: {
          invoice:     result.invoice,
          lines:       result.lines,
          supply_type: supplyType,
          totals,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[p03/invoices POST] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to create invoice" } },
      { status: 500 },
    );
  }
}
