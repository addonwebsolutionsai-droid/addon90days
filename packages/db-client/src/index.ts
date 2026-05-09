/**
 * @addonweb/db-client — shared Supabase client + Database types.
 *
 * Lifted from `products/01-claude-reseller/app/src/lib/{supabase,database.types}.ts`
 * in Phase 1 of the multi-app split. Each consuming app sets these env vars
 * in its own Vercel project:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */

export {
  getSupabase,
  getSupabaseAdmin,
  supabase,
  supabaseAdmin,
} from "./supabase";

// Re-export every database type so consumers can `import type { Skill, ... } from "@addonweb/db-client"`.
export type {
  Database,
  Skill,
  SkillInsertRow,
  SkillCategory,
  SkillDifficulty,
  SkillStep,
  SkillInstall,
  SkillInstallInsertRow,
} from "./database.types";
