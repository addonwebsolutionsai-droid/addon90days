# 90-Day Daily Runbook

**The single source of truth for what happens each day.** The `@orchestrator` reads this during `/daily-standup` to plan the day's work.

Each day entry has:
- **Goal** — what success looks like for today
- **Agents active** — who's doing what
- **Founder time** — estimated minutes you'll need
- **Deliverables** — what should be in the repo/folders by EOD
- **Decisions needed from you** — approval queue items to expect

---

## Phase 1: Foundation (Days 1–30)

Goal: Stand up the agent workforce, identify 3 product bets, ship first MVP + Claude Toolkit, rebrand.

---

### Week 1 — Infrastructure & Team Deployment (Days 1-7)

---

### **Day 1 — Foundation bootstrap**

**Goal:** Claude Code + all accounts wired. First agent run.

**Agents active:**
- `@orchestrator` — meta-activates, reads CLAUDE.md, confirms env
- `@cto` — runs initial state-of-the-company audit

**Founder time:** 2-3 hours (one-time setup)

**Steps:**
1. Founder completes `GETTING_STARTED.md` Parts 1-3 (accounts + Claude Code install + env)
2. First `claude` session in the `addonweb-ai-factory` folder
3. Founder runs `/daily-standup`
4. Orchestrator confirms it sees all 13 agents
5. Founder asks `@cto` to audit: "Read our existing addonwebsolutions.com, list our past client work we can reference, identify which skills/tools we have that are still market-relevant."

**Deliverables by EOD:**
- `operations/kpis.md` with start date = today, baseline metrics
- `operations/daily-log/YYYY-MM-DD.md` from orchestrator
- CTO's state-of-the-company report saved to `operations/audits/day-01-current-state.md`

**Decisions needed from you:**
- None today — just setup

---

### **Day 2 — CTO deep audit + Skills Pack kickoff**

**Goal:** CTO has full picture. IoT Skills Pack started.

**Agents active:**
- `@cto` — completes audit, writes `operations/audits/day-02-tech-foundation.md`
- `@infra-engineer` — starts on IoT Developer Skills Pack structure (P7 — our fastest revenue)

**Founder time:** 45 min

**Tasks:**
- `@cto`: complete technical audit, identify which past client code is reusable for productization
- `@infra-engineer`: create `products/01-claude-reseller/packs/iot-developer/` with folder skeleton, start on first skill: `iot-firmware-scaffold`
- `@orchestrator`: sets up daily log structure, confirms `#standups` Slack channel

**Deliverables:**
- Full tech audit
- First IoT skill draft

**Decisions:**
- Approve CTO's audit findings (review which past code gets productized)

---

### **Day 3 — Dev agents activated, approval dashboard build**

**Goal:** Internal approval dashboard live.

**Agents active:**
- `@frontend-architect`, `@ui-builder`, `@api-engineer`, `@infra-engineer`

**Founder time:** 45 min

**Tasks:**
- `@api-engineer`: design schema for approval queue, build simple Fastify API
- `@frontend-architect`: build Next.js dashboard with approval list, approve/reject/edit actions
- `@infra-engineer`: deploy to Vercel under `admin.addonwebsolutions.com`
- `@cto`: review PRs, integrate

**Deliverables:**
- Working `admin.addonwebsolutions.com` dashboard (internal)
- `operations/approval-queue.md` auto-syncs with the dashboard

**Decisions:**
- Approve dashboard design at end of day

---

### **Day 4 — Design system + brand audit**

**Goal:** Design tokens and first brand direction.

**Agents active:**
- `@design-systems`, `@product-designer`, `@cmo`

**Founder time:** 60 min (brand direction feedback)

**Tasks:**
- `@design-systems`: create `packages/design-system/` with base tokens, Tailwind preset
- `@cmo`: audit current addonwebsolutions.com, analyze top 10 competitors for each of 4 pillars, write positioning hypothesis doc
- `@product-designer`: for each of the 6 products, sketch 3 brand directions (visual + verbal positioning)

