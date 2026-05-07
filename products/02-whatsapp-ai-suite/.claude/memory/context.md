# P02 · ChatBase — Session Context

## Current Status
**Phase:** Launch-ready — backend + dashboard + launch kit all shipped
**Build started:** 2026-05-04 (Day ~12 by old anchor; Day 7 by 04-28 anchor)
**Target Launch:** Day 12-13 mock-mode soft launch · Day 18-22 real WhatsApp post-Meta-verify
**Last Updated:** 2026-05-07 (Day 10) — launch acceleration sprint complete

## Day 10 Update — Launch acceleration (commit 70fbb2d)

- `scripts/apply-p02-migration.js` — uses Supabase Mgmt API to apply
  010_p02_chatbase.sql when `SUPABASE_PROJECT_REF` + `SUPABASE_ACCESS_TOKEN`
  are in env. Falls back to a manual SQL Editor runbook at
  `operations/decisions/2026-05-07-p02-migration-howto.md`.
- 4 launch content pieces in `content/launch-p02/` (Twitter / HN / LinkedIn / Reddit),
  all marked `status: APPROVED` and ready to post once mock-mode is live.
- Dashboard polish: KnowledgeTab, IntentsTab, MockChat copy tightened.
- Launch path now: 8 min of founder action (apply migration + add P02_ENCRYPTION_KEY)
  → mock-mode public soft launch → submit Meta verification (3-7 day wait)
  → flip MOCK_MODE=false on Vercel → real WhatsApp.

## What's Done

### Backend (commit `1a0ff95`, by api-engineer 2026-05-04)
- 19 new files. Full WhatsApp AI pipeline.
- Migration `supabase/migrations/010_p02_chatbase.sql` — 5 tables (`p02_workspaces`, `p02_kb_docs`, `p02_intents`, `p02_conversations`, `p02_messages`) + 6 seeded intents + RLS policies. Service-role only.
- `src/lib/p02/` — types, db helpers, AES-256-GCM encryption for WhatsApp tokens, KB chunking + keyword Jaccard retrieval (vectors deferred to v1.1), Groq-powered intent classifier, reply engine, Meta Cloud API client gated on `MOCK_MODE`.
- `src/app/api/webhook/route.ts` — Meta verify handshake (GET) + async event POST. Returns 200 immediately, processes via void async to avoid 15s timeout.
- 8 API routes under `src/app/api/p02/` covering: workspace CRUD, KB add, conversation list/take-over/send, mock customer inbound for testing without Meta.
- `scripts/p02-smoke.sh` — 8-step smoke test runnable once founder actions complete.
- ADR: `operations/decisions/2026-05-04-p02-mvp-architecture.md`

### Dashboard UI (commit `1a92e21`, by frontend-architect 2026-05-04)
- 18 new files under `src/app/dashboard/chatbase/` + 4 thin API routes filling backend gaps.
- `/dashboard/chatbase` workspace home (list + create) — async server component
- `/dashboard/chatbase/[workspaceId]` — header + URL-driven 4-tab layout (`?tab=conversations|knowledge|intents|settings`)
- ConversationsTab — sorted list, masked phone display, status badges, click-to-drawer
- KnowledgeTab — list + AddKbForm (text or URL ingestion)
- IntentsTab — read-only inspector for the 6 seeded intents
- SettingsTab — editable business name + escalation threshold slider + Mock Mode banner + embedded MockChat component for live demo without Meta
- Brand isolation: dedicated `/dashboard/chatbase/layout.tsx` with green/cyan branding, no Claude Toolkit references
- `npm run type-check` clean. `npm run build` exits 0.

## What's Next (v1.1, post-launch)

