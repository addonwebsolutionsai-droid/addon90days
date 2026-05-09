/**
 * POST /api/admin/billing/refunds/[id]/reject
 *
 * Body: { notes: string }
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { rejectRefund, listRefundRequests } from "@/lib/billing/db";
import { logAdminAction } from "@/lib/audit";

const BodySchema = z.object({ notes: z.string().min(1).max(1000) });

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
      { error: { code: "VALIDATION_ERROR", message: "Body must be { notes: string }" } },
      { status: 422 }
    );
  }

  try {
    const refund = await rejectRefund(id, auth.userId, parsed.data.notes);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.refund.reject",
      resourceType: "billing_refund_request",
      resourceId: id,
      meta: { notes: parsed.data.notes },
    });
    return NextResponse.json({ data: refund });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
