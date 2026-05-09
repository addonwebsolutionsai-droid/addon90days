/**
 * GET /api/tutorials/by-feature?product_id=p02&feature_key=p02.intent.create&lang=hi
 *
 * Public, no auth. Returns the tutorial + the best-matching video for the
 * requested language (falls back to the default video if the requested
 * language is not available).
 *
 * Also records an anonymous view row (non-blocking — does not delay response).
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  getTutorial,
  listVideos,
  recordView,
  type TutorialProductId,
  type TutorialLanguageCode,
} from "@/lib/tutorials/db";

const VALID_PRODUCT_IDS = new Set<string>(["p01","p02","p03","p04","p05","p06","global"]);

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;
  const productId = sp.get("product_id");
  const featureKey = sp.get("feature_key");
  const lang = (sp.get("lang") ?? "en") as TutorialLanguageCode;

  if (productId === null || featureKey === null) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "product_id and feature_key are required" } },
      { status: 400 }
    );
  }

  if (!VALID_PRODUCT_IDS.has(productId)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `Unknown product_id: ${productId}` } },
      { status: 400 }
    );
  }

  const tutorial = await getTutorial(featureKey, productId as TutorialProductId);
  if (tutorial === null || !tutorial.is_active) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tutorial not found" } },
      { status: 404 }
    );
  }

  const videos = await listVideos(tutorial.id);
  if (videos.length === 0) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No videos for this tutorial yet" } },
      { status: 404 }
    );
  }

  // Pick the video for the requested language, fall back to default
  const langVideo = videos.find((v) => v.language_code === lang);
  const defaultVideo = videos.find((v) => v.is_default) ?? videos[0];
  const video = langVideo ?? defaultVideo;

  // Record an anonymous view (fire-and-forget — do not await)
  void recordView({
    tutorial_id: tutorial.id,
    language_code: lang,
    watched_seconds: 0,
    completed: false,
  });

  return NextResponse.json({ data: { tutorial, video } });
}