**Deliverables:**
- `packages/design-system/tokens/base.ts` + Tailwind preset
- `operations/audits/day-04-brand-competitive.md`
- `products/<id>/brand-directions.md` (3 options each for all 6 products)

**Decisions:**
- Pick one brand direction per product (or defer until Day 11 if you want more data)

---

### **Day 5 — Marketing team activated, content plan**

**Goal:** Content engine primed.

**Agents active:**
- `@cmo`, `@content-marketer`, `@paid-ops-marketer`

**Founder time:** 60 min (voice calibration + messaging approval)

**Tasks:**
- `@cmo`: write `operations/brand-voice.md` (the house style) based on founder interview
- `@content-marketer`: draft first 5 LinkedIn posts in founder's voice for feedback
- `@paid-ops-marketer`: set up PostHog, Plausible, connect existing social accounts (read-only for now)

**Deliverables:**
- `operations/brand-voice.md`
- 5 draft LinkedIn posts (in approval queue)
- Analytics connected

**Decisions:**
- Approve brand voice guardrails
- Approve/edit LinkedIn posts

---

### **Day 6 — Sales agents activated, re-engagement list**

**Goal:** Past-client outreach drafted, not yet sent.

**Agents active:**
- `@inbound-sales`, `@outbound-sales`, `@orchestrator`

**Founder time:** 60 min (validate past-client list)

**Tasks:**
- Founder exports past-client list to `operations/seed-data/past-clients.csv` (names, emails, last project, rough value)
- `@outbound-sales`: draft personalized re-engagement email for EACH past client (not a template — actual personalization from the CSV data)
- `@inbound-sales`: set up HubSpot, import past clients as contacts

**Deliverables:**
- Past-client list in HubSpot
- 40-80 personalized re-engagement emails in approval queue (do NOT send yet — wait until Day 28 when we have substance to show)

**Decisions:**
- Review 5-10 draft emails, give feedback on tone
- Don't approve send — these queue for Day 28

---

### **Day 7 — Week 1 review**

**Goal:** Full system operational. Friday weekly retro.

**Agents active:** All

**Founder time:** 90 min (weekly review)

**Tasks:**
- Founder runs `/weekly-review`
- Orchestrator compiles the full week report
- All agents contribute pod-lead inputs

**Deliverables:**
- `operations/weekly-reviews/2026-W17.md`
- Tomorrow's plan updated if any slippage

**Decisions:**
- Any agent system-prompt tweaks based on week 1 behavior
- Any adjustment to Week 2 plan

---

### Week 2 — Opportunity Discovery & Product Selection (Days 8-14)

---

### **Day 8 — Problem Radar launched**

**Goal:** Problem discovery engine running across all 6 verticals.

**Agents active:**
- `@problem-scout` (first real use)
- `@infra-engineer` (to help with scan automation)

**Founder time:** 30 min

**Tasks:**
- Founder runs `/problem-scan iot` — test scan in IoT vertical
- Based on results, run `/problem-scan` for remaining 5 verticals one at a time or parallel
- `@problem-scout` produces 6 radar reports

**Deliverables:**
- `operations/problem-radar/YYYY-MM-DD-{vertical}.md` × 6

**Decisions:**
- Review top problems per vertical
- Flag any "unexpected" problem for deeper research

---

### **Day 9 — Ideation sprint**

**Goal:** 30-idea long list scored and ranked.

**Agents active:**
- `@cto`, `@cmo`, `@product-designer`, `@problem-scout`

**Founder time:** 45 min

**Tasks:**
- Founder runs `/ideate all`
- Agents work the scoring matrix
- Top 10 list produced

**Deliverables:**
- `operations/ideation/YYYY-MM-DD-crossvertical.md`

**Decisions:**
- Review top 10, flag any that don't feel right

---

### **Day 10 — Validation prep**

**Goal:** Top 5 ideas go into fake-door validation.

**Agents active:**
- `@idea-validator`, `@ui-builder`, `@content-marketer`, `@paid-ops-marketer`

**Founder time:** 60 min

