> APPROVED — ready to publish on Day 15 (2026-05-06)

# Reddit Posts — P01 Launch

---

## Post 1: r/ClaudeAI

**Title:** We built 130 production-ready skills for Claude Code + Claude Desktop — free during beta (Try Live in-browser on every skill page)

**Body:**

We're AddonWeb Solutions, a dev shop out of Ahmedabad, India. We've been running Claude Code daily for client work — IoT firmware, enterprise backends, internal tooling — and kept noticing we were rewriting the same prompt scaffolds over and over.

So we built a catalog: 130 skills across 11 categories, installable with one command or accessible via MCP server from Claude Desktop.

**Install a specific skill:**
```
npx addonweb-claude-skills install gst-invoice-generator
```

**Use all 130 from Claude Desktop (MCP):**
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

**What's in the catalog:**
- IoT & Hardware — `esp32-firmware-scaffold`, device registry schema, OTA pipeline setup
- Indian Business — `gst-invoice-generator`, GST calculator, compliance checklist
- Developer Tools — `code-reviewer`, `sql-query-builder`, `pr-description`, commit message writer
- Trading & Finance — `stock-screener-ai` for NSE/BSE with technical + fundamental filters
- Startup & Product — product roadmap generator (RICE-scored), user story writer
- Plus: Data & Analytics, DevOps, UI/UX, Protocols, AI/LLM, Marketing

Every skill page has a "Try Live" button — runs the skill in-browser with Llama 3.3 70B on Groq so you can see the output before installing. No sign-in needed to browse or try.

Free during beta. Sign-in required to install. No card, ever (until we announce pricing, which won't happen before 10K users).

Link: https://addon90days.vercel.app

Genuine question for the community: **which skill category would be most valuable to you that isn't in the catalog yet?** We add skills daily based on what people actually ask for, and I'd rather build what this community needs than guess.

Also curious: do you prefer the CLI install workflow or the MCP approach? We've seen people lean heavily one way or the other depending on how they use Claude Code vs. Claude Desktop.

---

## Post 2: r/IndieHackers

**Title:** Day 15: 130 skills shipped as part of a 90-day AI-native company rebuild (built with 13 Claude subagents)

**Body:**

Background: I've been running a custom software shop in Ahmedabad for 10 years — IoT hardware/firmware, mobile apps, enterprise backends for clients in the USA, Canada, and Europe. The traditional services market started compressing due to AI-enabled competition, and I made a call 15 days ago to rebuild the company as AI-native in 90 days.

The constraint I set: no new hires. Instead, 13 Claude subagents organized into pods: product (CTO, frontend, API, infra), growth (CMO, content, paid ops), revenue (inbound, outbound), and coordination. I'm the only human. My role is approver and enterprise closer, ~60-90 minutes per day.

Today is Day 15. We're shipping the first product: **AddonWeb Claude Toolkit** — 130 structured prompt workflows ("skills") for Claude Code and Claude Desktop.

**What it took to get here:**
- Day 1-3: Orchestrator agent set product priority, CTO agent designed architecture, infra agent set up Supabase + Vercel
- Day 4-8: Skills writing and catalog build. The IoT and GST skills came from actual client work we've shipped over the years — it was essentially a knowledge extraction exercise
- Day 9-12: MCP server implementation. This is where we hit our first real failure — the initial build wasn't spec-compliant (it was a static manifest, not a real MCP server). Had to rebuild it as proper HTTP Streamable transport. Added 3 days
- Day 13-15: Try Live demo (Groq + Llama 3.3 70B), launch content, this post

**The honest numbers:**
- 130 skills live
- 11 categories
- 1 MCP server (HTTP Streamable)
- 1 npm package (`addonweb-claude-skills`)
- 1 Next.js 15 app on Vercel
- 0 revenue (free beta)
- 1 founder doing ~75 min/day

The 90-day target is $25k–$75k MRR across all 6 products we're building. This is product #1 of 6. Day 90 is 2026-07-29.

If you want to see the catalog or try any skill: https://addon90days.vercel.app

Happy to answer questions about the 13-agent architecture, what breaks when you try to run a company with AI subagents, and what actually worked.

---

## Post 3: r/MachineLearning [Project]

**Title:** [Project] In-browser skill execution catalog for Claude — MCP HTTP server + Llama 3.3 70B for Try Live demos

**Body:**

We shipped a catalog of 130 structured prompt workflows (skills) for Claude Code and Claude Desktop. The architecture is worth describing for this community.

**MCP Server:** Implements the MCP HTTP Streamable transport spec at `/api/skills/mcp` on Vercel. Each skill is exposed as a named tool with a typed input schema. Claude Desktop connects via:

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

The server returns skill metadata, input schemas (Zod-validated, then serialized to JSON Schema for the MCP tool spec), and prompt templates. Execution happens inside Claude's context — the MCP server provides the tool definitions, not a remote inference endpoint.

**Try Live:**
Each skill page has an in-browser execution panel. We're using Groq's Llama 3.3 70B Instruct for this — primarily because it's fast (median ~1.8s for structured outputs) and the API is free at our current call volume, which lets us keep the product entirely free during beta. The tradeoff: output quality on complex skills (esp32-firmware-scaffold, gst-invoice-generator) is noticeably weaker than Claude Sonnet. We disclose this on the UI.

**Skill catalog storage:** Supabase PostgreSQL. Each skill record has: slug, title, category, description, input_schema (JSON Schema), prompt_template (string with {{variable}} interpolation), step_count, and free/paid flag. The catalog is currently hardcoded via seed scripts; dynamic skill submission from community contributors is on the roadmap.

**Skill categories:** IoT & Hardware, Indian Business, Developer Tools, Trading & Finance, Startup & Product, Data & Analytics, DevOps & Infra, UI/UX, Communication Protocols, AI/LLM, Marketing & Growth.

The two categories with the most empirical testing behind the prompts are IoT (we've shipped real ESP32/STM32 client projects) and Indian Business (GST compliance rules are specific enough that we could verify outputs against GSTIN documentation).

Open to feedback on the MCP server implementation and on prompt engineering approaches for highly structured outputs (invoices, firmware scaffolds, SQL). Site: https://addon90days.vercel.app

