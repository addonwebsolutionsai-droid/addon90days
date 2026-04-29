/**
 * GET /api/skills/:slug/install
 *
 * Returns the Claude Code skill definition as a downloadable .md file.
 * The installer CLI fetches JSON via /api/skills/:slug — this endpoint
 * is for browsers/tools that want the file directly.
 *
 * Content-Type:        text/markdown
 * Content-Disposition: attachment; filename="<slug>.md"
 */

import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Skill, SkillStep } from "@/lib/database.types";

function buildSkillMarkdown(skill: Skill): string {
  const lines: string[] = [];

  lines.push("---");
  lines.push(`name: ${skill.slug}`);
  lines.push(`description: ${skill.tagline}`);
  lines.push("---");
  lines.push("");
  lines.push(skill.description);
  lines.push("");

  if (Array.isArray(skill.steps) && skill.steps.length > 0) {
    lines.push("## Steps");
    lines.push("");

    for (let i = 0; i < (skill.steps as SkillStep[]).length; i++) {
      const step = (skill.steps as SkillStep[])[i]!;
      const stepNum = step.number ?? i + 1;
      lines.push(`### Step ${stepNum}: ${step.title}`);
      lines.push("");
      if (step.description) {
        lines.push(step.description);
        lines.push("");
      }
      if (step.code) {
        const lang = step.language ?? "";
        lines.push("```" + lang);
        lines.push(step.code);
        lines.push("```");
        lines.push("");
      }
    }
  }

  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
  lines.push("---");
  lines.push(`*Installed from Claude Toolkit — ${appUrl}/skills/${skill.slug}*`);

  return lines.join("\n");
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error !== null || data === null) {
    return new Response(
      JSON.stringify({ error: { code: "NOT_FOUND", message: "Skill not found" } }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const markdown = buildSkillMarkdown(data as Skill);

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.md"`,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
