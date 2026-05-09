/**
 * POST /api/admin/billing/plans/[id]/toggle — activate or deactivate a plan
 *
 * Body: { active: boolean }
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getPlan, togglePlanActive } from "@/lib/billing/db";
import { logAdminAction } from "@/lib/audit";

const ToggleSchema = z.object({ active: z.boolean() });

export async function POST(
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

  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Body must be { active: boolean }" } },
      { status: 422 }
    );
  }

  try {
    const plan = await togglePlanActive(id, parsed.data.active);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: parsed.data.active ? "billing.plan.activate" : "billing.plan.deactivate",
      resourceType: "billing_plan",
      resourceId: id,
    });
    return NextResponse.json({ data: plan });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
