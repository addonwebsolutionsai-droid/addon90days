# PRD: WhatsApp AI Business Suite (P02)

**Product ID:** 02-whatsapp-ai-suite
**Working name:** ChatBase
**Owner agent:** @api-engineer (backend + WhatsApp API), @frontend-architect (dashboard + mobile)
**Pillar:** SaaS micro-product
**Pricing target:** ₹999–₹5,999/mo (India) | $49–$299/mo (international)
**Status:** Build starts Week 5. Phase 1 target: 8 weeks to public beta.

**Validation scores:** Feasibility 82% | Market Viability 92% | Viral Potential 88% | Revenue Machine 85%

---

## 1. Problem

Every Indian SMB — retail shop, clinic, salon, restaurant, coaching institute, real estate agent, logistics company — runs their customer communication on WhatsApp. Not because they chose it strategically. Because their customers are already there and nothing else works.

The reality inside a typical SMB owner's phone:

- **200–400 WhatsApp messages per day**, handled personally by the owner or a single designated employee.
- **Missed messages = missed sales.** A restaurant that doesn't reply to a takeaway order in 10 minutes loses it to Swiggy. A clinic that misses a "is the doctor available today?" message loses a patient to the competitor down the road.
- **Zero follow-up system.** A customer who showed interest three weeks ago is forgotten. There is no CRM, no reminder, no pipeline — just a growing unread count.
- **Manual payment reminders.** Sending "please clear your outstanding" messages one by one, every month, to 80 customers.
- **No order tracking.** Customer asks "where is my order?" — owner scrambles to check with the courier, replies 45 minutes later.
- **Staff handoff chaos.** If the owner is unavailable (traveling, sick, sleeping), no one else can handle WhatsApp with consistency or product knowledge.

Existing workarounds are broken:

- **WhatsApp Business app (free):** Quick replies and catalogs, nothing automated. Still 100% manual.
- **WATI / Zoko / Interakt:** These are bulk messaging tools and basic chatbot builders. They require technical knowledge to configure flows, don't have AI understanding of natural-language questions, can't handle complex queries like "do you have a red kurta in size M under ₹800?", and cost ₹3,000–₹15,000/month with limited intelligence.
- **Custom chatbot vendors:** ₹50,000–₹5,00,000 one-time, 3-month build timeline, and the bot becomes stale the moment prices/products change.

The buyer: SMB owner aged 28–52, 1–50 employees, WhatsApp-native, not technical, already spending 3–5 hours/day on WhatsApp manually. They want their phone to stop ringing at midnight. They will pay ₹2,000/month if the tool gives them their evenings back and doesn't lose sales.

**Specific pain points:**

1. Responding to repetitive questions: "What are your timings?", "Do you deliver?", "What's the price of X?"
2. Collecting order details: product, quantity, delivery address, preferred time — currently a back-and-forth 8-message exchange.
3. Sending payment links: manual process, often forgotten.
4. Booking appointments: back-and-forth availability checking.
5. Post-order updates: "your order is dispatched" messages sent manually one by one.
6. Follow-ups: leads who inquired but didn't convert — zero systematic follow-up.

## 2. Solution

ChatBase is a no-code platform that turns WhatsApp into an AI-powered business channel. The business owner connects their WhatsApp Business number, trains an AI agent on their data (products, prices, FAQs, policies, team info), and the agent handles customer conversations automatically — escalating to a human only when confidence is low or the customer explicitly requests it.

### Core product modules

**AI Agent Builder (no-code)**
- Knowledge base builder: owner types or uploads their product catalog, price list, FAQs, business hours, policies, return/refund policy, team info, location. Supports: plain text, PDF upload, Google Sheets URL, website URL (auto-scraped).
- AI trains on this data using Claude's context window + RAG over a Qdrant vector store.
- Agent personality settings: formal / friendly / local (auto-translates to Hinglish if customer writes in Hindi/Hinglish).
- Intent library: pre-built intents (greeting, pricing query, availability query, order placement, appointment booking, complaint, payment query) — owner maps these to actions.

