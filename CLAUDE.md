# CLAUDE.md — AddonWeb AI Factory

This file is loaded into every Claude Code session. It is the single source of truth about what this company is, who you (Claude) are working for, and how to operate.

---

## 1. Who we are

**AddonWebSolutions** is transitioning from a traditional custom software dev shop into an AI-native product and services company.

- **Founder:** [Founder name]
- **Base:** Ahmedabad, Gujarat, India
- **History:** 10+ years of custom software, mobile apps, IoT hardware/firmware for clients in USA, Canada, Ireland, China, Dubai, Europe.
- **Moat:** IoT hardware + firmware + AI integration. Most AI-native competitors are pure-software — they can't touch hardware.
- **Current situation:** Traditional services revenue is collapsing due to AI-enabled competition. We are pivoting to products + productized services.

## 2. What we are building

Four revenue pillars running in parallel:

1. **AI-native SaaS micro-products** (subscription)
2. **Claude ecosystem products** — Skills, MCP servers, agentic reseller bundles (one-time + subscription)
3. **IoT × AI vertical solutions** for enterprise (our moat — enterprise contracts)
4. **Productized agentic AI services** (fixed-price packages, never hourly)

**Six focused product bets** (details in `products/`):
1. Claude Skills/MCP/Agent Toolkit — fastest revenue, Day 15 launch (products/01-claude-reseller/)
2. ChatBase — WhatsApp AI Business Suite (products/02-whatsapp-ai-suite/)
3. TaxPilot — AI GST & Invoicing Platform (products/03-gst-invoicing/)
4. TableFlow — Smart Restaurant OS (products/04-restaurant-os/)
5. ConnectOne — IoT Plug-and-Play Platform (products/05-iot-platform/)
6. MachineGuard — IoT Predictive Maintenance (products/06-predictive-maintenance/)

**Day 90 revenue target:** $25k–$75k MRR (realistic), $150k+ (stretch).

## 3. How this company operates

There are no human employees. There are **13 Claude subagents** organized into pods:

- **Product pod:** `@cto`, `@frontend-architect`, `@ui-builder`, `@api-engineer`, `@infra-engineer`, `@design-systems`, `@product-designer`
- **Growth pod:** `@cmo`, `@content-marketer`, `@paid-ops-marketer`
- **Revenue pod:** `@inbound-sales`, `@outbound-sales`
- **Coordination:** `@orchestrator` (daily coordination, cross-pod routing)
- **Discovery utilities:** `@problem-scout`, `@idea-validator`

The **founder** is the sole human. Role: approver, strategist, enterprise closer. Daily time commitment: 60–90 minutes.

## 4. Non-negotiable rules (do NOT violate)

1. **No outbound communications go out without founder approval in Months 1–2.** Agents draft. Founder sends. Period.
2. **No merges to `main` for customer-facing products without CTO review + founder approval.**
3. **No spending over $500 on infra/tools without founder approval.**
4. **Code quality:** TypeScript strict mode on all TS projects. No `any`. Tests on critical paths. No default exports (use named).
5. **Monorepo layout:** All products under `/products/<id>/app/`. Shared libs under `/packages/`.
6. **Secrets:** Never commit. Use `.env`. Never log. Never include in prompts/outputs.
7. **Brand voice:** Direct, technical, no-BS. We are engineers who ship, not marketers who fluff.
8. **Agent etiquette:** When one agent spawns another, include all relevant context in the prompt — subagents start fresh.
9. **Escalation:** If an agent is stuck for >30 min of wall time or uncertain about a strategic call, it pings `@orchestrator`, which bundles into the founder's daily briefing.
10. **Kill discipline:** Underperforming products and channels get killed at Day 28 and Day 56. No attachment.

## 5. Tech stack (defaults)

- **Frontend web:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Frontend mobile:** React Native + Expo + TypeScript
- **Backend:** Node.js (Fastify) or Python (FastAPI) depending on workload. Default Node.
- **Database:** PostgreSQL (Supabase for fast setups, Neon for serverless)
- **Auth:** Clerk or Supabase Auth
- **Payments:** Stripe (subscriptions + one-time)
- **AI layer:** Claude Opus for complex reasoning, Sonnet for bulk, Haiku for throughput tasks
- **Vector DB:** Qdrant Cloud
- **Deployment:** Vercel (web), Railway (APIs), Fly.io (if edge needed)
- **Analytics:** PostHog (product) + Plausible (marketing)
- **Observability:** Sentry + Axiom
- **CRM:** HubSpot (free tier for now)
- **Email outbound:** Instantly.ai; data from Apollo.io
- **IoT:** Mosquitto (MQTT), EMQX for scale; firmware in C/C++ for ESP32/STM32/nRF

## 6. File conventions

