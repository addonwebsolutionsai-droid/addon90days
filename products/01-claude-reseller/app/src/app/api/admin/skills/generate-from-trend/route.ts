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
import { SITE_BASE_URL } from "@/lib/site-config";
import { getCatalogTotal, formatSkillCount } from "@/lib/catalog-stats";
import { pickSeed, type SkillSeed } from "@/lib/skill-seeds";

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

/**
 * Request schema — every field optional. With no body the route runs in
 * AUTONOMOUS mode: picks a seed from lib/skill-seeds.ts, biased toward
 * categories we under-cover. With a body it runs in MANUAL mode using the
 * supplied trend_topic verbatim.
 */
const RequestSchema = z.object({
  trend_topic:        z.string().min(20).max(2000).optional(),
  source_url:         z.string().url().optional(),
  preferred_category: z.enum(CATEGORIES as unknown as [string, ...string[]]).optional(),
});

const DraftStepSchema = z.object({
  number:      z.number().int().positive(),
  title:       z.string().min(8).max(120),
  // 100 char min so each step says something concrete, not "do X." — Llama
  // tends to write thin step descriptions when not pushed; bumping the floor
  // here forces depth without us having to babysit every prompt.
  description: z.string().min(100).max(2000),
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

function buildSystemPrompt(catalogLabel: string): string {
  return `You are Skill Smith — the curator behind the SKILON catalog (${catalogLabel} production-ready Claude skills, by AddonWeb). Your job is to turn a trending problem into ONE high-quality skill spec.

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
- Each step description MUST be 100-400 chars — long enough to be actionable. Don't write "Do X." Write what data flows in, what transformation happens, what the next step expects.
- AT LEAST ONE step MUST include a runnable code snippet of 200+ characters in a real language (typescript, python, sql, c++, bash, yaml). Pseudocode = rejection. Toy 2-line snippets = rejection.

EXAMPLES of slugs we already ship: gst-invoice-generator, esp32-firmware-scaffold, stock-screener-ai, sql-query-builder, code-reviewer, product-roadmap-builder, mqtt-iot-setup, prompt-optimizer, churn-prediction-model.`;
}

function buildGeneratePrompt(trend: string, hint?: string): string {
  const hintLine = hint !== undefined ? `\nPreferred category (use only if it fits the problem): ${hint}` : "";
  return `Generate ONE skill spec from this trending problem. Return ONLY the JSON object — no prose, no markdown fence.

PROBLEM:
${trend}${hintLine}

Remember: specific, concrete artifacts, 4-6 steps, runnable code where applicable.`;
}

/**
 * Retry prompt — shown to the model after a low-quality first draft. Includes
 * the score reasoning so the model can target the exact failure mode (too
 * generic, missing artifact, vague steps). Reuses the original problem so
 * we stay on-topic.
 */
function buildRetryPrompt(trend: string, hint: string | undefined, prevDraft: Draft, prevReasoning: string): string {
  const hintLine = hint !== undefined ? `\nPreferred category (use only if it fits the problem): ${hint}` : "";
  return `Your previous draft was rejected by the quality gate. Reviewer feedback:
"${prevReasoning}"

Previous draft slug: ${prevDraft.slug}
Previous title:      ${prevDraft.title}

Write a STRONGER second draft for the same problem. Specifically address the reviewer's complaint. Make it more specific, name the artifact in the tagline, and show real runnable code in at least one step. Return ONLY the JSON object — no prose, no markdown fence.

PROBLEM:
${trend}${hintLine}`;
}

function buildScorePrompt(draft: Draft): string {
  return `Score this candidate skill 1-10 across these axes (return JSON {"score": int, "reasoning": "..."}):

1. Specificity (generic = low, named artifact = high)
2. Workflow depth (vague description = low, concrete 4-6 steps with code = high)
3. Useful to a real practitioner (toy example = low, real production task = high)
4. Avoids overlap with common LLM defaults (a thing Claude already does well without a skill = low)
5. Code substance — at least one step must include a runnable code snippet of 200+ chars in a real language. Cap any draft with no code at 6. Cap any draft whose only code is a 1-3 line stub at 6.
6. Step density — if step descriptions average under 100 chars, cap at 6.

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

interface GenScoreResult { draft: Draft; score: number; reasoning: string }
interface RetryHint       { prevDraft: Draft; prevReasoning: string }

class GenError extends Error {
  constructor(public code: "groq_generate_failed" | "invalid_json" | "draft_validation" | "groq_score_failed" | "score_parse_failed",
              public detail: unknown,
              public httpStatus: number) {
    super(typeof detail === "string" ? detail : code);
  }
}

/**
 * Run one generate + score round. Throws GenError on any of the structured
 * failure modes so the POST handler can return the matching status without
 * duplicating boilerplate across attempt 1 and attempt 2.
 */
async function generateAndScore(
  trend:        string,
  categoryHint: string | undefined,
  catalogLabel: string,
  retry?:       RetryHint,
): Promise<GenScoreResult> {
  const userPrompt = retry !== undefined
    ? buildRetryPrompt(trend, categoryHint, retry.prevDraft, retry.prevReasoning)
    : buildGeneratePrompt(trend, categoryHint);

  let draftRaw: string;
  try {
    draftRaw = await callGroq([
      { role: "system", content: buildSystemPrompt(catalogLabel) },
      { role: "user",   content: userPrompt },
    ], GENERATE_MAX_TOKENS);
  } catch (err) {
    throw new GenError("groq_generate_failed", err instanceof Error ? err.message : "unknown", 502);
  }

  let draftJson: unknown;
  try { draftJson = JSON.parse(draftRaw); }
  catch { throw new GenError("invalid_json", draftRaw.slice(0, 400), 422); }

  const draftParsed = DraftSchema.safeParse(draftJson);
  if (!draftParsed.success) {
    throw new GenError("draft_validation", { issues: draftParsed.error.issues, draft: draftJson }, 422);
  }
  const draft = draftParsed.data;

  let scoreRaw: string;
  try {
    scoreRaw = await callGroq([
      { role: "system", content: "You are a strict editorial reviewer. Be honest." },
      { role: "user",   content: buildScorePrompt(draft) },
    ], SCORE_MAX_TOKENS);
  } catch (err) {
    throw new GenError("groq_score_failed", err instanceof Error ? err.message : "unknown", 502);
  }

  let score = 0;
  let reasoning = "";
  try {
    const parsedScore = JSON.parse(scoreRaw) as { score?: unknown; reasoning?: unknown };
    if (typeof parsedScore.score === "number") score = Math.round(parsedScore.score);
    if (typeof parsedScore.reasoning === "string") reasoning = parsedScore.reasoning;
  } catch {
    throw new GenError("score_parse_failed", scoreRaw.slice(0, 200), 422);
  }

  return { draft, score, reasoning };
}

function classifyGenError(err: unknown): NextResponse {
  if (err instanceof GenError) {
    return NextResponse.json(
      { ok: false, reason: err.code, detail: err.detail },
      { status: err.httpStatus },
    );
  }
  return NextResponse.json(
    { ok: false, reason: "internal", error: err instanceof Error ? err.message : "unknown" },
    { status: 500 },
  );
}

/**
 * Find categories whose count is below the average — used to bias the
 * autonomous seed pick so the catalog grows in a balanced shape rather
 * than piling 30 dev-tools skills against 5 IoT skills. Cached 5min so
 * a 3x/day cron doesn't hammer the count query.
 */
async function fetchUnderrepresentedCategories(): Promise<readonly SkillCategory[]> {
  const { data, error } = await supabaseAdmin
    .from("skills")
    .select("category")
    .eq("published", true);
  if (error !== null || data === null) return [];

  const counts = new Map<SkillCategory, number>();
  for (const row of data as Array<{ category: SkillCategory }>) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }
  const all = Array.from(counts.values());
  if (all.length === 0) return [];
  const avg = all.reduce((a, b) => a + b, 0) / all.length;

  const under: SkillCategory[] = [];
  for (const [cat, n] of counts) {
    if (n < avg) under.push(cat);
  }
  // If no category exists yet that's below average (early catalog state),
  // include zero-count categories from the canonical CATEGORIES list so the
  // bias still has somewhere to push.
  for (const cat of CATEGORIES) {
    if (!counts.has(cat)) under.push(cat);
  }
  return under;
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

  // Empty body is allowed in autonomous mode — cloud routine fires with no
  // payload to let Skill Smith pick its own seed.
  let body: unknown = {};
  const raw = await req.text();
  if (raw.length > 0) {
    try { body = JSON.parse(raw); }
    catch { return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 }); }
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "validation", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const inputTrend         = parsed.data.trend_topic;
  const inputCategoryHint  = parsed.data.preferred_category;
  const source_url         = parsed.data.source_url;

  // Pull live catalog count for the system prompt — keeps Skill Smith's
  // self-described context honest as the catalog grows.
  const catalogLabel = formatSkillCount(await getCatalogTotal());

  // -------------------------------------------------------- pick trend topic
  // Manual mode: caller supplied trend_topic. Autonomous mode: pick a seed
  // biased toward the under-represented half of the category distribution
  // so the catalog stays balanced as we ship daily.
  let trend:        string;
  let categoryHint: string | undefined;
  let mode:         "manual" | "autonomous";
  let seedCategory: SkillCategory | undefined;

  if (inputTrend !== undefined) {
    trend        = inputTrend;
    categoryHint = inputCategoryHint;
    mode         = "manual";
  } else {
    const under = await fetchUnderrepresentedCategories();
    const seed: SkillSeed = pickSeed(under);
    trend        = seed.prompt;
    categoryHint = inputCategoryHint ?? seed.category;
    seedCategory = seed.category;
    mode         = "autonomous";
  }

  // --------------------------------------------------- generate + score loop
  // First attempt; if quality < threshold, retry ONCE with reviewer feedback.
  // Two attempts max — Vercel timeout budget is 60s on Pro, two Groq calls per
  // attempt easily fit. After two rejections we give up and return 422.
  let draft:    Draft;
  let score:    number;
  let reasoning: string;
  let attempt = 1;

  try {
    const first = await generateAndScore(trend, categoryHint, catalogLabel);
    draft     = first.draft;
    score     = first.score;
    reasoning = first.reasoning;
  } catch (err) {
    return classifyGenError(err);
  }

  if (score < QUALITY_THRESHOLD) {
    attempt = 2;
    try {
      const retry = await generateAndScore(
        trend,
        categoryHint,
        catalogLabel,
        { prevDraft: draft, prevReasoning: reasoning },
      );
      draft     = retry.draft;
      score     = retry.score;
      reasoning = retry.reasoning;
    } catch (err) {
      return classifyGenError(err);
    }
  }

  if (score < QUALITY_THRESHOLD) {
    return NextResponse.json(
      {
        ok:        false,
        reason:    "low_quality",
        score,
        reasoning,
        draft,
        attempts:  attempt,
        mode,
        ...(seedCategory !== undefined ? { seed_category: seedCategory } : {}),
      },
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

  // ---------------------------------------------------------------- smoke test
  // Founder rule: every new skill must be verified before going live. We hit
  // the public detail page once; if it doesn't render 200 we auto-unpublish so
  // a broken skill never sits in front of users. Any error here also unpublishes
  // — fail closed, not open.
  let smokeOk = false;
  let smokeStatus: number | null = null;
  let smokeError: string | null = null;
  try {
    const smoke = await fetch(`${SITE_BASE_URL}/skills/${draft.slug}`, {
      method: "GET",
      headers: { "User-Agent": "skill-smith-smoke/1.0" },
      cache:   "no-store",
    });
    smokeStatus = smoke.status;
    smokeOk     = smoke.ok;
  } catch (err) {
    smokeError = err instanceof Error ? err.message : "unknown";
  }

  if (!smokeOk) {
    await supabaseAdmin
      .from("skills")
      .update({ published: false })
      .eq("slug", draft.slug);

    return NextResponse.json(
      {
        ok:            false,
        reason:        "smoke_test_failed",
        skill:         { ...data, published: false },
        quality_score: score,
        quality_note:  reasoning,
        smoke_status:  smokeStatus,
        smoke_error:   smokeError,
        message:       "Skill inserted but auto-unpublished — detail page did not return 200.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json(
    {
      ok:            true,
      skill:         data,
      quality_score: score,
      quality_note:  reasoning,
      smoke_status:  smokeStatus,
      attempts:      attempt,
      mode,
      url:           `${SITE_BASE_URL}/skills/${draft.slug}`,
      ...(seedCategory !== undefined ? { seed_category: seedCategory } : {}),
      ...(source_url !== undefined ? { source_url } : {}),
    },
    { status: 201 },
  );
}
