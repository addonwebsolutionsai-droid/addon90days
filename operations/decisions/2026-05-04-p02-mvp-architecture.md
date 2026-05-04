# ADR: P02 ChatBase — MVP Backend Architecture
**Date:** 2026-05-04  
**Status:** Accepted  
**Deciders:** @api-engineer  
**PRD ref:** products/02-whatsapp-ai-suite/PRD.md

---

## Context

P01 Claude Toolkit launched on Day 15. P02 ChatBase backend must be live by Day 30 (2026-05-22). We have 18 days. Meta Business API verification is blocked (3-7 day external process). Founder directive: free during beta, no payment UI. Reuse the existing P01 Vercel + Supabase deployment — no new infra.

## Decision

Build the entire P02 backend **inside** `products/01-claude-reseller/app/` rather than spinning up a new app or a Fastify service. All API routes go under `src/app/api/p02/` and `src/app/api/webhook/`. All library code under `src/lib/p02/`. This delivers ONE Vercel deployment, ONE Supabase project, zero new infrastructure cost.

## Consequences

**Good:**
- Ships inside existing CI/CD pipeline and Clerk tenant.
- No new env var bootstrap — reuses NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY, CLERK_* already on Vercel.
- Dashboard pages will naturally coexist with P01 pages under /dashboard/chatbase (next agent's job).

**Trade-offs:**
- Slight coupling: P01 and P02 code share the same Next.js build. Mitigated by strict module boundary (all P02 code lives under src/lib/p02/ and src/app/api/p02/).
- No BullMQ (no Redis in this stack). Webhook handler processes async by using Next.js Response.json() immediately then running the reply engine with `void processAsync(...)`. This is acceptable for MVP — Vercel Fluid Compute keeps the function warm for ~30s post-response. If load spikes, we add Upstash QStash (v1.1).

## Alternatives rejected

- **Fastify on Railway:** Extra infra, extra cost, extra deployment complexity. Violates "no new infra" constraint.
- **Separate Next.js app in products/02-whatsapp-ai-suite/app/:** Two Vercel deployments, two Supabase projects, two Clerk instances. Over-engineered for beta.
- **Supabase Edge Functions:** Cold starts too variable for webhook 200ms SLA.

## Schema decisions

- Table prefix: `p02_` on all new tables to avoid collision with P01 tables.
- `p02_workspaces.mock_mode boolean default true` — controls whether outbound messages go to Meta API or are silently stored only.
- `p02_workspaces.whatsapp_access_token_enc bytea null` — token stored encrypted. Encryption: AES-256-GCM via `crypto.subtle` using `P02_ENCRYPTION_KEY` env var (32-byte hex). When null, mock mode is enforced regardless of the `mock_mode` flag.
- Escalation threshold: default 0.7 (CLAUDE.md says 70%; PRD says 75%; we use 0.7 as the canonical default, overridable per workspace).
- RLS: service-role only on all p02_ tables. Dashboard routes authenticate via Clerk, scope by workspace_id, and use the service-role client.

## AI provider

Groq Llama-3.3-70B (already in use in P01, already on Vercel env, free tier). The PRD originally specified Claude Haiku — deferred to v1.1 when Anthropic spend budget is approved. Intent classification and reply generation both use the same Groq endpoint.

## Intent seeding

6 intents seeded in migration from CLAUDE.md:
1. price-inquiry
2. order-placement
3. invoice-request
4. payment-status
5. complaint (auto-escalate: threshold 1.0 forces human)
6. unknown (threshold 1.0 forces clarification request, not escalation)

## Mock mode design

- `MOCK_MODE=true` (env) is a global kill-switch — overrides per-workspace flag. When true, no calls to graph.facebook.com are made.
- `WHATSAPP_PHONE_NUMBER_ID` env var being set is a necessary condition for real-mode sends. If absent, mock mode is forced.
- `/api/p02/mock/inbound` endpoint simulates what Meta's webhook would POST, runs through identical pipeline. Rate limited to 50/hr per IP.

## Webhook async pattern

```
POST /api/webhook → 200 immediately → void replyEngine.process(payload)
```

Vercel Fluid Compute holds the function instance alive after response. If processing >15s, message is logged but no reply is sent (customer gets nothing — better than a WhatsApp error). Monitoring via Sentry.

## New env vars required (Vercel)

| Var | Required | Default | Notes |
|-----|----------|---------|-------|
| META_WEBHOOK_VERIFY_TOKEN | Production only | — | Random string, set during Meta app config |
| WHATSAPP_PHONE_NUMBER_ID | Production only | — | From Meta app dashboard |
| WHATSAPP_ACCESS_TOKEN | Production only | — | System user token from Meta |
| P02_ENCRYPTION_KEY | Yes (all envs) | — | 32-byte hex string for AES-256-GCM |
| MOCK_MODE | Optional | true | Set to "false" when going live with real Meta |

Note: GROQ_API_KEY and all Supabase + Clerk vars already exist on Vercel from P01.

## Files to be created

```
supabase/migrations/010_p02_chatbase.sql
products/01-claude-reseller/app/src/lib/p02/types.ts
products/01-claude-reseller/app/src/lib/p02/db.ts
products/01-claude-reseller/app/src/lib/p02/encrypt.ts
products/01-claude-reseller/app/src/lib/p02/kb.ts
products/01-claude-reseller/app/src/lib/p02/intent.ts
products/01-claude-reseller/app/src/lib/p02/reply-engine.ts
products/01-claude-reseller/app/src/lib/p02/meta-api.ts
products/01-claude-reseller/app/src/app/api/webhook/route.ts
products/01-claude-reseller/app/src/app/api/p02/workspaces/route.ts
products/01-claude-reseller/app/src/app/api/p02/workspaces/[id]/route.ts
products/01-claude-reseller/app/src/app/api/p02/workspaces/[id]/kb/route.ts
products/01-claude-reseller/app/src/app/api/p02/workspaces/[id]/conversations/route.ts
products/01-claude-reseller/app/src/app/api/p02/conversations/[id]/take-over/route.ts
products/01-claude-reseller/app/src/app/api/p02/conversations/[id]/send/route.ts
products/01-claude-reseller/app/src/app/api/p02/mock/inbound/route.ts
products/02-whatsapp-ai-suite/.env.required.md
scripts/p02-smoke.sh
```

## CTO review needed

No. All decisions are within scope of @api-engineer. No new external dependencies added (reusing Groq, Supabase, Clerk already approved). No schema change touching >3 existing P01 tables (all new p02_ tables). No security concern — encryption key is an env var, tokens stored encrypted, RLS enforced.
