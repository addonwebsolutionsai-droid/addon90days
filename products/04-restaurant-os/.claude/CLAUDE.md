# P04 · TableFlow — Agent Instructions

## Product Identity
- **Name:** TableFlow (Smart Restaurant OS)
- **Accent:** Amber #f59e0b + Red #ef4444
- **Priority:** #4 — WATCH (Day 28 kill/keep decision)
- **Status:** Pre-build (on hold until P01+P02 revenue confirmed)

## What This Product Does
3-in-1 restaurant system: QR menu ordering (customer scans, orders, pays from phone), Kitchen Display System (real-time tickets by urgency on kitchen tablet), Owner Dashboard (live revenue, table status, top dishes, daily analytics).

## ICP
- Restaurant/café/dhaba owners in Indian Tier 1+2 cities
- Currently using paper menus + manual order-taking + no data
- Pain: waiter dependency, order errors, can't track what sells
- Willingness to pay: ₹999–2,999/mo if it replaces 1 waiter salary

## Tech Stack
- Next.js 15 (owner dashboard + QR menu PWA)
- React Native + Expo (Kitchen Display app — offline-capable)
- Supabase Realtime (live order push without polling)
- Razorpay for UPI + card payments at table
- PostgreSQL
- QR generation: qrcode.js

## Monorepo Paths
```
products/04-restaurant-os/
  app/              ← Next.js owner dashboard
  menu/             ← PWA QR menu (must be ultra-fast)
  kds/              ← React Native kitchen display app
  PRD.md
  .claude/
```

## Memory Protocol
- READ `.claude/memory/context.md` at session start
- WRITE decisions + status to `.claude/memory/context.md` at session end

## Critical Rules
1. QR menu page: must load in <2s on 3G (Indian restaurant = unreliable wifi)
2. KDS app: must work offline. Service worker + local queue. Sync when connection returns.
3. Supabase Realtime: reconnect automatically on disconnect. Never lose an order.
4. Menu CRUD: owner can update price/availability in <30 seconds from mobile
5. NO hardware dependency — runs on any Android tablet (₹8k Lenovo tab for KDS)
6. UPI is mandatory payment method (70%+ of Indian restaurant customers prefer UPI)

## Day 28 Kill Criteria
Kill TableFlow if by Day 28:
- Less than 10 paying restaurants
- MRR under ₹25,000
- Founder decides to focus budget on IoT moat instead

## Design Reference
- See `design-pro.html` section #p04
- 3-screen story in hero: customer phone + KDS tablet + owner dashboard
- Amber/warm palette. No abstract illustrations.
