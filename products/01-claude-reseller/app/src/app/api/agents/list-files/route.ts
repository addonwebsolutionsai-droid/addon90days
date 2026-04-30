/**
 * GET /api/agents/list-files?path=<dir-relative path>
 *
 * List entries inside a directory. Returns empty array if the directory
 * doesn't exist.
 *
 * Auth: Bearer <AGENT_API_SECRET>
 *
 * Response 200:
 *   { ok: true, entries: [{ name, type: "file"|"dir", size }, ...] }
 */

import type { NextRequest } from "next/server";
import { requireAgentSecret } from "@/lib/agent-auth";
import { listDir } from "@/lib/github-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAgentSecret(req);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (path.startsWith("/") ||
      path.includes(".."))     return Response.json({ ok: false, error: "Invalid path" }, { status: 400 });
  if (path.length > 300)       return Response.json({ ok: false, error: "Path too long" }, { status: 400 });

  try {
    const entries = await listDir(path);
    return Response.json({ ok: true, entries });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: `List failed: ${msg}` }, { status: 500 });
  }
}
