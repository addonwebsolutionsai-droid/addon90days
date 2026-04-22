# PRD: All-in-One IoT Plug-and-Play Platform (P05)

**Product ID:** 05-iot-platform
**Working name:** ConnectOne (placeholder)
**Owner agent:** @infra-engineer (MQTT/device infra), @api-engineer (control plane), @frontend-architect (multi-role dashboards)
**Pillar:** IoT × AI vertical solutions — **this is our moat product**
**Pricing target:** Tiered SaaS ($99–$999/mo for SaaS self-serve) + Enterprise deployments ($50K–$500K per engagement)
**Status:** Prototype to demo ASAP (Week 3-4). Full product Phase 2-3.

---

## 1. Problem

Companies with IoT devices — whether they're consumer smart-home products, industrial sensors, agritech devices, cold-chain monitors, retail sensors — face the same stack of problems:

- **Building the back end from scratch is huge.** Device provisioning, MQTT brokers, data ingestion, rule engines, user apps, admin consoles, multi-tenant fleet management — 6-18 months of engineering.
- **Existing platforms are either too generic or too locked in.** AWS IoT Core is powerful but complex. Losant/ThingsBoard require significant configuration. Blynk is toy-scale. Proprietary clouds lock you in.
- **Multi-role access is often hacked together.** A typical IoT platform has: the platform vendor (super-admin), a device maker/vendor (vendor-admin of their own SKU fleet), end-users (who own a device). Most products handle 1-2 of these, not all 3.
- **Mobile apps are an afterthought.** White-label React Native apps that "just work" for each vendor's branding: rare.

Our angle: **"Plug and play"** — the device vendor gets a working backend + white-label mobile app + admin console + APIs in days, not months.

## 2. Solution

A platform with three tightly integrated layers:

**Layer 1: Device connectivity**
- MQTT broker (EMQX) with multi-tenant topic isolation
- Device provisioning flow (QR code / BLE / Wi-Fi Manager) with certificate-based auth
- Telemetry ingestion at scale
- Command/control (device ← cloud) with acknowledgment
- OTA firmware update pipeline (per-vendor firmware repository, version rollout controls)
- Support for: ESP32, STM32, nRF series, Linux-based devices, custom MCUs via our SDK

**Layer 2: Control plane (multi-role)**
- **Super-admin (us):** onboard new device vendors, manage platform-wide rules, billing
- **Vendor-admin (our customer):** manage their device SKU catalog, firmware releases, support their users, branding
- **User-admin (organization):** manage devices within their org/home, give access to team members
- **End-user:** use the device, see telemetry, control device
- Role-based permissions enforced in middleware + policy engine
- White-label per vendor (their logo, colors, domain)

**Layer 3: Applications**
- **React Native mobile app** (iOS + Android) — fully white-labeled per vendor, published under vendor's developer account OR as a multi-tenant app with vendor-specific flows
- **Web dashboard** — responsive, role-sensitive (same auth, different surfaces)
- **Push APIs** — webhook-style outbound, SSE/WebSocket inbound-to-vendor-systems
- **Rule engine** — "when telemetry X crosses threshold Y, do Z" configurable without code
- **AI layer (our differentiation):** Claude/MCP integration for natural-language queries over device data, anomaly summarization, per-device reports

## 3. Target customer (ICP)

**Two distinct buyer personas:**

### A) SaaS self-serve (device makers/startups launching 1 product)
- 10-500 devices in production
- Makers, hardware startups, specialty IoT vendors
- Buyer: Founder/CTO of hardware startup
- Entry: free trial with first 10 devices, paid once scaling
- Price sensitivity: high

### B) Enterprise deployments (our moat play)
- Established companies with IoT initiatives: smart manufacturing, cold-chain, agritech, retail analytics, utilities
- 1,000-100,000+ devices
- Buyer: VP Engineering / CTO / Chief Digital Officer
- Typical: custom-branded deployment, some hybrid (our cloud + their VPC)
- Decision cycle: 3-6 months
- Contracts: $50K-$500K+ per engagement with ongoing platform fees

We sell to both, but enterprise is where we differentiate (our IoT hardware + firmware expertise is real — most competitors are pure SW).

## 4. Positioning

**For** device makers and IoT-using enterprises **who** need a production-grade device cloud, mobile app, admin tools, and APIs without building 18 months of infrastructure, **ConnectOne** is an **all-in-one IoT platform with plug-and-play device support and AI-native device intelligence** — unlike **AWS IoT Core** which requires assembling 15 services and zero frontend, or **ThingsBoard** which is powerful but requires extensive setup and lacks white-label mobile apps, **ConnectOne ships with a ready-to-brand mobile app, multi-tier admin, AI-native analytics, and our team's 10 years of hardware-side experience**.

## 5. Core features (v1)

### Device onboarding
- SDK for ESP32, STM32, nRF (C/C++), and a generic MQTT client library
- Provisioning modes: BLE-based (via mobile app), SoftAP + captive portal, QR-code-scan
- Certificate-based device identity (not username/password)
- First connection = auto-register in tenant's device registry

### Device management
- Device list view per vendor with filtering (online/offline, model, firmware version, geography)
- Per-device detail: telemetry history, firmware, logs, remote commands
- Bulk actions (OTA update to all, reboot, factory reset)
- Groups/tags for organization

### Telemetry
- Time-series data storage (TimescaleDB or ClickHouse depending on volume)
- Real-time streaming to dashboards via WebSocket
- Historical query with downsampling
- Retention policies per tier (7 days free, 1 year paid, unlimited enterprise)

