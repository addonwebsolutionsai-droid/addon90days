/**
 * P02 ChatBase — shared TypeScript types.
 * All types are named exports. No default exports.
 */

// ---------------------------------------------------------------------------
// Database row shapes (minimal — only what the API layer needs)
// ---------------------------------------------------------------------------

export type ConvStatus = "active" | "escalated" | "closed";
export type MsgDirection = "inbound" | "outbound";
export type MsgRole = "customer" | "ai" | "human";
export type KbKind = "text" | "url" | "pdf";

export interface P02Workspace {
  id: string;
  owner_clerk_user_id: string;
  business_name: string;
  timezone: string;
  locale: string;
  escalation_threshold: number;
  mock_mode: boolean;
  whatsapp_phone_number_id: string | null;
  /** never returned to client — server-side only */
  whatsapp_access_token_enc?: Buffer | null;
  created_at: string;
  updated_at: string;
}

export interface P02KbDoc {
  id: string;
  workspace_id: string;
  kind: KbKind;
  source_url: string | null;
  raw_content: string;
  parsed_chunks: KbChunk[];
  created_at: string;
}

export interface KbChunk {
  index: number;
  text: string;
}

export interface P02Intent {
  id: string;
  workspace_id: string | null;
  intent_key: string;
  name: string;
  system_prompt: string;
  threshold: number;
}

export interface P02Conversation {
  id: string;
  workspace_id: string;
  customer_phone: string;
  customer_name: string | null;
  last_intent: string | null;
  status: ConvStatus;
  created_at: string;
  updated_at: string;
}

export interface P02Message {
  id: string;
  conversation_id: string;
  direction: MsgDirection;
  body: string;
  intent: string | null;
  confidence: number | null;
  role: MsgRole;
  meta_message_id: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Reply engine I/O
// ---------------------------------------------------------------------------

export interface ReplyEngineInput {
  workspace_id: string;
  conversation_id: string;
  customer_message: string;
  history: Array<{ role: MsgRole; body: string }>;
}

export interface ReplyEngineResult {
  replied: boolean;
  escalated: boolean;
  intent: string;
  confidence: number;
  reply_body: string | null;
  /** null in mock mode or when confidence < threshold */
  meta_message_id: string | null;
}

// ---------------------------------------------------------------------------
// Meta Cloud API shapes (minimal)
// ---------------------------------------------------------------------------

export interface MetaWebhookEntry {
  id: string;
  changes: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  value: MetaWebhookValue;
  field: string;
}

export interface MetaWebhookValue {
  messaging_product: string;
  metadata: { display_phone_number: string; phone_number_id: string };
  contacts?: Array<{ profile: { name: string }; wa_id: string }>;
  messages?: MetaInboundMessage[];
  statuses?: MetaMessageStatus[];
}

export interface MetaInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: { body: string };
  type: string;
}

export interface MetaMessageStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

// ---------------------------------------------------------------------------
// API response envelopes
// ---------------------------------------------------------------------------

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = { data: T } | ApiError;
