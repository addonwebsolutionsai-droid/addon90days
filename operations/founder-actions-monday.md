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

## P03 — TaxPilot / GST Invoicing (EXTRACTED to own app, NOT YET DEPLOYED)

P03 is now a standalone Next.js app at `products/03-gst-invoicing/app/`. P01 + P02 + P03 type-check clean. Founder action needed to bring P03 online.

### P03-00a — Create P03 Vercel project from monorepo
Same as P02-01 but for P03:
- **Project Name:** `taxpilot` (or `addonweb-taxpilot`)
- **Root Directory:** `products/03-gst-invoicing/app`
- **Framework:** Next.js
- **Time:** 5 min

### P03-00b — Copy P03 environment variables (same set as P02)
Same env var matrix as P02-02 (Supabase shared, Clerk new or shared, Razorpay shared). Plus when GSP is set up:
- `GSTN_GSP_API_KEY`, `GSTN_GSP_API_SECRET`, `GSTN_TENANT_ID` — provided by chosen GSP after P03-01
- **Time:** 15 min

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

## P04 — TableFlow / Restaurant OS (extraction in flight as of 2026-05-09 night)

A background agent is extracting P04 from P01 right now. By Monday morning P04 should be a standalone app at `products/04-restaurant-os/app/`. Same Vercel-project setup as P02/P03 will be needed.

### P04-00a — Create P04 Vercel project from monorepo (post-extraction)
Same shape as P02-01 / P03-00a:
- **Project Name:** `tableflow` (or `addonweb-tableflow`)
- **Root Directory:** `products/04-restaurant-os/app`
- **Framework:** Next.js
- **Time:** 5 min

### P04-00b — Copy P04 environment variables
Same env matrix as P02-02 (Supabase shared, Clerk new or shared, Razorpay shared). Future restaurant-specific keys (POS gateway, KOT printer cloud) will be added once Phase 2 begins.
- **Time:** 15 min

---

## P05 — ConnectOne / IoT Platform (SCAFFOLDED, pre-launch landing live in repo)

P05's Next.js app exists at `products/05-iot-platform/app/`. Currently a marketing landing page with email-capture early-access framing. Shared lib utilities are inherited from `packages/` via sync — backend/dashboards layered on later.

### P05-00 — (Optional, when ready to start P05 build) — Create P05 Vercel project
Same shape as P02/P03/P04:
- **Project Name:** `connectone` (or `addonweb-connectone`)
- **Root Directory:** `products/05-iot-platform/app`
- **Time:** 5 min

For Phase 2 (when MQTT + device infra goes live):
- `EMQX_HOST`, `EMQX_USERNAME`, `EMQX_PASSWORD` — EMQX broker creds
- `IOT_DEVICE_PROVISIONING_KEY` — for QR/BLE pairing
- (To be expanded as the platform grows)

---

## P06 — MachineGuard / Predictive Maintenance (SCAFFOLDED, pre-launch landing live in repo)

P06's Next.js app exists at `products/06-predictive-maintenance/app/`. Currently a marketing landing page with pilot-enquiry framing. Shared lib utilities are inherited from `packages/` via sync.

### P06-00 — (Optional, when ready to start P06 pilot) — Create P06 Vercel project
Same shape as P05:
- **Project Name:** `machineguard`
- **Root Directory:** `products/06-predictive-maintenance/app`
- **Time:** 5 min

For Phase 2 (when sensor pilots start):
- `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD` — telemetry intake
- `WHATSAPP_ALERT_NUMBER` — outgoing alarms via P02's Meta channel
- ML model storage credentials (Supabase Storage or S3)

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
| P0 | P03-00a + P03-00b | 20 min | All P03 customer access |
| P0 | P04-00a + P04-00b (after agent lands) | 20 min | All P04 customer access |
| P1 | P01-02 (ROUTINE_API_SECRET) | 3 min | Daily skill auto-generation |
| P1 | P01-03 (repo visibility decision) | 10 min | Team trust + IP protection |
| P1 | P02-04 (Meta verification) | 20 min submit (3-5d Meta) | P02 production scale |
| P2 | P03-01 (GSP application) | 30 min submit (7-10d) | P03 Phase 2 |
| P2 | P02-05 / P02-06 (post-deploy) | 7 min | P02 webhook + brand URLs |
| P2 | P05-00 / P06-00 (when ready) | 10 min | P05/P06 launch |
| P3 | CRX-01..04 (cleanup) | 10 min | Hygiene |

**Estimated total founder time, Monday: ~80 min (P0 only — bring P02/P03/P04 online), ~110 min (P0 + P1), ~140 min (everything).**

### Status as of 2026-05-09 (end of Day 12)

| Product | App scaffold | Lib parity | Vercel project | Status |
|---|---|---|---|---|
| P01 SKILON | ✅ in `products/01-claude-reseller/app/` | ✅ canonical packages | ✅ live at `addon90days.vercel.app` | **Live, free beta** |
| P02 ChatBase | ✅ in `products/02-whatsapp-ai-suite/app/` | ✅ synced from packages/ | ❌ founder action P02-01 | Code ready, awaits Vercel |
| P03 TaxPilot | ✅ in `products/03-gst-invoicing/app/` | ✅ synced from packages/ | ❌ founder action P03-00a | Code ready, awaits Vercel |
| P04 TableFlow | 🟡 extraction agent in flight | 🟡 sync runs after extraction | ❌ founder action P04-00a | Mid-extraction Sat-Sun |
| P05 ConnectOne | ✅ scaffold + landing in `products/05-iot-platform/app/` | ✅ synced from packages/ | ❌ founder action P05-00 (later) | Marketing landing only |
| P06 MachineGuard | ✅ scaffold + landing in `products/06-predictive-maintenance/app/` | ✅ synced from packages/ | ❌ founder action P06-00 (later) | Marketing landing only |

What Claude/agents are doing while founder is offline (Sat-Sun): continued through P03 (✅ landed in commit `12a22d3`), P04 in flight, P05/P06 fresh scaffolds (✅ landed). All six products now have own-app structure with shared lib parity through `scripts/sync-libs.mjs`.
