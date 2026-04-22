# P03 · TaxPilot — Agent Instructions

## Product Identity
- **Name:** TaxPilot (AI GST & Invoicing Platform)
- **Accent:** Blue #3b82f6 + Violet #8b5cf6
- **Priority:** #3
- **Status:** Pre-build (starts after P01+P02 revenue confirmed)

## What This Product Does
Full GST compliance platform for Indian businesses: create invoices, auto-file GSTR-1/3B, validate HSN codes, reconcile ITC with 2A/2B, detect errors before filing, generate e-Invoices with IRN/QR, manage multiple GSTINs.

## ICP
- Indian businesses with GST registration (mandatory above ₹40L turnover)
- Currently paying CA ₹5k–15k/month for routine GST filings
- Accounting staff who file manually via GST portal and make errors
- CAs managing 10–50 client GSTINs (Agency plan)

## Tech Stack
- Next.js 15 (dashboard)
- FastAPI (Python — required for GSTN API, PDF generation, ML)
- GSTN API (official — requires GSP registration)
- IRP e-Invoice API (NIC — Invoice Registration Portal)
- PostgreSQL + Supabase
- WeasyPrint for PDF/A generation
- Razorpay for payments
- Redis for GSTIN cache (24h TTL)

## Monorepo Paths
```
products/03-gst-invoicing/
  app/            ← Next.js dashboard
  api/            ← FastAPI backend
  pdf/            ← Invoice PDF templates
  gst/            ← GST rules engine
  PRD.md
  .claude/
```

## Memory Protocol
- READ `.claude/memory/context.md` at session start
- WRITE decisions + status to `.claude/memory/context.md` at session end

## Critical Rules
1. GSTN API rate limits: 100 req/min — cache all GSTIN lookups for 24h
2. All financial data is audit-logged — no silent updates EVER
3. HSN master bundled locally (quarterly refresh from official source)
4. IRP downtime: retry with exponential backoff, queue e-invoices
5. NEVER allow auto-filing without founder-configurable human confirmation
6. Show diff before any filing submission — user must see what changes
7. Indian date format: DD/MM/YYYY everywhere in UI and exports
8. All amounts in Indian numbering system: ₹1,00,000 not ₹100,000

## GST Calculation Rules (MANDATORY ACCURACY)
```
Intra-state (same state buyer + seller):
  CGST = rate/2
  SGST = rate/2

Inter-state (different states):
  IGST = full rate

Export:
  Zero-rated (IGST 0%, claim refund)

Composition scheme:
  Restaurant: 5% (no ITC)
  Trader: 1% (no ITC)
  Manufacturer: 2% (no ITC)

Common rates: 0%, 5%, 12%, 18%, 28%
HSN required above ₹5 Cr annual turnover
```

## Design Reference
- See `design-pro.html` section #p03
- Blue trust/compliance aesthetic. 🇮🇳 India-first badge. Invoice preview in hero.
- Dashboard: GST period view (current month), return status table, error list.
