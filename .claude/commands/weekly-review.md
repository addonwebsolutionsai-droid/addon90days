---
description: Run the Friday weekly review — retrospective + kill/keep/scale decisions + next week's plan
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Run the Friday weekly review.

Invoke `@orchestrator` to coordinate, with contributions from every pod lead (`@cto`, `@cmo`, `@inbound-sales`, `@outbound-sales`).

**Process:**

**1. Gather data (orchestrator compiles)**
- All daily logs from this week: `operations/daily-log/`
- This week's marketing report: `operations/marketing-reports/YYYY-Www.md` (from `@paid-ops-marketer`)
- This week's inbound pipeline: `operations/sales-reports/YYYY-Www.md` (from `@inbound-sales`)
- This week's outbound report: `operations/sales-reports/outbound-YYYY-Www.md` (from `@outbound-sales`)
- KPI changes: `operations/kpis.md` (current vs last week)
- Any decisions made: `operations/decisions/` new entries this week
- Any launches: `operations/launches/` new entries this week

**2. Pod-lead inputs (each produces 5 bullets)**
- `@cto`: what shipped, what's at risk, tech debt accruing, biggest win/miss
- `@cmo`: content/brand performance, competitive movement, channel health, kill/keep recommendations for active channels
- `@inbound-sales`: pipeline delta, notable deals, customer feedback themes
- `@outbound-sales`: cohort performance, ICP learnings, deliverability health

**3. Produce the weekly review document**

Save to `operations/weekly-reviews/YYYY-Www.md`:

```markdown
# Weekly Review — Week {N} — {Week start to end date}

## The number (MRR)
**${current MRR}** (Δ ${change} vs last week, ${%} change)

## What shipped this week
- Product: {list of features/products shipped}
- Content: {count, with highlights}
- Campaigns: {list launched}
- Deals closed: {list}

## KPI delta

| Metric | Last week | This week | Δ | Target | On track? |
|---|---|---|---|---|---|
| MRR | ... | ... | ... | ... | ... |
| New customers | ... | ... | ... | ... | ... |
| Pipeline value | ... | ... | ... | ... | ... |
| Meetings booked | ... | ... | ... | ... | ... |
| Content shipped | ... | ... | ... | ... | ... |
| API burn | ... | ... | ... | $5000 cap | ... |

## Biggest win
{One paragraph — what moved the needle and why}

## Biggest miss
{One paragraph — what didn't work and why, honestly}

## Kill / Keep / Scale decisions

### Products (review each active product)
- Product 1: {KILL / HOLD / SCALE} — reason: ...
- Product 2: ...

### Channels (review each active channel)
- LinkedIn paid: {KILL / HOLD / SCALE}
- Cold email cohort X: {...}
- ...

### Agents
- Any agent underperforming? (bad outputs, high error rate, slow) — decision on prompt revision or archival

## Lessons
- {What we learned about customers}
- {What we learned about ourselves/process}

## Next week's top 3 priorities
1. ...
2. ...
3. ...

## Decisions needed from founder
1. {Decision} — Options + recommendation
2. ...

## Founder time required next week (forecast)
- Estimated: {N} hours total
- Peak days: {which days need more}
```

**4. Founder review**

The orchestrator:
- Prints the full review to console
- Saves the file
- Adds to approval queue any decisions needing founder sign-off
- Lists any action the orchestrator will take pre-emptively (e.g., "will kill cohort X as per data unless you object by Monday 9am")

**5. Next week's plan**

Based on the review, update `roadmap/daily-runbook.md` if needed — mark any runbook days that got re-scoped or reprioritized. New priorities get inserted into the upcoming week's plan.

**6. Major retrospective days (Day 28, 56, 90)**

On these days, extend the review with a Phase Retrospective section:

```markdown
## Phase {N} Retrospective

### Phase goals (set at start)
- ...

### Phase actuals
- ...

### What we'd do differently next phase
- ...

### Bets to carry forward / drop
- Carry: ...
- Drop: ...
- Pivot: ...

### Phase {N+1} adjustments to the plan
- ...
```

This review takes 90-120 min for the founder. Don't shortchange it — this is where the company actually gets better.
