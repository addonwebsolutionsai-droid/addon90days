/**
 * Minimal Database type for P06 MachineGuard.
 *
 * P06 starts with no typed tables — its DB schema is added incrementally
 * (motors, telemetry, alerts, etc.). The `Database` generic still needs to
 * exist so the synced `lib/supabase.ts` (which does `createClient<Database>(...)`)
 * type-checks.
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
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: Array<{ allowed: boolean; current_count: number; reset_at: string }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
