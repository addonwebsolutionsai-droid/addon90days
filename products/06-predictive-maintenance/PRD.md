# PRD: IoT Predictive Maintenance Platform (P06)

**Product ID:** 06-predictive-maintenance
**Working name:** MachineGuard
**Owner agent:** @infra-engineer (MQTT/telemetry), @api-engineer (control plane + AI layer), @frontend-architect (dashboard + mobile)
**Pillar:** IoT × AI enterprise solution — **moat product**
**Pricing target:** $299–$25,000/mo SaaS + $10,000–$50,000 one-time setup
**Status:** Prototype in Week 4 (leverages ConnectOne P05 infrastructure). Full build Weeks 5–16.

**Validation scores:** Feasibility 85% | Market Viability 85% | Viral Potential 65% | Revenue Machine 90%

**Strategic note:** MachineGuard is a vertical application layer built on top of ConnectOne (P3). It reuses the EMQX MQTT broker, device provisioning, and telemetry ingestion infrastructure already being built for P3. MachineGuard is the ConnectOne platform's first "killer app" — a specific industry vertical that proves enterprise value and generates large contracts.

---

## 1. Problem

A textile factory in Surat has 80 weaving machines. Each machine has a motor. Each motor is running 16 hours a day, 6 days a week. When one motor fails unexpectedly, the entire production line for that machine stops. The factory loses ₹15,000–₹40,000 per day per idle machine in lost production. Repairing or replacing a motor takes 2–5 days including parts procurement. The factory owner experiences this 8–15 times per year per factory.

Annual cost of unplanned machine downtime for a mid-size Indian manufacturer: ₹50 lakh – ₹5 crore.

**The problem has three layers:**

**Layer 1: No early warning system**
- Machine failure happens suddenly and completely. There is no alert 2 weeks before failure that says "this motor is showing signs of bearing wear." The failure is discovered when the machine stops producing.
- Even skilled technicians who "know the sound" of a sick motor are only present during working hours and can't monitor 80 machines simultaneously.

**Layer 2: Maintenance is either too much or too little**
- **Reactive maintenance (current state):** Fix it when it breaks. Maximum downtime, no planning.
- **Preventive maintenance (better, but costly):** Replace parts on a fixed schedule regardless of actual condition. A bearing scheduled for replacement every 6 months gets replaced even if it has 4 months of life left — waste. Or it fails at month 5 because the schedule was wrong for actual load.
- **Predictive maintenance (ideal):** Replace parts based on actual measured condition. Only possible with sensors and analytics. Currently only accessible to large factories with expensive enterprise systems.

**Layer 3: Institutional knowledge is leaving**
- Senior technicians who "know" each machine are retiring. New workers don't have the same intuition. When they retire, the factory loses years of tacit knowledge about which machines run hot, which vibrate slightly before failure, which motors draw more current as they age.

**Who bears this problem:**

- **Textile mills** (Surat, Ahmedabad, Ludhiana, Bhilwara): looms, weaving machines, dyeing machines, compressors.
- **Food processing plants** (Gujarat, Maharashtra, Punjab): conveyor belts, mixers, filling machines, refrigeration compressors.
- **Auto component manufacturers** (Pune, Chennai, Faridabad): stamping presses, CNC machines, injection molding machines.
- **Pharma packaging plants** (Ahmedabad, Hyderabad): blister packaging machines, tablet presses, coating machines.
- **Small-to-mid industrial facilities:** any factory with 10–200 machines running at significant utilization.

**Existing solutions and their failure modes:**

- **IBM Maximo / SAP PM:** Enterprise asset management. Cost: $200,000–$1,000,000 to implement. Timeline: 12–18 months. Requires a dedicated IT team. Completely inaccessible to a factory with ₹10–100 crore revenue.
- **Siemens MindSphere / GE Predix / PTC ThingWorx:** Industrial IoT platforms. Same problem — designed for global manufacturing enterprises, not Indian SME factories. $50,000–$500,000 implementation. Require industrial protocol expertise (OPC-UA, Modbus) that most Indian factories don't have.
- **Scada systems:** Monitor process variables (temperature, pressure in specific equipment). Not general-purpose machine health monitoring. Complex to install. Expensive.
- **Manual inspections:** The maintenance manager does rounds. Checks temperature by touch. Listens for unusual sounds. Checks oil levels. This is the state of the art in 90% of Indian SME factories. Better than nothing, but misses 70% of failures that don't announce themselves obviously until it's too late.
- **Nothing:** Many factory owners accept downtime as "cost of doing business." Until they see a competitor using MachineGuard and reducing downtime by 60%.

**The total addressable problem:**

India has approximately 250,000 registered factories with 10–200 machines and revenue between ₹5–500 crore. These are precisely the businesses too large to ignore machine health but too small to afford enterprise solutions. This gap is enormous and largely unserved.

## 2. Solution

MachineGuard is a plug-and-play predictive maintenance platform combining AddonWeb's proprietary IoT sensor hardware with a cloud analytics platform and an AI layer that makes the insights accessible to non-technical factory managers.

The product has three components that work together:

