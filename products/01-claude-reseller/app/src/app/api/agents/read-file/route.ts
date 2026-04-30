/**
 * GET /api/agents/read-file?path=<repo-relative path>
 *
 * Reads a file from the repo and returns its text content. 404 if the
 * file doesn't exist (so agents can branch on absence without crashing).
 *
 * Auth: Bearer <AGENT_API_SECRET>
 *
 * Response 200:
 *   { ok: true, content: "<file text>", sha: "<git blob sha>" }
 * Response 404:
 *   { ok: false, error: "Not found" }
 */

import type { NextRequest } from "next/server";
import { requireAgentSecret } from "@/lib/agent-auth";
import { readFile } from "@/lib/github-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAgentSecret(req);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path)                   return Response.json({ ok: false, error: "Missing path" }, { status: 400 });
  if (path.startsWith("/") ||
      path.includes(".."))     return Response.json({ ok: false, error: "Invalid path" }, { status: 400 });
  if (path.length > 300)       return Response.json({ ok: false, error: "Path too long" }, { status: 400 });

  try {
    const result = await readFile(path);
    if (result === null) {
      return Response.json({ ok: false, error: "Not found", path }, { status: 404 });
    }
    return Response.json({ ok: true, content: result.content, sha: result.sha });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: `Read failed: ${msg}` }, { status: 500 });
  }
}
