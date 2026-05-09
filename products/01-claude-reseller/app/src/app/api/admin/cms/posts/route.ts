import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listPosts, createPost } from "@/lib/cms/db";
import type { ProductScope, PostStatus } from "@/lib/cms/db";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const productScope = searchParams.get("product_scope") as ProductScope | null;
  const status = searchParams.get("status") as PostStatus | null;
  const categoryId = searchParams.get("category_id");
  const query = searchParams.get("q");
  const limit = searchParams.get("limit");

  const posts = await listPosts({
    productScope: productScope ?? undefined,
    categoryId: categoryId ?? undefined,
    status: status ?? undefined,
    query: query ?? undefined,
    limit: limit !== null ? Number(limit) : undefined,
  });
  return NextResponse.json({ data: posts });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: wire audit log
  const body = await req.json();
  const post = await createPost({ ...body, author_clerk_user_id: guard.userId });
  return NextResponse.json({ data: post }, { status: 201 });
}
