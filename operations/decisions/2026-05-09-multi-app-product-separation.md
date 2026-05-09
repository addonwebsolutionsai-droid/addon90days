# Multi-app product separation — each product is its own Next.js app

**Date:** 2026-05-09 (Day 12, evening)
**Status:** Approved by founder ("Each product is different & seperate from each other"). Multi-session refactor.
**Author:** main agent + cto

---

## Problem

Founder feedback: "Each product is different & separate from each other. Do necessary changes for that."

Today's reality:
- **P01 SKILON** lives at `products/01-claude-reseller/app/` and ALSO contains all the code for P02 ChatBase (admin + dashboard + marketing + 50+ API routes), P03 TaxPilot (full backend + dashboard), P04 TableFlow (backend), and the per-product admin shells for P05/P06.
- **P02 ChatBase** has its own scaffold at `products/02-whatsapp-ai-suite/app/` but it's an old Gemini-based version from before this sprint — never touched in the last 12 days.
- **P03/P04/P05/P06** have no app directory at all — only PRDs.
- **No monorepo workspaces** — no top-level `package.json`, no `packages/shared/`. Each product app is theoretically independent but only one is doing real work.

This drift means none of the products can actually be sold-and-extracted. If we sell P02 to an investor, we'd have to disentangle it from the SKILON repo file by file.

## Decision

Migrate to a **proper monorepo with one Next.js app per product**, plus shared `packages/` for truly cross-product code.

### Target layout

```
addon90days/
├── package.json                    # workspaces root
├── pnpm-workspace.yaml             # OR npm workspaces config
├── packages/
│   ├── db-client/                  # Supabase client + Database types
│   ├── auth/                       # Clerk wrappers + admin-guard
│   ├── rbac/                       # role/permission system + audit log
│   ├── ai-support/                 # shared support engine (already pure)
│   ├── billing/                    # billing helpers (Razorpay)
│   ├── cms/                        # CMS helpers (still per-product DB scope)
│   ├── ui-tokens/                  # design tokens (CSS vars)
│   ├── admin-shell/                # shared admin sidebar/layout components
│   └── tutorials/                  # tutorial viewer modal + auto-translate
├── products/
│   ├── 01-claude-reseller/app/     # SKILON (already in place)
│   ├── 02-whatsapp-ai-suite/app/   # ChatBase (re-scaffold from current P01 code)
│   ├── 03-gst-invoicing/app/       # TaxPilot (extract from P01)
│   ├── 04-restaurant-os/app/       # TableFlow (extract from P01)
│   ├── 05-iot-platform/app/        # ConnectOne (build from PRD)
│   └── 06-predictive-maintenance/app/ # MachineGuard (build from PRD)
└── supabase/migrations/            # remains shared (one DB project)
```

### What's shared vs per-product

**Shared (`packages/`):**
- DB client + RBAC + audit + AI support engine + billing helpers + CMS helpers + design tokens + admin shell components + tutorial viewer
- Each product imports these via workspace dependency: `"@addonweb/rbac": "workspace:*"`

**Per-product (`products/<id>/app/`):**
- Marketing pages (homepage, pricing, etc.)
- Owner dashboard (sign-up, customer-facing flows)
- Admin panel (uses `packages/admin-shell` for chrome but per-product business logic)
- Product-specific API routes
- Product-specific lib code (e.g. `lib/p02/` for ChatBase WhatsApp logic, `lib/p03/gst-calc.ts` for TaxPilot)
- Per-product Vercel deployment with own env vars

**DB stays shared** for now (one Supabase project, table prefixes per product). When a product is sold, migrate that product's tables to a new Supabase project. Cleaner than running 6 Supabase projects today.

### What this UN-locks

- **Sell P02 to an investor** → copy `products/02-whatsapp-ai-suite/` + the `p02_*` Supabase tables + the `cms_*` rows where `product_scope = 'p02'` + the `billing_plans` rows where `product_id = 'p02'`. New repo, new Vercel project, done.
- **Different domains per product** — chatbase.io, taxpilot.io, etc. Each product app deploys to its own Vercel project, points to its own domain.
- **Different env vars per product** — P02 has its own Meta/WhatsApp env, P03 has its own GSTN env, no cross-contamination.
- **Different Clerk projects per product** (eventually) — different login flows, different user pools, different branding.

### Migration phases (multi-session)

| Phase | Work | Owner | Estimate |
|---|---|---|---|
| **0** (this session) | Decision doc + monorepo workspace scaffold + `packages/shared/` placeholder + P03/P04/P05/P06 app scaffolds | main agent | 1 hour |
| 1 | Lift truly cross-product libs from `products/01/app/src/lib/` → `packages/`. Update P01 to import from packages. Verify P01 still builds + deploys. | next session | 2 hours |
| 2 | Re-scaffold `products/02-whatsapp-ai-suite/app/` with the current P02 code (move from `products/01-claude-reseller/app/src/app/{chatbase,dashboard/chatbase,api/p02,api/admin/p02,api/admin/chatbase,api/webhook,admin/p02-chatbase}` + `lib/p02/`). Create P02-specific Vercel project. Founder must add env vars to new Vercel project. Test P02 standalone. | dedicated session | 4 hours |
| 3 | Same for P03 TaxPilot — extract to `products/03-gst-invoicing/app/`. | dedicated session | 4 hours |
| 4 | Same for P04 TableFlow. | dedicated session | 3 hours |
| 5 | Build P05 ConnectOne and P06 MachineGuard from scratch in their own apps (no extraction needed; they have only marketing). | iterative | 1-2 weeks |
| 6 | Per-product custom domains (founder buys + DNS). Per-product Clerk projects (founder action). | founder | 1 week |

### Risks + mitigations

1. **Breaking deployed P01.** Mitigation: don't move P01 code in Phase 2-4. P01 stays where it is. We extract OTHER products from it.
2. **Workspace dependency circularity.** Mitigation: shared packages have no dependencies on products. Strict one-way dependency: `products/* → packages/*`.
3. **Shared DB across separate apps.** Mitigation: each app uses the same `SUPABASE_URL` + service-role key. Migrations stay in one place. When extracting to a new repo, `pg_dump` the relevant tables.
4. **Migrations referenced by multiple apps.** Mitigation: keep `supabase/migrations/` at the repo root. Each product's app reads it for context but doesn't own it.
5. **CI / preview deployments.** Mitigation: configure Vercel to only redeploy a product when its directory or `packages/` changes. Each product's `vercel.json` defines its build root.

### What's NOT in this decision

- Don't migrate to Turborepo or Nx this turn — npm workspaces are enough.
- Don't switch to pnpm if the team is on npm — keep current package manager.
- Don't decide on per-product Clerk projects yet — that's a separate cost / UX call.
- Don't pre-buy domains — founder picks when they're closer to sale.

---

## This session's deliverable (Phase 0)

- This decision doc.
- Top-level `package.json` with npm workspaces glob `packages/*` and `products/*/app`.
- `packages/shared/` skeleton (placeholder package.json — actual code lift comes in Phase 1).
- App scaffolds for P03/P04/P05/P06 mirroring P02's pattern.
- Top-level README explaining the layout.

No code is moved yet. The deployed P01 site is unchanged.

Phase 1 starts when founder approves this decision (implicit — they pushed for it).
