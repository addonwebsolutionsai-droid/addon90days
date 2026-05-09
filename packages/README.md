# `packages/` — canonical library shelf for the multi-app monorepo

> **This is the single source of truth for every shared utility used across our 6 product apps.** Each product's `app/src/lib/` holds a *physical copy* of the relevant package, refreshed by `node scripts/sync-libs.mjs` from the repo root. This is **Path D** — see `operations/decisions/2026-05-09-multi-app-product-separation.md` for why we landed here after Paths A and B failed.

## Why this layout

- **Path A (npm workspace symlinks)** — broke Vercel because each product's Vercel project has Root Directory = `products/<id>/app/` and never sees workspace-hoisted symlinks. Reconfiguring Vercel was out-of-scope (founder-only action).
- **Path B (per-product physical duplication, hand-maintained)** — wastes tokens/time the moment any shared utility changes; six divergent copies of every util within weeks.
- **Path D (canonical packages/ + scripted sync)** — `packages/<name>/src/` holds the canonical version. `scripts/sync-libs.mjs` walks every product's `app/src/lib/` and copies the relevant subset in. Vercel sees real files at deploy time. Single source of truth. Plug-and-play for any new product.

## Mental model

```
packages/<name>/src/        ← edit here (canonical)
        │
        ▼  node scripts/sync-libs.mjs
        │
products/01-claude-reseller/app/src/lib/<dest>/   ← physical copy, committed
products/02-whatsapp-ai-suite/app/src/lib/<dest>/ ← physical copy, committed
products/03-gst-invoicing/app/src/lib/<dest>/      ← physical copy, committed
… and so on for P04, P05, P06
```

Each product's app uses ordinary `@/lib/<file>` imports — Vercel sees real code at the path it expects. No workspace plumbing.

## Packages

Each package's `package.json` declares an `addonweb.sync` block telling the script *where* its files land in each product. The sync metadata supports:

- `destBase` (default `"lib"`) — the top-level dir under `app/src/`. Use `"components"` for UI components, `"lib"` for everything else.
- `destSubdir` (default `""`) — sub-directory under `destBase`. `""` means files land flat at the top level of `destBase`.
- `files` — explicit list of files in `packages/<name>/src/` to copy.
- `products` — array of product codes (`p01`..`p06`) to sync to. Missing app directories are skipped silently.

| Package | Source files (in `packages/<name>/src/`) | Lands in `products/<id>/app/src/...` |
|---|---|---|
| `@addonweb/db-client`    | `supabase.ts` | `lib/supabase.ts` (flat) |
| `@addonweb/auth`         | `admin-guard.ts`, `rate-limit.ts` | `lib/{admin-guard,rate-limit}.ts` |
| `@addonweb/rbac`         | `rbac.ts`, `rbac-admin.ts`, `audit.ts` | `lib/{rbac,rbac-admin,audit}.ts` |
| `@addonweb/ai-support`   | `engine.ts`, `db.ts`, `admin-handlers.ts`, `route-handlers.ts` | `lib/ai-support/` |
| `@addonweb/billing`      | `db.ts`, `razorpay-client.ts` | `lib/billing/` |
| `@addonweb/cms`          | `db.ts` | `lib/cms/` |
| `@addonweb/tutorials`    | `auto-translate.ts`, `db.ts`, `storage.ts` | `lib/tutorials/` |
| `@addonweb/admin-shell`  | `PlaceholderPanel.tsx`, `ProductSubNav.tsx` | `components/admin/` |
| `@addonweb/ui-tokens`    | (placeholder — design tokens to be added) | `app/globals-tokens.css` (planned) |

`packages/db-client/src/database.types.ts` is intentionally NOT synced — each product owns its schema view (P01 has the full Skill schema; P02/P03/etc. start with a minimal Database shape and add typed tables as they grow).

The package manifest's `addonweb.sync.products` array picks which products get the sync (default: all 6 — but only existing `products/<id>/app/` directories are touched).

## Editing flow

1. Make the edit inside `packages/<name>/src/<file>.ts`.
2. From the repo root: `node scripts/sync-libs.mjs`. This overwrites every product's local copy.
3. `git diff` will show the change replicated across each product's `lib/`.
4. Commit. CI runs each product's type-check + build and catches regressions.

**Do not edit the in-product copy directly.** It will be overwritten by the next sync. (The script also writes a `// AUTO-SYNCED FROM packages/<name> — DO NOT EDIT HERE` banner on top of every synced file as a reminder.)

## Adding a new shared package

1. `mkdir -p packages/<name>/src`
2. Add a `package.json` with the `addonweb.sync` block (see existing packages for shape)
3. Drop the source files into `packages/<name>/src/`
4. Update this README's table
5. Run `node scripts/sync-libs.mjs` to propagate

## Why we don't use `transpilePackages` or workspace imports

Both reintroduce the Vercel-Root-Directory problem we already solved. The sync approach is dumber, more verbose on disk, and works on every CI/deploy stack without configuration.

## Versioning + publishing

All packages stay `0.1.0` and `private: true`. We do not publish to npm. They are templates that the sync script copies — nothing more.
