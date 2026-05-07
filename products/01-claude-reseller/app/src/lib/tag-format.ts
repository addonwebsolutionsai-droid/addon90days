/**
 * Tag display formatting for /skills/tag/[tag] routes.
 *
 * Tags in the DB are kebab-case slugs (e.g. "prompt-engineering", "gst").
 * This module converts them to display labels suitable for H1s, badges,
 * and link text.
 *
 * Acronym table: covers the top-20 acronyms found across the catalog.
 * If the catalog grows to include new acronyms not in this table, they will
 * be title-cased (e.g. "llm" → "Llm") — add them here when spotted.
 * We deliberately keep this list small; 30+ entries would make it hard to
 * audit. See PR description for rationale.
 */

const ACRONYMS: ReadonlySet<string> = new Set([
  "gst",
  "nse",
  "bse",
  "mqtt",
  "ota",
  "ai",
  "mcp",
  "iot",
  "sql",
  "rest",
  "api",
  "sdk",
  "gdpr",
  "owasp",
  "ci",
  "cd",
  "llm",
  "rag",
  "ui",
  "ux",
]);

/**
 * Convert a kebab-case tag slug to a human-readable display label.
 *
 * Examples:
 *   "gst"               → "GST"
 *   "firmware"          → "Firmware"
 *   "prompt-engineering"→ "Prompt Engineering"
 *   "mqtt"              → "MQTT"
 *   "ci-cd"             → "CI CD"
 */
export function formatTagLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
