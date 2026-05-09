import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { publishPost } from "@/lib/cms/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: wire audit log
  const { id } = await params;
  const post = await publishPost(id);
  return NextResponse.json({ data: post });
}
