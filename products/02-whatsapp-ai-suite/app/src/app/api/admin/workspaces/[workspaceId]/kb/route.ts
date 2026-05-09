/**
 * POST /api/admin/workspaces/[workspaceId]/kb
 *
 * Create a KB doc for a workspace.
 * Body: { kind: "text"|"url"|"pdf", raw_content?, source_url? }
 *   kind=text  → raw_content required
 *   kind=url   → source_url required; fetched server-side via scrapeUrl()
 *   kind=pdf   → 501 Not Implemented
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase";
import { chunkText, scrapeUrl } from "@/lib/p02/kb";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(name: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

const CreateKbSchema = z.discriminatedUnion("kind", [
  z.object({
    kind:        z.literal("text"),
    raw_content: z.string().min(50).max(50_000),
  }),
  z.object({
    kind:       z.literal("url"),
    source_url: z.string().url(),
  }),
  z.object({
    kind: z.literal("pdf"),
  }),
]);

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

  const { data: ws } = await p02table("p02_workspaces").select("id").eq("id", workspaceId).maybeSingle();
  if (ws === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workspace not found" } }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateKbSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.message } }, { status: 400 });
  }

  if (parsed.data.kind === "pdf") {
    return NextResponse.json({ error: { code: "NOT_IMPLEMENTED", message: "PDF ingestion is coming soon" } }, { status: 501 });
  }

  let rawContent: string;
  let sourceUrl: string | null = null;

  if (parsed.data.kind === "text") {
    rawContent = parsed.data.raw_content;
  } else {
    // kind === "url"
    sourceUrl = parsed.data.source_url;
    try {
      rawContent = await scrapeUrl(sourceUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scrape failed";
      return NextResponse.json({ error: { code: "SCRAPE_FAILED", message } }, { status: 400 });
    }
  }

  const parsedChunks = chunkText(rawContent);

  const { data, error } = await p02table("p02_kb_docs")
    .insert({
      workspace_id:   workspaceId,
      kind:           parsed.data.kind,
      source_url:     sourceUrl,
      raw_content:    rawContent,
      parsed_chunks:  parsedChunks,
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    const msg = (error as Error | null)?.message ?? "unknown";
    return NextResponse.json({ error: { code: "DB_ERROR", message: msg } }, { status: 500 });
  }

  return NextResponse.json({ data });
}
