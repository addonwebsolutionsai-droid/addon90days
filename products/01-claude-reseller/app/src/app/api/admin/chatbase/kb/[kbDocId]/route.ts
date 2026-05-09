/**
 * DELETE /api/admin/chatbase/kb/[kbDocId]
 *
 * Delete a KB doc by id.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(name: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

interface RouteContext { params: Promise<{ kbDocId: string }> }

export async function DELETE(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { kbDocId } = await ctx.params;

  const { data: existing } = await p02table("p02_kb_docs").select("id").eq("id", kbDocId).maybeSingle();
  if (existing === null) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "KB doc not found" } }, { status: 404 });
  }

  const { error } = await p02table("p02_kb_docs").delete().eq("id", kbDocId);
  if (error !== null) {
    const msg = (error as Error | null)?.message ?? "unknown";
    return NextResponse.json({ error: { code: "DB_ERROR", message: msg } }, { status: 500 });
  }

  return NextResponse.json({ data: { deleted: true, id: kbDocId } });
}
