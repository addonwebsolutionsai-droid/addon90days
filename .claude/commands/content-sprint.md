---
description: Generate a full content bank for a product over N days, coordinated across blog, social, video, email
argument-hint: [product-id] [num-days, default=14]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch
---

Run a content sprint: **$ARGUMENTS**

Parse:
- First token = product-id (e.g., `02-whatsapp-ai-suite`)
- Second token = number of days (default: 14)

Process:

**1. Strategy (@cmo)**
- Read `products/{product-id}/PRD.md` for positioning, ICP, problem space
- Read latest `operations/problem-radar/` reports for the vertical
- Read any existing content calendar in `operations/marketing-plans/`
- Produce a sprint theme — one sentence capturing the story we're telling
- Define 3-4 content pillars for this sprint
- Set targets: N blog posts, N LinkedIn posts, N X threads, N YouTube scripts, N emails

**2. SEO research (@content-marketer + @paid-ops-marketer)**
- Pull top 20 search queries in the space from Google/keyword tools
- Identify 3-5 that we can realistically rank for + have commercial intent
- Map each blog post to a primary keyword
- Save to `operations/seo-keywords.md` under the product section

**3. Content production (@content-marketer leads, in parallel)**

For each content type, produce the full content bank:

- **Blog posts** (1 post per 3-4 days): full drafts following the blog template. Save to `products/{product-id}/content/blog/YYYY-MM-DD-{slug}.md`. Status: `needs-review`.
- **LinkedIn posts** (1 per weekday): drafts saved to `products/{product-id}/content/linkedin/YYYY-MM-DD.md`. Rotate formats (contrarian / story / breakdown).
- **X threads** (1-2 per weekday): drafts saved to `products/{product-id}/content/x/YYYY-MM-DD-{slug}.md`.
- **YouTube scripts** (1 per week): full scripts with timestamps, saved to `products/{product-id}/content/youtube/YYYY-MM-DD-{slug}.md`.
- **Email newsletter** (1 per week if applicable): saved to `products/{product-id}/content/email/YYYY-MM-DD.md`.

**4. Asset briefs (@product-designer)**
- For each blog post and YouTube script: brief any needed illustration, screenshot, or diagram
- Save briefs to `products/{product-id}/content/assets-needed.md`
- Flag any asset that needs founder input (photos, testimonial quotes)

**5. Review and scheduling (@cmo + founder)**
- `@cmo` does a content review pass — voice consistency, accuracy, tie to pillars
- Flags to founder via approval queue: "Content bank ready for {product} ({N} pieces). Review: {link to index file}."
- On approval, `@paid-ops-marketer` schedules:
  - Blog posts publish on staggered days
  - LinkedIn posts via Buffer/native scheduler
  - X threads via Typefully or native
  - Emails via Resend
  - YouTube scripts go to founder for recording (we don't fake the voice)

**6. Index and tracking**
Produce `products/{product-id}/content/SPRINT-{YYYY-MM-DD}.md`:

```markdown
# Content Sprint: {product} — {start date to end date}

## Theme
{one sentence}

## Pillars
1. ...
2. ...
3. ...

## Content calendar
| Date | Type | Title/Topic | Status | URL (post-publish) |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Assets needed
- {list}

## SEO targets
- {keyword}: target URL, current rank

## Success metrics
- Traffic: target N visits across pieces
- Signups attributed: target N
- Engagement: target avg >X on LinkedIn
```

Founder's decision points:
- Before production: approve theme + pillars
- After production, before scheduling: approve full bank
- After sprint ends (within the sprint + 7 days): review results at next `/weekly-review`

Timebox: content should be produced in 2 working days. Scheduling happens on day 3. Publishing starts day 4+.
