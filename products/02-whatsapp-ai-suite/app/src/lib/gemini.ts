import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

// Lazy singleton — only instantiated when first chat call is made.
// This prevents build-time errors when GEMINI_API_KEY is not set.
let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (_client) return _client;
  const key = process.env["GEMINI_API_KEY"];
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  _client = new GoogleGenerativeAI(key);
  return _client;
}

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export type ChatInput = {
  message: string;
  businessName: string;
  businessContext: string;
  history: ChatMessage[];
};

export type ChatOutput = {
  reply: string;
  tokensUsed: number;
};

// Converts our flat ChatMessage type into the SDK's Content shape.
function toGeminiHistory(history: ChatMessage[]): Content[] {
  return history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));
}

export async function runChat(input: ChatInput): Promise<ChatOutput> {
  const client = getClient();
  // gemini-1.5-flash is the haiku-tier equivalent — fast, cheap, good enough for
  // customer-facing Q&A. Upgrade to gemini-1.5-pro for complex reasoning.
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `You are a helpful business assistant for ${input.businessName}. Answer customer questions based on this context: ${input.businessContext}. Be concise, friendly, and accurate. If you don't know the answer, say so politely and suggest the customer contact the business directly.`;

  const chat = model.startChat({
    history: [
      // Inject system prompt as a user/model exchange at the start of history.
      // Gemini doesn't have a dedicated system role in the v1beta API.
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I'll help customers with accurate information about your business." }] },
      ...toGeminiHistory(input.history),
    ],
  });

  const result = await chat.sendMessage(input.message);
  const response = result.response;
  const reply = response.text();
  const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;

  return { reply, tokensUsed };
}
