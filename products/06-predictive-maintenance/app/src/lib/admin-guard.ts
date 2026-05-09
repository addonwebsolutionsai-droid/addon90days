// AUTO-SYNCED FROM packages/auth/src/admin-guard.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:20:51.980Z
import { auth } from "@clerk/nextjs/server";

/**
 * Admin gate for /admin/* and /api/admin/*.
 *
 * Reads `ADMIN_USER_IDS` (comma-separated Clerk user IDs) from env.
 * Trim, compare strict. Empty env → no admins → all denied (closed by default).
 *
 * The ID list lives in env (not the database) for two reasons:
 *   1. We don't want a SQL injection or RLS bypass to grant anyone admin.
 *   2. It survives the database being reset / migrated / wiped.
 */

export interface AdminCheckResult {
  ok: true;
  userId: string;
}

export interface AdminDenyResult {
  ok: false;
  reason: "unauthenticated" | "not_admin";
}

export async function requireAdmin(): Promise<AdminCheckResult | AdminDenyResult> {
  const { userId } = await auth();
  if (userId === null) return { ok: false, reason: "unauthenticated" };

  const raw = process.env.ADMIN_USER_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!ids.includes(userId)) return { ok: false, reason: "not_admin" };
  return { ok: true, userId };
}
