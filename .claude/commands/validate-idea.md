---
description: Run a full validation stack on a specific idea using @idea-validator
argument-hint: [idea-name] [budget-cap-usd, optional, default=500]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch
---

Validate the idea: **$ARGUMENTS**

Invoke the `@idea-validator` subagent. It should run the standard validation stack per its system prompt, with budget discipline:

1. **Test 1 — Keyword research** (free, ~1 hour)
2. **Test 2 — Competitor pricing triangulation** (free, ~1 hour)
3. **Test 3 — Fake-door landing page** (paid, $300–500 budget) — requires founder approval before ad spend; `@idea-validator` files to approval queue before launching ads
4. **Test 4 — Fake-checkout signal** (only if Test 3 passes)
5. **Test 5 — Manual prospect interviews** (coordinate with `@outbound-sales` for outreach)

Stop early if signal is decisively green or decisively red. Don't burn budget on ambiguity — prefer cheaper tests (interviews) first.

Coordinate needed:
- `@ui-builder` to build the landing page (Test 3)
- `@content-marketer` to draft landing page copy
- `@paid-ops-marketer` to run ad campaign
- `@outbound-sales` for interview outreach

Deliver final report to `operations/validation/{idea-slug}.md` with a clear **GO / NO-GO / NEEDS-MORE-EVIDENCE** recommendation.

On GO:
- Create `products/NN-{slug}/PRD.md` from the template
- Add to approval queue: "Validation GO for {idea}. Budget to build v1: ${estimate}. CTO estimate: {N} weeks."

On NO-GO:
- Add to `operations/decisions/YYYY-MM-DD-killed-ideas.md` with evidence summary
- Briefly note what would change our mind

On NEEDS-MORE-EVIDENCE:
- Specify exactly what additional test would resolve it
- Do NOT just run more ads to hope for better numbers — find the missing signal

Budget cap for this validation: $ARGUMENTS (second arg if provided, else $500). If exceeded, pause and escalate to founder.
