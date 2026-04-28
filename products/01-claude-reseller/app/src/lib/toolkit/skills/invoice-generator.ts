import { z } from "zod";
import type { SkillDefinition } from "../types/skill";

const InputSchema = z.object({
  sellerName: z.string(),
  sellerAddress: z.string(),
  sellerGstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/).optional(),
  buyerName: z.string(),
  buyerAddress: z.string(),
  buyerGstin: z.string().optional(),
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  lineItems: z.array(z.object({
    description: z.string(),
    hsn: z.string().optional(),
    quantity: z.number().positive(),
    unit: z.string().default("Nos"),
    ratePerUnit: z.number().positive(),
    gstRate: z.number().min(0).max(28).default(18),
  })),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

const OutputSchema = z.object({
  invoiceHtml: z.string(),
  summary: z.object({
    subtotal: z.number(),
    totalGst: z.number(),
    totalAmount: z.number(),
    currency: z.string(),
    lineCount: z.number(),
  }),
});

export const invoiceGenerator: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "invoice-generator",
    name: "Invoice Generator",
    description: "Generate professional GST-compliant invoices as HTML. Supports INR/USD/EUR, GSTIN validation, HSN codes, multi-line items.",
    version: "1.0.0",
    category: "business",
    tags: ["invoice", "gst", "billing", "india", "finance"],
    priceUsd: 0,
    model: "claude-haiku-4-5-20251001",
    estimatedTokens: 1500,
  },
  input: {
    schema: InputSchema,
    example: {
      sellerName: "AddonWeb Solutions",
      sellerAddress: "Ahmedabad, Gujarat 380001",
      sellerGstin: "24AABCA1234A1Z5",
      buyerName: "Acme Corp Pvt Ltd",
      buyerAddress: "Mumbai, Maharashtra 400001",
      invoiceNumber: "INV-2024-001",
      invoiceDate: "2024-04-22",
      lineItems: [
        { description: "Claude Toolkit License", quantity: 1, unit: "Nos", ratePerUnit: 4999, gstRate: 18 },
        { description: "Integration Support", quantity: 5, unit: "hrs", ratePerUnit: 2000, gstRate: 18 },
      ],
      currency: "INR",
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are an expert at generating professional, GST-compliant Indian business invoices.
Generate clean, printable HTML invoices with:
- Professional layout with seller/buyer blocks
- Line items table with HSN codes, quantities, rates, GST breakdown (CGST+SGST for intra-state, IGST for inter-state)
- Totals section with words (e.g., "Rupees Forty Two Thousand Only")
- QR code placeholder div for UPI payment
- Inline CSS only (no external stylesheets)
Always respond with a JSON object matching the output schema exactly, wrapped in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Generate a professional invoice with these details:
${JSON.stringify(input, null, 2)}

Respond with JSON:
{
  "invoiceHtml": "<full HTML string>",
  "summary": {
    "subtotal": <number>,
    "totalGst": <number>,
    "totalAmount": <number>,
    "currency": "${input.currency}",
    "lineCount": ${input.lineItems.length}
  }
}`,
};
