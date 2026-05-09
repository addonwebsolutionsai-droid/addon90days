/**
 * PATCH /api/admin/intents/[intentId]
 *   Edit name / system_prompt / threshold. intent_key is immutable.
 *
 * DELETE /api/admin/intents/[intentId]
 *   Delete a workspace-specific intent. Global intents (workspace_id IS NULL)
 *   are protected and will return 403.
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

const PatchSchema = z.object({
  name:          z.string().min(1).max(200).optional(),
  system_prompt: z.string().min(50).max(2000).optional(),
  threshold:     z.number().min(0).max(1).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: "At least one field required" });

interface RouteContext { params: Promise<{ intentId: string }> }

async function getIntent(intentId: string) {
  const { data } = await p02table("p02_intents").select("*").eq("id", intentId).maybeSingle();
  return data as { id: string; workspace_id: string | null; intent_key: string; name: string; system_prompt: string; threshold: number } | null;
}

export async function PATCH(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { intentId } = await ctx.params;
  const intent = await getIntent(intentId);
  if (intent === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Intent not found" } }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.message } }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.name !== undefined)          patch["name"]          = parsed.data.name;
  if (parsed.data.system_prompt !== undefined) patch["system_prompt"] = parsed.data.system_prompt;
  if (parsed.data.threshold !== undefined)     patch["threshold"]     = parsed.data.threshold;

  const { data, error } = await p02table("p02_intents").update(patch).eq("id", intentId).select("*").single();

  if (error !== null || data === null) {
    const msg = (error as Error | null)?.message ?? "unknown";
    return NextResponse.json({ error: { code: "DB_ERROR", message: msg } }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { intentId } = await ctx.params;
  const intent = await getIntent(intentId);
  if (intent === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Intent not found" } }, { status: 404 });
  }

  if (intent.workspace_id === null) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot delete global default intents" } },
      { status: 403 },
    );
  }

  const { error } = await p02table("p02_intents").delete().eq("id", intentId);
  if (error !== null) {
    const msg = (error as Error | null)?.message ?? "unknown";
    return NextResponse.json({ error: { code: "DB_ERROR", message: msg } }, { status: 500 });
  }

  return NextResponse.json({ data: { deleted: true, id: intentId } });
}
