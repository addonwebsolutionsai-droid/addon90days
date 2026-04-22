# Content Strategy — AddonWeb Parent Brand

**The parent brand's content plan.** Individual products have their own content (see each product's PRD + `products/<id>/content/`); this file is about the umbrella brand.

Complements `rebrand/social-auto-marketing.md` (execution side) and `playbooks/content-engine.md` (how-to).

---

## The north-star content question

Every piece must answer: **"Why would a CTO, technical founder, or IoT-enterprise buyer share this with their team?"**

If it's not shareable with that audience, it's probably too generic.

---

## Content pillars (parent brand)

### Pillar 1: Behind-the-scenes of running an AI-first company (40% of output)

**The irreplaceable angle.** Almost nobody else writes this authentically.

Topic examples:
- "Cost per agent-hour: what our Claude API spend looks like"
- "The 3 agents we killed and why"
- "What founder approval looks like when you have 13 agents"
- "Our weekly review process: how 15 agents report to one human"
- "The agent we tried to replace our CTO with (it didn't work)"
- "Outbound email sequences written by AI vs. humans: our A/B results"
- "The product we built for $400 in API costs, launched in 14 days, made $8K first month"

**Rules:**
- Include specific numbers, never vague
- Honest about failures — readers smell BS instantly
- Include decision logic ("we chose X over Y because Z")
- Include what we'd do differently

### Pillar 2: Technical deep-dives (25%)

Real engineering content. No "5 tips to…" listicles.

Topic examples:
- "Building an MCP server for IoT device fleets: architecture choices"
- "Why we chose EMQX over Mosquitto for 100K+ devices"
- "Firmware OTA without bricking devices: our post-mortem + new approach"
- "Claude agent handoff patterns: what works, what doesn't"
- "Offline-first mobile sync: three approaches and why we picked the ugly one"
- "21 CFR Part 11 in a modern web stack: a playbook"

**Rules:**
- Code snippets or architectural diagrams in every post
- Comparison with alternatives the reader might consider
- Honest about trade-offs
- Link to our open-source work where applicable

### Pillar 3: Portfolio & shipped-in-public (20%)

Public moments of progress.

Content types:
- Product launch posts
- Feature announcements
- Customer milestones (anonymized if needed)
- Monthly "what we shipped" roundups
- Public changelog highlights
- Open-source releases

**Rules:**
- Include screenshots, numbers, or demos
- Keep announcements short + visual
- Always tie back to a reader action (try it, follow updates, etc.)

### Pillar 4: Category commentary (15%)

Our opinions on where the industry is going.

Topic examples:
- "What Claude Opus 5 means for agentic architectures" (when it drops)
- "The mid-market pharma QMS gap"
- "Why pure-software AI consultancies will struggle with IoT"
- "The coming wipe-out of traditional custom dev shops"
- "What happens to Upwork when agents can do 80% of listed jobs"

**Rules:**
- Take a position, don't hedge ("might" and "could" used sparingly)
- Back with data or first-hand experience
- Engage with counter-positions fairly

---

## Content calendar structure

### Daily (weekdays)
- 1 founder LinkedIn post
- 3-5 founder X posts
- Occasional engagement/reply-posts

### Weekly
- 2-3 blog posts
- 1 YouTube video
- 1 email newsletter (Tuesday)
- 2-3 LinkedIn company page posts
- 1-2 X threads from founder

### Monthly
- 1 flagship long-form piece (case study, teardown, year-in-review-style)
- 1 podcast appearance (from Month 2 onwards)

### Quarterly
- 1 research/data-driven report ("State of X" type content)
- Open-source release (template, skill pack, MCP server)

---

## Formats we use

### Blog post (our primary owned content)
- Length: 700-1500 words
- Structure: hook → thesis → 3-5 subheads with specific evidence → CTA
- On our site at addonwebsolutions.com/writing
- Minimum: 1 screenshot or diagram per post
- See `playbooks/content-engine.md` for full spec

### LinkedIn post (900-1300 chars)
- Three rotating formats:
  1. Contrarian insight
  2. Specific story (Tuesday call with a customer)
  3. Honest breakdown (numbers + lessons)
- See `playbooks/content-engine.md` for templates

### X thread
- First tweet = the hook
- 3-12 tweets, one idea each
- End with specific CTA
- Visual in tweet 1 or 2 (diagram, screenshot, code)

### Newsletter
- Subject: specific outcome or number, 30-50 chars
- One story (~200 words) + 3 links + one CTA
- Sent Tuesday 9am IST
- Unsubscribe link prominent — optimize for retention not growth

### YouTube video
- 8-15 min for educational/deep-dive, 3-5 min for product demos
- Founder-voiced
- Always has: hook (0-15s), what-you'll-learn (15-30s), main content, CTA
- Chapters in description

