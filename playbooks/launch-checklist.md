# Launch Checklist Playbook

Reference doc used by `/launch-product`. Run through this for every public product launch.

## T-14 days before launch

### Product readiness
- [ ] All P0 bugs fixed
- [ ] No security holes in pen-test scan
- [ ] Rate limiting in place on all public endpoints
- [ ] Rollback plan documented and tested
- [ ] Observability: Sentry + PostHog + uptime monitoring active
- [ ] Load tested to 10x expected launch-day traffic
- [ ] Backup and restore tested
- [ ] Customer-facing error messages reviewed for clarity

### Content readiness (@content-marketer)
- [ ] Product Hunt listing drafted (tagline ≤ 60 chars, description, 3-5 gallery images with captions)
- [ ] Hacker News "Show HN" draft (title + body, no-hype)
- [ ] X launch thread (5-10 tweets, founder voice)
- [ ] LinkedIn launch post (founder voice, story-first)
- [ ] Launch-day blog post on our site
- [ ] Email to existing waitlist
- [ ] Press release if enterprise-relevant
- [ ] 60-second launch video script

### Creative assets (@product-designer + @ui-builder)
- [ ] Logo and brand assets finalized
- [ ] Product screenshots (desktop + mobile)
- [ ] 60-second demo video recorded (founder voiceover)
- [ ] GIF/short demo clips for Twitter
- [ ] OpenGraph images for sharing
- [ ] Launch-specific landing page live at `/launch` or product-specific URL

### Sales readiness (@inbound-sales)
- [ ] Response templates for top 10 expected questions
- [ ] Calendar open for demo bookings (Calendly or equivalent)
- [ ] Proposal template ready (if enterprise-angle launch)
- [ ] Pricing page updated
- [ ] Support system tested end-to-end

### Paid / Email (@paid-ops-marketer)
- [ ] Launch-day ad campaigns created but paused
- [ ] Landing pages A/B variants ready
- [ ] Retargeting pixels installed
- [ ] Launch email scheduled to existing list
- [ ] Drip sequence for new signups ready

## T-7 days before launch

- [ ] Homepage updated to tease/feature launching product
- [ ] Pre-launch content begins (1-2 teaser pieces)
- [ ] Personal outreach to top 20 amplifiers (friends, past customers, influencer allies)
- [ ] 10-person pre-launch beta with specific feedback asks
- [ ] Final PR reviews on all launch assets
- [ ] `@infra-engineer` runs final load test + checks infra headroom

## T-3 days before launch

- [ ] All launch assets reviewed by `@cmo` for voice/consistency
- [ ] Waitlist gets 24-hour early access (creates urgency + early champions)
- [ ] `@inbound-sales` response playbook review with `@cto` and founder
- [ ] Crisis plan: what if X goes wrong?
- [ ] Time zones confirmed, team availability on launch day

## T-1 day before launch

- [ ] Final production smoke test
- [ ] All posts scheduled in correct time zones
- [ ] On-call rota (founder is primary)
- [ ] Paid campaigns final review (paused, ready to unpause)
- [ ] No deploys, no risky changes

## LAUNCH DAY — Timeline (adjust for your target time zone; PST shown)

### 00:01 PST
- [ ] Product Hunt: go live
- [ ] `@content-marketer` posts PH kit, founder comments as hunter/founder within 10 min

### 06:00 PST / 09:00 EST / 15:00 CET
- [ ] Hacker News "Show HN" submitted
- [ ] Founder replies to first comment within 30 min
- [ ] X launch thread goes out from founder
- [ ] LinkedIn launch post goes out from founder

### 07:00 PST
- [ ] Email blast to waitlist sent
- [ ] Newsletter mentions in any sponsored or partner newsletters go out today

### 08:00 PST
- [ ] Launch blog post publishes
- [ ] Paid ads activated
- [ ] Retargeting campaigns live

### All day
- [ ] `@inbound-sales` responds to every inbound within 15 min
- [ ] `@content-marketer` engages on PH + HN comments
- [ ] `@paid-ops-marketer` monitors campaigns hourly, adjusts
- [ ] Dev agents on standby for hotfixes
- [ ] Founder visibly active across channels (not just posting — genuinely engaging with comments)

### Afternoon check-ins
- [ ] 12pm PST: PH ranking check, adjust if dropping
- [ ] 3pm PST: HN front-page check, engagement tracker review
- [ ] 6pm PST: daily wrap — bugs? sentiment? any emerging narrative to respond to?

### Bedtime
- [ ] Thank you posts from founder
- [ ] Set tomorrow's response queue
- [ ] Log day's metrics

## T+1 (Day after launch)

- [ ] Morning: metrics review (signups, conversions, PH final rank, HN thread status)
- [ ] Follow-up content: "Thank you + here's what we learned from 24 hours"
- [ ] Respond to any remaining questions
- [ ] Dev team: any emergency fixes

## T+3 (First retrospective)

- [ ] First retrospective meeting (`@orchestrator` coordinates)
- [ ] What worked? What didn't?
- [ ] Any narrative from the launch to amplify vs correct?
- [ ] Adjust paid spend based on actual conversion data

## T+7 (Week after launch)

- [ ] Full retrospective filed to `operations/launches/{product}-{YYYY-MM-DD}-retro.md`
- [ ] Traffic + signup numbers + conversion rate + CAC + first-week revenue
- [ ] PH placement (final rank), HN peak rank, share of voice on social
- [ ] Lessons captured for next launch
- [ ] Decision: scale what worked, kill what didn't
- [ ] Playbook update: any new insight goes into this file

## Kill criteria (consider stopping launch if)

- T-3: critical bug discovered in core path
- T-3: compliance issue (legal, GDPR, sensitive data exposure)
- T-1: key dependency outage forecast for launch day
- T-0 morning: production down and can't recover in <1 hour

## Post-launch learnings template

Add to `operations/launches/{product}-{YYYY-MM-DD}-retro.md`:

```markdown
# Launch Retrospective: {product} — {date}

## Numbers
- Product Hunt rank: #N
- HN peak: #N, total upvotes: N, comments: N
- Signups first 24h: N
- Signups first 7 days: N
- Paid customers first 7 days: N
- Revenue first 7 days: $X

## What worked
- ...

## What didn't
- ...

## Surprises
- ...

## Changes for next launch
- ...
```
