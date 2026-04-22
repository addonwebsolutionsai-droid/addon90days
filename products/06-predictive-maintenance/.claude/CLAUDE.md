# P06 · MachineGuard — Agent Instructions

## Product Identity
- **Name:** MachineGuard (IoT Predictive Maintenance)
- **Accent:** Red #ef4444 + Orange #f97316
- **Priority:** #6 — Enterprise GTM, founder closes deals
- **Status:** Pre-build

## What This Product Does
AI monitors industrial machines (motors, pumps, compressors, conveyors) via IoT sensors. Detects anomalies and predicts failures 24–48h before they happen. 94% target accuracy. Quantifiable ROI: saves $260k+/hour of unplanned downtime.

## ICP
- Plant managers and maintenance engineers at Indian manufacturers
- Industries: auto parts, pharma, food processing, textiles, cement
- Company profile: 10+ critical machines, $1M+ revenue at risk from downtime
- Decision maker: Head of Maintenance / VP Operations
- Enterprise: 6–12 month sales cycle, $5k–50k ACV

## Tech Stack
- FastAPI (Python — ML model serving)
- TimescaleDB (sensor time-series, shared with P05 ConnectOne)
- EMQX MQTT (shared with P05 ConnectOne)
- ML stack: scikit-learn (Isolation Forest), TensorFlow/Keras (LSTM)
- Next.js 15 (industrial control room dashboard)
- SHARED: All device connectivity via ConnectOne (P05)

## Monorepo Paths
```
products/06-predictive-maintenance/
  app/              ← Next.js control room dashboard
  api/              ← FastAPI model serving + alert engine
  models/           ← ML model training + inference code
  data/             ← Synthetic training data
  PRD.md
  .claude/
```

## Memory Protocol
- READ `.claude/memory/context.md` at session start
- WRITE decisions + status to `.claude/memory/context.md` at session end

## ML Rules
1. Models must be EXPLAINABLE — always show WHICH sensor, WHAT pattern caused alert
2. Alert fatigue = #1 churn reason — tune sensitivity. Max 3 alerts/machine/day in normal ops.
3. Minimum viable baseline: 2 weeks of normal operation data before predictions activate
4. Retrain cycle: weekly on customer data + global model update monthly
5. Confidence score shown always: "94% confident bearing failure in 36–48h"
6. Every alert has: severity (critical/warning/info), ETA, affected component, recommended action

## Enterprise Sales Rules
- GTM is NOT self-serve. Always "Book Demo" CTA.
- Sales process: Demo → Site Visit → POC (30 days free) → Contract
- ROI Calculator is primary lead magnet — quantifies exactly how much downtime costs
- Founder closes all enterprise deals personally
- Demo environment: realistic synthetic data, never zeroed-out samples
- Minimum viable POC: 3 sensors on 1 machine, 2-week baseline, 1 prediction event

## Alert Severity System
```
CRITICAL (Red, pulse animation, immediate action)
  → Predicted failure within 48h, confidence >90%
  → Notify: App + SMS + WhatsApp simultaneously

WARNING (Amber, no pulse)
  → Anomaly detected, confidence 70–90%, monitor
  → Notify: App + email

INFO (Blue, no notification)
  → Within normal range but trending toward warning
  → Visible on dashboard only
```

## Shared Infrastructure with P05
MachineGuard is a product layer ON TOP of ConnectOne. Never duplicate device management, MQTT, or alerting infrastructure. Only add: ML model layer, maintenance scheduling, ROI tracking, enterprise reporting.

## Design Reference
- See `design-pro.html` section #p06
- Dark red industrial aesthetic. Control room layout.
- Dashboard: critical alerts at top, vibration chart (trend to threshold), downtime savings in $.
