# Founder Actions — Monday Review (2026-05-11)

Created 2026-05-09 evening. Founder is offline through the weekend; agents continue building. Anything below requires the founder's hands (Vercel UI, Meta dashboard, GSTN, GitHub Settings, etc.) and will block the next phase if not done by EOD Monday.

Items grouped per product. Cross-product items at the bottom. Each item:
- **What** (the action)
- **Why** (what it unblocks)
- **Time** (estimated)
- **Where** (the URL/console)

---

## P01 — SKILON / Claude Toolkit (LIVE, free beta)

### P01-01 — Confirm latest deploy is healthy
- **What:** Open https://addon90days.vercel.app, click through Skills, run /api/whoami, confirm admin loads.
- **Why:** Verify the Path D + P02 extraction commit (abc0888) didn't regress P01.
- **Time:** 5 min
- **Where:** addon90days.vercel.app

### P01-02 — Generate `ROUTINE_API_SECRET` for Skill Smith routine
- **What:** Run `openssl rand -hex 32`, paste the output into Vercel env as `ROUTINE_API_SECRET` for production+preview+development. Tell Claude the value (or just commit it to env-backup).
- **Why:** Re-enables the daily 8 AM IST automatic skill generation routine. Currently disabled because the previous secret was rotated.
- **Time:** 3 min
- **Where:** vercel.com → addon90days → Settings → Environment Variables. (Also see `operations/approval-queue.md` #008.)

### P01-03 — Decide: GitHub repo public vs private
- **What:** Either flip repo to private (Settings → Danger Zone) and upgrade Vercel to Pro ($20/mo), OR keep public + rely on `.gitignore` for secrets. See approval-queue.md #006.
- **Why:** Current public repo means anyone can see business logic. Going private requires Vercel Pro to keep cloud-routine commits from being blocked.
- **Time:** 5–10 min
- **Where:** github.com/addonwebsolutionsai-droid/addon90days → Settings

---

## P02 — ChatBase / WhatsApp AI Suite (EXTRACTED to own app, NOT YET DEPLOYED)

P02 is now a standalone Next.js app at `products/02-whatsapp-ai-suite/app/`. Both apps type-check clean. Founder action needed to bring P02 online.

### P02-01 — Create P02 Vercel project from monorepo
- **What:** In Vercel, "Add New Project" → import `addonwebsolutionsai-droid/addon90days` → set:
  - **Project Name:** `chatbase` (or `addonweb-chatbase`)
  - **Root Directory:** `products/02-whatsapp-ai-suite/app`
  - **Framework:** Next.js (auto-detected)
  - **Install Command:** default (`npm install`)
  - **Build Command:** default (`next build`)
- **Why:** Without this, P02 has nowhere to deploy — code lives in the repo but is invisible to the public.
- **Time:** 5 min
- **Where:** vercel.com → Add New Project

### P02-02 — Copy P02 environment variables into the new Vercel project
After creating the project, set these env vars (Production + Preview + Development unless noted):

| Variable | Value source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as P01 | Both products share one Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as P01 | |
| `SUPABASE_SERVICE_ROLE_KEY` | same as P01 | |
| `ADMIN_USER_IDS` | same as P01 (founder Clerk user id) | Comma-separated |
| `CLERK_PUBLISHABLE_KEY` | new — create P02 Clerk app | OR re-use P01's keys for now to ship fast |
| `CLERK_SECRET_KEY` | new — create P02 Clerk app | |
| `CLERK_WEBHOOK_SIGNING_SECRET` | new | If using webhooks |
| `META_APP_ID` | from P01's env | WhatsApp Business |
| `META_APP_SECRET` | from P01's env | |
| `META_VERIFY_TOKEN` | from P01's env | |
| `META_SYSTEM_USER_TOKEN` | **new permanent token** (see P02-03) | Currently a temporary token |
| `P02_ENCRYPTION_KEY` | from P01's env | AES-256 |
| `GROQ_API_KEY` | same as P01 | Free tier shared |
| `RAZORPAY_KEY_ID` | same as P01 | INR billing |
| `RAZORPAY_KEY_SECRET` | same as P01 | |
| `ANTHROPIC_API_KEY` | same as P01 | For Claude Haiku translation |
| `NEXT_PUBLIC_APP_URL` | the new Vercel URL after first deploy | Hard-coded to placeholder right now in `lib/site-config.ts` |
| `RECAPTCHA_SITE_KEY` | same as P01 | |
| `RECAPTCHA_SECRET_KEY` | same as P01 | |

- **Time:** 15–20 min
- **Where:** Newly-created Vercel P02 project → Settings → Environment Variables. Source values from `secrets/env-backup-2026-05-08.md` on the laptop.

### P02-03 — Generate permanent Meta WhatsApp System User token
- **What:** business.facebook.com → Settings → Users → System Users → "AddonWeb-Bot" (or create) → Generate Token → permission `whatsapp_business_messaging` + `whatsapp_business_management` → set "Never expires" → copy.
- **Why:** Current token is a temporary 24h one. Production needs a permanent token that doesn't auto-expire.
- **Time:** 10 min
- **Where:** business.facebook.com (Meta Business Manager) — see notes in `secrets/env-backup-2026-05-08.md` if it exists.

### P02-04 — Trigger Meta Business Manager verification
- **What:** business.facebook.com → Security Center → Business Verification → submit company documents (PAN, GST cert, business letter). Takes 3–5 business days. Required to graduate from sandbox to production WhatsApp messaging.
- **Why:** Without verification we can only message ~50 phone numbers/day in sandbox. Production needs verification.
- **Time:** 20 min to submit; 3–5 days for Meta to approve
- **Where:** business.facebook.com → Security Center

### P02-05 — Update P02 webhook URL with Meta after first deploy
- **What:** After P02-01 succeeds and you have the new Vercel URL (e.g. `chatbase-addonweb.vercel.app`), update the WhatsApp webhook in Meta:
  - business.facebook.com → WhatsApp → Configuration → Webhook → URL: `https://<new-vercel-url>/api/webhook`
  - Verify token: from `META_VERIFY_TOKEN` env var
  - Subscribed fields: `messages`, `message_status`
- **Why:** Currently the webhook still points at P01's `/api/webhook` route (which has been deleted). P02 has its own webhook handler at the new app.
- **Time:** 5 min
- **Where:** business.facebook.com → WhatsApp Business → Configuration

### P02-06 — Update `NEXT_PUBLIC_APP_URL` after first deploy
- **What:** After Vercel deploys P02 successfully, copy the public URL and set `NEXT_PUBLIC_APP_URL` env var to that URL.
- **Why:** `lib/site-config.ts` currently hard-codes a placeholder URL. Marketing pages, OG images, and email links use this.
- **Time:** 2 min
- **Where:** Vercel P02 project → Settings → Environment Variables

### P02-07 — (Optional, Day-30+) Buy `chatbase.io` or similar domain
- **What:** Purchase a custom domain, point DNS to Vercel.
- **Why:** Public-facing brand. `chatbase-addonweb.vercel.app` is fine for beta but not for paying customers.
- **Time:** 15 min
- **Where:** GoDaddy / Cloudflare / Namecheap → DNS → CNAME

---

## P03 — TaxPilot / GST Invoicing (still inside P01, extraction queued for next session)

### P03-01 — Apply for GSP / GSTN sandbox access
- **What:** Submit GSP application at https://gstn.gov.in/gsps. Documents: PAN, business proof, list of GSPs to integrate with. Takes 7–10 business days.
- **Why:** TaxPilot Phase 2 (real GSTN filing) requires sandbox + production GSP credentials. Without this we're limited to mock filings.
- **Time:** 30 min to submit
- **Where:** gstn.gov.in/gsps — see `products/03-gst-invoicing/PRD.md` for the GSP shortlist if compiled.

### P03-02 — (Decide) Razorpay merchant verification status
- **What:** Confirm Razorpay account is fully KYC-verified for live mode. Currently in test mode.
- **Why:** TaxPilot will need to charge real customers. Test keys won't.
- **Time:** 15 min
- **Where:** dashboard.razorpay.com → Account & Settings → KYC

---

## P04 — TableFlow / Restaurant OS (not started)

No founder actions yet. Build is queued for the next product extraction phase. Item appears here once any external account is needed.

---

## P05 — ConnectOne / IoT Platform (not started)

No founder actions yet. Will be built fresh from PRD with Path D's sync as the baseline (plug-and-play library inheritance from day 1).

---

## P06 — MachineGuard / Predictive Maintenance (not started)

No founder actions yet. Same as P05 — will use Path D from day 1.

---

## Cross-product items

### CRX-01 — Revoke Supabase PAT `sbp_26612c54...`
- **What:** supabase.com → Account → Access Tokens → revoke the token with prefix `sbp_26612c54`.
- **Why:** Token was used during 2026-05-04 setup; we don't need it anymore. Reduces blast radius if leaked.
- **Time:** 2 min
- **Where:** supabase.com → Account Settings

### CRX-02 — Copy `secrets/env-backup-2026-05-08.md` off-machine
- **What:** Copy the file to a secure location not on the laptop (1Password, encrypted USB, Bitwarden, etc.).
- **Why:** If the laptop dies, we lose all the live env vars. Backup is recovery insurance.
- **Time:** 5 min
- **Where:** local laptop file → preferred password manager

### CRX-03 — Confirm Telegram EOD pings are working
- **What:** Wait for the next 5 PM IST Telegram message from `@Addon90days_bot`. If it doesn't arrive, alert Claude and we'll check the routine.
- **Why:** Sanity check that the daily-summary loop is firing.
- **Time:** 30 sec (passive)
- **Where:** Telegram

### CRX-04 — Check Vercel Pro upgrade need
- **What:** If repo goes private (P01-03), upgrade Vercel to Pro tier ($20/mo) so cloud-routine commits aren't blocked.
- **Why:** Hobby tier blocks commits not authored by the Vercel-linked owner — a problem when our cloud routines push commits.
- **Time:** 2 min
- **Where:** vercel.com → Settings → Billing

---

## Summary

| Priority | Item | Time | Blocks |
|---|---|---|---|
| P0 | P02-01 + P02-02 | 25 min | All P02 customer access |
| P0 | P02-03 (Meta perm token) | 10 min | P02 going live |
| P1 | P01-02 (ROUTINE_API_SECRET) | 3 min | Daily skill auto-generation |
| P1 | P01-03 (repo visibility decision) | 10 min | Team trust + IP protection |
| P1 | P02-04 (Meta verification) | 20 min submit (3-5d Meta) | P02 production scale |
| P2 | P03-01 (GSP application) | 30 min submit (7-10d) | P03 Phase 2 |
| P2 | P02-05 / P02-06 (post-deploy) | 7 min | P02 webhook + brand URLs |
| P3 | CRX-01..04 (cleanup) | 10 min | Hygiene |

**Estimated total founder time, Monday: ~80 min (P0/P1 only) or ~110 min (everything).**

What Claude/agents are doing while founder is offline (Sat-Sun): continuing P03 TaxPilot extraction → P04 TableFlow extraction → P05/P06 fresh scaffolds, all using Path D's sync. By Monday morning, all six products should have own-app structure with shared lib parity.
