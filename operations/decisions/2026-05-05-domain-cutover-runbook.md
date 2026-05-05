# Domain Cutover Runbook — addon90days.vercel.app → custom domain

**Status:** ready · executed by founder
**Author:** @cto
**Date:** 2026-05-05

## Context

Founder is moving SKILON off the Vercel preview hostname onto a custom domain tomorrow (2026-05-06). This runbook ensures the cutover is a single-env-var change, not a 50-file edit.

## Pre-cutover state (commit `<tbd>`)

Every place in the codebase that produces a public URL now reads from `src/lib/site-config.ts`:

```ts
export const SITE_BASE_URL: string =
  process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
export const SITE_DOMAIN: string =
  SITE_BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
```

The fallback `addon90days.vercel.app` only kicks in if `NEXT_PUBLIC_APP_URL` is unset (local dev with stale `.env.local`).

## Files importing SITE_BASE_URL / SITE_DOMAIN (post-refactor)

- `src/app/layout.tsx` — `metadataBase` + `alternates.canonical`
- `src/app/page.tsx` — Organization + WebSite JSON-LD
- `src/app/llms.txt/route.ts` — every URL in the content map
- `src/app/api/skills/mcp/route.ts` — emitted Source URL + docs URL + baseUrl
- `src/app/api/skills/[slug]/install/route.ts` — appUrl in skill markdown
- `src/app/api/admin/skills/generate-from-trend/route.ts` — returned skill URL
- `src/components/install-methods.tsx` — `mcpUrl` const for the copy block
- `src/components/mcp-connect.tsx` — `MCP_CONFIG` JSON template
- `src/components/share-skill.tsx` — `APP_ORIGIN` for share URLs
- `src/components/invite-friends.tsx` — `APP_ORIGIN` for referral URLs
- `src/lib/chat-knowledge-base.ts` — chat bot system prompt
- All 7 OG image components (`opengraph-image.tsx` × 7) — visible URL text in share cards

Already env-driven via different (but equivalent) `process.env["NEXT_PUBLIC_APP_URL"] ?? "..."` patterns:
- `src/app/skills/[slug]/page.tsx` (generateMetadata + JSON-LD)
- `src/app/skills/category/[slug]/page.tsx`
- `src/app/skills/[slug]/opengraph-image.tsx`
- `src/app/sitemap.ts` (`getBaseUrl()`)
- `src/app/robots.ts` (`getBaseUrl()`)

**Net result:** zero hardcoded `addon90days.vercel.app` strings remain in any user-facing surface. Only places that still mention it: source-code comments, JSDoc examples, and the legal/privacy body copy (line 35 — separate edit when domain is decided).

## Cutover procedure (founder, 5 minutes)

1. **Buy / confirm domain** (e.g., `skilon.com`, `skilon.io`, `skilon.ai`).

2. **Add the domain in Vercel**
   - Vercel Dashboard → SKILON project → Settings → Domains → Add Domain
   - Add both `skilon.io` and `www.skilon.io` (redirect www → apex or vice versa as preferred)
   - Vercel will give you DNS records (A + CNAME OR a single ALIAS). Add at registrar.
   - Wait for SSL provisioning (1-15 minutes typically).

3. **Update `NEXT_PUBLIC_APP_URL` env var on Vercel**
   - Settings → Environment Variables → find `NEXT_PUBLIC_APP_URL`
   - Patch ALL THREE rows: production, preview, development
   - New value: `https://skilon.io` (no trailing slash)
   - **Important:** there are typically 1-3 separate rows per env key (memory: `feedback_vercel_env_two_rows.md`). Patch each one.

4. **Trigger a fresh deploy** (Vercel does this automatically on env change, but force-trigger if needed):
   - `git commit --allow-empty -m "chore: pick up new NEXT_PUBLIC_APP_URL"` and push.

5. **Verify on the new domain:**

```bash
# Replace skilon.io with the actual new domain
curl -s "https://skilon.io/llms.txt" | head -5
#  Should mention skilon.io (NOT addon90days.vercel.app)

curl -s "https://skilon.io/sitemap.xml" | head -5
#  Should have https://skilon.io URLs

curl -s "https://skilon.io/" | grep -oE "<title>[^<]*</title>"
#  Should be "SKILON — AI Skills. Limitless Future." (single brand suffix)

curl -s "https://skilon.io/" | grep -ciE "addon90days.vercel.app"
#  Should be 0
```

6. **Set up the redirect from `addon90days.vercel.app` to `skilon.io`** so any existing share links + npm package + MCP configs already in the wild keep working:
   - Vercel Dashboard → Project → Settings → Redirects (or in `next.config.ts` if you prefer code-controlled)
   - 301 redirect: `addon90days.vercel.app/(.*)` → `skilon.io/$1`

7. **Tell external integrations** about the new domain:
   - Update `https://www.npmjs.com/package/addonweb-claude-skills` README to point at the new domain (publish v1.1.1 patch)
   - Update Clerk allowed domains (Clerk Dashboard → Customization → Domains)
   - Update Supabase URL configuration if any references (probably none — Supabase URL is the supabase project URL, not our app URL)

## Post-cutover items (lower urgency)

- **Search Console**: re-submit the sitemap at the new domain. Add the new property in Google Search Console + Bing Webmaster Tools.
- **`legal/privacy/page.tsx:35`** body copy "marketplace at addon90days.vercel.app" — change to the new domain. One-line edit.
- **JSDoc / route comments** mentioning `addon90days.vercel.app` — cosmetic, no impact, update opportunistically.
- **Update `chat-knowledge-base.ts` MCP example URLs** — already env-driven (just verify after cutover that the chat bot quotes the right URL).

## Risks / gotchas

- **Stale `.env.local` on the founder's laptop** — local dev will keep using the old fallback. Update local file too.
- **Cloud routine prompts** (Skill Smith, content marketer, etc.) embed `addon90days.vercel.app` in their hardcoded ENV section. After cutover, update each routine prompt's `BASE=` line via `RemoteTrigger.update`. Estimated 5 min for all 8 routines.
- **Old OG image cards in the wild** — Twitter/LinkedIn cache OG images for ~7 days. Old shares will show the old domain in the card footer until the cache expires. Acceptable.
- **npm package** — `addonweb-claude-skills@1.1.0` README references `addon90days.vercel.app`. Users who installed before today get the old README. Publish a 1.1.1 patch with the new URL after cutover.
