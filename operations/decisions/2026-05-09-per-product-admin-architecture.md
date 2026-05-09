# Per-product admin architecture — investor-ready transferable products

**Date:** 2026-05-09 (Day 12)
**Status:** Approved by founder. In flight.
**Author:** main agent + cto

---

## Context

Founder feedback: each product needs to be a self-contained admin panel with full management features so each is an investor-ready transferable asset. Reference scope (Studynash spec) lists:

- Manage Admin Users + Roles & Rights
- Manage Customers / Registrations / Approvals
- Manage Plans + Payments + Invoices + Refunds
- Manage CMS (Blogs / FAQs / Categories / Sub-Categories / Tags / Keywords)
- Manage Forums (with comments)
- Activity logs + audit trail
- Reports + analytics
- SEO + marketing
- Enable / disable any entity (categories, plans, items)

Founder's specific questions:
1. "If I give rights to my employees how can I give?" → **RBAC** (roles + permissions)
2. "If I want to manage users how will I do?" → **Users panel per product**
3. "If I want to update CMS contents how will I do?" → **CMS layer (categories + posts + FAQs)**
4. "If I want to disable categories or skills how can I do?" → **Activation flags + admin toggle**
5. "If I want to add payment plans, take payments, refunds — how?" → **Plans + Subscriptions + Refund flow**

## Decision

### 1. Per-product admin URL space (already in place, deepen it)

`/admin/<product>/*` is the boundary. Each product is fully self-contained:

```
/admin/<product>/
  page.tsx                # overview + KPIs
  team/                   # RBAC: invite admin users, assign roles
  users/                  # end-user management (existing /admin/chatbase/users pattern)
  plans/                  # subscription tiers (price, features, activation)
  billing/                # transactions, invoices, refunds
  cms/                    # blog posts, FAQs, categories
  settings/               # product config, integrations, SEO
  activity/               # audit log, this product only
  reports/                # custom reports + exports
```

This URL shape means each product directory is **literally extractable** later: when we sell P02 to an investor, we copy `/admin/p02-chatbase/*` + `/lib/p02/*` + `/api/admin/chatbase/*` + the `p02_*` DB tables to a new repo and ship.

### 2. Shared admin infrastructure (built once, used everywhere)

Some admin concerns are cross-cutting and shouldn't be duplicated 6×:

- **RBAC**: roles + permissions + role-user assignments. One `admin_*` schema. Permissions are namespaced like `p02.intents.write`, `p03.invoices.refund`, `p04.menu.deactivate`. Each product's pages call `requirePermission("p02.intents.write")` instead of plain `requireAdmin()`.
- **Audit log**: one append-only `admin_audit_log` table. Every mutation through admin routes calls `logAdminAction()`. Per-product views filter by `resource_type LIKE 'p02_*'`.
- **Plans + payments**: Razorpay is already wired; admin layer adds plans CRUD + subscription view + refund button. Tables prefixed `billing_*` so they survive a per-product extract (each product needs to know which subscriptions belong to it).
- **CMS**: blog posts + categories + FAQs. Tables prefixed `cms_*`. Each post can be tagged with a `product_scope` so a single editor manages all products' content. Per-product admin filters its own scope.

When we extract a product, the shared schema travels with it. RBAC + audit + plans + CMS are part of the standard "what a product needs to operate."

### 3. Role model

Default seed roles:
- **`super_admin`** — every permission, never deletable
- **`product_admin_<id>`** — full control of one product (one role per product)
- **`support_agent`** — read-only across all products + ability to take-over conversations / mark refunds requested
- **`content_editor`** — CMS-only across all products
- **`finance`** — billing + plans + refunds across all products

Founder = `super_admin` (the existing `ADMIN_USER_IDS` env stays as a "break-glass" for anyone with no DB role).

### 4. Migration ordering

| Phase | Migration | What |
|---|---|---|
| **A** (this turn) | `013_admin_rbac.sql` | Roles, permissions, user-roles, audit log. Seed 5 default roles + ~40 permissions. |
| **A** (this turn) | `014_cms.sql`         | `cms_categories`, `cms_posts`, `cms_faqs`. Per-product scope column. |
| **A** (this turn) | `015_billing.sql`     | `billing_plans`, `billing_subscriptions`, `billing_invoices`, `billing_refund_requests`. Razorpay IDs stored. |
| B (next turn)     | (none — UI build)     | Build the /admin/<product>/team, /plans, /billing, /cms pages on top of the schema. |
| C (next turn)     | (none — wire-up)      | Replace existing `requireAdmin()` calls with `requirePermission(...)`. |

### 5. What changes for existing admin pages

Existing `/admin/chatbase/*`, `/admin/taxpilot/*` keep their URLs. Behind the scenes:
- The blanket `requireAdmin()` gate becomes `requirePermission("<product>.<area>.read")` per-route.
- Founder still works (super_admin role grants everything; ADMIN_USER_IDS env still bypasses for emergencies).
- New employee added via /admin/p02-chatbase/team gets only the permissions of the role assigned. They land on /admin/chatbase but see only the panels they have permission for.

