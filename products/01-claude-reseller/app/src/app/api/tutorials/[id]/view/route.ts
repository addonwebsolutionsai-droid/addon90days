/**
 * POST /api/tutorials/[id]/view
 *
 * Record a watch event. Anon-friendly — no auth required.
 * Called by TutorialButton when the user closes the modal.
 *
 * Body: { language_code: string, watched_seconds: number, completed: boolean }
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { recordView } from "@/lib/tutorials/db";
import { auth } from "@clerk/nextjs/server";

const BodySchema = z.object({
  language_code: z.string().min(2).max(10),
  watched_seconds: z.number().int().min(0),
  completed: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

  // Best-effort clerk user id — anon views are allowed
  let clerkUserId: string | undefined;
  try {
    const session = await auth();
    clerkUserId = session.userId ?? undefined;
  } catch {
    // auth() may throw outside clerk middleware context; treat as anon
  }

  await recordView({
    tutorial_id: tutorialId,
    language_code: parsed.data.language_code,
    clerk_user_id: clerkUserId,
    watched_seconds: parsed.data.watched_seconds,
    completed: parsed.data.completed,
  });

  return NextResponse.json({ data: { ok: true } });
}
