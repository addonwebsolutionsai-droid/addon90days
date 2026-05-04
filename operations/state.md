# Operations state

**Claude's single source of truth between sessions.** Read this at the start of every session. Update it at the end.

---

## Project status

**Start date:** 2026-04-22
**Current day:** ~12 (2026-05-04)
**Current phase:** Sprint 1 — Day 15 launch armed, P02 build started
**Last session:** 2026-05-04

---

## Strategic direction (founder-confirmed 2026-05-04)

- **Free for first 1 year** — every product, no paywall, no Razorpay UI, no card required.
- **Goal:** 100k users on EACH platform by Day 365 (= 600k total across 6 products).
- **Stay on `*.vercel.app` domains** for now. Custom domains deferred.
- **Per-product brand isolation** for exit-strategy goal (each product becomes a transferable asset). Sidebar + chat widget already conditional on path.

## Next action

P02 ChatBase backend MVP is being built right now by @api-engineer (background agent, started 2026-05-04 ~14:35 IST). When it lands, spawn @frontend-architect for the owner dashboard UI. Target P02 launch: Day 30 (~2026-05-22).

P01 Day 15 launch (2026-05-06) is armed — Telegram launch-day reminder routine `trig_01Vr97KYBaoG2CjfDsHmyHpF` fires at 2026-05-06T06:00:00Z (11:30 IST).

---

## In-flight

| Task | Status | Pointer |
|---|---|---|
| P02 ChatBase backend MVP | **building (api-engineer in background)** | `products/02-whatsapp-ai-suite/` |
| P02 dashboard UI | queued — start after backend ADR + first commit lands | — |
| Cloud-routine commit_repo_file backport | queued — tomorrow morning batch | `operations/diagnostic-routines-2026-05-01.md` |
| P01 Day 15 launch | **armed** — Telegram reminder set | `content/launch/` |

---

## Products — build status

| Product | Status | Live URL |
|---|---|---|
| 01-claude-reseller (Claude Toolkit) | **launching Day 15 = 2026-05-06** — all infra green | https://addon90days.vercel.app/ |
| 02-whatsapp-ai-suite (ChatBase) | backend build started 2026-05-04 — target launch Day 30 ~2026-05-22 | https://addon90days.vercel.app/chatbase (waitlist) |
| 03-gst-invoicing (TaxPilot) | landing + waitlist live; build queued post-P02 | https://addon90days.vercel.app/taxpilot |
| 04-restaurant-os (TableFlow) | landing + waitlist live | https://addon90days.vercel.app/tableflow |
| 05-iot-platform (ConnectOne) | landing + waitlist live | https://addon90days.vercel.app/connectone |
| 06-predictive-maintenance (MachineGuard) | landing + waitlist live | https://addon90days.vercel.app/machineguard |

---

## KPI snapshot

- **MRR:** $0 (free tier, by design — no revenue gate until 100k users)
- **Users:** 0 paid (the metric we track now is signups + waitlist)
- **Day 15 target:** P01 launches publicly; first 100 GitHub stars + 50 sign-ups
- **Day 30 target:** P02 live with first WhatsApp business connected
- **Day 365 target:** 100k users on each of the 6 platforms

---

## Open founder actions

| Item | Action | Deadline |
|---|---|---|
| ProductHunt account | Confirm `addonwebsolutions.ai@gmail.com` has a PH account; if not, create today | 2026-05-05 21:00 IST |
| PostHog API key | Sign up posthog.com (free tier 1M events/mo); add `NEXT_PUBLIC_POSTHOG_KEY` to Vercel | Before launch traffic 2026-05-06 |
| Meta Business Manager verification | Apply at business.facebook.com for WhatsApp API access (3-7 day review) | Start TODAY to unblock P02 real-mode by Day 30 |

P02 is being built in MOCK_MODE — it works without Meta, but real customer WhatsApp messages can't flow through until the verification clears.

---

## Per-product social accounts (founder action)

For exit-strategy each product needs its own X/LinkedIn/PH/Reddit/YouTube. All using `addonwebsolutions.ai@gmail.com`. Defer until P01 launches and we see traction signals.

---

## Last session — 2026-05-04 (this one)

**Completed:**
- Per-product brand isolation: sidebar + chat widget hidden on /chatbase, /taxpilot, /tableflow, /connectone, /machineguard (commits 822716f, c7e5ae2)
- All 5 waitlist endpoints (p02–p06) smoke-tested, all 200
- All 5 per-product OG images verified live
- PostHog wired client-side, gated on `NEXT_PUBLIC_POSTHOG_KEY` env (commit 7894d7c)
- Sitemap + robots.txt expanded to include 4 new product pages
- `/llms.txt` published per llmstxt.org spec
- Day 15 launch approved by founder; one-time Telegram reminder routine scheduled (`trig_01Vr97KYBaoG2CjfDsHmyHpF` fires 2026-05-06T06:00:00Z)
- P02 ChatBase backend build started — api-engineer in background

**Next session priorities:**
1. Verify P02 api-engineer landed cleanly; spawn frontend-architect for dashboard UI
2. Backport hardened `commit_repo_file` helper to the 6 existing cloud routines (per `operations/diagnostic-routines-2026-05-01.md`)
3. Watch Day 15 launch metrics if PostHog is wired
