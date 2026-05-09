/**
 * POST /api/admin/billing/plans/[id]/sync-razorpay
 *
 * Pushes the plan to Razorpay (creates monthly + yearly plans if applicable).
 * Stores both razorpay_plan_id_* back to the DB row.
 *
 * Razorpay plan schema:
 *   interval: 1, period: "monthly" | "yearly", item: { name, amount (paise), currency }
 *
 * Free plans (price = 0) are skipped — Razorpay does not support zero-amount plans.
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getPlan, setRazorpayPlanIds } from "@/lib/billing/db";
import { getRazorpayClient } from "@/lib/billing/razorpay-client";
import { logAdminAction } from "@/lib/audit";

export async function POST(
  _req: NextRequest,
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
  const plan = await getPlan(id);
  if (plan === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Plan ${id} not found` } },
      { status: 404 }
    );
  }

  if (plan.price_monthly_inr === 0) {
    return NextResponse.json(
      {
        error: {
          code: "UNSUPPORTED",
          message: "Free plans (price = 0) cannot be pushed to Razorpay. Update the price first.",
        },
      },
      { status: 422 }
    );
  }

  try {
    const rzp = getRazorpayClient();

    // Create monthly plan on Razorpay
    const monthlyPaise = Math.round(plan.price_monthly_inr * 100);
    const rzpMonthly = await rzp.plans.create({
      period: "monthly",
      interval: 1,
      item: {
        name: `${plan.name} — Monthly`,
        amount: monthlyPaise,
        currency: "INR",
        description: `${plan.product_id.toUpperCase()} ${plan.name} plan`,
      },
      notes: { product_id: plan.product_id, plan_slug: plan.slug, internal_id: plan.id },
    });

    const monthlyId = String(rzpMonthly["id"] ?? "");

    // Create yearly plan if price is configured
    let yearlyId: string | null = null;
    if (plan.price_yearly_inr !== null && plan.price_yearly_inr > 0) {
      const yearlyPaise = Math.round(plan.price_yearly_inr * 100);
      const rzpYearly = await rzp.plans.create({
        period: "yearly",
        interval: 1,
        item: {
          name: `${plan.name} — Yearly`,
          amount: yearlyPaise,
          currency: "INR",
          description: `${plan.product_id.toUpperCase()} ${plan.name} plan (yearly)`,
        },
        notes: { product_id: plan.product_id, plan_slug: plan.slug, internal_id: plan.id },
      });
      yearlyId = String(rzpYearly["id"] ?? "");
    }

    const updated = await setRazorpayPlanIds(id, monthlyId, yearlyId);

    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.plan.sync_razorpay",
      resourceType: "billing_plan",
      resourceId: id,
      meta: { razorpay_plan_id_monthly: monthlyId, razorpay_plan_id_yearly: yearlyId },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    const message = (err as Error).message;
    return NextResponse.json(
      { error: { code: "RAZORPAY_ERROR", message } },
      { status: 502 }
    );
  }
}
