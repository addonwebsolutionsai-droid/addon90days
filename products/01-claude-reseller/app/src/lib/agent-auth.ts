/**
 * Shared-secret auth for /api/agents/* endpoints.
 *
 * Cloud agent routines POST to these endpoints with a secret in the
 * Authorization header. The secret is held in Vercel env (AGENT_API_SECRET)
 * and embedded in each routine's prompt — never exposed in client code.
 *
 * Why a shared secret instead of OAuth: routines run in Anthropic's cloud
 * with no easy way to do OAuth flows. The secret is rotated by updating
 * the env var + the routine prompts in lockstep.
 */

import type { NextRequest } from "next/server";

export type AuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 500; message: string };

export function requireAgentSecret(req: NextRequest): AuthResult {
  const expected = process.env["AGENT_API_SECRET"];
  if (!expected || expected.length < 16) {
    return {
      ok: false,
      status: 500,
      message: "Server misconfigured: AGENT_API_SECRET not set",
    };
  }

  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (provided.length === 0) {
    return { ok: false, status: 401, message: "Missing Bearer token" };
  }
  if (!constantTimeEqual(provided, expected)) {
    return { ok: false, status: 401, message: "Invalid agent secret" };
  }
  return { ok: true };
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
