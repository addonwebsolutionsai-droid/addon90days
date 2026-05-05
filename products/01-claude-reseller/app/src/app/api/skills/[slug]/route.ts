import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/skills/[slug] — read a single published skill.
 *
 * View counting is NOT done here. It used to be a fire-and-forget update,
 * but (a) the function context terminates before it completes, (b) Next.js
 * caches this response for 60s on the page side so the route only fires
 * once per minute per skill, and (c) the read-then-update pattern races
 * under load. View counting now lives in POST /api/skills/[slug]/view,
 * called by a client-side beacon on the skill detail page.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error !== null || data === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Skill not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
