import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import type { SkillCategory, SkillDifficulty } from "@/lib/database.types";

const QuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  free: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  trending: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  sort: z.enum(["new", "newest", "trending", "most-used", "views"]).optional(),
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? "1", 10) || 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v ?? "24", 10) || 24))),
});

const VALID_CATEGORIES = new Set<string>([
  "ai-llm",
  "iot",
  "developer-tools",
  "startup-product",
  "ui-ux",
  "indian-business",
  "data-analytics",
  "devops-infra",
  "communication-protocols",
  "marketing-growth",
  "trading-finance",
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = QuerySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { category, q, difficulty, free, trending, sort, page, limit } =
    parsed.data;

  let query = supabase
    .from("skills")
    .select("*", { count: "exact" })
    .eq("published", true);

  if (category !== undefined && VALID_CATEGORIES.has(category)) {
    query = query.eq("category", category as SkillCategory);
  }

  if (difficulty !== undefined) {
    query = query.eq("difficulty", difficulty as SkillDifficulty);
  }

  if (free !== undefined) {
    query = query.eq("is_free", free);
  }

  if (trending === true) {
    query = query.eq("is_trending", true);
  }

  if (q !== undefined && q.trim().length > 0) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  // Ordering. Accept both "newest" (the canonical UI value) and "new"
  // (legacy alias) for forward compat with old links / bookmarks.
  // "most-used" / "views" sorts by view_count desc — pairs with the
  // ViewBeacon counter we ship.
  if (sort === "newest" || sort === "new") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "most-used" || sort === "views") {
    query = query.order("view_count", { ascending: false });
  } else {
    query = query.order("trending_score", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error !== null) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  const total = count ?? 0;

  return NextResponse.json({
    skills: data ?? [],
    total,
    page,
    hasMore: from + limit < total,
  });
}
