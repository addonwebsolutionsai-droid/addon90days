/**
 * RBAC admin helpers — used by /admin/team and /api/admin/team.
 *
 * Read + mutate the RBAC tables (admin_roles, admin_permissions,
 * admin_user_roles). Counterpart to lib/rbac.ts (which is the read-side
 * gate used at request time).
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rbacTable(name: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface RoleRow {
  id:           string;
  slug:         string;
  name:         string;
  description:  string | null;
  scope:        string;
  is_system:    boolean;
  created_at:   string;
  updated_at:   string;
}

export interface PermissionRow {
  key:         string;
  scope:       string;
  area:        string;
  action:      string;
  description: string;
}

export interface UserRoleRow {
  clerk_user_id: string;
  role_id:       string;
  role_slug:     string;
  role_name:     string;
  role_scope:    string;
  assigned_at:   string;
  assigned_by:   string | null;
}

/** Aggregated team-page row: one record per Clerk user with all their roles. */
export interface TeamMemberRow {
  clerk_user_id: string;
  roles: Array<{ id: string; slug: string; name: string; scope: string }>;
  total_permissions: number;
  joined_at: string;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listRoles(): Promise<RoleRow[]> {
  const { data, error } = await rbacTable("admin_roles")
    .select("*")
    .order("is_system", { ascending: false })
    .order("name");
  if (error !== null) throw new Error(`listRoles: ${error.message}`);
  return (data ?? []) as RoleRow[];
}

export async function listPermissions(): Promise<PermissionRow[]> {
  const { data, error } = await rbacTable("admin_permissions")
    .select("*")
    .order("scope")
    .order("area")
    .order("action");
  if (error !== null) throw new Error(`listPermissions: ${error.message}`);
  return (data ?? []) as PermissionRow[];
}

export async function listRolePermissions(roleId: string): Promise<string[]> {
  const { data, error } = await rbacTable("admin_role_permissions")
    .select("permission_key")
    .eq("role_id", roleId);
  if (error !== null) throw new Error(`listRolePermissions: ${error.message}`);
  return ((data ?? []) as Array<{ permission_key: string }>).map((r) => r.permission_key);
}

/** All Clerk users with at least one role assignment, plus their roles + permission count. */
export async function listTeamMembers(): Promise<TeamMemberRow[]> {
  const { data, error } = await rbacTable("admin_user_roles")
    .select("clerk_user_id, assigned_at, role:role_id(id, slug, name, scope, admin_role_permissions(permission_key))");
  if (error !== null) throw new Error(`listTeamMembers: ${error.message}`);

  const rows = (data ?? []) as Array<{
    clerk_user_id: string;
    assigned_at:   string;
    role: { id: string; slug: string; name: string; scope: string; admin_role_permissions?: Array<{ permission_key: string }> } | null;
  }>;

  const byUser = new Map<string, TeamMemberRow>();
  for (const r of rows) {
    if (r.role === null) continue;
    const existing = byUser.get(r.clerk_user_id);
    if (existing === undefined) {
      const perms = new Set<string>((r.role.admin_role_permissions ?? []).map((p) => p.permission_key));
      byUser.set(r.clerk_user_id, {
        clerk_user_id:     r.clerk_user_id,
        roles:             [{ id: r.role.id, slug: r.role.slug, name: r.role.name, scope: r.role.scope }],
        total_permissions: perms.size,
        joined_at:         r.assigned_at,
      });
    } else {
      existing.roles.push({ id: r.role.id, slug: r.role.slug, name: r.role.name, scope: r.role.scope });
      // Recompute distinct permission count
      const perms = new Set<string>();
      // We re-walk this user's rows once at the end below to avoid a per-iteration recompute.
      void perms;
      // Track the earliest assigned_at as the "joined" date
      if (r.assigned_at < existing.joined_at) existing.joined_at = r.assigned_at;
    }
  }

  // Recompute total_permissions accurately by re-walking the row set per user
  for (const member of byUser.values()) {
    const perms = new Set<string>();
    for (const r of rows) {
      if (r.clerk_user_id !== member.clerk_user_id || r.role === null) continue;
      for (const p of r.role.admin_role_permissions ?? []) perms.add(p.permission_key);
    }
    member.total_permissions = perms.size;
  }

  return Array.from(byUser.values()).sort((a, b) => b.total_permissions - a.total_permissions);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function assignRoleToUser(params: {
  clerk_user_id: string;
  role_id:       string;
  assigned_by?:  string;
}): Promise<void> {
  const { error } = await rbacTable("admin_user_roles").insert({
    clerk_user_id: params.clerk_user_id,
    role_id:       params.role_id,
    assigned_by:   params.assigned_by ?? null,
  });
  if (error !== null && !String(error.message).includes("duplicate")) {
    throw new Error(`assignRoleToUser: ${error.message}`);
  }
}

export async function revokeRoleFromUser(clerk_user_id: string, role_id: string): Promise<void> {
  const { error } = await rbacTable("admin_user_roles")
    .delete()
    .eq("clerk_user_id", clerk_user_id)
    .eq("role_id",       role_id);
  if (error !== null) throw new Error(`revokeRoleFromUser: ${error.message}`);
}

export async function createCustomRole(params: {
  slug:        string;
  name:        string;
  description: string | null;
  scope:       string;
  permission_keys: string[];
}): Promise<RoleRow> {
  const supabase = getSupabaseAdmin();

  const { data: roleRow, error } = await rbacTable("admin_roles")
    .insert({
      slug:        params.slug,
      name:        params.name,
      description: params.description,
      scope:       params.scope,
      is_system:   false,
    })
    .select()
    .single();
  if (error !== null) throw new Error(`createCustomRole: ${error.message}`);
  const role = roleRow as RoleRow;

  if (params.permission_keys.length > 0) {
    const inserts = params.permission_keys.map((key) => ({ role_id: role.id, permission_key: key }));
    const { error: rpErr } = await rbacTable("admin_role_permissions").insert(inserts);
    if (rpErr !== null) {
      // Best-effort cleanup: drop the role we just created so we don't leave an empty one
      await supabase.from("admin_roles").delete().eq("id", role.id);
      throw new Error(`createCustomRole permissions: ${rpErr.message}`);
    }
  }

  return role;
}

export async function deleteCustomRole(roleId: string): Promise<void> {
  // Refuse to delete system roles
  const { data: roleRow, error: getErr } = await rbacTable("admin_roles")
    .select("is_system")
    .eq("id", roleId)
    .maybeSingle();
  if (getErr !== null) throw new Error(`deleteCustomRole get: ${getErr.message}`);
  if (roleRow === null) throw new Error("deleteCustomRole: role not found");
  if ((roleRow as { is_system: boolean }).is_system) {
    throw new Error("Cannot delete a system role");
  }

  const { error } = await rbacTable("admin_roles").delete().eq("id", roleId);
  if (error !== null) throw new Error(`deleteCustomRole: ${error.message}`);
}
