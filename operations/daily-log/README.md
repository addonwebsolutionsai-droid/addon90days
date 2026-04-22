# Daily Logs

**Orchestrator writes one file per day here.** Filename: `YYYY-MM-DD.md`.

## Template

```markdown
# Daily Log — Day {N} — {YYYY-MM-DD}

## Morning briefing
{Copy of what was shown to founder at /daily-standup}

## Work completed today (by agent)

### @{agent}
- {task}: {outcome}
- {task}: {outcome}

### @{agent}
- ...

## Shipped to production
- {product}: {what shipped}

## Blocked / pending
- {item}: {blocker}

## Decisions made today
- {link to ADR if one was written}

## Approvals processed
- Approved: {N}
- Rejected: {N}
- Edited: {N}

## KPI snapshot (end of day)
- MRR: $X
- Paying customers: N
- Pipeline: $X
- Leads today: N
- Content shipped today: N
- Meetings booked today: N

## Notes for tomorrow
- {anything worth surfacing}
```

## Retention

Daily logs are kept forever — they're the company's memory. Don't delete.

When the repo gets big, consider rotating older logs into `operations/daily-log/archive/YYYY-MM/` monthly.
