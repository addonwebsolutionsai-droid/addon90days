# PRD: Smart Restaurant OS (P04)

**Product ID:** 04-restaurant-os
**Working name:** TableFlow
**Owner agent:** @api-engineer (backend + integrations), @frontend-architect (dashboard + kitchen display + mobile)
**Pillar:** SaaS micro-product
**Pricing target:** ₹1,999–₹9,999/mo + ₹5,000 one-time setup
**Status:** Build starts Week 6. Phase 1 target: 10 weeks to public beta.

**Validation scores:** Feasibility 85% | Market Viability 88% | Viral Potential 78% | Revenue Machine 82%

---

## 1. Problem

India has 7.5 million restaurants — dhabas, cafes, cloud kitchens, QSRs, family restaurants, fine dining. The overwhelming majority operate like it is 1990.

**The operational reality in a typical Indian restaurant today:**

- **Paper KOTs (Kitchen Order Tickets):** Waiter writes an order on a notepad, tears the sheet, walks to the kitchen, pins it to a board. When the kitchen is busy, slips get lost, priorities get confused, and the customer waits 40 minutes for a table order that should have taken 15. Wrong dishes get sent out because the waiter's handwriting is unclear.
- **Manual billing:** Waiter collects all paper KOTs for a table, adds them up on a calculator or in their head, writes a bill. Mistakes are common. Disputes happen. Discounts are applied inconsistently. No GST itemization unless the restaurant is sophisticated enough to do it.
- **No inventory tracking:** The owner has no idea how much stock is being used per dish. Pilferage is rampant — ingredients "disappear." Month-end the owner counts physical stock and finds ₹30,000 worth of items unaccounted for.
- **WhatsApp for takeaway chaos:** Customer messages the restaurant on WhatsApp, waiter or owner reads it at some point (maybe 20 minutes later), manually takes the order into the kitchen, forgets to give an ETA. Order gets missed during peak hours.
- **Zero daily P&L:** Owner has no idea if today was profitable until month-end, when the accountant produces numbers that are already stale.
- **Staff accountability is absent:** No record of which waiter took which table, how many covers a day, tip tracking.

**Existing solutions and why they fail:**

- **Petpooja / Posist:** These are genuine POS systems but cost ₹15,000–₹25,000/year, require a Windows PC or a specific Android tablet for setup, need 2-3 hours of staff training, and their UX is designed for accountants not waiters. No QR ordering, no WhatsApp integration, no real-time kitchen display that works without hardware investment.
- **Zomato/Swiggy for takeaway:** Platform fees of 18–30% eat restaurant margin. Owner loses the customer relationship. No direct ordering option exists unless you build a custom app (₹2–5 lakh one-time).
- **Spreadsheets:** Some owners track revenue in Excel. Still no real-time inventory, no kitchen coordination, no ordering.
- **Building custom:** ₹5–15 lakh for a custom POS with app, 4–6 month timeline, ongoing maintenance cost, single point of failure (one developer knows the code).

**The buyer: restaurant owner aged 25–55**, running 1–5 outlets, 5–30 staff, revenue ₹15 lakh – ₹5 crore/year. They have a smartphone and a cheap Android tablet somewhere in the restaurant. They desperately want to stop the revenue leakage but don't trust expensive or complex software after being burned before.

**Specific pain points ranked by frequency:**
1. Wrong orders from paper KOTs causing food waste and customer complaints — daily.
2. Billing mistakes and disputes — weekly.
3. Not knowing end-of-day revenue until next morning — daily.
4. Missing takeaway orders during peak hours — weekly.
5. Inventory pilferage with no visibility — ongoing.
6. Staff disputes about tips and covers — weekly.

## 2. Solution

TableFlow is a complete restaurant operating system that replaces paper KOTs, manual billing, WhatsApp order chaos, and spreadsheet inventory tracking with a single mobile-first platform — built for the way Indian restaurants actually work.

### Core product modules

