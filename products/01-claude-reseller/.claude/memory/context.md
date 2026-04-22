# P01 · Claude Toolkit — Session Context

## Current Status
**Phase:** Pre-build  
**Day Target:** Launch Day 15 (2026-05-07)  
**Last Updated:** 2026-04-22

## What's Done
- PRD written and reviewed
- Design system complete (design-pro.html P01 section)
- .claude structure initialized

## What's Next (in order)
1. Initialize Next.js 15 monorepo at products/01-claude-reseller/app/
2. Set up TypeScript strict + ESLint + Prettier
3. Build npm package skeleton (@addonweb/claude-toolkit)
4. Implement first 3 skills: invoice-generator, code-reviewer, gst-calculator
5. Set up MCP server (stdio transport)
6. Build marketplace UI (skill browser + install flow)
7. Stripe integration (skill purchase + subscription)
8. Landing page (deploy to Vercel)
9. ProductHunt launch prep

## Key Decisions
- npm package: @addonweb/claude-toolkit
- First 10 skills: invoice-generator, code-reviewer, gst-calculator, email-drafter, data-extractor, sql-query-builder, pr-description, commit-message, test-generator, api-docs
- Pricing: $5–29 per skill, $29/mo All-Access, $99/mo Teams
- Marketplace: Next.js on Vercel, API on Railway
- Auth: Clerk

## Blockers / Open Questions
- None currently. Ready to build.

## Architecture Decisions
- Monorepo with turborepo
- Skills are pure TypeScript functions with Zod schemas
- MCP server wraps skills for Claude Code integration
- Marketplace is separate Next.js app, calls same skill API

## Session Notes
_Add notes here at the end of each work session_
