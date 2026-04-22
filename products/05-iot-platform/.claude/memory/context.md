# P05 · ConnectOne — Session Context

## Current Status
**Phase:** Pre-build  
**Start:** Parallel with P03 (after P01+P02 confirmed)  
**Last Updated:** 2026-04-22

## What's Done
- PRD written and reviewed
- Design system complete (design-pro.html P05 section)
- .claude structure initialized

## What's Next
1. Set up EMQX broker (Docker, Railway deploy)
2. Design TimescaleDB schema for sensor time-series
3. Build Fastify API (device auth, telemetry ingest, alert rules)
4. Build C SDK for ESP32 (founder to review architecture first)
5. Build Next.js dashboard with Supabase Realtime
6. OTA update pipeline
7. Documentation: 5-minute quickstart for ESP32

## Key Decisions
- MQTT broker: Mosquitto for dev, EMQX for production (scales to millions of messages)
- Device auth: X.509 cert per device, issued at registration
- Free tier: 5 devices, 7-day data retention
- Paid: unlimited devices, 90-day raw + forever aggregates
- SDK: single header + single source file (easy drop-in for any ESP32 project)

## Architecture
```
Device (ESP32/STM32) 
  → MQTT (TLS, QoS 1) 
  → EMQX Broker 
  → Fastify Ingest (parse + validate) 
  → TimescaleDB (raw data)
  → Alert Engine (rule evaluation)
  → Notification Service (WhatsApp/SMS/Webhook)
  → Dashboard (WebSocket real-time)
```

## Founder's Firmware Expertise Note
Founder has shipped ESP32 and STM32 firmware commercially. He reviews ALL C/C++ SDK code before merge. Do not merge embedded code without his approval.

## Session Notes
_Add notes here at end of each work session_
