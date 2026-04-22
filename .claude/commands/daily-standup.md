---
description: Run the daily standup — orchestrator briefs on yesterday's progress, today's plan, and what needs founder attention
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Invoke the `@orchestrator` subagent to run today's standup.

The orchestrator should:

1. **Determine today's day number.** Read `operations/kpis.md` for project start date. Compute today via `date +%Y-%m-%d`. Today's day number = days since start + 1.

2. **Read yesterday's log** from `operations/daily-log/YYYY-MM-DD.md` (if exists). Note what shipped, what was blocked.

3. **Read today's plan** from `roadmap/daily-runbook.md` — find the section for Day {N}.

4. **Read the approval queue** from `operations/approval-queue.md`. Count what's waiting for founder.

5. **Read KPI state** from `operations/kpis.md`.

6. **Delegate today's specialist tasks** to the appropriate agents per the runbook for Day {N}. Send each agent a complete prompt with:
   - What they need to do today
   - PRD reference if applicable
   - Acceptance criteria
   - Escalation path

7. **Produce the founder briefing** in the exact format defined in `@orchestrator`'s system prompt (Shipped yesterday / Blocked / KPI pulse / Today's plan / Founder time required).

8. **Output the briefing to the console** AND save it to `operations/daily-log/YYYY-MM-DD.md` as the day's opening section. EOD content gets appended when the orchestrator runs its wrap-up.

If today is a review day (Day 28, 56, or 90), automatically chain into `/weekly-review` style retrospective at the end of the briefing.

If today is a Friday, remind the founder that `/weekly-review` is scheduled for 4pm IST.

Keep the briefing under 500 words. The founder has 60 minutes. Don't waste any.
