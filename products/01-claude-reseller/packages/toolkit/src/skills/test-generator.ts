import { z } from "zod";
import type { SkillDefinition } from "../types/skill.js";

const InputSchema = z.object({
  code: z.string().max(20000),
  language: z.string(),
  testFramework: z.enum(["jest", "vitest", "pytest", "go-test", "mocha"]).default("jest"),
  testTypes: z.array(z.enum(["unit", "integration", "edge-cases", "error-paths"])).default(["unit", "edge-cases"]),
  coverageTarget: z.number().min(0).max(100).default(80),
});

const OutputSchema = z.object({
  testFile: z.string(),
  testCount: z.number(),
  coverageEstimate: z.number(),
  missedCases: z.array(z.string()),
  setupRequired: z.array(z.string()),
});

export const testGenerator: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "test-generator",
    name: "Test Generator",
    description: "Generate comprehensive test suites from source code. Covers happy path, edge cases, and error paths. Outputs runnable test files.",
    version: "1.0.0",
    category: "developer",
    tags: ["testing", "jest", "vitest", "pytest", "tdd", "coverage"],
    priceUsd: 9,
    model: "claude-sonnet-4-6",
    estimatedTokens: 3000,
  },
  input: {
    schema: InputSchema,
    example: {
      code: `export function calculateGst(amount: number, rate: number, isInterState: boolean) {
  if (amount <= 0) throw new Error('Amount must be positive');
  const gst = amount * (rate / 100);
  return isInterState ? { igst: gst } : { cgst: gst/2, sgst: gst/2 };
}`,
      language: "typescript",
      testFramework: "vitest",
      testTypes: ["unit", "edge-cases", "error-paths"],
      coverageTarget: 90,
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are a testing expert who writes tests that actually catch bugs.
Test structure: describe → it/test with clear names ("should X when Y").
Cover: happy path, boundary values, null/undefined inputs, type mismatches, error throws, async rejections.
No mocking unless external dependencies require it — prefer testing real behavior.
Generate import statements and any required setup.
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Generate ${input.testFramework} tests for this ${input.language} code:
Test types: ${input.testTypes.join(", ")}
Coverage target: ${input.coverageTarget}%

\`\`\`${input.language}
${input.code}
\`\`\``,
};
