/**
 * Minimal Database type for P02 ChatBase.
 *
 * P02 does not use the skills / skill_installs tables — those are P01-only.
 * The Database type here covers only the tables ChatBase actually queries.
 * The supabase.ts generic is kept so the createClient<Database>() call type-checks.
 *
 * When we add typed table definitions per table (p02_workspaces, etc.) they go
 * into the Tables block below. Until then, the `any` escape via `unknown` tables
 * is intentional — the lib/p02/db.ts layer casts results itself.
 */

export type Database = {
  public: {
    Tables: Record<string, {
      Row: Record<string, unknown>;
      Insert: Record<string, unknown>;
      Update: Record<string, unknown>;
      Relationships: [];
    }>;
    Views: Record<string, never>;
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: Array<{ allowed: boolean; current_count: number; reset_at: string }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