**WhatsApp Business API Integration**
- Connect via 360dialog (primary) or Twilio Conversations (fallback).
- Verified Business account required (ChatBase guides owner through Facebook Business Manager verification — 3-step wizard inside the dashboard).
- One WhatsApp number per workspace. Multiple agents (bots) can run on that number in parallel — routed by intent.

**Automated conversation flows**

*Customer support bot:*
- Receives message → classifies intent using Claude → queries knowledge base → composes reply in same language as customer (Hindi, English, Hinglish, Gujarati supported at launch).
- Handles: pricing questions, product availability, business info, policy questions, troubleshooting (for service businesses).
- AI confidence score threshold (configurable, default 0.75): if below threshold, auto-route to human inbox with context summary.

*Order collection bot:*
- Detects purchase intent → starts guided flow to collect: product/service, quantity, delivery address, preferred time slot.
- Validates inputs (quantity is a number, address is not empty, time slot is within available window).
- Generates order summary → sends to customer for confirmation → creates order record in ChatBase dashboard.
- Sends Razorpay/Stripe payment link after order confirmation (configurable).
- On payment success (via webhook): sends confirmation message + estimated delivery time.

*Appointment booking bot:*
- Syncs with Google Calendar (read/write) via OAuth.
- Checks real-time availability for the requested service and practitioner.
- Offers 3 available slots → customer confirms → books calendar event → sends confirmation with location + reminder 2 hours before.
- Supports: multiple service types with different durations, multiple staff members, buffer time between appointments.
- Cancellation/rescheduling handled via WhatsApp reply ("cancel my appointment" → confirms → removes calendar event → sends cancellation confirmation).

*Payment reminder bot:*
- Owner uploads outstanding list (name, phone, amount, due date) as CSV or enters manually.
- Bot sends personalized reminder at configured intervals (3 days before due, on due date, 3 days after).
- Message: "Hi [Name], your outstanding of ₹[amount] for [description] is due on [date]. Pay here: [Razorpay link]". Fully customizable template.
- Tracks who paid (via webhook) and marks record complete.

*Follow-up sequence bot:*
- Triggered when a lead inquires but doesn't convert in X days (configurable: 2–30 days).
- Sends a follow-up sequence: Day 1 (soft check-in), Day 3 (share a testimonial or offer), Day 7 (last call message).
- All templates editable. Stops automatically on positive reply or conversion.

*Order status bot:*
- For businesses that have shipment tracking numbers: customer sends "where is my order?" → bot fetches tracking from Shiprocket / Delhivery API → replies with status.
- For businesses without courier integration: bot sends pre-configured "your order is being prepared, expected delivery [date]" message.

**Human handoff inbox**
- When AI confidence is low, customer types "human", or conversation needs manual intervention: routes to unified inbox inside ChatBase web/mobile app.
- Shows full conversation history, AI's classification, customer details.
- Agent (human) picks up and replies via the same interface — message appears as the business WhatsApp number.
- Can hand back to AI when issue is resolved ("resolve and return to bot").
- Typing indicators are suppressed during AI processing so customer sees natural delay.

**Multi-bot setup**
- One number, multiple specialized bots: support bot handles product questions, sales bot handles order collection, reminder bot handles outstanding — all configured to activate based on customer context and conversation state.
- Bot routing rules: keyword triggers, session state, customer tag (new vs. returning), time of day.

**Customer contact management (mini-CRM)**
- Every WhatsApp contact auto-added to contact database.
- Profile: name (extracted from WhatsApp), phone, conversation history, order history, tags (lead, customer, VIP, outstanding).
- Manual notes by owner/staff.
- Segments: "customers who ordered in last 30 days", "leads who never converted", "customers with outstanding balance".
- Bulk message campaigns to segments (broadcast — separate from bot conversations, requires opt-in compliance).

**Analytics dashboard**
- Messages received / auto-handled / escalated to human (daily/weekly/monthly).
- Automation rate: % of messages handled without human intervention.
- Bot-specific: intents triggered, average resolution time, escalation rate by intent type.
- Conversion funnel: inquiries → orders placed → payment collected.
- Revenue attributed: sum of orders collected and payments received via ChatBase.

