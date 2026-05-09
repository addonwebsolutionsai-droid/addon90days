/**
 * @addonweb/auth — Clerk-based admin gate via the env-list ADMIN_USER_IDS.
 *
 * Lifted from products/01-claude-reseller/app/src/lib/admin-guard.ts in
 * Phase 1 of the multi-app split.
 */

export {
  requireAdmin,
  type AdminCheckResult,
  type AdminDenyResult,
} from "./admin-guard";
