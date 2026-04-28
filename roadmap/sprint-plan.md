# AddonWeb AI Factory — Sprint Plan
**Generated:** 2026-04-28 | **Actual start:** 2026-04-22 | **Day today:** 7

---

## Reality Check — What's Done vs 90-Day Plan

| 90-Day Plan Said | Actual Status |
|---|---|
| Days 1–7: All 13 agents operational | ✅ All agent .md files in .claude/agents/ |
| Day 15: Claude Toolkit public | 🔨 Core built, Razorpay + deploy + npm pending |
| Day 16: Indian Business Stack MCP | ⬜ Not started |
| Day 24: AI Company Starter | ⬜ Not started |
| Day 28: Re-engagement emails to past clients | ⬜ Not started |
| Day 30: ChatBase public launch | ⬜ Not started |

**Stack decisions locked:**
- LLM: Gemini (free, Haiku→Flash, Sonnet→Pro)
- Payments: Razorpay (Stripe unavailable in India)
- Auth: Clerk ✅ keys in .env
- Git: GitHub (addon90days) ✅ live + daily backup routine

---

## Sprint 1 — P01 Launch Ready
**Dates:** 2026-04-28 → 2026-05-07 (Days 7–15)
**Goal:** `@addonweb/claude-toolkit` live on npm + marketplace on Vercel, accepting Razorpay payments
**Founder time:** ~15 min/day approval reviews

### Day 7–8 (Apr 28–29) — Razorpay Wiring + Skills API
**Owner:** @api-engineer + @frontend-architect

- [ ] Get Razorpay test keys from dashboard.razorpay.com → add to .env
- [ ] `/api/skills/run` POST route — calls runSkill(), returns JSON (gated by Clerk)
- [ ] Razorpay checkout flow in marketplace UI (buy button → order → payment modal → success)
- [ ] Webhook handler: on payment.captured → mark pack as purchased in Clerk metadata
- [ ] Type-check clean, push to dev branch

### Day 9–10 (Apr 30 – May 1) — Dashboard + Auth Gates
**Owner:** @frontend-architect

- [ ] `/dashboard` page — shows: purchased packs, API key display, usage count
- [ ] Protect `/api/skills/run` — only runs if user has purchased that pack
- [ ] API key generation (uuid stored in Clerk publicMetadata)
- [ ] Skills browser: "Purchased" badge on owned packs, disabled buy button
- [ ] Mobile-responsive (min 375px)

### Day 11–12 (May 2–3) — npm Package + MCP Server Polish
**Owner:** @infra-engineer

- [ ] Build toolkit to dist/, update README.md with install + usage examples
- [ ] `.npmignore` — exclude src/, tests/, node_modules
- [ ] MCP server: install `@modelcontextprotocol/sdk`, verify stdio transport runs
- [ ] `npm publish --dry-run` — fix any publish errors
- [ ] Claude Code quickstart doc (5 min from zero to first skill call)

### Day 13–14 (May 4–5) — Landing Page + Vercel Deploy
**Owner:** @ui-builder + @infra-engineer

- [ ] Landing page polish: hero terminal snippet, 3 pack cards with prices in ₹ and $
- [ ] `/pricing` page — pack comparison table, All-Access plan
- [ ] Vercel deploy: connect addon90days repo → products/01-claude-reseller/app
- [ ] Set env vars in Vercel dashboard (Clerk, Gemini, Razorpay)
- [ ] Custom domain setup (if available) or use vercel.app URL

### Day 15 (May 6) — Launch Day
**Owner:** @content-marketer + @cmo + founder

- [ ] `npm publish @addonweb/claude-toolkit@1.0.0`
- [ ] ProductHunt submission draft ready (founder approves before posting)
- [ ] Post on X/LinkedIn: "We built 10 production Claude skills in 15 days..."
- [ ] Hacker News Show HN post draft
- [ ] GitHub repo set to public
- [ ] **Founder:** approve all launch content, click publish

---

## Sprint 2 — P02 ChatBase + Content Engine
**Dates:** 2026-05-07 → 2026-05-21 (Days 15–30)
**Goal:** ChatBase (WhatsApp AI) live, content engine running at 5 pieces/week
**Founder time:** ~20 min/day

### Day 15–17 — ChatBase Foundation
- [ ] Apply for Meta WhatsApp Business API (3–7 day approval, start NOW)
- [ ] Fastify API scaffold: /webhook (receive), /send (outbound), intent router
- [ ] Claude Haiku intent classifier (<1s response target)
- [ ] Supabase schema: businesses, conversations, messages, intents

### Day 18–21 — ChatBase Core Features
- [ ] Business onboarding flow (register business → connect WhatsApp number)
- [ ] 5 default intents: greeting, product-query, booking, complaint, escalate-to-human
- [ ] Auto-reply engine with confidence threshold (escalate at <70%)
- [ ] Owner dashboard: conversation history, escalation queue, analytics

### Day 22–24 — AI Company Starter Kit (P01 Extension)
- [ ] Package the 13-agent setup as a downloadable kit ($99 one-time)
- [ ] Documentation: how to run AddonWeb's exact agent stack for your own company
- [ ] List on marketplace alongside skill packs

### Day 25–28 — Re-engagement + Outbound
**Owner:** @outbound-sales + @content-marketer

- [ ] @outbound-sales: pull past client list → personalised re-engagement emails
  - Angle: "We now build AI-powered versions of what we built for you"
  - Segments: IoT clients (MachineGuard pitch), app clients (ChatBase pitch)
- [ ] Content engine starts: 2× blog posts/week, 1× LinkedIn thread, 1× X thread
- [ ] Email newsletter #1 to waitlist

