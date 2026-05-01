import type { MetadataRoute } from "next";

/**
 * Next.js native sitemap.
 *
 * - Statically lists the marketing + auth + legal pages.
 * - Dynamically pulls every published skill slug from Supabase via the
 *   public /api/skills endpoint (paginated server-side).
 *
 * If Supabase is unreachable at build time, we degrade gracefully and emit
 * just the static routes — the build must not fail on a transient DB hiccup
 * 5 days before launch.
 *
 * The base URL comes from NEXT_PUBLIC_APP_URL. On Vercel preview deployments
 * we fall back to VERCEL_URL so previews still produce a valid sitemap.
 */

import type { Skill } from "@/lib/database.types";

export const revalidate = 3600; // re-build sitemap at most once an hour

interface SkillSlug {
  slug: string;
  updated_at?: string | null;
  created_at?: string | null;
}

function getBaseUrl(): string {
  const explicit = process.env["NEXT_PUBLIC_APP_URL"];
  if (explicit !== undefined && explicit.length > 0) return explicit.replace(/\/$/, "");
  const vercel = process.env["VERCEL_URL"];
  if (vercel !== undefined && vercel.length > 0) return `https://${vercel}`;
  return "https://addon90days.vercel.app";
}

async function fetchAllSkillSlugs(baseUrl: string): Promise<SkillSlug[]> {
  const slugs: SkillSlug[] = [];
  const PAGE_SIZE = 100;
  let page = 1;
  // Hard cap: 10 pages = 1000 skills. We only have 130, so this is generous.
  while (page <= 10) {
    try {
      const res = await fetch(
        `${baseUrl}/api/skills?page=${page}&limit=${PAGE_SIZE}&sort=new`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const data = (await res.json()) as { skills: Skill[]; hasMore?: boolean };
      const batch = data.skills ?? [];
      for (const s of batch) {
        slugs.push({
          slug: s.slug,
          updated_at: s.updated_at ?? null,
          created_at: s.created_at ?? null,
        });
      }
      if (batch.length < PAGE_SIZE || data.hasMore === false) break;
      page += 1;
    } catch {
      break;
    }
  }
  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,              lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/skills`,         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/chatbase`,       lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${baseUrl}/legal/terms`,    lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`,  lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/sign-in`,        lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${baseUrl}/sign-up`,        lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
  ];

  const skillSlugs = await fetchAllSkillSlugs(baseUrl);
  const skillEntries: MetadataRoute.Sitemap = skillSlugs.map((s) => {
    const updated = s.updated_at ?? s.created_at ?? null;
    return {
      url:            `${baseUrl}/skills/${s.slug}`,
      lastModified:   updated !== null ? new Date(updated) : now,
      changeFrequency: "weekly",
      priority:       0.8,
    };
  });

  return [...staticEntries, ...skillEntries];
}
