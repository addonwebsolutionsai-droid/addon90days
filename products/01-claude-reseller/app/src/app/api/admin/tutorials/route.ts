/**
 * GET  /api/admin/tutorials?product_id=p02&search=...  — list tutorials
 * POST /api/admin/tutorials                             — create tutorial
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { listTutorials, createTutorial, type TutorialProductId } from "@/lib/tutorials/db";
import { logAdminAction } from "@/lib/audit";

const PRODUCT_IDS = ["p01", "p02", "p03", "p04", "p05", "p06", "global"] as const;

const CreateTutorialSchema = z.object({
  product_id: z.enum(PRODUCT_IDS),
  feature_key: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

function forbidden(reason: string, status: number): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: reason } }, { status });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const sp = req.nextUrl.searchParams;
  const productId = (sp.get("product_id") ?? undefined) as TutorialProductId | undefined;
  const search = sp.get("search") ?? undefined;

  try {
    const tutorials = await listTutorials({ productId, search });
    return NextResponse.json({ data: tutorials });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = CreateTutorialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const tutorial = await createTutorial(parsed.data);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: `${parsed.data.product_id}.tutorials.create`,
      resourceType: "tutorials",
      resourceId: tutorial.id,
      meta: { product_id: parsed.data.product_id, feature_key: parsed.data.feature_key },
    });
    return NextResponse.json({ data: tutorial }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