**QR Code Menu & Ordering (dine-in)**
- Restaurant creates their digital menu: categories, items, descriptions, photos, prices, variants (size, spice level), add-ons (extra cheese, extra sauce), dietary tags (veg/non-veg/jain/gluten-free).
- Each table gets a printed QR code (TableFlow generates a printable PDF — A4 or table tent format).
- Customer scans QR → opens mobile web page (no app download required) → browses menu → adds items to cart → places order.
- Order goes directly to: kitchen display system (KDS) + waiter's device simultaneously.
- Customer can add more items to the same table session (multiple rounds) — all tracked on one bill.
- Special instructions per item ("no onion", "extra spicy") captured in free text.

**Kitchen Display System (KDS)**
- A web app (runs on any Android tablet or cheap laptop in the kitchen — no proprietary hardware required).
- Shows incoming orders as cards: table number, items, special instructions, time since order placed.
- Chef taps item to mark as "cooking" → card turns yellow. Taps again to mark "ready" → card turns green → waiter gets notification on their device.
- Priority system: orders waiting >15 minutes automatically highlight in red.
- Multi-station support: one tablet shows only "grill station" items, another shows "cold station" items. Station routing configured per menu category.
- Order modification from KDS: if an item is unavailable, chef marks it → customer and waiter are notified via the app/notification.
- Average order fulfillment time tracked per dish and per station — surfaces in owner analytics.

**Smart Billing & POS**
- Waiter opens table → all ordered items auto-populated in the bill.
- One-tap: apply table discount, apply item-level discount, apply coupon code.
- GST auto-calculation: CGST + SGST (or IGST for takeaway across state). Rate configured per menu item category (5%, 12%, 18% based on item type and whether AC/non-AC).
- GST-compliant receipt generation: restaurant name, GSTIN, address, HSN/SAC codes, CGST/SGST breakdown, total. Printed via Bluetooth thermal printer (Sunmi, Epson supported) or sent to customer via WhatsApp.
- Payment modes: cash, UPI (QR displayed on screen), card (manual entry of last 4 digits for record), Swiggy/Zomato (mark as platform order, platform fee recorded), credit (mark customer as outstanding).
- Split bill: split by number of people or by individual item selection.
- Hold bill: table needs to wait, bill is saved, continue later.
- Void/cancel item (with manager PIN authorization — creates audit trail).
- Day-end summary: total revenue by payment mode, total bills, average bill value, top-selling items, GST collected.

**WhatsApp Takeaway Order Intake**
- Restaurant's WhatsApp Business number connected to TableFlow via WhatsApp Business API (same 360dialog integration as P8 ChatBase — shared infra, cheaper for us).
- Customer texts the restaurant WhatsApp: "1 butter chicken, 2 naan, deliver to [address]".
- AI (Claude Haiku) parses the order: extracts items, quantities, delivery/pickup, address if delivery.
- Sends structured order summary back to customer for confirmation: "Your order: 1 Butter Chicken (₹280), 2 Naan (₹60). Total: ₹340 + delivery. Confirm? Reply YES."
- Customer replies YES → order appears in KDS + front-of-house app.
- Bot asks for: payment mode preference (UPI link sent via Razorpay, or cash on delivery).
- Sends ETA based on current kitchen queue length (configurable: "Current wait time: ~25 minutes").
- Order status updates sent proactively: "Your order is being prepared", "Your order is out for delivery."

**Inventory Management**
- Menu item → recipe mapping: each dish has a list of raw ingredients with quantities (e.g., "Paneer Tikka" = 150g paneer + 20g onion + 10g capsicum + 5g spices).
- Every order placed → system deducts ingredients from current stock.
- Raw ingredient stock: owner or kitchen manager updates opening stock and purchases (supplier name, quantity, price, date).
- Low stock alerts: when ingredient drops below configured threshold → push notification to owner + manager.
- Waste logging: staff can log wastage with reason (spoiled, overcooked, training) — tracked separately from sales consumption.
- End-of-day inventory summary: theoretical stock (opening + purchases - consumption - waste) vs. actual stock (physical count entered by manager). Variance = potential pilferage flagged.
- Supplier management: contact details, items they supply, rate history.