### Day 28 — Kill/Keep Review
**Owner:** @orchestrator + founder (30 min)

- [ ] P04 TableFlow: kill if MRR < ₹25k. Keep if traction exists.
- [ ] P01: double down or pivot based on npm download data
- [ ] Decide: P03 TaxPilot build starts now or delayed to Day 31?

### Day 29–30 — ChatBase Launch
- [ ] WhatsApp Business API approval (should be through by now)
- [ ] Beta test with 2–3 Ahmedabad businesses (founder does outreach)
- [ ] ProductHunt + LinkedIn launch post
- [ ] Pricing live: Free (1 number, 100 msgs/day), ₹999/mo (unlimited)

---

## Sprint 3 — IoT Moat + Enterprise Pipeline
**Dates:** 2026-05-21 → 2026-06-07 (Days 30–47)
**Goal:** P05 ConnectOne scaffold, first enterprise IoT discovery calls, $3k+ MRR
**Founder time:** ~30 min/day (enterprise calls start)

### Day 30–35 — ConnectOne (P05) Foundation
- [ ] EMQX Docker setup (dev), Railway deploy config
- [ ] TimescaleDB schema (devices, telemetry, alert_rules, ota_jobs)
- [ ] Fastify ingest API: device auth (X.509), telemetry write, alert eval
- [ ] **Founder review:** all C SDK architecture decisions before build starts

### Day 35–40 — ConnectOne Dashboard
- [ ] Next.js fleet view: device map, online/offline status, last-seen
- [ ] Real-time telemetry chart (WebSocket)
- [ ] Alert rules UI: create/edit threshold rules
- [ ] OTA job trigger UI

### Day 40–47 — Enterprise IoT Outreach
**Owner:** @outbound-sales + founder

- [ ] Build prospect list: Ahmedabad manufacturers (auto parts, pharma, food)
  - Apollo.io: "Head of Maintenance" OR "VP Operations" in Gujarat
  - Target: 50 contacts, 3 verticals
- [ ] Cold outreach sequence (3 emails over 10 days)
  - Email 1: ROI hook ("your 3 unplanned breakdowns cost ₹78L last quarter")
  - Email 2: case study / demo video
  - Email 3: free site visit offer
- [ ] ROI Calculator page (MachineGuard lead magnet)
- [ ] Book 3+ discovery calls. Founder closes.

---

## Sprint 4 — Scale Winners, Kill Losers
**Dates:** 2026-06-07 → 2026-06-21 (Days 47–60)
**Goal:** $10k MRR, 3+ enterprise calls done, first proposal sent
**Kill/Keep:** Day 56 review

### Day 47–52 — MachineGuard (P06) POC Build
- [ ] Isolation Forest anomaly detection (scikit-learn, Python FastAPI)
- [ ] LSTM failure prediction (TensorFlow/Keras, 2-week training window)
- [ ] SHAP explainability: "Bearing failure likely — vibration Z axis +34% over baseline"
- [ ] Alert engine: CRITICAL/WARNING/INFO with SMS + WhatsApp routing
- [ ] Demo environment with CWRU bearing dataset (realistic synthetic data)

### Day 52–56 — TaxPilot (P03) Decision Point
- [ ] If GSTN GSP registration approved: build core (invoice → e-invoice → GSTR-1)
- [ ] If not approved: defer P03, redirect capacity to ChatBase growth or MachineGuard

### Day 56 — Kill/Keep Review #2
- [ ] P01: MRR check. If < $500, pivot skill selection.
- [ ] P02: Paying customers check. Kill if < 10 paid.
- [ ] P04: Final kill/keep on TableFlow.
- [ ] P05+P06: Enterprise pipeline health check.

---

## Sprint 5 & 6 — Enterprise Close + $25k MRR
**Dates:** 2026-06-21 → 2026-07-21 (Days 60–90)
**Goal:** $25k–$75k MRR, 1–3 enterprise contracts signed

### Weeks 9–10
- [ ] Enterprise proposals for 2+ MachineGuard POC prospects
- [ ] Free 30-day POC: deploy sensors, establish baseline, deliver first prediction
- [ ] Content: "How we predicted bearing failure 36h early" case study
- [ ] @paid-ops-marketer: LinkedIn ads targeting "plant managers Gujarat"

### Weeks 11–12
- [ ] First enterprise contract: ₹4L–40L/year ACV
- [ ] P01 + P02 growth: paid acquisition test ($200 budget on X/LinkedIn)
- [ ] Documentation sprint: SOPs, agent playbooks, system handoff docs
- [ ] Day 90: full retrospective + Month 4–12 plan

---

## Immediate Next Steps (Today — Apr 28)

1. **You:** Go to dashboard.razorpay.com → Sign up (free) → Settings → API Keys → Test Mode → copy key_id + key_secret → add to `.env`
2. **Then tell me:** "Razorpay keys added" — I build the full checkout flow immediately
3. **Parallel today:** I start `/dashboard` page and `/api/skills/run` route

---

## Key Dates Summary

| Date | Day | Milestone |
|---|---|---|
| 2026-04-28 | 7 | Sprint 1 execution starts (today) |
| 2026-05-06 | 15 | **P01 launch: npm + Vercel + ProductHunt** |
| 2026-05-13 | 22 | AI Company Starter Kit listed |
| 2026-05-22 | 31 | **P02 ChatBase launch** |
| 2026-05-28 | 37 | Kill/Keep #1 (Day 28 decision, slightly delayed) |
| 2026-06-07 | 47 | ConnectOne dashboard live, enterprise outreach starts |
| 2026-06-21 | 60 | Kill/Keep #2 — double down on winners |
| 2026-07-21 | 90 | **Target: $25k–$75k MRR, 1–3 enterprise contracts** |