**React Native mobile app (owner monitoring)**
- Human handoff inbox (push notification when conversation needs human).
- Dashboard summary: messages today, automation rate, new orders, pending appointments.
- Quick reply from mobile when human intervention needed.
- Contact lookup.
- Alert when bot confidence drops below threshold on multiple consecutive conversations (knowledge base may need update).

### What ChatBase is NOT

- Not a bulk SMS/WhatsApp broadcast platform (though campaigns are a feature, the core is conversational AI).
- Not a full CRM (no pipeline/stages/deals — keep it simple, integrate with HubSpot/Zoho for those who need it).
- Not a call center platform.
- Not a website chat widget (WhatsApp only for v1; web chat and Instagram DMs are v2).

## 3. Target customer (ICP)

**Primary ICP — Indian SMB owner:**
- Sector: retail (clothing, electronics, grocery), services (salon, clinic, coaching), restaurants (takeaway + delivery), real estate agents, travel agents, logistics/courier, e-commerce sellers (D2C brands on Instagram + WhatsApp).
- Business size: 1–50 employees.
- Revenue: ₹20 lakh – ₹10 crore/year.
- Geography: Tier-1 and Tier-2 cities in India — Ahmedabad, Mumbai, Delhi, Bangalore, Surat, Vadodara, Jaipur, Indore, Nagpur.
- Tech comfort: uses smartphone daily, manages Instagram/WhatsApp, not comfortable writing code or configuring complex software.
- Pain level: 7–9/10. This is a burning problem, not a nice-to-have.
- Decision cycle: 2–5 days. No committee. Owner decides.
- Buying trigger: saw a competitor using WhatsApp automation, or just missed a significant sale due to late reply.

**Secondary ICP — SE Asia, LATAM, Middle East:**
- Philippines, Indonesia, Brazil, Mexico, UAE, Saudi Arabia — all WhatsApp-heavy markets with similar SMB patterns.
- Same ICP profile, different language support needed (Phase 2: Bahasa, Spanish, Arabic).
- Entry via English dashboard + English/Spanish content marketing.

