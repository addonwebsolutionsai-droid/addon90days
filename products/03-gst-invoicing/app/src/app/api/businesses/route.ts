/**
 * GET  /api/businesses — list businesses owned by the authenticated user
 * POST /api/businesses — create a new business
 *
 * Auth: Clerk required. RLS denies anon/authenticated roles, so all writes
 * go through the service-role client in lib/p03/db.ts; that helper scopes
 * by `owner_clerk_user_id` so a user can never see another user's data.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { listBusinesses, createBusiness } from "@/lib/p03/db";
import { isValidGstinFormat } from "@/lib/p03/gst-calc";
import { isValidStateCode, stateNameByCode } from "@/lib/p03/types";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const CreateBusinessSchema = z.object({
  legal_name:               z.string().min(2).max(200),
  trade_name:               z.string().max(200).optional(),
  gstin:                    z.string().length(15).optional(),
  pan:                      z.string().length(10).optional(),
  state_code:               z.string().length(2),
  address_line1:            z.string().max(200).optional(),
  address_line2:            z.string().max(200).optional(),
  city:                     z.string().max(80).optional(),
  pincode:                  z.string().length(6).optional(),
  email:                    z.string().email().optional(),
  phone:                    z.string().max(20).optional(),
  gst_scheme:               z.enum(["regular", "composition", "unregistered"]).default("regular"),
  composition_rate_percent: z.number().nonnegative().max(10).optional(),
  invoice_prefix:           z.string().max(20).default("INV-"),
  bank_ifsc:                z.string().max(20).optional(),
  default_terms:            z.string().max(2000).optional(),
});

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  const businesses = await listBusinesses(userId);
  return NextResponse.json({ data: businesses });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  // 5/hr per user — onboarding flow shouldn't need more.
  const rate = await checkRateLimit({
    key: `p03_create_business:${userId}`,
    limit: 5,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  const input = parsed.data;

  if (!isValidStateCode(input.state_code)) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: `Unknown state_code: ${input.state_code}` } },
      { status: 400 },
    );
  }
  const state_name = stateNameByCode(input.state_code) as string;

  if (input.gstin !== undefined && !isValidGstinFormat(input.gstin)) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid GSTIN format" } },
      { status: 400 },
    );
  }
  if (input.gstin !== undefined && input.gstin.slice(0, 2) !== input.state_code) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "GSTIN state prefix does not match state_code" } },
      { status: 400 },
    );
  }

  if (input.gst_scheme === "composition" && input.composition_rate_percent === undefined) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "composition_rate_percent required for composition scheme" } },
      { status: 400 },
    );
  }

  try {
    const business = await createBusiness({
      owner_clerk_user_id:      userId,
      legal_name:               input.legal_name,
      trade_name:               input.trade_name ?? null,
      gstin:                    input.gstin ?? null,
      pan:                      input.pan ?? null,
      state_code:               input.state_code,
      state_name,
      address_line1:            input.address_line1 ?? null,
      address_line2:            input.address_line2 ?? null,
      city:                     input.city ?? null,
      pincode:                  input.pincode ?? null,
      email:                    input.email ?? null,
      phone:                    input.phone ?? null,
      gst_scheme:               input.gst_scheme,
      composition_rate_percent: input.composition_rate_percent ?? null,
      invoice_prefix:           input.invoice_prefix,
      logo_url:                 null,
      bank_ifsc:                input.bank_ifsc ?? null,
      default_terms:            input.default_terms ?? null,
    });
    return NextResponse.json({ data: business }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("duplicate key")) {
      return NextResponse.json(
        { error: { code: "DUPLICATE_GSTIN", message: "You already registered a business with that GSTIN" } },
        { status: 409 },
      );
    }
    console.error(`[p03/businesses POST] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to create business" } },
      { status: 500 },
    );
  }
}
