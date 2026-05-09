/**
 * GET  /api/p04/restaurants — list restaurants owned by the authenticated user
 * POST /api/p04/restaurants — create a new restaurant
 *
 * Auth: Clerk required. RLS is deny-all; all DB access via service-role client
 * scoped by owner_clerk_user_id in lib/p04/db.ts.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { listRestaurants, createRestaurant } from "@/lib/p04/db";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { isValidStateCode, stateNameByCode } from "@/lib/p04/types";

const CreateRestaurantSchema = z.object({
  name:                   z.string().min(2).max(200),
  address:                z.string().max(500).optional(),
  gstin:                  z.string().length(15).optional(),
  state_code:             z.string().length(2),
  phone:                  z.string().max(20).optional(),
  email:                  z.string().email().optional(),
  currency:               z.string().length(3).default("INR"),
  tax_inclusive_pricing:  z.boolean().default(false),
  service_charge_percent: z.number().min(0).max(50).default(0),
});

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }
  const restaurants = await listRestaurants(userId);
  return NextResponse.json({ data: restaurants });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  // 5/hr — onboarding; a restaurant owner rarely creates more than 1-5 outlets.
  const rate = await checkRateLimit({
    key:           `p04_create_restaurant:${userId}`,
    limit:         5,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateRestaurantSchema.safeParse(body);
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

  try {
    const restaurant = await createRestaurant({
      owner_clerk_user_id:    userId,
      name:                   input.name,
      address:                input.address ?? null,
      gstin:                  input.gstin ?? null,
      state_code:             input.state_code,
      state_name,
      phone:                  input.phone ?? null,
      email:                  input.email ?? null,
      currency:               input.currency,
      tax_inclusive_pricing:  input.tax_inclusive_pricing,
      service_charge_percent: input.service_charge_percent,
    });
    return NextResponse.json({ data: restaurant }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[p04/restaurants POST] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to create restaurant" } },
      { status: 500 },
    );
  }
}
