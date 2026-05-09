import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { handleAdminGetConversation } from "@/lib/ai-support/admin-handlers";
// product: p05
const DENY = (status: number) => NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } }, { status });
interface Ctx { params: Promise<{ id: string }> }
export async function GET(_req: Request, ctx: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  const { id } = await ctx.params;
  return handleAdminGetConversation("p05", id);
}
