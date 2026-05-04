/**
 * P02 ChatBase — Meta Cloud API client.
 *
 * MOCK_MODE: when true (or when WHATSAPP_PHONE_NUMBER_ID is absent),
 * all sends are no-ops that return a fake message ID.
 * Set MOCK_MODE=false + WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN
 * in env to enable real sends.
 */

const META_API_BASE = "https://graph.facebook.com/v21.0";
const WHATSAPP_MSG_MAX_CHARS = 1600;

export interface SendTextResult {
  meta_message_id: string | null;
  mock: boolean;
}

function isMockMode(): boolean {
  // Global kill-switch: MOCK_MODE env var
  if (process.env["MOCK_MODE"] === "false") {
    // Only real if phone number ID is also set
    return !process.env["WHATSAPP_PHONE_NUMBER_ID"];
  }
  return true;
}

/** Send a text message to a WhatsApp recipient. */
export async function sendTextMessage(params: {
  to: string;
  body: string;
  phone_number_id?: string;
  access_token?: string;
}): Promise<SendTextResult> {
  if (isMockMode()) {
    return {
      meta_message_id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mock: true,
    };
  }

  const phoneNumberId =
    params.phone_number_id ?? process.env["WHATSAPP_PHONE_NUMBER_ID"];
  const accessToken =
    params.access_token ?? process.env["WHATSAPP_ACCESS_TOKEN"];

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be set for real sends"
    );
  }

  // Truncate to WhatsApp single-bubble limit
  const body =
    params.body.length > WHATSAPP_MSG_MAX_CHARS
      ? params.body.slice(0, WHATSAPP_MSG_MAX_CHARS - 3) + "..."
      : params.body;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: params.to,
    type: "text",
    text: { preview_url: false, body },
  };

  const res = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Meta API HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    messages?: Array<{ id: string }>;
  };

  const meta_message_id = json.messages?.[0]?.id ?? null;
  return { meta_message_id, mock: false };
}