**Tasks:**
- Founder runs `/validate-idea` for top 5 candidates (or confirms the 7 existing PRDs are the bets and skips validation for those, running it only for any NEW ideas surfaced)
- Since we already have 6 PRDs, validate the ones with the weakest signal first: likely P04 TableFlow, P03 TaxPilot, P06 MachineGuard
- `@ui-builder` builds 3 fake-door landing pages (one per weaker-signal product)
- `@paid-ops-marketer` preps $300 ad spend each

**Deliverables:**
- 3 fake-door landing pages live
- Ad campaigns drafted

**Decisions:**
- Approve fake-door spend ($900 total)
- Approve landing page copy

---

### **Day 11 — Pick the 3 Phase 1 bets**

**Goal:** Commit to which 3 products get built first.

**Agents active:**
- `@orchestrator`, `@cto`, `@cmo`

**Founder time:** 90 min (strategic)

**Tasks:**
- Orchestrator presents: Problem Radar findings + Validation data so far + All 6 PRDs
- Decision: 3 bets for Phase 1

**Recommended bets:**
1. **P01 Claude Toolkit** (fastest revenue, already our strength)
2. **P02 ChatBase — WhatsApp AI Suite** (clear market, strong validation signal)
3. **P05 ConnectOne — IoT Plug-and-Play prototype** (our moat, sets up enterprise pipeline)

**Deliverables:**
- `operations/decisions/YYYY-MM-DD-phase1-bets.md` — the 3 committed products
- PRDs updated with "BUILD STARTING: date" status

**Decisions:**
- Final commit (you)

---

### **Day 12 — Skills Pack accelerated**

**Goal:** IoT Developer Skills Pack v0.9.

**Agents active:**
- `@infra-engineer`, `@cto`

**Founder time:** 45 min

**Tasks:**
- `@infra-engineer` completes 3 of 5 skills in IoT Developer Pack
- Each skill tested against sample ESP32 project
- README + examples

**Deliverables:**
- 3 of 5 IoT skills complete in `products/01-claude-reseller/packs/iot-developer/`

**Decisions:**
- Review 1 skill end-to-end

---

### **Day 13 — Skills Pack complete + MCP server begun**

**Goal:** IoT Developer Skills Pack v1.0 ready for launch. Indian Business Stack MCP started.

**Agents active:**
- `@infra-engineer`, `@api-engineer`, `@content-marketer`

**Founder time:** 45 min

**Tasks:**
- `@infra-engineer`: complete remaining 2 IoT skills
- `@api-engineer`: start Indian Business Stack MCP (GST/PAN/MCA integrations)
- `@content-marketer`: write landing page + blog post + Twitter thread for Claude Toolkit launch

**Deliverables:**
- Claude Toolkit (IoT Skills Pack) v1.0 complete
- Indian MCP v0.3

**Decisions:**
- Approve Claude Toolkit copy + pricing ($49)

---

### **Day 14 — Week 2 review + ChatBase kickoff**

**Goal:** Week 2 retro + ChatBase (WhatsApp AI Suite) build starts.

**Agents active:** All

**Founder time:** 90 min

**Tasks:**
- `/weekly-review` Week 2
- ChatBase kickoff: `@cto` writes architecture brief, `@product-designer` starts flows, `@frontend-architect` sets up monorepo

**Deliverables:**
- Week 2 review
- `products/02-whatsapp-ai-suite/architecture.md`
- Monorepo scaffolding

**Decisions:**
- Approve ChatBase architecture
- Approve naming for each product (finalize)

---

### Week 3 — First MVP Build Sprint (Days 15-21)

---

### **Day 15 — ChatBase sprint day 1; Claude Toolkit launches**

**Goal:** Claude Toolkit publicly live. ChatBase (WhatsApp AI Suite) build starts.

**Agents active:**
- `@infra-engineer` (Claude Toolkit deploy + launch)
- `@frontend-architect`, `@api-engineer`, `@ui-builder` (ChatBase)
- `@content-marketer` (launch content live)

**Founder time:** 90 min (launch day coordination for Claude Toolkit)

