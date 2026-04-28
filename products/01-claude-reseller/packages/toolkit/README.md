# @addonweb/claude-toolkit

Production-ready Claude Skills, MCP servers, and agent packs — built by practitioners who run a 13-agent AI company.

## Install

```bash
npm install @addonweb/claude-toolkit
```

Requires `GEMINI_API_KEY` in your environment (free at [aistudio.google.com](https://aistudio.google.com)).

## Quick start

```ts
import { invoiceGenerator, runSkill } from "@addonweb/claude-toolkit";

const result = await runSkill(invoiceGenerator, {
  sellerName: "AddonWeb Solutions",
  sellerAddress: "Ahmedabad, Gujarat 380001",
  sellerGstin: "24AABCA1234A1Z5",
  buyerName: "Acme Corp",
  buyerAddress: "Mumbai, Maharashtra 400001",
  invoiceNumber: "INV-2026-001",
  invoiceDate: "2026-05-01",
  lineItems: [
    { description: "Software License", quantity: 1, unit: "Nos", ratePerUnit: 50000, gstRate: 18 },
  ],
  currency: "INR",
});

if (result.success) {
  console.log(result.data.summary);
  // { subtotal: 50000, totalGst: 9000, totalAmount: 59000, currency: "INR", lineCount: 1 }
}
```

## Skill packs

### IoT Developer Pack — $49

| Skill | What it does |
|---|---|
| `iot-firmware-scaffold` | ESP32/STM32/nRF firmware skeleton — no malloc, watchdog mandatory, MQTT QoS1, X.509 auth |
| `iot-device-registry-schema` | TimescaleDB schema for device fleet — multi-tenant, retention policies, continuous aggregates |
| `iot-ota-pipeline` | Atomic OTA with staged rollout (1%→10%→50%→100%), auto-rollback, signed binaries, CI/CD |

### Developer Productivity Pack — $29

| Skill | What it does |
|---|---|
| `code-reviewer` | Deep code review — OWASP security scan, performance, TypeScript strictness, score 0–100 |
| `pr-description` | PR descriptions from git diffs — summary, test plan, breaking changes |
| `sql-query-builder` | Natural language → optimized SQL, schema-aware, flags N+1 and injection risks |
| `test-generator` | Generate Jest/Vitest/pytest test suites from source code — happy path + edge cases |

### SMB Operations Pack — $29

| Skill | What it does |
|---|---|
| `invoice-generator` | GST-compliant HTML invoices — CGST/SGST/IGST, HSN codes, UPI QR placeholder |
| `gst-calculator` | Accurate CGST/SGST/IGST split — intra/inter-state, B2B/B2C, composition scheme, reverse charge |
| `email-drafter` | Professional emails — cold outreach, proposals, follow-ups, 7 types, 4 tone modes |

## Use in Claude Code (MCP)

Add to your Claude Code config (`~/.claude.json`):

```json
{
  "mcpServers": {
    "addonweb": {
      "command": "npx",
      "args": ["-y", "@addonweb/claude-toolkit-mcp"],
      "env": { "GEMINI_API_KEY": "your-key-here" }
    }
  }
}
```

Then in any Claude Code session: `Use the invoice-generator skill to create an invoice for...`

## Run a skill via API

```ts
import { runSkill, codeReviewer } from "@addonweb/claude-toolkit";

const result = await runSkill(codeReviewer, {
  code: `async function getUser(id) {
  const result = await db.query('SELECT * FROM users WHERE id = ' + id);
  return result.rows[0];
}`,
  language: "javascript",
  focusAreas: ["security", "bugs"],
  severity: "important",
});

if (result.success) {
  console.log(`Score: ${result.data.score}/100`);
  console.log(`Issues: ${result.data.issues.length}`);
  result.data.issues.forEach(i => console.log(`[${i.severity}] ${i.description}`));
}
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Free at aistudio.google.com — 1,500 req/day free |

## All exports

```ts
// Runner
import { runSkill } from "@addonweb/claude-toolkit";

// Skills
import {
  invoiceGenerator,    // business
  gstCalculator,       // finance
  emailDrafter,        // business
  codeReviewer,        // developer
  prDescription,       // developer
  sqlQueryBuilder,     // developer
  testGenerator,       // developer
  iotFirmwareScaffold, // iot
  iotDeviceSchema,     // iot
  iotOtaPipeline,      // iot
} from "@addonweb/claude-toolkit";

// Pack registry
import { SKILL_PACKS } from "@addonweb/claude-toolkit";

// Types
import type { SkillDefinition, SkillResult, SkillMeta } from "@addonweb/claude-toolkit";
```

## License

MIT — © 2026 AddonWeb Solutions
