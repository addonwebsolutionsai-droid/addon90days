/**
 * POST /api/mock/inbound
 *
 * Simulates an inbound WhatsApp message for testing without real Meta API access.
 * Runs through the identical pipeline as a real webhook event.
 *
 * Body: { workspace_id: string, customer_phone: string, body: string, customer_name?: string }
 *
 * Auth: Clerk required (must own the workspace).
 * Rate limit: 50/hr per IP (prevent abuse of Groq quota).
 *
 * This endpoint is only useful in MOCK_MODE. It accepts the same shape regardless
 * but actual Meta sends only happen when MOCK_MODE=false.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getWorkspaceByOwner, upsertConversation, getRecentMessages } from "@/lib/p02/db";
import { processMessage } from "@/lib/p02/reply-engine";
import { checkRateLimit, rateLimitedResponse, clientIdentifier } from "@/lib/rate-limit";

const MockInboundSchema = z.object({
  workspace_id: z.string().uuid(),
  customer_phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^\+?[0-9]+$/, "Must be a phone number"),
  body: z.string().min(1).max(4096),
  customer_name: z.string().max(100).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  // Rate limit by IP — 50/hr
  const ip = clientIdentifier(req);
  const rate = await checkRateLimit({
    key: `p02_mock_inbound:ip:${ip}`,
    limit: 50,
    windowSeconds: 3600,
  });
  if (!rate.allowed) {
    return rateLimitedResponse(
      rate.retryAfterSec,
      "Mock inbound rate limit exceeded (50/hr per IP)"
    ) as unknown as NextResponse;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = MockInboundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { workspace_id, customer_phone, body: messageBody, customer_name } = parsed.data;

  // Verify ownership
  const workspace = await getWorkspaceByOwner(userId, workspace_id);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found" } },
      { status: 404 }
    );
  }

  try {
    // Upsert conversation
    const conversation = await upsertConversation({
      workspace_id,
      customer_phone,
      customer_name,
    });

    // Load recent history
    const recentMsgs = await getRecentMessages(conversation.id, 20);
    const history = recentMsgs.map((m) => ({ role: m.role, body: m.body }));

    // Run reply engine (same as real webhook path)
    const result = await processMessage({
      workspace_id,
      conversation_id: conversation.id,
      customer_message: messageBody,
      history,
    });

    return NextResponse.json({
      data: {
        conversation_id: conversation.id,
        customer_phone,
        message_processed: true,
        intent: result.intent,
        confidence: result.confidence,
        replied: result.replied,
        escalated: result.escalated,
        reply_body: result.reply_body,
        meta_message_id: result.meta_message_id,
        mock: true,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[p02/mock/inbound] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: `Processing failed: ${msg.slice(0, 100)}` } },
      { status: 500 }
    );
  }
}
