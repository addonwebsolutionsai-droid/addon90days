/**
 * POST /api/admin/tutorials/[id]/videos/[videoId]/finalize
 *
 * Called by the client after the direct-to-Supabase upload completes.
 * Updates duration_sec on the video row.
 *
 * Body: { duration_sec: number }
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateVideo } from "@/lib/tutorials/db";
import { logAdminAction } from "@/lib/audit";

const BodySchema = z.object({
  duration_sec: z.number().int().min(0),
});

function forbidden(reason: string, status: number): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: reason } }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id: tutorialId, videoId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const video = await updateVideo(videoId, { duration_sec: parsed.data.duration_sec });
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "tutorials.video.finalized",
      resourceType: "tutorial_videos",
      resourceId: videoId,
      meta: { tutorial_id: tutorialId, duration_sec: parsed.data.duration_sec },
    });
    return NextResponse.json({ data: video });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
