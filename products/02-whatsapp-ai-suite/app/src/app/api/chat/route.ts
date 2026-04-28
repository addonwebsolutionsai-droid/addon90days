import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { runChat } from "@/lib/gemini";

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  businessContext: z.string().max(8000).default(""),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      })
    )
    .max(50)
    .default([]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth guard — Clerk middleware also protects this route, but belt-and-suspenders.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { message, businessContext, history } = parsed.data;

  // Business name falls back to generic until user profile is built.
  // Will be read from user metadata once that flow is implemented.
  const businessName = "your business";

  try {
    const result = await runChat({
      message,
      businessName,
      businessContext,
      history,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const errMessage =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[api/chat] Gemini error:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
