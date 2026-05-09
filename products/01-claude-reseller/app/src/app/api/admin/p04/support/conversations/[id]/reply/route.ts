import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { handleAdminSendManualReply } from "@/lib/ai-support/admin-handlers";
// product: p04
const DENY = (status: number) => NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } }, { status });
interface Ctx { params: Promise<{ id: string }> }
export async function POST(req: NextRequest, ctx: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }
  return handleAdminSendManualReply("p04", g.userId, id, body);
}
