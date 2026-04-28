# ProductHunt Launch — @addonweb/claude-toolkit

---

## Tagline (60 chars max)

10 production-ready Claude skills. No Anthropic key needed.

*(58 chars)*

---

## Description (260 chars)

npm install @addonweb/claude-toolkit — get 10 Claude skills across IoT firmware, GST invoicing, code review, and SQL generation. Runs on Gemini free tier. Built by the team that runs a 13-agent AI company in production.

*(221 chars)*

---

## First Comment (the real pitch — 400–600 words)

Hey PH — founder of AddonWeb Solutions here. We're a software shop out of Ahmedabad, India with 10+ years of IoT/firmware/AI work for clients across the US, Canada, Ireland, and Europe. We shipped this because we needed it ourselves.

**What it actually is**

`@addonweb/claude-toolkit` is an npm package with 10 Claude skills organized into 3 packs:

- **IoT Developer Pack (₹4,067 / ~$49):** `iot-firmware-scaffold` generates ESP32/STM32/nRF firmware skeletons with MQTT QoS1, X.509 auth, and watchdog mandatory — no malloc. `iot-device-registry-schema` outputs a TimescaleDB schema for multi-tenant device fleets with continuous aggregates and retention policies. `iot-ota-pipeline` scaffolds atomic OTA with staged rollout (1%→10%→50%→100%), signed binaries, and auto-rollback.

- **Developer Productivity Pack (₹2,407 / ~$29):** Code reviewer with OWASP scan + score 0–100. PR description generator from git diffs. Natural language to optimized SQL (flags N+1 queries and injection risks). Test suite generator for Jest, Vitest, and pytest.

- **SMB Operations Pack (₹2,407 / ~$29):** GST-compliant HTML invoice generator with CGST/SGST/IGST and HSN codes — built for Indian compliance. GST calculator that handles intra/inter-state, B2B/B2C, composition scheme, and reverse charge. Professional email drafter across 7 types and 4 tone modes.

**The thing that matters: no Anthropic API key required**

Every skill runs on Gemini (Google AI Studio) free tier. 1,500 requests/day, free. You get a Gemini key in 2 minutes at aistudio.google.com. This matters for Indian developers where Anthropic billing through Indian cards is still friction-heavy.

If you have an Anthropic key, you can use Claude. Your choice.

**Three ways to use it**

1. Node.js API — `runSkill(invoiceGenerator, { ... })` returns a typed result
2. Claude Code (MCP) — add one config block, then call skills in plain English inside Claude Code sessions
3. Our hosted marketplace at addon90days.vercel.app — buy a pack, get an API key, call skills via REST

**Why we built it**

We run our own company on 13 Claude subagents. In that process we wrote and rewrote the same skill scaffolding 4–5 times: structured prompts, Zod output schemas, retry logic, error handling. We packaged all of it. The IoT skills are genuinely hard to find — most AI toolkits are pure web dev. We have 10 years of hardware/firmware work behind those three IoT skills.

**Honest caveats**

- This is Day 15 of our 90-day build. The marketplace is live but Stripe checkout is wiring up this week.
- Skills are prompt-based — they're as good as the model you point them at. We include quality benchmarks in the README.
- Not a no-code tool. You need to be comfortable with npm and TypeScript (or JavaScript).

**Who it's for**

- Indian developers and startups who want Claude-class AI skill execution without Anthropic billing headaches
- IoT/embedded teams who want firmware scaffolding that actually follows production constraints
- Any Node.js developer who wants typed, structured AI skill outputs in 1 install

1-line start: `npm install @addonweb/claude-toolkit`

Docs and live demo: https://addon90days.vercel.app

Happy to answer specific questions about the IoT skills or the MCP server setup — that's where most of the non-obvious decisions are.
