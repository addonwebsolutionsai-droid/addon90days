> DRAFT — needs founder approval before publishing

# We Built 130 Claude Skills in 15 Days. Here's the Full Technical Story.

**Meta description (155 chars):** AddonWeb shipped 130 production-ready Claude Code skills and an MCP server in 15 days. Here's the architecture, 3 skill walkthroughs, what broke, and what we learned.

**Meta title (60 chars):** 130 Claude Skills in 15 Days — Architecture & Lessons

**Primary keyword:** Claude Code skills
**Keyword appears in:** H1, first paragraph, H2 subhead "How the Claude Code skills catalog works", meta description.

**Alt text suggestions for screenshots:**
- Hero screenshot: "AddonWeb Claude Toolkit homepage showing 130+ skills catalog and install command"
- MCP config screenshot: "Claude Desktop MCP configuration for AddonWeb skills server"
- Try Live screenshot: "Try Live in-browser skill demo running gst-invoice-generator"
- Skill card grid: "AddonWeb skills catalog browse page showing IoT, Developer Tools, and Indian Business categories"

---

Claude Code is a powerful coding assistant. It is also a blank page every time you open it.

Every developer using Claude Code daily faces the same friction: you know exactly what you want — scaffold an ESP32 firmware project, generate a GST-compliant invoice, screen NSE stocks for breakout setups — but you spend 10-15 minutes re-engineering the prompt before you get a useful output. Not because the task is hard. Because you're rebuilding the scaffold from memory.

We got tired of doing that. So we built a catalog of 130 structured Claude Code skills, a CLI installer, an MCP server for Claude Desktop, and an in-browser Try Live demo for every skill. It took 15 days. This post is the full technical story.

---

## How the Claude Code skills catalog works

Each skill in the catalog is a structured prompt workflow, not a freeform chat template. It has four components:

**1. Input schema** — A defined set of required and optional parameters with types. The `gst-invoice-generator` skill, for example, takes `sellerName`, `buyerGSTIN`, `lineItems` (array of objects with description, HSN code, quantity, rate, GST rate), and `currency`. No ambiguity about what you need to provide.

**2. Prompt template** — A multi-step Claude prompt that interpolates the input parameters. For complex skills like `esp32-firmware-scaffold`, the prompt chain has 6 steps: project structure, Kconfig definitions, main.c with FreeRTOS task setup, MQTT client implementation, OTA handler, and a README with flash instructions.

**3. Output specification** — Defined output format so the result is immediately usable. Invoice skills output structured JSON + HTML. Code skills output a file tree with content. SQL skills output query + explanation + index suggestions.

**4. Metadata** — Category, step count, estimated completion time, free/paid status.

Skills install as Claude Code slash commands:
```
npx addonweb-claude-skills install gst-invoice-generator
```

This writes a `.claude/commands/gst-invoice-generator.md` file to your project directory. Claude Code detects it automatically. Next time you open Claude Code in that project, the skill is available as `/gst-invoice-generator`.

---

## Three skills worth examining in detail

### 1. `esp32-firmware-scaffold` — IoT & Hardware

This skill came directly from a firmware project we shipped for a manufacturing client in Ahmedabad. We were setting up ESP32-based temperature and humidity nodes — FreeRTOS, MQTT over WiFi to EMQX, OTA update capability.

Every time we started a similar project for a new client, the first 4-6 hours went to boilerplate: project structure, Kconfig setup, WiFi provisioning task, MQTT client initialization, OTA partition table, power management state machine. The logic was identical project to project. Only the broker address, topic schema, and sensor driver changed.

The skill defines inputs for connectivity type (MQTT/HTTP/BLE), target chip (ESP32/ESP32-S3/ESP32-C3), sensor type, and OTA enabled (boolean). The output is a complete FreeRTOS project skeleton: `CMakeLists.txt`, `sdkconfig.defaults`, `main/main.c` with task definitions, `components/mqtt_client/`, `components/ota_handler/`, and a README with ESP-IDF build instructions.

Time saved on the last project where we used it: approximately 3.5 hours.

### 2. `gst-invoice-generator` — Indian Business

GST compliance in India is specific enough that generic invoice generators get it wrong. Common errors we've seen from off-the-shelf tools: wrong CGST/SGST/IGST split logic (the rule: IGST applies when seller and buyer are in different states, CGST+SGST when in the same state), missing HSN/SAC codes, incorrect rounding (GST rounds to the nearest rupee at line item level before summing, not after).

Our skill takes structured line item inputs and produces: correct tax calculation with IGST vs. CGST+SGST split determined by the buyer/seller state codes provided, HSN code validation against a lookup, and HTML output with the Invoice layout mandated by GST rules (seller GSTIN, buyer GSTIN, place of supply, IRN field placeholder).

We've validated the output against the GSTIN invoice format specification and our own CA's requirements. It passes.

### 3. `stock-screener-ai` — Trading & Finance

