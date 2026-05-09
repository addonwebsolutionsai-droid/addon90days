import { type NextRequest } from "next/server";
import { handleSupportInbound } from "@/lib/ai-support/route-handlers";
// public endpoint — no auth required
// product: p05
export async function POST(req: NextRequest) {
  return handleSupportInbound('p05', req);
}
