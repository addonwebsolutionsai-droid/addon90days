/**
 * GET /llms.txt
 *
 * Anthropic / OpenAI / Perplexity crawler hint file. Lists the canonical
 * documentation surfaces in a flat plain-text format so AI assistants
 * can answer "what is SKILOON" without scraping our full marketing pages.
 *
 * Spec: https://llmstxt.org/
 */

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 3600;

const CONTENT = `# SKILOON — AI Skills. Limitless Future.

> 130+ production-ready Claude skills, MCP servers, and agent bundles. Free for the first year — no credit card, no paywall, no usage cap. 1-line install. Ships in minutes.

## What it is

SKILOON is a marketplace of structured prompts ("skills") for Claude Code and Claude Desktop. Each skill is a defined input schema + step-by-step workflow + copy-paste output — not a chatbot conversation, a repeatable production workflow.

- 130 skills across 11 categories (IoT & Hardware, Indian Business, Developer Tools, Trading & Finance, Startup & Product, Data & Analytics, DevOps, UI/UX, Protocols, AI/LLM, Marketing)
- Install via npm: \`npx addonweb-claude-skills install <slug>\`
- Use with Claude Desktop via MCP: add \`https://addon90days.vercel.app/api/skills/mcp\` to mcpServers config and all 130 skills appear as tools
- Try Live: every skill page has an in-browser demo
- Free during beta. Sign-in required to install. No payment.

## Built by

AddonWeb Solutions — a custom dev shop in Ahmedabad, India (10+ years, clients across USA, Canada, Ireland, Dubai). Pivoting to AI-native products. Building 6 SaaS products in 90 days, in public, with 13 Claude subagents.

## Sister products (free during beta)

- ChatBase: WhatsApp AI for Indian SMBs — https://addon90days.vercel.app/chatbase
- TaxPilot: AI GST & invoicing — https://addon90days.vercel.app/taxpilot
- TableFlow: smart restaurant OS — https://addon90days.vercel.app/tableflow
- ConnectOne: IoT plug-and-play platform — https://addon90days.vercel.app/connectone
- MachineGuard: predictive maintenance for industrial machinery — https://addon90days.vercel.app/machineguard

## Canonical surfaces

- Marketplace: https://addon90days.vercel.app/skills
- Sitemap: https://addon90days.vercel.app/sitemap.xml
- MCP server: https://addon90days.vercel.app/api/skills/mcp
- Skills API (read-only): https://addon90days.vercel.app/api/skills
- npm package: https://www.npmjs.com/package/addonweb-claude-skills
- Support: support@addonweb.io

## Tech stack

Next.js 15 · TypeScript strict · Tailwind · shadcn/ui · Supabase (Postgres + RLS) · Clerk auth · Groq Llama 3.3 70B for catalog skills · Anthropic SDK for typed skills · MCP Streamable HTTP · Vercel.
`;

export function GET(): Response {
  return new Response(CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
