# PRD: Claude Ecosystem Reseller Bundle (P7)

**Product ID:** 01-claude-reseller
**Working name:** AddonWeb Toolkit for Claude
**Owner agent:** @infra-engineer (MCP servers), @cto (architecture), @content-marketer (distribution)
**Pillar:** Claude ecosystem products (Pillar 2) — fastest time to first revenue
**Pricing target:** $29–$99 one-time bundles + $19–$79/mo for hosted MCP services
**Status:** SHIP FIRST. Fastest path to revenue. Phase 1 target (Days 15-30).

---

## 1. Problem

Claude's ecosystem (Skills, MCP servers, agents) is expanding rapidly. Developers and non-developers alike need specialized tools. Right now:

- **Quality MCP servers are scarce** — most published ones are proof-of-concept
- **Skills are early** — some exist, curated collections for specific verticals don't
- **Agents for specific workflows** are mostly DIY — nobody has pre-built agent packs for common use cases
- **Dev tooling to build Claude ecosystem products** is underdeveloped — starter kits, deployment, distribution

We sit at the intersection of hardware/software/AI expertise. We can ship quality Claude ecosystem products faster than 90% of competitors, and **we have direct knowledge of the Claude ecosystem from daily use.**

## 2. Solution

Three product families within this pillar:

### Family A: Skill Packs (one-time purchase)
Curated collections of Skills for specific verticals. Each pack has 5-15 high-quality skills with documentation and examples.
- **Developer Productivity Pack** — code review, refactoring, documentation, security audit skills
- **IoT Developer Pack** — skills for firmware scaffolding, device provisioning, telemetry schema design
- **Content Creator Pack** — blog post outlining, SEO research, social media variants, newsletter drafting
- **Research Analyst Pack** — market research, competitive analysis, financial modeling, report generation
- **SMB Operations Pack** — invoice generation, meeting summaries, email triage, CRM updates

### Family B: MCP Servers (hosted subscription)
Production-ready MCP servers that let Claude interact with specific systems:
- **Device Fleet MCP** — manage IoT device fleets via Claude ("show me devices offline in Chennai plant")
- **E-commerce Ops MCP** — connects to Shopify/WooCommerce for inventory/orders queries
- **Indian Business Stack MCP** — GST portal queries, RERA lookups, MCA data (unique regional value)
- **Project Management MCP** — bridges Linear/Jira/Asana into Claude
- **Analytics MCP** — queries across PostHog, GA, Mixpanel in natural language

### Family C: Agent Packs (one-time + services)
Pre-built agent teams for specific business workflows:
- **AI Company in a Box** — the 13-agent starter kit (similar to what we ship for AddonWeb itself) for other founders to build on
- **Content Engine Pack** — CMO + content writers + SEO + social media agent bundle
- **Support Desk Pack** — tier-1 support agents that handle common customer queries
- **Recruitment Pack** — sourcer + screener + scheduler agents for small teams

Plus documentation, Quick Start guides, and video tutorials for each.

## 3. Target customer

**Developers and technical founders** who are:
- Already using Claude/Claude Code daily
- Building AI-powered products, features, or internal tools
- Want production-quality building blocks, not POCs
- Willing to pay $29-$99 for a quality skill pack vs. building from scratch
- Willing to pay $19-$79/month for reliable hosted MCP

**Non-developer founders** who want to:
- Stand up an agent team for their business without building the infrastructure
- Leverage Claude for specific workflows (content, support, ops)
- Follow a documented playbook rather than invent from scratch

## 4. Positioning

**For** developers and technical founders building with Claude, **AddonWeb Toolkit for Claude** is a **collection of production-ready Skills, MCP servers, and agent packs built by practitioners who run a 13-agent AI company themselves** — unlike the scattered, experimental tools in the Claude ecosystem today, **our bundles are tested in real production use and come with full documentation, examples, and support**.

The "eat our own dog food" angle is the key differentiator: everything we sell, we use ourselves.

## 5. Core v1 deliverables (ship in Phase 1)

### Ship in Week 3-4 (Day 15-28):

**Skill Pack 1: IoT Developer Pack** ($49 one-time)
Skills in the pack:
- `iot-firmware-scaffold` — generates ESP32/STM32/nRF project skeleton with chosen connectivity (MQTT/HTTP/BLE)
- `iot-device-registry-schema` — generates DB schema for device/user/telemetry relationships
- `iot-ota-pipeline` — sets up OTA firmware update infra
- `iot-telemetry-parser` — parses and categorizes various telemetry formats
- `iot-provisioning-flow` — generates QR-code + BLE provisioning flow code

Package: GitHub repo + README + examples + SKILL.md files in correct format.

**MCP Server 1: Indian Business Stack MCP** ($29/mo hosted)
A hosted MCP that lets Claude query:
- GSTIN lookup
- PAN verification (via authorized APIs)
- Company Master Data (MCA)
- EPFO basic info (for compliance checks)
Unique regional value. Underserved in current ecosystem.

**Agent Pack 1: AI Company Starter** ($99 one-time + optional $49/mo support)
A distilled version of THIS repo — the 13-agent factory — genericized for other founders to adapt to their business. Includes documentation on how to customize agents, the 90-day runbook template, playbooks.