**Tasks:**
- Morning: Run `/launch-product 01-claude-reseller` for Claude Toolkit
  - Publish to `toolkit.addonwebsolutions.com/iot-developer-pack`
  - Post on Dev.to, HN (Show HN), Twitter, LinkedIn
  - Activate Stripe checkout at $49
- Afternoon: ChatBase build begins per plan in P02 PRD

**Deliverables:**
- Claude Toolkit live and selling
- ChatBase Day 1-2 tasks complete (monorepo, auth, navigation, WhatsApp connection)

**Decisions:**
- Approve launch copy
- Monitor first comments/replies

---

### **Day 16 — ChatBase day 2; Indian MCP launch**

**Goal:** Indian Business Stack MCP live. ChatBase contacts module.

**Agents active:**
- `@api-engineer` (MCP + ChatBase backend)
- `@frontend-architect` (ChatBase contacts UI)
- `@infra-engineer` (MCP deployment)
- `@content-marketer` (MCP launch content)

**Founder time:** 60 min

**Tasks:**
- Indian MCP deployed to Railway, hosted auth working
- Launch Indian MCP on Anthropic community + Twitter
- ChatBase: contacts CRUD, WhatsApp number linking

**Deliverables:**
- Indian MCP live at `indian-business-stack.addonwebsolutions.com`
- ChatBase contacts module done

**Decisions:**
- Approve MCP launch post

---

### **Day 17 — ChatBase day 3**

**Goal:** AI auto-reply with templates (killer feature).

**Agents active:**
- `@frontend-architect`, `@api-engineer`, `@ui-builder`

**Founder time:** 45 min

**Tasks:**
- WhatsApp message receive → Claude AI analysis → auto-reply or template-match → send
- Template library CRUD
- Offline queue for messages when no network

**Deliverables:**
- AI auto-reply working end-to-end (receive → Claude → send)
- Template library

**Decisions:**
- Test the AI response quality on real WhatsApp message samples (you provide 5-10 samples)

---

### **Day 18 — ChatBase day 4**

**Goal:** Broadcast campaigns + analytics.

**Agents active:**
- `@frontend-architect`, `@api-engineer`

**Founder time:** 30 min

**Tasks:**
- Broadcast campaign builder (audience segmentation, message, schedule)
- Per-campaign analytics (sent, delivered, read, replied)
- Contact tagging + segmentation

**Deliverables:**
- Broadcast module complete

**Decisions:**
- None strategic today

---

### **Day 19 — ChatBase day 5**

**Goal:** Multi-agent inbox + team assignment.

**Agents active:**
- `@frontend-architect`, `@api-engineer`

**Founder time:** 30 min

**Tasks:**
- Shared inbox for team (assign conversations to team members)
- Internal notes on conversations (visible only to team)
- Conversation status tracking (open/resolved/snoozed)

**Deliverables:**
- Team inbox module complete

**Decisions:**
- Validate conversation routing with a test WhatsApp number

---

### **Day 20 — Marketing pre-launch + AI Company Starter**

**Goal:** ChatBase content bank + AI Company Starter pack.

**Agents active:**
- `@content-marketer`, `@paid-ops-marketer`, `@infra-engineer`

**Founder time:** 60 min

**Tasks:**
- Run `/content-sprint 02-whatsapp-ai-suite 14` — generate 2 weeks of content for ChatBase
- Run `/outbound-cohort 02-whatsapp-ai-suite "India SMBs WhatsApp-heavy 10-100 employees" 500` — prep but don't launch
- `@infra-engineer` starts AI Company Starter pack (P01) using this very repo as the base

**Deliverables:**
- ChatBase content bank (30+ pieces) in `products/02-whatsapp-ai-suite/content/`
- Outbound cohort ready for launch
- AI Company Starter v0.3

**Decisions:**
- Approve content bank
- Review outbound cohort before Day 28 send

---

### **Day 21 — Week 3 review + ChatBase beta**

**Goal:** ChatBase in private beta.

**Agents active:** All

**Founder time:** 90 min

**Tasks:**
- `/weekly-review` Week 3
- ChatBase WhatsApp webhook sync wired
- Role-based permissions done
- Private beta invite to 3-5 friendly SMBs (from your network)

