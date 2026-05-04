# Operations state
last_security_rotation: 2026-05-04
notes: Supabase keys rotated to sb_secret/sb_publishable format after the leaked legacy JWT incident. Old service_role JWT is now functionally dead once founder revokes it in dashboard.

# State

**Claude's single source of truth between sessions.** Read this at the start of every session. Update it at the end.

---

## Project status

**Start date:** 2026-04-22
**Current day:** 7
**Current phase:** 1 — Sprint 1 (P01 Launch)
**Last session:** 2026-04-28

---

## Next action

> Sprint 1 execution. P01 must be live by Day 15 (2026-05-06).
> Sequence: Razorpay keys → checkout flow → /dashboard → /api/skills/run → npm publish → Vercel deploy → launch.
> Read `roadmap/sprint-plan.md` for full sprint breakdown.

---

## In-flight

| Task | Status | Pointer |
|---|---|---|
| Razorpay test keys | **waiting on founder** — get from dashboard.razorpay.com | `.env` |
| `/api/skills/run` route | building now | `products/01-claude-reseller/app/src/app/api/` |
| `/dashboard` page | building now | `products/01-claude-reseller/app/src/app/dashboard/` |
| Razorpay checkout UI | blocked on keys | `products/01-claude-reseller/app/src/` |
| npm publish prep | Day 11–12 | `products/01-claude-reseller/packages/toolkit/` |
| Vercel deploy | Day 13–14 | — |
| Meta WhatsApp API application | **start NOW** (3–7 day approval) | `products/02-whatsapp-ai-suite/` |

---

## Products — build status

| Product | Status | Pointer |
|---|---|---|
| 01-claude-reseller | **Sprint 1** — Razorpay + dashboard + deploy | `products/01-claude-reseller/.claude/memory/context.md` |
| 02-whatsapp-ai-suite | apply for Meta API now, build Day 15–30 | `products/02-whatsapp-ai-suite/PRD.md` |
| 03-gst-invoicing | Day 31+ (pending GSTN GSP reg) | `products/03-gst-invoicing/PRD.md` |
| 04-restaurant-os | on hold — Day 28 kill/keep | `products/04-restaurant-os/PRD.md` |
| 05-iot-platform | Day 30–35 | `products/05-iot-platform/PRD.md` |
| 06-predictive-maintenance | Day 47+ (after P05) | `products/06-predictive-maintenance/PRD.md` |

---

## KPI snapshot

- **MRR:** $0
- **Paying customers:** 0
- **Day 15 target:** P01 live on npm + Vercel, first Razorpay payment working
- **Day 30 target:** P02 live, $500–$2k MRR, 5–20 customers

---

## Blockers requiring founder action

| Blocker | Action |
|---|---|
| Razorpay test keys | dashboard.razorpay.com → Settings → API Keys → Test Mode |
| Meta WhatsApp Business API | developers.facebook.com → apply now (takes 3–7 days) |
| GSTN GSP registration | start application now (takes 2–4 weeks) |

---

## Last session notes

### Session: 2026-04-28

**Completed:**
- Swapped Anthropic SDK → Gemini (free, 1.5 Flash + 1.5 Pro)
- Swapped Stripe → Razorpay (India-compatible)
- Built /api/checkout + /api/razorpay-webhook routes
- Built sprint-plan.md (full 90-day sprint breakdown)
- GitHub push: all commits live at addon90days/main

**Next (continuing this session):**
- Build /api/skills/run route
- Build /dashboard page
- Build Razorpay checkout UI component

**Day number at next session:** 8
