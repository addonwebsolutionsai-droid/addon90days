# TableFlow — P04 Smart restaurant OS

Future home of the standalone Next.js app for this product.

## Status

**Phase 0 placeholder.** Today, TableFlow-related code (if any) lives inside `products/01-claude-reseller/app/` mixed with SKILON. The extraction to this dedicated app happens in a later phase per the multi-app split plan:

- See: `operations/decisions/2026-05-09-multi-app-product-separation.md`
- Phase 3-5 of that decision covers extracting / building this product as its own Next.js app.

When this app is set up, it will:
- Have its own `package.json` consuming `@addonweb/*` shared packages from `packages/`
- Have its own `vercel.json` and Vercel project
- Have its own marketing pages, owner dashboard, and admin panel
- Read `p0X_*` tables from the shared Supabase project (eventually moves to its own DB when sold to investor)
- Have its own AI support, tutorials, CMS-scope rows, billing-scope rows

## Until then

The PRD at the parent `PRD.md` and the agent instructions at `.claude/CLAUDE.md` are the source of truth for what this product does.