**Deliverables:**
- ChatBase private beta live
- Week 3 review

**Decisions:**
- Approve beta invitation emails
- Identify 5 beta testers by name

---

### Week 4 — Polish, Fix, Prep for Public Launch (Days 22-30)

---

### **Day 22 — Beta feedback collection**

**Goal:** Real user feedback starts flowing.

**Agents active:**
- `@inbound-sales` (runs feedback calls)
- `@frontend-architect`, `@api-engineer` (prep for fixes)

**Founder time:** 90 min (you do some of the calls)

**Tasks:**
- Structured interviews with 5 beta testers (`@inbound-sales` preps scripts, records + transcribes)
- Bugs + feature requests logged to Linear
- AI Company Starter v1 complete, documentation added

**Deliverables:**
- 5 beta transcripts in `products/02-whatsapp-ai-suite/beta-feedback/`
- Prioritized fix list
- AI Company Starter ready for launch

**Decisions:**
- Review top 3 user pain points

---

### **Day 23 — Rapid fix cycle**

**Goal:** Top 10 beta bugs fixed.

**Agents active:**
- All dev agents

**Founder time:** 30 min

**Tasks:**
- Dev agents triage + fix in parallel
- `@cto` reviews all PRs
- Deploy fixes to beta

**Deliverables:**
- v1.1 of ChatBase (bug-fixed)

**Decisions:**
- None today

---

### **Day 24 — AI Company Starter launch + more fixes**

**Goal:** 3rd P7 product publicly live.

**Agents active:**
- `@infra-engineer`, `@content-marketer`, `@paid-ops-marketer`

**Founder time:** 60 min

**Tasks:**
- Run `/launch-product 01-claude-reseller` for AI Company Starter
- Big launch: HN Show HN "We built a 13-agent AI company, here's how you can too — $99"
- Continue ChatBase fixes

**Deliverables:**
- AI Company Starter live at $99 one-time
- First Claude Toolkit traction building

**Decisions:**
- Approve launch post + pricing
- Be on-hand for HN comments

---

### **Day 25 — Website rebrand begins**

**Goal:** addonwebsolutions.com rebrand drafted.

**Agents active:**
- `@ui-builder`, `@product-designer`, `@content-marketer`, `@cmo`

**Founder time:** 90 min

**Tasks:**
- New positioning: "AI-native product studio + IoT×AI specialists"
- Hero: what we're building NOW (the 4 pillars)
- Portfolio: 6 products, with status
- Case studies section (past IoT work, anonymized)
- Technical blog (cross-link content from P1/P7)

**Deliverables:**
- `addonwebsolutions.com` rebuild drafted, deployed to preview URL

**Decisions:**
- Approve positioning
- Approve visual direction

---

### **Day 26 — Website rebrand live + IoT prototype push**

**Goal:** New addonwebsolutions.com live. P3 prototype push.

**Agents active:**
- `@ui-builder`, `@infra-engineer` (P3 prototype)
- `@cto`

**Founder time:** 60 min

**Tasks:**
- New website goes live
- ConnectOne (P05) IoT Plug-and-Play prototype: EMQX setup, ESP32 sample firmware, basic API, basic React Native app showing one device telemetry
- This is the demo for upcoming enterprise pitches

**Deliverables:**
- New website live
- P3 prototype demo-able

**Decisions:**
- Approve website go-live

---

### **Day 27 — P3 prototype polished**

**Goal:** Enterprise-demo-ready IoT prototype.

**Agents active:**
- `@infra-engineer`, `@ui-builder`, `@product-designer`

**Founder time:** 45 min

**Tasks:**
- Super-admin + vendor-admin dashboards (basic)
- Role-based auth
- White-label demo (swap logo for "AcmeCorp IoT")
- Demo video recorded

**Deliverables:**
- P3 prototype demo package
- Demo video in `products/05-iot-platform/demo/`

**Decisions:**
- Watch demo video, approve for external use

---

### **Day 28 — Re-engagement emails sent + Month 1 retrospective begins**

**Goal:** Past clients re-engaged. Major retro.

