/**
 * GET  /api/businesses/{id}/customers — list customers for a business
 * POST /api/businesses/{id}/customers — create a customer
 *
 * Auth: Clerk required, plus business ownership scoped via lib/p03/db
 * helpers.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { listCustomers, createCustomer, getBusiness } from "@/lib/p03/db";
import { isValidGstinFormat } from "@/lib/p03/gst-calc";
import { isValidStateCode, stateNameByCode } from "@/lib/p03/types";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const CreateCustomerSchema = z.object({
  name:                       z.string().min(1).max(200),
  email:                      z.string().email().optional(),
  phone:                      z.string().max(20).optional(),
  gstin:                      z.string().length(15).optional(),
  place_of_supply_state_code: z.string().length(2),
  address_line1:              z.string().max(200).optional(),
  address_line2:              z.string().max(200).optional(),
  city:                       z.string().max(80).optional(),
  pincode:                    z.string().length(6).optional(),
  country_code:               z.string().length(2).default("IN"),
  notes:                      z.string().max(2000).optional(),
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
  const customers = await listCustomers(businessId, userId);
  return NextResponse.json({ data: customers });
}

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const { id: businessId } = await ctx.params;

  // Verify ownership upfront — failed authorization should NOT consume the rate-limit bucket.
  const business = await getBusiness(businessId, userId);
  if (business === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Business not found" } },
      { status: 404 },
    );
  }

  const rate = await checkRateLimit({
    key: `p03_create_customer:${userId}`,
    limit: 100,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Country IN → state must be a valid 2-digit GSTN code.
  // Country !IN (export) → state still required as a free string but we
  // store "97" (Other Territory) to keep the column NOT NULL.
  let state_code = input.place_of_supply_state_code;
  let state_name: string;

  if (input.country_code === "IN") {
    if (!isValidStateCode(state_code)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: `Unknown state_code: ${state_code}` } },
        { status: 400 },
      );
    }
    state_name = stateNameByCode(state_code) as string;
  } else {
    // Non-IN: store the 2-char country indicator as the "state" placeholder.
    // Real export invoicing doesn't use Indian state codes — we just need a
    // value to satisfy NOT NULL. UI should hide the state selector when
    // country != IN.
    state_code = "97";
    state_name = "Other Territory (Export)";
  }

  if (input.gstin !== undefined && !isValidGstinFormat(input.gstin)) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid GSTIN format" } },
      { status: 400 },
    );
  }

  try {
    const customer = await createCustomer({
      business_id:                businessId,
      name:                       input.name,
      email:                      input.email ?? null,
      phone:                      input.phone ?? null,
      gstin:                      input.gstin ?? null,
      place_of_supply_state_code: state_code,
      place_of_supply_state_name: state_name,
      address_line1:              input.address_line1 ?? null,
      address_line2:              input.address_line2 ?? null,
      city:                       input.city ?? null,
      pincode:                    input.pincode ?? null,
      country_code:               input.country_code,
      notes:                      input.notes ?? null,
    }, userId);
    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[p03/customers POST] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to create customer" } },
      { status: 500 },
    );
  }
}
