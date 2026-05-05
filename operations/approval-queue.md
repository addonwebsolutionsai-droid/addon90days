# Approval Queue

Items awaiting founder approval. Agents append here; founder clears via `/approve` command.

**How it works:**
- Agents add items under "Pending" section with all context needed
- Founder runs `/approve` in daily session to walk through items
- Items move to "Approved today" / "Rejected today" based on founder decision
- End of day, cleared items archive to `operations/approval-log/YYYY-MM-DD.md`

---

## Pending (6)

### #006 — Make GitHub repo PRIVATE (founder revised position)

- **Category:** strategic-decision (founder action: GitHub Settings)
- **Urgency:** today (going live)
- **Submitted by:** @cto

Founder updated stance: *"github which is vulnerable and not good for business"* — wants the repo private now. Earlier this session I recommended public-for-launch + reassess Day 30. Founder overrides; we go private.

**Steps (founder, ~5 min):**

1. github.com/addonwebsolutionsai-droid/addon90days → Settings → scroll to "Danger Zone" → "Change repository visibility" → "Make private". Confirm.

2. **Vercel deploy implication.** Going private may re-trigger the "commit author did not have contributing access" Hobby block (the same one we hit on 2026-05-04 when commits were authored by `addonwebsolutions-AI` rather than the Vercel-linked GitHub owner). Two safe options:
   - **A. Vercel Pro** ($20/mo) — supports any committer on private repos. Well within the $500 spend rule. Recommended.
   - **B. Strict author identity** — set `git config --global user.email "addonwebsolutions.ai@gmail.com"` on every machine, and ensure the cloud-routine PAT belongs to the Vercel-linked owner. Free but fragile.