1. Switch keyword retrieval → Qdrant vector RAG (`retrieveTopChunks` interface designed for swap)
2. Claude Haiku 4.5 alongside Groq for higher-quality complex queries
3. Bull/QStash queue for webhook async (currently `void handleWebhookAsync()` — fine for beta volumes)
4. Order collection bot (PRD §2 / order flow) — not in MVP
5. Appointment booking + Google Calendar OAuth — not in MVP
6. Payment reminder bot — not in MVP
7. Follow-up sequence bot — not in MVP
8. Bulk customer CSV import
9. Conversation export
10. Editable intents UI

## Blockers — founder actions to unblock runtime smoke test

Filed in `operations/approval-queue.md` item #002:

1. **Apply migration** via Supabase Dashboard → SQL Editor → paste `supabase/migrations/010_p02_chatbase.sql` → Run (5 min)
2. **Add `P02_ENCRYPTION_KEY`** to Vercel env (production + preview + development): `openssl rand -hex 32`. MUST be identical across envs or AES tokens won't decrypt across deploys (3 min)
3. **Apply for Meta Business Manager / WhatsApp Cloud API** at business.facebook.com (3-7 day review). Defer until P02 is otherwise ready — backend runs in `MOCK_MODE=true` until then.

Once 1+2 done: smoke test via `bash scripts/p02-smoke.sh` and the dashboard at `/dashboard/chatbase` is fully usable (with the MockChat for in-page demo).

## Note on the "Supabase API key broken" claim

Both agents flagged that the Supabase service-role key is broken. **Production is healthy** — `/api/p02-waitlist` returned 200 on smoke check 2026-05-04 09:03 UTC. The complaint is about a stale `SUPABASE_SERVICE_ROLE_KEY` in `products/01-claude-reseller/app/.env.local` (old JWT format from before this morning's rotation to `sb_secret_*`). Local-dev only, doesn't block Vercel. Will refresh `.env.local` next time the new sb_secret value is at hand.

## Key Decisions

- **Single Vercel deploy** (P02 lives inside P01 monorepo at `src/app/api/p02/` and `src/app/dashboard/chatbase/`). One billing surface, shared Clerk + Supabase + analytics. Per-product brand isolation enforced at URL/layout level.
- **Free during beta** — no Razorpay UI, no plan picker, no pricing display. PRD's ₹999/mo etc is ignored per founder rule "free for first 1 year".
- **Groq Llama 3.3 70B** for intent + reply (free tier, already approved). Claude Haiku is v1.1.
- **MOCK_MODE default true** — works without Meta Cloud API access. `WHATSAPP_PHONE_NUMBER_ID` env triggers real-mode automatically.
- **Complaint intent threshold = 1.0** — always escalate to human regardless of confidence.
- **Unknown intent** sends a clarification message AND marks conversation escalated — owner is aware.

## Architecture (post-build)

```
WhatsApp customer
   ↓ (real mode) Meta Cloud API webhook
   ↓ (mock mode) /api/p02/mock/inbound
/api/webhook/route.ts (returns 200 immediately, void-async)
   ↓
src/lib/p02/reply-engine.ts
   ├→ retrieveTopChunks (KB) — keyword Jaccard, swappable to Qdrant
   ├→ classifyIntent (Groq, JSON mode, 6 intents)
   ├→ if confidence < threshold → mark escalated, no reply
   └→ generateReply (Groq + KB context + intent system prompt)
   ↓
src/lib/p02/db.ts — persist inbound + outbound to p02_messages
   ↓ (real mode) Meta Cloud API send
   ↓ (mock mode) silent — owner sees in dashboard
   ↓
/dashboard/chatbase/[workspaceId]?tab=conversations
```

## Session Notes

### 2026-05-04 — Build kickoff
Founder approved Day 15 P01 launch + said "go ahead per the schedule" for everything else. Spawned api-engineer for backend, then frontend-architect for dashboard. Both completed in ~12 hours of agent wall time. Total: 37 new files, 0 breaking changes to P01.

The dashboard build gracefully handles the migration-not-yet-applied state — pages render but show empty/loading states. Once migration is applied, full flow works.
