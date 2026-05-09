import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { handleAdminTakeOver } from "@/lib/ai-support/admin-handlers";
// product: p06
const DENY = (status: number) => NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } }, { status });
interface Ctx { params: Promise<{ id: string }> }
export async function POST(_req: Request, ctx: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  const { id } = await ctx.params;
  return handleAdminTakeOver("p06", g.userId, id);
}
