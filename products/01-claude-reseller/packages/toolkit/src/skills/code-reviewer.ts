import { z } from "zod";
import type { SkillDefinition } from "../types/skill.js";

const InputSchema = z.object({
  code: z.string().max(50000),
  language: z.string(),
  context: z.string().optional(),
  focusAreas: z.array(z.enum([
    "security", "performance", "maintainability", "bugs", "tests", "types", "all"
  ])).default(["all"]),
  severity: z.enum(["critical-only", "important", "all"]).default("important"),
});

const IssueSchema = z.object({
  severity: z.enum(["critical", "warning", "suggestion"]),
  category: z.string(),
  line: z.number().optional(),
  description: z.string(),
  recommendation: z.string(),
  codeSnippet: z.string().optional(),
});

const OutputSchema = z.object({
  summary: z.string(),
  score: z.number().min(0).max(100),
  issues: z.array(IssueSchema),
  positives: z.array(z.string()),
  quickFixes: z.array(z.object({
    description: z.string(),
    before: z.string(),
    after: z.string(),
  })),
});

export const codeReviewer: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Deep code review with security scanning, performance analysis, and actionable fix suggestions. Supports all languages.",
    version: "1.0.0",
    category: "developer",
    tags: ["code-review", "security", "performance", "typescript", "refactoring"],
    priceUsd: 0,
    model: "claude-sonnet-4-6",
    estimatedTokens: 3000,
  },
  input: {
    schema: InputSchema,
    example: {
      code: `async function getUser(id) {
  const result = await db.query('SELECT * FROM users WHERE id = ' + id);
  return result.rows[0];
}`,
      language: "javascript",
      focusAreas: ["security", "bugs"],
      severity: "important",
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are a senior software engineer conducting thorough code reviews.
Focus on: security vulnerabilities (OWASP top 10), SQL injection, XSS, performance bottlenecks, type safety, error handling, and code maintainability.
Be specific: include line numbers, concrete recommendations, and before/after code examples.
Score out of 100: 90+ means production-ready, 70-89 needs minor fixes, <70 needs significant work.
Always respond with JSON matching the output schema, wrapped in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Review this ${input.language} code:
${input.context ? `Context: ${input.context}\n` : ""}
Focus areas: ${input.focusAreas.join(", ")}
Severity filter: ${input.severity}

\`\`\`${input.language}
${input.code}
\`\`\`

Return JSON with summary, score (0-100), issues array, positives, and quickFixes.`,
};
