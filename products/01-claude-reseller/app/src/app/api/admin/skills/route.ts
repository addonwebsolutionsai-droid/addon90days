import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import type { SkillInsertRow } from "@/lib/database.types";

const SkillStepSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  code: z.string().optional(),
  language: z.string().optional(),
});

const SKILL_CATEGORIES = [
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
] as const;

const InsertSkillSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(SKILL_CATEGORIES),
  subcategory: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  price_inr: z.number().int().min(0).default(0),
  price_usd: z.number().int().min(0).default(0),
  is_free: z.boolean().default(true),
  steps: z.array(SkillStepSchema).default([]),
  video_url: z.string().url().nullable().default(null),
  video_thumbnail: z.string().url().nullable().default(null),
  trending_score: z.number().int().min(0).default(0),
  view_count: z.number().int().min(0).default(0),
  purchase_count: z.number().int().min(0).default(0),
  is_trending: z.boolean().default(false),
  is_new: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  pack_id: z.string().nullable().default(null),
  published: z.boolean().default(true),
});

function isAuthorized(req: Request): boolean {
  const adminKey = process.env["ADMIN_API_KEY"];
  if (adminKey === undefined || adminKey === "") return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${adminKey}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or missing API key" } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = InsertSkillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, details: parsed.error.issues } },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("skills")
    .insert(parsed.data as SkillInsertRow)
    .select()
    .single();

  if (error !== null) {
    // Duplicate slug
    if (error.code === "23505") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: `Skill with slug "${parsed.data.slug}" already exists` } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
