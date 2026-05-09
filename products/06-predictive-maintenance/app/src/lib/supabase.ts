// AUTO-SYNCED FROM packages/db-client/src/supabase.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:20:52.191Z
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function getSupabaseUrl(): string {
  return process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
}

function getAnonKey(): string {
  return process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";
}

function getServiceKey(): string {
  return process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
}

// Public client — for read operations (skills listing, detail). RLS applies.
// Lazy singleton to avoid module-load crash when env vars are not yet set.
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
export function getSupabase() {
  if (_supabase === null) {
    _supabase = createClient<Database>(getSupabaseUrl(), getAnonKey());
  }
  return _supabase;
}

// Service client — for write operations (admin skill insert, purchase tracking).
// Lazy singleton; auth options prevent session persistence.
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;
export function getSupabaseAdmin() {
  if (_supabaseAdmin === null) {
    _supabaseAdmin = createClient<Database>(getSupabaseUrl(), getServiceKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseAdmin;
}

// Named re-exports for backwards compatibility — these are still singletons
// but are resolved on first import use rather than module evaluation.
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as any)[prop];
  },
});

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabaseAdmin() as any)[prop];
  },
});
