/**
 * POST /api/admin/tutorials/[id]/toggle — activate / deactivate a tutorial
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { toggleTutorialActive } from "@/lib/tutorials/db";
import { logAdminAction } from "@/lib/audit";

function forbidden(reason: string, status: number): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: reason } }, { status });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id } = await params;

  try {
    const tutorial = await toggleTutorialActive(id);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: tutorial.is_active ? "tutorials.activate" : "tutorials.deactivate",
      resourceType: "tutorials",
      resourceId: id,
      meta: { is_active: tutorial.is_active },
    });
    return NextResponse.json({ data: tutorial });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
