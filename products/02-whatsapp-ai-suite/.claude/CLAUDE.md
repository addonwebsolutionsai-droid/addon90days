# P02 · ChatBase — Agent Instructions

## Product Identity
- **Name:** ChatBase (WhatsApp AI Business Suite)
- **Accent:** Green #22c55e + Cyan #06b6d4
- **Priority:** #2
- **Status:** Pre-build (starts after P01 Day 15 launch)

## What This Product Does
AI agent on WhatsApp Business: handles customer queries, quotes, orders, invoices, follow-ups — 24/7 without human involvement. Owner sees all conversations, orders, and revenue in a clean dashboard. Not WhatsApp Web — a real business OS.

## ICP
- Indian SMB owners (traders, wholesalers, small manufacturers, retailers)
- Already using WhatsApp for business (100% of Indian SMB market does)
- Currently losing orders because they can't respond fast enough after hours
- Revenue ₹50L–5Cr/year. Can't afford a sales rep.

## Tech Stack
- Next.js 15 (owner dashboard)
- Fastify (API + webhook handler)
- WhatsApp Business Cloud API (Meta — direct, not Twilio)
- Claude Haiku 4.5 for fast response (sub-1s target)
- Claude Sonnet 4.6 for complex queries (negotiation, complaints)
- PostgreSQL + Supabase
- Razorpay for Indian payments (INR pricing)
- Redis for conversation state cache

## Monorepo Paths
```
products/02-whatsapp-ai-suite/
  app/                    ← Next.js owner dashboard
  api/                    ← Fastify webhook + AI handler
  PRD.md
  .claude/
```

## Memory Protocol
- READ `.claude/memory/context.md` at session start
- WRITE decisions + status to `.claude/memory/context.md` at session end

## Critical Technical Rules
1. WhatsApp webhook MUST respond HTTP 200 within 15 seconds — use async job queue
2. Claude response length ≤ 1600 chars (WhatsApp single-bubble limit)
3. All conversation messages stored encrypted at rest (AES-256)
4. AI escalation: confidence < 70% → route to human review queue immediately
5. Never expose internal IDs, system info, or error traces to WhatsApp users
6. Rate limiting: max 80 messages/second per phone number (Meta limit)
7. Invoice generation: shared engine with TaxPilot (P03) — same GST logic

## Zero-Click Design Rules
- Routine messages: AI handles, 0 owner clicks needed
- Order detected: AI creates draft → owner confirms in 1 click
- Invoice request: AI generates → owner sends in 1 click
- Escalation: notification with 1-click "Take over" button

## Intent System
All messages classified into intents before AI responds:
- price-inquiry → product catalog lookup → respond with price
- order-placement → create order draft → owner confirm
- invoice-request → generate invoice → auto-send
- payment-status → lookup payment → respond
- complaint → escalate to human immediately
- unknown → AI responds with clarification request

## Design Reference
- See `design-pro.html` section #p02
- WhatsApp green branding. ₹ pricing throughout. Chat mockup in hero.
- Dashboard: conversation-first list. AI/human/review status badges.
