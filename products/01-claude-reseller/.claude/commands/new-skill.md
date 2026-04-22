# /new-skill

Creates a new Claude Toolkit skill with all required files and tests.

## Usage
```
/new-skill invoice-generator "Generates GST-compliant invoices"
```

## What This Creates
```
packages/toolkit/src/skills/<name>/
  index.ts          ← Skill definition + Claude prompt
  schema.ts         ← Zod input/output schema
  handler.ts        ← Business logic
  __tests__/
    skill.test.ts   ← Unit tests (min 3 scenarios)
```

And registers in `packages/toolkit/src/registry.ts`

## Required Fields in index.ts
```typescript
export const skillName = {
  name: string,           // kebab-case
  description: string,    // shown in marketplace
  version: string,        // semver
  pricing: number,        // price in USD
  inputSchema: ZodSchema,
  prompt: string,         // Claude system prompt
  handler: async (input) => output,
} satisfies Skill;
```

## Checklist Before PR
- [ ] TypeScript compiles: `pnpm typecheck`
- [ ] Tests pass: `pnpm test`
- [ ] Prompt tested with 3+ real inputs
- [ ] Description written (max 150 chars for marketplace card)
- [ ] Added to CHANGELOG.md
