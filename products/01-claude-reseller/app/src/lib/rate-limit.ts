// AUTO-SYNCED FROM packages/auth/src/rate-limit.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:04:29.482Z
/**
 * Rate limit helper backed by Supabase function `check_rate_limit`.
 *
 * Why we have this: Groq's free tier is 14,400 RPD shared across the
 * entire site. A single bot, scraper, or even one curious visitor with
 * a script can drain the daily quota in seconds — bricking the
 * "Try Live" demo at the exact moment we're trying to convert traffic.
 *
 * Pattern (per call):
 *   const { allowed, retryAfterSec } = await checkRateLimit({
 *     key:           "chat:ip:" + ip,
 *     limit:         30,
 *     windowSeconds: 3600,
 *   });
 *   if (!allowed) return rateLimitedResponse(retryAfterSec);
 *
 * Atomic via the Postgres function — no race between SELECT and UPDATE.
 * Falls open on infra failure (better to serve a request than to 503
 * a real user because Supabase is briefly unreachable).
 */

import { supabaseAdmin } from "@/lib/supabase";
import type { NextRequest } from "next/server";

interface CheckParams {
  key:           string;
  limit:         number;
  windowSeconds: number;
}

interface CheckResult {
  allowed:       boolean;
  count:         number;
  retryAfterSec: number;   // seconds until the current window resets
}

export async function checkRateLimit(params: CheckParams): Promise<CheckResult> {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      "check_rate_limit" as never,
      {
        p_key:            params.key,
        p_limit:          params.limit,
        p_window_seconds: params.windowSeconds,
      } as never
    ) as { data: Array<{ allowed: boolean; current_count: number; reset_at: string }> | null; error: unknown };

    if (error !== null || !data || data.length === 0) {
      // Fail open — log and allow. Don't 503 a real user because of a
      // Supabase blip.
      return { allowed: true, count: 0, retryAfterSec: 0 };
    }
    const row = data[0]!;
    const resetMs = new Date(row.reset_at).getTime() - Date.now();
    return {
      allowed:       row.allowed,
      count:         row.current_count,
      retryAfterSec: Math.max(1, Math.ceil(resetMs / 1000)),
    };
  } catch {
    return { allowed: true, count: 0, retryAfterSec: 0 };
  }
}

/**
 * Extract a stable identifier from the request for IP-based limits.
 * Honours common Vercel / Cloudflare / proxy headers in priority order.
 * Falls back to "anon" if nothing is present (which means a single bucket
 * for all anon traffic — still better than nothing).
 */
export function clientIdentifier(req: NextRequest): string {
  // Vercel sets x-forwarded-for; first hop is the client.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && first.length > 0 && first.length < 64) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.length < 64) return realIp;
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.length < 64) return cfIp;
  return "anon";
}

/**
 * Standard 429 response shape. Use this from any route that calls
 * checkRateLimit so the client gets a consistent body + Retry-After.
 */
export function rateLimitedResponse(retryAfterSec: number, customMessage?: string): Response {
  return new Response(
    JSON.stringify({
      error:           customMessage ?? "Rate limit exceeded — please slow down and try again shortly.",
      retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After":  String(retryAfterSec),
      },
    }
  );
}
