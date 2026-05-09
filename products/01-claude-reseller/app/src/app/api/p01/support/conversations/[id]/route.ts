import { type NextRequest, NextResponse } from "next/server";
import { handleSupportConversationGet } from "@/lib/ai-support/route-handlers";
// public endpoint — visitor_id passed as query param for identity verification
// product: p01
interface Ctx { params: Promise<{ id: string }> }
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const visitorId = req.nextUrl.searchParams.get("visitor_id") ?? "";
  if (visitorId.length === 0) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "visitor_id required" } }, { status: 400 });
  }
  return handleSupportConversationGet('p01', id, visitorId);
}
