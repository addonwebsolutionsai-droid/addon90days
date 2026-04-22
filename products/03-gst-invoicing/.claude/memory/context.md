# P03 · TaxPilot — Session Context

## Current Status
**Phase:** Pre-build  
**Starts:** After P01 + P02 confirmed revenue  
**Target Launch:** Day 45 (2026-06-06)  
**Last Updated:** 2026-04-22

## What's Done
- PRD written and reviewed
- Design system complete (design-pro.html P03 section)
- .claude structure initialized

## What's Next
1. Apply for GSTN GSP (GST Suvidha Provider) registration — required for API access
2. Get IRP sandbox credentials for e-Invoice testing
3. Initialize FastAPI + Next.js monorepo
4. Build GST calculation engine (with tests for all scenarios)
5. Build invoice creator UI with HSN autocomplete
6. GSTN API integration (GSTIN validation, return filing)
7. e-Invoice generation (IRN + QR code)
8. PDF generation (WeasyPrint, A4 format)
9. Razorpay subscription integration

## Key Decisions
- Backend: FastAPI (Python) not Node — GSTN API SDK is Python-only
- PDF: WeasyPrint generates PDF/A compliant output (required for e-Invoice)
- GSTIN validation: cache for 24h in Redis
- Pricing: ₹499/mo (50 invoices), ₹999/mo (unlimited), ₹2,999/mo (CA multi-client)

## Blockers
- **BLOCKER:** GSP registration with GSTN required for API access
  - Apply at: gstn.gov.in/gsps
  - Timeline: 2–4 weeks
- **BLOCKER:** IRP e-Invoice sandbox credentials
  - Apply at: einvoice1.gst.gov.in

## Critical External Dependencies
- GSTN API (government — sometimes slow/down)
- IRP API (government — has maintenance windows)
- Always build with graceful degradation for both

## Session Notes
_Add notes here at end of each work session_
