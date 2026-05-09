/**
 * POST /api/admin/billing/subscriptions/[id]/cancel
 *
 * Body: { reason: string }
 * Cancels on Razorpay (if subscription_id present) then marks DB as cancelled.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { cancelSubscription, getSubscription } from "@/lib/billing/db";
import { logAdminAction } from "@/lib/audit";

const BodySchema = z.object({ reason: z.string().min(1).max(500) });

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

  const existing = await getSubscription(id);
  if (existing === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Subscription ${id} not found` } },
      { status: 404 }
    );
  }

  if (existing.status === "cancelled") {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Subscription is already cancelled" } },
      { status: 409 }
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

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Body must be { reason: string }" } },
      { status: 422 }
    );
  }

  try {
    const sub = await cancelSubscription(id, parsed.data.reason);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.subscription.cancel",
      resourceType: "billing_subscription",
      resourceId: id,
      meta: { reason: parsed.data.reason },
    });
    return NextResponse.json({ data: sub });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
