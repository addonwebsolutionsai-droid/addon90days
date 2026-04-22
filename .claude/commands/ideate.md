---
description: Generate and score product/feature ideas from the latest problem radar
argument-hint: [vertical or "all"]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Run a structured ideation sprint. Focus: **$ARGUMENTS** (or "all" if not specified).

Process:

1. **Read latest problem radar reports** from `operations/problem-radar/` (the most recent ones). If none exist for the specified vertical, stop and suggest running `/problem-scan {vertical}` first.

2. **Delegate to a multi-agent workshop:**
   - `@cto` reviews for technical buildability
   - `@cmo` reviews for positioning and channel fit
   - `@product-designer` reviews for UX complexity
   - `@problem-scout` re-surfaces the strongest pain signals for reference

3. **Generate 20-30 raw ideas** that address the problems in the radar, constrained by:
   - Must fit one of the 4 pillars (SaaS micro-product / Claude ecosystem / IoT × AI vertical / productized services)
   - Buildable by agents in <14 days for v1 (no 6-month moonshots in Month 1-2)
   - Clear willingness-to-pay signal from radar
   - Avoids high-regulation spaces unless we already have expertise (e.g., GST/compliance for TaxPilot)
   - Fits or extends one of our 6 existing product bets, OR is a clean new bet

4. **Score each idea** on a 0-5 scale across:
   - Market size (how many buyers exist)
   - Willingness to pay (evidence of budget)
   - Build ease (can we ship v1 fast?)
   - Moat/defensibility (what keeps competitors out)
   - Channel fit (can we reach buyers via our existing channels?)

   Composite = sum. Max 25.

5. **Rank and produce top 10 list** in `operations/ideation/YYYY-MM-DD-{vertical}.md`:

```markdown
# Ideation Sprint — {Vertical} — {Date}

## Top 10 ideas (ranked)

### #1: {Name}
- **Composite score:** {N}/25
- **One-liner:** ...
- **Pillar:** {1-4}
- **Source problem(s) from radar:** {links}
- **Why now:** ...
- **Rough v1 scope (from @cto):** ...
- **Channel/GTM (from @cmo):** ...
- **Risks:** ...
- **Recommended next step:** {validate / build / shelve}

### #2: ...
...

## Ideas considered and rejected (with one-sentence why each)
- ...
- ...

## Recommendations
- Move to `/validate-idea`: {top 3-5}
- Defer: {list, with revisit date}
- Kill: {list, with reasons}
```

6. **File decisions** — for any idea being killed, add a short rationale to `operations/decisions/YYYY-MM-DD-killed-ideas.md` so we don't re-ideate them.

7. **Flag to founder** via approval queue: "Top 3-5 ideas ready for validation budget approval. Recommend: {list}. Budget ask: ${amount}."

Output to console: the top 5 with their composite scores + next-step recommendations.
