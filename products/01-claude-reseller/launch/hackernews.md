# Hacker News — Show HN Post

---

## Title

Show HN: @addonweb/claude-toolkit — 10 Claude skills as an npm package, runs on Gemini free tier

---

## Body

We're AddonWeb Solutions, a software/IoT shop out of Ahmedabad, India. We've been running our own company on 13 Claude subagents for the past 15 days and kept rewriting the same boilerplate: structured prompts, Zod output schemas, retry logic, typed results. We packaged it.

`npm install @addonweb/claude-toolkit`

**What's in it**

10 skills across 3 packs:

IoT Developer Pack: firmware scaffold (ESP32/STM32/nRF — C, no malloc, watchdog mandatory, MQTT QoS1, X.509), TimescaleDB device registry schema for multi-tenant fleets with continuous aggregates, and an OTA pipeline with staged rollout (1%→10%→50%→100%), signed binaries, and auto-rollback. These come from 10 years of actual firmware work, not prompts someone wrote after reading a datasheet.

Developer Productivity Pack: code reviewer with OWASP scan + numeric score, PR description from git diff, natural language to SQL with N+1 and injection flagging, test generator for Jest/Vitest/pytest.

SMB Operations Pack: GST-compliant HTML invoice generator (CGST/SGST/IGST, HSN codes, intra/inter-state, composition scheme, reverse charge), professional email drafter across 7 types.

**The Gemini free tier decision**

Every skill runs against Gemini (Google AI Studio) by default — 1,500 req/day, completely free. You can swap in Claude if you have an Anthropic key. We made this call specifically because Anthropic billing is still friction-heavy for Indian developers (card acceptance, INR billing, etc.). If you're outside India, you probably have an Anthropic key already and the swap is one env var.

**Three usage patterns**

```ts
// 1. Direct Node.js
import { runSkill, codeReviewer } from "@addonweb/claude-toolkit";
const result = await runSkill(codeReviewer, { code, language: "typescript", focusAreas: ["security"] });

// 2. MCP server — add to ~/.claude.json and call skills in plain English in Claude Code
// 3. REST API via our hosted marketplace (addon90days.vercel.app)
```

**What it isn't**

Not a no-code tool. You write TypeScript (or JS). Not a wrapper around the Anthropic SDK — it's a set of opinionated, production-tested skill definitions that happen to run via AI models. The skill definitions are the valuable part, not the runner.

**Honest state**

This is Day 15 of a 90-day build. The npm package is live and compiles clean under TypeScript strict mode. The marketplace is on Vercel but Stripe checkout wires up this week. The MCP server is working for stdio transport; SSE for web is still on the list.

**What we're genuinely curious about from HN**

- The IoT skills are unusual for this category. Would firmware engineers actually use LLM-generated scaffolding, or is the trust bar too high?
- The Gemini fallback decision — is this the right call for a developer tool, or does it introduce too much model inconsistency?
- We priced in INR (₹4,067 for IoT, ₹2,407 for others). Does displaying INR pricing hurt or help for a global npm package?

GitHub: https://github.com/addonwebsolutionsai-droid/addon90days
Live: https://addon90days.vercel.app
