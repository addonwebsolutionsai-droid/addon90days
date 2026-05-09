/**
 * @addonweb/rbac — role/permission system + append-only audit log.
 *
 * Lifted from products/01-claude-reseller/app/src/lib/{rbac,rbac-admin,audit}.ts
 * in Phase 1 of the multi-app split.
 *
 * Reads / writes the admin_* tables (migration 013_admin_rbac.sql) via the
 * shared @addonweb/db-client. Each consuming app calls
 * `requirePermission("p02.intents.write")` etc. from its admin route
 * handlers.
 */

export {
  requirePermission,
  requireAnyPermission,
  getCurrentUserPermissions,
  hasPermission,
  invalidateUserPermissionsCache,
  type RbacResult,
} from "./rbac";

export {
  listRoles,
  listPermissions,
  listRolePermissions,
  listTeamMembers,
  assignRoleToUser,
  revokeRoleFromUser,
  createCustomRole,
  deleteCustomRole,
  type RoleRow,
  type PermissionRow,
  type UserRoleRow,
  type TeamMemberRow,
} from "./rbac-admin";

export {
  logAdminAction,
  listAuditEntries,
  type AuditActionParams,
  type AuditEntry,
  type AuditQueryOptions,
  type AuditRow,
} from "./audit";
