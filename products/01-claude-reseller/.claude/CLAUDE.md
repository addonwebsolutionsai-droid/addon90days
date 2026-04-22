# P01 · Claude Toolkit — Agent Instructions

## Product Identity
- **Name:** Claude Toolkit (Skills + MCP + Agent Bundles)
- **Accent:** Violet #8b5cf6 + Pink #ec4899
- **Priority:** #1 — SHIP FIRST (Day 15 target)
- **Status:** Pre-build → Active

## What This Product Does
npm-installable toolkit: 50+ Skills (slash commands for Claude Code), MCP servers (give Claude access to your DB/APIs/Stripe), Agent Bundles (pre-configured multi-agent stacks). Plugs into Claude Code and claude.ai in minutes.

## ICP
- Developers and small teams using Claude Code or claude.ai daily
- Want to automate tasks (invoicing, code review, data extraction) without boilerplate
- Pay $29–99/mo for genuine productivity. Will share on Twitter/HN if it works.

## Tech Stack
- TypeScript strict, named exports only, no `any`
- npm package: `@addonweb/claude-toolkit`
- MCP protocol (stdio transport for Claude Code, SSE for web)
- Anthropic SDK for Claude API calls
- Stripe for marketplace payments (individual skills $5–29, All-Access $29/mo)
- Next.js 15 for marketplace UI
- Vercel deploy

## Monorepo Paths
```
products/01-claude-reseller/
  app/                    ← Next.js marketplace + dashboard
  packages/
    toolkit/              ← @addonweb/claude-toolkit npm package
    mcp-server/           ← MCP server implementation
  skills/                 ← Individual skill definitions
  docs/                   ← Integration guides
  PRD.md
  .claude/                ← This folder
```

## Memory Protocol
- READ `.claude/memory/context.md` at session start
- WRITE decisions + status to `.claude/memory/context.md` at session end
- Global decisions → `~/.claude/projects/.../memory/project_portfolio.md`

## Agent Rules
1. All Skills MUST have: name, description, Zod input schema, Claude prompt template, unit test
2. MCP servers handle all errors gracefully — never crash Claude Code session
3. Each Claude response stays under 8000 tokens (skill output limit)
4. Pricing logic lives ONLY in `app/src/pricing/` — never duplicated
5. Skills registry is `packages/toolkit/src/registry.ts` — single source of truth
6. New skill = new branch `feature/skill-<name>` → PR → merge to dev → weekly release to main

## Launch Checklist (Day 15)
- [ ] 10 skills in marketplace
- [ ] MCP server: filesystem + PostgreSQL connectors
- [ ] Stripe checkout live
- [ ] npm publish: @addonweb/claude-toolkit@1.0.0
- [ ] Docs: 5-minute quickstart for Claude Code
- [ ] Landing page live (design-pro.html P01 section as reference)
- [ ] ProductHunt draft ready
- [ ] GitHub repo public

## Design Reference
- See `design-pro.html` section #p01
- Terminal code snippet in hero. Dark violet aesthetic. No abstract illustrations.
- Dashboard: skills list + call count + budget meter. ⌘K for all actions.

## Key Decisions Made
- First 10 skills: invoice-generator, code-reviewer, gst-calculator, email-drafter, data-extractor, sql-query-builder, pr-description, commit-message, test-generator, api-docs
- Pricing: individual skills $5–29 + All-Access $29/mo subscription
- MCP servers priority: filesystem → database → Stripe → WhatsApp
