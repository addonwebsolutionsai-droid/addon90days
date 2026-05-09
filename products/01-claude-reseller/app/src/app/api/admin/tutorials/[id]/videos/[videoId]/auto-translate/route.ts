/**
 * POST /api/admin/tutorials/[id]/videos/[videoId]/auto-translate
 *
 * Body: { target_language_codes: TutorialLanguageCode[] }
 *
 * Pipeline (synchronous):
 *  1. Fetch the English video and transcribe with Groq Whisper-large-v3-turbo → VTT.
 *  2. Translate each VTT to the target language via Claude Haiku 4.5.
 *  3. Upload translated VTT to Supabase Storage.
 *  4. Insert tutorial_videos rows (source_kind='auto_translated').
 *
 * audio_track_url stays null — TTS is a follow-up task.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getTutorial, type TutorialLanguageCode } from "@/lib/tutorials/db";
import { autoTranslateTutorialVideo } from "@/lib/tutorials/auto-translate";
import { logAdminAction } from "@/lib/audit";

const LANGUAGE_CODES = ["en","hi","gu","ta","te","mr","bn","kn","ml","pa"] as const;

const BodySchema = z.object({
  target_language_codes: z
    .array(z.enum(LANGUAGE_CODES))
    .min(1)
    .max(9), // max 9 non-English langs
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

  const tutorial = await getTutorial(tutorialId);
  if (tutorial === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tutorial not found" } },
      { status: 404 }
    );
  }

  try {
    const jobs = await autoTranslateTutorialVideo({
      sourceVideoId: videoId,
      tutorialId,
      productId: tutorial.product_id,
      targetLanguageCodes: parsed.data.target_language_codes as TutorialLanguageCode[],
    });

    await logAdminAction({
      adminClerkUserId: auth.userId,
      action: "tutorials.video.auto_translate",
      resourceType: "tutorial_videos",
      resourceId: videoId,
      meta: {
        tutorial_id: tutorialId,
        languages: parsed.data.target_language_codes,
        results: jobs,
      },
    });

    return NextResponse.json({ data: { jobs } });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: (err as Error).message } },
      { status: 500 }
    );
  }
}