**Agents active:**
- `@outbound-sales`, `@inbound-sales`
- `@orchestrator` (Month 1 retro)

**Founder time:** 2 hours (retro is deep)

**Tasks:**
- Morning: 40-80 re-engagement emails to past clients SENT (finally — now we have real substance to show)
- `@inbound-sales` ready to respond to replies
- `@orchestrator` runs Month 1 retrospective

**Deliverables:**
- Emails out
- Month 1 retrospective doc
- Phase 1 → Phase 2 plan adjustments

**Decisions:**
- Major: kill / keep / pivot per product
- Review month 1 financials
- Adjust Phase 2 plan

---

### **Day 29 — ChatBase public launch prep**

**Goal:** Tomorrow's ChatBase public launch ready.

**Agents active:**
- `@content-marketer`, `@paid-ops-marketer`, `@cto`, `@infra-engineer`

**Founder time:** 60 min

**Tasks:**
- Final launch checklist for ChatBase
- Load test
- Support templates ready
- Outbound cohort launches at smaller volume (100 emails first, not 500)

**Deliverables:**
- Launch-ready state
- First 100 outbound emails sent

**Decisions:**
- Final launch go/no-go
- Approve first 100 emails

---

### **Day 30 — ChatBase public launch**

**Goal:** Product 2 publicly launched.

**Agents active:** All — launch day

**Founder time:** 3-4 hours (launch day)

**Tasks:**
- Run `/launch-product 02-whatsapp-ai-suite`
- Product Hunt, HN, LinkedIn, X, email to waitlist
- Founder on-call for inbound all day

**Deliverables:**
- ChatBase live
- First paid customers

**Decisions:**
- Be responsive to PH/HN comments all day

**🎯 Month 1 Deliverables Check:**
- [x] All 13 agents operational
- [x] ChatBase (WhatsApp AI Suite) launched
- [x] 2-3 Claude Toolkit Skills/MCP/Agent packs live
- [x] IoT×AI prototype demo-able
- [x] New website live
- [x] Content bank of 100+ pieces
- [x] Past-client pipeline activated
- [x] Month 1 retrospective complete

---

## Phase 2: Launch (Days 31–60)

Goal: Public launches, content engine running, outbound booking calls, first enterprise pitches, real MRR.

---

### Week 5 — Launch Week Momentum (Days 31-37)

**Day 31** — ChatBase Day 1 post-launch. Respond to all inbound. Hot-fix any issues. Content: follow-up posts leveraging launch responses. First paying customers target: 1-3.

**Day 32-34** — Ride launch wave. Daily blog post + LinkedIn post + X thread responding to feedback. Outbound cohort doubled to 200. TaxPilot (GST Invoicing) research phase kicks off (Competitive analysis deep dive).

**Day 35** — Claude Toolkit expansion: Developer Productivity Skills Pack ships at $39. Launch on Dev.to + HN.

**Day 36** — ConnectOne (P05) IoT Enterprise outreach kickoff: Research 100 enterprises in smart manufacturing / cold-chain / agritech. First 25 outbound + Loom videos from founder.

**Day 37** — Week 5 review. KPI check. Topline: Should have first paid customers across ChatBase + Claude Toolkit.

---

### Week 6 — Content Engine Scale + P2 Decision (Days 38-44)

**Day 38** — Content sprint for ChatBase Week 2 (next 14 days of content). Leverage beta testimonials.

**Day 39** — TaxPilot decision point: based on validation research, commit to build OR defer. If commit: Week 6 starts TaxPilot foundation (GST compliance layer first). If defer: double down on ChatBase features based on user feedback.

**Day 40-41** — Outbound cohort 2 launches (new vertical, A/B different angle). Content engine at 30+ pieces/week.

**Day 42** — First enterprise IoT demo calls should be booking. Founder preps for first real pitch.

**Day 43** — Claude Toolkit: Device Fleet MCP shipped (hosted $79/mo).

**Day 44** — Week 6 review. Cohort performance analysis. Kill any ad set not hitting CPL target.

---

### Week 7 — Enterprise Pitch Motion + More Products (Days 45-51)

