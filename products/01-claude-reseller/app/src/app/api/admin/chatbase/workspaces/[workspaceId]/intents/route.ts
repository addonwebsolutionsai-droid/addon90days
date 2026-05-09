/**
 * POST /api/admin/chatbase/workspaces/[workspaceId]/intents
 *
 * Create a workspace-specific intent.
 * Body: { intent_key, name, system_prompt, threshold }
 * UNIQUE constraint: (workspace_id, intent_key).
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(name: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

const CreateIntentSchema = z.object({
  intent_key:    z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be kebab-case, e.g. discount-inquiry"),
  name:          z.string().min(1).max(200),
  system_prompt: z.string().min(50).max(2000),
  threshold:     z.number().min(0).max(1),
});

interface RouteContext { params: Promise<{ workspaceId: string }> }

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { workspaceId } = await ctx.params;

  // Verify workspace exists
  const { data: ws } = await p02table("p02_workspaces").select("id").eq("id", workspaceId).maybeSingle();
  if (ws === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workspace not found" } }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.message } }, { status: 400 });
  }

  // Check uniqueness
  const { data: existing } = await p02table("p02_intents")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("intent_key", parsed.data.intent_key)
    .maybeSingle();

  if (existing !== null) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Intent key "${parsed.data.intent_key}" already exists for this workspace` } },
      { status: 409 },
    );
  }

  const { data, error } = await p02table("p02_intents")
    .insert({
      workspace_id:  workspaceId,
      intent_key:    parsed.data.intent_key,
      name:          parsed.data.name,
      system_prompt: parsed.data.system_prompt,
      threshold:     parsed.data.threshold,
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    const msg = (error as Error | null)?.message ?? "unknown";
    return NextResponse.json({ error: { code: "DB_ERROR", message: msg } }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
