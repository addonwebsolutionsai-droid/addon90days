# AddonWeb AI Factory

**A self-running software product company powered by Claude Code subagents.**

> Building 6 SaaS products in public — from a dying custom dev shop to a multi-product AI-native company.
>
> Live: [addon90days.vercel.app](https://addon90days.vercel.app) · Status: Day 7 of 90 · 130 skills shipped · Free during beta until 10K users.

This repository contains the entire stack: 15 specialist subagent definitions, slash commands, product PRDs, 90-day runbook, cloud-routine prompts, and the Next.js codebase that ships every day. Built in public — fork it, study it, copy it.

## What's in this repo

```
addonweb-ai-factory/
├── README.md              # You are here
├── GETTING_STARTED.md     # Day 0 setup — start here after reading this
├── EXECUTE.md             # Lean Claude session entry point (use every session)
├── CLAUDE.md              # Project memory loaded into every Claude Code session
├── AGENTS.md              # Universal agent brief (for other AI tools too)
├── DESIGN_STANDARDS.md    # Quality bar for FE, BE, visuals
│
├── .claude/
│   ├── agents/            # 15 specialist subagents (invoke via @agent-name)
│   └── commands/          # Slash commands for repeatable workflows
│
├── products/              # PRDs for all 7 products
├── roadmap/               # 90-day execution plan + day-by-day runbook
├── playbooks/             # How-to guides agents reference
├── operations/            # KPIs, state, approval queue, logs, decisions
├── rebrand/               # Parent-brand rebrand: website, marketing, social, content, visuals
└── inspiration/           # YOUR manual-fill space — drop references here
```

## How it works (plain English)

1. You open a terminal in this folder and run `claude`.
2. Claude Code reads `CLAUDE.md` and immediately knows: the company, the products, the roadmap, the rules.
3. **Every session opens by reading `EXECUTE.md`** — a lean protocol that checks `operations/state.md`, figures out what day we're on and what's in-flight, and loads only the files needed for today's work (not the whole repo — saves tokens).
4. You type a slash command like `/daily-standup` or `/problem-scan` or simply `@cto audit our current state`.
5. The right subagent picks up the work in its own isolated context, produces output, files it in the right folder, and reports back.
6. You approve/reject in your daily 60–90 minute block. Agents keep running.
7. At session end, state is saved back to `operations/state.md` so tomorrow picks up exactly where today left off.

## The 13 agents at a glance

| Agent | Job | Invoked by |
|---|---|---|
| `@orchestrator` | Daily standups, routes work between agents, produces your briefing | You, daily |
| `@cto` | Tech decisions, architecture, code review, escalations | All dev agents |
| `@frontend-architect` | React/React Native/Next.js app architecture | CTO |
| `@ui-builder` | Builds landing pages, marketing sites, auth flows | CTO |
| `@api-engineer` | Backend APIs, databases, auth, Stripe, business logic | CTO |
| `@infra-engineer` | Deployment, CI/CD, Claude/MCP integrations, observability | CTO |
| `@design-systems` | Design tokens, component specs, style guide | Product designer |
| `@product-designer` | Wireframes, hi-fi mockups, UX flows | CTO/CMO |
| `@cmo` | Brand, positioning, content calendar, competitive intel | You |
| `@content-marketer` | Blog/LinkedIn/X/YouTube scripts, SEO | CMO |
| `@paid-ops-marketer` | Ads, email sequences, landing pages, analytics | CMO |
| `@inbound-sales` | Lead response, proposals, CS, onboarding | You |
| `@outbound-sales` | Cold outreach, prospect research, demo booking | You |

Plus two utility agents for the discovery phase:
- `@problem-scout` — scans Reddit/HN/Twitter/review sites for unmet pain
- `@idea-validator` — validates ideas with fake-door tests and keyword research

## Core slash commands

- `/daily-standup` — run at 9am, every day
- `/problem-scan [vertical]` — discover trending problems in a niche
- `/ideate` — generate product ideas from scanned problems
- `/validate-idea [idea-name]` — run validation on a specific idea
- `/ship-feature [product] [feature]` — full build cycle: spec → design → code → ship
- `/content-sprint [product] [days]` — generate a content bank
- `/outbound-cohort [vertical] [count]` — research and draft outbound sequence
- `/launch-product [product]` — coordinated public launch (PH + HN + social + email)
- `/weekly-review` — Friday retro: what shipped, what blocked, what's next

## How to use this (5 sentences)

1. Read `GETTING_STARTED.md`, install Claude Code, drop this whole folder into your dev workspace.
2. **Before Day 1, fill in at least `inspiration/websites.md` and `inspiration/brands.md`** — without your references, designs default to generic. Even 2-3 entries per file matter.
3. Run `claude` inside the folder. Type `/daily-standup` and press enter. Approve what the agents propose.
4. Do that every weekday for 90 days. The roadmap in `roadmap/daily-runbook.md` tells you exactly what happens each day.
5. When sessions drag or burn tokens, switch to `EXECUTE.md` protocol — it reads `operations/state.md` and only loads what's needed.

## Key files you'll touch as founder

- `operations/state.md` — the cross-session memory; glance at it before each session
- `operations/approval-queue.md` — your daily decisions
- `inspiration/*.md` — drop references here whenever you see something good
- `operations/kpis.md` — your weekly scorecard
- `rebrand/` — the parent-brand rebrand plan (website, marketing, social, content, visuals)

## Ground rules (non-negotiable)

- You approve all outbound comms in Month 1. Agents draft, you send.
- You approve all code merges to `main` for customer-facing products.
- Monthly Claude API burn cap: $5,000. Orchestrator throttles at 80% of cap.
- Kill bad ideas by Day 28 and Day 56 (the two major retros). No sunk-cost attachment.
- Your IoT × firmware expertise is the moat. Every enterprise deal leans on it.
