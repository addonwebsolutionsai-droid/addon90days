# Content Engine Playbook

How we produce 30+ pieces of on-voice, on-brand content per week without a human writer.

## The goal

Consistent, high-quality content output across all 6 products + parent brand that:
- Matches our house voice (direct, technical, honest)
- Ties to a measurable business outcome (leads, brand, SEO, community)
- Ships at volume without burning out review cycles

## The 3-Ship-Rule

Every piece of content must satisfy ALL three before shipping:

1. **Ties to a content pillar.** If you can't name which pillar, don't ship it.
2. **Has a specific reader in mind.** Not "marketers" — "a VP of Engineering evaluating IoT platforms."
3. **Earns the reader's time in 15 seconds.** If the first 50 words don't land, it won't matter what you said in the middle.

## Content pillar hierarchy

### Parent brand (AddonWebSolutions)
Pillars for the company itself:
- **Behind the scenes** — how we run as an AI-native company (unique angle, very shareable)
- **Technical deep-dives** — IoT, Claude, MCP, agent architecture — real engineering
- **Portfolio updates** — what we shipped, what we learned
- **Category commentary** — what's happening in IoT × AI, what we think

### Per-product pillars (see each PRD)

Each of the 6 products has its own pillar set in its PRD. Example — ChatBase:
- Field realities (WhatsApp chaos for SMBs)
- Numbers that matter (sales lost to slow/missed replies)
- Before/after (customer automation stories)
- Product updates

## Voice discipline

Re-read `operations/brand-voice.md` every week. Specifically:

**We sound like:** an engineer who has built the thing and is showing their work, not a marketer selling.

**Banned phrases — auto-reject if found:**
- "In today's fast-paced world"
- "leverage", "synergize", "unlock", "elevate", "transform"
- "game-changer", "revolutionary", "next-gen"
- "seamless", "robust", "cutting-edge"
- "At the end of the day"
- "Imagine a world where..."

**Banned patterns:**
- Stock-photo-of-people-pointing-at-laptop metaphors
- "Per studies/research suggest" without citing the study
- Made-up statistics ("85% of companies waste...")
- Generic listicles ("10 ways to...")

## Format specs (ship-ready)

### Blog post

- **Length:** 700-1500 words. 600 is thin. 2000+ is padded.
- **Structure:** hook (2-3 sentences) → thesis (one sentence) → 3-5 subheads → CTA
- **Subheads:** specific claims, not category labels. "Why offline-first is harder than you think" beats "Technical Considerations."
- **Code blocks, screenshots, or concrete examples:** at least one per post, ideally in every subhead
- **Internal links:** 2-3 to other blog posts
- **External links:** 1-2 to authoritative sources
- **Meta:** title (60 chars), meta description (155 chars), featured image, OG tags

### LinkedIn post

- **Length:** 900-1300 chars. Below 700 gets lost; above 1500 truncates.
- **Format:** first line must earn the "see more" click — specific claim, number, or contrarian statement
- **Structure:** hook → context → specific story/evidence → takeaway → CTA or question
- **Line breaks:** short paragraphs. Mobile-first.
- **No more than 1 emoji.** None is fine. Two reads as noise.

### X thread

- **Tweet 1 (hook):** the one that earns the follow. Specific claim, number, or "here's what nobody tells you about X" framing
- **Tweets 2-N:** one idea per tweet. No filler.
- **Visuals:** 1-2 visuals in the thread — code snippet, screenshot, or simple diagram
- **Final tweet:** specific CTA (link to blog, newsletter signup, follow-up question)

### Email newsletter (weekly)

- **Subject line:** 30-50 chars, specific outcome or number, lowercase acceptable
- **Preview text:** different from subject, makes the open-case
- **Opening:** one personal or observational sentence, not a generic greeting
- **Main story:** ~200 words — the one thing worth talking about this week
- **Three links:** new content / community highlight / something we read this week (not competitors)
- **CTA:** one primary, below everything else

### YouTube script

- **0:00-0:15:** the hook — specific claim or demo teaser that earns the continue
- **0:15-0:30:** what you'll learn (3 bullets, verbal)
- **0:30-1:30:** context / why now
- **1:30-end:** main content in chapters with on-screen timestamps
- **CTA:** specific, relevant, below the fold

Video length sweet spot: 8-15 min for educational/deep-dive, 3-5 min for demos/product updates.

## Per-week target (Phase 2 onwards)

| Format | Per week | Who writes | Who reviews |
|---|---|---|---|
| Blog post | 3 | @content-marketer | @cmo |
| LinkedIn post | 10 | @content-marketer | Founder (first 4 weeks) |
| X post / thread | 15 | @content-marketer | @cmo |
| YouTube script | 1 | @content-marketer | Founder |
| Email newsletter | 1 | @content-marketer | @cmo |
| Landing page copy | On request | @content-marketer | @cmo |

Weekly total: ~30 pieces. Pushed hard during launches.

## Review cycle

- **Draft → `@cmo` review**: voice, pillar tie, accuracy. Response: ship / edit / reject.
- **Founder approval**: first 4 weeks, everything in founder voice needs approval. After Week 4, only these need founder sign-off:
  - Any public comment on a competitor by name
  - Any claim about revenue or growth numbers
  - Any press/podcast outreach pitches
  - Anything taking a strong political or controversial stance

## SEO integration

Every blog post ties to a primary keyword from `operations/seo-keywords.md`. Research cadence:
- Monthly: `@paid-ops-marketer` refreshes keyword opportunity list per product vertical
- Quarterly: audit top 5 ranked terms, see if content needs update

Keyword research is NOT "pick a keyword and stuff the post." It's "here's a search query with commercial intent, our post needs to answer it better than the current top 3 results."

## Repurposing rules

Content doesn't live once. Every blog post spawns:
- 2-3 LinkedIn posts (extracting key insights as standalone pieces)
- 1-2 X threads (breaking down the argument)
- 1 email mention
- 1-3 visual quote cards for social
- Potentially: 1 podcast outline, 1 video script

Ratio: 1 hour writing blog post = 3 hours of derivative content. Budget accordingly.

## Kill criteria

A piece of content gets pulled if:
- Factually wrong (immediate fix or take-down)
- Voice-off beyond repair on review
- Competitive intel error (saying something wrong about a competitor opens legal exposure)
- Dated / no longer accurate

Learn from kills. Update this playbook if a pattern emerges.

## Measurement

Every piece gets tagged with:
- Product (which PRD/vertical)
- Pillar (which pillar it serves)
- Funnel stage (top / middle / bottom)
- Primary goal (traffic / leads / community / SEO)

Monthly review: what pillars / formats / topics actually drove business outcomes? Double down on winners. Kill losers.

The content engine isn't about volume — it's about cumulative compound. In 90 days we'll have 300+ pieces. The right 20 of those will be 80% of our traffic + leads forever.
