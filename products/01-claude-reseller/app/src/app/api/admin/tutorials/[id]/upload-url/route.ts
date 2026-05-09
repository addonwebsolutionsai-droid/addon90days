/**
 * POST /api/admin/tutorials/[id]/upload-url
 *
 * Returns a signed Supabase Storage URL the client uploads the video to directly.
 * Also inserts a `tutorial_videos` row with duration_sec=0 (placeholder until finalize).
 *
 * Body: { filename: string, content_type: string, language_code: string }
 * Response: { upload_url, video_id, video_url_after_upload }
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getTutorial, createVideo, type TutorialLanguageCode } from "@/lib/tutorials/db";
import { getSignedUploadUrl } from "@/lib/tutorials/storage";
import { logAdminAction } from "@/lib/audit";

const LANGUAGE_CODES = ["en","hi","gu","ta","te","mr","bn","kn","ml","pa"] as const;

const BodySchema = z.object({
  filename: z.string().min(1).max(200),
  content_type: z.string().min(1),
  language_code: z.enum(LANGUAGE_CODES),
});

function forbidden(reason: string, status: number): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: reason } }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return forbidden(auth.reason, auth.reason === "unauthenticated" ? 401 : 403);

  const { id: tutorialId } = await params;

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

  const tutorial = await getTutorial(tutorialId);
  if (tutorial === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tutorial not found" } },
      { status: 404 }
    );
  }

  try {
    const { upload_url, public_url } = await getSignedUploadUrl({
      productId: tutorial.product_id,
      tutorialId,
      languageCode: parsed.data.language_code,
      filename: parsed.data.filename,
      contentType: parsed.data.content_type,
    });

    // Insert placeholder row — duration_sec filled by /finalize
    const video = await createVideo({
      tutorial_id: tutorialId,
      language_code: parsed.data.language_code as TutorialLanguageCode,
      video_url: public_url,
      duration_sec: 0,
      is_default: false,
      source_kind: "original",
    });

    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "tutorials.video.upload_url_requested",
      resourceType: "tutorial_videos",
      resourceId: video.id,
      meta: { tutorial_id: tutorialId, language_code: parsed.data.language_code },
    });

    return NextResponse.json({
      data: {
        upload_url,
        video_id: video.id,
        video_url_after_upload: public_url,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
