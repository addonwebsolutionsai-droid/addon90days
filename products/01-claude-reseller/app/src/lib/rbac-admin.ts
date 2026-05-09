/**
 * Backwards-compat re-export shim. The implementation lives in @addonweb/rbac.
 */
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
} from "@addonweb/rbac";
