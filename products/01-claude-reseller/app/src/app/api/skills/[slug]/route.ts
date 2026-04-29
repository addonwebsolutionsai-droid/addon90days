import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";

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

  // Increment view_count — fire and forget, does not block response
  void supabaseAdmin
    .from("skills")
    .update({ view_count: data.view_count + 1 })
    .eq("id", data.id);

  return NextResponse.json(data);
}