### Rules engine (visual + code)
- Visual: "when telemetry.temperature > 35 for 5 minutes, send push notification + write alert record"
- Code: JS snippets for complex logic (sandboxed execution)
- Triggers: telemetry thresholds, schedule, device event (online/offline), external webhook
- Actions: push notification, email, SMS (Twilio), webhook out, device command

### OTA firmware
- Per-vendor firmware bucket
- Version management with changelog
- Phased rollout (1% → 10% → 100%)
- Rollback on device report-back failure
- Signed firmware verification on device side

### Multi-role dashboards
- **Super-admin console:** tenant management, billing, usage analytics, platform health
- **Vendor-admin console:** branding, firmware, SKU management, their users, analytics per SKU
- **User-admin console:** their devices, users in their org, usage
- **End-user app:** their devices, telemetry, control

### White-label
- Per-tenant: logo, primary/secondary colors, app name, support email, custom domain
- Per-tenant: ToS/privacy, onboarding screens
- Generate tenant-specific mobile app build (automated pipeline)

### APIs
- REST API for all control-plane operations
- WebSocket + SSE for telemetry streaming
- Webhooks outbound (configurable per event type)
- MQTT for device-side

### AI features (differentiation)
- "Ask your devices" — natural-language query: "Which devices in Chennai plant had highest temperature spikes last week?" → SQL generated → answered
- Anomaly summarization — Claude writes weekly digests per device or per fleet
- Predictive alerts — pattern-trained per customer
- MCP server: lets customers' own Claude/agents query their device fleet

## 6. Non-goals (v1)

- Device design / hardware manufacturing services (that's our services line, separate)
- Industrial protocol gateways (Modbus, BACnet, OPC-UA) — add later with integrations
- On-premise deployment in v1 (cloud-only)
- Edge compute / fog layer (enterprise add-on later)

## 7. Technical approach

- **MQTT broker:** EMQX (self-hosted on our infra, or customer-VPC in enterprise deploys)
- **Time-series DB:** TimescaleDB (Postgres extension — simpler) or ClickHouse for scale
- **Control plane API:** Node.js/Fastify, TS strict
- **Rule engine:** Node VM sandboxed execution + visual rule designer in React
- **Mobile apps:** React Native + Expo, white-label pipeline via Expo EAS custom builds
- **Web dashboard:** Next.js 15 + TypeScript
- **Auth:** Clerk (with vendor-specific themes)
- **Messaging:** BullMQ + Redis for push/email/SMS/webhook queues
- **OTA storage:** Cloudflare R2 with signed URLs
- **AI layer:** Claude API + MCP server per tenant
- **Firmware SDKs:** separate repos per chip family with examples

## 8. Pricing

### SaaS self-serve
| Tier | Monthly | Devices | Telemetry retention | Features |
|---|---|---|---|---|
| Dev | Free | 10 | 7 days | Basic, no white-label |
| Starter | $99 | 500 | 30 days | White-label, push notifications |
| Growth | $499 | 5,000 | 1 year | All features, basic support |
| Pro | $999+ | Per-device scaling | 3 years | All features, priority support |

### Enterprise
- $50K-$500K per deployment (custom branding, VPC, dedicated support, SLA)
- Platform fee $5K-$25K/month ongoing
- Services bundle: firmware, device design consulting — if customer wants

## 9. GTM

### SaaS self-serve
- Developer-led: GitHub open-source SDK, great docs, quick-start guides
- Content: deep technical blog posts ("How we scaled MQTT to 100K devices"), Hackster.io tutorials
- Community: Discord for developers, Office Hours weekly
- Hacker News / Dev.to launch

### Enterprise
- Founder-led outbound (P3 is our founder's domain — leverage fully)
- Case studies from our past IoT hardware work (even under NDA, we can reference "a Tier-1 auto parts manufacturer...")
- Partnerships with silicon vendors (Espressif, Nordic)
- Industry conferences: IoT World, Embedded World, MWC

## 10. Risks

1. **Telemetry costs scale wildly** — per-device storage math matters. Mitigation: strict tier limits, downsampling policies, ClickHouse for cost at scale.
2. **Competing with AWS pricing on volume** — we can't win pure cost at 1M devices. Mitigation: win on time-to-market + mobile app + AI layer, not infra cost.
3. **Mobile app white-label store submissions** — App Store approvals for vendor-branded apps is a compliance challenge. Mitigation: structured onboarding flow for vendors to handle their own App Store + we handle build pipeline.
4. **Enterprise sales cycle starves cash** — mitigation: SaaS self-serve runs in parallel, funds the enterprise motion.
5. **Support burden** — IoT customers hit weird problems (device field failures, network issues). Mitigation: tiered support, excellent diagnostics in our tools, community Discord.

## 11. 14-day prototype plan (for Phase 1 demo)

Not a full v1, but a demonstrable prototype:
- **Day 1-3:** EMQX setup, MQTT ingestion, ESP32 sample firmware that connects + sends fake temperature telemetry every 30s
- **Day 4-6:** Control plane API — device list, telemetry query, send command
- **Day 7-9:** React Native app with login, device list, single-device telemetry graph, single command button
- **Day 10-12:** Super-admin + vendor-admin web dashboards, auth with roles, basic white-label (logo swap)
- **Day 13-14:** Demo script, test video, pitch deck for enterprise outreach

This prototype is what we demo on enterprise calls in Week 7-8.

## 12. v1 full build plan (Phase 2-3 — Days 31-90)

- Weeks 5-6: OTA pipeline + firmware release management
- Weeks 7-8: Rule engine + alerts + push/email/SMS
- Weeks 9-10: Full telemetry features (retention, downsampling, history UI)
- Weeks 11-12: AI "Ask your devices", MCP server for tenant, public SaaS launch

Enterprise engagements can start running in parallel — signed prospects shape v1 features in real time.
