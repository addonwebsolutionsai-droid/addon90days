# EXECUTE.md — Claude Session Entry Point

**This file is the cheap, fast entry point for every Claude session.** Use this instead of reading the whole repo upfront.

Pattern: read state → decide → load only what's needed → act → update state → exit.

---

## Session opening protocol (follow in order)

### Step 1: Read state (1 file only)
Read `operations/state.md`. Nothing else yet. That file tells you:
- Current day number
- Current phase
- What's in-flight
- What the next action is

### Step 2: Branch on state

**If state.md shows "Day: not-started" or is empty:**
→ This is Day 0. Read `GETTING_STARTED.md` + `CLAUDE.md`. Walk the founder through setup.

**If state.md shows a next action like "resume Day X task Y":**
→ Load ONLY the files that task needs. See "selective loading" below.

**If state.md says "awaiting founder":**
→ Read `operations/approval-queue.md`. Run `/approve` workflow.

**If it's a Friday (check `date`) and no weekly review this week:**
→ Run `/weekly-review`.

**Otherwise:**
→ Run `/daily-standup` (loads orchestrator).

### Step 3: Selective loading (save tokens)

Load only what the task needs. Do NOT pre-read the full runbook or all agent prompts.

| Task | Files to load |
|---|---|
| Daily standup | `operations/state.md`, today's section of `roadmap/daily-runbook.md`, `.claude/agents/orchestrator.md` |
| Build a feature | `products/<id>/PRD.md` (only the relevant section), `.claude/agents/cto.md`, relevant dev agent |
| Write content | `operations/brand-voice.md`, `playbooks/content-engine.md`, relevant product PRD's positioning section |
| Launch product | `playbooks/launch-checklist.md`, product PRD, launch-day templates |
| Design work | `DESIGN_STANDARDS.md`, `inspiration/` files, product PRD brand section |
| Outbound cohort | `playbooks/outbound-sales.md`, relevant PRD ICP section |
| Rebrand work | `rebrand/` relevant file, `inspiration/` relevant file |

**You do NOT need to load:** full runbook, all agent prompts, all PRDs. Load on-demand.

### Step 4: Do the work

Invoke relevant subagent with focused prompt. Give it:
- Specific goal
- PRD/playbook reference
- Acceptance criteria
- Escalation path

### Step 5: Update state before exiting

Before the session ends, update `operations/state.md`:
- What got done
- What's the next action
- Any blockers
- What day number tomorrow will be

### Step 6: Exit

Don't chat longer than needed. Short sessions = cheap sessions. A session should produce 1–3 concrete outcomes, then end.

---

## First-time setup (Day 0 only)

If this is the very first session:

1. Read `GETTING_STARTED.md` — walk founder through accounts, Claude Code install
2. Read `CLAUDE.md` — understand project
3. Initialize `operations/state.md` with:
   ```
   Start date: [today]
   Current day: 1
   Phase: 1 Foundation
   Next action: Run Day 1 tasks per roadmap/daily-runbook.md
   ```
4. Run `/daily-standup`

---

## Token budget per session

Target: under 50K input tokens for a standard daily standup.

Ways to overshoot (avoid these):
- Reading the full `daily-runbook.md` (~26K tokens) when you only need today's section
- Reading all 15 agent prompts when you only need 2-3
- Reading all 7 PRDs when one product is in focus
- Re-reading files you read earlier in the session (check context before re-loading)

Ways to stay lean:
- Use Grep/Read with line ranges
- Ask the user which product/task before loading
- Delegate to subagents (their context is separate — they don't bloat yours)
- End sessions early when there's a natural stopping point

---

## Multi-session continuity

Since Claude has no memory between sessions, `operations/state.md` IS the memory. It should always reflect reality at session end.

State update template (paste into state.md at session end):

```markdown
## Last session: {YYYY-MM-DD HH:MM}

### Completed
- {agent}: {what}
- {agent}: {what}

### In-flight (carry to next session)
- {task}: {status}, {pointer to work product}

### Next action (for next session)
{One specific thing to do first next session}

### Blockers
- {blocker}: {who can unblock}
```

---

## When NOT to use this file

If the founder types a specific question like "explain how X works" or "fix this bug" — don't follow the session opening protocol. Just answer. This protocol is for scheduled work sessions, not ad-hoc questions.

---

## Self-check before every session end

Ask:
1. Did I update state.md?
2. Did I file any work products in the right folders?
3. Did I add approval-queue items for anything founder needs to review?
4. Is the next action clear enough that tomorrow's session picks up without confusion?

If any answer is no, fix before exiting.
