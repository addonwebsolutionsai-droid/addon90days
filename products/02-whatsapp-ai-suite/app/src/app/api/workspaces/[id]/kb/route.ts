/**
 * POST /api/workspaces/:id/kb — add knowledge base document
 *
 * Body: { kind: "text" | "url", content?: string, url?: string }
 *   kind=text: content field required
 *   kind=url:  url field required — server scrapes and chunks
 *
 * Auth: Clerk required. Only workspace owner can add KB docs.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getWorkspaceByOwner, addKbDoc } from "@/lib/p02/db";
import { chunkText, scrapeUrl } from "@/lib/p02/kb";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const KbTextSchema = z.object({
  kind: z.literal("text"),
  content: z.string().min(1).max(50_000),
});

const KbUrlSchema = z.object({
  kind: z.literal("url"),
  url: z.string().url().max(2048),
});

const KbSchema = z.discriminatedUnion("kind", [KbTextSchema, KbUrlSchema]);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const rate = await checkRateLimit({
    key: `p02_kb_add:${userId}`,
    limit: 30,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  const { id: workspaceId } = await ctx.params;

  const workspace = await getWorkspaceByOwner(userId, workspaceId);
  if (workspace === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found" } },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = KbSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    let rawContent = "";
    let sourceUrl: string | undefined;

    if (parsed.data.kind === "text") {
      rawContent = parsed.data.content;
    } else {
      sourceUrl = parsed.data.url;
      rawContent = await scrapeUrl(sourceUrl);
    }

    const chunks = chunkText(rawContent);
    const doc = await addKbDoc({
      workspace_id: workspaceId,
      kind: parsed.data.kind,
      source_url: sourceUrl,
      raw_content: rawContent,
      parsed_chunks: chunks,
    });

    return NextResponse.json(
      {
        data: {
          id: doc.id,
          workspace_id: doc.workspace_id,
          kind: doc.kind,
          source_url: doc.source_url,
          chunk_count: chunks.length,
          created_at: doc.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[p02/kb POST] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: `Failed to add knowledge: ${msg.slice(0, 100)}` } },
      { status: 500 }
    );
  }
}
