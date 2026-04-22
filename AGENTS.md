# AGENTS.md

**This file is loaded by any AI tool that respects the AGENTS.md convention** (Claude Code, Cursor, Copilot, Windsurf, Aider, etc.). It provides cross-tool context about this project.

For Claude-specific instructions, see `CLAUDE.md` in the same directory.

## Project overview

AddonWeb AI Factory is a self-running software product company powered by 13 Claude subagents. It's an organizational template + execution plan for pivoting a custom dev shop into an AI-native multi-product company.

## Build & test

We don't have a single-project build — this repo is a collection of plans, agent definitions, and documentation. Once individual products are built, each will have its own build/test setup.

Per-product conventions (when code is added):

- **Install:** `npm install --legacy-peer-deps`
- **Dev:** `npm run dev`
- **Test:** `npm test`
- **Lint:** `npm run lint`
- **Typecheck:** `npm run type-check`
- **Build:** `npm run build`

All products use TypeScript strict mode.

## Code standards (when applicable)

- TypeScript strict mode
- Named exports only (no default exports)
- Tests on all critical paths (auth, payments, data-destructive operations)
- React: functional components, hooks
- API routes: Zod validation on every boundary
- No `any` type (except at documented external boundaries)
- `npm audit` runs in CI

## Folder layout (when code is added)

```
/products/<id>/
  app/           # The actual application
  content/       # Content for this product (blog, LinkedIn, etc.)
  PRD.md         # Product Requirements Doc
/packages/       # Shared libraries across products
/operations/     # Ops files (KPIs, logs, approvals)
/playbooks/      # How-to guides
/roadmap/        # Execution plan
/.claude/agents/ # Claude Code subagent definitions
/.claude/commands/ # Claude Code slash commands
```

## Important decisions

1. **Monorepo via Turborepo** across all products
2. **Supabase/Neon** for Postgres (no self-hosting yet)
3. **Vercel** for web deploys, **Railway** for APIs
4. **Clerk** for auth (default), Supabase Auth as fallback
5. **React Native + Expo** for all mobile (including cross-platform web via react-native-web)
6. **Next.js 15 App Router** for web
7. **Tailwind + shadcn/ui** for component baseline
8. **No browser localStorage/sessionStorage in Claude-hosted artifacts** (use React state or in-memory)

## What this repo is NOT

- Not a single application — it's a meta-project containing 7 products
- Not a how-to document — it's an executable plan you run via Claude Code
- Not finished — it's a Day 0 template. Real code accrues over 90 days

## Human oversight model

This project assumes:
- One human (founder) approves strategic decisions, code merges to main, and customer-facing communications
- 13 Claude subagents execute the rest
- Human time commitment: 60-90 min/day

## For agents working in this repo

1. **Before any non-trivial task,** read:
   - `CLAUDE.md` for project memory
   - `roadmap/daily-runbook.md` for what today's priority is
   - The relevant product's `PRD.md` if working on a product

2. **If you're unsure whether your work needs human approval,** default to yes — append to `operations/approval-queue.md` and continue other work.

3. **Keep your contributions small.** Small PRs over big ones. Commit often.

4. **Never commit secrets.** `.env` is gitignored. Check your diffs.

5. **Document decisions.** Non-trivial architectural choices go in `operations/decisions/YYYY-MM-DD-slug.md`.

## Escalation

Technical questions → `@cto`
Marketing questions → `@cmo`
Strategic questions → founder (via approval queue)
Operational coordination → `@orchestrator`

## Context files priority

When multiple context files apply:
1. `CLAUDE.md` (highest priority for Claude)
2. This file (`AGENTS.md`)
3. Product-specific `PRD.md` files
4. Relevant playbooks in `playbooks/`

Explicit prompt instructions override everything.
