/**
 * Maps admin URL path prefixes to canonical product IDs.
 *
 * Used by tutorials (and other per-product admin pages) to derive the
 * product_id from the Next.js route segment without duplicating the
 * mapping in every page file.
 *
 * URL segment → product_id
 *   p01-skilon      → p01
 *   p02-chatbase    → p02
 *   p03-taxpilot    → p03
 *   p04-tableflow   → p04
 *   p05-connectone  → p05
 *   p06-machineguard → p06
 */

import type { TutorialProductId } from "@/lib/tutorials/db";

const SEGMENT_TO_PRODUCT_ID: Record<string, TutorialProductId> = {
  "p01-skilon":      "p01",
  "p02-chatbase":    "p02",
  "p03-taxpilot":    "p03",
  "p04-tableflow":   "p04",
  "p05-connectone":  "p05",
  "p06-machineguard": "p06",
};

/**
 * Convert a URL segment (e.g. "p02-chatbase") to a product_id (e.g. "p02").
 * Throws if the segment is not recognised — this signals a programming error,
 * not a user error (callers should only pass validated route params).
 */
export function segmentToProductId(segment: string): TutorialProductId {
  const id = SEGMENT_TO_PRODUCT_ID[segment];
  if (id === undefined) {
    throw new Error(
      `admin-product-key: unknown segment "${segment}". ` +
      `Expected one of: ${Object.keys(SEGMENT_TO_PRODUCT_ID).join(", ")}`
    );
  }
  return id;
}

/**
 * All known product segments — useful for generating static params.
 */
export const ALL_PRODUCT_SEGMENTS = Object.keys(SEGMENT_TO_PRODUCT_ID) as ReadonlyArray<string>;
