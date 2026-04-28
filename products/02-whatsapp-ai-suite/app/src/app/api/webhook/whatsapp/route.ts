import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { runChat } from "@/lib/gemini";

// 360dialog sends a GET request with these query params to verify the webhook.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env["WHATSAPP_VERIFY_TOKEN"];

  if (mode === "subscribe" && token === verifyToken && challenge) {
    // Respond with the challenge plain-text to confirm the webhook URL.
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// 360dialog sends incoming messages as POST to this route.
// We return 200 immediately and process async — the API requires fast ACKs.
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse body first (req can only be read once), then fire-and-forget.
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
  void processIncomingMessage(payload);
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type WhatsAppContact = {
  wa_id: string;
  profile?: { name?: string };
};

type WhatsAppTextMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: "text";
  text: { body: string };
};

type WhatsAppMessage = WhatsAppTextMessage | { type: string };

type WhatsAppEntry = {
  id: string;
  changes: Array<{
    value: {
      contacts?: WhatsAppContact[];
      messages?: WhatsAppMessage[];
    };
  }>;
};

type WhatsAppWebhookPayload = {
  object: string;
  entry?: WhatsAppEntry[];
};

async function processIncomingMessage(payload: unknown): Promise<void> {
  // Narrow to expected shape
  if (!isWebhookPayload(payload)) {
    console.warn("[webhook/whatsapp] Unexpected payload shape");
    return;
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes) {
      const { messages, contacts } = change.value;
      if (!messages?.length) continue;

      for (const msg of messages) {
        // Only handle text messages for now — media is a future iteration.
        if (msg.type !== "text") continue;

        const textMsg = msg as WhatsAppTextMessage;
        const from = textMsg.from;
        const body = textMsg.text.body;

        // Business context stub — will be loaded from DB per-user in v2.
        const businessContext = "";

        try {
          const { reply } = await runChat({
            message: body,
            businessName: "your business",
            businessContext,
            history: [],
          });
          await sendWhatsAppMessage(from, reply);
        } catch (err) {
          console.error("[webhook/whatsapp] Failed to process message:", err);
          // Don't throw — one failed message shouldn't crash the entire batch.
        }

        // Log contact info for future CRM integration
        const contact = contacts?.find((c) => c.wa_id === from);
        if (contact?.profile?.name) {
          console.info(`[webhook/whatsapp] Replied to ${contact.profile.name} (${from})`);
        }
      }
    }
  }
}

function isWebhookPayload(value: unknown): value is WhatsAppWebhookPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "object" in value &&
    typeof (value as Record<string, unknown>)["object"] === "string"
  );
}
