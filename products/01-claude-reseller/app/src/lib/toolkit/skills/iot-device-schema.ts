import { z } from "zod";
import type { SkillDefinition } from "../types/skill";

const InputSchema = z.object({
  deviceTypes: z.array(z.object({
    name: z.string(),
    sensors: z.array(z.string()),
    telemetryIntervalSecs: z.number().positive(),
  })),
  scaleDevices: z.number().positive().default(1000),
  retentionPolicy: z.object({
    rawDays: z.number().default(7),
    hourlyDays: z.number().default(90),
    dailyForever: z.boolean().default(true),
  }),
  db: z.enum(["timescaledb", "postgresql", "influxdb", "mongodb"]).default("timescaledb"),
  multiTenant: z.boolean().default(true),
});

const OutputSchema = z.object({
  schemaSql: z.string(),
  migrationSql: z.string(),
  indexesSql: z.string(),
  retentionPolicySql: z.string(),
  sampleQueries: z.array(z.object({
    description: z.string(),
    sql: z.string(),
  })),
  entityDiagram: z.string(),
  scalingNotes: z.string(),
});

export const iotDeviceSchema: SkillDefinition<typeof InputSchema, typeof OutputSchema> = {
  meta: {
    id: "iot-device-registry-schema",
    name: "IoT Device Registry Schema",
    description: "Generate TimescaleDB/PostgreSQL schema for IoT device registry, telemetry time-series, alert rules, and OTA tracking at scale.",
    version: "1.0.0",
    category: "iot",
    tags: ["timescaledb", "postgresql", "schema", "iot", "time-series", "migration"],
    priceUsd: 49,
    model: "claude-sonnet-4-6",
    estimatedTokens: 3000,
  },
  input: {
    schema: InputSchema,
    example: {
      deviceTypes: [
        { name: "vibration-sensor", sensors: ["accel_x", "accel_y", "accel_z", "temperature"], telemetryIntervalSecs: 1 },
        { name: "power-meter", sensors: ["current_a", "current_b", "current_c", "voltage", "power_kw"], telemetryIntervalSecs: 5 },
      ],
      scaleDevices: 10000,
      retentionPolicy: { rawDays: 7, hourlyDays: 90, dailyForever: true },
      db: "timescaledb",
      multiTenant: true,
    },
  },
  output: { schema: OutputSchema },
  systemPrompt: `You are a database architect specializing in time-series IoT data at scale.
Generate production-ready TimescaleDB schema with:
- devices table (id, org_id, type, name, firmware_version, last_seen, status, cert_thumbprint)
- telemetry hypertable (device_id, time, metric, value) with chunk_time_interval = 1 day
- alert_rules table (device_id, metric, operator, threshold, severity, notification_config jsonb)
- ota_jobs table (device_id, firmware_url, checksum, status, scheduled_at, completed_at)
- org_id on every table for multi-tenancy with Row Level Security
- TimescaleDB continuous aggregates for hourly and daily rollups
- Proper BRIN indexes on time, B-tree on device_id
- retention policies via add_retention_policy()
Respond with JSON in \`\`\`json ... \`\`\` blocks.`,
  buildUserPrompt: (input) => `Generate IoT schema for:
Device types: ${JSON.stringify(input.deviceTypes)}
Scale: ${input.scaleDevices.toLocaleString()} devices
Retention: ${input.retentionPolicy.rawDays}d raw / ${input.retentionPolicy.hourlyDays}d hourly / daily forever
Database: ${input.db}
Multi-tenant: ${input.multiTenant}

Include schema SQL, migration, indexes, retention policies, and 5 common query examples.`,
};
