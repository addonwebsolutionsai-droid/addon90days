> DRAFT — needs founder approval before publishing

# X / Twitter Thread — P01 Launch

---

1/ We just shipped 130 production-ready skills for Claude Code and Claude Desktop.
Free. No card. One command to install.

Here's what's in it and why we built it:

---

2/ Every skill installs with:

```
npx addonweb-claude-skills install stock-screener-ai
```

That's it. Claude Code picks it up immediately as a slash command.

---

3/ The problem we were solving for ourselves:

Every time you start a new project in Claude Code, you rewrite the same prompts from scratch.

Scaffold firmware. Generate an invoice. Write a PR description. Build a SQL query.

Not hard. Just repetitive. We wanted a catalog.

---

4/ So we built one. 130 skills. 11 categories.

A few real examples:
- `esp32-firmware-scaffold` — FreeRTOS + MQTT + OTA boilerplate, ready to flash
- `gst-invoice-generator` — GST-compliant invoices with HSN codes and IGST/CGST logic
- `sql-query-builder` — plain English to optimized SQL with joins, CTEs, window functions
- `stock-screener-ai` — scans NSE/BSE with technical + fundamental filters

---

5/ Every skill has a "Try Live" button.

Run it in-browser before you install it. No login needed to browse.

We're running Llama 3.3 70B on Groq for the demos — ~1.8s median latency. Fast enough to evaluate before committing.

---

6/ Claude Desktop users: add all 130 skills as MCP tools with one config block.

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

Restart Claude Desktop. All 130 skills show up as available tools.

---

7/ Who built this:

We're AddonWeb Solutions — a custom software shop in Ahmedabad, India.
10 years of IoT firmware, mobile apps, enterprise backends for clients in USA, Canada, Ireland, Dubai.

We started an experiment 15 days ago: rebuild the company as AI-native using 13 Claude subagents. This toolkit is the first thing we're shipping.

---

8/ Pricing: free during public beta. No card required. Sign-in required to install.

We're staying free until 10,000 users. After that, consumption-based pricing — and we'll share the model before we flip it.

---

9/ The IoT skills are the most battle-tested — they came directly from firmware projects we shipped for real clients.

The `esp32-firmware-scaffold` skill alone saved our team ~4 hours on the last project kickoff.

---

10/ Browse the catalog, try any skill live, or install:

https://addon90days.vercel.app

What skill category would be most useful to you? We add new skills daily based on what the community asks for.

