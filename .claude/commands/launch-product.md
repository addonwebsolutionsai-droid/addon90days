---
description: Coordinate a full public launch across Product Hunt, Hacker News, X, LinkedIn, email list, press, and paid for a product
argument-hint: [product-id] [launch-date YYYY-MM-DD]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch
---

Coordinate a public product launch: **$ARGUMENTS**

Parse:
- product-id (e.g., `01-claude-reseller`)
- launch-date (the day we go public)

Pull the standard launch checklist from `playbooks/launch-checklist.md` and execute in phases.

**T-14 days before launch**
- `@cto`: confirm build is launch-ready — no critical bugs, observability in place, scale tested, rollback ready
- `@product-designer`: final UX polish pass on onboarding (first-user experience is THE thing that matters)
- `@content-marketer`: launch-day assets drafted:
  - Product Hunt copy (tagline, description, gallery captions)
  - Hacker News "Show HN" post draft
  - X launch thread (5-8 tweets)
  - LinkedIn launch post (founder voice)
  - Launch-day blog post
  - Press release (if enterprise-relevant)
  - Email to waitlist
  - Launch video script (15-60 seconds)
- `@paid-ops-marketer`: launch-day ad campaigns queued, landing pages pointing at launch URLs
- `@inbound-sales`: prep for inbound surge — response templates ready, calendar open

**T-7 days**
- `@ui-builder`: new homepage section highlighting the launching product, gets deployed
- `@content-marketer`: pre-launch content starts — 2 teaser pieces over the week
- `@outbound-sales`: targeted pre-launch DMs to people who'd find it relevant (no pitch, "we're launching X on {date}, thought you'd want early look")
- `@infra-engineer`: runs a load test, confirms infra can handle 10x normal traffic
- Founder: personal outreach to top 20 people who'll amplify (friends, previous customers, influencer allies)

**T-3 days**
- Final asset review with `@cmo`: voice consistency, messaging clarity, CTAs alignment
- Waitlist preview — give waitlist folks 24-hour early access (creates urgency + early advocates)
- `@inbound-sales` does a full response-playbook review with @cto

**T-1 day**
- `@cto`: final smoke test of production, deploys any last fix
- `@infra-engineer`: monitoring dashboards set up, on-call rota (founder is on-call for day-of)
- `@content-marketer`: schedules all launch-day posts in correct time zones
- `@paid-ops-marketer`: budget loaded, campaigns paused ready to unpause

**LAUNCH DAY (T-0)**
Timeline (adjust for time zones):
- **00:01 PST** (12:01am California time) — Product Hunt launch goes live, `@content-marketer` posts the PH kit, founder comments as "hunter/founder"
- **6:00 PST** — Hacker News Show HN post, founder comment 30 min after
- **6:00 PST** — X launch thread from founder account
- **7:00 PST** — LinkedIn launch post from founder
- **8:00 PST / 9:00 EST** — Email to waitlist
- **9:00 PST** — Blog post publishes
- **All day** — `@inbound-sales` responds to every inbound within 15 min, `@content-marketer` engages on PH/HN comments, `@paid-ops-marketer` monitors and adjusts campaigns

Founder's role on launch day:
- Be visibly responsive on PH, HN, X, LinkedIn
- Take all demo calls that book that day
- Do NOT sleep on the reply queue

**T+1 to T+7 (ride the wave)**
- Daily: `@content-marketer` writes 1 follow-up piece per day based on what's resonating
- Daily: `@inbound-sales` weekly pipeline report becomes daily during launch week
- Daily: `@cto` + dev agents hotfix anything under load
- Day 3: first retrospective — what worked, what didn't, optimize

**T+7 post-launch review**
- Full retro filed to `operations/launches/{product}-{date}-retro.md`
- Metrics: PH placement, HN comments, traffic, signups, paying customers in week 1
- Lessons for next launch
- Decision: scale what worked, kill what didn't

**Founder touchpoints:**
- T-14: approve the launch checklist + all draft assets
- T-7: review the story one more time
- T-3: final approval on all copy
- T-0: ON — clear your calendar, no meetings except those booked that day
- T+7: read retro, decide kill/scale

Kill criteria (consider stopping launch if):
- T-3 discovery of critical bug in core path
- Compliance issue (legal, GDPR, sensitive data exposure)
- Key dependency outage forecast for launch day

Post-launch, any significant learning goes into `playbooks/launch-checklist.md` so the next launch is better.
