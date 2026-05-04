/**
 * POST /api/p06-waitlist
 *
 * Captures email addresses for the MachineGuard (P06) pilot program.
 * Inserts into p06_waitlist table via service-role client (bypasses RLS).
 *
 * Idempotent: duplicate email returns { ok: true, dedupe: true } -- never 409.
 * Validation: Zod email + 200-char max length.
 *
 * NOTE: p06_waitlist is not yet in database.types.ts (migration 009 not applied).
 * We use createClient without the Database generic for this route only.
 * Remove this comment once migration is applied and database.types.ts is regenerated.
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

const WaitlistBody = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(200, "Email too long")
    .transform((v) => v.toLowerCase().trim()),
});

/** Untyped Supabase admin client -- used only because p06_waitlist is not yet
 *  in the generated Database type (migration pending). Scope limited to minimum surface. */
function getUntypedAdmin() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function OPTIONS(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be JSON" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const parsed = WaitlistBody.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { email } = parsed.data;
  const admin = getUntypedAdmin();

  const { error } = await admin
    .from("p06_waitlist")
    .insert({ email, source: "web" });

  if (error) {
    // "23505" is PostgreSQL unique_violation -- email already registered
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: true, dedupe: true },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    console.error("[p06-waitlist] insert error:", error.code, error.message);
    return NextResponse.json(
      { ok: false, error: "Could not save your details. Please try again." },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS });
}
