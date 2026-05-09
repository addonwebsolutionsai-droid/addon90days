import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { handleAdminListConversations } from "@/lib/ai-support/admin-handlers";
import type { ConvStatus } from "@/lib/ai-support/db";
// product: p01
const DENY = (status: number) => NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } }, { status });
export async function GET(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as ConvStatus | null;
  return handleAdminListConversations("p01", {
    status:  status ?? undefined,
    limit:   sp.get("limit") ?? undefined,
    cursor:  sp.get("cursor") ?? undefined,
  });
}
