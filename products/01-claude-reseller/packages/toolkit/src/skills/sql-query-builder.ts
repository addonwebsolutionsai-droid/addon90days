import { z } from "zod";
import type { SkillDefinition } from "../types/skill.js";

const InputSchema = z.object({
  naturalLanguage: z.string(),
  schema: z.array(z.object({
    table: z.string(),
    columns: z.array(z.object({ name: z.string(), type: z.string(), nullable: z.boolean().default(true) })),
    primaryKey: z.string().optional(),
    foreignKeys: z.array(z.object({ column: z.string(), refTable: z.string(), refColumn: z.string() })).optional(),
  })),
  dialect: z.enum(["postgresql", "mysql", "sqlite", "mssql", "timescaledb"]).default("postgresql"),
  readonly: z.boolean().default(true),
});

const OutputSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
  warnings: z.array(z.string()),
  optimizationTips: z.array(z.string()),
  estimatedComplexity: z.enum(["simple", "moderate", "complex"]),
});

export const sqlQueryBuilder: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "sql-query-builder",
    name: "SQL Query Builder",
    description: "Convert natural language to optimized SQL. Understands your schema. Flags N+1 risks, missing indexes, and injection vectors.",
    version: "1.0.0",
    category: "developer",
    tags: ["sql", "database", "postgresql", "query", "optimization"],
    priceUsd: 9,
    model: "claude-haiku-4-5-20251001",
    estimatedTokens: 1200,
  },
  input: {
    schema: InputSchema,
    example: {
      naturalLanguage: "Show me the top 10 devices by average vibration in the last 7 days, grouped by machine type",
      schema: [
        {
          table: "devices",
          columns: [
            { name: "id", type: "uuid", nullable: false },
            { name: "machine_type", type: "text", nullable: false },
            { name: "org_id", type: "uuid", nullable: false },
          ],
          primaryKey: "id",
        },
        {
          table: "telemetry",
          columns: [
            { name: "device_id", type: "uuid", nullable: false },
            { name: "time", type: "timestamptz", nullable: false },
            { name: "metric", type: "text", nullable: false },
            { name: "value", type: "float8", nullable: false },
          ],
          foreignKeys: [{ column: "device_id", refTable: "devices", refColumn: "id" }],
        },
      ],
      dialect: "timescaledb",
      readonly: true,
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are a database expert specializing in query optimization.
Generate SQL that is:
- Correct and runnable (no placeholders)
- Optimized (uses indexes, avoids full table scans where possible)
- Safe (parameterized where user input could be injected — flag if prompt implies dynamic values)
- Readable (use CTEs for complex logic, alias tables clearly)
For TimescaleDB: use time_bucket() for time aggregations. Use continuous aggregates when available.
If readonly=true and query modifies data, return an error in warnings.
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Build a ${input.dialect} query for:
"${input.naturalLanguage}"

Schema:
${JSON.stringify(input.schema, null, 2)}

Readonly mode: ${input.readonly}`,
};
