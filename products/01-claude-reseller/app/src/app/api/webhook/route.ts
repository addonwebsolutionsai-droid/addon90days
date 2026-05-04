/**
 * GET  /api/webhook — Meta verify-token handshake
 * POST /api/webhook — Receive WhatsApp Cloud API events
 *
 * Security: GET validates hub.verify_token against META_WEBHOOK_VERIFY_TOKEN env var.
 * POST returns 200 immediately, then processes async (Vercel Fluid Compute).
 *
 * Public endpoint — no Clerk auth (Meta calls this directly).
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { upsertConversation, getRecentMessages } from "@/lib/p02/db";
import { processMessage } from "@/lib/p02/reply-engine";
import type { MetaWebhookPayload, MetaInboundMessage } from "@/lib/p02/types";

// ---------------------------------------------------------------------------
// GET — webhook verification
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest): Promise<NextResponse> {
  const params = req.nextUrl.searchParams;
  const mode      = params.get("hub.mode");
  const token     = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const verifyToken = process.env["META_WEBHOOK_VERIFY_TOKEN"];

  if (mode === "subscribe" && token === verifyToken && verifyToken) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json(
    { error: { code: "FORBIDDEN", message: "Webhook verification failed" } },
    { status: 403 }
  );
}

// ---------------------------------------------------------------------------
// POST — receive events
// ---------------------------------------------------------------------------

const PhoneNumberIdToWorkspaceEnv = "WHATSAPP_PHONE_NUMBER_ID";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Return 200 immediately — Meta requires acknowledgement within 15s.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Still return 200 — bad JSON from Meta should not cause retries.
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  // Fire-and-forget processing
  void handleWebhookAsync(body);

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Async processing
// ---------------------------------------------------------------------------

async function handleWebhookAsync(body: unknown): Promise<void> {
  try {
    const payload = body as MetaWebhookPayload;
    if (payload?.object !== "whatsapp_business_account") return;

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages") continue;
        const value = change.value;
        if (!value?.messages) continue;

        const phoneNumberId = value.metadata?.phone_number_id;

        // Resolve workspace_id from phone_number_id
        // MVP: single-workspace lookup via env var.
        // v1.1: look up in p02_workspaces table.
        const workspaceId = await resolveWorkspace(phoneNumberId);
        if (workspaceId === null) {
          console.warn(`[webhook] No workspace for phone_number_id: ${phoneNumberId}`);
          continue;
        }

        for (const msg of value.messages) {
          await handleInboundMessage({
            workspaceId,
            msg,
            contacts: value.contacts ?? [],
          });
        }
      }
    }
  } catch (err) {
    // Log but don't throw — we already sent 200.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] Async processing error: ${message}`);
  }
}

async function handleInboundMessage(params: {
  workspaceId: string;
  msg: MetaInboundMessage;
  contacts: Array<{ profile: { name: string }; wa_id: string }>;
}): Promise<void> {
  const { workspaceId, msg, contacts } = params;

  // Only handle text messages for now
  if (msg.type !== "text" || !msg.text?.body) return;

  const customerPhone = msg.from;
  const customerName = contacts.find((c) => c.wa_id === msg.from)?.profile.name;
  const messageBody = msg.text.body;

  // Upsert conversation
  const conversation = await upsertConversation({
    workspace_id: workspaceId,
    customer_phone: customerPhone,
    customer_name: customerName,
  });

  // Load recent history
  const recentMsgs = await getRecentMessages(conversation.id, 20);
  const history = recentMsgs.map((m) => ({ role: m.role, body: m.body }));

  // Run reply engine
  await processMessage({
    workspace_id: workspaceId,
    conversation_id: conversation.id,
    customer_message: messageBody,
    history,
  });
}

/** MVP: resolve workspace from phone_number_id.
 *  For now: look up p02_workspaces where whatsapp_phone_number_id matches.
 *  Falls back to first workspace owned by the env-configured phone number. */
async function resolveWorkspace(phoneNumberId: string | undefined): Promise<string | null> {
  if (!phoneNumberId) return null;

  const { getSupabaseAdmin } = await import("@/lib/supabase");
  const db = getSupabaseAdmin();

  const { data } = await db
    .from("p02_workspaces")
    .select("id")
    .eq("whatsapp_phone_number_id", phoneNumberId)
    .limit(1)
    .single();

  return (data as { id: string } | null)?.id ?? null;
}
