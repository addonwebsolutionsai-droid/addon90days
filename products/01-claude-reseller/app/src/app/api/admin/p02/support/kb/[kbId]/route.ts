import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { handleAdminDeleteKb } from "@/lib/ai-support/admin-handlers";
// product: p02
const DENY = (status: number) => NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } }, { status });
interface Ctx { params: Promise<{ kbId: string }> }
export async function DELETE(_req: Request, ctx: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  const { kbId } = await ctx.params;
  return handleAdminDeleteKb("p02", g.userId, kbId);
}
