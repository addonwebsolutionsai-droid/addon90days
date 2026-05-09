/**
 * TaxPilot — canonical site URL.
 *
 * Set NEXT_PUBLIC_APP_URL on Vercel (production target) to the real domain
 * once the founder assigns one (e.g. https://taxpilot.addonweb.io).
 *
 * TODO: Replace the fallback URL below with the real Vercel project URL
 *       once the project is deployed and the URL is known. Current placeholder
 *       is `https://taxpilot-addonweb.vercel.app`.
 */

export const SITE_BASE_URL: string =
  process.env["NEXT_PUBLIC_APP_URL"] ?? "https://taxpilot-addonweb.vercel.app";

/**
 * Domain only — no protocol, no trailing slash. Used in OG image visible
 * text, share card subtitles, etc., where the protocol prefix is not shown.
 */
export const SITE_DOMAIN: string = SITE_BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
