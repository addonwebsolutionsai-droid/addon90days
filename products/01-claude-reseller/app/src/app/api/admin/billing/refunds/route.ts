/**
 * GET  /api/admin/billing/refunds — list refund requests
 * POST /api/admin/billing/refunds — create a refund request (admin-initiated)
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { listRefundRequests, createRefundRequest, getInvoice, getSubscription } from "@/lib/billing/db";
import type { RefundStatus } from "@/lib/billing/db";
import { logAdminAction } from "@/lib/audit";

const QuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "processed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const CreateRefundSchema = z.object({
  invoice_id: z.string().uuid(),
  amount_inr: z.number().positive(),
  reason: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: auth.reason } },
      { status: auth.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const parsed = QuerySchema.safeParse({
    status: sp.get("status") ?? undefined,
    limit: sp.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid query params", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const refunds = await listRefundRequests({
      status: parsed.data.status as RefundStatus | undefined,
      limit: parsed.data.limit,
    });
    return NextResponse.json({ data: refunds });
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

  const parsed = CreateRefundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  // Load invoice to get subscription_id + clerk_user_id
  const invoice = await getInvoice(parsed.data.invoice_id);
  if (invoice === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Invoice ${parsed.data.invoice_id} not found` } },
      { status: 404 }
    );
  }

  if (parsed.data.amount_inr > invoice.total_inr) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `Refund amount (${parsed.data.amount_inr}) exceeds invoice total (${invoice.total_inr})`,
        },
      },
      { status: 422 }
    );
  }

  const sub = await getSubscription(invoice.subscription_id);
  if (sub === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Subscription ${invoice.subscription_id} not found` } },
      { status: 404 }
    );
  }

  try {
    const refund = await createRefundRequest({
      invoice_id: parsed.data.invoice_id,
      subscription_id: invoice.subscription_id,
      clerk_user_id: invoice.clerk_user_id,
      amount_inr: parsed.data.amount_inr,
      reason: parsed.data.reason,
      requested_by_clerk_user_id: auth.userId,
    });

    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "billing.refund.create",
      resourceType: "billing_refund_request",
      resourceId: refund.id,
      meta: { invoice_id: parsed.data.invoice_id, amount_inr: parsed.data.amount_inr },
    });

    return NextResponse.json({ data: refund }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
