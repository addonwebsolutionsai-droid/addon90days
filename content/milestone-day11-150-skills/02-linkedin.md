# LinkedIn Post — Day 11 / 150 Skills Milestone

---

150 Claude skills in 11 days. 18 of them shipped yesterday with no human writing a single one.

Here's the honest story of how that happened — and what it tells me about building AI-native.

We built an internal pipeline called Skill Smith. It works like this: a priority queue feeds curated trend prompts into Llama 3.3 70B, which drafts each skill — config, step descriptions, runnable code. A second LLM call scores quality on a 1–10 rubric. Anything below 7 gets rejected and logged. Anything that passes runs a smoke test to confirm the live page renders. Only then does it hit the catalog.

Midway through yesterday's batch, I raised the quality floor in the pipeline config: step descriptions went from a 30-char minimum to 100, and every skill now requires at least 200 chars of real, runnable code. The afternoon batch reflects it — code blocks running 245–713 chars, descriptions 180–262. The morning batch doesn't. I didn't retrofit. I moved the floor and kept shipping.

That's the build philosophy: raise the bar in motion, don't pause to refactor history.

Three skills that came out of yesterday that I'm proud of:
- `gst-e-invoice-irp-integrator` — full IRN-compliant e-invoice generation against India's IRP API
- `mqtt-esp32-debug-checklist` — structured MQTT debug flow for ESP32 embedded hardware (this is where our IoT background shows up)
- `llm-token-cost-forecaster` — models token spend across providers before you commit a workload

All 150 are free for the first year. No card, no paywall. Install any skill in one line: `npx addonweb-claude-skills install <slug>`. Or drop one config block into Claude Desktop and all 150 appear as MCP tools.

The team doing this: 13 Claude subagents, 1 founder, 0 human employees.

If you're building with Claude and a category is missing from the catalog, tell me. It goes into the queue.

https://addon90days.vercel.app/skills

---

*[STOP — founder review required before posting. Do not auto-publish.]*
