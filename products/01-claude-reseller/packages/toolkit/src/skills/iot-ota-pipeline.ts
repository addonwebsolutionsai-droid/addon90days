import { z } from "zod";
import type { SkillDefinition } from "../types/skill.js";

const InputSchema = z.object({
  mcu: z.enum(["esp32", "esp32s3", "stm32f4", "stm32h7", "nrf52840"]),
  cloudProvider: z.enum(["aws", "railway", "fly.io", "self-hosted"]).default("railway"),
  storageProvider: z.enum(["s3", "r2", "minio", "supabase-storage"]).default("s3"),
  signingEnabled: z.boolean().default(true),
  rollbackEnabled: z.boolean().default(true),
  deviceCount: z.number().positive().default(100),
  stagingEnabled: z.boolean().default(true),
});

const OutputSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    language: z.string(),
  })),
  deploymentSteps: z.array(z.string()),
  securityNotes: z.array(z.string()),
  rollbackProcedure: z.string(),
  cicdYaml: z.string(),
});

export const iotOtaPipeline: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "iot-ota-pipeline",
    name: "IoT OTA Update Pipeline",
    description: "Generate complete OTA firmware update infrastructure: signed binaries, staged rollouts, automatic rollback, CI/CD pipeline.",
    version: "1.0.0",
    category: "iot",
    tags: ["ota", "firmware", "esp32", "deployment", "ci-cd", "embedded"],
    priceUsd: 49,
    model: "claude-sonnet-4-6",
    estimatedTokens: 4000,
  },
  input: {
    schema: InputSchema,
    example: {
      mcu: "esp32",
      cloudProvider: "railway",
      storageProvider: "s3",
      signingEnabled: true,
      rollbackEnabled: true,
      deviceCount: 500,
      stagingEnabled: true,
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are an embedded systems architect designing production OTA update pipelines.
MANDATORY rules (same as firmware):
- OTA is ATOMIC: device downloads to secondary partition, verifies SHA256 + RSA signature, reboots.
- If boot fails after OTA: automatic rollback to previous good partition. Never leave device bricked.
- Staged rollout: 1% → 10% → 50% → 100% with health check gates between stages.
- Firmware signing: private key NEVER on device. Device has public key embedded at compile time.
- Version management: semantic versioning, downgrade prevention (unless emergency rollback).
Generate: device-side C code (ESP-IDF OTA API), server-side Node.js API routes, GitHub Actions CI/CD, deployment docs.
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Design OTA pipeline for:
MCU: ${input.mcu}
Cloud: ${input.cloudProvider}
Storage: ${input.storageProvider}
Signing: ${input.signingEnabled}
Rollback: ${input.rollbackEnabled}
Fleet size: ${input.deviceCount.toLocaleString()} devices
Staging: ${input.stagingEnabled}

Generate all files and deployment instructions.`,
};
