/**
 * P02 ChatBase — database helpers.
 * All writes use the service-role client (bypasses RLS).
 * Callers are responsible for scoping by workspace_id from Clerk session.
 *
 * Note: Supabase client is typed for the P01 schema (Database type).
 * P02 tables are accessed via `as unknown as` casts at the table level.
 * When we generate P02 types, remove the casts.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  P02Workspace,
  P02KbDoc,
  P02Intent,
  P02Conversation,
  P02Message,
  KbChunk,
  ConvStatus,
  MsgDirection,
  MsgRole,
  KbKind,
} from "./types";

// Helper: get an untyped query builder for P02 tables.
// This avoids fighting the Database generic that only knows P01 tables.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(tableName: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

export async function createWorkspace(params: {
  owner_clerk_user_id: string;
  business_name: string;
  timezone?: string;
  locale?: string;
}): Promise<P02Workspace> {
  const { data, error } = await p02table("p02_workspaces")
    .insert({
      owner_clerk_user_id: params.owner_clerk_user_id,
      business_name: params.business_name,
      timezone: params.timezone ?? "Asia/Kolkata",
      locale: params.locale ?? "en",
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`createWorkspace failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as P02Workspace;
}

export async function getWorkspace(id: string): Promise<P02Workspace | null> {
  const { data, error } = await p02table("p02_workspaces")
    .select("*")
    .eq("id", id)
    .single();

  if (error !== null || data === null) return null;
  return data as P02Workspace;
}

export async function getWorkspaceByOwner(
  owner_clerk_user_id: string,
  id: string
): Promise<P02Workspace | null> {
  const { data, error } = await p02table("p02_workspaces")
    .select("*")
    .eq("id", id)
    .eq("owner_clerk_user_id", owner_clerk_user_id)
    .single();

  if (error !== null || data === null) return null;
  return data as P02Workspace;
}

// ---------------------------------------------------------------------------
// Knowledge Base
// ---------------------------------------------------------------------------

export async function addKbDoc(params: {
  workspace_id: string;
  kind: KbKind;
  source_url?: string;
  raw_content: string;
  parsed_chunks: KbChunk[];
}): Promise<P02KbDoc> {
  const { data, error } = await p02table("p02_kb_docs")
    .insert({
      workspace_id: params.workspace_id,
      kind: params.kind,
      source_url: params.source_url ?? null,
      raw_content: params.raw_content,
      parsed_chunks: params.parsed_chunks,
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`addKbDoc failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as P02KbDoc;
}

export async function getKbDocs(workspace_id: string): Promise<P02KbDoc[]> {
  const { data, error } = await p02table("p02_kb_docs")
    .select("*")
    .eq("workspace_id", workspace_id)
    .order("created_at", { ascending: false });

  if (error !== null || data === null) return [];
  return data as P02KbDoc[];
}

// ---------------------------------------------------------------------------
// Intents
// ---------------------------------------------------------------------------

/** Returns workspace-specific intents merged with global defaults.
 *  Workspace-specific intents override the global ones of the same key. */
export async function getIntents(workspace_id: string): Promise<P02Intent[]> {
  // Fetch global (workspace_id IS NULL) + workspace-specific rows.
  // Supabase "or" with .is.null needs the is.null form.
  const { data, error } = await p02table("p02_intents")
    .select("*")
    .or(`workspace_id.is.null,workspace_id.eq.${workspace_id}`);

  if (error !== null || data === null) return [];

  const intents = data as P02Intent[];
  const byKey = new Map<string, P02Intent>();
  // Globals first, then workspace overrides
  for (const intent of intents) {
    if (intent.workspace_id === null) byKey.set(intent.intent_key, intent);
  }
  for (const intent of intents) {
    if (intent.workspace_id !== null) byKey.set(intent.intent_key, intent);
  }
  return Array.from(byKey.values());
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

/** Find active/escalated conversation for phone, or create new. */
export async function upsertConversation(params: {
  workspace_id: string;
  customer_phone: string;
  customer_name?: string;
}): Promise<P02Conversation> {
  // Try to find existing open conversation
  const { data: existing } = await p02table("p02_conversations")
    .select("*")
    .eq("workspace_id", params.workspace_id)
    .eq("customer_phone", params.customer_phone)
    .neq("status", "closed")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (existing !== null) {
    const existingConv = existing as P02Conversation;
    if (params.customer_name && existingConv.customer_name === null) {
      await p02table("p02_conversations")
        .update({ customer_name: params.customer_name, updated_at: new Date().toISOString() })
        .eq("id", existingConv.id);
      return { ...existingConv, customer_name: params.customer_name };
    }
    return existingConv;
  }

  const { data, error } = await p02table("p02_conversations")
    .insert({
      workspace_id: params.workspace_id,
      customer_phone: params.customer_phone,
      customer_name: params.customer_name ?? null,
      status: "active",
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`upsertConversation failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as P02Conversation;
}

export async function getConversation(id: string): Promise<P02Conversation | null> {
  const { data } = await p02table("p02_conversations")
    .select("*")
    .eq("id", id)
    .single();
  return (data as P02Conversation | null) ?? null;
}

export async function listConversations(
  workspace_id: string,
  params: { limit: number; cursor?: string; status?: ConvStatus }
): Promise<P02Conversation[]> {
  let q = p02table("p02_conversations")
    .select("*")
    .eq("workspace_id", workspace_id)
    .order("updated_at", { ascending: false })
    .limit(params.limit);

  if (params.status) q = q.eq("status", params.status);
  if (params.cursor) q = q.lt("updated_at", params.cursor);

  const { data } = await q;
  return (data as P02Conversation[]) ?? [];
}

export async function updateConversationStatus(
  id: string,
  status: ConvStatus,
  last_intent?: string
): Promise<void> {
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (last_intent !== undefined) patch["last_intent"] = last_intent;
  await p02table("p02_conversations").update(patch).eq("id", id);
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function insertMessage(params: {
  conversation_id: string;
  direction: MsgDirection;
  body: string;
  intent?: string;
  confidence?: number;
  role: MsgRole;
  meta_message_id?: string;
}): Promise<P02Message> {
  const { data, error } = await p02table("p02_messages")
    .insert({
      conversation_id: params.conversation_id,
      direction: params.direction,
      body: params.body,
      intent: params.intent ?? null,
      confidence: params.confidence ?? null,
      role: params.role,
      meta_message_id: params.meta_message_id ?? null,
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`insertMessage failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as P02Message;
}

export async function getRecentMessages(
  conversation_id: string,
  limit = 20
): Promise<P02Message[]> {
  const { data } = await p02table("p02_messages")
    .select("*")
    .eq("conversation_id", conversation_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data as P02Message[]) ?? []).reverse();
}
