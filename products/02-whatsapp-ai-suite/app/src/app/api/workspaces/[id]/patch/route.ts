/**
 * PATCH /api/workspaces/:id/patch — update workspace settings
 *
 * Allowed fields: business_name, escalation_threshold
 * (timezone and locale are read-only on v1 — require migration + i18n work)
 *
 * Auth: Clerk required. Owner-scoped.
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getWorkspaceByOwner } from "@/lib/p02/db";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { P02Workspace } from "@/lib/p02/types";

// Escape the Supabase generic type to write to untyped p02 tables.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(name: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

const PatchSchema = z.object({
  business_name: z.string().min(1).max(120).optional(),
  escalation_threshold: z.number().min(0).max(1).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const { id: workspaceId } = await ctx.params;
  const workspace = await getWorkspaceByOwner(userId, workspaceId);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found" } },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "No fields to update" } },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await p02table("p02_workspaces")
    .update(patch)
    .eq("id", workspaceId)
    .select("*")
    .single();

  if (error !== null || data === null) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to update workspace" } },
      { status: 500 }
    );
  }

  const { whatsapp_access_token_enc: _enc, ...safe } = data as P02Workspace;
  return NextResponse.json({ data: safe });
}