**Table Management**
- Floor plan builder: owner configures their tables — number, capacity, section (indoor, outdoor, rooftop). Drag-and-drop on web dashboard.
- Live table status on waiter app: available (green), occupied (red with time since seated + cover count), reserved (purple), bill requested (yellow).
- Cover count per table per session: tracked for analytics.
- Reservation management: take table reservations with name, phone, party size, time, special notes. Sends WhatsApp confirmation automatically. Reminder 1 hour before.
- Walk-in queue management: when all tables full, add to waitlist, notify via WhatsApp when table is available.

**Staff Management**
- Staff directory: name, role (owner, manager, waiter, chef, cashier), phone, active/inactive.
- Role-based access: each role sees only what they need.
- Shift management: mark who is on shift today.
- Per-staff performance: orders taken, tables served, average bill value, tip collected (if tracked).
- Tip distribution: record tips per table session, distribute to waiter.

**Daily P&L Dashboard**
- Revenue: total bills by dine-in, takeaway (direct), delivery (platform), WhatsApp orders.
- Cost: raw material cost (calculated from recipe × orders — if recipe mapping is done), staff cost (manual entry of daily wages), utility overheads (configurable daily estimate).
- Gross profit per day: revenue − raw material cost.
- Net profit estimate: gross profit − overhead.
- Best and worst-selling items: by quantity and by revenue contribution.
- Hourly revenue heatmap: identify peak hours.
- Weekly and monthly trend.

**Multi-outlet support**
- Owner with 2–5 outlets sees all outlets in one dashboard.
- Switch between outlets. Outlet-level vs. consolidated P&L.
- Central menu management: push menu updates to all outlets simultaneously.
- Staff can be assigned to specific outlets.

**Owner mobile app (React Native)**
- Dashboard: today's revenue, covers, orders, top item.
- Live order feed: see orders as they come in (dine-in + WhatsApp + platform).
- Push notifications: new WhatsApp order, low stock alert, bill dispute flagged.
- Staff attendance: who is on shift today.
- Quick actions: void a bill (with reason), apply emergency discount.

### What TableFlow is NOT (v1 scope exclusions)
- Online ordering website/app for customers (v2 — currently WhatsApp is sufficient for takeaway).
- Food delivery fleet management / delivery tracking app.
- Loyalty points program (v2).
- Advanced accounting / full Tally replacement (generates daily P&L, not balance sheets or ledgers).
- Franchise management (more than 5 outlets is enterprise, quote custom).
- Integration with Swiggy/Zomato order management dashboard (they have locked APIs — future roadmap).

## 3. Target customer (ICP)

