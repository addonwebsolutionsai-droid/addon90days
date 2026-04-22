export { runSkill } from "./utils/runner.js";
export type { SkillDefinition, SkillMeta, SkillResult } from "./types/skill.js";

// Business skills
export { invoiceGenerator } from "./skills/invoice-generator.js";
export { gstCalculator } from "./skills/gst-calculator.js";
export { emailDrafter } from "./skills/email-drafter.js";

// Developer skills
export { codeReviewer } from "./skills/code-reviewer.js";
export { prDescription } from "./skills/pr-description.js";
export { sqlQueryBuilder } from "./skills/sql-query-builder.js";
export { testGenerator } from "./skills/test-generator.js";

// IoT Developer Pack
export { iotFirmwareScaffold } from "./skills/iot-firmware-scaffold.js";
export { iotDeviceSchema } from "./skills/iot-device-schema.js";
export { iotOtaPipeline } from "./skills/iot-ota-pipeline.js";

export const SKILL_PACKS = {
  iotDeveloper: {
    id: "iot-developer-pack",
    name: "IoT Developer Pack",
    priceUsd: 49,
    skills: ["iot-firmware-scaffold", "iot-device-registry-schema", "iot-ota-pipeline"],
    description: "3 production-grade skills for ESP32/STM32 projects: firmware scaffold, DB schema, and OTA pipeline.",
  },
  developerProductivity: {
    id: "developer-productivity-pack",
    name: "Developer Productivity Pack",
    priceUsd: 29,
    skills: ["code-reviewer", "pr-description", "sql-query-builder", "test-generator"],
    description: "4 skills to ship faster: code review, PR descriptions, SQL from plain English, and test generation.",
  },
  smbOperations: {
    id: "smb-operations-pack",
    name: "SMB Operations Pack",
    priceUsd: 29,
    skills: ["invoice-generator", "gst-calculator", "email-drafter"],
    description: "3 skills for Indian SMBs: GST-compliant invoices, tax calculations, and professional email drafting.",
  },
} as const;
