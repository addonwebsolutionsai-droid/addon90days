# Social Auto-Marketing

**How we run daily social media across 4-5 platforms without a human doing it full-time.**

Owner agent: `@paid-ops-marketer` coordinates, `@content-marketer` produces, founder approves in Phase 1.

---

## The goal

A consistent, on-brand social presence across LinkedIn, X/Twitter, YouTube, and (selectively) Instagram, with 90% automation after Month 2.

Daily output at steady state:
- LinkedIn (founder): 1 post/weekday = 5/week
- LinkedIn (company): 3 posts/week
- X (founder): 3-5 posts/day
- X (company): 1-2 posts/day + retweets
- YouTube: 1 video/week
- Instagram (if activated): 3 posts + 3 stories/week

Total: ~40 pieces of content per week.

---

## Tech stack for automation

| Platform | Primary tool | Purpose | Cost |
|---|---|---|---|
| All platforms | Buffer or Publer | Scheduling | $30-60/mo |
| LinkedIn | Taplio (optional premium) | LinkedIn-specific scheduling + analytics | $49/mo |
| X/Twitter | Typefully | Thread drafting + scheduling | $12/mo |
| YouTube | YouTube Studio native | Publishing, thumbnails | Free |
| Instagram | Buffer | Scheduling | (included) |
| Analytics | Native + PostHog + our dashboard | Tracking | Free + our cost |

`@infra-engineer` evaluates tools in Week 1, picks one primary scheduler, standardizes on it.

---

## The content pipeline (end-to-end)

### Stage 1: Strategic input (weekly, Monday)
`@cmo` produces the weekly marketing plan (lives in `operations/marketing-plans/`). Includes:
- Theme for the week
- Content pillars to emphasize
- Key launches / announcements coming up
- Any reactive topics (news, industry events)

### Stage 2: Production (Monday-Tuesday)
`@content-marketer` produces the week's full content bank (~40 pieces).
- LinkedIn posts: 8 (5 founder + 3 company)
- X posts: 20+ (founder) + 10 (company)
- X threads: 2-3 (founder)
- YouTube script: 1 (founder records midweek)
- Instagram captions: 3-6

All drafts saved to `products/00-addonweb/content/YYYY-Www/`.

### Stage 3: Review (Tuesday afternoon)
`@cmo` reviews bank for voice, pillar fit, accuracy.
Founder reviews a sample (first 4 weeks: all founder-voiced posts; after that: spot-check and any sensitive ones).

### Stage 4: Asset creation (Tuesday-Wednesday)
`@product-designer` briefs for any visual assets needed (covered in detail in `visual-assets.md`):
- LinkedIn carousel slides
- X thread visual (diagram, screenshot)
- YouTube thumbnail
- Instagram post visuals

### Stage 5: Scheduling (Wednesday)
`@paid-ops-marketer` schedules everything into Buffer/Publer:
- Respects platform-optimal times (per analytics data once we have history)
- Staggers to avoid duplicate-content flags
- Links to right UTM-tagged URLs
- Adds hashtags per platform norms

### Stage 6: Engagement (daily throughout week)
Published posts need engagement — this is NOT fully automatable. Pattern:
- **First 30 min after publish:** founder responds to any early comments (drives algorithm)
- **First 2 hours:** `@content-marketer` monitors, drafts reply suggestions; founder approves and sends
- **After 2 hours:** founder responds within reasonable time (1-2 per day)

**Rule:** we never auto-reply to comments. Humans-only for replies.

### Stage 7: Analytics review (Friday)
`@paid-ops-marketer` pulls per-post metrics, correlates with content type/theme:
- Which posts got most engagement?
- Which posts drove clicks to our site?
- Which drove newsletter signups?
- Kill formats that don't perform.

Weekly report goes into `operations/marketing-reports/YYYY-Www.md`.

---

## Per-platform specifics

### LinkedIn

**Founder account (primary channel for B2B):**
- 1 post/weekday, published 8:30-9:30 AM IST (catches India + Europe + early US)
- Formats rotate:
  - Monday: insight/contrarian take
  - Tuesday: specific story (customer, project, failure)
  - Wednesday: teardown/how-to (mini-tutorial)
  - Thursday: portfolio update (what we shipped)
  - Friday: lighter — reflection, announcement, question
- Length: 900-1300 chars (per brand voice doc)
- 1 visual per post (screenshot, diagram, or simple quote card)
- No more than 1 emoji

**Company page:**
- 3 posts/week
- More product-focused, less founder-voice
- Each product launch gets dedicated moment

**Engagement strategy:**
- Founder comments on 5-10 other people's posts/day (industry peers, customers, prospects)
- Genuine — no "great post!" garbage
- Share others' content when genuinely valuable with our commentary
- DM response SLA: 24h for warm, same-day for hot prospects

