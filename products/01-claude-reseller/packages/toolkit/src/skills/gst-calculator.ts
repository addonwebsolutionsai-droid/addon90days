import { z } from "zod";
import type { SkillDefinition } from "../types/skill.js";

const InputSchema = z.object({
  transactionType: z.enum(["b2b", "b2c", "export", "import"]),
  sellerState: z.string().length(2),
  buyerState: z.string().length(2),
  lineItems: z.array(z.object({
    description: z.string(),
    hsn: z.string(),
    amount: z.number().positive(),
    gstRate: z.number().min(0).max(28),
    isZeroRated: z.boolean().default(false),
  })),
  isCompositionScheme: z.boolean().default(false),
  reverseCharge: z.boolean().default(false),
  fy: z.string().default("2024-25"),
});

const OutputSchema = z.object({
  transactionSummary: z.object({
    type: z.string(),
    isInterState: z.boolean(),
    applicableLaw: z.string(),
  }),
  lineBreakdown: z.array(z.object({
    description: z.string(),
    hsn: z.string(),
    taxableAmount: z.number(),
    cgst: z.object({ rate: z.number(), amount: z.number() }).optional(),
    sgst: z.object({ rate: z.number(), amount: z.number() }).optional(),
    igst: z.object({ rate: z.number(), amount: z.number() }).optional(),
    cess: z.number().optional(),
    total: z.number(),
  })),
  totals: z.object({
    taxableAmount: z.number(),
    totalCgst: z.number(),
    totalSgst: z.number(),
    totalIgst: z.number(),
    totalCess: z.number(),
    totalGst: z.number(),
    grandTotal: z.number(),
  }),
  complianceNotes: z.array(z.string()),
  filingRecommendations: z.array(z.string()),
});

export const gstCalculator: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "gst-calculator",
    name: "GST Calculator",
    description: "Accurate GST computation for Indian businesses. Handles intra/inter-state, B2B/B2C, composition scheme, reverse charge, zero-rated exports.",
    version: "1.0.0",
    category: "finance",
    tags: ["gst", "india", "tax", "compliance", "invoice", "hsn"],
    priceUsd: 0,
    model: "claude-haiku-4-5-20251001",
    estimatedTokens: 1200,
  },
  input: {
    schema: InputSchema,
    example: {
      transactionType: "b2b",
      sellerState: "GJ",
      buyerState: "MH",
      lineItems: [
        { description: "Software License", hsn: "998314", amount: 100000, gstRate: 18, isZeroRated: false },
        { description: "Hardware Component", hsn: "8542", amount: 50000, gstRate: 12, isZeroRated: false },
      ],
      isCompositionScheme: false,
      reverseCharge: false,
      fy: "2024-25",
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are an expert Indian GST consultant with deep knowledge of CGST/SGST/IGST rules.
Rules:
- Intra-state (same state): CGST (rate/2) + SGST (rate/2)
- Inter-state (different states): IGST (full rate)
- Exports: Zero-rated (IGST 0% or with refund claim)
- Composition scheme: 1% for traders, 5% for restaurants, 6% for manufacturers
- Reverse charge: buyer pays GST instead of seller
- Common rates: 0%, 5%, 12%, 18%, 28% + cess on select items
- State codes: GJ=Gujarat, MH=Maharashtra, DL=Delhi, KA=Karnataka, TN=Tamil Nadu, etc.
Always respond with JSON matching the schema, in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Calculate GST for this transaction (FY ${input.fy}):
${JSON.stringify(input, null, 2)}

Determine if intra-state or inter-state, apply correct CGST/SGST/IGST split, and flag any compliance issues.
Return full breakdown JSON.`,
};
