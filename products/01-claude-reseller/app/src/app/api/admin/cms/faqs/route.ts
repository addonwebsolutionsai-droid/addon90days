import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listFaqs, createFaq } from "@/lib/cms/db";
import type { ProductScope } from "@/lib/cms/db";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const productScope = searchParams.get("product_scope") as ProductScope | null;
  const categoryId = searchParams.get("category_id");
  const query = searchParams.get("q");
  const limit = searchParams.get("limit");

  const faqs = await listFaqs({
    productScope: productScope ?? undefined,
    categoryId: categoryId ?? undefined,
    query: query ?? undefined,
    limit: limit !== null ? Number(limit) : undefined,
  });
  return NextResponse.json({ data: faqs });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: wire audit log
  const body = await req.json();
  const faq = await createFaq(body);
  return NextResponse.json({ data: faq }, { status: 201 });
}
