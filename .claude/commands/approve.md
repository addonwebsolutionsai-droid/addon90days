---
description: Walk through the approval queue with the founder — each item gets approve/reject/edit
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Walk the founder through `operations/approval-queue.md` item by item.

For each pending item:

1. **Show the item** — title, originating agent, timestamp, category (outbound email / proposal / content / code / budget / strategic)
2. **Show the evidence / context** — the draft/artifact itself, any supporting data
3. **Show the recommended action** — what the originating agent proposed
4. **Ask the founder:** [A]pprove / [R]eject / [E]dit / [S]kip (review later)

Based on founder's response:

- **Approve:** mark item as approved in queue, trigger the originating agent's send/publish/merge action, remove from queue
- **Reject:** mark as rejected, capture founder's reason (one sentence), notify originating agent, remove from queue
- **Edit:** capture founder's edits inline, confirm, then approve with the edits
- **Skip:** leave in queue for next session

Between items, allow the founder to ask clarifying questions. Route these to the right agent for clarification via subagent invocation.

After the queue is empty (or founder says "done"):

1. File a session summary to `operations/approval-log/YYYY-MM-DD-HHMM.md` listing what was approved/rejected/edited
2. Report metrics to orchestrator:
   - Items reviewed: N
   - Approved: N
   - Rejected: N (with reasons summarized)
   - Edited: N
   - Time spent: ~N minutes
3. If any agent has a rejection rate >30% in the past 2 weeks, flag for prompt review to the founder at next `/weekly-review`

Queue item categories and their urgency:

| Category | Priority | SLA |
|---|---|---|
| Customer-facing outgoing comms | High | Same day |
| Code to merge | High | Same day during active build |
| Outbound cohort launch | Medium | 24 hours |
| Content to publish | Medium | 24 hours |
| Budget > $500 | Medium | 48 hours |
| Strategic pivot / positioning | Medium | 48 hours |
| Administrative (tool onboarding etc.) | Low | 72 hours |

If the queue has >20 items, that's a signal that too much is routing to the founder — flag a process improvement for the next weekly review.

Keep this session focused and fast. The founder has 30-60 min for this per day, not 3 hours.
