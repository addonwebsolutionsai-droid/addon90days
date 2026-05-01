> DRAFT — needs founder approval before publishing

# Email Newsletter — P01 Launch

**Subject line:** 130 Claude skills. Free. Ships today.
**Preheader:** Install any skill in one command. Try Live in-browser before you commit.

---

This is the Day 15 dispatch from AddonWeb Solutions.

---

**What we shipped today**

AddonWeb Claude Toolkit is live: 130 production-ready skills for Claude Code and Claude Desktop.

A "skill" is a structured prompt workflow — defined inputs, a multi-step Claude prompt chain, and a specific output format. Not a chatbot. A repeatable process you install once and run whenever you need it.

Install example:
```
npx addonweb-claude-skills install stock-screener-ai
```

Or add all 130 to Claude Desktop via MCP:
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

Browse the full catalog at https://addon90days.vercel.app

---

**Why this matters — the 90-day experiment**

Fifteen days ago I made a decision that felt risky at the time.

After 10 years running a custom dev shop in Ahmedabad — building IoT firmware, mobile apps, and enterprise backends for clients across the USA, Canada, Ireland, and Dubai — the market for that kind of work started compressing. AI-enabled competitors were taking the commodity work. Our moat (hardware + firmware + AI integration) still held, but the rest of the pipeline was thinning.

So I started a structured experiment: rebuild the company as AI-native in 90 days. The constraint: no new hires. Instead, 13 Claude subagents doing the actual product and marketing work — a CTO agent, frontend architect, API engineer, CMO, content marketer, inbound sales, outbound sales, and more. I'm the only human: approver, strategist, enterprise closer.

Today is the first public result of that experiment.

The 90-day target is $25k–$75k MRR across 6 products. This is product #1. We have 5 more in development.

Whether this experiment works or not, we're documenting everything publicly. This newsletter is part of that documentation.

---

**Top 5 skills to try right now**

Each of these has a Try Live button on the skill page — run it in-browser before installing.

1. **`gst-invoice-generator`** — GST-compliant invoices with HSN/SAC codes, CGST/SGST/IGST logic, and HTML output ready for PDF conversion. Used by our own team for client billing.

2. **`esp32-firmware-scaffold`** — FreeRTOS project skeleton with MQTT client (EMQX-ready), OTA via esp_https_ota, and a power management state machine. Saves ~4 hours on firmware project kickoffs.

3. **`stock-screener-ai`** — Scans NSE/BSE with configurable technical filters (RSI range, moving average crossover, volume threshold). Outputs a ranked watchlist with reasoning per stock.

4. **`sql-query-builder`** — Plain English to optimized SQL. Handles joins, CTEs, window functions. Paste your schema, describe your query, get production-ready SQL.

5. **`code-reviewer`** — Structured code review with findings organized by severity (blocking/non-blocking), specific line references, and suggested rewrites. Works on any language.

---

**Try Live — what just shipped**

Every skill page now has a Try Live panel. Fill in the inputs, click Run, and see the output in ~2 seconds. Powered by Groq's Llama 3.3 70B.

One honest caveat: Llama 3.3 70B is good but not Claude Sonnet. On complex structured outputs (firmware scaffold, GST invoice with multi-item line items), the output quality gap is noticeable. We use Try Live to evaluate whether a skill does what it promises — for production use, install it and run it in Claude Code or Claude Desktop for full Claude quality.

---

**How to get involved**

- **Browse the catalog:** https://addon90days.vercel.app (no sign-in needed to browse or Try Live)
- **Install skills:** Sign in (free), then use `npx addonweb-claude-skills install <slug>`
- **GitHub:** https://github.com/addonwebsolutionsai-droid/addon90days (the full 90-day build in public)
- **Telegram updates:** @Addon90days_bot — daily build updates, new skill announcements
- **Discord:** Coming in Week 3. We'll announce here first.

If you have a skill request — a workflow you repeat every week in Claude Code that should exist in this catalog but doesn't — reply to this email. We add skills daily based on what the community asks for.

---

**What's coming next**

The second product in development is **ChatBase** (internal codename) — a WhatsApp AI business suite for Indian SMBs. More on that in the Week 3 dispatch.

We're not pre-announcing features we haven't shipped. But if you're building something in India that involves WhatsApp as a customer communication channel, that's the direction we're heading.

---

**Forward this email to one developer friend who uses Claude Code daily.**

That's the only distribution ask we'll ever make.

— AddonWeb Solutions
https://addon90days.vercel.app

