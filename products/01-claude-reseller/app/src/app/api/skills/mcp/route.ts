/**
 * MCP Server (Streamable HTTP transport).
 *
 * Each published skill is exposed as both:
 *   - a TOOL  (callable by the LLM via tools/call)
 *   - a RESOURCE (readable raw .md by the LLM via resources/read)
 *
 * Claude Desktop config — works directly:
 *
 *   {
 *     "mcpServers": {
 *       "addonweb-skills": {
 *         "type": "http",
 *         "url": "https://addon90days.vercel.app/api/skills/mcp"
 *       }
 *     }
 *   }
 *
 * Or via the mcp-remote proxy (works with any client that only supports stdio):
 *
 *   {
 *     "mcpServers": {
 *       "addonweb-skills": {
 *         "command": "npx",
 *         "args": ["-y", "mcp-remote", "https://addon90days.vercel.app/api/skills/mcp"]
 *       }
 *     }
 *   }
 *
 * Spec reference: https://spec.modelcontextprotocol.io/
 */

import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Skill, SkillStep } from "@/lib/database.types";
import { SITE_BASE_URL } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_NAME      = "addonweb-skills";
const SERVER_VERSION   = "1.0.0";

// ---------------------------------------------------------------------------
// JSON-RPC types
// ---------------------------------------------------------------------------

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: string | number | null; result: unknown }
  | { jsonrpc: "2.0"; id: string | number | null; error: { code: number; message: string; data?: unknown } };

// ---------------------------------------------------------------------------
// Skill ↔ tool name conversion
// ---------------------------------------------------------------------------

// MCP tool names allow [a-zA-Z0-9_-]. We keep slug → tool name as-is (slugs are already kebab-case).
function slugToToolName(slug: string): string { return slug; }
function toolNameToSlug(name: string): string { return name; }

// ---------------------------------------------------------------------------
// Skill cache (per cold start)
// ---------------------------------------------------------------------------

let _skillsCache: Skill[] | null = null;
let _skillsCacheAt = 0;
const CACHE_TTL_MS = 60_000;

async function getAllSkills(): Promise<Skill[]> {
  const now = Date.now();
  if (_skillsCache !== null && now - _skillsCacheAt < CACHE_TTL_MS) {
    return _skillsCache;
  }
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("published", true)
    .order("trending_score", { ascending: false })
    .limit(500);
  if (error !== null) throw new Error(`DB error: ${error.message}`);
  _skillsCache   = (data ?? []) as Skill[];
  _skillsCacheAt = now;
  return _skillsCache;
}

async function getSkillBySlug(slug: string): Promise<Skill | null> {
  // Try cache first
  if (_skillsCache !== null) {
    const hit = _skillsCache.find((s) => s.slug === slug);
    if (hit) return hit;
  }
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as Skill | null) ?? null;
}

// ---------------------------------------------------------------------------
// Tool / resource builders
// ---------------------------------------------------------------------------

function skillToTool(skill: Skill) {
  return {
    name:        slugToToolName(skill.slug),
    description: `${skill.tagline} — Category: ${skill.category}. Skill provides a step-by-step workflow.`,
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: `Optional context / inputs / data for the ${skill.title} skill. Leave blank if you just want the workflow returned.`,
        },
      },
      required: [],
    },
  };
}

function skillToResource(skill: Skill, baseUrl: string) {
  return {
    uri:         `addonweb-skill://${skill.slug}`,
    name:        skill.title,
    description: skill.tagline,
    mimeType:    "text/markdown",
    _meta: {
      category:   skill.category,
      difficulty: skill.difficulty,
      source_url: `${baseUrl}/skills/${skill.slug}`,
    },
  };
}

