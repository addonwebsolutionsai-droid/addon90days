import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { SkillDefinition, SkillResult } from "../types/skill";

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] ?? "");

// Map Claude model tiers to Gemini equivalents
function resolveModel(claudeModel: string): string {
  if (claudeModel.includes("haiku")) return "gemini-1.5-flash";
  if (claudeModel.includes("sonnet")) return "gemini-1.5-pro";
  return "gemini-1.5-flash";
}

export async function runSkill<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
>(
  skill: SkillDefinition<TInput, TOutput>,
  rawInput: unknown,
): Promise<SkillResult<z.infer<TOutput>>> {
  const parsed = skill.input.schema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message, code: "VALIDATION" };
  }

  const start = Date.now();
  try {
    const model = genAI.getGenerativeModel({
      model: resolveModel(skill.meta.model),
      systemInstruction: skill.systemPrompt,
    });

    const result = await model.generateContent(skill.buildUserPrompt(parsed.data));
    const text = result.response.text();

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const rawJson = jsonMatch ? jsonMatch[1] : text;

    let parsed2: unknown;
    try {
      parsed2 = JSON.parse(rawJson ?? "");
    } catch {
      return { success: false, error: "Model returned non-JSON output", code: "PARSE" };
    }

    const outputParsed = skill.output.schema.safeParse(parsed2);
    if (!outputParsed.success) {
      return { success: false, error: outputParsed.error.message, code: "PARSE" };
    }

    return {
      success: true,
      data: outputParsed.data,
      tokensUsed: result.response.usageMetadata?.totalTokenCount ?? 0,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown API error",
      code: "API",
    };
  }
}
