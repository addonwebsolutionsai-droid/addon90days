> APPROVED — ready to publish on Day 15 (2026-05-06)

# LinkedIn Post — P01 Launch (Founder Voice)

---

15 days ago I made a decision that felt genuinely uncomfortable.

After 10 years running a custom software shop in Ahmedabad — IoT firmware, mobile apps, enterprise backends for clients across USA, Canada, Ireland, and Dubai — I looked at our pipeline and realized the market was compressing faster than I'd admitted to myself.

Not collapsing. Compressing. The kind of slow squeeze that doesn't trigger a panic, just a quiet pressure that builds until you have to act.

So I started an experiment: rebuild the company as AI-native in 90 days. No new hires. Just 13 Claude subagents organized into product, growth, and revenue pods. I set them to work. My job became approver, strategist, and enterprise closer. 60-90 minutes of my time per day.

Today, 15 days in, we're shipping the first product.

**AddonWeb Claude Toolkit — 130 production-ready skills for Claude Code and Claude Desktop.**

Here's what it actually is:

When you use Claude Code daily, you write the same kinds of prompts over and over. Scaffold a FreeRTOS firmware project. Generate a GST-compliant invoice. Build a SQL query from plain English. Screen NSE stocks for breakout setups. These aren't complex — they're repetitive. We wanted a catalog we could pull from instead of starting blank each time.

So we built 130 of them. Each one is a structured workflow: defined inputs, a multi-step Claude prompt chain, expected output format. Install with one command:

`npx addonweb-claude-skills install esp32-firmware-scaffold`

Or connect Claude Desktop to all 130 skills at once via MCP — one config block, all skills appear as tools.

Every skill has a Try Live button. Run it in-browser before you install it.

It's free during public beta. No card required. We're staying free until 10,000 users.

The skills I'm personally using most: `gst-invoice-generator` for client billing, `code-reviewer` for our internal PRs, and `sql-query-builder` when I need to query our Supabase tables without opening a SQL editor.

If you use Claude Code or Claude Desktop, this might save you 2-3 hours a week.

Try it: https://addon90days.vercel.app

If you know a developer who lives in Claude Code — forward this to them.