**Primary ICP:**
- Type: Independent restaurant, cafe, cloud kitchen, QSR (quick service restaurant), dhaba with character.
- Size: 1–5 outlets, 5–30 staff.
- Revenue: ₹15 lakh – ₹5 crore/year.
- Location: Tier-1 and Tier-2 cities in India — Ahmedabad, Mumbai, Pune, Delhi, Bangalore, Hyderabad, Surat, Vadodara, Jaipur, Indore. Tier-3 to follow.
- Tech comfort: owner has smartphone, uses Swiggy/Zomato partner app, basic WhatsApp Business. Not technical. Want something that "just works" out of the box.
- Buying trigger: a specific operational pain (wrong order sent out, big inventory loss discovered, customer complained about slow billing, accountant can't reconcile month-end numbers).
- Decision cycle: 3–7 days. One decision maker (owner). Sometimes influenced by a tech-savvy family member or staff.

**Secondary ICP:**
- Cloud kitchens (Rebel Foods model, smaller): 2–10 kitchen outlets, high order volume via Swiggy/Zomato but also direct orders. Need: multi-outlet dashboard, WhatsApp order intake, recipe costing.
- Hotel F&B departments: small hotels (3-star category) with 1–2 dining venues. Need: table management, billing, staff management.
- Catering businesses: order-based rather than table-based, but billing + inventory apply.

**Anti-pattern (do not target):**
- Large chains with existing Oracle MICROS or NCR Aloha (enterprise POS) — switching cost too high, wrong budget bracket.
- Restaurants primarily operating via Swiggy/Zomato only with no dine-in — limited need for QR ordering and table management.

## 4. Business model & pricing

### Pricing tiers

| Tier | Price/mo (INR) | Outlets | Tables | Staff accounts | WhatsApp orders | Inventory | Setup fee |
|---|---|---|---|---|---|---|---|
| Starter | ₹1,999 | 1 | 20 | 5 | 500/mo | Basic (no recipe mapping) | ₹5,000 one-time |
| Growth | ₹4,999 | 3 | 60 | 20 | 2,000/mo | Full (recipe mapping + pilferage) | ₹5,000 one-time |
| Pro | ₹9,999 | 10 | Unlimited | Unlimited | 10,000/mo | Full + supplier management | ₹10,000 one-time |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Custom | Full | Custom |

**Annual billing:** 2 months free (effectively 17% discount).

**Add-ons:**
- Bluetooth thermal printer setup + support: ₹2,000 one-time.
- Kitchen display tablet (Android 10-inch): ₹8,000 one-time (we source, configure, ship — margin opportunity).
- Extra WhatsApp orders (Starter): ₹1 per conversation above 500.
- Staff training (on-site, Ahmedabad): ₹3,000 per session.

**Setup fee rationale:**
- We come on-site (Ahmedabad) or do a 2-hour video call (national) to: configure menu digitally, create QR codes, set up kitchen tablet, test end-to-end workflow with actual staff.
- This dramatically improves activation and reduces churn. Restaurants that are set up properly don't leave.
- ₹5,000 setup is cheap compared to the ₹15,000–₹25,000 setup cost of competitors.

**Revenue model math:**
- 100 Starter customers (₹1,999): ₹1.99L/mo
- 80 Growth customers (₹4,999): ₹3.99L/mo
- 20 Pro customers (₹9,999): ₹1.99L/mo
- **Total at 200 customers: ₹7.97L/mo (~$9.5K MRR)**
- Plus setup fees: 200 × ₹5,000 = ₹10L one-time revenue in first 90 days.
- Day 90 target: 150 paying restaurants → ₹5–6L MRR.

**Why restaurants don't churn:**
- Menu is configured in the system.
- Staff are trained on the workflow.
- Historical data (P&L, inventory, order history) is in the system.
- Switching means retraining staff on a new system — painful.
- Churn expected: <4%/month (lower than SaaS average because operational dependency is deep).

## 5. Build plan

### Phase 1 — Core POS (Weeks 1–4)

**Week 1: Foundation**
- Monorepo setup under `/products/04-restaurant-os/`.
- Fastify backend, TypeScript strict, Supabase PostgreSQL (multi-tenant via `organization_id` on all tables).
- Prisma schema: `Organization`, `Outlet`, `Table`, `MenuCategory`, `MenuItem`, `MenuItemVariant`, `MenuItemAddon`, `Order`, `OrderItem`, `Bill`, `BillPayment`, `Staff`, `Shift`.
- Clerk auth with roles: owner, manager, waiter, chef, cashier.
- Menu CRUD API: categories, items, variants, add-ons.
- QR code generation: per table, unique URL encodes outlet ID + table ID. QR as SVG + printable PDF (using `qrcode` library + `pdfkit`).

**Week 2: Customer ordering + KDS**
- Customer-facing menu page (Next.js, mobile-optimized): load menu by outlet/table ID from QR URL. Cart state in localStorage. Place order → POST to API.
- KDS web app (Next.js): real-time order display via Supabase Realtime WebSocket. Order card: table number, items, time since placed, special instructions. Mark items ready. Station filtering.
- Waiter notification: when KDS marks item ready, push notification to waiter's device (Expo Notifications if using the app; SMS via Twilio as fallback).
- Order state machine: `PLACED → ACKNOWLEDGED → COOKING → READY → SERVED → BILLED`.

**Week 3: Billing + payments**
- Bill generation from order items. GST calculation (CGST/SGST per item category rate). Discount application.
- Bill PDF generation (pdfkit): GST-compliant format with restaurant GSTIN, address, itemized list with HSN codes.
- Bluetooth thermal printer support: `react-native-thermal-receipt-printer-image-qr` for React Native app. Web printing via browser print dialog as fallback.
- Payment recording: cash, UPI, card, credit. Razorpay UPI QR integration (generate dynamic QR per bill → Razorpay webhook on payment → auto-mark bill paid).
- Day-end summary generation and display.

**Week 4: Staff + table management**
- Floor plan builder (drag-and-drop on web dashboard using `react-dnd`). Save table positions.
- Live table status dashboard: Supabase Realtime updates on table state changes.
- Reservation system: form + WhatsApp confirmation (basic — bot sends confirmation message). Calendar view.
- Staff directory + roles + shift management.
- Role-based access enforcement in middleware.

### Phase 2 — WhatsApp + Inventory (Weeks 5–7)

**Week 5: WhatsApp order intake**
- 360dialog integration (reuse pattern from P8 ChatBase — shared library in `/packages/whatsapp-api/`).
- Claude Haiku for order parsing: "1 butter chicken, 2 naan" → structured JSON `{items: [{name: "Butter Chicken", qty: 1}, {name: "Naan", qty: 2}]}`.
- Item matching: fuzzy match parsed item names to actual menu items (using `fuse.js` for fuzzy string matching).
- Ambiguity resolution: if item not found → bot replies "We have Butter Chicken (₹280) and Chicken Butter Masala (₹320). Which one?" → waits for reply.
- Order confirmation flow → payment link if UPI selected → order to KDS on payment confirmation.
- ETA calculation: configurable average prep time per order, adjusts for current kitchen queue depth.

**Week 6: Inventory — basic**
- Raw ingredient master: name, unit (kg, litre, piece, portion), current stock, minimum stock threshold.
- Stock purchase entry: supplier, date, ingredients purchased with quantity and price.
- Recipe mapping: for each menu item, define ingredients and quantities consumed per serving.
- Auto-deduction on order: when an order item is marked "served" (or "billed"), deduct recipe ingredients from stock.
- Low stock alert: background job checks stock levels every 30 minutes, sends push notification when below threshold.

**Week 7: Inventory — advanced + P&L**
- Waste logging: staff logs wastage with quantity, reason, staff name.
- Day-end stock count: system shows theoretical stock → manager enters physical count → variance highlighted (potential pilferage flagged in red if variance >5%).
- Supplier management: contact, items, rate history.
- P&L dashboard: revenue (from billing) + raw material cost (from recipe × sales) + overhead (manual daily entry). Daily/weekly/monthly views. Charts (Recharts).
- Food cost % per dish: recipe cost / selling price. Highlights high-cost items that may need repricing.

### Phase 3 — Mobile app + polish (Weeks 8–10)

**Week 8: React Native owner app**
- Dashboard: today's revenue, covers, top items, active orders.
- Live order feed: all orders across outlets in real-time.
- Push notifications: new WhatsApp order, low stock, bill dispute.
- Quick report: yesterday's P&L, week summary.

**Week 9: Multi-outlet + enterprise features**
- Consolidated multi-outlet dashboard.
- Central menu management: push changes from one source to multiple outlets.
- Cross-outlet reporting.
- Staff management across outlets.

**Week 10: Beta launch prep**
- On-site testing with 5 restaurants in Ahmedabad (owner personally accompanies for setup).
- Load testing: simulate 50 simultaneous table orders, verify KDS performance.
- Thermal printer compatibility testing (Sunmi T2 mini, Epson TM-T20III).
- Fix all bugs discovered in beta.
- Marketing site live. Pricing page. Demo video.

## 6. Success metrics

### Day 30
- Core POS (QR ordering + KDS + billing) live and tested.
- 5 restaurants in private beta in Ahmedabad.
- Zero order loss incidents (every order placed by customer reaches kitchen).
- Average time from order placement to KDS display: <3 seconds.
- Billing accuracy: 100% (mathematical errors are unacceptable — automated tests on GST calculations).

### Day 60
- 40 paying restaurants.
- ₹1.5–2.5L MRR.
- Churn: <5%/month.
- WhatsApp order intake live for 20+ restaurants.
- Average setup-to-live time: <2 hours.
- Owner NPS: >45 ("do you regret removing paper KOTs?").
- Inventory module activated by >50% of Growth+ customers.

### Day 90
- 150 paying restaurants.
- ₹5–6L MRR (~$6–7K).
- Setup fee revenue: ₹5–7L one-time collected.
- Churn: <4%/month.
- 3+ cloud kitchen chains (multi-outlet) on Pro plan.
- "Powered by TableFlow" QR scanned: >5,000 times/day across all restaurants (leads generated).
- Expansion to second city (Surat or Mumbai) with first 10 restaurants each.

## 7. Risks & mitigations

**Risk 1: Restaurants don't switch because staff resists change**
- Root cause: Waiters have been using paper KOTs for years. A new system means learning something, and they fear accountability that didn't exist before.
- **Mitigation:** UX designed for zero learning curve. Waiter view = one screen with one button per table. We run a mandatory 1-hour staff training during setup (included in setup fee). Onboarding checklist covers every role. Provide a printed quick-reference card for each role. Owner sees immediate benefit (less disputes, faster billing) and drives staff adoption.

**Risk 2: Internet connectivity in restaurant kitchen/floors**
- Indian restaurants, especially older buildings, have inconsistent WiFi coverage. Kitchen tablet may drop offline.
- **Mitigation:** KDS web app caches orders in Service Worker (offline-first using Workbox). Orders received while offline are stored locally and synced when connection resumes. Visual indicator on KDS: green = online, red = offline but data cached. Critical flows (order placement, bill printing) tested extensively on throttled 3G.

**Risk 3: Menu is complex (hundreds of items, multiple variants)**
- A restaurant with 200 items across 15 categories takes significant time to set up. Owner won't do it themselves.
- **Mitigation:** Setup concierge (included in setup fee) — we do the menu entry for them during onboarding. For restaurants with an existing WhatsApp menu card or PDF menu, we use Claude Vision to extract items and pre-populate the database. Owner just verifies and corrects.

**Risk 4: GST compliance mistakes**
- Billing mistakes that violate GST rules (wrong CGST/SGST split, wrong HSN codes) create legal risk for the restaurant and for us.
- **Mitigation:** Build GST logic as a separate, fully tested library (`/packages/gst-calculator/`). All calculations covered by unit tests (100+ test cases). Restaurant's CA reviews generated GST receipts during beta. Add a disclaimer: "Verify GST codes with your CA." Support for the common F&B HSN/SAC codes pre-loaded.

**Risk 5: WhatsApp API dependency**
- Same as P8 ChatBase: Meta's WhatsApp Business API has approval delays and policy risks.
- **Mitigation:** WhatsApp intake is an enhancement, not the core product. Core (QR ordering + KDS + billing) works 100% without WhatsApp. WhatsApp is phase 2 — restaurants launch first without it and add it later.

**Risk 6: Hardware dependency (thermal printer, kitchen tablet)**
- If the thermal printer stops working, billing is disrupted.
- **Mitigation:** Bill printing is never blocking. Digital bill (WhatsApp/SMS) is always available. If Bluetooth printer fails, bill displays on screen and customer scans or is emailed. Recommend only tested printer models. Provide setup support.

**Risk 7: Competition from Petpooja adding AI features**
- Petpooja has 50,000+ restaurant customers. They could add QR ordering and AI.
- **Mitigation:** We win on price (₹1,999/mo vs. their ₹15,000+/yr), ease of setup (2 hours vs. their full-day implementation), and mobile-first design. They're building for desktop-first POS terminals; we're building for a world where everyone has a smartphone. By the time they add our features, we'll have 3–5 months head start and deep customer relationships in our segments.

## 8. Tech stack (product-specific)

**Backend:**
- Node.js 20 LTS, Fastify v4, TypeScript strict.
- ORM: Prisma with PostgreSQL via Supabase (Mumbai region for India customers).
- Auth: Clerk (multi-role: owner, manager, waiter, chef, cashier — Clerk organizations + custom roles in metadata).
- Queue: BullMQ + Upstash Redis (order processing, notifications, scheduled inventory checks).
- Real-time: Supabase Realtime (WebSocket pub/sub for KDS order updates and table status).
- WhatsApp: 360dialog API (shared pattern from P8).
- AI: Claude Haiku (WhatsApp order parsing), Claude Sonnet (menu suggestion from uploaded PDF — onboarding feature).
- Payments: Razorpay (dynamic UPI QR per bill, payment links for WhatsApp orders).
- SMS fallback: Twilio (for order confirmation when WhatsApp not connected).
- PDF generation: pdfkit (bills, daily reports, QR code sheets).
- QR codes: `qrcode` npm library.
- Fuzzy matching: `fuse.js` (menu item matching from WhatsApp orders).
- Observability: Sentry + Axiom.

**Frontend — customer menu page (QR scan):**
- Next.js 15 App Router, TypeScript, Tailwind CSS.
- Mobile-first, no login required, loads in <1s on 4G.
- Cart state: localStorage + server-side session (Redis) for consistency.
- No app download — pure PWA experience.

**Frontend — staff/management dashboard (web):**
- Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui.
- KDS page: Supabase Realtime subscription → live order cards.
- Floor plan: `react-dnd` for drag-and-drop table layout.
- Charts: Recharts (P&L, sales trends, inventory).
- Bluetooth printing: Web Bluetooth API (Chrome/Android) + fallback to browser print dialog.

**Mobile app (owner):**
- React Native + Expo SDK 51, TypeScript strict.
- Push notifications: Expo Notifications + FCM.
- State: Zustand + React Query.
- Offline support: React Query persistence with AsyncStorage for dashboard data.

**Infrastructure:**
- Backend API: Railway (autoscale, always-on).
- Next.js: Vercel.
- Redis: Upstash.
- Storage: Cloudflare R2 (menu images, bill PDFs).

## 9. Go-to-market strategy

**Month 1 — Ahmedabad deep penetration**

*Channel 1: Founder-led direct sales*
- Target: 30 restaurants in Ahmedabad within walking distance of each other (Navrangpura, CG Road, Vastrapur, Prahlad Nagar — high concentration of cafes and restaurants).
- Walk in, ask to speak to owner, do a live demo on their phone (5-minute demo: scan QR → order → see it on kitchen tablet → generate GST bill). Demo is so visual and immediate that most owners see the value instantly.
- Offer: free 30 days + we set it up for you (bring a tablet, install KDS, configure their menu). After 30 days, ₹1,999/mo or walk away.
- Convert 15+ to paid in the first month.

*Channel 2: Restaurant owner WhatsApp groups*
- Join restaurant owner groups in Ahmedabad, Surat, Vadodara (NRAI Gujarat chapter groups, local food business groups).
- Share a 60-second video: "how this cafe reduced wrong orders by 80% in 1 week."
- Let the demo speak. Don't hard-sell.

*Channel 3: Restaurant industry events*
- NRAI (National Restaurant Association of India) Gujarat chapter events.
- Local food business expos (AMA Ahmedabad events, food festivals where restaurant owners meet).
- Set up a demo booth. Live demo on a phone. Collect business cards.

**Month 2 — Digital scale**

*Channel 4: Instagram + YouTube content*
- Target audience: restaurant owners who scroll Instagram for business ideas.
- Content: "How I eliminated paper KOTs in my restaurant", "Before/after: 45-minute billing vs. 2-minute billing", "How I caught ₹40,000 in ingredient pilferage using an app."
- Authentic. Founder or early adopter tells the story.

*Channel 5: Google Ads*
- Keywords: "restaurant billing software india", "KOT software restaurant", "restaurant management app india", "cloud POS india", "restaurant inventory management".
- Industry-specific landing pages (cafe landing page, dhaba landing page, cloud kitchen landing page).
- Budget: ₹40,000/mo.

*Channel 6: Restaurant consultant partnerships*
- Restaurant consultants (people who help new restaurants set up) are trusted by their clients.
- 10 consultants in India with large Instagram/YouTube followings.
- Revenue share: consultant earns 15% recurring commission on all clients they refer.
- One consultant with 500 restaurant followers = 50+ potential leads.

**Month 3 — City expansion**

- Expand to Surat and Mumbai with 1 local sales partner in each city (commission-based, no salary).
- Sales partner demo kit: demo tablet pre-configured with TableFlow, printed case study cards, business cards.
- Target 25 restaurants in each new city in first 30 days of expansion.

**Viral loop mechanics:**
- Every customer who scans the QR code menu sees "Powered by TableFlow" as a footer on the menu page.
- Restaurant owners eat at each other's restaurants. They see the QR menu and ask: "how is this working for you?"
- Word of mouth in the restaurant community is extremely strong — owners trust other owners more than any ad.

**Pricing psychology:**
- Lead with ₹1,999/mo (comparable to Petpooja's monthly cost but far more features and no desktop requirement).
- Setup fee: positioned as "we come and set it up for you" — reduces friction, not an obstacle.
- Comparison: "Petpooja costs ₹15,000/year with no AI, no QR ordering, no WhatsApp. TableFlow starts at ₹23,988/year and we set it up for free with the annual plan."
- Annual plan pitch: ₹1,999/mo × 10 months (2 free) = ₹19,990/year — compare to ₹15,000/year Petpooja with far fewer features.

## 10. Competitive landscape

| Competitor | Price/year | QR ordering | KDS | WhatsApp orders | Inventory | AI features | Our advantage |
|---|---|---|---|---|---|---|---|
| Petpooja | ₹12,000–₹25,000 | No | Add-on (expensive) | No | Yes | No | QR ordering, WhatsApp, AI, mobile-first, lower entry price |
| Posist | ₹20,000–₹60,000 | Yes | Yes | No | Yes | No | Price, simplicity, no hardware lock-in |
| UrbanPiper | Integration layer (₹10,000+) | No | Yes | No | No | No | Full OS vs. just aggregator integration |
| eZee BurrP | ₹12,000–₹20,000 | No | Add-on | No | Yes | No | QR ordering, WhatsApp, AI, simpler UX |
| Lightspeed | $69–$399/mo USD | Yes | Yes | No | Yes | Basic | India pricing, Indian GST, WhatsApp, Razorpay |
| Custom POS (agency) | ₹2–5L one-time | Varies | Varies | Rarely | Varies | No | Monthly SaaS, no upfront, always updated |
| Paper + WhatsApp | ₹0 | No | No | Manual | No | No | Direct cost comparison: savings from reduced errors and pilferage pay for subscription |

**Our specific technical advantages over all competitors:**
1. **No proprietary hardware requirement:** any Android tablet becomes a KDS. Any smartphone becomes a POS. Competitors sell or require specific hardware.
2. **WhatsApp-native takeaway:** zero competitors offer AI-powered WhatsApp order intake out of the box.
3. **GST-compliant billing built for India:** not an afterthought or add-on.
4. **Recipe-level inventory deduction:** most cheap POS systems track stock at SKU level, not ingredient level. Our recipe mapping is genuinely useful for controlling food costs.
5. **Setup concierge included:** we actually come and set it up. Competitors send you a link and a YouTube tutorial.