**Paid:**
- Starting Day 45: $50/day test campaigns
- Promote our best-performing organic posts (LinkedIn's boost feature)
- Targeted sponsored content for product launches

### X/Twitter

**Founder account (primary dev/ecosystem channel):**
- 3-5 posts/day, spread across morning/afternoon
- Mix: 40% technical (building in public), 30% replies/engagement, 20% commentary, 10% personal/lighter
- Threads: 2-3/week, each 5-12 tweets
- Use images liberally (screenshots, diagrams)

**Company account:**
- 1-2 posts/day
- Retweets founder's technical content with company commentary
- Automated product changelog tweets
- Customer/user-generated content amplification

**Engagement:**
- Reply to relevant conversations daily (AI/IoT/Claude ecosystem)
- Quote-tweet thoughtful takes with our own commentary
- DM outreach for genuine connections (not sales — connections)

### YouTube

**Cadence:** 1 video/week, released Tuesdays or Thursdays (algorithm-friendly).

**Format mix:**
- Weeks 1-2: setup demos ("building our AI company dashboard")
- Weeks 3-6: product demos (each product gets a launch video)
- Weeks 7+: deep technical content, behind-the-scenes, case study breakdowns

**Production pipeline:**
- `@content-marketer` writes script
- Founder records (15-30 min session — no studio needed; good mic + clean background)
- We edit via Descript (AI-assisted editing — cuts fillers, generates captions, creates clips)
- `@product-designer` makes thumbnail (human-tested: A/B thumbnail generation)
- Publish + cross-post: LinkedIn, X, blog

**SEO:**
- Title and first 100 chars of description matter most
- Full transcript in description (helps discovery)
- Chapters on every video
- End screens linking to related videos

### Instagram (optional, activate only if product warrants)

**Activate for:** fitness marketplace (P5) and potentially marketing SaaS (P6).

**Skip for:** parent brand + B2B products (LinkedIn + X are better ROI).

If activated:
- 3 feed posts + 3 stories per week
- Reels 1-2x/week (can repurpose YouTube Shorts content)
- Visual-first: screenshots, product moments, behind-the-scenes
- Brand hashtags + 5-10 relevant per post

### Threads / Bluesky / Mastodon

Not activated in Phase 1-3. Revisit if ecosystem shifts.

---

## Brand-voice enforcement on social

Social is where voice drift happens most. Guard against it:

- Every post checked against `operations/brand-voice.md` banned phrase list
- Founder-voiced posts must sound like founder (first 4 weeks: founder approves every one, learns the voice in the process)
- Company-voiced posts are more neutral but still direct, not corporate

Banned on social (even stricter than elsewhere):
- "We're excited to announce..." (use "Shipped:")
- "Drop a 🔥 in comments if..."
- "Like this post if..."
- Bait-and-switch threads ("you won't believe #7")
- "In my opinion" as a constant filler
- Multiple exclamation marks

---

## Cross-posting rules

Don't copy-paste across platforms. Each platform has its rhythm.
- A LinkedIn post IS NOT a good X post (usually too long for X)
- An X thread CAN become a LinkedIn post IF condensed
- A blog post spawns 2-3 LinkedIn posts + 1-2 X threads + 3-4 X standalones

`@content-marketer` handles cross-format adaptation — never just pastes.

---

## Dealing with negative engagement

- **Constructive criticism:** thank, acknowledge, share what we'll do about it
- **Trolls:** ignore (do NOT engage — algorithm rewards engagement regardless of sentiment)
- **False claims about us:** founder responds personally with facts, no emotion
- **Competitor attacks:** respond with specifics + links to evidence; never emotional
- **Angry customer publicly:** move to DM immediately with a "reaching out privately to fix this"

---

## Tracking "social to pipeline"

PostHog + UTM tagging lets us track:
- Clicks from social → landing pages → signups → paying customers

Every shared link has UTM parameters:
- `utm_source`: linkedin / twitter / youtube / etc.
- `utm_medium`: social
- `utm_campaign`: which campaign or content theme
- `utm_content`: which specific post (for A/B)

Monthly: `@paid-ops-marketer` reports social → pipeline attribution. Double down on channels that actually drive revenue, not just vanity metrics.

---

## Automation: what's automatic, what's human

| Task | Automated | Human |
|---|---|---|
| Content drafting | Yes (@content-marketer) | Founder reviews in Phase 1 |
| Visual assets | Mostly (AI image gen with brand brief) | Designer review |
| Scheduling | Yes (via Buffer/Publer) | — |
| Posting | Yes | — |
| First comment responses | No | Founder-only |
| DM responses | No | Founder-only, or @inbound-sales for product questions |
| Analytics reporting | Yes | Founder + CMO review |
| Competitor watch | Yes (weekly @cmo report) | — |
| Strategic pivots | — | Founder + CMO |

After Month 2, if error rate on drafts is low, agents may auto-send:
- Company-voiced posts (scheduled, not posted same-day)
- Standard changelog tweets
- Standard product updates

Founder-voiced posts ALWAYS stay human-approved. That voice is the brand asset.

---

## When to kill a platform

Kill criteria (run at Day 56 retro):
- <100 followers gained in 60 days despite consistent posting
- <1% engagement rate on last 30 posts
- 0 pipeline attribution in 60 days
- Disproportionate time burn vs. results

If a platform hits kill criteria, archive and reallocate that content effort to winners.
