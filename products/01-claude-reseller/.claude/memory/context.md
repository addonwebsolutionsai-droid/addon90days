# P01 · Claude Toolkit — Session Context

## Current Status
**Phase:** Active Build — Core toolkit + marketplace scaffold complete
**Day Target:** Launch Day 15 (2026-05-07)
**Last Updated:** 2026-04-22

## What's Done
- PRD written and reviewed
- Design system complete (design-pro.html P01 section)
- .claude structure initialized
- **Monorepo scaffold complete** (Turborepo, root package.json, tsconfig.base.json)
- **`@addonweb/claude-toolkit` package built and compiles** (`packages/toolkit/`)
  - 10 skills implemented, type-checked, and compiled to `dist/`:
    1. `invoice-generator` — GST-compliant HTML invoice (Haiku, business)
    2. `gst-calculator` — CGST/SGST/IGST calculation engine (Haiku, finance)
    3. `email-drafter` — Professional email for any context (Haiku, business)
    4. `code-reviewer` — Deep code review with security scan (Sonnet, developer)
    5. `pr-description` — PR descriptions from git diffs (Haiku, developer)
    6. `sql-query-builder` — NL to SQL with schema awareness (Haiku, developer)
    7. `test-generator` — Test suites from source code (Sonnet, developer)
    8. `iot-firmware-scaffold` — ESP32/STM32 firmware project (Sonnet, iot) — $49
    9. `iot-device-registry-schema` — TimescaleDB IoT schema (Sonnet, iot) — $49
    10. `iot-ota-pipeline` — Atomic OTA with rollback + CI/CD (Sonnet, iot) — $49
  - `runSkill()` generic runner in `packages/toolkit/src/utils/runner.ts`
  - SKILL_PACKS registry: IoT Developer ($49), Developer Productivity ($29), SMB Operations ($29)
- **MCP server scaffold** (`packages/mcp-server/`) — stdio transport, all 10 skills exposed
- **Next.js 15 marketplace app scaffold** (`app/`) — type-checks clean
  - Landing page with stats, 3 skill pack cards
  - Skills browser with category filter tabs
  - Clerk auth middleware (protects /dashboard)
  - Dark violet theme, shadcn-compatible components

## What's Next (in order)
1. Install @modelcontextprotocol/sdk and verify MCP server builds
2. Update marketplace UI to show all 10 skills (currently 6 hardcoded)
3. Stripe checkout integration — skill pack purchase flow
4. `/dashboard` page — purchased skills list, API key, usage meter
5. API route (`app/src/app/api/skills/run/route.ts`) — POST to run any skill
6. npm publish prep: README, CHANGELOG, .npmignore
7. Landing page copy polish + deploy to Vercel
8. ProductHunt launch assets

## Key Decisions
- npm package: `@addonweb/claude-toolkit` (ESM, NodeNext module resolution)
- Monorepo: npm workspaces + Turborepo (workspace: protocol NOT used — plain `*` for local deps)
- Skills are pure TypeScript with Zod schemas — no runtime deps except @anthropic-ai/sdk + zod
- MCP server: stdio transport (Claude Code) — SSE for web TBD
- Pricing: IoT pack $49, Dev pack $29, SMB pack $29, All-Access $29/mo subscription
- Marketplace auth: Clerk v5
- Payments: Stripe (not wired yet)

## Architecture
```
packages/toolkit/src/
  types/skill.ts          ← SkillDefinition, SkillResult, SkillMeta interfaces
  utils/runner.ts         ← runSkill() — Anthropic API call + Zod parse
  skills/*.ts             ← 10 skills (each exports named const)
  index.ts                ← re-exports all skills + SKILL_PACKS registry

packages/mcp-server/src/
  server.ts               ← stdio MCP server, lists + calls all 10 skills

app/src/
  app/page.tsx            ← Landing page
  app/skills/page.tsx     ← Skills browser (filter by category)
  components/skill-card.tsx
  components/ui/button.tsx, badge.tsx
  lib/utils.ts            ← cn() helper
  middleware.ts           ← Clerk auth (protects /dashboard)
```

## Env Vars Needed
- ANTHROPIC_API_KEY — for skill execution
- CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — auth
- STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — payments

## Session Notes
2026-04-22: Built complete core — 10 skills, MCP server, Next.js marketplace.
All TypeScript strict, type-check clean, toolkit compiles to dist/.
Next session: Stripe checkout, API routes, dashboard page, then Vercel deploy.
