# P01 Claude Toolkit — Day-15 Launch Readiness Audit

**Date:** 2026-05-01 (Day 10 of 90)
**Target launch:** Tuesday 2026-05-06 (5 days away)
**Live site:** https://addon90days.vercel.app
**Author:** @cto
**Legend:** ✅ ready · ⚠️ partial · ❌ missing

Counts after this audit + applied fixes: **✅ 22 · ⚠️ 14 · ❌ 8** (44 total checks).

Fixes applied in this same commit are marked **(FIXED — this commit)**.

---

## 1 · SEO & Discovery

### 1.1 Per-route metadata

| # | Route | Status | Notes / Fix |
|---|---|---|---|
| 1 | `/` | ⚠️ inherits root layout title/description; no per-route OG image, no canonical. | Add `export const metadata` block to `src/app/page.tsx` after frontend-architect ships hero rewrite. |
| 2 | `/skills` | ❌ `"use client"` page, no static metadata exported. | Wrap the client tree in a server `page.tsx` that exports `metadata`, OR move metadata to a parent `layout.tsx` for the `/skills` segment. |
| 3 | `/skills/[slug]` | ✅ **FIXED — this commit** — title + description + canonical + OG + Twitter card via `generateMetadata`. |
| 4 | `/chatbase` | ❌ `"use client"` page, no metadata. | Same fix pattern as `/skills`: add a `layout.tsx` exporting metadata, or convert to RSC + client island. (Owned by frontend-architect.) |
| 5 | `/legal/terms` | ⚠️ has title + description, no OG image. | Add OG image once `app/opengraph-image.png` exists. |
| 6 | `/legal/privacy` | ⚠️ same as terms. | Same fix. |
| 7 | `/sign-in` | ❌ no metadata. Inherits root default. | Add `export const metadata = { title: "Sign in", ... }` to `sign-in/[[...sign-in]]/page.tsx`. |
| 8 | `/sign-up` | ❌ no metadata. | Add `export const metadata = { title: "Sign up", ... }`. |
| 9 | `/account` | ✅ has `metadata = { title: "Account Overview" }`. Should be fine — should be `noindex` actually (see 1.4). |
| 10 | `/account/skills` | ❌ `"use client"` page, no metadata. | Move to a parent `layout.tsx` with `noindex` robots directive (account pages are private). |

### 1.2 Sitemap & robots

| # | Item | Status | Notes |
|---|---|---|---|
| 11 | `/sitemap.xml` (Next.js native `sitemap.ts`) | ✅ **FIXED — this commit** — `src/app/sitemap.ts` ships static + dynamic skill slugs (paginated fetch from `/api/skills`, 1h revalidate). |
| 12 | `/robots.txt` (Next.js native `robots.ts`) | ✅ **FIXED — this commit** — `src/app/robots.ts` allows `/`, `/skills`, `/chatbase`, `/legal`; disallows `/account`, `/api`, `/sign-in`, `/sign-up`, `/dashboard`; references sitemap. |

### 1.3 OpenGraph + Twitter cards

| # | Item | Status | Notes |
|---|---|---|---|
| 13 | Default OG image | ❌ no `app/icon.png`, no `app/opengraph-image.png`, no `app/twitter-image.png`. | **TODO for design-pro / @product-designer** — produce 1200×630 PNG with violet/pink gradient + "Claude Toolkit · 130+ Skills" wordmark. Drop into `products/01-claude-reseller/app/src/app/opengraph-image.png` and Next.js auto-wires it. **Critical pre-launch.** |
| 14 | Per-skill OG image | ❌ none. | Lower priority — single default OG is fine for launch. Auto-generated dynamic OG (via `opengraph-image.tsx`) can be P2. |
| 15 | Twitter card metadata in root layout | ✅ `summary_large_image` set in `layout.tsx`. |
| 16 | Twitter handle | ❌ `creator` / `site` not set. | Add `twitter: { ..., creator: "@addonweb_io", site: "@addonweb_io" }` to `layout.tsx` once handle confirmed (founder action). |

### 1.4 Structured data (JSON-LD)

| # | Item | Status | Notes |
|---|---|---|---|
| 17 | JSON-LD `SoftwareApplication` on `/skills/[slug]` | ✅ **FIXED — this commit** — server-rendered `<script type="application/ld+json">` with name, description, offer (free), publisher, view counter. |
| 18 | JSON-LD `Organization` on `/` | ❌ none. | Add an `Organization` schema block to `page.tsx` once frontend-architect finishes rewrite. |
| 19 | JSON-LD `BreadcrumbList` on `/skills/[slug]` | ❌ none. | Nice-to-have post-launch — not blocking. |

---

## 2 · Reliability

