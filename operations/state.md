# State

**This file is Claude's memory between sessions.** It is read at the start of every session (via EXECUTE.md) and updated at the end. Keep it accurate.

---

## Project status

**Start date:** [UPDATE ON DAY 1]
**Current day:** [UPDATE DAILY]
**Current phase:** 1 (Foundation)
**Last session:** [UPDATE AT SESSION END]

---

## Next action

**What to do first in the next session:**
> [The very next task. Be specific.]

Example: "Run `/daily-standup`. Orchestrator will load Day 3 plan from runbook. Focus: deploy internal approval dashboard per runbook Day 3 plan. Blockers: none expected."

---

## In-flight (work carrying across sessions)

| Task | Owner agent | Status | Pointer |
|---|---|---|---|
| *(empty on Day 0)* | | | |

---

## Products — build status

| Product | Status | Owner lead | Last update | Pointer |
|---|---|---|---|---|
| 01-claude-reseller | queued-day-12 | @infra-engineer | — | `products/01-claude-reseller/PRD.md` |
| 02-whatsapp-ai-suite | planning | @api-engineer | — | `products/02-whatsapp-ai-suite/PRD.md` |
| 03-gst-invoicing | planning | @api-engineer | — | `products/03-gst-invoicing/PRD.md` |
| 04-restaurant-os | planning | @api-engineer | — | `products/04-restaurant-os/PRD.md` |
| 05-iot-platform | planning | @infra-engineer | — | `products/05-iot-platform/PRD.md` |
| 06-predictive-maintenance | planning | @infra-engineer | — | `products/06-predictive-maintenance/PRD.md` |
| 00-addonweb-rebrand | queued-day-25 | @ui-builder | — | `rebrand/README.md` |

Statuses: `researching → to-validate → validating → planning → building → beta → launched → scaling → mature → killed`

---

## Active cohorts / campaigns

| Cohort | Product | Status | Last send | Next action |
|---|---|---|---|---|
| *(empty — add as launched)* | | | | |

---

## Blockers requiring founder attention

| Blocker | Raised by | Date | Description |
|---|---|---|---|
| *(empty — add as they arise)* | | | |

→ Also check `operations/approval-queue.md` for items awaiting approval.

---

## KPI snapshot (updated at end of each week via /weekly-review)

- **MRR:** $0
- **Paying customers:** 0
- **Active pipeline:** $0
- **Leads this week:** 0
- **Meetings booked this week:** 0
- **Content shipped this week:** 0
- **Claude API spend this month:** $0 (cap: $5,000)

---

## Last session notes

### Session: [not yet started]

Completed: *(nothing yet)*

Carried forward: *(nothing yet)*

Notes for next time: *(empty)*

---

## State update template (use at session end)

Overwrite the "Last session notes" section with this format:

```markdown
### Session: {YYYY-MM-DD HH:MM}

**Completed this session:**
- @{agent}: {what they shipped}
- @{agent}: {what they shipped}

**In-flight carried to next session:**
- {task}: {where it stands}, pointer: {file/URL}

**Next action (for next Claude session):**
{One clear action. Include the product, the agent, the specific step.}

**Blockers (if any):**
- {blocker}: {what unblocks it}

**Day number at next session:** {N+1}
```

Also update the "Next action" section at the top of this file to match.

---

## Why this file matters

Without this file, every session starts from zero and Claude burns 50k+ tokens just figuring out where we are. With this file, Claude reads one 200-line document and immediately knows what to do.

Keep it clean. Archive old session notes to `operations/daily-log/` — don't let this file grow past 300 lines.
