import type { MetadataRoute } from "next";

/**
 * Next.js native robots.txt.
 *
 * Allow indexing of marketing + skills surface.
 * Disallow account, API, and auth flows (no SEO value, can leak shape).
 */

function getBaseUrl(): string {
  const explicit = process.env["NEXT_PUBLIC_APP_URL"];
  if (explicit !== undefined && explicit.length > 0) return explicit.replace(/\/$/, "");
  const vercel = process.env["VERCEL_URL"];
  if (vercel !== undefined && vercel.length > 0) return `https://${vercel}`;
  return "https://addon90days.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/skills", "/skills/", "/chatbase", "/legal/"],
        disallow: ["/account", "/account/", "/api/", "/sign-in", "/sign-up", "/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
