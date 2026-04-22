import { z } from "zod";

export const SkillMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  category: z.enum([
    "developer",
    "iot",
    "content",
    "business",
    "research",
    "finance",
  ]),
  tags: z.array(z.string()),
  priceUsd: z.number().positive(),
  model: z.enum(["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"]),
  estimatedTokens: z.number().positive(),
});

export type SkillMeta = z.infer<typeof SkillMetaSchema>;

export interface SkillInput<T extends z.ZodType> {
  schema: T;
  example: z.infer<T>;
}

export interface SkillOutput<T extends z.ZodType> {
  schema: T;
}

export interface SkillDefinition<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
> {
  meta: SkillMeta;
  input: SkillInput<TInput>;
  output: SkillOutput<TOutput>;
  systemPrompt: string;
  buildUserPrompt: (input: z.infer<TInput>) => string;
}

export type SkillResult<T> =
  | { success: true; data: T; tokensUsed: number; durationMs: number }
  | { success: false; error: string; code: "VALIDATION" | "API" | "PARSE" };
