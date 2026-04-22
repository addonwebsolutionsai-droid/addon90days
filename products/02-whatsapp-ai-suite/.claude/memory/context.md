# P02 · ChatBase — Session Context

## Current Status
**Phase:** Pre-build  
**Starts:** After P01 launches (Day 15)  
**Target Launch:** Day 30 (2026-05-22)  
**Last Updated:** 2026-04-22

## What's Done
- PRD written and reviewed
- Design system complete (design-pro.html P02 section)
- .claude structure initialized

## What's Next
1. Apply for WhatsApp Business API access (Meta Business verification)
2. Initialize Fastify API + Next.js dashboard monorepo
3. Build WhatsApp webhook handler
4. Implement intent classification (Claude Haiku)
5. Build conversation storage (PostgreSQL schema)
6. Build owner dashboard UI
7. Razorpay subscription integration
8. Beta test with 5 real Indian SMB owners

## Key Decisions
- WhatsApp API: Meta Cloud API (direct) — cheaper than Twilio
- AI: Haiku for speed (sub-1s), Sonnet for complex cases
- Escalation threshold: 70% confidence
- Message retention: 90 days default, 1 year on paid plans
- Pricing: ₹999/mo Starter, ₹2,499/mo Growth, Enterprise custom

## Blockers
- **BLOCKER:** Need Meta Business Manager verification for WhatsApp API
  - Action: Apply at business.facebook.com with company docs
  - Timeline: 3–7 business days approval

## Architecture
```
WhatsApp → Meta Webhook → Fastify → Job Queue (Bull) → Intent Classifier (Claude Haiku) → Response Generator → WhatsApp API
                                                       ↓ if confidence < 70%
                                                       Human Review Queue → Owner Dashboard
```

## Session Notes
_Add notes here at end of each work session_
