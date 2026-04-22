# State

**Claude's single source of truth between sessions.** Read this at the start of every session. Update it at the end.

---

## Project status

**Start date:** 2026-04-22
**Current day:** 1
**Current phase:** 1 — Foundation + P01 build
**Last session:** 2026-04-22

---

## Next action

**What to do first in the next session (2026-04-23, 11:00 AM IST):**
> Continue P01 execution. Next step: Stripe checkout integration for skill pack purchases. Then /dashboard page, API route to run skills, Vercel deploy, npm publish prep. Read `products/01-claude-reseller/.claude/memory/context.md` for exact steps.

---

## In-flight (work carrying across sessions)

| Task | Owner | Status | Pointer |
|---|---|---|---|
| P01 Stripe checkout | @api-engineer + @frontend-architect | not started | `products/01-claude-reseller/app/src/app/` |
| P01 /dashboard page | @frontend-architect | not started | `products/01-claude-reseller/app/src/app/` |
| P01 API route /api/skills/run | @api-engineer | not started | `products/01-claude-reseller/app/src/app/api/` |
| P01 npm publish prep | @infra-engineer | not started | `products/01-claude-reseller/packages/toolkit/` |
| GitHub PAT rotation | founder | **URGENT** | Regenerate at github.com/settings/tokens |

---

## Products — build status

| Product | Status | Last update | Pointer |
|---|---|---|---|
| 01-claude-reseller | **building** — core done, Stripe + deploy next | 2026-04-22 | `products/01-claude-reseller/.claude/memory/context.md` |
| 02-whatsapp-ai-suite | queued (after P01 launch) | 2026-04-22 | `products/02-whatsapp-ai-suite/PRD.md` |
| 03-gst-invoicing | queued (parallel with P05) | 2026-04-22 | `products/03-gst-invoicing/PRD.md` |
| 04-restaurant-os | on hold — Day 28 kill/keep decision | 2026-04-22 | `products/04-restaurant-os/PRD.md` |
| 05-iot-platform | queued (parallel with P03) | 2026-04-22 | `products/05-iot-platform/PRD.md` |
| 06-predictive-maintenance | queued (after P05 infra ready) | 2026-04-22 | `products/06-predictive-maintenance/PRD.md` |

---

## What's built (Day 1)

### P01 — @addonweb/claude-toolkit
- 10 skills: invoice-generator, gst-calculator, email-drafter, code-reviewer, pr-description, sql-query-builder, test-generator, iot-firmware-scaffold, iot-device-registry-schema, iot-ota-pipeline
- runSkill() generic runner — Zod validation + Anthropic SDK
- MCP server (stdio) — all 10 skills exposed to Claude Code / Claude Desktop
- Next.js 15 marketplace: landing page, skills browser, Clerk auth, dark violet theme
- TypeScript strict, type-checks clean, toolkit compiles to dist/

### Repo
- GitHub: github.com/addonwebsolutions-AI/addon90days — main + dev branches live
- All 6 product .claude/ structures initialized
- Global memory in ~/.claude/projects/c--Users-Lenovo-Downloads-AWS_90days/memory/
- design-pro.html — canonical UI/UX design system

---

## Env vars needed before P01 can run

| Key | Where to get it |
|---|---|
| ANTHROPIC_API_KEY | console.anthropic.com |
| CLERK_SECRET_KEY | clerk.com dashboard |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | clerk.com dashboard |
| STRIPE_SECRET_KEY | stripe.com dashboard (test mode) |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | stripe.com dashboard |

Add all to `products/01-claude-reseller/.env.local`

---

## KPI snapshot

- **MRR:** $0
- **Paying customers:** 0
- **Active pipeline:** $0
- **Day 15 target:** P01 live on Vercel + @addonweb/claude-toolkit published to npm

---

## Last session notes

### Session: 2026-04-22

**Completed:**
- design-pro.html — full UI/UX design system
- Per-product .claude/ structure for all 6 products
- @addonweb/claude-toolkit — 10 skills, MCP server, Next.js marketplace scaffold
- GitHub pushed (addon90days, main + dev)
- Global memory files, CLAUDE.md updated with agent protocol
- Repo cleanup: ghost dirs removed, stale docs removed, .gitignore updated

**Next action (2026-04-23, 11:00 AM IST):**
P01: Stripe checkout → /dashboard → /api/skills/run → Vercel → npm publish.

**Day number at next session:** 2
