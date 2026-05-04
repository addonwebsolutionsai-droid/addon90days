/**
 * P02 ChatBase — intent classification via Groq Llama-3.3-70B.
 *
 * Returns the matched intent key + confidence score (0–1).
 * Uses structured JSON output via Groq's response_format.
 */

import type { P02Intent } from "./types";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface ClassificationResult {
  intent_key: string;
  confidence: number;
  reasoning: string;
}

const CLASSIFICATION_SCHEMA = {
  type: "object",
  properties: {
    intent_key: { type: "string" },
    confidence: { type: "number" },
    reasoning: { type: "string" },
  },
  required: ["intent_key", "confidence", "reasoning"],
};

export async function classifyIntent(
  message: string,
  intents: P02Intent[],
  history: Array<{ role: string; body: string }>
): Promise<ClassificationResult> {
  const groqKey = process.env["GROQ_API_KEY"];
  if (!groqKey) {
    // Fail safe — return unknown with low confidence
    return { intent_key: "unknown", confidence: 0.1, reasoning: "GROQ_API_KEY not set" };
  }

  const intentList = intents
    .map((i) => `- ${i.intent_key}: ${i.name}`)
    .join("\n");

  const recentHistory = history
    .slice(-6)
    .map((m) => `${m.role}: ${m.body}`)
    .join("\n");

  const systemPrompt = `You are an intent classifier for a WhatsApp business AI assistant.

Available intents:
${intentList}

Conversation history (most recent last):
${recentHistory || "(no prior messages)"}

Classify the customer's latest message into exactly one of the available intent keys.
Return a JSON object with:
- intent_key: one of the exact keys listed above
- confidence: float between 0.0 and 1.0 (how confident you are)
- reasoning: one sentence explaining why

Respond with ONLY valid JSON. No markdown, no explanation outside the JSON.`;

  const userPrompt = `Customer message: "${message}"`;

  try {
    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[p02/intent] Groq HTTP ${res.status}: ${text.slice(0, 200)}`);
      return { intent_key: "unknown", confidence: 0.1, reasoning: `Groq error ${res.status}` };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    if (content.length === 0) {
      return { intent_key: "unknown", confidence: 0.1, reasoning: "empty response" };
    }

    const parsed = JSON.parse(content) as Partial<ClassificationResult>;
    const intent_key =
      typeof parsed.intent_key === "string" && intents.some((i) => i.intent_key === parsed.intent_key)
        ? parsed.intent_key
        : "unknown";
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5;
    const reasoning = typeof parsed.reasoning === "string" ? parsed.reasoning : "";

    return { intent_key, confidence, reasoning };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[p02/intent] Classification error: ${msg}`);
    return { intent_key: "unknown", confidence: 0.1, reasoning: msg.slice(0, 100) };
  }

  // unreachable but required for TS exhaustive check
  return { intent_key: "unknown", confidence: 0.1, reasoning: "unreachable" };
}

/** Validate classification result JSON against the schema (runtime guard). */
function _validateSchema(obj: unknown): obj is ClassificationResult {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o["intent_key"] === "string" &&
    typeof o["confidence"] === "number" &&
    typeof o["reasoning"] === "string"
  );
}

// Export schema for testing/documentation
export { CLASSIFICATION_SCHEMA };
