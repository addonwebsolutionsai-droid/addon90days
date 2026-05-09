/**
 * GET  /api/admin/billing/plans  — list all plans (optionally filtered by product_id)
 * POST /api/admin/billing/plans  — create a new plan
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { listPlans, createPlan } from "@/lib/billing/db";
import { logAdminAction } from "@/lib/audit";

const CreatePlanSchema = z.object({
  product_id: z.enum(["p01", "p02", "p03", "p04"]),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  price_monthly_inr: z.number().min(0),
  price_yearly_inr: z.number().min(0).optional(),
  features: z.array(z.string()).optional(),
  entitlements: z.record(z.unknown()).optional(),
  sort_order: z.number().int().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: auth.reason } },
      { status: auth.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const productId = req.nextUrl.searchParams.get("product_id") ?? undefined;

  try {
    const plans = await listPlans(productId);
    return NextResponse.json({ data: plans });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: auth.reason } },
      { status: auth.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = CreatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const plan = await createPlan(parsed.data);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.plan.create",
      resourceType: "billing_plan",
      resourceId: plan.id,
      meta: { product_id: plan.product_id, slug: plan.slug },
    });
    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
