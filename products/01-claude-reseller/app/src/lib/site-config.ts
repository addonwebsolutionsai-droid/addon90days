/**
 * Single source of truth for the site's canonical URL.
 *
 * Every place in the codebase that references the public hostname should
 * import from here instead of hardcoding "addon90days.vercel.app". When
 * the founder switches to a custom domain, updating
 * NEXT_PUBLIC_APP_URL on Vercel (production target) flips the entire
 * site over — no code change, no missed reference, no broken share link
 * or MCP config.
 *
 * The fallback `https://addon90days.vercel.app` is the current Vercel
 * preview URL; it's only used when the env var is unset (local dev with
 * a stale .env.local, or a misconfigured preview deploy).
 */

export const SITE_BASE_URL: string =
  process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";

/**
 * Domain only — no protocol, no trailing slash. Used in OG image visible
 * text, share card subtitles, etc., where the protocol prefix isn't shown.
 */
export const SITE_DOMAIN: string = SITE_BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
