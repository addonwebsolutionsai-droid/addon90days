# P06 · MachineGuard — Session Context

## Current Status
**Phase:** Pre-build  
**GTM:** Enterprise (founder closes deals personally)  
**Start:** After ConnectOne (P05) infrastructure is ready  
**Last Updated:** 2026-04-22

## What's Done
- PRD written and reviewed
- Design system complete (design-pro.html P06 section)
- .claude structure initialized

## What's Next
1. Build on top of ConnectOne (P05) infrastructure (must exist first)
2. Design ML pipeline (data ingestion → feature engineering → model → prediction)
3. Implement Isolation Forest for anomaly detection
4. Implement LSTM for time-to-failure prediction
5. Build explainability layer (SHAP values for sensor contribution)
6. Build alert engine (severity → notification routing)
7. Build control room dashboard (real-time, alert-first)
8. Build ROI Calculator (lead magnet)
9. Demo environment with realistic synthetic data

## Key Decisions
- ML: Isolation Forest (anomaly) + LSTM (failure prediction) — not black box
- Shared infrastructure with P05 (ConnectOne) — NEVER duplicate
- POC pricing: Free 30 days → $5k/month contract
- Sensors minimum: 3 per machine (vibration XYZ, temperature, current)

## Target Customers Pipeline
- Need 3 enterprise pilot contacts in Ahmedabad manufacturing sector
- Auto parts, pharma, food processing are hottest verticals
- Approach: factory visits + ROI calculator demo

## ML Training Data Strategy
- Phase 1: Synthetic data (CWRU Bearing Dataset publicly available)
- Phase 2: Real customer data (after POC signed)
- Phase 3: Global model trained on aggregated fleet data

## Session Notes
_Add notes here at end of each work session_