function buildSkillWorkflow(skill: Skill, userInput: string): string {
  const lines: string[] = [];
  lines.push(`# ${skill.title}`);
  lines.push("");
  lines.push(skill.description);
  lines.push("");
  if (userInput.trim().length > 0) {
    lines.push("## User input");
    lines.push("");
    lines.push(userInput);
    lines.push("");
  }
  lines.push("## Workflow");
  lines.push("");
  lines.push("Follow these steps in order. Ask the user for any missing inputs before proceeding.");
  lines.push("");
  if (Array.isArray(skill.steps) && skill.steps.length > 0) {
    for (let i = 0; i < (skill.steps as SkillStep[]).length; i++) {
      const step    = (skill.steps as SkillStep[])[i]!;
      const stepNum = step.number ?? i + 1;
      lines.push(`### Step ${stepNum}: ${step.title}`);
      lines.push("");
      if (step.description) { lines.push(step.description); lines.push(""); }
      if (step.code) {
        const lang = step.language ?? "";
        lines.push("```" + lang);
        lines.push(step.code);
        lines.push("```");
        lines.push("");
      }
    }
  }
  lines.push("---");
  lines.push(`_Skill: \`${skill.slug}\` · Source: ${SITE_BASE_URL}/skills/${skill.slug}_`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// JSON-RPC dispatcher
// ---------------------------------------------------------------------------

async function handleRpc(req: JsonRpcRequest, baseUrl: string): Promise<JsonRpcResponse | null> {
  const id = req.id ?? null;

  // Notifications (no id) don't need a response — return null to indicate.
  const isNotification = req.id === undefined || req.id === null;

  try {
    switch (req.method) {
      // ---- Lifecycle ----
      case "initialize": {
        return {
          jsonrpc: "2.0", id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: {
              tools:     { listChanged: false },
              resources: { listChanged: false, subscribe: false },
              logging:   {},
            },
            serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
            instructions: "This server exposes the SKILON catalog (130+ Claude skills, by AddonWeb) as MCP tools. Each tool returns a step-by-step workflow Claude follows to do the work. Tool name = skill slug (kebab-case).",
          },
        };
      }

      case "notifications/initialized":
      case "notifications/cancelled":
      case "notifications/progress":
      case "notifications/roots/list_changed": {
        // Notifications — no response.
        return null;
      }

      case "ping": {
        return { jsonrpc: "2.0", id, result: {} };
      }

      // ---- Tools ----
      case "tools/list": {
        const skills = await getAllSkills();
        return {
          jsonrpc: "2.0", id,
          result: { tools: skills.map(skillToTool) },
        };
      }

      case "tools/call": {
        const params = (req.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
        const toolName = params.name;
        if (typeof toolName !== "string" || toolName.length === 0) {
          return jsonRpcError(id, -32602, "Missing tool name");
        }
        const slug = toolNameToSlug(toolName);
        const skill = await getSkillBySlug(slug);
        if (skill === null) {
          return jsonRpcError(id, -32602, `Tool "${toolName}" not found`);
        }
        const userInput = typeof params.arguments?.["input"] === "string"
          ? (params.arguments["input"] as string)
          : "";
        const workflow = buildSkillWorkflow(skill, userInput);
        return {
          jsonrpc: "2.0", id,
          result: {
            content: [{ type: "text", text: workflow }],
            isError: false,
          },
        };
      }

      // ---- Resources ----
      case "resources/list": {
        const skills = await getAllSkills();
        return {
          jsonrpc: "2.0", id,
          result: { resources: skills.map((s) => skillToResource(s, baseUrl)) },
        };
      }

      case "resources/read": {
        const params = (req.params ?? {}) as { uri?: string };
        const uri = params.uri;
        if (typeof uri !== "string") return jsonRpcError(id, -32602, "Missing uri");
        const match = uri.match(/^addonweb-skill:\/\/(.+)$/);
        if (!match) return jsonRpcError(id, -32602, `Invalid uri scheme: ${uri}`);
        const skill = await getSkillBySlug(match[1]!);
        if (skill === null) return jsonRpcError(id, -32602, `Resource not found: ${uri}`);
        return {
          jsonrpc: "2.0", id,
          result: {
            contents: [{
              uri,
              mimeType: "text/markdown",
              text:     buildSkillWorkflow(skill, ""),
            }],
          },
        };
      }

      // ---- Prompts (none) ----
      case "prompts/list": {
        return { jsonrpc: "2.0", id, result: { prompts: [] } };
      }

      // ---- Unknown method ----
      default: {
        if (isNotification) return null;
        return jsonRpcError(id, -32601, `Method not found: ${req.method}`);
      }
    }
  } catch (err) {
    if (isNotification) return null;
    const message = err instanceof Error ? err.message : String(err);
    return jsonRpcError(id, -32603, `Internal error: ${message}`);
  }
}

function jsonRpcError(id: string | number | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return jsonRpcHttpError(null, -32700, "Parse error: invalid JSON"); }

  const baseUrl = SITE_BASE_URL;

  // Single request OR batch
  const requests: JsonRpcRequest[] = Array.isArray(body) ? body as JsonRpcRequest[] : [body as JsonRpcRequest];

  // Validate at least the basic shape
  for (const r of requests) {
    if (!r || typeof r !== "object" || r.jsonrpc !== "2.0" || typeof r.method !== "string") {
      return jsonRpcHttpError((r as JsonRpcRequest)?.id ?? null, -32600, "Invalid Request");
    }
  }

  const responses = await Promise.all(requests.map((r) => handleRpc(r, baseUrl)));
  const realResponses = responses.filter((x): x is JsonRpcResponse => x !== null);

  // All-notifications: return 202 Accepted with empty body
  if (realResponses.length === 0) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  const payload = Array.isArray(body) ? realResponses : realResponses[0];
  return Response.json(payload, {
    status: 200,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

// GET returns server info — useful for "is this an MCP server?" probes.
export async function GET() {
  return Response.json(
    {
      name:            SERVER_NAME,
      version:         SERVER_VERSION,
      protocolVersion: PROTOCOL_VERSION,
      transport:       "streamable-http",
      description:     "SKILON MCP server (by AddonWeb). POST JSON-RPC 2.0 messages to this URL.",
      docs:            `${SITE_BASE_URL}/skills`,
    },
    { headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=60" } }
  );
}

function jsonRpcHttpError(id: string | number | null, code: number, message: string) {
  return Response.json(jsonRpcError(id, code, message), {
    status: 200,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}
