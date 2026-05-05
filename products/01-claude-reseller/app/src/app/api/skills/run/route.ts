/**
 * POST /api/skills/run
 *
 * Server-side skill execution. Two paths:
 *   1. TYPED skills (legacy 10) — listed in SKILL_MAP; run through the
 *      toolkit's Zod-validated runner with strict input/output typing.
 *   2. CATALOG skills (the other 120) — fall back to a Groq-backed
 *      generic runner: load the skill's workflow from Supabase, render
 *      it as a system prompt, send the user's input through Llama 3.3
 *      70B, return whatever Claude/Llama produces.
 *
 * Auth: Clerk sign-in required.
 * Pricing: ALL skills free during beta. Sign-in is the only gate.
 *
 * Request:
 *   { skillId: "<kebab-slug>", input: <object | string> }
 *
 * Response:
 *   200 { data: <typed result | { content: string }>, meta: { durationMs, runner: "typed"|"generic" } }
 *   401 unauthenticated · 404 unknown skill · 422 runner failure · 500 internal
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, clientIdentifier, rateLimitedResponse } from "@/lib/rate-limit";
import {
  runSkill,
  invoiceGenerator,
  gstCalculator,
  emailDrafter,
  codeReviewer,
  prDescription,
  sqlQueryBuilder,
  testGenerator,
  iotFirmwareScaffold,
  iotDeviceSchema,
  iotOtaPipeline,
} from "@/lib/toolkit";
import type { SkillDefinition } from "@/lib/toolkit";
import type { Skill, SkillStep } from "@/lib/database.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPED_SKILLS: Record<string, SkillDefinition<any, any>> = {
  "invoice-generator":           invoiceGenerator,
  "gst-calculator":              gstCalculator,
  "email-drafter":               emailDrafter,
  "code-reviewer":               codeReviewer,
  "pr-description":              prDescription,
  "sql-query-builder":           sqlQueryBuilder,
  "test-generator":              testGenerator,
  "iot-firmware-scaffold":       iotFirmwareScaffold,
  "iot-device-registry-schema":  iotDeviceSchema,
  "iot-ota-pipeline":            iotOtaPipeline,
};

const GROQ_API   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_OUTPUT_TOKENS = 1500;

const RequestSchema = z.object({
  skillId: z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "skillId must be kebab-case slug"),
  // Allow either a string (free-form prompt) or an object (structured input).
  input:   z.union([z.string().max(8000), z.record(z.unknown())]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json({ error: "Sign in to run skills" }, { status: 401 });
  }

  // Three-tier rate limit defending against:
  //   1) burst abuse from one user (60/hr)
  //   2) slow-drip abuse from one user across the day (200/day)
  //   3) account farming from one IP — many free accounts, low per-account
  //      rate, but huge aggregate (300/hr/IP). Bypassable via VPN, but
  //      raises the cost-of-abuse and stops the cheap script-kiddie case.
  const userHourly = await checkRateLimit({ key: `skills_run:user:${userId}`, limit: 60, windowSeconds: 3600 });
  if (!userHourly.allowed) {
    return rateLimitedResponse(
      userHourly.retryAfterSec,
      `Too many runs this hour. Try again in ${Math.ceil(userHourly.retryAfterSec / 60)} min.`
    );
  }
  const userDaily = await checkRateLimit({ key: `skills_run:user_daily:${userId}`, limit: 200, windowSeconds: 86400 });
  if (!userDaily.allowed) {
    return rateLimitedResponse(
      userDaily.retryAfterSec,
      `You've hit today's limit (200 runs/day). Resets in ${Math.ceil(userDaily.retryAfterSec / 3600)}h.`
    );
  }
  const ipHourly = await checkRateLimit({ key: `skills_run:ip:${clientIdentifier(req)}`, limit: 300, windowSeconds: 3600 });
  if (!ipHourly.allowed) {
    return rateLimitedResponse(
      ipHourly.retryAfterSec,
      `Too many runs from your network this hour. Try again in ${Math.ceil(ipHourly.retryAfterSec / 60)} min.`
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { skillId, input } = parsed.data;
  const startedAt = Date.now();

  // ---------------------------------------------------------------- TYPED PATH
  // Only used when caller explicitly passes a structured object — typed
  // skills demand that for Zod validation. String input falls through to
  // catalog path so the website "Try Live" form (textarea) works on
  // every skill regardless of whether it has a Zod schema.
  const typedSkill = TYPED_SKILLS[skillId];
  if (typedSkill !== undefined && typeof input !== "string") {
    const result = await runSkill(typedSkill, input);
    if (!result.success) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: 422 });
    }
    return NextResponse.json({
      data: result.data,
      meta: {
        runner:     "typed",
        skillId,
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
      },
    });
  }

  // -------------------------------------------------------------- CATALOG PATH
  const skill = await loadCatalogSkill(skillId);
  if (skill === null) {
    return NextResponse.json({ error: `Unknown skill: ${skillId}` }, { status: 404 });
  }

  const groqKey = process.env["GROQ_API_KEY"];
  if (!groqKey) {
    return NextResponse.json({ error: "Server misconfigured: GROQ_API_KEY missing" }, { status: 500 });
  }

  const systemPrompt = buildSkillSystemPrompt(skill);
  const userMessage  = typeof input === "string" ? input : JSON.stringify(input, null, 2);

  let runnerOutput: string;
  try { runnerOutput = await runWithGroq(groqKey, systemPrompt, userMessage); }
  catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Skill execution failed: ${msg.slice(0, 200)}`, code: "RUNNER_ERROR" },
      { status: 422 }
    );
  }

  return NextResponse.json({
    data: { content: runnerOutput },
    meta: {
      runner:     "generic",
      skillId,
      durationMs: Date.now() - startedAt,
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadCatalogSkill(slug: string): Promise<Skill | null> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error !== null || data === null) return null;
  return data as Skill;
}

function buildSkillSystemPrompt(skill: Skill): string {
  const lines: string[] = [];
  lines.push(`You are executing the "${skill.title}" skill from SKILON (by AddonWeb).`);
  lines.push("");
  lines.push(skill.description);
  lines.push("");
  if (Array.isArray(skill.steps) && skill.steps.length > 0) {
    lines.push("## Workflow — follow these steps in order:");
    lines.push("");
    for (let i = 0; i < (skill.steps as SkillStep[]).length; i++) {
      const step    = (skill.steps as SkillStep[])[i]!;
      const stepNum = step.number ?? i + 1;
      lines.push(`### Step ${stepNum}: ${step.title}`);
      if (step.description) lines.push(step.description);
      if (step.code) {
        const lang = step.language ?? "";
        lines.push("```" + lang);
        lines.push(step.code);
        lines.push("```");
      }
      lines.push("");
    }
  }
  lines.push("---");
  lines.push("Respond with the actual deliverable (code / config / document / analysis) the skill produces — not a meta-description of what you would do. Use Markdown. Keep it under 1500 tokens.");
  return lines.join("\n");
}

async function runWithGroq(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch(GROQ_API, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      max_tokens:  MAX_OUTPUT_TOKENS,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json    = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "";
  if (content.length === 0) throw new Error("Groq returned empty content");
  return content;
}
