/**
 * POST /api/admin/billing/refunds/[id]/approve
 *
 * Approves the refund request AND immediately executes the Razorpay refund.
 * Sequence: approve → processRefund (calls Razorpay → marks processed → updates invoice).
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { approveRefund, processRefund, listRefundRequests } from "@/lib/billing/db";
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

  // Verify it exists and is pending
  const [existing] = await listRefundRequests({ limit: 1 }).then((all) =>
    all.filter((r) => r.id === id)
  );
  if (existing === undefined) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Refund request ${id} not found` } },
      { status: 404 }
    );
  }
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Refund request is already in status '${existing.status}'` } },
      { status: 409 }
    );
  }

  try {
    // Step 1: approve
    await approveRefund(id, auth.userId);

    // Step 2: execute Razorpay refund + mark processed
    const processed = await processRefund(id);

    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.refund.approve_and_process",
      resourceType: "billing_refund_request",
      resourceId: id,
      meta: { razorpay_refund_id: processed.razorpay_refund_id ?? undefined },
    });

    return NextResponse.json({ data: processed });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "RAZORPAY_ERROR", message: (err as Error).message } },
      { status: 502 }
    );
  }
}
