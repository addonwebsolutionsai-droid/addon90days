#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  runSkill,
  invoiceGenerator,
  gstCalculator,
  codeReviewer,
  prDescription,
  iotFirmwareScaffold,
  iotDeviceSchema,
} from "@addonweb/claude-toolkit";

const ALL_SKILLS = [
  invoiceGenerator,
  gstCalculator,
  codeReviewer,
  prDescription,
  iotFirmwareScaffold,
  iotDeviceSchema,
] as const;

const server = new Server(
  { name: "addonweb-toolkit", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: ALL_SKILLS.map((skill) => ({
    name: skill.meta.id,
    description: skill.meta.description,
    inputSchema: {
      type: "object" as const,
      description: `Input for ${skill.meta.name}. See @addonweb/claude-toolkit docs for full schema.`,
    },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const skill = ALL_SKILLS.find((s) => s.meta.id === request.params.name);
  if (!skill) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
      isError: true,
    };
  }

  const result = await runSkill(skill, request.params.arguments);

  if (!result.success) {
    return {
      content: [{ type: "text", text: `Error (${result.code}): ${result.error}` }],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result.data, null, 2),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