### Ship in Week 5-7 (Day 30-50):

**MCP Server 2: Device Fleet MCP** ($79/mo hosted — connects to our ConnectOne P05 platform)
**Skill Pack 2: Developer Productivity Pack** ($39 one-time)
**MCP Server 3: E-commerce Ops MCP** ($49/mo hosted)

### Ship in Week 8-12 (Day 50-90):

**Agent Pack 2: Content Engine Pack** ($79 one-time)
**Skill Pack 3: SMB Operations Pack** ($49 one-time)
**Agent Pack 3: Support Desk Pack** ($129 one-time + optional $79/mo support)

## 6. Non-goals

- Competing with Anthropic's own first-party offerings
- Building a full marketplace (distribute via GitHub + dedicated sales page, Anthropic marketplace when appropriate)
- Custom one-off consulting (offer it, but separately; this product is self-serve bundles)
- Re-implementing existing quality OSS (if someone already built a great MCP server for X, promote theirs)

## 7. Technical approach

- **Skills:** follow Claude Skills format (SKILL.md with YAML frontmatter), packaged as GitHub releases with README, examples
- **MCP Servers:** TypeScript (Node runtime), deployed to Railway/Fly, hosted per-customer or shared-tenant depending on product
- **Agent Packs:** markdown files matching Claude Code's `.claude/agents/` format, distributed as a GitHub repo with setup script
- **Distribution:**
  - Free/paid via GitHub Releases + a simple Lemon Squeezy / Stripe Checkout flow
  - Documentation site built with Docusaurus or Astro Starlight
  - MCP hosted versions deployed per customer on subdomains
- **Support:** GitHub Issues for bugs, Discord for community, paid support via email for paying customers
- **Updates:** version each product, changelog, users get lifetime updates on one-time purchases

## 8. Pricing philosophy

**One-time Skill Packs / Agent Packs:** $29-$129 with lifetime updates
**Hosted MCP services:** $19-$79/month with usage-based overages

Why one-time for Skills: they're reference material, users deploy locally, we can't easily enforce subscription. Hosted MCPs make sense as subscription because we run infra.

Lifetime updates = trust builder. Users pay once, get better-with-time product.

Bundle deals:
- "All Skills Packs" bundle: $149 (save $50 vs individual)
- "IoT Developer Complete" bundle (Skills + Device Fleet MCP + 3 months free): $199

## 9. GTM

**Very distinct from other products — all developer/technical channels:**

- **Primary:** Developer Twitter/X, Hacker News, Dev.to, Hackernoon
- **Secondary:** LinkedIn (for founder / agent pack buyers), YouTube (demos of each product)
- **Community:** Discord for AddonWeb Toolkit users, weekly office hours, show real usage
- **Content flywheel:** every blog post about "how we built X" drops a Skills Pack or references an MCP server
- **Open source adjacent:** some Skills open-sourced on GitHub, paid packs bundle premium extensions
- **Anthropic community:** engage in the official ecosystem channels (respectful, not spammy)

## 10. Risks

1. **Anthropic ships our products as first-party** — always a risk in an ecosystem. Mitigation: diversify (hardware-specific products they won't ship, regional products, vertical-specific packs).
2. **Pricing floor collapses as market matures** — skills becoming commodity. Mitigation: keep building new packs, own a few niches deeply (IoT, Indian business, agent patterns).
3. **Support burden on hosted MCPs** — hosted = responsibility. Mitigation: great observability, status page, aggressive SLOs, transparency on incidents.
4. **Quality perception** — if one pack is bad, reputation for all suffers. Mitigation: every pack is genuinely production-tested (we use them for AddonWeb's own work), no shovelware.
5. **Distribution discovery** — users don't find us. Mitigation: content flywheel + community + SEO + affiliate program for influencer promotion.

## 11. Build plan (fastest path in all 6 products)

This is Phase 1's first revenue product. Ship Day 15-30:

**Days 15-18 (parallel with other Phase 1 work):**
- IoT Developer Skills Pack drafted in `products/01-claude-reseller/packs/iot-developer/`
- Each skill tested against a sample project
- README + examples per skill
- Package as GitHub release

**Days 19-22:**
- Indian Business Stack MCP — API integrations to GSTIN, PAN, MCA (research + build)
- Deploy to Railway with per-customer auth
- Documentation site scaffolded

**Days 23-26:**
- AI Company Starter — take this repo, genericize, publish as template
- Add setup script, quick-start doc
- Record demo video

**Days 27-30:**
- Landing page for all three products at toolkit.addonwebsolutions.com
- Lemon Squeezy / Stripe checkout
- Launch on HN (Show HN: AI Company Starter), Dev.to, Twitter
- First paying customers this week

Each follow-up pack is 3-5 days of work, so we can ship one product every 1-2 weeks throughout Phase 2.

## 12. Validation

This pillar needs less traditional validation than other products because:
- Low build cost (we're packaging existing expertise)
- Low ongoing cost (Skills are static files, MCP servers are cheap to host)
- Distribution cost is low (we have content pipeline via other products)

Instead of heavy validation, we use **ship-and-measure**: launch each pack, measure conversion, kill ones that don't move. The IoT Developer Pack ships first because it's closest to our genuine expertise.
