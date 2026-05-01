> DRAFT — needs founder approval before publishing

# ProductHunt Launch

## Title (≤60 chars)
AddonWeb Claude Toolkit — 130 production-ready AI skills

## Tagline (≤60 chars)
Slash commands + MCP server for Claude. Free during beta.

---

## Full Description (200–300 words)

Claude Code is a capable coding assistant. But every time you start a new project, you're writing the same prompts from scratch: generate a GST-compliant invoice, scaffold an ESP32 firmware project, screen NSE stocks for breakout setups, build a SQL query from plain English. None of this is complex. It's just repetitive.

AddonWeb Claude Toolkit is a catalog of 130 production-ready skills for Claude Code and Claude Desktop. Each skill is a structured prompt with defined inputs, step-by-step guidance, and copy-paste output — not a chatbot conversation, a repeatable workflow.

**What you get:**
- 130 skills across 11 categories: IoT & Hardware, Indian Business, Developer Tools, Trading & Finance, Startup & Product, Data & Analytics, DevOps, UI/UX, Protocols, AI/LLM, Marketing
- Install any skill in one command: `npx addonweb-claude-skills install stock-screener-ai`
- Use with Claude Desktop via MCP — add one config block and all 130 skills appear as tools
- Try Live: every skill page has an in-browser demo — run it before you install it
- Free during public beta. No card required. Sign-in required to install.

**Example skills people are using today:**
- `gst-invoice-generator` — GST-compliant invoices with HSN codes, multi-item, PDF-ready
- `esp32-firmware-scaffold` — FreeRTOS + MQTT + OTA boilerplate, ready to flash
- `stock-screener-ai` — scans NSE/BSE with technical + fundamental filters
- `sql-query-builder` — natural language to optimized SQL with joins, CTEs, window functions

Built in Ahmedabad, India. We are a custom dev shop (10+ years, clients across USA, Canada, Ireland, Dubai) pivoting to AI-native products. We use every skill in this catalog ourselves.

https://addon90days.vercel.app

---

## Gallery Image Captions

1. **Hero / Landing page** — Full-width screenshot of addon90days.vercel.app homepage showing the "130+ skills" badge, the install command badge (`npx addonweb-claude-skills install <skill-slug>`), and the category grid. Crop to show the violet/dark theme above the fold.

2. **Skills Marketplace grid** — Screenshot of the /skills browse page showing skill cards across multiple categories. Highlight one featured card (e.g., `stock-screener-ai`) with its tagline and category badge visible.

3. **Try Live demo in action** — Screen recording GIF or screenshot showing the Try Live panel open on the `gst-invoice-generator` skill page. Show input fields filled in and the output (invoice breakdown) rendered below.

4. **Claude Desktop MCP config** — Terminal or editor screenshot showing the MCP JSON config block (`{"mcpServers":{"addonweb-skills":{"type":"http","url":"..."}}}`) being added to Claude Desktop settings, followed by the skills appearing as available tools in Claude Desktop.

5. **Install + run in Claude Code** — Split terminal screenshot: left pane shows `npx addonweb-claude-skills install esp32-firmware-scaffold` running, right pane shows Claude Code using the skill to output a FreeRTOS project scaffold.

6. **Category breakdown** — Clean graphic showing all 11 categories with skill counts per category. Use the existing category color scheme (violet for AI/LLM, cyan for IoT, amber for Dev Tools, etc.).

7. **Founder / About card** — A simple "built by" card: AddonWeb Solutions logo, Ahmedabad, India, "10 years custom dev. Pivoting to AI-native." alongside the Day 15 milestone callout ("130 skills shipped in 15 days").

---

## First-Comment Template (founder posts immediately at launch)

Hey PH — founder here.

We're a custom software shop out of Ahmedabad, India. For 10 years we built IoT hardware, mobile apps, and enterprise backends for clients in USA, Canada, Ireland, and Dubai. Then AI arrived and the market for our old model started compressing fast.

So we started an experiment: rebuild the company as AI-native in 90 days, using 13 Claude subagents doing the actual product and marketing work. This toolkit is the first public output of that experiment.

The 130 skills are real — we use them in our own daily Claude Code workflow. The IoT skills come from firmware projects we shipped. The GST tools come from client invoicing we still do. The stock screener came from a side project one of our team runs on NSE.

A few things I'd genuinely like your feedback on:

1. Which categories are most useful to you? (We add skills daily based on demand.)
2. The Try Live demo — does it actually run fast enough to be useful, or is the latency annoying?
3. MCP vs. CLI install — which workflow do you prefer for integrating skills?

Everything is free during beta. We're staying free until 10,000 users, then we'll figure out pricing together with the community.

Try it: https://addon90days.vercel.app
