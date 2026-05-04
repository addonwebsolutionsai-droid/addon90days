# Approval Queue

Items awaiting founder approval. Agents append here; founder clears via `/approve` command.

**How it works:**
- Agents add items under "Pending" section with all context needed
- Founder runs `/approve` in daily session to walk through items
- Items move to "Approved today" / "Rejected today" based on founder decision
- End of day, cleared items archive to `operations/approval-log/YYYY-MM-DD.md`

---

## Pending (1)

### #001 — Day 15 Launch (P01 Claude Toolkit) — Go / No-Go

- **Category:** strategic-decision
- **Urgency:** 24h
- **Submitted by:** @cto
- **Submitted at:** 2026-05-04 (Day 7)
- **Related product:** P01 Claude Toolkit
- **Decision needed by:** 2026-05-05 21:00 IST (T-15h before launch window opens)

**What's ready:**
- 5/5 product landing pages live + brand-isolated (sidebar + chat widget no longer leak across products — fixed in 822716f, c7e5ae2)
- 5/5 waitlist endpoints returning 200 (p02–p06)
- 5/5 per-product OG images rendering with distinct accents
- npm package `addonweb-claude-skills@1.1.0` published
- MCP server live at `/api/skills/mcp` (verified initialize handshake)
- 130 skills in catalog · 4 featured (stock-screener-ai, gst-invoice-generator, esp32-firmware-scaffold, sql-query-builder) all 200
- Sign-in flow + Try Live endpoint Clerk-protected as designed
- 7-piece launch kit drafted, all marked APPROVED in `content/launch/`:
  01-producthunt · 02-hackernews · 03-twitter-thread · 04-linkedin
  05-reddit (3 subs) · 06-newsletter · 07-blog

**Founder action timeline (~90 min total over launch day Tue 2026-05-06):**

| Time IST | Action | Est. |
|---|---|---|
| 12:30 | Submit ProductHunt at midnight PST (copy from 01-producthunt.md) | 15 min |
| 12:35 | Tweet thread from @addonwebsolutions (copy 03-twitter-thread.md) | 10 min |
| 13:00 | Show HN post (02-hackernews.md) | 5 min |
| 13:30 | LinkedIn post from founder profile (04-linkedin.md) | 10 min |
| 14:00 | r/ClaudeAI post #1 from 05-reddit.md | 10 min |
| 16:00 | r/LocalLLaMA post #2 from 05-reddit.md | 5 min |
| 18:00 | r/programming post #3 from 05-reddit.md | 5 min |
| 20:00 | Newsletter blast (06-newsletter.md) — ONLY if mailing list ≥ 50 | 10 min |
| Throughout | Reply to PH/HN/Reddit/X comments | 20 min |

**Risks / mitigations:**
- ProductHunt account: confirm `addonwebsolutions.ai@gmail.com` has a PH account today. If not, create now — PH won't allow same-day signups to launch.
- Newsletter: skip if no mailing list yet (conditional, not blocking).
- Reddit r/programming: has self-promo karma threshold. If founder account is fresh, swap for r/SideProject or r/EntrepreneurRideAlong.

**Recommended action:** approve. All technical readiness gates are green; remaining work is only founder-side execution.

✓ launch infrastructure verified at commit 7894d7c — analytics, sitemap, robots, llms.txt all green. Awaiting only the launch-day go/no-go and PostHog key from founder.

**If approved, I will:** schedule a Telegram reminder at 11:30 IST on 2026-05-06 with one-tap links to each piece + paste-ready copy.

**If rejected, options are:** push to Day 16/17 if PH account isn't ready; or split launch (PH + HN on Day 15, social cascade on Day 16).

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
- [ ] 2026-05-03 · Content draft ready: content/queue/2026-05-03-reddit.md (CMO)
- [ ] 2026-05-03 · 30 outbound drafts ready: sales/drafts/2026-05-03.md (Outbound)
- [ ] 2026-05-04 · Content draft ready: content/queue/2026-05-04-twitter.md (CMO)
- [ ] 2026-05-04 · 30 outbound drafts ready: sales/drafts/2026-05-04.md (Outbound)