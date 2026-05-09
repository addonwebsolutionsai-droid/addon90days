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

---

## Update — 2026-05-09 evening: pivot from Path A (shared packages) to Path B (per-product duplication)

### What broke

Phase 1 attempted to lift cross-product libs into `packages/*` workspace packages. Type-check passed locally. **Vercel build failed** because P01's Vercel project Root Directory = `products/01-claude-reseller/app/`. Vercel ran `npm install` there only — workspace symlinks for `@addonweb/*` never got created.

Fix would have required reconfiguring P01's Vercel project (Root Directory + Install Command + Build Command + Output Directory) — UI-only, founder action. Founder explicitly said: do everything yourself, no escalations.

### Revised approach: Path B — per-product physical duplication

Each product's app dir owns its OWN copy of shared utilities. No workspace, no shared `packages/`, no Vercel monorepo config.

```
products/02-whatsapp-ai-suite/app/src/lib/
  supabase.ts          ← copied from P01
  admin-guard.ts       ← copied from P01
  rate-limit.ts        ← copied from P01
  audit.ts             ← copied from P01
  rbac.ts              ← copied from P01
  rbac-admin.ts        ← copied from P01
  site-config.ts       ← P02-specific (ChatBase, not SKILON)
  p02/                 ← P02-specific business logic
```

When a shared utility changes, propagate manually to each product's copy. The duplication tax is small for code that changes rarely. The win is operational independence — no founder-Vercel dependency.

### Why Path B works WITHOUT founder Vercel involvement

P02 already has its own Vercel project deploying from `products/02-whatsapp-ai-suite/app/`. Same for P03/P04 once they're set up (they have their own `vercel.json` files / can be deployed via `git subtree` or new Vercel projects). Each Vercel project lives independently. Env vars are per-Vercel-project (Supabase URL is shared since they read the same DB, but the deploy is its own).

### `packages/` directory — keep as architectural tombstone

Mark it abandoned in `packages/README.md` for future reference. Don't delete — useful as a record of the lessons.

### Revised migration phases

| Phase | Work |
|---|---|
| 0 (DONE) | Decision doc + workspace scaffold (shipped 2026-05-09 morning) |
| 1 (ATTEMPTED, REVERTED) | Lift to `packages/*` — failed, reverted |
| **2 (NOW)** | **Extract P02 ChatBase to products/02-whatsapp-ai-suite/app/ with copied utilities** |
| 3 | Extract P03 TaxPilot — same pattern |
| 4 | Extract P04 TableFlow — same pattern |
| 5 | Build P05 ConnectOne + P06 MachineGuard fresh in their own apps |
| 6 | Per-product domains — founder buys + DNS, can wait |

### After all products are extracted

`products/01-claude-reseller/app/` becomes JUST P01 SKILON:
- Marketing: /, /skills/*
- API: /api/skills/*, /api/admin/skills/*, /api/whoami
- Owner dashboard: /account/*
- Admin: /admin (SKILON-only)
- Lib: P01's copy of supabase + admin-guard + audit + rbac + rate-limit (no longer cross-product)

P02-P06 admin sub-trees + API routes get DELETED from P01 once each product's own app is live + smoke-tested.

### Tradeoffs accepted

| Concern | Path A (lifted) | Path B (duplicated) |
|---|---|---|
| Code duplication | none | ~500 lines × 6 = ~3,000 lines duplicated |
| Vercel config | needs UI/API changes | works with existing per-app `vercel.json` |
| Founder dependency | high | zero |
| Extraction-to-investor | clean | clean |
| Update shared util | one place | propagate to each product (small) |

---

## Update — 2026-05-09 night: pivot from Path B to Path D — `packages/` as plug-and-play library shelf, products receive copies via sync

### What founder pushed back on

After Path B was settled, founder said: *"the features you are developing which are commonly used in any of the products or any other upcoming projects should have library / common global features which can easily implemented in another project to save tokens, time to develop and by this way we have lots of ready to plug and play libraries of common features."*

Path B (pure duplication) means six divergent copies of every shared utility within a few weeks — exactly the "wastes tokens, wastes time" outcome the founder is calling out.

### Path D — `packages/*` as canonical, products receive copies via `sync-libs`

**Architecture:**
- `packages/<name>/src/*.ts` is the **single source of truth** for every shared library (auth, rbac, audit, billing, cms, ai-support, tutorials, db-client, ui-tokens, admin-shell).
- Each product's `app/src/lib/<name>/` holds a **physical copy**, refreshed by running `node scripts/sync-libs.mjs` from the repo root.
- The sync script walks each product directory and overwrites the lib copy with the latest from `packages/`. Idempotent. Diff-friendly.
- Each product's app imports from its own `@/lib/<name>` — relative, simple, Vercel-friendly. No workspace symlinks. No monorepo gymnastics.

**Plug-and-play for new products:** when scaffolding P05 ConnectOne or any future product, scaffold its `app/` and run `sync-libs` — it inherits all the libraries baseline. New product is "plug-and-play ready" without re-coding anything.

**Update flow:** edit `packages/<name>/`, run `sync-libs`, commit. The diff shows up across all products at once. CI verifies each product builds.

**Extraction flow:** when selling P02, the new buyer gets `products/02-whatsapp-ai-suite/app/` plus `packages/` (or just the parts P02 used). They can keep importing from `@/lib/<name>` exactly like before — fully self-contained.

### Why this works where Path A failed

- Vercel's per-app project Root Directory (`products/02/app/`) STILL doesn't see `packages/`. **But that's fine** — Vercel only sees `app/src/lib/<name>/` which has actual code (a copy). No symlink resolution needed at deploy time.
- npm install runs only inside the app dir as before.
- TypeScript path alias is just `@/*` → `./src/*` — same as today.
- Zero workspace config required. Zero Vercel UI changes required.

### Path D vs the others

| Concern | Path A (workspaces) | Path B (pure copy) | **Path D (canonical + sync)** |
|---|---|---|---|
| Code duplication | none | high | high (but generated, not hand-maintained) |
| Vercel config | needs UI changes | none | none |
| Founder dependency | high | zero | zero |
| Single source of truth | yes | no | **yes** |
| Plug-and-play for new products | yes | no | **yes (run sync)** |
| Update propagation | automatic | manual | **scripted (one command)** |
| Extraction to investor | clean | clean | clean |

### Implementation order (revised again)

| Phase | Work | Status |
|---|---|---|
| 0 | Decision doc + workspace scaffold | shipped |
| 1 | (attempted) workspace lift | reverted (Vercel build failed) |
| 2 | Extract P02 ChatBase to its own app | **in progress (agent running)** |
| **2.5** | **Lift canonical libs into `packages/*` + write `scripts/sync-libs.mjs`** | **next** |
| 3 | Same as Phase 2 for P03 TaxPilot, scaffold from packages/ via sync | next session |
| 4 | Same for P04 TableFlow | next session |
| 5 | Build P05 + P06 fresh — they get baseline libs from packages/ via sync from day 1 | iterative |

The agent currently extracting P02 will leave it with copies of P01's libs. After Phase 2.5 (canonicalising packages/), I'll re-run sync to bring P02's copies into alignment with the canonical version. Idempotent.

### `packages/` directory — un-deprecating it

The "abandoned" notice in `packages/README.md` is wrong now. Path D resurrects packages/ as the canonical library shelf. Update that README to reflect the new role.
