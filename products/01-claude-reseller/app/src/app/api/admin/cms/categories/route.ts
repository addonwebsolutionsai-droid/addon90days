import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listCategories, createCategory } from "@/lib/cms/db";
import type { CmsKind, ProductScope } from "@/lib/cms/db";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const kind = searchParams.get("kind") as CmsKind | null;
  const productScope = searchParams.get("product_scope") as ProductScope | null;

  if (kind === null || !["blog", "faq"].includes(kind)) {
    return NextResponse.json({ error: "Missing or invalid ?kind=blog|faq" }, { status: 400 });
  }

  const categories = await listCategories({
    kind,
    productScope: productScope ?? undefined,
  });
  return NextResponse.json({ data: categories });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: wire audit log
  const body = await req.json();
  const category = await createCategory(body);
  return NextResponse.json({ data: category }, { status: 201 });
}
