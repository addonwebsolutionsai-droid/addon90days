// WhatsApp Business API stub via 360dialog.
// 360dialog sits on top of the official WhatsApp Business Cloud API and provides
// a simple REST endpoint. Replace this stub with real HTTP calls once the
// 360dialog account is provisioned and WHATSAPP_API_KEY is set.

type SendMessageResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  text: string
): Promise<SendMessageResult> {
  const apiKey = process.env["WHATSAPP_API_KEY"];
  const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];

  if (!apiKey || !phoneNumberId) {
    // In development / staging without credentials, log and return success stub
    // so the webhook flow can be tested end-to-end without real WA delivery.
    console.warn("[whatsapp] WHATSAPP_API_KEY or WHATSAPP_PHONE_NUMBER_ID not set — skipping real send");
    return { success: true, messageId: "stub-" + Date.now().toString() };
  }

  // 360dialog Cloud API endpoint
  const url = `https://waba.360dialog.io/v1/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhoneNumber,
        type: "text",
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      const errorMsg =
        typeof body === "object" && body !== null && "message" in body
          ? String((body as Record<string, unknown>)["message"])
          : `HTTP ${response.status}`;
      return { success: false, error: errorMsg };
    }

    const data: unknown = await response.json();
    const msgs =
      typeof data === "object" && data !== null && "messages" in data
        ? (data as { messages?: Array<{ id?: string }> }).messages
        : undefined;
    const messageId = Array.isArray(msgs) ? msgs[0]?.id : undefined;

    return { success: true, messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}
