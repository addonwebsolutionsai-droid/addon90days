/**
 * POST /api/admin/skills/generate-from-trend
 *
 * "Skill Smith" — given a trending topic in plain English, asks Groq to draft
 * a fully-formed Claude skill (slug, title, tagline, description, category,
 * tags, difficulty, 4-6 steps), runs a quality gate (separate Groq call that
 * scores the draft 1-10), and inserts only if score ≥ 7.
 *
 * Auth: Bearer ADMIN_API_KEY (same gate as /api/admin/skills).
 *
 * Body:
 *   { trend_topic: string                // raw problem statement
 *   , source_url?:  string                // optional pointer for telemetry
 *   , preferred_category?: SkillCategory // optional category hint
 *   }
 *
 * Returns:
 *   201 → { ok: true, skill: <inserted row>, quality_score: number }
 *   422 → { ok: false, reason: "low_quality" | "invalid_json", score?, draft? }
 *   409 → { ok: false, reason: "duplicate_slug", slug }
 *   500 → { ok: false, reason: "..." }
 *
 * Why generate server-side instead of from the cloud routine: GROQ_API_KEY
 * lives in Vercel env, not in routine prompts. Keeps secret surface tight.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import type { SkillInsertRow, SkillCategory, SkillDifficulty, SkillStep } from "@/lib/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GENERATE_MAX_TOKENS = 1800;
const SCORE_MAX_TOKENS    = 200;
const QUALITY_THRESHOLD   = 7;

const CATEGORIES: readonly SkillCategory[] = [
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

const RequestSchema = z.object({
  trend_topic:        z.string().min(20).max(2000),
  source_url:         z.string().url().optional(),
  preferred_category: z.enum(CATEGORIES as unknown as [string, ...string[]]).optional(),
});

const DraftStepSchema = z.object({
  number:      z.number().int().positive(),
  title:       z.string().min(8).max(120),
  description: z.string().min(30).max(1500),
  code:        z.string().max(4000).optional(),
  language:    z.string().max(20).optional(),
});

const DraftSchema = z.object({
  slug:        z.string().regex(/^[a-z][a-z0-9-]{6,48}[a-z0-9]$/, "slug must be 8-50 chars kebab-case"),
  title:       z.string().min(6).max(60),
  tagline:     z.string().min(20).max(160),
  description: z.string().min(120).max(1500),
  category:    z.enum(CATEGORIES as unknown as [string, ...string[]]),
  tags:        z.array(z.string().min(2).max(30)).min(2).max(8),
  difficulty:  z.enum(["beginner", "intermediate", "advanced"] as const),
  steps:       z.array(DraftStepSchema).min(3).max(7),
});

type Draft = z.infer<typeof DraftSchema>;

const SYSTEM_PROMPT = `You are Skill Smith — the curator behind the SKILON catalog (130+ production-ready Claude skills, by AddonWeb). Your job is to turn a trending problem into ONE high-quality skill spec.

A "skill" is a slash-command-style structured prompt that ships with Claude Code. Each skill has a defined input, a 3-7 step workflow, and a copy-paste output format. Think "production playbook," not "chatbot conversation."

OUTPUT FORMAT — return ONLY a valid JSON object, no prose, no markdown fence. Schema:
{
  "slug":        "kebab-case-8-to-50-chars",
  "title":       "Specific verb-led title, 6-60 chars (NOT 'AI Assistant for X')",
  "tagline":     "One-line value prop, 20-160 chars, names the artifact produced",
  "description": "120-1500 chars. WHO uses this, WHAT it produces, WHY it beats doing it manually. Concrete artifacts.",
  "category":    "one of: ai-llm | iot | developer-tools | startup-product | ui-ux | indian-business | data-analytics | devops-infra | communication-protocols | marketing-growth | trading-finance",
  "tags":        ["2-8 specific tags, lowercase, hyphenated"],
  "difficulty":  "beginner | intermediate | advanced",
  "steps":       [
    { "number": 1, "title": "...", "description": "30-1500 chars, what Claude does in this step", "code": "optional code snippet", "language": "optional language tag" },
    ...3 to 7 steps total
  ]
}

QUALITY BAR (failures get rejected by the quality gate):
- Specific not generic. "GST Invoice Generator" yes; "Invoice Helper" no.
- Concrete artifacts. The tagline must name what the user gets out (a PDF, a SQL query, a config file, a code scaffold, a checklist).
- Indian business / IoT / trading angle wins when the problem fits — those are AddonWeb's moat categories.
- 4-6 steps is the sweet spot. Each step is one verb-led action with enough detail that Claude can execute it.
- Code snippets in steps must be runnable, not pseudocode.

EXAMPLES of slugs we already ship: gst-invoice-generator, esp32-firmware-scaffold, stock-screener-ai, sql-query-builder, code-reviewer, product-roadmap-builder, mqtt-iot-setup, prompt-optimizer, churn-prediction-model.`;

function buildGeneratePrompt(trend: string, hint?: string): string {
  const hintLine = hint !== undefined ? `\nPreferred category (use only if it fits the problem): ${hint}` : "";
  return `Generate ONE skill spec from this trending problem. Return ONLY the JSON object — no prose, no markdown fence.

PROBLEM:
${trend}${hintLine}

Remember: specific, concrete artifacts, 4-6 steps, runnable code where applicable.`;
}

function buildScorePrompt(draft: Draft): string {
  return `Score this candidate skill 1-10 across these axes (return JSON {"score": int, "reasoning": "..."}):

1. Specificity (generic = low, named artifact = high)
2. Workflow depth (vague description = low, concrete 4-6 steps with code = high)
3. Useful to a real practitioner (toy example = low, real production task = high)
4. Avoids overlap with common LLM defaults (a thing Claude already does well without a skill = low)

Score is an integer 1-10. ≥ 7 = ship it. ≤ 6 = reject.

CANDIDATE:
${JSON.stringify(draft, null, 2)}

Return ONLY: {"score": <int>, "reasoning": "<one sentence>"}`;
}

interface GroqMessage { role: "system" | "user" | "assistant"; content: string }

async function callGroq(messages: GroqMessage[], maxTokens: number): Promise<string> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (apiKey === undefined || apiKey.length === 0) {
    throw new Error("GROQ_API_KEY not configured");
  }
  const res = await fetch(GROQ_API, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      model:           GROQ_MODEL,
      messages,
      max_tokens:      maxTokens,
      temperature:     0.5,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("Groq returned empty content");
  }
  return content;
}

// Accept either ADMIN_API_KEY (for the founder to curl from a terminal) or
// ROUTINE_API_SECRET (for cloud routines). Two keys so we can rotate the
// founder's day-to-day key without breaking the daily cron, and vice versa.
function isAuthorized(req: Request): boolean {
  const adminKey   = process.env["ADMIN_API_KEY"];
  const routineKey = process.env["ROUTINE_API_SECRET"];
  const auth = req.headers.get("authorization") ?? "";
  if (auth.length === 0) return false;
  if (adminKey !== undefined && adminKey !== "" && auth === `Bearer ${adminKey}`)   return true;
  if (routineKey !== undefined && routineKey !== "" && auth === `Bearer ${routineKey}`) return true;
  return false;
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "validation", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { trend_topic, source_url, preferred_category } = parsed.data;

  // ---------------------------------------------------------------- generate
  let draftRaw: string;
  try {
    draftRaw = await callGroq([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildGeneratePrompt(trend_topic, preferred_category) },
    ], GENERATE_MAX_TOKENS);
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: "groq_generate_failed", error: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  let draftJson: unknown;
  try { draftJson = JSON.parse(draftRaw); }
  catch { return NextResponse.json({ ok: false, reason: "invalid_json", raw: draftRaw.slice(0, 400) }, { status: 422 }); }

  const draftParsed = DraftSchema.safeParse(draftJson);
  if (!draftParsed.success) {
    return NextResponse.json(
      { ok: false, reason: "draft_validation", issues: draftParsed.error.issues, draft: draftJson },
      { status: 422 },
    );
  }
  const draft: Draft = draftParsed.data;

  // ---------------------------------------------------------------- score
  let scoreRaw: string;
  try {
    scoreRaw = await callGroq([
      { role: "system", content: "You are a strict editorial reviewer. Be honest." },
      { role: "user",   content: buildScorePrompt(draft) },
    ], SCORE_MAX_TOKENS);
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: "groq_score_failed", error: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  let score = 0;
  let reasoning = "";
  try {
    const parsedScore = JSON.parse(scoreRaw) as { score?: unknown; reasoning?: unknown };
    if (typeof parsedScore.score === "number") score = Math.round(parsedScore.score);
    if (typeof parsedScore.reasoning === "string") reasoning = parsedScore.reasoning;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "score_parse_failed", raw: scoreRaw.slice(0, 200) },
      { status: 422 },
    );
  }

  if (score < QUALITY_THRESHOLD) {
    return NextResponse.json(
      { ok: false, reason: "low_quality", score, reasoning, draft },
      { status: 422 },
    );
  }

  // ---------------------------------------------------------------- insert
  const insertRow: SkillInsertRow = {
    slug:           draft.slug,
    title:          draft.title,
    tagline:        draft.tagline,
    description:    draft.description,
    category:       draft.category as SkillCategory,
    tags:           draft.tags,
    difficulty:     draft.difficulty as SkillDifficulty,
    steps:          draft.steps as SkillStep[],
    is_free:        true,
    price_inr:      0,
    price_usd:      0,
    is_new:         true,
    is_featured:    false,
    trending_score: 5,
    published:      true,
  };

  const { data, error } = await supabaseAdmin
    .from("skills")
    .insert(insertRow)
    .select()
    .single();

  if (error !== null) {
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: false, reason: "duplicate_slug", slug: draft.slug },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, reason: "db_error", message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok:            true,
      skill:         data,
      quality_score: score,
      quality_note:  reasoning,
      url:           `https://addon90days.vercel.app/skills/${draft.slug}`,
      ...(source_url !== undefined ? { source_url } : {}),
    },
    { status: 201 },
  );
}
