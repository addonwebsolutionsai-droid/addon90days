/**
 * GET /llms.txt
 *
 * Anthropic / OpenAI / Perplexity crawler hint file. Lists the canonical
 * documentation surfaces in a flat plain-text format so AI assistants
 * can answer "what is SKILON" without scraping our full marketing pages.
 *
 * Spec: https://llmstxt.org/
 */

import { SITE_BASE_URL } from "@/lib/site-config";
import { getCatalogTotal, formatSkillCount } from "@/lib/catalog-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 1800;

function buildContent(total: number, label: string): string {
  return `# SKILON — AI Skills. Limitless Future.

> ${label} production-ready Claude skills, MCP servers, and agent bundles. Free for the first year — no credit card, no paywall, no usage cap. 1-line install. Ships in minutes.

## What it is

SKILON is a marketplace of structured prompts ("skills") for Claude Code and Claude Desktop. Each skill is a defined input schema + step-by-step workflow + copy-paste output — not a chatbot conversation, a repeatable production workflow.

- ${total} skills across 11 categories (IoT & Hardware, Indian Business, Developer Tools, Trading & Finance, Startup & Product, Data & Analytics, DevOps, UI/UX, Protocols, AI/LLM, Marketing)
- Install via npm: \`npx addonweb-claude-skills install <slug>\`
- Use with Claude Desktop via MCP: add \`${SITE_BASE_URL}/api/skills/mcp\` to mcpServers config and all ${total} skills appear as tools
- Try Live: every skill page has an in-browser demo
- Free for the first year. Sign-in required to install. No payment.

## Built by

AddonWeb Solutions — a custom dev shop in Ahmedabad, India (10+ years, clients across USA, Canada, Ireland, Dubai). Pivoting to AI-native products. Building 6 SaaS products in 90 days, in public, with 13 Claude subagents.

## Sister products (free during beta)

- ChatBase: WhatsApp AI for Indian SMBs — ${SITE_BASE_URL}/chatbase
- TaxPilot: AI GST & invoicing — ${SITE_BASE_URL}/taxpilot
- TableFlow: smart restaurant OS — ${SITE_BASE_URL}/tableflow
- ConnectOne: IoT plug-and-play platform — ${SITE_BASE_URL}/connectone
- MachineGuard: predictive maintenance for industrial machinery — ${SITE_BASE_URL}/machineguard

## Canonical surfaces

- Marketplace: ${SITE_BASE_URL}/skills
- Sitemap: ${SITE_BASE_URL}/sitemap.xml
- MCP server: ${SITE_BASE_URL}/api/skills/mcp
- Skills API (read-only): ${SITE_BASE_URL}/api/skills
- npm package: https://www.npmjs.com/package/addonweb-claude-skills
- Support: support@addonweb.io

## Tech stack

Next.js 15 · TypeScript strict · Tailwind · shadcn/ui · Supabase (Postgres + RLS) · Clerk auth · Groq Llama 3.3 70B for catalog skills · Anthropic SDK for typed skills · MCP Streamable HTTP · Vercel.
`;
}

export async function GET(): Promise<Response> {
  const total = await getCatalogTotal();
  const label = formatSkillCount(total);
  return new Response(buildContent(total, label), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
