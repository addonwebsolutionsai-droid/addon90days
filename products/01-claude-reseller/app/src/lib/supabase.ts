/**
 * Backwards-compat re-export shim.
 *
 * The actual Supabase client lives in `@addonweb/db-client` (packages/db-client/src/).
 * This shim keeps existing `@/lib/supabase` imports working during the
 * Phase 1 lift (see operations/decisions/2026-05-09-multi-app-product-separation.md).
 *
 * New code should import from `@addonweb/db-client` directly.
 */

export {
  getSupabase,
  getSupabaseAdmin,
  supabase,
  supabaseAdmin,
} from "@addonweb/db-client";
