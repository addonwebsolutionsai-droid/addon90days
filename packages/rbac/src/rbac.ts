/**
 * RBAC — role-based access control for the admin panels.
 *
 * Layers on top of the existing ADMIN_USER_IDS env list (which stays as a
 * "break-glass" super-admin path). Two ways to be allowed in:
 *
 *   1. Your Clerk userId is in `ADMIN_USER_IDS` env (env-side super-admin)
 *   2. You have a row in `admin_user_roles` whose role's permissions include
 *      the one you're being checked for
 *
 * Every per-route gate calls `requirePermission("p02.intents.write")` (or
 * similar). If the caller is logged out → 401. Logged in but no permission
 * → 403. Logged in with permission → handler runs.
 *
 * The 5-min in-memory cache below is per Vercel function instance; in
 * practice that means a logged-in admin's permissions are looked up once
 * per cold function invocation. Permission changes (roles assigned/revoked)
 * propagate within 5 minutes without an explicit cache bust.
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@addonweb/db-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adminTable(name: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

// ---------------------------------------------------------------------------
// Cache: per-instance, 5min TTL
// ---------------------------------------------------------------------------

interface CacheEntry { permissions: Set<string>; expires_at: number }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getEnvAdminIds(): readonly string[] {
  return (process.env["ADMIN_USER_IDS"] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Pull the union of permissions granted to a Clerk user via their assigned
 * roles. Cached 5min per instance.
 */
async function loadUserPermissions(clerkUserId: string): Promise<Set<string>> {
  const now = Date.now();
  const hit = cache.get(clerkUserId);
  if (hit !== undefined && hit.expires_at > now) return hit.permissions;

  const { data } = await adminTable("admin_user_roles")
    .select("role_id, role:role_id(admin_role_permissions(permission_key))")
    .eq("clerk_user_id", clerkUserId);

  const permissions = new Set<string>();
  if (Array.isArray(data)) {
    for (const row of data as Array<{ role: { admin_role_permissions?: Array<{ permission_key: string }> } | null }>) {
      const r = row.role;
      if (r === null || r === undefined) continue;
      for (const rp of r.admin_role_permissions ?? []) permissions.add(rp.permission_key);
    }
  }

  cache.set(clerkUserId, { permissions, expires_at: now + CACHE_TTL_MS });
  return permissions;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type RbacResult =
  | { ok: true;  userId: string; isEnvAdmin: boolean; permissions: Set<string> }
  | { ok: false; reason: "unauthenticated" | "forbidden"; userId?: string };

/**
 * Check ONE permission. Env-list users (ADMIN_USER_IDS) bypass the role
 * check entirely. Anyone else needs a role that grants the permission.
 */
export async function requirePermission(permission: string): Promise<RbacResult> {
  const { userId } = await auth();
  if (userId === null) return { ok: false, reason: "unauthenticated" };

  if (getEnvAdminIds().includes(userId)) {
    return { ok: true, userId, isEnvAdmin: true, permissions: new Set(["*"]) };
  }

  const perms = await loadUserPermissions(userId);
  if (!perms.has(permission)) return { ok: false, reason: "forbidden", userId };
  return { ok: true, userId, isEnvAdmin: false, permissions: perms };
}

/**
 * Check ANY of a list of permissions. Useful for routes that gate on
 * multiple permissions (e.g. read OR write — read is enough to view).
 */
export async function requireAnyPermission(permissions: string[]): Promise<RbacResult> {
  const { userId } = await auth();
  if (userId === null) return { ok: false, reason: "unauthenticated" };

  if (getEnvAdminIds().includes(userId)) {
    return { ok: true, userId, isEnvAdmin: true, permissions: new Set(["*"]) };
  }

  const perms = await loadUserPermissions(userId);
  for (const p of permissions) {
    if (perms.has(p)) return { ok: true, userId, isEnvAdmin: false, permissions: perms };
  }
  return { ok: false, reason: "forbidden", userId };
}

/**
 * For UI: returns the full permission set for the current user, or null if
 * not signed in. Used by admin pages to decide which buttons to show.
 */
export async function getCurrentUserPermissions(): Promise<{ userId: string; isEnvAdmin: boolean; permissions: Set<string> } | null> {
  const { userId } = await auth();
  if (userId === null) return null;
  if (getEnvAdminIds().includes(userId)) {
    return { userId, isEnvAdmin: true, permissions: new Set(["*"]) };
  }
  const permissions = await loadUserPermissions(userId);
  return { userId, isEnvAdmin: false, permissions };
}

/**
 * Tiny helper for components: env-admins always have everything.
 */
export function hasPermission(perms: Set<string>, permission: string): boolean {
  return perms.has("*") || perms.has(permission);
}

/**
 * Bust the cache for a specific user — call after role assignments change so
 * the next request sees the new permissions immediately.
 */
export function invalidateUserPermissionsCache(clerkUserId: string): void {
  cache.delete(clerkUserId);
}
