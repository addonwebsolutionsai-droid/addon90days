/**
 * Backwards-compat re-export shim.
 *
 * The Database type now lives in `@addonweb/db-client`. This file re-exports
 * for any existing `@/lib/database.types` imports. New code should import
 * the type from `@addonweb/db-client` directly.
 */

export type {
  Database,
  Skill,
  SkillInsertRow,
  SkillCategory,
  SkillDifficulty,
  SkillStep,
  SkillInstall,
  SkillInstallInsertRow,
} from "@addonweb/db-client";
