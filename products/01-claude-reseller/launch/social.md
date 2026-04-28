# Social Launch Posts — @addonweb/claude-toolkit

---

## X / Twitter Thread (9 tweets)

---

**Tweet 1 — Hook**

We run our company on 13 Claude subagents. Every time we added a new AI skill, we rewrote the same 80 lines: prompt structure, Zod schema, retry logic, typed result.

We packaged all of it.

npm install @addonweb/claude-toolkit

Thread on what's in it and why we built the IoT skills:

---

**Tweet 2 — The free tier angle**

First: you don't need an Anthropic API key.

Every skill in the toolkit runs on Gemini (Google AI Studio free tier). 1,500 requests/day, no credit card.

This matters if you're an Indian developer — Anthropic's billing has been friction-heavy with INR and domestic cards.

One env var swap if you have Claude access.

---

**Tweet 3 — IoT Developer Pack**

The skills most npm packages don't have:

IoT Developer Pack (₹4,067):

- iot-firmware-scaffold — ESP32/STM32/nRF skeleton. No malloc. Watchdog mandatory. MQTT QoS1. X.509 auth. C output.
- iot-device-registry-schema — TimescaleDB schema for multi-tenant device fleets, retention policies, continuous aggregates
- iot-ota-pipeline — Staged rollout: 1%→10%→50%→100%. Signed binaries. Auto-rollback.

These come from 10 years of actual firmware work.

---

**Tweet 4 — Developer Productivity Pack**

Developer Productivity Pack (₹2,407):

- code-reviewer: OWASP scan + numeric score 0–100
- pr-description: structured PR descriptions from git diffs
- sql-query-builder: natural language → optimized SQL, flags N+1 and injection
- test-generator: Jest/Vitest/pytest suites from source

All return typed, Zod-validated results. No string parsing.

---

**Tweet 5 — SMB Operations Pack**

SMB Operations Pack (₹2,407) — built for Indian compliance:

- invoice-generator: GST-compliant HTML invoices. CGST/SGST/IGST, HSN codes, UPI QR placeholder.
- gst-calculator: intra/inter-state, B2B/B2C, composition scheme, reverse charge
- email-drafter: 7 email types, 4 tone modes

If you've ever had to explain HSN codes to a generic AI tool, you'll understand why we built this.

---

**Tweet 6 — Three ways to use it**

Three ways to run these skills:

1. Node.js:
import { runSkill, invoiceGenerator } from "@addonweb/claude-toolkit"
const result = await runSkill(invoiceGenerator, { ... })

2. Claude Code (MCP):
Add one block to ~/.claude.json → call skills in plain English

3. REST API via our hosted marketplace — buy a pack, get an API key

---

**Tweet 7 — What's honest**

What this is not:

- Not a no-code tool. You write TypeScript or JS.
- Not a wrapper around the Anthropic SDK.
- Not an agent framework.

It's opinionated skill definitions with Zod output schemas that run via whatever model you point at them.

The skill definitions are the product. The runner is 40 lines.

---

**Tweet 8 — Who built it**

We're AddonWeb Solutions — Ahmedabad, India. 10+ years building IoT hardware/firmware/software for clients in the US, Canada, Ireland, Europe.

We're 15 days into turning the company from custom services into AI-native products.

This is product #1 of 6.

---

**Tweet 9 — CTA**

1-line install:
npm install @addonweb/claude-toolkit

Docs + live marketplace: https://addon90days.vercel.app
GitHub: https://github.com/addonwebsolutionsai-droid/addon90days

If you use it, tell us which skill actually saved you time. That's the data we need.

---

---

## LinkedIn Post

AddonWeb Solutions just shipped its first npm package.

`@addonweb/claude-toolkit` — 10 production-ready Claude skills across IoT firmware, code review, GST invoicing, SQL generation, and test generation. One install. No Anthropic API key required.

Here is the part that matters for Indian developers: every skill runs on the Gemini free tier (Google AI Studio, 1,500 requests/day, no credit card). Anthropic billing through Indian cards is still a pain point for a lot of teams. We removed that dependency entirely. If you have a Claude API key, one env var switches the backend.

The three IoT skills are the unusual part. Most AI toolkits are pure web dev. We have 10 years of firmware work for ESP32, STM32, and nRF hardware — the `iot-firmware-scaffold` skill generates C project skeletons with real production constraints: no malloc, watchdog mandatory, MQTT QoS1, X.509 auth. The OTA pipeline skill scaffolds a staged rollout (1%→10%→50%→100%) with signed binaries and auto-rollback. These are not generic templates.

The SMB Operations Pack has a GST invoice generator built specifically for Indian compliance — CGST/SGST/IGST splits, HSN codes, intra/inter-state rules, and composition scheme handling. If you've used a generic AI tool to generate a GST invoice and watched it get the tax breakdowns wrong, you know why we scoped this tightly.

Pricing in INR: IoT Developer Pack at ₹4,067, Developer Productivity and SMB Operations at ₹2,407 each. All-Access subscription at ₹2,407/month.

We're 15 days into a 90-day build sprint. This is product #1 of 6.

Try the free tier at https://addon90days.vercel.app or install directly:
npm install @addonweb/claude-toolkit

If you're an IoT engineer or Indian developer with a specific skill you'd want in the next pack, reply here. The next 3 skills ship based on what practitioners actually need.