**Day 45-47** — Enterprise IoT pitch materials polished. Pitch deck v2, live demo video. Founder takes first 1-3 enterprise discovery calls.

**Day 48** — TableFlow (Restaurant OS) validation results in. Decision: build / accelerate / pivot. Resources align based on data.

**Day 49** — Claude Toolkit: Content Engine Pack ships ($79). Another revenue stream live.

**Day 50** — ChatBase feature push based on customer requests: automation improvements, CRM integrations.

**Day 51** — Week 7 review. First-month MRR analysis. First enterprise proposal in motion.

---

### Week 8 — Close Month 2 (Days 52-60)

**Day 52-54** — Enterprise discovery calls continue. `@inbound-sales` preps proposals. You close on calls. Target: 1-3 pilot contracts in pipeline.

**Day 55** — MachineGuard (Predictive Maintenance) validation. Enterprise outreach first 25 contacts. Measure response rate.

**Day 56** — Week 8 retro + major mid-phase kill/keep decisions.

**Day 57-59** — Any validated new product build starts. Continue ChatBase + Claude Toolkit expansion. Outbound cohort 3 launches.

**Day 60** — Month 2 retrospective. Full P&L check. Major decisions for Phase 3.

**🎯 Month 2 Deliverables Check:**
- [ ] 2+ products publicly launched
- [ ] First paying customers across multiple products
- [ ] 3+ enterprise IoT discovery calls complete
- [ ] Content engine at 3 pieces/day
- [ ] Target: $3k-$10k MRR
- [ ] Pipeline: $50k-$200k

---

## Phase 3: Scale (Days 61–90)

Goal: Kill losers, double down on winners, close enterprise, systemize for Month 4+.

---

### Week 9 — Brutal Triage (Days 61-67)

**Day 61** — Kill/keep rating on every product, channel, agent. Based on data. Allocate 70% of capacity to top 2 performers.

**Day 62-65** — Scale winners: build customer-requested features, repeat launch cycles, double outbound volume on winning cohorts.

**Day 66** — Productize IoT×AI enterprise offering: "Intelligence Accelerator — 8-week deployment, $45k fixed". Launch with `@outbound-sales`.

**Day 67** — Week 9 review.

---

### Week 10 — Enterprise Close + Retention Motion (Days 68-74)

**Day 68-70** — Enterprise: all warm leads get weekly touch. Contract negotiations. First enterprise signing target.

**Day 71-73** — Customer success system: `@inbound-sales` morphs into CS function. Onboarding calls, weekly check-ins, NPS for paying customers.

**Day 74** — Week 10 review. Retention metrics tracked weekly from now.

---

### Week 11 — Systemize + SaaS Feature Push (Days 75-81)

**Day 75-77** — Documentation sprint: every agent writes its own playbook. `@cto` consolidates into `operations/agent-ops-manual.md`. This becomes human-hire onboarding later.

**Day 78-80** — Big SaaS feature push for highest-revenue product. Relaunch campaign around new feature.

**Day 81** — Week 11 review.

---

### Week 12 — Close Month 3 + Year Plan (Days 82-90)

**Day 82-84** — Revenue close push. Pipeline prospects get "offer expires month end". Monthly renewal nudges.

**Day 85-87** — Month 4-12 strategic plan drafted. Goals, product roadmap, first human hires considered.

**Day 88** — Full system audit: cost, security, compliance readiness.

**Day 89** — Publish case study: "How we ran a 13-agent AI company for 90 days and hit $X MRR." Post everywhere. This is the biggest single inbound lead generator we'll have.

**Day 90** — Final retro. Celebration. Strategic plan commit.

**🎯 Day 90 Targets:**
- [ ] $25k-$75k MRR (realistic), $150k+ (stretch)
- [ ] 2-4 products live with real customers
- [ ] 1-3 enterprise contracts signed
- [ ] 100+ customers across portfolio
- [ ] New brand established
- [ ] Full ops manual documented
- [ ] Month 4-12 plan ready
- [ ] Founder: <90 min/day operational, 3-4 hours strategic