### Component 1: Sensor Kit (hardware — AddonWeb's moat)

**Sensor hardware (MachineGuard Sensor Node v1):**
- Microcontroller: ESP32-S3 (our existing firmware expertise — not starting from scratch).
- Sensors on each node:
  - **Vibration:** ADXL345 3-axis accelerometer (detects bearing wear, imbalance, misalignment, looseness). Sampling rate: 1,600 Hz for FFT analysis.
  - **Temperature:** NTC thermistor + DS18B20 digital temperature sensor (surface temperature of motor casing — elevated temperature = friction = bearing degradation).
  - **Current clamp:** Non-invasive AC current transformer (CT clamp) around the power cable — measures current draw. Increasing current at constant load = motor inefficiency = bearing wear or winding issues. No electrical rewiring required.
  - **Optional (premium kit):** MEMS microphone for acoustic emission (ultrasound detection of bearing spalling).
- Connectivity: WiFi (2.4 GHz) — factory WiFi or a local access point we provide. LoRaWAN option for large outdoor facilities (v2).
- Power: 5V DC via USB-C power adapter. No battery (continuous monitoring). Cable length options: 2m, 5m, 10m.
- Form factor: IP54-rated enclosure (dust and splash resistant). Magnetic mount (attaches to motor casing in 30 seconds — no drilling, no rewiring, truly plug-and-play).
- Firmware: C/C++ (AddonWeb's existing firmware base). OTA firmware update capability built in (uses ConnectOne OTA infrastructure).
- Cost to manufacture: approximately ₹2,500–₹3,500 per node (at 500-unit run). Sells at ₹7,500–₹12,000 per node.

**Installation process (30 minutes per machine):**
1. Attach the sensor node to the motor casing with magnetic mount.
2. Clip the CT clamp around one power cable.
3. Plug in USB-C power.
4. Scan QR code on the sensor → opens provisioning page → connects sensor to factory WiFi → assigns machine name in MachineGuard app.
5. Done. Telemetry starts flowing.

No electrician required. No downtime during installation. Factory maintenance staff can do this themselves.

### Component 2: Cloud Analytics Platform

**Telemetry ingestion:**
- Each sensor node sends data via MQTT to EMQX broker (ConnectOne P05 infrastructure — shared).
- Vibration data: FFT computed on-device (ESP32-S3 has sufficient compute) → send frequency spectrum summary every 5 minutes (not raw 1,600 Hz samples — too much data). Full raw sample burst on anomaly detection or on-demand.
- Temperature: raw reading every 30 seconds.
- Current: RMS current every 30 seconds.
- Data stored in TimescaleDB (time-series PostgreSQL extension) per sensor per machine.

**Baseline learning (the intelligence):**
- First 7 days after installation: system learns "normal" for each machine. Establishes baseline:
  - Normal vibration frequency spectrum (FFT fingerprint of a healthy motor).
  - Normal operating temperature range (varies by load, ambient temperature, machine age).
  - Normal current draw at different load levels.
- Baseline is specific per machine — a 20-year-old motor runs differently than a new one. The system adapts.
- Baseline update: re-runs automatically every 30 days (to account for seasonal temperature changes, gradual normal wear).

**Anomaly detection:**
- Continuous comparison of real-time data against machine-specific baseline.
- Vibration anomaly: increase in specific frequency bands (e.g., bearing defect frequency = 0.4 × RPM × number of balls in bearing — calculable from motor specs). Bearing defects show up in FFT weeks before audible or tactile detection.
- Temperature anomaly: sustained elevation beyond normal range.
- Current anomaly: gradual current increase at constant load.
- Composite health score: 0–100 for each machine. Algorithm: weighted combination of vibration deviation, temperature deviation, current deviation from baseline. Score >80 = healthy (green), 60–80 = watch (yellow), 40–60 = warning (orange), <40 = critical (red).
- Anomaly severity calibrated from industry benchmark data (MTBF data for common motor types) seeded into the model initially, then personalized over time.

**Failure prediction (AI layer):**
- Claude API is not used for signal processing (that's traditional ML/statistics). Claude is used for:
  - Translating anomaly data into natural language: "Machine 7 (Loom #12) has shown a 34% increase in bearing defect frequency over the last 11 days. This pattern is consistent with early-stage outer race bearing wear. Estimated remaining useful life: 2–4 weeks at current load."
  - Root cause analysis from maintenance history: "The last 3 times Machine 7 showed this vibration pattern, it was caused by lubrication issues. Check lubrication on this machine."
  - Work order generation: "Recommended action: Schedule bearing inspection within 10 days. Order part: 6205-2RS bearing (standard for this motor type). Estimated labor: 2 hours."

**Alert system:**
- Configurable alert thresholds per machine or per machine category.
- Alert channels: push notification (mobile app) + WhatsApp message + email.
- WhatsApp alert format: "MachineGuard Alert: Loom #12 (Machine 7) has entered Warning state. Vibration anomaly detected. Health score: 62/100. [View details] [Acknowledge]."
- Alert escalation: if not acknowledged in 30 minutes, escalate to plant manager. If not in 2 hours, escalate to owner.
- Alert fatigue prevention: smart grouping (if 5 machines alert within 10 minutes, one consolidated alert instead of 5 separate messages). Configurable quiet hours.

**Maintenance workflow:**
- Work order management: create a work order from an alert. Assign to technician. Status tracking: open → in progress → parts ordered → completed.
- Maintenance log: every maintenance action recorded against the machine. Date, technician, parts replaced, time taken, notes.
- This log feeds back into the AI: Claude uses maintenance history to personalize failure predictions.
- Planned maintenance scheduler: set a reminder for routine maintenance (e.g., "lubricate Machine 7 every 30 days"). Shows on dashboard calendar.
- Parts inventory tracker: track spare parts in the maintenance room. Low stock alerts on critical parts.

**Analytics dashboard:**
- Fleet overview: all machines in one view with health scores. Color-coded grid. Filter by: section, machine type, health status, floor.
- Machine detail: 30-day history of health score, vibration trend, temperature trend, current trend. Overlay: maintenance events.
- Downtime tracker: log every unplanned downtime event — machine, duration, cause, cost estimate. Monthly downtime report.
- Downtime cost calculator: owner inputs hourly production value per machine → system calculates: "In the last 30 days, unplanned downtime on 3 machines cost an estimated ₹2.4L."
- Saved downtime report: "Since MachineGuard was installed 90 days ago, 4 predicted failures were caught before breakdown, preventing an estimated 18 days of downtime = ₹8.6L in saved production losses."
- Maintenance cost trend: spare parts + labor costs tracked over time.

**Natural language query (Claude AI):**
- Chat interface on the dashboard (and via WhatsApp): factory manager asks questions in plain language.
- "Which machines are most likely to fail in the next 2 weeks?" → Claude queries TimescaleDB, analyzes health trends, returns prioritized list with reasoning.
- "How much money did we save last quarter from predictive alerts?" → Claude calculates from downtime log vs. estimated costs.
- "Compare Machine 12 performance before and after we replaced the bearing in March." → Pulls relevant data, analyzes, presents comparison.
- "Show me all machines that have been running hot this week." → Filters and presents.

### Component 3: Mobile App (React Native)

**For factory manager / maintenance manager:**
- Real-time fleet health grid on home screen. Large tiles, color-coded health scores. Quick visual scan of entire factory.
- Push notifications for all alerts. Deep link from notification directly to machine detail screen.
- Work order list: my open work orders, create new, update status.
- Machine detail: health score history, current sensor readings, alert history, maintenance log.
- Quick actions: acknowledge alert, create work order, log maintenance.

**For factory owner:**
- Summary dashboard: fleet health summary, downtime this month vs. last month, estimated money saved.
- Weekly auto-generated summary sent via WhatsApp + email (no need to open the app to get a sense of factory health).

## 3. Target customer (ICP)

**Primary ICP — Manufacturing SME:**
- **Industry verticals (priority order):** Textile/garment (Surat, Ahmedabad, Ludhiana), food processing (Gujarat, Maharashtra), auto components (Pune, Faridabad, Chennai), pharma packaging (Ahmedabad, Hyderabad), general engineering/fabrication.
- **Machine count:** 10–200 machines (production machines with rotating components — motors, compressors, conveyors, pumps, fans).
- **Revenue:** ₹5–500 crore/year.
- **Staff:** 50–2,000 employees.
- **Current maintenance approach:** Primarily reactive, maybe one "experienced technician" who eyeballs machines.
- **Decision maker:** Factory owner (proprietor) or Plant Manager / Maintenance Head in a professionally managed factory.
- **Geography (India):** Gujarat (Surat textiles, Ahmedabad pharma/textiles), Maharashtra (Pune auto components), Punjab (Ludhiana auto/textiles), Tamil Nadu (Chennai auto), UP/Haryana (auto components).
- **Geography (international, Phase 2):** Bangladesh (garments), Vietnam (manufacturing), Malaysia (food processing).

**Buyer personas:**

*Persona A — The Factory Owner (SME proprietor)*
- Age: 40–65. Has run this factory for 15–30 years. Knows the business deeply.
- Pain: Lost production = lost money. Has experienced a major breakdown that cost ₹10–50L. Never wants it again.
- Decision style: skeptical but pragmatic. Wants ROI proof. Will sign off personally if convinced.
- Objection: "We've managed without this for 20 years." Counter: "You managed without mobile phones for 50 years too. Your competitor in Surat just installed this."
- Closing trigger: a case study from a similar factory showing specific downtime reduction and cost savings.

*Persona B — The Plant Manager / Maintenance Head*
- Age: 30–50. Technical background. Manages 5–20 maintenance technicians.
- Pain: being blamed when machines break down. Pressure to reduce maintenance costs while preventing failures. Manual processes mean reactive firefighting.
- Decision style: evaluates technically. Wants to understand how the sensors work and whether data is accurate.
- Objection: "How do we know the sensor is accurate?" Counter: demo + trial period where both sensor and manual inspection happen in parallel — compare results.
- Closing trigger: sees false positives are low and the predicted failures actually happened.

**The $299/mo entry point is critical:**
- A factory with 20 machines paying $299/mo = $14.95/machine/month. The first prevented breakdown saves 50–100x that in a month. ROI payback on the first month of use.
- This price point is designed to be an easy "yes" from a Plant Manager without needing owner approval.

## 4. Business model & pricing

### SaaS pricing (cloud platform)

| Tier | USD/mo | INR/mo | Machines | Data retention | Work orders | Support | AI queries/mo |
|---|---|---|---|---|---|---|---|
| Starter | $299 | ₹24,900 | 20 | 90 days | 50 | Email | 100 |
| Growth | $999 | ₹83,200 | 100 | 1 year | Unlimited | Email + WhatsApp | 500 |
| Enterprise | $5,000–$25,000 | Custom | Unlimited | 5 years | Unlimited | Dedicated CSM | Unlimited |
| Enterprise On-Premise | Custom | Custom | Unlimited | Customer-controlled | Unlimited | Dedicated + SLA | Unlimited |

**Annual billing:** 15% discount (2 months free).

### Hardware revenue

| Item | COGS (est.) | Selling price | Margin |
|---|---|---|---|
| Sensor Node Standard (vibration + temp + current) | ₹3,000 | ₹8,500 ($100) | 65% |
| Sensor Node Premium (+ acoustic emission) | ₹4,500 | ₹12,000 ($140) | 62% |
| Access Point (industrial WiFi for factories with poor coverage) | ₹2,500 | ₹7,500 ($90) | 67% |
| Gateway Kit (for factories with no internet — edge + cellular) | ₹8,000 | ₹22,000 ($260) | 64% |
| Starter Kit (5 sensors + access point + 1 year Starter SaaS) | ₹23,000 | ₹65,000 ($780) | 65% |
| Full Factory Kit (20 sensors + 2 access points + 1 year Growth SaaS) | ₹70,000 | ₹1,95,000 ($2,350) | 64% |

**Setup and professional services:**
- Standard installation (up to 20 machines, 1 day, within 200 km of Ahmedabad): ₹15,000 ($180).
- Remote installation support (video call, factory staff installs): included free.
- Enterprise deployment (site survey + installation + commissioning + training): ₹50,000–₹5,00,000 depending on scope.
- Custom sensor node development (different form factor, specific protocol, custom sensor integration): quote-based.

### Enterprise contract structure

For enterprises (Growth + Enterprise tiers):
- Year 1: hardware (one-time, billed at delivery) + SaaS subscription + setup fee.
- Year 2+: SaaS subscription only + hardware additions as factory scales.
- Optional: annual maintenance contract (AMC) for hardware — 15% of hardware cost/year, covers sensor replacement for failures not caused by physical damage.

**Revenue model math (Day 90 scenario):**
- 20 Starter accounts ($299/mo): $5,980/mo
- 10 Growth accounts ($999/mo): $9,990/mo
- 2 Enterprise accounts ($8,000/mo avg): $16,000/mo
- Hardware: 30 installations × avg ₹75,000 = ₹22.5L one-time
- **Recurring at Day 90: ~$32K MRR (~₹27L/mo)**
- **Plus hardware one-time: ₹22.5L in 90 days**

This product has a longer sales cycle than pure SaaS (3–8 weeks for SME, 3–6 months for enterprise) but much higher ACV and extremely low churn (hardware + data dependency = near-permanent customer once installed).

## 5. Build plan

### Phase 1 — Hardware + basic telemetry (Weeks 1–4)

**Week 1–2: Sensor hardware**
- Design sensor node PCB using ESP32-S3 dev board (rapid prototyping — custom PCB comes in Phase 2).
- Firmware (C/C++): WiFi connection, MQTT publish to EMQX (ConnectOne broker), ADXL345 driver (SPI), DS18B20 driver (1-Wire), CT clamp ADC reading, on-device FFT computation (ESP-DSP library), OTA update client.
- Provisioning: BLE-based provisioning (send WiFi credentials + machine ID from mobile app via BLE GATT) — reuses ConnectOne provisioning pattern.
- First functional prototype: sensor node reading all 3 data streams, sending to EMQX, visible in raw data log.

**Week 3: Telemetry ingestion + storage**
- EMQX topic structure: `machineguard/{org_id}/{factory_id}/{machine_id}/telemetry`.
- Fastify MQTT subscriber (EMQX HTTP API + WebSocket): consumes telemetry messages → validates schema → writes to TimescaleDB.
- TimescaleDB schema: `sensor_readings` hypertable partitioned by time. Columns: `org_id`, `machine_id`, `sensor_type` (vibration/temperature/current), `timestamp`, `value` (JSONB for FFT spectrum, numeric for temp/current).
- Continuous aggregates: 5-minute, 1-hour, 1-day rollups for each metric (automatic downsampling for historical queries).
- Retention policy: 7 days raw, 1 year downsampled (Starter); 30 days raw, 3 years downsampled (Growth).

**Week 4: Baseline learning + anomaly detection**
- Baseline computation: background job runs after first 7 days of data. For each machine: computes mean and standard deviation for temperature and current over 7 days. For vibration: computes average FFT spectrum across 7 days of samples.
- Anomaly scoring: real-time comparison of each new reading against baseline. Z-score for temperature and current. Spectral deviation (cosine distance) for vibration FFT. Combined into health score (0–100) using weighted average.
- Machine health score written to separate hypertable every 5 minutes (for efficient historical health queries).
- Alert trigger: health score drops below threshold → alert record created → BullMQ job → send WhatsApp + push notification.

### Phase 2 — Cloud platform + AI (Weeks 5–8)

**Week 5: Dashboard v1**
- Next.js dashboard: fleet overview (grid of machines with health score tiles, color-coded), machine detail page (health score chart, temp/vibration/current charts with Recharts, alert history, maintenance log).
- Real-time updates: Supabase Realtime (WebSocket) for live health score updates on dashboard.
- Clerk auth: organizations per factory, roles (owner, plant_manager, maintenance_tech, viewer).
- Org/factory/machine management: CRUD for all entities.

**Week 6: Claude AI layer**
- Natural language health summary per machine: scheduled job runs every morning, for each machine in warning/critical state, Claude Sonnet generates a human-readable summary of anomaly trends with recommended action.
- Natural language query interface (web): chat box on dashboard. User asks question → Claude has access to: machine list, current health scores, recent anomaly data (passed as structured JSON in context), maintenance log. Generates SQL query → executes → formats response in natural language.
- WhatsApp AI query: business owner sends "check machine 7" to MachineGuard WhatsApp number → bot replies with current health score + Claude-generated summary.
- Work order AI generation: on entering critical state, Claude auto-drafts a work order with likely cause, recommended action, suggested parts.

**Week 7: Mobile app**
- React Native + Expo: factory health grid (real-time), machine detail, alert list + acknowledge, work order list + update status, maintenance log entry.
- Push notifications: Expo Notifications for all alerts.
- Offline support: cached last-known state for dashboard. Queue acknowledged alerts when offline, sync on reconnect.
- BLE provisioning flow: scan sensor QR code → app discovers sensor via BLE → enter WiFi credentials + machine name → confirm → sensor connects.

**Week 8: Maintenance workflow + integrations**
- Full work order management: create, assign, add notes, attach photos, mark complete.
- Parts inventory: add parts, track usage in work orders, low stock alerts.
- Planned maintenance scheduler: recurring reminders, calendar view.
- WhatsApp integration for maintenance staff: alert → WhatsApp message to assigned technician with machine details and recommended action. Tech replies "done" → work order auto-closed.
- Email reports: weekly factory health summary sent to owner + plant manager (Resend).

### Phase 3 — Enterprise features (Weeks 9–12)

**Week 9–10: Custom PCB + manufacturing**
- Design production-ready PCB (not a dev board). Smaller form factor, better noise isolation for ADC, conformal coating for industrial environment.
- Source PCB manufacturing (local Ahmedabad PCB manufacturer or Shenzhen for volume).
- First production run: 100 units.
- Enclosure: custom injection-molded IP54 enclosure (or off-the-shelf modified — depends on MOQ economics).

**Week 11: Multi-factory enterprise features**
- Enterprise dashboard: multiple factories under one account. Consolidated health view across all facilities.
- User management: enterprise admin manages plant managers across facilities.
- Custom alert routing: escalation matrix (tech → manager → owner) configurable per factory.
- API: REST API for integration with existing enterprise systems (ERP, CMMS).
- Webhook outbound: push alert events to customer's existing systems (SAP, Oracle, custom tools).

**Week 12: Advanced analytics + reporting**
- Downtime cost dashboard: total downtime prevented, estimated savings (factory inputs hourly production value, we calculate).
- Machine reliability ranking: which machines are most prone to issues, which are most reliable.
- Predictive maintenance scheduling: "Based on current wear trends, Machine 7 bearing should be replaced in 18 days. Machine 12 in 35 days." — schedule both in one maintenance window.
- Export: all data exportable as CSV/Excel for compliance and insurance documentation.
- Custom report builder: drag-and-drop report builder for enterprise customers.

## 6. Success metrics

### Day 30
- Sensor hardware prototype: 5 sensor nodes reading vibration, temperature, current simultaneously.
- MQTT telemetry flowing to TimescaleDB without data loss.
- Baseline learning algorithm functional and tested on 2 weeks of real machine data (sourced from a friendly factory in Ahmedabad for piloting).
- Dashboard v1 live: fleet view and machine detail with real-time data.
- Zero false positives in first 2 weeks of pilot (critical — false alarms destroy trust).

### Day 60
- 5 factories in pilot (3 in Ahmedabad, 1 in Surat, 1 in Pune) — covering: textile, food processing, pharma packaging.
- At least 1 predictive failure detected before breakdown (the killer demo case study — need this for GTM).
- Mobile app live on iOS and Android.
- Claude AI query layer functional (tested with real factory manager questions).
- 2 paying Starter accounts ($299/mo each).
- Hardware: 50 sensor nodes shipped to pilots (combination of paid and free trial).
- Alert false positive rate: <5% (fewer than 1 false alert per machine per month).

### Day 90
- 20 Starter accounts ($299/mo): $5,980 MRR.
- 10 Growth accounts ($999/mo): $9,990 MRR.
- 2 Enterprise accounts in negotiation or signed ($8,000–$15,000/mo each).
- **Total recurring: ~$32K MRR.**
- Hardware revenue: ₹15–25L (100–150 sensor nodes sold/deployed).
- 3 documented case studies with specific downtime + cost savings numbers.
- Sensor nodes: 200 total manufactured, 150 deployed.
- Factory installations: 30 factories across 4 states.
- Alert accuracy: >90% true positive rate on critical alerts (verified against actual maintenance outcomes).
- At least 1 enterprise contract signed (pipeline built from Day 30 outreach).

## 7. Risks & mitigations

**Risk 1: Sensor accuracy on industrial motors varies widely**
- Industrial environments have electrical noise (VFDs, welding machines), vibration transmitted from adjacent machines, temperature extremes. These create noise in the sensor data that can cause false anomalies.
- **Mitigation:** ADXL345 data acquisition designed with proper decoupling capacitors and cable shielding. FFT analysis uses band-pass filtering to isolate bearing defect frequencies from low-frequency structural vibration. Baseline learning window of 7 days specifically absorbs normal environmental noise into the baseline — anomaly detection fires on deviation from that noisy baseline, not from an idealized clean signal. First 30 days of any new installation are a calibration period — alerts have "learning mode" flag, shown to plant manager as informational rather than actionable. We visit pilots in person (Ahmedabad) to tune parameters.

**Risk 2: Factory WiFi is unreliable or nonexistent**
- Many small Indian factories have no WiFi or very patchy coverage on the factory floor.
- **Mitigation:** Include an industrial WiFi access point in the Starter Kit (factory can add to their network). For factories with no internet, offer cellular gateway option (SIM + 4G/LTE) — edge gateway collects data locally, sends to cloud when connected. For completely offline scenarios (enterprise), offer on-premise deployment. The LoRaWAN option (planned for v2) further reduces connectivity dependency.

**Risk 3: Plant managers resist the technology**
- "This machine has worked fine for 15 years, your sensor is wrong" — common initial reaction when the sensor flags a machine the manager believes is fine.
- **Mitigation:** The 7-day baseline learning period + the first 2 weeks of alerts framed explicitly as "observation mode, not action required." Plant manager is asked to visually inspect any flagged machine and compare notes. This builds trust gradually. Calibrate alert sensitivity down for first 30 days, then tighten once trust is established. Case studies showing that initial skepticism is normal and sensors proved right.

**Risk 4: Hardware component shortages**
- ESP32-S3 and specific sensors have had availability issues (post-COVID supply chain).
- **Mitigation:** Maintain 90-day inventory buffer of key components once in production. Qualify a second source for critical components (ADXL345 can be replaced by ICM-42688-P; ESP32-S3 can be replaced by ESP32-C6 in a pinch). Build hardware BOM with dual-source in mind from the start.

**Risk 5: Long enterprise sales cycles starve early revenue**
- Enterprise deals ($50K+) can take 6–12 months. If we're waiting for them, we run out of runway.
- **Mitigation:** The $299/mo Starter tier is specifically designed to be a "no approval needed" purchase for a plant manager. These can close in days. Enterprise deals are built from pilots that started as Starter accounts. Starter customers who see value naturally advocate for Growth/Enterprise budget. SaaS revenue from Starters funds operations while enterprise pipeline builds.

**Risk 6: Customer data and IP sensitivity**
- Factory production data (machine utilization, downtime) is commercially sensitive. Some factories in competitive industries (auto components, textiles) may refuse IoT monitoring fearing data leakage.
- **Mitigation:** Data residency: India region only (AWS Mumbai / Supabase Mumbai). On-premise deployment option for enterprise (customer's own cloud or on-site server). No raw telemetry ever leaves the customer's designated region. Strict contract language: customer data is never used for training or benchmarking without explicit consent. NDA offered to all Growth+ customers. Security audit available for enterprise.

**Risk 7: This is primarily a hardware + relationship business, not viral SaaS**
- Growth is slower than pure software products. Each installation requires physical hardware.
- **Mitigation:** This is known and planned. Day 90 target is 30 factories / $32K MRR — achievable through direct sales and pilot conversions without viral mechanics. The moat is real (hardware + firmware + AI + domain expertise is hard to copy). We're not building for viral — we're building for sticky enterprise contracts and defensible margins. This is the product that funds the company long-term.

## 8. Tech stack (product-specific)

**Hardware:**
- MCU: ESP32-S3 (primary), ESP32-C6 (backup/alternate BOM).
- Sensors: ADXL345 (vibration, SPI), DS18B20 (temperature, 1-Wire), CT clamp + ADS1115 ADC (current).
- Firmware: C/C++, ESP-IDF framework, FreeRTOS, ESP-DSP (FFT), ESP-MQTT, ESP-WIFI, NimBLE (BLE provisioning).
- OTA: HTTPS OTA client (fetches from Cloudflare R2 signed URL via EMQX rule engine trigger or manual push).
- Enclosure: IP54 ABS plastic (3D printed for prototypes, injection molded for production run >500 units).

**Backend:**
- Node.js 20 LTS, Fastify v4, TypeScript strict.
- Database: TimescaleDB (Postgres extension) on a dedicated Supabase instance. Hypertables for telemetry. Regular Postgres tables for control plane data.
- ORM: Drizzle (chosen over Prisma for this product due to time-series query performance — raw SQL with type safety is better for complex time-series analytics).
- MQTT: EMQX (shared with ConnectOne P05). Topic namespace isolated per organization.
- Queue: BullMQ + Upstash Redis.
- AI: Claude Sonnet (health summaries, work order generation, natural language queries), Claude Haiku (WhatsApp bot simple queries).
- Alerts: WhatsApp (360dialog), push notifications (Expo + FCM), email (Resend).
- Observability: Sentry + Axiom (structured logs for telemetry pipeline).

**Frontend (web dashboard):**
- Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui.
- Real-time: Supabase Realtime WebSocket for live health score grid updates.
- Charts: Recharts (health score history, vibration spectrum visualization as bar chart, temp/current trends).
- FFT spectrum visualization: custom Recharts component rendering frequency vs. amplitude bar chart. Baseline spectrum overlaid in gray, current spectrum in blue — visual deviation detection.
- Map view (enterprise): Mapbox GL JS showing factory locations with health status overlay.

**Mobile app:**
- React Native + Expo SDK 51, TypeScript strict.
- BLE provisioning: `react-native-ble-plx` for BLE GATT communication with sensor during setup.
- Push: Expo Notifications + FCM.
- Charts: Victory Native (react-native-compatible charting for mobile health score history).
- State: Zustand + React Query.

**Infrastructure:**
- Backend API: Railway (dedicated instance — not shared with other products due to TimescaleDB requirements).
- TimescaleDB: Supabase Pro (Mumbai region) with TimescaleDB extension enabled.
- EMQX: shared with ConnectOne (P3). MachineGuard uses a dedicated cluster namespace.
- Storage: Cloudflare R2 (firmware OTA binaries, report PDFs, exported data).
- Redis: Upstash.
- Frontend: Vercel.

## 9. Go-to-market strategy

MachineGuard is sold, not bought. The buyer doesn't actively search for "predictive maintenance software" — they're busy running a factory. We need to bring the product to them through trusted channels and compelling ROI demonstrations.

**Month 1 — Ahmedabad pilot acquisition**

*Channel 1: Founder's network in Ahmedabad industry*
- AddonWeb has 10 years of IoT hardware work for industrial clients. These relationships are the starting point.
- Founder personally calls 20 former and potential clients in manufacturing in Gujarat: "We've built something I want to show you. Takes 30 minutes at your factory. No commitment."
- Demo format: bring 2 sensor nodes, attach to 2 machines in 5 minutes, show dashboard on laptop → data flowing in real-time. Factory owner sees their machines on a dashboard immediately. This is the most effective demo possible.
- Offer: 60-day free pilot with 5 sensor nodes. We install, we monitor. If we catch a failure before it happens, they pay for the full installation. If not, they keep the sensors (worth ₹42,500) at no cost.
- This offer is financially aggressive but acquires customers who become case studies.

*Channel 2: GCCI and CII Gujarat*
- Gujarat Chamber of Commerce and Industry (GCCI) and CII (Confederation of Indian Industry) run programs for manufacturing SMEs.
- Apply to speak at manufacturing-focused events. Topic: "How AI is reducing machine downtime for Indian manufacturers."
- One credible case study from the pilot phase is enough to get speaking slots.

*Channel 3: GIDC industrial estates*
- Gujarat Industrial Development Corporation (GIDC) has industrial estates in Ahmedabad, Surat, Vadodara, Rajkot — dense concentrations of exactly our target factories.
- Walk the estates. Introduce to factory owners. Leave behind a 2-page ROI calculator ("If your factory has 20 machines and 3 unplanned breakdowns per year, you're losing ₹X. Here's how MachineGuard calculates ROI.").

**Month 2 — Digital presence + enterprise pipeline**

*Channel 4: LinkedIn content (industry-specific)*
- Share case studies: "Surat textile factory: 1 predicted motor failure, ₹4.2L downtime prevented." With specific, verifiable numbers (with customer permission — or anonymized).
- LinkedIn targeting: Factory owners, Plant Managers, Maintenance Heads, Operations Directors in Indian manufacturing. 2nd-degree connections in manufacturing.
- Content types: case studies, "how vibration analysis works" explainer posts (builds credibility), "5 signs your motor is failing" (educational, generates inbound interest).

*Channel 5: Enterprise outreach*
- Research large manufacturing companies in Gujarat with multi-factory operations.
- Target: VP Operations / Chief Maintenance Officer / CTO at companies with ₹100–2,000 crore revenue.
- Outreach: cold LinkedIn + email with specific, relevant hook ("I noticed your Surat facility makes [X]. Factories with similar processes typically see [Y] downtime rate. We have a case study that's directly comparable.").
- CTO/Founder makes these enterprise calls personally.
- Enterprise sales cycle: 3–6 months. Start pipeline now. Close Month 4–6.

*Channel 6: Tradeshows and industry events*
- IMTEX (International Machine Tool Expo) — January, Bangalore. India's largest manufacturing expo. Demo booth.
- India Manufacturing Show — November, Chennai.
- PLASTINDIA / TEXTECH India (textile machinery) — trade-specific shows where plant managers and factory owners attend.

**Month 3 — Partnership channel**

*Channel 7: Industrial equipment dealer partnerships*
- Industrial motor and bearing dealers (SKF, FAG, NTN dealers in Gujarat) interact with maintenance managers at exactly our target factories.
- Dealers want to sell more bearings and motors (MachineGuard helps them predict failures = more planned maintenance = more parts sales).
- Partnership: dealer recommends MachineGuard → gets 10% recurring commission on subscription. We get access to their customer base.
- One large industrial dealer in Ahmedabad or Surat can access 100–300 factories.

*Channel 8: Plant maintenance consulting firms*
- Small consulting firms that do industrial maintenance audits and help factories set up preventive maintenance programs.
- They recommend tools to their clients. MachineGuard fits their workflow perfectly.
- Revenue share: 15% recurring.

**Pricing psychology for industrial buyers:**
- Never lead with monthly price. Lead with ROI: "Your factory loses ₹[X] per unplanned breakdown. With 10 machines on MachineGuard Starter ($299/mo = ₹24,900/mo), one prevented breakdown pays for 3–6 months of subscription."
- Annual contract preferred: annual = better pricing + commitment = easier to budget as capex (factory owners are comfortable with annual equipment contracts).
- Starter Kit bundle (5 sensors + 1 year SaaS): ₹65,000 + ₹1,79,000 annual SaaS = ₹2,44,000 first-year investment. For a factory losing ₹50L/year to downtime, this is a trivially easy decision.

## 10. Competitive landscape

| Competitor | Price | Plug-and-play | AI NL queries | India-ready | Target size | Our advantage |
|---|---|---|---|---|---|---|
| IBM Maximo APM | $200,000+ | No | Yes | Partial | Enterprise only | Price, plug-and-play, 30-min install vs. 12-month implementation |
| Siemens MindSphere | $100,000+ | No | Partial | Partial | Large enterprise | Same as above |
| PTC ThingWorx | $50,000+ | No | Partial | No | Mid-large enterprise | Price, India GTM, plug-and-play |
| Aspentech APM | $100,000+ | No | Yes | No | Petrochemical/large | Price, hardware included, India-specific |
| Samsara (US focus) | $50–200/device/mo | Partial | No | No | US enterprise fleet | India pricing, manufacturing focus, Claude AI |
| Nanoprecise (Canada) | $200–500/mo | Yes | No | No | Global SME | India pricing, Claude AI, WhatsApp alerts, manufacturing-specific |
| Augury | Custom | Yes | Partial | No | US mid-enterprise | Price, India, plug-and-play, WhatsApp, Claude |
| No solution (manual) | ₹0 | N/A | N/A | N/A | All | Direct ROI comparison — 1 prevented failure = 3–6 months of subscription |

**Our genuine competitive moat — no competitor can replicate this combination:**

1. **Own hardware end-to-end:** We design, manufacture, and support the sensor hardware. This is not a pure software company reselling third-party sensors. We can price hardware competitively (Indian manufacturing cost), customize for specific machine types, and provide support that understands both hardware and software. Most software-first competitors struggle with hardware issues.

2. **10-year IoT firmware expertise:** Our ESP32 firmware is not written by a software developer who recently learned C. It's written by engineers who have shipped firmware to real hardware products. Signal quality, noise filtering, FFT implementation, BLE provisioning — all battle-tested.

3. **30-minute installation, no electrician:** Our CT clamp design specifically avoids any electrical work. Magnetic mount requires no drilling. This is a genuine product innovation — a maintenance manager can install the system themselves in a half-hour. Enterprise competitors require industrial protocol specialists and multi-week installations.

4. **Claude AI in Gujarati and Hindi:** A factory manager in Surat can ask "which machines are going to fail this week?" in Gujarati — and get a useful answer. No competitor offers this. This is not a trivial differentiation in our target geography.

5. **WhatsApp-native alerts:** Plant managers in India don't check enterprise dashboards. They check WhatsApp. Our alert system is designed around this reality. A critical alert on a $200K enterprise platform that nobody sees is useless. An alert on WhatsApp that the maintenance manager gets immediately on his phone — that's how you prevent downtime.

6. **Price point that fits Indian SME budgets:** $299/mo Starter is priced at a level where a plant manager can approve it without finance committee review. Enterprise competitors are priced for annual budget cycles and procurement committees — we're priced for immediate action.
