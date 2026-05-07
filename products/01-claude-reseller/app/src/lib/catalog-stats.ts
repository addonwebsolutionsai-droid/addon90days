/**
 * Single source of truth for "how big is the catalog right now."
 *
 * Used by every server component, OG image, MCP server response, and
 * Skill Smith system prompt that needs to mention the skill count.
 *
 * Cached for 5 minutes via Next.js fetch revalidate, so we don't hammer
 * Supabase on every page render. After a Skill Smith fire (~3×/day), the
 * cached count refreshes within 5 min and every public surface follows.
 *
 * Why round down to the nearest 10:
 *   - Marketing-friendly: "140+" reads better than "141"
 *   - Always honest: the rounded number is always ≤ actual, so we never
 *     overstate. "140+" with 141 actual → still 140+.
 *   - Stable: a single Skill Smith fire that bumps 140 → 141 doesn't
 *     trigger a wave of "wait, why does the homepage say 141 but the
 *     OG image says 140" inconsistencies. Both stay at 140+ until we
 *     cross 150.
 */

import { SITE_BASE_URL } from "@/lib/site-config";

const FALLBACK_COUNT = 140;

/**
 * Live total of published skills. Cached 5 min by the Next.js fetch layer.
 * Falls back to FALLBACK_COUNT on any error so a Supabase blip doesn't
 * crash a page render.
 */
export async function getCatalogTotal(): Promise<number> {
  try {
    const res = await fetch(`${SITE_BASE_URL}/api/skills?limit=1`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return FALLBACK_COUNT;
    const data = (await res.json()) as { total?: number };
    return typeof data.total === "number" && data.total > 0 ? data.total : FALLBACK_COUNT;
  } catch {
    return FALLBACK_COUNT;
  }
}

/**
 * Marketing-friendly approximation. "141" → "140+". Always rounds DOWN
 * so we never overstate the catalog size.
 */
export function formatSkillCount(n: number): string {
  if (n < 10) return `${n}`;
  const rounded = Math.floor(n / 10) * 10;
  return `${rounded}+`;
}

/**
 * Convenience: combined fetch + format. Use in marketing copy.
 *   const count = await getSkillCountLabel(); // "140+"
 */
export async function getSkillCountLabel(): Promise<string> {
  return formatSkillCount(await getCatalogTotal());
}
