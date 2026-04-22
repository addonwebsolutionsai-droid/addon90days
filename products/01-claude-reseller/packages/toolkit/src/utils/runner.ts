import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { SkillDefinition, SkillResult } from "../types/skill.js";

const client = new Anthropic();

export async function runSkill<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
>(
  skill: SkillDefinition<TInput, TOutput>,
  rawInput: unknown,
): Promise<SkillResult<z.infer<TOutput>>> {
  const parsed = skill.input.schema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.message,
      code: "VALIDATION",
    };
  }

  const start = Date.now();
  try {
    const response = await client.messages.create({
      model: skill.meta.model,
      max_tokens: 4096,
      system: skill.systemPrompt,
      messages: [
        { role: "user", content: skill.buildUserPrompt(parsed.data) },
      ],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

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
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
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
