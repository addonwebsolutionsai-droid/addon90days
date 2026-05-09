/**
 * POST /api/admin/tutorials/[id]/videos/[videoId]/set-default
 *
 * Makes [videoId] the default video for this tutorial.
 * Clears the previous default in the same operation.
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { setDefaultVideo } from "@/lib/tutorials/db";
import { logAdminAction } from "@/lib/audit";

function forbidden(reason: string, status: number): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: reason } }, { status });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id: tutorialId, videoId } = await params;

  try {
    await setDefaultVideo(tutorialId, videoId);
    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "tutorials.video.set_default",
      resourceType: "tutorial_videos",
      resourceId: videoId,
      meta: { tutorial_id: tutorialId },
    });
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
