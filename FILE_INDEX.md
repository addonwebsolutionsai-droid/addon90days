# File Index

Every file in this project, with what it's for.

## Root

- `README.md` — project overview, navigation
- `GETTING_STARTED.md` — Day 0 setup steps (start here)
- `EXECUTE.md` — **lean Claude session entry point** (use this to open every session cheaply — reads state, selective-loads, does work, updates state)
- `CLAUDE.md` — loaded by Claude Code every session (project memory)
- `AGENTS.md` — universal agent brief (for Claude Code, Cursor, Copilot, etc.)
- `DESIGN_STANDARDS.md` — quality bar for frontend, backend, visuals (enforced on every PR)
- `.gitignore` — what git ignores
- `FILE_INDEX.md` — this file

## `.claude/agents/` — The 15 subagents

Every agent is a markdown file with YAML frontmatter. Claude Code auto-discovers them.

- `orchestrator.md` — coordinates all other agents, runs daily standups
- `cto.md` — technical architecture, code review, escalations
- `frontend-architect.md` — complex React Native + Next.js application architecture
- `ui-builder.md` — landing pages, marketing sites, auth flows, conversion surfaces
- `api-engineer.md` — backend APIs, databases, Stripe, business logic
- `infra-engineer.md` — deployment, CI/CD, MCP servers, observability, firmware pipelines
- `design-systems.md` — design tokens, Tailwind configs, component specs (6 products)
- `product-designer.md` — wireframes, user flows, UX decisions (text-based)
- `cmo.md` — brand, positioning, content strategy, competitive intel
- `content-marketer.md` — writes all content (blog, social, YouTube, email)
- `paid-ops-marketer.md` — ads, email sequences, CRO, analytics
- `inbound-sales.md` — responds to leads, proposals, onboarding, CS
- `outbound-sales.md` — cold outreach, prospect research, demo booking
- `problem-scout.md` — discovers unmet problems from Reddit/HN/reviews
- `idea-validator.md` — validates product ideas with fake-door tests

## `.claude/commands/` — Slash commands

Invoked with `/command-name` in Claude Code sessions.

- `daily-standup.md` — run every morning, orchestrator briefs founder
- `problem-scan.md` — deep problem discovery for a vertical
- `ideate.md` — generate + score product ideas from scanned problems
- `validate-idea.md` — full validation stack on a specific idea
- `ship-feature.md` — PRD → design → build → test → deploy
- `content-sprint.md` — generate N days of content for a product
- `outbound-cohort.md` — build a targeted outbound cohort
- `launch-product.md` — coordinated public launch
- `weekly-review.md` — Friday retrospective
- `approve.md` — walk through the approval queue

## `products/` — Product briefs

Each product has a directory with its PRD and (eventually) its code.

- `01-claude-reseller/PRD.md` — Claude Skills/MCP/Agent Toolkit (fastest revenue, Day 15 launch)
- `02-whatsapp-ai-suite/PRD.md` — ChatBase: WhatsApp AI Business Suite
- `03-gst-invoicing/PRD.md` — TaxPilot: AI GST & Invoicing Platform
- `04-restaurant-os/PRD.md` — TableFlow: Smart Restaurant OS
- `05-iot-platform/PRD.md` — ConnectOne: IoT Plug-and-Play Platform (our moat)
- `06-predictive-maintenance/PRD.md` — MachineGuard: IoT Predictive Maintenance

## `roadmap/`

- `00-overview.md` — strategic arc of 90 days
- `daily-runbook.md` — day-by-day 1-90 execution plan (THE execution file)

## `rebrand/` — Parent brand rebrand plan

AddonWebSolutions.com + marketing + social + content + visuals.

- `README.md` — rebrand mission, phases, metrics, owners
- `website.md` — website rebrand plan (addonwebsolutions.com)
- `marketing.md` — parent-brand marketing strategy, channels, content pillars
- `social-auto-marketing.md` — social media automation stack + cadence
- `content-strategy.md` — parent-brand content calendar + flagship pieces
- `visual-assets.md` — banner/post/video design pipeline

## `inspiration/` — YOUR manual-fill space

Drop references here; agents read before design/rebrand work.

- `README.md` — how to use this space
- `websites.md` — website designs you like
- `brands.md` — brand identities you admire  
- `product-design.md` — app/product UI inspiration
- `content.md` — writing styles you admire
- `videos.md` — video styles, YouTube channels, ads
- `approved-ai-refs/` — folder for AI image-gen reference images (drop image files here)

## `playbooks/`

How-to guides that agents reference for repeatable workflows.

- `launch-checklist.md` — used by `/launch-product`
- `problem-discovery.md` — used by `@problem-scout`
- `content-engine.md` — how to run the 30-piece/week content machine
- `outbound-sales.md` — how `@outbound-sales` runs the cold motion
- `customer-interview-script.md` — how to run validation interviews

## `operations/`

The operational state of the company.

- `kpis.md` — the numbers that matter, updated weekly
- `approval-queue.md` — items awaiting founder sign-off
- `brand-voice.md` — the house style
- `decisions/README.md` — ADR format + index of decisions
- `daily-log/README.md` — how daily logs are kept

Additional sub-folders get created as agents work (not pre-created):
- `operations/daily-log/YYYY-MM-DD.md` — one file per day (orchestrator writes)
- `operations/weekly-reviews/YYYY-Www.md` — Friday retros
- `operations/problem-radar/` — problem-scout reports
- `operations/ideation/` — brainstorm outputs
- `operations/validation/` — idea validation reports
- `operations/marketing-plans/` — weekly plans from @cmo
- `operations/sales-reports/` — weekly reports from sales agents
- `operations/marketing-reports/` — weekly reports from paid-ops
- `operations/outbound-cohorts/` — cohort definitions + metrics
- `operations/audits/` — CTO audits, financial reviews
- `operations/launches/` — launch retrospectives
- `operations/approval-log/` — history of approvals
- `operations/feature-requests.md` — tracked over time
- `operations/seo-keywords.md` — keyword research

## How to navigate

**If you're the founder on Day 0:** read `GETTING_STARTED.md` → `README.md` → `CLAUDE.md` → `roadmap/00-overview.md` → `roadmap/daily-runbook.md` Day 1.

**If you're an agent starting work:** read `CLAUDE.md` → your own agent .md file → the relevant product's `PRD.md` → any relevant `playbooks/` file.

**If you want to understand the day-by-day plan:** go straight to `roadmap/daily-runbook.md`.

**If something breaks or feels wrong:** check `operations/kpis.md` for current state, `operations/daily-log/` for recent history, `operations/decisions/` for why things are the way they are.