**ICP anti-pattern (do not target):**
- Large enterprises (needs Salesforce/enterprise CRM integration, procurement process).
- Businesses where WhatsApp is not the primary customer channel.
- Pure e-commerce on marketplaces (Flipkart/Amazon sellers — they can't use WhatsApp for order comms).

## 4. Business model & pricing

### Pricing tiers

| Tier | India (INR/mo) | International (USD/mo) | WhatsApp conversations/mo | Contacts | AI agent seats | Human agents |
|---|---|---|---|---|---|---|
| Starter | ₹999 | $49 | 1,000 | 500 | 1 | 1 |
| Growth | ₹2,999 | $149 | 5,000 | 5,000 | 3 | 3 |
| Pro | ₹5,999 | $299 | 20,000 | Unlimited | Unlimited | 10 |
| Enterprise | Custom | Custom | Custom | Unlimited | Unlimited | Unlimited |

**Annual billing:** 20% discount (2 months free).

**Usage-based overage:** ₹0.50 / $0.03 per conversation above plan limit (1 conversation = all messages in a 24-hour window with one contact, matching WhatsApp Business API billing model).

**Add-ons:**
- WhatsApp number verification concierge (we handle FB Business Manager setup): ₹2,999 one-time.
- Additional AI agent seat (Starter/Growth tiers): ₹499/mo per additional agent.
- Priority human support: ₹1,999/mo.

**What's included in Starter that justifies ₹999:**
- All bot types (support, order, appointment, reminders, follow-up).
- Google Calendar integration.
- Razorpay payment link sending.
- Human handoff inbox.
- Basic analytics.
- 1 WhatsApp number.

**Why people upgrade to Growth (₹2,999):**
- Volume (1,000 conversations/mo fills up in 2 weeks for an active business).
- 3 AI agent seats (multi-brand or multi-location businesses).
- 3 human agents (owner + 2 staff on the inbox).
- Advanced analytics with export.
- CRM segments + bulk campaigns.

**Why people upgrade to Pro (₹5,999):**
- 20,000 conversations/mo.
- Unlimited contacts.
- Unlimited bots.
- Shiprocket/Delhivery order tracking integration.
- API access (for custom integrations).
- White-label option for agencies (their logo on client-facing reports).

**Revenue model math:**
- 500 Starter customers (₹999): ₹4.99L/mo
- 300 Growth customers (₹2,999): ₹8.99L/mo
- 100 Pro customers (₹5,999): ₹5.99L/mo
- **Total at these numbers: ₹19.97L/mo (~$24K MRR)**
- Day 90 target: 200 paying customers → ~₹6–8L MRR (~$7–10K).

**Agency / reseller program (Phase 2):**
- Digital marketing agencies that manage SMB clients pay 30% less on plans → resell at full price → 30% margin.
- Volume discount for agencies managing 10+ client accounts.
- This becomes a force multiplier: one agency relationship = 10–50 paying end customers.

## 5. Build plan

### Phase 1 — Foundation (Weeks 1–3)

**Week 1: Core infrastructure**
- Monorepo setup under `/products/02-whatsapp-ai-suite/`.
- Node.js/Fastify backend with TypeScript strict. Database: PostgreSQL via Supabase. Auth: Clerk with organization support (one org per business).
- Prisma schema: `Organization`, `WhatsAppNumber`, `Contact`, `Conversation`, `Message`, `AIAgent`, `KnowledgeBase`, `Order`, `Appointment`, `OutstandingRecord`.
- WhatsApp Business API integration via 360dialog: webhook ingestion endpoint (verify signature), send message endpoint, message status webhook.
- Message queue: BullMQ + Redis. Every inbound message goes to a queue worker that handles: classification → AI response → send reply. Prevents blocking and handles rate limits gracefully.

**Week 2: AI agent core**
- Knowledge base ingestion pipeline: text input → chunk → embed (Claude embeddings or OpenAI text-embedding-3-small) → store in Qdrant.
- PDF upload → text extraction (pdf-parse) → chunk → embed.
- URL scraping (cheerio + playwright for JS-heavy sites) → extract text → embed.
- Google Sheets URL → fetch CSV → parse → embed.
- Retrieval: incoming message → embed query → Qdrant similarity search → top-5 chunks → Claude Haiku prompt for response generation.
- Confidence scoring: Claude returns confidence 0–1 as structured JSON alongside response. Below 0.75 → route to human inbox.
- Language detection (franc library) → system prompt instructs Claude to reply in detected language (Hindi, Hinglish, Gujarati, English).

**Week 3: Core bot flows**
- Support bot: intent classification → knowledge base retrieval → reply generation.
- Order collection bot: multi-turn conversation state machine. State stored in Redis per conversation session. Transitions: `INTENT_DETECTED → COLLECTING_PRODUCT → COLLECTING_QUANTITY → COLLECTING_ADDRESS → COLLECTING_TIME → CONFIRMING → CONFIRMED`.
- Appointment booking bot: Google Calendar OAuth, real-time availability check, slot selection, booking, confirmation.
- Human handoff inbox (web): list of escalated conversations, reply interface, resolve + return to bot.

### Phase 2 — Complete feature set (Weeks 4–6)

**Week 4: Payments + reminders**
- Razorpay integration: create payment link via API → send in WhatsApp message → webhook on payment success → mark order paid → send confirmation.
- Stripe integration (international): same flow via Stripe Payment Links.
- Payment reminder bot: CSV upload/manual entry of outstanding list → scheduling queue (BullMQ delayed jobs) → send reminders at configured intervals → track payment via webhook.
- Follow-up sequence bot: trigger on lead non-conversion after N days → sequence scheduler in BullMQ.

**Week 5: Order status + CRM + analytics**
- Shiprocket API integration: order tracking status pull → reply to "where is my order?" queries.
- Contact management: auto-create contacts on first WhatsApp message. Tags, notes, conversation history view.
- Segment builder: filter contacts by tags, last order date, outstanding balance, conversation count.
- Broadcast campaigns: send template message to a segment (WhatsApp Business API template — pre-approved by Meta, owner submits via ChatBase).
- Analytics dashboard (Next.js): messages, automation rate, conversion funnel, revenue attributed. Charts via Recharts.

**Week 6: Mobile app + polish**
- React Native (Expo) mobile app for owner: push notifications for human handoff, dashboard summary, inbox reply, contact lookup.
- Multi-bot routing rules UI: configure which bot activates based on trigger conditions.
- Onboarding flow: step-by-step wizard (connect WhatsApp number → upload knowledge base → test bot with sample messages → go live).
- Knowledge base update flow: "your bot couldn't answer 12 questions this week. Review and add answers." — shows actual unanswered questions.

### Phase 3 — Growth features (Weeks 7–8)

**Week 7: Agency mode + white-label**
- Agency dashboard: manage multiple client workspaces from one login.
- White-label: agency logo on client-facing reports/PDFs.
- Client reporting: automated weekly summary email (via Resend) to agency showing each client's automation stats.
- Reseller pricing tier + billing.

**Week 8: Beta launch**
- Private beta with 20 businesses (sourced via founder's network in Ahmedabad — salons, clinics, retail shops).
- Collect feedback, iterate.
- WhatsApp Business API rate limits testing under real load.
- Public beta launch: Product Hunt India, IndiaHacks community, LinkedIn announcement.

## 6. Success metrics

### Day 30
- WhatsApp API integration live and processing real messages.
- 10 businesses in private beta.
- Automation rate >60% (6 out of 10 messages handled without human).
- Zero critical data loss incidents.
- Onboarding funnel: signup → connected WhatsApp number → first bot live: completion rate >50%.

### Day 60
- 50 paying customers.
- ₹1.5–2.5L MRR.
- Automation rate across platform: >70%.
- Average conversations/customer/day: >20 (signals genuine usage).
- Churn: <8%/month.
- NPS from beta cohort: >40.
- "Powered by ChatBase" referral clicks: >100/week.

### Day 90
- 200 paying customers.
- ₹6–8L MRR (~$7–10K).
- 3 agency partners signed (each managing 5+ client accounts).
- Automation rate: >75% platform-wide.
- Churn: <5%/month.
- Average revenue per customer: ₹3,200/mo (mix of tiers, overage, add-ons).
- Coverage: at least 5 different industry verticals represented in customer base.

## 7. Risks & mitigations

**Risk 1: WhatsApp Business API access is gated by Meta**
- Meta requires phone numbers to be verified, business accounts to go through Facebook Business Manager review (3–7 business days typical, can be delayed).
- **Mitigation:** Partner with 360dialog (official Meta Business Solution Provider) — they have faster approval paths and existing relationships. Build a concierge onboarding service where we assist customers through the verification process. Maintain a test number for demo purposes. Risk level: medium. This is the #1 operational risk for the product.

**Risk 2: Meta changes WhatsApp Business API pricing**
- Meta charges per conversation (user-initiated: ~$0.004 in India, business-initiated: ~$0.0083). We absorb this and build into our pricing.
- **Mitigation:** Conversation cost is factored into pricing (our ₹999/mo covers 1,000 conversations at ₹0.5 cost, leaving ~₹499 margin before other costs). Monitor Meta pricing changes quarterly. Our overage rate (₹0.50/conversation) also passes through cost + margin.

**Risk 3: AI response quality in Hindi/Gujarati**
- Claude performs well in English; Hindi/Hinglish responses can occasionally be awkward or use formal Hindi when the customer writes colloquially.
- **Mitigation:** Use Claude Sonnet (not Haiku) for non-English conversations. Build a human-review queue for the first 50 responses in a new language for each business. Allow business owners to "correct" bot responses (captured as training examples). Monitor escalation rate by language as a proxy for quality.

**Risk 4: Customer data and privacy**
- WhatsApp conversations contain sensitive customer information (health details for clinics, financial info for traders).
- **Mitigation:** Data encrypted at rest (Supabase AES-256). Data residency: India region only for Indian customers (Supabase Mumbai region). No customer conversation data used for training. Explicit privacy policy. DPDP Act (India's data protection law) compliance built in from day 1. Business owner must get opt-in consent from their customers (guided in onboarding).

**Risk 5: Competition from WATI, Interakt, Zoko**
- These are established players with 1,000s of customers.
- **Mitigation:** Our differentiation is genuine AI (Claude-powered, not rule-based flows) + no-code simplicity. We win on intelligence, not features. Target customers who tried WATI and found it too technical or too dumb. Position explicitly: "not another chatbot builder — an AI business assistant."

**Risk 6: Spam/misuse**
- Platform could be used for spam broadcasts.
- **Mitigation:** Message template approval required for broadcast campaigns (Meta already enforces this). Rate limiting on broadcasts. ToS enforcement. Suspend accounts with spam reports.

## 8. Tech stack (product-specific)

**Backend:**
- Runtime: Node.js 20 LTS, Fastify v4, TypeScript strict.
- ORM: Prisma with Supabase PostgreSQL (Mumbai region).
- Queue: BullMQ + Redis (Upstash Redis for managed, serverless-friendly).
- AI: Claude Haiku (high-volume responses), Claude Sonnet (non-English, complex queries, low-confidence reclassification).
- Vector DB: Qdrant Cloud (free tier sufficient for beta, dedicated cluster at 100+ customers).
- WhatsApp API: 360dialog primary, Twilio Conversations backup.
- Payments: Razorpay (India), Stripe (international).
- Email: Resend (transactional notifications, weekly reports).
- Calendar: Google Calendar API v3 (OAuth 2.0 per organization).
- Courier tracking: Shiprocket API, Delhivery API (Pro tier).
- Observability: Sentry (errors), Axiom (structured logs), PostHog (product analytics).

**Frontend (dashboard):**
- Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui.
- Real-time inbox: Supabase Realtime (WebSocket) — new messages push to the inbox without polling.
- Charts: Recharts.
- File uploads: react-dropzone → R2 via presigned URL (for PDF knowledge base uploads).

**Mobile app (owner):**
- React Native + Expo SDK 51, TypeScript strict.
- Push notifications: Expo Notifications + FCM.
- State: Zustand + React Query.
- Navigation: Expo Router.

**Infrastructure:**
- Backend API: Railway (auto-deploy from main, easy scaling).
- Next.js dashboard: Vercel.
- MQTT: not needed for this product.
- Redis: Upstash.
- Storage: Cloudflare R2 (PDF uploads, exported reports).

**WhatsApp API message flow:**
```
Customer WhatsApp message
  → 360dialog webhook → /api/v1/webhooks/whatsapp (Fastify, verifies HMAC-SHA256 signature)
  → Writes raw message to DB
  → Publishes job to BullMQ "message-processor" queue
  → Worker: classify intent (Claude Haiku) → retrieve from Qdrant → generate response
  → If confidence >= 0.75: send reply via 360dialog REST API
  → If confidence < 0.75: push to human inbox (Supabase Realtime notification to dashboard)
  → Status webhooks from 360dialog update message delivery status in DB
```

## 9. Go-to-market strategy

**Month 1 — Local launch (Ahmedabad + Gujarat)**

*Channel 1: Direct outreach in founder's network*
- Founder personally demos to 20–30 SMB owners in Ahmedabad (salons, clinics, retail shops, coaching centers) over 2 weeks.
- Offer: free 30-day trial, we set it up for them (concierge onboarding).
- Convert 10 to paid. Collect video testimonials.
- These 10 customers become case studies and referral seeds.

*Channel 2: Local WhatsApp groups + trade associations*
- Business owner WhatsApp groups in Ahmedabad are massive (GCCI — Gujarat Chamber of Commerce, local retail associations, CREDAI chapters).
- Share a 60-second demo video showing "before vs after" — owner drowning in messages vs. bot handling 80% automatically.
- Offer referral: "Refer a business, get 1 month free."

*Channel 3: Instagram + YouTube content (Hindi + Gujarati)*
- Short-form content: "WhatsApp business tips", "How to automate your WhatsApp", "I got 3 hours back every day" — authentic, owner-POV content.
- One YouTube tutorial: "How to set up a WhatsApp bot for your business in 10 minutes (no coding)."
- Run these consistently from Week 4 onwards.

**Month 2 — Digital expansion**

*Channel 4: Google Ads (intent-based)*
- Keywords: "whatsapp automation india", "whatsapp chatbot for small business", "whatsapp business bot", "automate whatsapp replies".
- Landing page: specific to industry (one for clinics, one for salons, one for retail, one for restaurants).
- Budget: ₹30,000–₹50,000/mo (ROI positive if 5 paid conversions at ₹3,000/mo avg).

*Channel 5: CA / digital agency partnerships*
- Target digital marketing agencies in Ahmedabad/Surat that manage SMB social media.
- Pitch: "Add WhatsApp automation to your service offering. We white-label for you."
- One agency = 10–50 SMB customers.
- Meet agencies at local business events (BNI chapters, digital marketing meetups).

*Channel 6: Product Hunt India launch*
- Target: #1 Product of the Day on Product Hunt India.
- Prep: 100 supporters lined up. Clear demo video. Strong tagline.
- Timing: Week 8 (post-beta hardening).

**Month 3 — Scale**

*Channel 7: SEO content*
- Target keywords: "whatsapp chatbot india", "whatsapp business automation", "chatbase india" (generic misspellings of competitors).
- 10 blog posts: industry-specific guides ("WhatsApp automation for clinics", "How restaurants use WhatsApp to take orders").
- This builds organic pipeline that compounds over months.

*Channel 8: Paid Meta ads*
- Target: business owners in India on Facebook/Instagram. Interest targeting: small business, entrepreneur, WhatsApp Business.
- Video ad: "200 messages a day. All manual. Until now." — before/after demo.
- Budget: ₹40,000/mo.

**Viral loop mechanics:**
- Every message sent by the bot ends with a subtle footer (configurable, on by default): "Powered by ChatBase — chatbase.in". This is in the message itself, visible to every customer.
- Customer sees it → searches ChatBase → becomes a lead if they own a business.
- Business owners refer each other at associations and trade groups — incentivized by the referral program (1 month free per referral who pays).

**Pricing psychology:**
- Free trial: 14 days, no credit card. Low friction to start.
- Onboarding concierge: first 10 minutes of setup done with a customer success person (video call or Loom walkthrough). Dramatically increases activation rate.
- Monthly vs. annual: push annual (20% off = 2 months free) with EMI option via Razorpay (split ₹7,188 into 6 EMIs of ~₹1,200/mo — psychologically feels cheap).

## 10. Competitive landscape

| Competitor | Pricing | AI quality | No-code | India-specific | Our advantage |
|---|---|---|---|---|---|
| WATI | ₹2,999–₹9,999/mo | Rule-based flows | Medium | Yes (Razorpay) | Real AI (Claude), simpler setup, better Hindi/Gujarati |
| Interakt | ₹2,499–₹7,999/mo | Rule-based + basic NLP | Medium | Yes | AI-native, multi-bot, calendar integration |
| Zoko | $49–$299/mo (USD-first) | Basic NLP | Medium | Partial | India pricing (INR), GST invoice, Hindi support |
| AiSensy | ₹999–₹4,999/mo | Basic flows, no AI | Easy | Yes | Claude-powered real AI, not flow builder |
| Respond.io | $99–$299/mo | Good NLP | Medium | No | India pricing, deep Razorpay, Hindi/Gujarati, local support |
| Custom agency chatbot | ₹50,000 one-time | Variable | No | Variable | No-code, always updated, subscription (lower upfront) |
| WhatsApp Business app (free) | Free | None | N/A | Yes | Automation — the free tool does nothing automatically |

**Key differentiators we own:**
1. **Claude AI quality:** Our competitors use basic NLP or rule-based flows. We use Claude Haiku/Sonnet — qualitatively better at understanding varied, colloquial phrasing in mixed-language messages.
2. **No-code knowledge base:** Upload a PDF or a Google Sheet — done. Competitors require configuring dozens of intent flows manually.
3. **Indian language depth:** Hindi, Hinglish, Gujarati out of the box. Not an afterthought.
4. **Integrated payments:** Razorpay payment links sent by the bot, tracked end-to-end. No competitor does this natively.
5. **Calendar sync:** Appointment booking that actually modifies Google Calendar. Competitors either don't offer this or require Zapier.
6. **India pricing:** ₹999/mo entry point is below every major competitor's lowest tier.