### Case study
- For `/work` page on site
- ~500-800 words + visuals
- Structure: context → challenge → approach → outcome → lessons
- Always with customer permission; anonymize where needed

---

## Flagship pieces planned

Specific high-effort content that anchors the narrative over 90 days:

### Day 30-ish — "Rebuilding AddonWeb: the bet"
**What:** The founding story of the pivot. Why we're doing this. What we expect to fail at.
**Distribution:** Blog + LinkedIn (condensed) + X thread + newsletter mention.
**Why:** Sets the narrative arc for the next 60 days of content.

### Day 45 — "30 days into the AI company experiment: what's working"
**What:** First transparent report. Revenue (real numbers), agents performance, lessons, honest misses.
**Distribution:** Blog long-form + X thread + LinkedIn + HN submission
**Why:** Builds credibility. People love watching work-in-progress founders.

### Day 75 — "How we built {winning product} in {N} days with {M} humans"
**What:** Deep technical + business breakdown of the product that's working best.
**Distribution:** Blog + YouTube video walkthrough + X thread + LinkedIn
**Why:** Product marketing + thought leadership merged.

### Day 89 — "90 days running a 13-agent AI company"
**The flagship piece.** Complete report:
- Every product's outcome
- Revenue, costs, unit economics
- Agent-by-agent performance
- Mistakes + lessons
- What we're doing in the next 90
- "If you want to do this yourself, here's our template" (P7 call-to-action)
**Distribution:** Blog + HN front page + X thread (expect viral) + LinkedIn + podcast pitches off the back of it
**Why:** This one piece likely drives more inbound leads than any other marketing we do over these 90 days.

---

## SEO strategy

### Keyword categories we're targeting

**High-competition, long-tail approach:**
- "IoT AI integration agency" (+ geo variants)
- "Claude agent development services"
- "MCP server development"
- "Enterprise IoT platform white label"
- "Agentic AI company examples" (ranking for curious buyers)

**Easy wins (long-tail):**
- "Claude skills for {specific use case}"
- "MCP server for {specific integration}"
- "IoT {specific industry} platform"
- "WhatsApp business automation India" (ChatBase specific)
- "GST invoicing software India" (TaxPilot specific)
- "Restaurant management software India" (TableFlow specific)

**Brand-building (build authority):**
- "How to run an AI-powered company"
- "Claude agent architecture patterns"
- "Multi-agent systems examples"

### Technical SEO
- Schema markup on every post (Article, Organization, Product)
- Internal link graph (every post links to 2-3 others)
- External links to authoritative sources
- Meta title 60 chars, meta description 155 chars, OG image custom per post
- Core Web Vitals all green

### Content update cadence
- Quarterly: review top-20 ranked posts, update stale info
- Annually: major rewrites where content no longer matches product

---

## Content repurposing flowchart

Each blog post → multiple derivative formats:

```
Blog post (1500 words)
├── LinkedIn post #1 (contrarian insight from body)
├── LinkedIn post #2 (specific story from post)
├── X thread (main argument)
├── X post #1, #2, #3 (standalone insights)
├── Newsletter mention (feature in that week's newsletter)
├── Visual quote cards for social (2-3)
└── (If big enough) Video script + YouTube video
```

One blog post = 8-10 derivative pieces spread across 2-3 weeks. We don't publish and move on — we milk every good piece.

---

## Measurement

`@paid-ops-marketer` tracks per-post performance in `operations/content-metrics/`. Key metrics:

### Discovery metrics
- Impressions / views
- Engagement rate (likes + comments / impressions)
- Click-through rate to site

### Outcome metrics
- Visits to site
- Newsletter signups attributed
- Pipeline value attributed
- Customers attributed (long-term)

### Quality signals
- Saves (LinkedIn save rate)
- Shares
- Comments that are substantive (not "great post!")
- DMs generated

### Review cadence
- Weekly: top 5 posts + bottom 5 posts (learn from both)
- Monthly: pillar performance (which pillar is winning?)
- Quarterly: kill/double-down decisions on formats

---

## Ideas backlog

Maintain `operations/content-backlog.md` with rolling list of ideas. `@content-marketer` and `@cmo` add to it throughout the week; producer pulls from it.

Backlog sources:
- Questions customers ask in support
- Questions prospects ask on sales calls
- Reddit/HN/X questions we see
- Our own internal decisions/debates
- Competitor content we could do better
- Problem radar scans (from `@problem-scout`)

---

## When to escalate to founder

- Any content that names a specific competitor negatively
- Any content making claims about our revenue/growth numbers
- Any content that's a strong opinion ("why X is dying")
- Any content that includes specific customer details (NDA check)
- Any content that might go viral (founder should be on-standby for engagement)
