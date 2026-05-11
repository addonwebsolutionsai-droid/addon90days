/**
 * Minimal Database type for P04 TableFlow.
 *
 * P04 uses p04_* tables (restaurants, menus, orders, etc.). They're accessed
 * via the untyped wrapper pattern in lib/p04/db.ts. The `Database` generic
 * still needs to exist so the synced `lib/supabase.ts` type-checks.
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
