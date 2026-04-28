export { runSkill } from "./utils/runner";
export type { SkillDefinition, SkillMeta, SkillResult } from "./types/skill";

// Business skills
export { invoiceGenerator } from "./skills/invoice-generator";
export { gstCalculator } from "./skills/gst-calculator";
export { emailDrafter } from "./skills/email-drafter";

// Developer skills
export { codeReviewer } from "./skills/code-reviewer";
export { prDescription } from "./skills/pr-description";
export { sqlQueryBuilder } from "./skills/sql-query-builder";
export { testGenerator } from "./skills/test-generator";

// IoT Developer Pack
export { iotFirmwareScaffold } from "./skills/iot-firmware-scaffold";
export { iotDeviceSchema } from "./skills/iot-device-schema";
export { iotOtaPipeline } from "./skills/iot-ota-pipeline";

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