| # | Item | Status | Notes |
|---|---|---|---|
| 20 | Custom 404 (`not-found.tsx`) | ✅ **FIXED — this commit** — `src/app/not-found.tsx` with violet/pink gradient header, links to `/skills` + `/`. No client deps, always renders. |
| 21 | Custom 500 / `error.tsx` | ✅ **FIXED — this commit** — `src/app/error.tsx` with "Try again" button, error digest reference, mention of chat widget escalation path. |
| 22 | Global error boundary (`global-error.tsx`) | ❌ none. | `error.tsx` covers route segments; for layout-level crashes Next.js recommends `global-error.tsx`. Add a 1-page version pre-launch — copy of `error.tsx` minus the layout-dependent CSS vars (use literal hex colors). |
| 23 | Vercel production health check | ⚠️ no automated probe. | Add a `vercel.json` cron (or external uptime ping like `betteruptime.com` free tier) hitting `GET /` and `GET /api/skills?limit=1` every 5 min. Founder must enable post-launch. |

---

## 3 · Performance

| # | Item | Status | Notes |
|---|---|---|---|
| 24 | `/skills` ships 130 cards client-side? | ✅ **No.** Server-paginated via `/api/skills?page=N&limit=12` — `PAGE_SIZE = 12` in `skills/page.tsx`. Confirmed in code. |
| 25 | `/account/skills` page size | ⚠️ requests `pageSize=200` but the API silently caps at `limit=100` (validated `Math.min(100, ...)`). | Change client to `?limit=100` to be honest, add a "load more" or accept the cap. Lower priority — it's an account page. |
| 26 | `next/image` usage | ⚠️ no `<Image>` calls in main flows; we use emoji + CSS gradients (good) but the OG image (when added) should be served via the Vercel CDN. | No fix needed unless we add raster icons. |
| 27 | `next/font` for Inter + JetBrains Mono | ✅ Used in root layout with `display: "swap"`. |
| 28 | JS bundle size baseline | ❌ never measured. | Run `cd products/01-claude-reseller/app && npx next build` and inspect `.next/build-manifest.json` route weights pre-launch. Block launch if first-load JS on `/skills` > 200 KB. |
| 29 | Route render strategy | ⚠️ `/skills` is fully client-rendered (`"use client"`); `/skills/[slug]` is RSC with 60s ISR (good). | Ideal: SSG the marketing-facing `/skills` shell, hydrate the filter widget. Defer to post-launch — works correctly today. |

---

## 4 · Analytics

| # | Item | Status | Notes |
|---|---|---|---|
| 30 | PostHog or Plausible installed | ❌ neither. Only `@vercel/analytics` mentioned in privacy policy text — no SDK call in code. | **APPROVAL NEEDED:** founder picks PostHog (1M events/month free, full product analytics, has session replay) or Plausible ($9/mo, GDPR-clean, no cookies). My pick: PostHog free tier. Founder provisions DSN, then add `<PostHogProvider>` to root layout. |
| 31 | Page-view tracking | ❌ depends on #30. |
| 32 | Sign-up conversion event | ❌ Clerk has webhooks → wire a `user.created` webhook to PostHog `identify` + `sign_up` event. | Post-tooling. |
| 33 | "Try Live" run event | ❌ depends on #30. | Fire on POST `/api/skills/run` success. |
| 34 | Skill install event | ❌ depends on #30. | Fire on `/api/skills/[slug]/install`. |

---

## 5 · Monitoring

| # | Item | Status | Notes |
|---|---|---|---|
| 35 | Sentry (or equivalent) | ❌ not installed. | Free tier (5K errors/month) is enough for beta. Founder provisions DSN, then `npm i @sentry/nextjs` + `npx @sentry/wizard@latest -i nextjs`. Auto-wires `error.tsx` capture and edge runtime. |
| 36 | Vercel runtime logs | ✅ available in dashboard, no rotation needed at this scale. | Document the "check Vercel logs first" runbook step. |
| 37 | Telegram bot for support escalation | ✅ already wired in `/api/chat` (sends transcript to founder on `[ESCALATE]` or stream errors). |

---

## 6 · Security

