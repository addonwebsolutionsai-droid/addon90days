/**
 * POST /api/admin/kb/preview-url
 *
 * Takes a URL, scrapes it, returns the raw text (truncated for preview).
 * Used by the KB new doc form to let admin preview scraped content before saving.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { scrapeUrl } from "@/lib/p02/kb";

const PreviewSchema = z.object({ url: z.string().url() });

const PREVIEW_MAX = 2_000;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Admin only" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = PreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.message } }, { status: 400 });
  }

  try {
    const text = await scrapeUrl(parsed.data.url);
    const preview = text.length > PREVIEW_MAX ? `${text.slice(0, PREVIEW_MAX)}…` : text;
    return NextResponse.json({ data: { preview, total_chars: text.length } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: { code: "SCRAPE_FAILED", message } }, { status: 400 });
  }
}
