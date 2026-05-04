# Approval Queue

Items awaiting founder approval. Agents append here; founder clears via `/approve` command.

**How it works:**
- Agents add items under "Pending" section with all context needed
- Founder runs `/approve` in daily session to walk through items
- Items move to "Approved today" / "Rejected today" based on founder decision
- End of day, cleared items archive to `operations/approval-log/YYYY-MM-DD.md`

---

## Pending (1)

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