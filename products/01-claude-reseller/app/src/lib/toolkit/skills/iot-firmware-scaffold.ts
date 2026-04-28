import { z } from "zod";
import type { SkillDefinition } from "../types/skill";

const InputSchema = z.object({
  mcu: z.enum(["esp32", "esp32s3", "stm32f4", "stm32h7", "nrf52840", "rp2040"]),
  connectivity: z.array(z.enum(["mqtt", "http", "ble", "lora", "wifi", "ethernet"])),
  sensors: z.array(z.object({
    type: z.string(),
    interface: z.enum(["i2c", "spi", "uart", "gpio", "adc", "1wire"]),
    library: z.string().optional(),
  })),
  rtos: z.enum(["freertos", "zephyr", "bare-metal"]).default("freertos"),
  powerMode: z.enum(["always-on", "deep-sleep", "light-sleep"]).default("always-on"),
  projectName: z.string(),
  mqttBrokerUrl: z.string().optional(),
  otaEnabled: z.boolean().default(true),
  watchdogEnabled: z.boolean().default(true),
});

const OutputSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    language: z.string(),
  })),
  buildInstructions: z.string(),
  flashInstructions: z.string(),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    source: z.string(),
  })),
  architectureNotes: z.string(),
});

export const iotFirmwareScaffold: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "iot-firmware-scaffold",
    name: "IoT Firmware Scaffold",
    description: "Generate production-ready ESP32/STM32/nRF firmware project skeleton. No malloc. Watchdog mandatory. MQTT QoS1, X.509 auth, atomic OTA.",
    version: "1.0.0",
    category: "iot",
    tags: ["esp32", "stm32", "firmware", "mqtt", "ota", "freertos", "embedded"],
    priceUsd: 49,
    model: "claude-sonnet-4-6",
    estimatedTokens: 4000,
  },
  input: {
    schema: InputSchema,
    example: {
      mcu: "esp32",
      connectivity: ["mqtt", "wifi"],
      sensors: [
        { type: "BME280 temperature/humidity/pressure", interface: "i2c", library: "esp-idf-bme280" },
        { type: "ADXL345 accelerometer", interface: "spi" },
      ],
      rtos: "freertos",
      powerMode: "deep-sleep",
      projectName: "factory-monitor",
      mqttBrokerUrl: "mqtts://broker.addonweb.io:8883",
      otaEnabled: true,
      watchdogEnabled: true,
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are an expert embedded systems engineer with 10+ years of ESP32/STM32/nRF development.
MANDATORY firmware rules — never violate:
1. NO dynamic memory allocation. No malloc/free. Use static arrays and stack only.
2. Watchdog timer MUST be initialized. Never disable.
3. MQTT: QoS 1 for telemetry (guaranteed delivery). QoS 2 for OTA commands.
4. Device auth: X.509 certificates (not API keys).
5. OTA: atomic updates only. Failed update = automatic rollback.
6. Power: respect deep-sleep wake cycles. No unnecessary peripheral wake.
7. All tasks use fixed stack sizes. Define as constants.
8. Error codes returned as enums, not strings.
9. CMakeLists.txt for ESP-IDF / Makefile for bare-metal.
Generate complete, compilable code. No placeholders. Real register addresses, real SDK APIs.
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Generate a production firmware project for:
MCU: ${input.mcu}
Connectivity: ${input.connectivity.join(", ")}
Sensors: ${JSON.stringify(input.sensors)}
RTOS: ${input.rtos}
Power mode: ${input.powerMode}
Project: ${input.projectName}
${input.mqttBrokerUrl ? `MQTT broker: ${input.mqttBrokerUrl}` : ""}
OTA: ${input.otaEnabled ? "yes (with rollback)" : "no"}
Watchdog: ${input.watchdogEnabled ? "yes (mandatory)" : "no"}

Generate all source files, build config, and flash instructions.`,
};
