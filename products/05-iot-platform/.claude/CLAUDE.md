# P05 · ConnectOne — Agent Instructions

## Product Identity
- **Name:** ConnectOne (IoT Plug-and-Play Platform)
- **Accent:** Cyan #06b6d4 + Blue #3b82f6
- **Priority:** #5 — AddonWeb's hardware moat
- **Status:** Pre-build

## What This Product Does
Connect any IoT device (ESP32, STM32, nRF, custom PCB) to the cloud in under 5 minutes. Real-time telemetry dashboard, OTA firmware updates, AI anomaly alerts, fleet management. This is AddonWeb's moat — pure-software competitors cannot replicate this.

## ICP
- Hardware/firmware engineers building IoT products
- Industrial companies with sensor networks (temperature, vibration, GPS, pressure)
- Smart agriculture, cold chain monitoring, asset tracking
- Companies that need device management at scale (10–10,000 devices)

## Tech Stack
- Fastify (Node.js API)
- EMQX or Mosquitto (MQTT broker) — EMQX for scale
- TimescaleDB (time-series PostgreSQL) for sensor data
- Next.js 15 + WebSocket for real-time dashboard
- Redis for device state cache
- **C/C++ SDK for ESP32/STM32/nRF** — FOUNDER HAS DEEP EXPERTISE
- Docker for MQTT broker deploy
- Railway for API, Vercel for dashboard

## Monorepo Paths
```
products/05-iot-platform/
  app/              ← Next.js dashboard
  api/              ← Fastify REST + WebSocket
  mqtt/             ← MQTT broker config
  sdk/              ← C/C++ device SDK (ESP32/STM32/nRF)
  PRD.md
  .claude/
```

## Memory Protocol
- READ `.claude/memory/context.md` at session start
- WRITE decisions + status to `.claude/memory/context.md` at session end

## CRITICAL: Firmware/Embedded Rules
⚠️ The founder has 10+ years of firmware expertise. NEVER make embedded architectural decisions without his review.

1. SDK is pure C (not C++) unless founder approves C++ for specific module
2. No dynamic memory allocation in firmware (no malloc/free)
3. MQTT QoS levels: QoS 1 for telemetry, QoS 2 for OTA commands
4. Device auth: X.509 certificates per device (not shared API keys)
5. Watchdog timer: mandatory on all devices. Never remove.
6. OTA: atomic update only. Failed update = automatic rollback to last known good.
7. Power management: respect device sleep cycles. No unnecessary wake.

## Data Architecture Rules
- Raw telemetry: store 7 days, then aggregate to hourly
- Hourly aggregates: store 90 days, then aggregate to daily
- Daily aggregates: keep forever (cheap, essential for trend analysis)
- Alert rules: stored per-device, evaluated on ingest (not on read)

## Shared Infrastructure with P06
ConnectOne provides the device connectivity layer that MachineGuard (P06) builds on top of. The same MQTT broker, device registry, and alert system is shared. Never duplicate — always extend.

## Design Reference
- See `design-pro.html` section #p05
- Dark cyan aesthetic. Network diagram in hero (SVG, not illustration).
- Dashboard: fleet view with device health map, pulse ping for offline devices.
