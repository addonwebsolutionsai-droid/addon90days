/**
 * PATCH /api/admin/billing/plans/[id] — edit a plan's fields
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getPlan, updatePlan } from "@/lib/billing/db";
import { logAdminAction } from "@/lib/audit";

const PatchPlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price_monthly_inr: z.number().min(0).optional(),
  price_yearly_inr: z.number().min(0).nullable().optional(),
  features: z.array(z.string()).optional(),
  entitlements: z.record(z.unknown()).optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: auth.reason } },
      { status: auth.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const { id } = await params;

  const existing = await getPlan(id);
  if (existing === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Plan ${id} not found` } },
      { status: 404 }
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

  const parsed = PatchPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const plan = await updatePlan(id, parsed.data);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.plan.update",
      resourceType: "billing_plan",
      resourceId: id,
      meta: parsed.data as Record<string, unknown>,
    });
    return NextResponse.json({ data: plan });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