## Added 2026-05-09 (founder follow-up)

### 6. Tutorials per product, per feature

Each product needs in-product video tutorials with English audio + subtitles + audio translations to other languages. Per-feature granularity (not just one big "intro" video).

Schema (migration `016_tutorials.sql`, Phase B):
- `tutorials` table — id, product_id ('p01'..'p06'), feature_key (e.g. 'p02.intent.create'), title, description, sort_order, is_active, created_at, updated_at
- `tutorial_videos` table — id, tutorial_id, language_code ('en','hi','gu','ta','te','mr'), video_url (Supabase Storage), thumbnail_url, captions_url (WebVTT), audio_track_url (separate translated audio override), duration_sec, is_default
- `tutorial_views` table — id, tutorial_id, clerk_user_id (nullable), language_code, watched_seconds, completed, viewed_at — for analytics

Admin UI at `/admin/<product>/tutorials`: CRUD tutorials + upload videos to Supabase Storage + auto-generate captions (Whisper) + auto-translate captions (Claude Haiku) + optional auto-TTS the translated track. The auto-generation pipeline is a single "Generate translations" button per video.

User-facing: each product page that has a tutorial shows a small "?" / "How does this work?" pill. Click opens a modal player. The player auto-picks the user's preferred language (browser lang) with a switcher in the corner. When extracting a product to a new repo, both `tutorials` rows AND the Storage bucket (per product) travel with it.

### 7. AI support system per product (each independent)

Founder wants ChatBase-style AI support **on each product's marketing + dashboard surfaces** — independent KBs, independent conversation history, independent intent sets, so each product is investor-ready.

Approach:
- **Reuse the P02 ChatBase tech**: the intent classifier, KB retrieval, and reply engine in `lib/p02/intent.ts`, `lib/p02/kb.ts`, `lib/p02/reply-engine.ts` are already production-tested.
- **Don't reuse the P02 *DB tables*** — extracting P02 should not orphan P01 support data. Each product gets its own `<product>_support_kb`, `<product>_support_conversations`, `<product>_support_messages` tables (migration `017_support.sql`).
- **Shared engine library** at `lib/ai-support/` — pure functions: `classifyIntent`, `retrieveKb`, `generateReply`. Each product calls them with its own table name + KB context. When P02 is extracted, this lib travels (it's tiny).
- **Channel surfaces** per product:
  - Floating chat widget on the product's marketing page (`/chatbase`, `/taxpilot`, etc.)
  - In-app `/support` route on the product's dashboard
  - (Eventually) email + Slack inbound, WhatsApp inbound (P02 already does WhatsApp for itself)
- **Admin UI** at `/admin/<product>/support`:
  - KB management (mirrors the P02 admin KB CRUD we just built — but scoped to the product's own table)
  - Intent CRUD (same)
  - Conversation list with takeover (same)
  - Analytics: most-asked questions, escalation rate, AI-handled %

Each product's KB stays separate. The classifier model is shared (Groq Llama 3.3 70B) — that's just an API call, not state.

### 8. Updated migration ordering

| Phase | Migration | What | Built by |
|---|---|---|---|
| **A** (in flight 2026-05-09) | `013_admin_rbac.sql` | RBAC + audit | main agent |
| **A** (in flight) | `014_cms.sql`         | Blogs + FAQs + categories | ui-builder agent |
| **A** (in flight) | `015_billing.sql`     | Plans + subscriptions + invoices + refunds | api-engineer agent |
| **B** (next sprint) | `016_tutorials.sql` | Tutorials + videos + views | (delegate) |
| **B** (next sprint) | `017_support.sql`   | Per-product support KB / convos / messages × 6 | (delegate) |
| C (next sprint) | (none — UI build) | /admin/<product>/team /plans /billing /cms /tutorials /support per product | parallel agents |

## Out of scope this sprint

- Forum (per Studynash spec) — defer until any product actually wants user-generated content
- Per-employee MFA enforcement — Clerk handles this today
- Audit log retention policy / archival — defer to ops
- Per-customer impersonation ("login as user") — risky, defer behind a separate feature flag

## Execution plan (this turn)

Three parallel agent runs + main agent:

| Agent | Owns | Output |
|---|---|---|
| **main agent** (me) | RBAC foundation | migration `013_admin_rbac.sql`, `lib/rbac.ts`, `lib/audit.ts`, `/admin/team/*` pages |
| **api-engineer** | Plans + payments | migration `015_billing.sql`, Razorpay subscription wiring, refund-request flow, admin billing pages |
| **ui-builder** | CMS layer | migration `014_cms.sql`, `/admin/cms/*` pages (categories, posts, FAQs CRUD) |
| **frontend-architect** | Per-product admin overview redesign | layout shell at `/admin/<product>/*` with consistent sub-nav (overview, team, users, plans, billing, cms, settings, activity) — pulling existing pages into the new shell |

Then one final commit pulls it all together with the requirePermission rewrite.

---

_Reviewed and approved by founder via "deliver what is needed" instruction on 2026-05-09._
