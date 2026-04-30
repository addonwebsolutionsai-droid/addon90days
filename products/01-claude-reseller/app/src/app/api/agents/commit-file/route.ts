/**
 * POST /api/agents/commit-file
 *
 * Create or update a file in the repo and commit it. Idempotent — if
 * the file already exists, it's updated; otherwise created.
 *
 * Auth: Bearer <AGENT_API_SECRET>
 *
 * Request body (application/json):
 *   {
 *     "path":         "operations/daily-log/2026-04-30.md",   // repo-relative
 *     "content":      "<full file body>",                      // utf-8 text
 *     "message":      "ops: morning briefing for 2026-04-30",  // commit message
 *     "author_name":  "AddonWeb Orchestrator",                 // optional
 *     "author_email": "ops@addonweb.io"                        // optional
 *   }
 *
 * Response 200:
 *   { ok: true, commit: "<sha>", path: "...", created: false }
 *
 * Response 4xx:
 *   { ok: false, error: "..." }
 */

import type { NextRequest } from "next/server";
import { requireAgentSecret } from "@/lib/agent-auth";
import { commitFile } from "@/lib/github-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONTENT_BYTES  = 200_000;   // 200 KB per commit — way more than any agent needs
const MAX_PATH_LEN       = 300;
const MAX_MESSAGE_LEN    = 500;
const MAX_AUTHOR_LEN     = 80;

export async function POST(req: NextRequest) {
  const auth = requireAgentSecret(req);
  if (!auth.ok) return Response.json({ ok: false, error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 }); }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ ok: false, error: "Body must be a JSON object" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  // ---- Validate path
  const pathRaw = b["path"];
  if (typeof pathRaw !== "string" || pathRaw.length === 0) {
    return Response.json({ ok: false, error: "Missing or invalid path" }, { status: 400 });
  }
  if (pathRaw.startsWith("/") || pathRaw.includes("..") || pathRaw.length > MAX_PATH_LEN) {
    return Response.json({ ok: false, error: "Invalid path" }, { status: 400 });
  }
  // Forbid touching critical files outside the agent's playground
  const FORBIDDEN_PATH_PREFIXES = [
    ".github/",
    "products/",     // app code — agents don't write here
    "supabase/",     // migrations are human-managed
    "scripts/",      // verification tools are human-managed
    ".env",
  ];
  if (FORBIDDEN_PATH_PREFIXES.some((p) => pathRaw === p.replace(/\/$/, "") || pathRaw.startsWith(p))) {
    return Response.json({ ok: false, error: `Path "${pathRaw}" is in a protected area` }, { status: 403 });
  }

  // ---- Validate content
  const contentRaw = b["content"];
  if (typeof contentRaw !== "string") {
    return Response.json({ ok: false, error: "Missing or invalid content" }, { status: 400 });
  }
  if (Buffer.byteLength(contentRaw, "utf8") > MAX_CONTENT_BYTES) {
    return Response.json({ ok: false, error: `Content too large (max ${MAX_CONTENT_BYTES} bytes)` }, { status: 413 });
  }

  // ---- Validate message
  const messageRaw = b["message"];
  if (typeof messageRaw !== "string" || messageRaw.length === 0 || messageRaw.length > MAX_MESSAGE_LEN) {
    return Response.json({ ok: false, error: "Missing or invalid commit message" }, { status: 400 });
  }

  // ---- Optional author
  const authorName  = typeof b["author_name"]  === "string" ? b["author_name"].slice(0, MAX_AUTHOR_LEN)  : undefined;
  const authorEmail = typeof b["author_email"] === "string" ? b["author_email"].slice(0, MAX_AUTHOR_LEN) : undefined;

  try {
    const result = await commitFile(pathRaw, contentRaw, messageRaw, {
      ...(authorName  ? { authorName }  : {}),
      ...(authorEmail ? { authorEmail } : {}),
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: `Commit failed: ${msg}` }, { status: 500 });
  }
}
