# `packages/` — shared code for the multi-app monorepo

Each subdirectory here is a workspace package consumed by one or more product apps under `products/<id>/app/`.

## Packages

| Package | Purpose | Phase 1 source |
|---|---|---|
| `@addonweb/db-client`    | Supabase client + Database type definitions | from `products/01-claude-reseller/app/src/lib/{supabase,database.types}.ts` |
| `@addonweb/auth`         | Clerk wrappers + admin-guard env-list bypass | from `products/01-claude-reseller/app/src/lib/admin-guard.ts` |
| `@addonweb/rbac`         | Role/permission system + audit log | from `lib/{rbac,rbac-admin,audit}.ts` |
| `@addonweb/ai-support`   | Shared support engine (intent + KB + reply) | from `lib/ai-support/*` |
| `@addonweb/billing`      | Razorpay client + plan/subscription/invoice/refund helpers | from `lib/billing/*` |
| `@addonweb/cms`          | Posts/FAQs/categories DB layer | from `lib/cms/*` |
| `@addonweb/ui-tokens`    | Design token CSS variables (`--bg-base`, `--text-primary`, etc.) | from `globals.css` extraction |
| `@addonweb/admin-shell`  | Shared admin sidebar, layout, panel components | from `components/admin/*` + `app/admin/layout.tsx` |
| `@addonweb/tutorials`    | Tutorial viewer modal + auto-translate pipeline | from `lib/tutorials/*` (when shipped) |

## Status

**All packages are placeholder shells right now (Phase 0).** The actual code lift from `products/01-claude-reseller/app/src/lib/*` happens in Phase 1 (next session). See `operations/decisions/2026-05-09-multi-app-product-separation.md`.

## Adding a new shared package

1. `mkdir -p packages/<name>/src`
2. Add a `packages/<name>/package.json` mirroring the template below
3. Add a `packages/<name>/tsconfig.json` extending the shared root tsconfig (when one exists; for now copy from an existing package)
4. Update `packages/README.md` (this file)
5. Consumers reference it as `"@addonweb/<name>": "*"` in their `package.json` `dependencies`

## Versioning

All packages stay at `0.1.0` and `private: true` until we decide to publish anything externally. Internal consumers use `*` semver — they get whatever's in the workspace.

## Build

Most packages are TypeScript that consumers import directly (Next.js compiles them as part of its build via `transpilePackages` in the consumer's `next.config.ts`). We don't run a separate `tsc` build per package — the consumer compiles them.
