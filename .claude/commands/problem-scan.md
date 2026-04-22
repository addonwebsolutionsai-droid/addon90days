---
description: Scan the internet for unmet problems in a specific vertical using @problem-scout
argument-hint: [vertical]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch
---

Invoke the `@problem-scout` subagent to run a deep problem-discovery scan on the vertical specified: **$ARGUMENTS**

If no argument is provided, scan all 6 product verticals in turn.

Valid verticals (and their scan targets):
- `claude-tools` / `agentic` — Claude ecosystem + MCP (P01 — 01-claude-reseller)
- `whatsapp` / `chatbase` — WhatsApp AI business automation (P02 — 02-whatsapp-ai-suite)
- `gst` / `invoicing` / `taxpilot` — GST compliance + invoicing SaaS (P03 — 03-gst-invoicing)
- `restaurant` / `tableflow` — restaurant OS + POS (P04 — 04-restaurant-os)
- `iot` / `connectone` — IoT platforms + device fleet management (P05 — 05-iot-platform)
- `predictive-maintenance` / `machineguard` — industrial IoT + AI predictive maintenance (P06 — 06-predictive-maintenance)

The scout should follow the methodology in its system prompt:
1. Keyword sweep across sources
2. Thread mining on top 20 results
3. Cluster into themes
4. Rate signal strength with concrete quotes
5. Produce the full structured report to `operations/problem-radar/YYYY-MM-DD-{vertical}.md`

After the report is saved, the scout should:
- Print a 5-bullet summary to the console
- Flag any VERY high-signal problem (>10 independent mentions with WTP evidence) to `@cmo` and add to the approval queue as "potential new product bet"
- Suggest which problems deserve to move to `@idea-validator` next

If multiple verticals are scanned, produce one report per vertical plus a brief cross-vertical summary at `operations/problem-radar/YYYY-MM-DD-crossvertical-summary.md`.
