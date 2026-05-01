> APPROVED — ready to publish on Day 15 (2026-05-06)

# Hacker News

## Title
Show HN: Claude Toolkit – 130 production-ready Claude skills, free during beta

---

## Body

I'm a developer running a custom software shop in Ahmedabad, India. We've done 10 years of IoT firmware, mobile apps, and enterprise backends. Over the last 15 days I've been rebuilding the company as an AI-native operation, using Claude extensively for both client work and our own products. The toolkit is the first thing we're shipping publicly.

**What it is:** A catalog of 130 structured prompts ("skills") for Claude Code and Claude Desktop. Each skill defines input parameters, a multi-step Claude prompt chain, and expected output format. Not a chatbot wrapper — each skill is a deterministic workflow.

**The problem it solves:** When you use Claude Code daily, you rewrite the same kinds of prompts repeatedly. "Generate a GST invoice with HSN codes." "Scaffold an ESP32 FreeRTOS project with MQTT and OTA." "Convert this plain English query to optimized SQL." These aren't hard to write once — they're annoying to write every time.

**Technical implementation:**
- Next.js 15 app on Vercel — the catalog and skill detail pages
- Supabase: skill catalog stored in PostgreSQL, user accounts and install tracking
- Clerk for auth (sign-in required to install, not to browse)
- MCP server at `/api/skills/mcp` — implements the MCP HTTP Streamable transport spec, so Claude Desktop users can add all 130 skills as tools with one config block:

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

- CLI install: `npx addonweb-claude-skills install stock-screener-ai` — pulls the skill definition and writes the `.claude/commands/` file locally
- Try Live: each skill page has an in-browser execution panel. We're running Groq's Llama 3.3 70B on the backend for Try Live — it's fast enough to be useful (median latency ~1.8s) and the inference is free at our current call volume
- npm package: `addonweb-claude-skills` (public, no auth needed to browse; auth gated at install)

**The 130 skills span 11 categories:** IoT & Hardware, Indian Business, Developer Tools, Trading & Finance, Startup & Product, Data & Analytics, DevOps & Infra, UI/UX, Communication Protocols, AI/LLM, Marketing & Growth.

A few specific skills worth looking at if you want to evaluate quality:
- `esp32-firmware-scaffold` — produces a FreeRTOS project with Kconfig, MQTT client (EMQX-ready), OTA via esp_https_ota, and a power management state machine. We've used variants of this on real client firmware
- `gst-invoice-generator` — generates GST-compliant invoices in India with correct HSN/SAC codes, CGST/SGST/IGST logic, and PDF-ready HTML output
- `stock-screener-ai` — NSE/BSE technical screener. Inputs: price range, volume threshold, RSI range, moving average crossover type. Outputs a ranked list with reasoning

**What's honest about the limits:**
- The MCP server currently exposes skill metadata and prompt templates as tools. It doesn't execute skills server-side on your behalf — Claude still does the execution. Full server-side execution is on the roadmap.
- The Try Live demo uses Llama 3.3 70B, not Claude. We made this choice to keep beta free — Llama 3.3 70B handles structured prompt execution well enough for demos but the output quality difference is noticeable on complex skills vs. Claude Sonnet.
- 130 skills is real but the quality is uneven across categories — IoT and Indian Business skills are the most battle-tested. Finance and UI/UX skills are newer.

**Why free during beta:** We need usage data more than early revenue. Free until 10,000 sign-ups, then pricing will be consumption-based (we'll share the model publicly before flipping it).

Site: https://addon90days.vercel.app

Would genuinely appreciate feedback on: (1) the MCP server implementation — does the HTTP Streamable transport work reliably in your Claude Desktop setup?, (2) skill quality in any specific category, (3) whether the Try Live Llama-vs-Claude gap is a dealbreaker for evaluating skills before installing.
