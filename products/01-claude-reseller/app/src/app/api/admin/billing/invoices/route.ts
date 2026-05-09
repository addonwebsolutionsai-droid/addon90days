/**
 * GET /api/admin/billing/invoices
 *
 * Query params: product_id, status, clerk_user_id, limit (max 100)
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { listInvoices } from "@/lib/billing/db";
import type { InvoiceStatus } from "@/lib/billing/db";

const QuerySchema = z.object({
  product_id: z.enum(["p01", "p02", "p03", "p04"]).optional(),
  status: z
    .enum(["draft", "sent", "paid", "partially_refunded", "refunded", "failed", "void"])
    .optional(),
  clerk_user_id: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
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
    product_id: sp.get("product_id") ?? undefined,
    status: sp.get("status") ?? undefined,
    clerk_user_id: sp.get("clerk_user_id") ?? undefined,
    limit: sp.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid query params", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const invoices = await listInvoices({
      productId: parsed.data.product_id,
      status: parsed.data.status as InvoiceStatus | undefined,
      clerkUserId: parsed.data.clerk_user_id,
      limit: parsed.data.limit,
    });
    return NextResponse.json({ data: invoices });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
