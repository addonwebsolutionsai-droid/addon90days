# Approval Queue

Items awaiting founder approval. Agents append here; founder clears via `/approve` command.

**How it works:**
- Agents add items under "Pending" section with all context needed
- Founder runs `/approve` in daily session to walk through items
- Items move to "Approved today" / "Rejected today" based on founder decision
- End of day, cleared items archive to `operations/approval-log/YYYY-MM-DD.md`

---

## Pending (0)

*No items pending. Agents will add here.*

---

## Approved today (0)

---

## Rejected today (0)

---

## Template for agents adding items

When an agent adds an item, use this format:

```markdown
### {N}. {ONE-LINE TITLE}

- **Category:** {outbound-email | proposal | content | code-merge | budget-request | strategic-decision | other}
- **Urgency:** {same-day | 24h | 48h | 72h}
- **Submitted by:** @{agent-name}
- **Submitted at:** {timestamp}
- **Related product:** {product-id or N/A}

**Context:**
{What this is and why it needs approval}

**The artifact / proposal:**
{Paste the draft / link / decision — enough detail that founder can approve without asking questions}

**Recommended action:** {approve / reject / my specific recommendation}

**If approved, I will:** {what the agent will do next}

**If rejected, options are:** {alternative paths}
```

## Priority guidelines for founder

When walking the queue, process in this order:

1. Same-day urgency items (usually customer-facing comms)
2. Code merges blocking other work
3. 24h items
4. 48h+ items
5. Strategic decisions (usually last — give yourself thinking time)

## Escape valves

**If the queue exceeds 20 items pending:** flag in next weekly review — too much is routing to founder, need to raise autonomy of some agent categories.

**If an item has been pending >72h:** `@orchestrator` re-pings founder with context in daily briefing.

**If founder is unavailable for >3 days:** agents pause outbound comms and proposal sends automatically. Build/design/content work continues; only external-facing items queue up.
- [ ] 2026-05-02 · Content draft ready: content/queue/2026-05-02-reddit.md (CMO)
- [ ] 2026-05-02 · 30 outbound drafts ready: sales/drafts/2026-05-02.md (Outbound)