// AUTO-SYNCED FROM packages/ai-support/src/db.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:15:37.548Z
/**
 * lib/ai-support/db.ts
 *
 * Parameterised DB helpers for the per-product support stack.
 * All table names are derived from the productId so this single module
 * serves all 6 products without duplication.
 *
 * Shared intents are read from p02_intents where workspace_id IS NULL.
 * Those rows represent universal support intents (pricing-question, how-do-i,
 * complaint, billing-issue, bug-report, unknown). Product-specific intents
 * can be added later by introducing a product_id column on p02_intents.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SupportIntent, KbChunk, KbDoc } from "./engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductId = "p01" | "p02" | "p03" | "p04" | "p05" | "p06";

export interface SupportTables {
  kb:            string;
  conversations: string;
  messages:      string;
}

export type ConvStatus = "active" | "escalated" | "closed";

export interface SupportConversation {
  id:               string;
  visitor_id:       string;
  is_authenticated: boolean;
  status:           ConvStatus;
  last_intent:      string | null;
  last_message_at:  string | null;
  created_at:       string;
  updated_at:       string;
}

export interface SupportMessage {
  id:              string;
  conversation_id: string;
  direction:       "inbound" | "outbound";
  role:            "visitor" | "ai" | "human";
  body:            string;
  intent:          string | null;
  confidence:      number | null;
  created_at:      string;
}

export interface SupportKbRow {
  id:            string;
  kind:          "text" | "url" | "faq";
  source_url:    string | null;
  question:      string | null;
  raw_content:   string;
  parsed_chunks: KbChunk[];
  is_active:     boolean;
  created_at:    string;
  updated_at:    string;
}

// ---------------------------------------------------------------------------
// Untyped table accessor (same pattern as lib/p02/db.ts)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function support(tableName: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

// ---------------------------------------------------------------------------
// Table name resolver
// ---------------------------------------------------------------------------

export function getProductTables(productId: ProductId): SupportTables {
  return {
    kb:            `${productId}_support_kb`,
    conversations: `${productId}_support_conversations`,
    messages:      `${productId}_support_messages`,
  };
}

// ---------------------------------------------------------------------------
// KB
// ---------------------------------------------------------------------------

export async function listKb(
  productId: ProductId,
  opts: { activeOnly?: boolean; limit?: number } = {},
): Promise<SupportKbRow[]> {
  const { kb } = getProductTables(productId);
  const limit = Math.min(opts.limit ?? 100, 200);
  let q = support(kb).select("*").order("created_at", { ascending: false }).limit(limit);
  if (opts.activeOnly === true) q = q.eq("is_active", true);
  const { data, error } = (await q) as { data: SupportKbRow[] | null; error: { message: string } | null };
  if (error !== null) throw new Error(`listKb(${productId}): ${error.message}`);
  return data ?? [];
}

export async function createKbFromText(
  productId: ProductId,
  params: { raw_content: string },
): Promise<SupportKbRow> {
  const { kb } = getProductTables(productId);
  const { chunkText } = await import("./engine");
  const parsed_chunks = chunkText(params.raw_content);
  const { data, error } = (await support(kb)
    .insert({ kind: "text", raw_content: params.raw_content, parsed_chunks })
    .select("*")
    .single()) as { data: SupportKbRow | null; error: { message: string } | null };
  if (error !== null || data === null) {
    throw new Error(`createKbFromText(${productId}): ${error?.message ?? "no data"}`);
  }
  return data;
}

export async function createKbFromUrl(
  productId: ProductId,
  params: { source_url: string },
): Promise<SupportKbRow> {
  const { kb } = getProductTables(productId);
  const { scrapeUrl, chunkText } = await import("./engine");
  const raw_content   = await scrapeUrl(params.source_url);
  const parsed_chunks = chunkText(raw_content);
  const { data, error } = (await support(kb)
    .insert({ kind: "url", source_url: params.source_url, raw_content, parsed_chunks })
    .select("*")
    .single()) as { data: SupportKbRow | null; error: { message: string } | null };
  if (error !== null || data === null) {
    throw new Error(`createKbFromUrl(${productId}): ${error?.message ?? "no data"}`);
  }
  return data;
}

export async function deleteKb(productId: ProductId, kbId: string): Promise<void> {
  const { kb } = getProductTables(productId);
  const { error } = (await support(kb).delete().eq("id", kbId)) as {
    error: { message: string } | null;
  };
  if (error !== null) throw new Error(`deleteKb(${productId}): ${error.message}`);
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function upsertConversation(
  productId: ProductId,
  params: { visitor_id: string; is_authenticated: boolean },
): Promise<SupportConversation> {
  const { conversations } = getProductTables(productId);

  // Find most recent active conversation for this visitor
  const { data: existing } = (await support(conversations)
    .select("*")
    .eq("visitor_id", params.visitor_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: SupportConversation | null; error: unknown };

  if (existing !== null) return existing;

  const { data, error } = (await support(conversations)
    .insert({
      visitor_id:       params.visitor_id,
      is_authenticated: params.is_authenticated,
    })
    .select("*")
    .single()) as { data: SupportConversation | null; error: { message: string } | null };

  if (error !== null || data === null) {
    throw new Error(`upsertConversation(${productId}): ${error?.message ?? "no data"}`);
  }
  return data;
}

export async function getConversation(
  productId: ProductId,
  conversationId: string,
): Promise<SupportConversation | null> {
  const { conversations } = getProductTables(productId);
  const { data } = (await support(conversations)
    .select("*")
    .eq("id", conversationId)
    .maybeSingle()) as { data: SupportConversation | null; error: unknown };
  return data;
}

export async function listConversations(
  productId: ProductId,
  opts: { status?: ConvStatus; limit?: number; cursor?: string } = {},
): Promise<SupportConversation[]> {
  const { conversations } = getProductTables(productId);
  const limit = Math.min(opts.limit ?? 50, 100);
  let q = support(conversations)
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (opts.status !== undefined) q = q.eq("status", opts.status);
  if (opts.cursor !== undefined) q = q.lt("last_message_at", opts.cursor);
  const { data, error } = (await q) as {
    data: SupportConversation[] | null;
    error: { message: string } | null;
  };
  if (error !== null) throw new Error(`listConversations(${productId}): ${error.message}`);
  return data ?? [];
}

export async function updateConversationStatus(
  productId: ProductId,
  conversationId: string,
  status: ConvStatus,
  last_intent?: string,
): Promise<void> {
  const { conversations } = getProductTables(productId);
  const patch: Record<string, unknown> = { status, last_message_at: new Date().toISOString() };
  if (last_intent !== undefined) patch["last_intent"] = last_intent;
  const { error } = (await support(conversations).update(patch).eq("id", conversationId)) as {
    error: { message: string } | null;
  };
  if (error !== null) {
    throw new Error(`updateConversationStatus(${productId}): ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function getRecentMessages(
  productId: ProductId,
  conversationId: string,
  limit = 10,
): Promise<SupportMessage[]> {
  const { messages } = getProductTables(productId);
  const { data, error } = (await support(messages)
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit)) as { data: SupportMessage[] | null; error: { message: string } | null };
  if (error !== null) throw new Error(`getRecentMessages(${productId}): ${error.message}`);
  return (data ?? []).reverse();
}

export async function insertMessage(
  productId: ProductId,
  params: {
    conversation_id: string;
    direction:       "inbound" | "outbound";
    role:            "visitor" | "ai" | "human";
    body:            string;
    intent?:         string;
    confidence?:     number;
  },
): Promise<SupportMessage> {
  const { messages } = getProductTables(productId);
  const { data, error } = (await support(messages)
    .insert({
      conversation_id: params.conversation_id,
      direction:       params.direction,
      role:            params.role,
      body:            params.body,
      intent:          params.intent ?? null,
      confidence:      params.confidence ?? null,
    })
    .select("*")
    .single()) as { data: SupportMessage | null; error: { message: string } | null };
  if (error !== null || data === null) {
    throw new Error(`insertMessage(${productId}): ${error?.message ?? "no data"}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Global intents (shared across products — from p02_intents, workspace_id IS NULL)
// ---------------------------------------------------------------------------

export async function getGlobalIntents(): Promise<SupportIntent[]> {
  const { data, error } = (await support("p02_intents")
    .select("intent_key, name, threshold")
    .is("workspace_id", null)
    .eq("is_active", true)) as {
    data: SupportIntent[] | null;
    error: { message: string } | null;
  };
  if (error !== null) throw new Error(`getGlobalIntents: ${error.message}`);
  return data ?? [];
}

// Convenience: load active KB docs as KbDoc[] for retrieval
export async function getActiveKbDocs(productId: ProductId): Promise<KbDoc[]> {
  const rows = await listKb(productId, { activeOnly: true });
  return rows as unknown as KbDoc[];
}