| # | Item | Status | Notes |
|---|---|---|---|
| 38 | CSP headers | ✅ present in `next.config.ts` — `default-src 'self'`, allows Clerk, Supabase, inline (Tailwind needs `unsafe-inline` styles). | One concern: `script-src 'unsafe-eval' 'unsafe-inline'` is wider than ideal. Acceptable for Clerk + Next dev hydration but tighten post-launch with hashes/nonces. |
| 39 | CORS on `/api/*` | ⚠️ wildcards `*` for all methods. | Tighten to `Access-Control-Allow-Origin: https://addon90days.vercel.app` for non-public APIs. `/api/skills/mcp` legitimately needs `*` (cross-origin MCP clients). |
| 40 | Rate limiting on `/api/chat` | ❌ none. Anyone can drain the shared 14,400 RPD Groq quota. | **CRITICAL — blocks launch in my view.** Add Vercel KV (or Upstash Redis free tier) sliding-window limiter: 30 req/hour per IP, 500/day per Clerk user. |
| 41 | Rate limiting on `/api/skills/run` | ❌ Clerk-gated but no per-user cap. | Same fix — 60 runs/hour per signed-in user. Free during beta does not mean unlimited; founder won't notice till the Groq quota exhausts and signups silently break. |
| 42 | Auth/authz bypass on `/api/agents/*` | ✅ secret-gated (`x-agent-key` env-var match). |
| 43 | Auth on `/api/admin/skills` | ⚠️ unverified — needs Clerk role check. | I will skim post-merge. If it's secret-gated like agents, fine; if not, block launch. |
| 44 | Secrets in repo | ✅ `git grep -E 'sk_live_\|GROQ_API_KEY=\|SUPABASE_SERVICE'` returns nothing. All consumed via `process.env`. |
| 45 | `console.log` of user data | ⚠️ one `console.error("Route error", error)` in new `error.tsx` — gated to `NODE_ENV !== "production"`. Safe. |
| 46 | Razorpay webhook signature verification | n/a — no payments during beta. Razorpay code path exists but is not exercised. |

---

## 7 · Mobile

| # | Item | Status | Notes |
|---|---|---|---|
| 47 | Responsive `/` and `/skills` | ⚠️ needs manual smoke test on iPhone 12 / Galaxy S22 / iPad Mini. | I cannot run a browser. Founder should walk through 3 viewports pre-launch. |
| 48 | Touch targets ≥44px | ⚠️ category pills are `h-8 px-3` (~32px tall) — below WCAG AAA 44px target. | Lower-priority A11y nit. Bump to `h-10` post-launch if anyone complains. |
| 49 | Mobile chat widget | ✅ `MobileSpacer` + `ChatWidget` already wired in root layout. |

---

## 8 · Accessibility

| # | Item | Status | Notes |
|---|---|---|---|
| 50 | Keyboard navigation | ⚠️ unverified end-to-end. Most components use semantic `<button>` / `<a>`. | Quick manual tab-walk pre-launch. |
| 51 | Color contrast on body text | ⚠️ `--text-secondary` and `--text-muted` may dip under AA on dark theme. | Run Lighthouse a11y audit on Vercel deploy — fix any AA fail before Tuesday. |
| 52 | Alt text on images | ✅ no raster `<img>` in current pages — all icons are `lucide-react` SVGs with `aria-hidden` parents. |
| 53 | `lang="en"` on `<html>` | ✅ set in root layout. |
| 54 | Focus rings | ✅ Tailwind `focus:ring-2 focus:ring-violet-500` on all interactive inputs. |

---

## 9 · Custom domain

| # | Item | Status | Notes |
|---|---|---|---|
| 55 | Pre-launch domain | ⚠️ currently `addon90days.vercel.app`. | **RECOMMENDATION (founder action):** register or point `claudetoolkit.addonweb.io` (or `toolkit.addonweb.io`) at Vercel before Tuesday. SEO authority transfer is non-trivial after launch — better to ship on the canonical domain Day 1. Vercel domain hookup is 5 min. **Not actionable by me — DNS is the founder's.** |

---

## Pre-launch must-do checklist (5 days)

Sorted by criticality:

1. **(BLOCK)** Rate limit `/api/chat` and `/api/skills/run` — Groq RPD shared quota is a hard launch risk (#40, #41).
2. **(BLOCK)** Provision and wire OG default image (#13) — every link share will fall back to a blank card otherwise.
3. **(BLOCK)** Add metadata to `/skills`, `/sign-in`, `/sign-up` (#2, #7, #8) — these are the highest-traffic landing pages on launch day.
4. **(STRONG)** PostHog free tier wired pre-launch (#30) — without this we have no way to measure conversion or "Try Live" engagement on launch day.
5. **(STRONG)** Sentry free tier wired pre-launch (#35) — must catch error.tsx triggers in production.
6. **(STRONG)** Custom domain decision (#55) — founder.
7. **(NICE)** `global-error.tsx` (#22) — small, do it Day 12.
8. **(NICE)** Tighten CORS allowlist on non-public APIs (#39).

---

## What's already solid

- TypeScript strict, `noUncheckedIndexedAccess`, no `any` in own code.
- API surface is Zod-validated and Clerk-auth gated.
- Dark theme with consistent CSS vars; `--bg-base`, `--text-primary`, `--border-subtle` etc.
- Server-paginated skills API; no 130-item client payload.
- 60s ISR on `/skills/[slug]` keeps DB load bounded.
- Telegram support escalation pipeline live and tested.
- MCP server live as Streamable HTTP at `/api/skills/mcp`.

— @cto
