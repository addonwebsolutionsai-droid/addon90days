// AUTO-SYNCED FROM packages/rbac/src/audit.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:04:29.526Z
/**
 * Append-only admin audit log.
 *
 * Every mutating admin route should call `logAdminAction()` after the
 * mutation succeeds. The call is fire-and-forget — failures are caught
 * and console-logged but never thrown, so audit-log issues never break
 * the admin operation itself.
 *
 * Two interface shapes are accepted:
 *
 *   1. Compact (used by the billing layer):
 *        { adminClerkUserId, action, resourceType, resourceId?, meta? }
 *   2. Verbose (used by everything else):
 *        { actor_clerk_user_id, action, resource_type, resource_id?, scope?,
 *          before?, after?, ip?, user_agent? }
 *
 * Both produce the same row in `admin_audit_log`.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function auditTable(name: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

/** Compact shape — kept for the billing layer's existing call sites. */
export interface AuditActionParams {
  adminClerkUserId: string;
  action:           string;
  resourceType:     string;
  resourceId?:      string;
  /** Free-form payload. Stored as `after_json`. */
  meta?:            Record<string, unknown>;
}

/** Verbose shape — full control of the audit row. */
export interface AuditEntry {
  actor_clerk_user_id: string;
  action:        string;
  resource_type: string;
  resource_id?:  string | null;
  scope?:        string | null;
  before?:       unknown;
  after?:        unknown;
  ip?:           string | null;
  user_agent?:   string | null;
}

function isVerbose(p: AuditActionParams | AuditEntry): p is AuditEntry {
  return "actor_clerk_user_id" in p && "resource_type" in p;
}

/**
 * Persist an audit entry. NEVER throws — caller can `await` without try/catch.
 * Accepts either the compact (billing) or verbose interface.
 */
export async function logAdminAction(params: AuditActionParams | AuditEntry): Promise<void> {
  try {
    let row: Record<string, unknown>;

    if (isVerbose(params)) {
      row = {
        actor_clerk_user_id: params.actor_clerk_user_id,
        action:              params.action,
        resource_type:       params.resource_type,
        resource_id:         params.resource_id ?? null,
        scope:               params.scope ?? null,
        before_json:         params.before === undefined ? null : params.before,
        after_json:          params.after  === undefined ? null : params.after,
        ip:                  params.ip ?? null,
        user_agent:          params.user_agent ?? null,
      };
    } else {
      // Compact shape: derive scope from the resource_type prefix when possible
      // (e.g. "p02_intents" → "p02"). Improves filtering in the audit viewer.
      const inferredScope = (() => {
        const m = params.resourceType.match(/^(p0[1-6])/);
        return m !== null ? m[1] : null;
      })();
      row = {
        actor_clerk_user_id: params.adminClerkUserId,
        action:              params.action,
        resource_type:       params.resourceType,
        resource_id:         params.resourceId ?? null,
        scope:               inferredScope,
        before_json:         null,
        after_json:          params.meta === undefined ? null : params.meta,
        ip:                  null,
        user_agent:          null,
      };
    }

    await auditTable("admin_audit_log").insert(row);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const action = "action" in params ? params.action : "(unknown)";
    console.error(`[audit] log failed for action=${action}: ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// Read helpers for the admin audit-log viewer
// ---------------------------------------------------------------------------

export interface AuditQueryOptions {
  /** Filter by actor (cross-resource view of one admin's activity). */
  actor?:        string;
  /** Filter by scope (typically a product key like "p02"). */
  scope?:        string;
  /** Filter by action prefix (e.g. "p02.intents." matches every intent action). */
  action_prefix?: string;
  resource_type?: string;
  resource_id?:   string;
  /** UTC ISO; only entries created at or after this point. */
  since?:         string;
  /** Pagination. Default 50, max 200. */
  limit?:         number;
}

export interface AuditRow {
  id:                  string;
  actor_clerk_user_id: string;
  action:              string;
  resource_type:       string;
  resource_id:         string | null;
  scope:               string | null;
  before_json:         unknown;
  after_json:          unknown;
  ip:                  string | null;
  user_agent:          string | null;
  created_at:          string;
}

export async function listAuditEntries(opts: AuditQueryOptions = {}): Promise<AuditRow[]> {
  const limit = Math.min(opts.limit ?? 50, 200);
  let q = auditTable("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.actor !== undefined)         q = q.eq("actor_clerk_user_id", opts.actor);
  if (opts.scope !== undefined)         q = q.eq("scope", opts.scope);
  if (opts.resource_type !== undefined) q = q.eq("resource_type", opts.resource_type);
  if (opts.resource_id !== undefined)   q = q.eq("resource_id", opts.resource_id);
  if (opts.action_prefix !== undefined) q = q.ilike("action", `${opts.action_prefix}%`);
  if (opts.since !== undefined)         q = q.gte("created_at", opts.since);

  const { data, error } = await q;
  if (error !== null) throw new Error(`listAuditEntries: ${error.message}`);
  return (data ?? []) as AuditRow[];
}
