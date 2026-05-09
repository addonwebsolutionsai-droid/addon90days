/**
 * GET /api/hsn/search?q=<query>&limit=<n>&commonOnly=<bool>
 *
 * HSN/SAC autocomplete. Used by the invoice line-item creator. Returns the
 * top matches by code prefix or description substring, common rows first.
 *
 * Auth: Clerk required. The HSN master itself is public (RLS allows SELECT
 * from anon), but we keep this route auth-gated to (a) prevent autocomplete
 * scraping for keyword harvesting, and (b) keep all P03 routes uniformly
 * authenticated so future per-tenant overrides land in the same place.
 *
 * Rate limit: 60/min per user — autocomplete is a hot path while the user
 * types but a single typist won't beat 60/min.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchHsnCodes } from "@/lib/p03/db";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  const rate = await checkRateLimit({
    key: `p03_hsn_search:${userId}`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  const params     = req.nextUrl.searchParams;
  const query      = (params.get("q") ?? "").slice(0, 80);
  const limit      = Math.min(Math.max(Number(params.get("limit") ?? 12), 1), 50);
  const commonOnly = params.get("commonOnly") === "true";

  try {
    const results = await searchHsnCodes({ query, limit, commonOnly });
    return NextResponse.json({ data: results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[p03/hsn/search] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "HSN search failed" } },
      { status: 500 },
    );
  }
}
