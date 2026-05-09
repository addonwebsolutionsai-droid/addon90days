import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getFaq, updateFaq } from "@/lib/cms/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const faq = await getFaq(id);
  if (faq === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: faq });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: wire audit log
  const { id } = await params;
  const body = await req.json();
  const faq = await updateFaq(id, body);
  return NextResponse.json({ data: faq });
}
