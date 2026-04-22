# Skill Spec: invoice-generator

## Overview
Generates GST-compliant invoices in structured JSON + PDF from natural language or structured input.

## Trigger
`/invoice` or `/create-invoice` or "create invoice for..."

## Input Schema (Zod)
```typescript
z.object({
  customer: z.object({
    name: z.string(),
    gstin: z.string().optional(),
    address: z.string(),
    state: z.string(),   // for determining CGST/SGST vs IGST
  }),
  items: z.array(z.object({
    description: z.string(),
    hsn: z.string().optional(),
    quantity: z.number().positive(),
    unit: z.string().default('Nos'),
    rate: z.number().positive(),
    gst_rate: z.number().default(18),  // 0, 5, 12, 18, 28
  })),
  invoice_date: z.string().optional(),  // defaults to today
  payment_terms: z.string().optional(), // "Net 30", "Due on receipt"
  notes: z.string().optional(),
  supplier_gstin: z.string(),           // from user's profile
})
```

## Claude Prompt
```
You are an Indian GST invoicing expert. Given the order details, calculate the correct GST:
- Same state supplier + buyer → CGST + SGST (split 50/50)
- Different state → IGST (full rate)
- Exports → Zero-rated (0%)

Rules:
1. Validate HSN codes against standard list. If missing, suggest based on item description.
2. Round GST to 2 decimal places.
3. Calculate subtotal, total GST, grand total.
4. Generate invoice number: INV-YYYY-NNNN format.
5. Output as structured JSON matching the InvoiceOutput schema.

Return ONLY valid JSON. No markdown, no explanation.
```

## Output
```typescript
{
  invoice_number: string,
  invoice_date: string,
  subtotal: number,
  cgst: number,       // if intra-state
  sgst: number,       // if intra-state
  igst: number,       // if inter-state
  total: number,
  items: ProcessedItem[],
  pdf_base64: string, // generated PDF
}
```

## Tests Required
1. Intra-state invoice, 3 items, mixed GST rates
2. Inter-state invoice, single item
3. Invalid GSTIN → error with clear message
4. Zero-rated export invoice
5. Large invoice (50+ line items)
