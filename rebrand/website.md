# Website Rebrand — addonwebsolutions.com

**The parent brand website. Owns the AI-native product studio story.**

---

## Current site audit (do this first)

`@cmo` runs an audit of the current `addonwebsolutions.com`:
- Pages currently live
- Current SEO footprint (what's ranking, for what keywords)
- Current traffic patterns (if GA/Plausible available)
- What's working visually / verbally
- What's actively hurting us (outdated claims, weak conversion, slow pages)

Save audit to `operations/audits/website-current-state.md`.

---

## New site architecture

### Top-level navigation
- **Products** — hub for all 6 products
- **IoT × AI** — our enterprise moat landing page (separate from Products for enterprise buyers)
- **Work** — case studies (past IoT + early product customers)
- **Writing** — blog + newsletter signup
- **Company** — team (small intentionally), story, contact
- **Login** (if we're gating anything internally) — else skip

### Page-by-page plan

#### Home `/`
- **Hero:** one-liner positioning + short story + primary CTA (explore products or book IoT demo)
- **What we build:** 4-pillar grid (SaaS micro-products / Claude ecosystem / IoT × AI enterprise / productized services)
- **Featured products:** 3 live products with status (live / beta / coming)
- **IoT × AI specialization:** separate callout for enterprise buyers
- **How we work:** "13-agent AI company" story (differentiator)
- **Writing preview:** 3-4 recent blog posts
- **Footer:** full sitemap, social links, newsletter signup

#### Products hub `/products`
- Grid of all 6 products with:
  - Name + one-liner
  - Status badge (live / beta / coming)
  - Primary target customer
  - CTA to product-specific landing page

Each product gets its own site/subdomain (per product PRD):
- Claude Toolkit: toolkit.addonwebsolutions.com
- ChatBase: chatbase.in or chatbase.addonwebsolutions.com
- TaxPilot: taxpilot.addonwebsolutions.com
- TableFlow: tableflow.addonwebsolutions.com
- ConnectOne: connectone.addonwebsolutions.com
- MachineGuard: machineguard.addonwebsolutions.com

The parent site lists + links; doesn't duplicate product-site content.

#### IoT × AI enterprise `/iot-ai`
- For CTOs/VPs Engineering at mid-market enterprises
- Hero: "Production IoT × AI deployments in weeks, not quarters"
- Our stack: EMQX/MQTT, Claude agents, firmware expertise, mobile apps
- Case studies (anonymized if needed)
- Our enterprise offering: "Intelligence Accelerator — 8-week fixed-price deployment, $45k"
- CTA: book a discovery call (founder's calendar)

#### Work `/work`
- Past IoT project case studies (anonymized as needed)
- Early product customer wins (once Phase 2 has real customers)
- Filter by: industry / technology / outcome

#### Writing `/writing`
- Blog feed (newest first)
- Categories: AI Engineering / IoT / Product Building / Behind the Scenes
- Newsletter signup prominent
- Individual post page: full content + related posts

#### Company `/about`
- Short story (2-3 paragraphs)
- Founder profile (one person, honest, technical)
- How we work (the 13-agent AI company angle — this is a page-level story, not buried)
- Contact options
- Intentionally NOT a "team" page with fake employees — transparency wins

---

## Visual direction

Defer final direction to `@product-designer` after reviewing `inspiration/websites.md` and `inspiration/brands.md`.

Starting direction (before inspiration overrides):

- **Color palette:** neutral-first (near-black, warm greys, off-white). One accent (dark teal? electric blue? — decide post-inspiration review). No gradients.
- **Typography:** one confident serif for display (e.g., Instrument Serif, Fraunces), one clean grotesque for body (Inter or similar). Mono for code.
- **Layout:** generous whitespace. No card-everywhere patterns. Content-first hierarchy.
- **Imagery:** real product screenshots > illustrations. Founder's face > stock. Diagrams > decorative imagery.
- **Motion:** minimal. One or two subtle transitions per page. Nothing that distracts from reading.

---

## Technical stack

- Next.js 15 App Router
- Tailwind CSS + shadcn/ui baseline
- MDX for blog (content in repo, version-controlled)
- Plausible + PostHog
- Deploy to Vercel
- OpenGraph + meta tags on every page
- RSS feed for blog

---

## Content needed (coordinate with @content-marketer)

- Hero copy + positioning statement
- 7 product one-liners
- IoT × AI enterprise page copy (~800 words)
- 3-5 case studies (~500 words each) for `/work`
- About page (~600 words)
- 6-8 initial blog posts (to populate `/writing` at launch)
- 4 OG images (home, products hub, IoT/AI, writing)

---

## SEO targets (focus keywords for parent brand)

Primary targets — ranked over Phase 2 and 3:
- "IoT AI integration agency"
- "IoT software development India"
- "Claude agent development"
- "MCP server development"
- "Enterprise IoT platform"
- "Industrial IoT AI"

Secondary (long-tail, easier to rank):
- "IoT platform white label"
- "ESP32 firmware development services"
- "Agentic AI development"
- "{specific-industry} IoT AI" per our case studies

---

## Build plan (mapped to runbook Days 25-26)

### Day 25: Design + draft
- `@product-designer` reviews current site + inspiration refs + design standards
- Produces text-based wireframes for all pages
- `@content-marketer` drafts copy for all pages per wireframes
- `@design-systems` confirms tokens for parent brand
- Founder reviews direction end of day

### Day 26: Build + deploy
- `@ui-builder` builds all pages per spec
- `@infra-engineer` deploys to Vercel, sets up domain, configures analytics
- `@cto` reviews performance (Lighthouse, bundle size)
- Founder approves go-live
- Site goes live; 301s set from any removed legacy pages

### Day 27-30: Iterate based on first-week data
- Monitor first visitor behavior in PostHog
- Fix any conversion leaks
- Add more case studies as they become available

---

## Approval checkpoints

Founder signs off before these steps proceed:
- [ ] Final positioning statement
- [ ] Visual direction (color, type, layout)
- [ ] All page copy
- [ ] Site go-live
- [ ] Any substantial copy change post-launch

---

## Anti-patterns to reject

- "We help companies leverage AI"
- Stock photos of people pointing at laptops
- "Trusted by 1000+ companies" without names
- Gradients covering 50%+ of page
- Mouse-over-reveal animations that hide content from keyboard users
- Contact form with 10 fields
- Auto-play video in hero
- Chatbot widget (unless it's a product feature)

---

## After launch — continuous improvement

Website becomes a living thing:
- `@content-marketer`: 3 new blog posts per week
- `@ui-builder`: add new product cards as products launch
- `@paid-ops-marketer`: monthly conversion rate optimization review
- `@cto`: quarterly performance audit

No website redesign for at least 12 months post-launch unless data demands it.
