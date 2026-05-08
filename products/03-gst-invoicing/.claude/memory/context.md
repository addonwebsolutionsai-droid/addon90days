# P03 · TaxPilot — Session Context

## Current Status
**Phase:** Phase 1 build started (2026-05-08, Day 11)
**Target Launch:** Phase 1 invoicing — Day 28 (2026-05-25); Phase 2 GSTN/IRP filing — Day 45 (2026-06-06)
**Last Updated:** 2026-05-08

## What's Done (Day 11)
- PRD reviewed
- Marketing page live at /taxpilot with own brand title (no SKILON suffix)
- Migration `011_p03_taxpilot.sql` applied to Supabase: 5 tables (businesses, customers, hsn_codes, invoice_lines, invoices) + RLS deny-all policies for anon/authenticated + service-role-only writes + pg_trgm extension for HSN autocomplete
- 24 HSN/SAC codes seeded (12 marked `is_common` for default autocomplete) — covers IT services, common goods, services, exempt
- GST calculation engine at `lib/p03/gst-calc.ts` — pure functions, no IO:
  - `round2`, `roundToRupee` (Indian half-up convention)
  - `classifySupply` (intra/inter/export from party locations)
  - `computeLine` (per-line CGST/SGST/IGST/cess split, handles regular/composition/export schemes)
  - `computeInvoiceTotals` (multi-line aggregation + round-off to rupee)
  - `isValidGstinFormat`, `gstinStateCode` (regex format check; not GSTN-API)
- 26/26 unit tests passing via `node:test` (no vitest dep added)

## Phase 1 plan (no GSP/IRP needed)
1. ~~DB schema~~ ✅
2. ~~GST calculation engine + tests~~ ✅
3. ~~Marketing page own-brand title~~ ✅
4. **NEXT:** Stub auth-gated API routes (`/api/p03/businesses`, `/customers`, `/invoices`, `/hsn/search`)
5. Server actions for invoice CRUD using the calc engine
6. PDF generation (likely @react-pdf/renderer for Vercel serverless compatibility, not WeasyPrint which needs Python)
7. Dashboard pages at `/dashboard/taxpilot/...`
8. Razorpay subscription wiring (deferred — free during beta first)

## Phase 2 — GSP-blocked (later)
- GSTN API integration for GSTIN validation, GSTR-1 / GSTR-3B filing
- IRP e-Invoice IRN + signed QR
- Need GSP registration (2-4 week external wait at gstn.gov.in/gsps)
- Need IRP sandbox credentials (einvoice1.gst.gov.in)

## Key Decisions (revised 2026-05-08)
- **Stack pivot:** ship Phase 1 in the Next.js monorepo (TypeScript only). The original PRD called for FastAPI because the GSTN API SDK is Python — but Phase 1 doesn't need GSTN. We can stand up FastAPI later for Phase 2 GSTN integration if needed.
- **PDF pivot:** away from WeasyPrint (Python + headless browser) toward @react-pdf/renderer (pure JS, runs in Vercel serverless). PDF/A compliance only matters once we're filing e-invoices — Phase 2 problem.
- **Encryption key reuse:** P02_ENCRYPTION_KEY also covers P03 bank-account-number encryption (`bank_account_number_enc BYTEA` column). Single key per project.
- **Pricing during beta:** free for first year (per founder rule). Pricing tiers (₹499/₹999/₹2,999/mo) deferred until end of beta.
- **HSN master refresh:** only 24 seeded; full 5,000-code load is a separate data script (not blocking Phase 1).

## Cleared blockers
- Backend stack decision — chose TS / Next.js for Phase 1
- DB schema design — applied
- Calc engine — built + tested (26/26)

## Open blockers (Phase 2 only)
- GSP registration with GSTN (gstn.gov.in/gsps, 2-4 week wait)
- IRP e-Invoice sandbox credentials

## Critical External Dependencies (Phase 2)
- GSTN API (government — sometimes slow/down)
- IRP API (government — has maintenance windows)
- Always build with graceful degradation for both

## Session Notes
**2026-05-08 (Day 11):** Phase 1 foundation laid in one session — migration, calc engine, tests. Skipped FastAPI complexity for Phase 1; revisit when GSTN integration needs Python. Marketing page is live but barely traffic'd; founder needs to point traffic when there's a working dashboard to convert visitors. PAT (sbp_26612c54) still alive, used for migration apply; founder still needs to revoke after this session.
