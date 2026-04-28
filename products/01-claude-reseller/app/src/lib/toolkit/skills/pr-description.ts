import { z } from "zod";
import type { SkillDefinition } from "../types/skill";

const InputSchema = z.object({
  diff: z.string().max(30000),
  commits: z.array(z.string()).optional(),
  jiraTicket: z.string().optional(),
  breakingChange: z.boolean().default(false),
  prType: z.enum(["feature", "bugfix", "refactor", "docs", "chore", "hotfix"]).optional(),
});

const OutputSchema = z.object({
  title: z.string().max(72),
  body: z.string(),
  labels: z.array(z.string()),
  reviewChecklist: z.array(z.string()),
  testPlan: z.array(z.string()),
  breakingChanges: z.array(z.string()),
});

export const prDescription: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "pr-description",
    name: "PR Description Generator",
    description: "Generate structured, informative pull request descriptions from git diffs. Includes review checklist, test plan, and breaking change notes.",
    version: "1.0.0",
    category: "developer",
    tags: ["git", "github", "pull-request", "code-review", "documentation"],
    priceUsd: 0,
    model: "claude-haiku-4-5-20251001",
    estimatedTokens: 1000,
  },
  input: {
    schema: InputSchema,
    example: {
      diff: "diff --git a/src/auth.ts b/src/auth.ts\n+export const authenticate = ...",
      commits: ["feat: add JWT refresh token rotation", "fix: handle expired token edge case"],
      breakingChange: false,
      prType: "feature",
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are a senior engineer who writes clear, informative pull request descriptions.
PR title: <type>: <what changed> in ≤72 characters.
Body format (markdown):
## Summary
- 2-4 bullet points explaining WHAT and WHY

## Changes
- Technical breakdown of what changed

## Test Plan
- How to verify this works

## Breaking Changes (if any)
- What downstream consumers need to change

Be specific, technical, and concise. No filler sentences.
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Generate a PR description for this diff:
${input.jiraTicket ? `Jira: ${input.jiraTicket}\n` : ""}
${input.commits?.length ? `Commits:\n${input.commits.join("\n")}\n` : ""}
Breaking change: ${input.breakingChange}
Type: ${input.prType ?? "auto-detect"}

Diff:
\`\`\`diff
${input.diff}
\`\`\``,
};