This skill started as a side project. The inputs are: price range, market cap range, RSI range (e.g., "30-50"), moving average condition (e.g., "50MA above 200MA"), minimum average daily volume, and exchange (NSE/BSE/both).

The output is a structured watchlist with reasoning per stock: why it meets the technical criteria, the current fundamental context (P/E, debt/equity if available from the input context), and a risk note.

Important caveat we include in the skill documentation: this is a screening tool, not a buy signal. The skill does not pull live market data — you provide the screen parameters and your own data context. The AI does the filtering and reasoning, not the data retrieval.

---

## The technical architecture

**Frontend:** Next.js 15 app deployed on Vercel. The catalog, skill detail pages, and Try Live panel are all server-side rendered for SEO. Category and skill pages are statically generated at build time from the Supabase skill catalog.

**Database:** Supabase PostgreSQL. Skill catalog stored with full input schemas (as JSON Schema). User accounts, install tracking (which users installed which skills, for usage analytics). Clerk for auth — we chose Clerk over Supabase Auth for the component quality and the session handling.

**MCP Server:** The `/api/skills/mcp` endpoint implements the MCP HTTP Streamable transport specification. Each skill is exposed as a named tool with its JSON Schema input definition. Add this to Claude Desktop's config and all 130 skills appear as available tools:

```json
{
  "mcpServers": {
    "addonweb-skills": {
      "type": "http",
      "url": "https://addon90days.vercel.app/api/skills/mcp"
    }
  }
}
```

**Try Live:** Groq API with Llama 3.3 70B Instruct. Median latency: ~1.8 seconds for structured outputs. We chose Llama 3.3 70B specifically because it handles structured prompt templates well at speed, and the Groq API is free at our current call volume — which lets us keep the whole product free during beta without burning through inference budget.

**CLI:** `addonweb-claude-skills` npm package. `npx addonweb-claude-skills install <slug>` pulls the skill definition from the API, writes the `.claude/commands/<slug>.md` file, and confirms. No global install required.

---

## What broke (three honest lessons)

### Lesson 1: The MCP server wasn't actually an MCP server

Our first MCP implementation was a static JSON manifest at `/api/skills/mcp`. It returned a list of skill names and descriptions. We deployed it, documented it, and pushed it to a real customer's Claude Desktop config.

It didn't work. Claude Desktop connected, got the manifest, and didn't know what to do with it. The MCP protocol requires a proper HTTP Streamable transport server — it's not a static file. You need to handle the `initialize`, `tools/list`, and `tools/call` message types with the correct JSON-RPC 2.0 envelope.

We rebuilt it as a proper MCP server. Added 3 days to the timeline. The customer who got the broken config got an apology and a working config.

The lesson: read the actual MCP spec, not just examples. The spec has edge cases that examples don't cover, particularly around capability negotiation and error responses.

### Lesson 2: Gemini quota kills you at 2 AM

The original Try Live backend used Gemini 1.5 Flash (via Google AI Studio free tier). Fast, good quality. We used it for the first week of internal testing.

On Day 9, at 2 AM IST, the Gemini free quota hit. Every Try Live request started returning 429s. We had no fallback. The demo was broken for 6 hours before we noticed.

We switched to Groq + Llama 3.3 70B the next morning. Groq's free tier has more headroom for our current volume, the latency is comparable (~1.8s vs. ~2.1s for Gemini Flash), and the output quality on structured skills is close enough for demo purposes.

The lesson: never build a demo on a free quota with no fallback. Always have a circuit breaker and a secondary provider.

### Lesson 3: "130 skills" means nothing without quality signal

When we shipped the catalog at 130 skills, we assumed the quantity itself was persuasive. It wasn't. The first beta users wanted to know which skills were tested in production vs. newly written. "130 skills" without a quality signal is noise.

We added a badge system: skills marked as "battle-tested" have been used on real projects (IoT skills, GST invoice generator, code reviewer). Skills without the badge are newly written and need community validation. The distinction matters.

The lesson: quantity is not a feature. Quality signal is. Show which pieces you'd stake your name on.

---

## Distribution strategy: free until 10,000 users

We're keeping the entire toolkit free during public beta. No paid tier. No card required. Sign-in required to install (so we can track usage and build quality signal).

The reasoning is simple: we need usage data more than early revenue. We don't know which skill categories resonate, which installs convert to daily use, or which skill quality issues cause silent drop-off. Those signals are worth more than $29/month from 100 early adopters.

We'll flip to consumption-based pricing when we hit 10,000 sign-ups. We'll share the pricing model publicly before we flip it.

If you use Claude Code or Claude Desktop daily, the catalog is at https://addon90days.vercel.app. No card required.

---

*AddonWeb Solutions is a custom software shop in Ahmedabad, India, currently in a 90-day AI-native rebuild. We ship IoT firmware, enterprise backends, and now AI-native products. This blog documents the build in public.*

*Install a skill: `npx addonweb-claude-skills install code-reviewer`*
*MCP config for Claude Desktop: see the [quickstart guide](https://addon90days.vercel.app)*

