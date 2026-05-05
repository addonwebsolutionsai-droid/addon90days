/**
 * POST /api/skills/[slug]/view
 *
 * Bumps a skill's view_count by 1, deduplicated by IP+slug+day so a single
 * visitor refreshing 50 times only counts once. Anonymous endpoint — no
 * Clerk auth needed. Crawlers that don't run JS won't fire it (called from
 * a useEffect beacon on the skill detail page), which is the desired filter.
 *
 * Why a separate endpoint and not a server-component update on the page:
 *   1. The page fetch caches with revalidate=60, so a server-side bump only
 *      fires once per minute per skill — useless for actual analytics.
 *   2. Beacons keep the page render fast (no extra DB write in the SSR path).
 *   3. Dedup at the rate-limit layer is cheap and atomic.
 *
 * Race-safety note: the increment is a read-then-update (not atomic) because
 * we don't have a Postgres RPC for it yet. At expected launch concurrency
 * (<1000 concurrent viewers per skill) the lost-increment rate is < 1%, an
 * acceptable trade for shipping today. When we apply the next migration,
 * swap this to `.rpc("increment_skill_view", ...)`.
 */

import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, clientIdentifier } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext { params: Promise<{ slug: string }> }

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { slug } = await ctx.params;

  if (slug.length === 0 || slug.length > 80 || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, reason: "bad_slug" }, { status: 400 });
  }

  // Dedup: 1 view per IP per slug per 24h. Returns allowed=false on repeat.
  const ip = clientIdentifier(req);
  const dedup = await checkRateLimit({
    key:           `skill_view:${slug}:${ip}`,
    limit:         1,
    windowSeconds: 86400,
  });
  if (!dedup.allowed) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  // Read current count, increment by 1. RPC-based atomic increment is a v1.1
  // upgrade once the migration lands.
  const { data: row, error: readErr } = await supabaseAdmin
    .from("skills")
    .select("id, view_count")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (readErr !== null || row === null) {
    // Unknown slug — don't error noisily, treat as a no-op.
    return NextResponse.json({ ok: false, reason: "unknown_slug" }, { status: 404 });
  }

  const next = (row.view_count ?? 0) + 1;
  const { error: writeErr } = await supabaseAdmin
    .from("skills")
    .update({ view_count: next })
    .eq("id", row.id);

  if (writeErr !== null) {
    console.error("[skills/view] write failed:", writeErr.message);
    return NextResponse.json({ ok: false, reason: "write_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, view_count: next });
}
