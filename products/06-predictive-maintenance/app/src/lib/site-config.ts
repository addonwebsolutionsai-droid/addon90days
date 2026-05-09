/**
 * MachineGuard — canonical site URL.
 *
 * Set NEXT_PUBLIC_APP_URL on Vercel (production target) to the real domain
 * once the founder assigns one (e.g. https://machineguard.addonweb.io).
 *
 * TODO: Replace the fallback URL below with the real Vercel project URL
 *       once the project is deployed and the URL is known.
 */

export const SITE_BASE_URL: string =
  process.env["NEXT_PUBLIC_APP_URL"] ?? "https://machineguard-addonweb.vercel.app";

export const SITE_DOMAIN: string = SITE_BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