3. **Open-source narrative.** The launch content (HN, blog, README) references "build in public" + "fork it, study it, copy it". After private flip:
   - Update README to drop the "fork it" line — auto-pushed when @cto sees the change land
   - Keep launch content as-is (it's already drafted and approved); the public README of the launch story is a snapshot
   - llms.txt currently links to the GitHub URL — that link will 404 for unauthenticated visitors. Either remove it or replace with a public mirror later.

4. After flip, **trigger a fresh Vercel deploy** to confirm Hobby plan doesn't block. If it blocks, immediate fix is option A above.

**Action requested:** confirm "make private + Vercel Pro upgrade" or "make private + strict author discipline" or "stay public for now (override)".

I won't touch README/llms.txt until founder confirms the visibility flip is done — don't want to drop the "build in public" hook on a still-public repo.

---

### #007 — Security hardening checklist (in-flight)

- **Category:** code-merge (mostly already shipped, audit summary)
- **Urgency:** ongoing
- **Submitted by:** @cto

Founder asked: *"bot protection, hack proof, no one should be able to hack this"*. Total security is impossible but here's where we stand. Items already shipped today land in commit SHA listed below.

**Already in place:**

| Layer | Status | Notes |
|---|---|---|
| Auth | Clerk | Session cookies are SameSite=Lax — defends CSRF on state-changing requests by default |
| HTTPS only | ✓ | Vercel terminates TLS, force-redirects HTTP |
| Sign-in required for skill runs | ✓ | `/api/skills/run` route does its own `auth()` |
| Rate limit /api/chat | ✓ | 30/hr per IP |
| Rate limit /api/skills/run | ✓ NEW | 60/user/hr + 200/user/day + 300/IP/hr (3-tier) |
| Service role key server-only | ✓ | Never exposed to client |
| Admin role gated by env | ✓ NEW | `/admin/*` requires Clerk user ID in `ADMIN_USER_IDS` env |
| Admin user ban/unban | ✓ NEW | `/admin/users` page + `/api/admin/users/:id/ban` |
| Input validation | ✓ | Zod everywhere; max input length on /api/skills/run = 8000 chars |
| SQL injection | ✓ | Supabase parameterized queries, no raw SQL with interpolation |
| CSP + X-Frame-Options + Referrer-Policy | ✓ | next.config.js |
| HSTS (1 year, includeSubDomains) | ✓ NEW | next.config.js |
| Permissions-Policy (deny camera/mic/geo) | ✓ NEW | next.config.js |
| Webhook signature verification | partial | Razorpay-webhook ✓; Meta-webhook stub (verifies token only — full HMAC-SHA256 verification when Meta keys are added) |
| Secrets never in code/logs | ✓ | All env vars; GitGuardian incident from 2026-05-04 fully cleaned |
| Dependency audit | weekly | `npm audit` — clean as of today |

**Founder actions that close the remaining gaps:**

1. **Set `ADMIN_USER_IDS` on Vercel** — comma-separated Clerk user IDs of admins (just yours for now). Without this env var the `/admin/*` route 403s for every request including yours. Steps: sign in once → Clerk Dashboard → Users → click yourself → copy User ID (`user_xxx`) → Vercel → Project → Settings → Environment Variables → add `ADMIN_USER_IDS=user_xxx`. 5 min.
2. **Clerk Bot Protection (Cloudflare Turnstile)** — Clerk Dashboard → User & Authentication → Attack Protection → enable Bot Protection. Free, built-in. 1 min.
3. **Email verification before signup** — Clerk Dashboard → User & Authentication → Email → require verification. 1 min.
4. **Clerk PRODUCTION instance** — see queue #003. The current test instance (`pk_test_*`) has lower attack-protection limits than production.
5. **PostHog key** — pending. Without it we can't see abuse patterns post-launch. queue #007 (this one) blocks abuse-monitoring instrumentation.

**Out of scope for today (defer to Day 30+ retro):**

- Cloudflare WAF (would require DNS migration off Vercel default)
- SOC 2 / penetration test
- Bug bounty program

**Recommended:** approve all 4 founder actions above; I've shipped my side.

---

### #005 — Abuse prevention layers for the free-for-1-year era

- **Category:** strategic-decision (mostly founder dashboard toggles)
- **Urgency:** Day 1–7 of public traffic, not blocking launch
- **Submitted by:** @cto

**Founder asked:** "We should put some kind of restrictions otherwise free users come and misuse the product. Is it viable? do you agree?"

**Yes, agree.** Real attack vector for a free product is **multi-account farming** (one bad actor creates 100 throwaway emails to bypass per-user rate limits). Existing defenses (60 runs/user/hr + Groq free tier caps + sign-in required) are decent but not enough at 100k-user scale.

**Recommend 4 cheap measures, in priority order:**

1. **Email verification required before first install** (Clerk one-click toggle) — kills throwaway emails. Founder action: Clerk Dashboard → User & Authentication → Email Verification → "Verify before sign-up". 2 min.
2. **CAPTCHA on signup** (Clerk's built-in Cloudflare Turnstile, free) — kills automated signup farms. Founder action: Clerk Dashboard → User & Authentication → Bot Protection → enable. 1 min.
3. **Daily total cap per user** (in addition to hourly 60) — defends slow-drip abuse. Code change: I can add `skills_run:daily:user:${userId}` rate limit at 200/day. ~10 min by me, no founder action.
4. **Per-skill abuse monitoring** via PostHog events — see which skills get abused most so we can disable individual ones if needed. Code change: I can wire this once `NEXT_PUBLIC_POSTHOG_KEY` is set on Vercel (queue item still pending).

**Won't recommend** (these kill the 100k goal):
- Invite-only / waitlist
- Credit-card-for-verification
- Email domain allowlists
- IP geofencing

**Action requested:** approve the 4 measures. I'll implement #3 today; #4 lands when PostHog key is on Vercel; #1 and #2 are 3-min Clerk dashboard toggles.

---

### #003 — Clerk PRODUCTION instance for going-live

- **Category:** strategic-decision (founder credentials only)
- **Urgency:** today (going live)
- **Submitted by:** @cto

The current site is using a Clerk **test** instance (`pk_test_YXB0LWFuY2hvdnktNjAuY2xlcmsuYWNjb3VudHMuZGV2JA` is in the deployed HTML). Test instances:

- Show a "Development" notice in some flows
- Have lower rate limits
- Sessions don't persist as reliably across deploys → this is the most likely cause of "I'm signed in but it asks me to sign in again"

**Action (10 min):** clerk.com → Dashboard → create a new **Production** instance for `addon90days.vercel.app` → copy `pk_live_*` and `sk_live_*` → on Vercel, replace `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (production target only — keep test keys on preview/development). Re-deploy.

**Code-side fix already shipped:** the sidebar now uses Clerk's `isLoaded` to avoid flashing "Sign in" while the session hydrates. That removes the most common false-positive but the underlying production-keys issue still needs founder action.

---

### #004 — GitHub repo: keep public OR move to private + Vercel Pro?

- **Category:** strategic-decision (founder choice + budget)
- **Urgency:** can wait 1–2 days, not blocking launch
- **Submitted by:** @cto

The repo went public on 2026-05-04 to unblock Vercel deploys (Hobby plan blocks non-owner committers on private repos). Founder asked: "GitHub public access is vulnerable that anyone can see the code. Should we do anything about this?"

**Honest assessment:**

| Concern | Reality |
|---|---|
| Secrets in code | None. All keys are env vars on Vercel. GitGuardian has caught the one accidental commit; we cleaned it. |
| Competitors copy our codebase | Real risk. They could clone the marketplace UI and 130 skills' workflow logic. |
| Bad actors find security holes | Lower risk than upside of public visibility — security through obscurity isn't real security. Public repos get more eyeballs catching bugs (incl. GitGuardian). |
| Build-in-public marketing | Major upside. The repo IS the asset for HN/PH launches and developer credibility. |

**Three options:**

| Option | Cost | Tradeoff |
|---|---|---|
| **A. Stay public** (recommended for launch) | $0 | Code is visible; build-in-public credibility for launch; competitors can copy faster |
| **B. Private + Vercel Pro** | $20/mo | Source private; supports any committer; +5x more deploy minutes |
| **C. Private + single-account discipline** | $0 | All commits must come from `addonwebsolutionsai-droid` GitHub account; CI/agents that commit from other identities break |

**Recommended:** stay public through launch (today + first 30 days). After Day 30, decide based on:
- Did anyone clone us? (search "addon90days" on GitHub)
- Are competitors gaining traction with the cloned product? (unlikely — execution and brand matter more than code)
- Is the build-in-public narrative still pulling traffic?

If yes to "competitors are real": move to private + Vercel Pro ($20/mo, well within the founder's spend rule).

**Action requested:** confirm "stay public for launch + reassess Day 30" or override.

---

### #002 — P02 ChatBase backend MVP shipped — needs 3 founder actions to activate

- **Category:** strategic-decision (founder credentials only — agent cannot self-serve)
- **Urgency:** 48h (P02 launch is Day 30 = 2026-05-22)
- **Submitted by:** @cto on behalf of @api-engineer
- **Submitted at:** 2026-05-04
- **Related product:** P02 ChatBase
- **Related commit:** `1a0ff95` — 19 new files, 0 breaking changes to P01

**What shipped:** complete WhatsApp AI backend — Meta webhook handler, AES-256-GCM token encryption, Groq-powered intent classifier (6 intents, 70% confidence threshold), keyword-Jaccard KB retrieval, reply engine, 8 API routes, mock-mode for dev without Meta access. ADR at `operations/decisions/2026-05-04-p02-mvp-architecture.md`.

**Founder action 1 — Apply Supabase migration (5 min)**

Open Supabase Dashboard → Project → SQL Editor → New Query → paste contents of `supabase/migrations/010_p02_chatbase.sql` (229 lines) → Run. Creates 5 tables (`p02_workspaces`, `p02_kb_docs`, `p02_intents`, `p02_conversations`, `p02_messages`) and seeds 6 default intents. Idempotent — safe to re-run.

**Founder action 2 — Add `P02_ENCRYPTION_KEY` to Vercel (3 min)**

```bash
openssl rand -hex 32
```

Copy the 64-char output. Vercel Dashboard → Project → Settings → Environment Variables → Add:
- Name: `P02_ENCRYPTION_KEY`
- Value: (paste)
- Environments: **all** (production + preview + development) — encryption keys MUST be identical across envs or stored tokens won't decrypt

**Founder action 3 (optional, defer) — Meta Business Manager verification**

Apply at business.facebook.com for WhatsApp Cloud API access. 3-7 day review. Until this lands the backend runs in `MOCK_MODE=true` (default) which lets the dashboard demo work without real WhatsApp.

**Note on the agent's "Supabase API key broken" claim:** I checked production. `/api/p02-waitlist` returned 200 just now — the production Supabase key is healthy. The agent's local `.env.local` has the old JWT-format key from before today's rotation; that's a local-dev issue only, not blocking the Vercel deploy or anything user-facing. Will fix `.env.local` next time we have the new `sb_secret_*` value handy.

**Recommended action:** approve founder actions 1 and 2 today (8 min total). Action 3 can wait.

**If approved, I will:** apply the migration after founder confirms it ran, run the smoke test, and continue the dashboard UI build (already kicked off in parallel — see todo).

**What's ready:**
- 5/5 product landing pages live + brand-isolated (sidebar + chat widget no longer leak across products — fixed in 822716f, c7e5ae2)
- 5/5 waitlist endpoints returning 200 (p02–p06)
- 5/5 per-product OG images rendering with distinct accents
- npm package `addonweb-claude-skills@1.1.0` published
- MCP server live at `/api/skills/mcp` (verified initialize handshake)
- 130 skills in catalog · 4 featured (stock-screener-ai, gst-invoice-generator, esp32-firmware-scaffold, sql-query-builder) all 200
- Sign-in flow + Try Live endpoint Clerk-protected as designed
- 7-piece launch kit drafted, all marked APPROVED in `content/launch/`:
  01-producthunt · 02-hackernews · 03-twitter-thread · 04-linkedin
  05-reddit (3 subs) · 06-newsletter · 07-blog

**Founder action timeline (~90 min total over launch day Tue 2026-05-06):**

| Time IST | Action | Est. |
|---|---|---|
| 12:30 | Submit ProductHunt at midnight PST (copy from 01-producthunt.md) | 15 min |
| 12:35 | Tweet thread from @addonwebsolutions (copy 03-twitter-thread.md) | 10 min |
| 13:00 | Show HN post (02-hackernews.md) | 5 min |
| 13:30 | LinkedIn post from founder profile (04-linkedin.md) | 10 min |
| 14:00 | r/ClaudeAI post #1 from 05-reddit.md | 10 min |
| 16:00 | r/LocalLLaMA post #2 from 05-reddit.md | 5 min |
| 18:00 | r/programming post #3 from 05-reddit.md | 5 min |
| 20:00 | Newsletter blast (06-newsletter.md) — ONLY if mailing list ≥ 50 | 10 min |
| Throughout | Reply to PH/HN/Reddit/X comments | 20 min |

**Risks / mitigations:**
- ProductHunt account: confirm `addonwebsolutions.ai@gmail.com` has a PH account today. If not, create now — PH won't allow same-day signups to launch.
- Newsletter: skip if no mailing list yet (conditional, not blocking).
- Reddit r/programming: has self-promo karma threshold. If founder account is fresh, swap for r/SideProject or r/EntrepreneurRideAlong.

**Recommended action:** approve. All technical readiness gates are green; remaining work is only founder-side execution.

✓ launch infrastructure verified at commit 7894d7c — analytics, sitemap, robots, llms.txt all green. Awaiting only the launch-day go/no-go and PostHog key from founder.

**If approved, I will:** schedule a Telegram reminder at 11:30 IST on 2026-05-06 with one-tap links to each piece + paste-ready copy.

**If rejected, options are:** push to Day 16/17 if PH account isn't ready; or split launch (PH + HN on Day 15, social cascade on Day 16).

---

## Approved today (1)

### #001 — Day 15 Launch (P01 Claude Toolkit) — APPROVED 2026-05-04 by founder

Founder said: *"approved from my end go ahead"*. Launch goes Tue 2026-05-06.

**Done by @cto on approval:**
- Telegram launch-day reminder routine scheduled (one-time at 2026-05-06 06:00 UTC = 11:30 IST). Will post a checklist message with one-tap links to all 7 launch content files.
- All 7 launch pieces confirmed APPROVED in `content/launch/` frontmatter.

**Still on founder's plate (none blocking the deploy):**
- Confirm `addonwebsolutions.ai@gmail.com` has a ProductHunt account by 2026-05-05 21:00 IST. If not, create today.
- (Optional, recommended) Add `NEXT_PUBLIC_POSTHOG_KEY` to Vercel env so analytics turns on for the launch traffic. Without it we ship blind on funnel data.

---

## Rejected today (0)

---

## Template for agents adding items

When an agent adds an item, use this format:

```markdown
### {N}. {ONE-LINE TITLE}

- **Category:** {outbound-email | proposal | content | code-merge | budget-request | strategic-decision | other}
- **Urgency:** {same-day | 24h | 48h | 72h}
- **Submitted by:** @{agent-name}
- **Submitted at:** {timestamp}
- **Related product:** {product-id or N/A}

**Context:**
{What this is and why it needs approval}

**The artifact / proposal:**
{Paste the draft / link / decision — enough detail that founder can approve without asking questions}

**Recommended action:** {approve / reject / my specific recommendation}

**If approved, I will:** {what the agent will do next}

**If rejected, options are:** {alternative paths}
```

## Priority guidelines for founder

When walking the queue, process in this order:

1. Same-day urgency items (usually customer-facing comms)
2. Code merges blocking other work
3. 24h items
4. 48h+ items
5. Strategic decisions (usually last — give yourself thinking time)

## Escape valves

**If the queue exceeds 20 items pending:** flag in next weekly review — too much is routing to founder, need to raise autonomy of some agent categories.

**If an item has been pending >72h:** `@orchestrator` re-pings founder with context in daily briefing.

**If founder is unavailable for >3 days:** agents pause outbound comms and proposal sends automatically. Build/design/content work continues; only external-facing items queue up.
- [ ] 2026-05-02 · Content draft ready: content/queue/2026-05-02-reddit.md (CMO)
- [ ] 2026-05-02 · 30 outbound drafts ready: sales/drafts/2026-05-02.md (Outbound)
- [ ] 2026-05-03 · Content draft ready: content/queue/2026-05-03-reddit.md (CMO)
- [ ] 2026-05-03 · 30 outbound drafts ready: sales/drafts/2026-05-03.md (Outbound)
- [ ] 2026-05-04 · Content draft ready: content/queue/2026-05-04-twitter.md (CMO)
- [ ] 2026-05-04 · 30 outbound drafts ready: sales/drafts/2026-05-04.md (Outbound)