---
description: Build a complete outbound cohort — ICP research, list building, sequence writing, ready for founder approval and launch
argument-hint: [product-id] [vertical-or-ICP-hint] [count, default=100]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch
---

Launch an outbound cohort: **$ARGUMENTS**

Parse:
- Product being sold (e.g., `02-whatsapp-ai-suite`, `05-iot-platform`)
- Vertical/ICP hint (e.g., "mid-sized builders Tier 2 Indian cities", "US smart manufacturing plants 100-500 employees")
- Count (default 100 prospects for a cohort)

**1. ICP definition (@outbound-sales + @cmo)**

Produce `operations/outbound-cohorts/{product}-{vertical}-{YYYY-MM}.md`:

- Exact titles to target
- Seniority level
- Company size (employees, revenue, or other signal)
- Industry codes (NAICS/SIC if enterprise)
- Geography
- Technology signals
- Growth/funding/hiring signals that suggest "now" is the right time
- Explicit exclusions

**2. List build (@outbound-sales via Apollo/similar)**

- Construct Apollo filter matching ICP
- Export {count} prospects with enrichment (name, title, company, email, LinkedIn, company context)
- Verify emails (via Instantly's built-in or NeverBounce) — reject bounces before sending
- Enrich each with 1-2 lines of personalization hook (recent post, recent hire, funding, tech stack, etc.)

**3. Sequence writing (@outbound-sales)**

4-email sequence over 12 days + optional LinkedIn twin track:
- **Email 1 (Day 0):** hook — 40-75 words, no link, one clear ask
- **Email 2 (Day 3):** different angle, reference specific industry pain
- **Email 3 (Day 7):** social proof / short case reference
- **Email 4 (Day 12):** breakup email — polite, low-pressure
- **LinkedIn connection request (Day 0):** short note, no pitch
- **LinkedIn DM (Day 7):** if no email reply, share relevant content
- **LinkedIn DM (Day 15):** final check-in

Follow all the writing rules in `@outbound-sales` system prompt. No banned phrases. No AI slop.

**4. Founder review (MANDATORY before any send)**

File to approval queue:
```
COHORT APPROVAL: {name}
- Product: {product}
- Prospects: {count}
- ICP summary: {1-2 lines}
- List sample: operations/outbound-cohorts/{cohort}.md (contains first 5 enriched prospects)
- Sequence: operations/outbound-cohorts/{cohort}-sequence.md
- Send start: {proposed date}
- Expected metrics: {reply rate target, meetings target}
- Approve to launch? [yes/no]
```

Founder approves or edits. Do NOT schedule until approved.

**5. Deliverability pre-check (@infra-engineer)**

Before launch:
- Confirm outbound domain warmed up (>21 days)
- Confirm SPF/DKIM/DMARC green
- Confirm inbox reputation healthy (Instantly dashboard)
- Staging test: send first 3 emails manually to your own inbox, confirm they land in inbox (not spam/promotions)

**6. Launch (@paid-ops-marketer via Instantly)**

- Set daily cap: 50 emails/day per inbox (never more)
- Launch cohort, track opens/replies/bounces daily
- Flag bounce spikes (>2%) immediately — pause cohort, investigate

**7. Reply management (@outbound-sales → @inbound-sales)**

- Positive replies → hand off to `@inbound-sales` within 1 hour for calendar link + call prep
- Negative replies → acknowledge politely, add to suppression list
- Out-of-office / wrong-person replies → re-route, update CRM
- Hostile replies → log, suppress, do not re-engage

**8. Tracking dashboard**

Update `operations/outbound-cohorts/{cohort}-metrics.md` daily with:
- Sent
- Opens
- Replies (positive/negative/neutral)
- Meetings booked
- Bounces
- Unsubscribes
- Effective reply rate and meeting rate

**9. Weekly report**

Part of the Friday outbound report. If cohort hits kill criteria (reply rate too low, bounce rate too high), stop and write a postmortem.

Budget discipline: if a cohort of 100 returns <3 replies after full sequence, we have an ICP or sequence problem — don't scale, diagnose.
