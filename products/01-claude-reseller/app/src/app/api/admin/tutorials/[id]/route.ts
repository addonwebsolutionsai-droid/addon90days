/**
 * GET    /api/admin/tutorials/[id]  — fetch single tutorial
 * PATCH  /api/admin/tutorials/[id]  — edit metadata
 * DELETE /api/admin/tutorials/[id]  — delete (cascades to videos)
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getTutorial, updateTutorial, deleteTutorial } from "@/lib/tutorials/db";
import { logAdminAction } from "@/lib/audit";

const PatchSchema = z.object({
  feature_key: z.string().min(1).max(120).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

function forbidden(reason: string, status: number): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: reason } }, { status });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id } = await params;
  const tutorial = await getTutorial(id);
  if (tutorial === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tutorial not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: tutorial });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const tutorial = await updateTutorial(id, parsed.data);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "tutorials.update",
      resourceType: "tutorials",
      resourceId: id,
      meta: parsed.data,
    });
    return NextResponse.json({ data: tutorial });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id } = await params;

  try {
    await deleteTutorial(id);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "tutorials.delete",
      resourceType: "tutorials",
      resourceId: id,
      meta: {},
    });
    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
