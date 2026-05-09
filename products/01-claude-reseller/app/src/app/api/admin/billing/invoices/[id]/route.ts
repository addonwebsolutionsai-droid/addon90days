/**
 * GET /api/admin/billing/invoices/[id] — invoice detail
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getInvoice } from "@/lib/billing/db";

export async function GET(
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

  try {
    const invoice = await getInvoice(id);
    if (invoice === null) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Invoice ${id} not found` } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: invoice });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
