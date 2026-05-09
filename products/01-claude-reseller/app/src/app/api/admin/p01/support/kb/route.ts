import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { handleAdminListKb, handleAdminCreateKb } from "@/lib/ai-support/admin-handlers";
// product: p01
const DENY = (status: number) => NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } }, { status });
export async function GET() {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  return handleAdminListKb("p01");
}
export async function POST(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return DENY(g.reason === "unauthenticated" ? 401 : 403);
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }
  return handleAdminCreateKb("p01", g.userId, body);
}
