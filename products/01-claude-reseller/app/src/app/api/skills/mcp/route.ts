/**
 * GET /api/skills/mcp
 *
 * Returns an MCP (Model Context Protocol) server manifest listing all
 * published skills as tools. This allows Claude Desktop and Claude Code
 * to connect to our skills catalog as an MCP server.
 *
 * MCP tool schema reference:
 *   https://modelcontextprotocol.io/docs/concepts/tools
 *
 * Each skill becomes an MCP tool with:
 *   name        — skill.slug (snake_case converted to match MCP convention)
 *   description — skill.tagline
 *   inputSchema — minimal JSON Schema asking for a "context" string
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Skill } from "@/lib/database.types";

// MCP tool input schema — all skills accept a context string as input.
// Individual skills can be enhanced with richer schemas in future.
const BASE_INPUT_SCHEMA = {
  type: "object",
  properties: {
    context: {
      type: "string",
      description: "The context, data, or request to process with this skill.",
    },
  },
  required: ["context"],
} as const;

function slugToToolName(slug: string): string {
  // MCP tool names: lowercase, underscores, no hyphens
  return slug.replace(/-/g, "_");
}

export async function GET() {
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";

  const { data, error } = await supabase
    .from("skills")
    .select("slug, title, tagline, category, description")
    .eq("published", true)
    .order("trending_score", { ascending: false })
    .limit(500);

  if (error !== null) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  const skills = (data ?? []) as Pick<Skill, "slug" | "title" | "tagline" | "category" | "description">[];

  const tools = skills.map((skill) => ({
    name:        slugToToolName(skill.slug),
    description: `[${skill.category}] ${skill.tagline}`,
    inputSchema: BASE_INPUT_SCHEMA,
  }));

  // MCP server manifest
  const manifest = {
    schema_version: "v1",
    name:           "Claude Toolkit",
    description:    "Production-ready Claude skills across IoT, trading, developer tools, and more. Built by AddonWeb Solutions.",
    version:        "1.0.0",
    homepage:       appUrl,
    tools,
    // Resources listing — one resource per skill (the install .md)
    resources: skills.map((skill) => ({
      uri:         `${appUrl}/api/skills/${skill.slug}/install`,
      name:        skill.title,
      description: skill.tagline,
      mimeType:    "text/markdown",
    })),
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
