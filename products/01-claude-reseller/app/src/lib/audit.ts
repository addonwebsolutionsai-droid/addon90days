/**
 * Backwards-compat re-export shim. The implementation lives in @addonweb/rbac.
 */
export {
  logAdminAction,
  listAuditEntries,
  type AuditActionParams,
  type AuditEntry,
  type AuditQueryOptions,
  type AuditRow,
} from "@addonweb/rbac";
