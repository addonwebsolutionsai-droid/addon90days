# Show HN Draft — Day 11 / 150 Skills Milestone

---

## Title (78 chars)
Show HN: I built a pipeline that ships Claude skills autonomously – 150 in 11 days

---

## Submission Body (2 paragraphs)

SKILON is a catalog of Claude skills installable via one npm command (`npx addonweb-claude-skills install <slug>`) or as an MCP server you paste into Claude Desktop — after which all 150 skills appear as tools. Skills cover trading/finance, DevOps, IoT, Indian GST compliance, LLM cost modeling, and more. Everything is free for the first year, no card required.

The interesting part is how the catalog grew this fast. An internal agent pipeline called Skill Smith drives it: a curated trend-prompt seed queue feeds Llama 3.3 70B to draft each skill, a second LLM call scores quality 1–10, anything below 7 is rejected and logged, passing skills run a smoke test on live page render, and only then publish. 18 skills shipped in one day with no human writing any of them. Mid-batch I raised the quality floor (step-description minimum: 30 → 100 chars; mandatory ≥ 200-char runnable code block) — the difference is visible in the catalog's afternoon batch. The catalog itself is closed-source skill files; the install client is MIT-licensed.

Site: https://addon90days.vercel.app/skills
npm: addonweb-claude-skills

---

## First Comment (technical architecture)

**Technical architecture for anyone curious:**

The MCP server lives at `https://addon90days.vercel.app/api/skills/mcp` and implements the Streamable HTTP MCP protocol. Each skill is stored as a structured JSON config (name, slug, category, steps array, code block, description). The MCP layer exposes them as tools dynamically — Claude Desktop reads the manifest on connect, so adding a new skill to the catalog immediately makes it available to all MCP users without a client update.

Skill Smith pipeline detail:
- **Prompt queue:** ~50 curated trend prompts in a seed file, biased 70/30 toward whichever categories are below the catalog average
- **Draft model:** Llama 3.3 70B via Groq (free tier — has been sufficient at our current 3 fires/day cadence)
- **Scoring model:** second LLM call with a rubric that checks specificity, workflow depth, code substance (≥ 200 chars in a real language), and step-description density
- **Quality gate:** score ≥ 7 required to publish; reject feeds the reasoning back into one retry attempt
- **Smoke test:** HTTP GET on the rendered skill page; the row is auto-unpublished unless we get a 200 AND find the literal skill title in the returned HTML (guards against soft-rendered error overlays returning 200 with no real content)
- **Publish:** writes to catalog, triggers static revalidation on Vercel

The install client (`npx addonweb-claude-skills install <slug>`) fetches the skill JSON from the API and writes the Claude Desktop config block locally. One command, no account required.

Current gaps I know about: no versioning on skill files yet (breaking changes would silently overwrite), scoring rubric is LLM-judged so it can be gamed by verbose-but-useless output (we've seen this, still calibrating the rubric). Happy to answer questions.

---

*[STOP — founder review required before posting. Do not auto-publish.]*