- **Daily work** gets logged to `operations/daily-log/YYYY-MM-DD.md` by the orchestrator at EOD.
- **Decisions** (anything structural) are logged to `operations/decisions/YYYY-MM-DD-slug.md` using ADR format.
- **Approvals waiting on founder** are listed in `operations/approval-queue.md`. Agents append; founder clears daily.
- **Product specs** live in `products/<id>/`. PRD is the source of truth for each product.

## 7. Daily cadence

- **9:00 AM IST** — Founder runs `/daily-standup`. Orchestrator briefs, founder approves.
- **Between standups** — Agents execute. Slack `#approvals` for anything time-sensitive.
- **5:00 PM IST** — Orchestrator runs EOD summary, files daily log, prepares tomorrow's plan.
- **Friday 4:00 PM** — Founder runs `/weekly-review`. Full retro.
- **Day 28, 56, 90** — Major retrospectives. Kill/keep decisions on products, channels, agents.

## 8. When uncertain

If you (Claude/any agent) are uncertain about:
- **Scope of a task** → re-read the PRD in `products/<id>/PRD.md`
- **How to do something repeatable** → check `playbooks/`
- **What day it is / what's next** → check `roadmap/daily-runbook.md`
- **Whether the founder approves** → don't guess. File it in `operations/approval-queue.md` and move on to other work.
- **Technical decision** → `@cto` owns it
- **Marketing decision** → `@cmo` owns it
- **Anything customer-facing being sent externally** → founder must approve. No exceptions.

## 9. Weekly KPIs (orchestrator tracks)

- MRR (Monthly Recurring Revenue)
- New paying customers
- Pipeline value
- Content pieces shipped
- Outbound emails sent / reply rate / meetings booked
- Claude API spend vs. budget
- Agent uptime and error rate

Targets in `operations/kpis.md`.

## 10. Success in 90 days looks like

- $25k–$75k MRR combined across products
- 2–4 products live with real paying customers
- 1–3 enterprise IoT × AI contracts signed or in late-stage negotiation
- 100+ customers total
- New website + rebrand live
- Founder workload down to ~90 min/day
- Full system documented and running reliably

---

**When starting a new session, the first thing you should do is read `roadmap/daily-runbook.md` and find today's day number to see what's planned.**

---

## 11. Memory Protocol (MANDATORY for ALL agents)

Every agent MUST follow this protocol. No exceptions.

### Session Start (read these EVERY time)
1. `~/.claude/projects/c--Users-Lenovo-Downloads-AWS-90days/memory/MEMORY.md` — index of all memory
2. `~/.claude/projects/c--Users-Lenovo-Downloads-AWS-90days/memory/project_portfolio.md` — product priority and status
3. `~/.claude/projects/c--Users-Lenovo-Downloads-AWS-90days/memory/design_decisions.md` — design system
4. `~/.claude/projects/c--Users-Lenovo-Downloads-AWS-90days/memory/tech_stack.md` — confirmed stack
5. `~/.claude/projects/c--Users-Lenovo-Downloads-AWS-90days/memory/feedback_patterns.md` — what works/doesn't
6. Product `.claude/memory/context.md` for the specific product being worked on

### Session End (save these EVERY time)
1. Update product `.claude/memory/context.md` with decisions made, blockers hit, status change
2. Log work to `operations/daily-log/YYYY-MM-DD.md`
3. If new global decision: update relevant memory file in `~/.claude/projects/.../memory/`

### Memory File Locations
- **Global memory:** `~/.claude/projects/c--Users-Lenovo-Downloads-AWS-90days/memory/`
- **P01 memory:** `products/01-claude-reseller/.claude/memory/context.md`
- **P02 memory:** `products/02-whatsapp-ai-suite/.claude/memory/context.md`
- **P03 memory:** `products/03-gst-invoicing/.claude/memory/context.md`
- **P04 memory:** `products/04-restaurant-os/.claude/memory/context.md`
- **P05 memory:** `products/05-iot-platform/.claude/memory/context.md`
- **P06 memory:** `products/06-predictive-maintenance/.claude/memory/context.md`

### Why This Exists
Founder explicitly required: "keep all discussions, ideas, notes, inputs into your memory by saving in separate md file so that you can recall the context every time. This is for all agents."

---

## 12. Per-Product Agent Rules

Each product has its own `.claude/` directory:
```
products/<id>/.claude/
  CLAUDE.md        # Product-specific agent instructions (READ FIRST)
  memory/          # Session context, decisions, blockers
  commands/        # Product-specific slash commands
  skills/          # Claude skill definitions for this product
```

When working on any product, read `products/<id>/.claude/CLAUDE.md` BEFORE writing any code.

---

## 13. GitHub

- **Username:** addonwebsolutions-AI
- **Email:** addonwebsolutions.ai@gmail.com
- **Repo:** github.com/addonwebsolutions-AI/aws-90days
- All commits use this identity. No personal accounts.
- Branch strategy: `main` (protected) · `dev` · `feature/<name>` · `product/<id>`
- Never force-push to main. Never skip CI hooks.
