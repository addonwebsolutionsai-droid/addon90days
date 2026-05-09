/**
 * Backwards-compat re-export shim. The implementation lives in @addonweb/rbac.
 */
export {
  requirePermission,
  requireAnyPermission,
  getCurrentUserPermissions,
  hasPermission,
  invalidateUserPermissionsCache,
  type RbacResult,
} from "@addonweb/rbac";
