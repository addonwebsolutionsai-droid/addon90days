/**
 * GET /api/skills/:slug/install
 *
 * Returns the Claude Code skill definition as a downloadable .md file.
 *
 * During public beta:
 *   - All skills free
 *   - Sign-in required (Clerk) so we capture the user before unlocking the file
 *   - Each install logged to skill_installs for analytics
 */

import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Skill, SkillStep } from "@/lib/database.types";

function buildSkillMarkdown(skill: Skill): string {
  const lines: string[] = [];

  // ---- Frontmatter (Claude Code reads this to register the slash command) ----
  lines.push("---");
  lines.push(`name: ${skill.slug}`);
  lines.push(`description: ${skill.tagline}`);
  lines.push("---");
  lines.push("");

  // ---- LAYMAN INSTRUCTIONS — first thing the user sees ----
  lines.push("<!-- ============================================================ -->");
  lines.push("<!-- HOW TO USE THIS FILE                                          -->");
  lines.push("<!-- ============================================================ -->");
  lines.push("<!--                                                                -->");
  lines.push("<!-- You just downloaded a Claude Code Skill. Follow these 3 steps:-->");
  lines.push("<!--                                                                -->");
  lines.push("<!-- STEP 1 — Move this file into your project's .claude folder    -->");
  lines.push("<!--                                                                -->");
  lines.push("<!--   On macOS / Linux, open Terminal and run:                    -->");
  lines.push(`<!--     mkdir -p .claude/skills && mv ~/Downloads/${skill.slug}.md .claude/skills/ -->`);
  lines.push("<!--                                                                -->");
  lines.push("<!--   On Windows (PowerShell):                                    -->");
  lines.push(`<!--     New-Item -ItemType Directory -Force .claude/skills; Move-Item $HOME/Downloads/${skill.slug}.md .claude/skills/ -->`);
  lines.push("<!--                                                                -->");
  lines.push("<!-- STEP 2 — Open Claude Code in that project folder              -->");
  lines.push("<!--                                                                -->");
  lines.push("<!--   Run: claude                                                  -->");
  lines.push("<!--   (Claude Code automatically picks up files in .claude/skills)-->");
  lines.push("<!--                                                                -->");
  lines.push(`<!-- STEP 3 — Type the slash command:  /${skill.slug}              -->`);
  lines.push("<!--                                                                -->");
  lines.push("<!-- That's it. Claude will follow the steps below to do the job.  -->");
  lines.push("<!--                                                                -->");
  lines.push("<!-- ─────────────────────────────────────────────────────────── -->");
  lines.push("<!--  SHORTCUT — skip the manual move:                            -->");
  lines.push(`<!--    npx addonweb-claude-skills install ${skill.slug}          -->`);
  lines.push("<!--  (one command — auto-creates folder, drops the file in.)    -->");
  lines.push("<!-- ============================================================ -->");
  lines.push("");

  lines.push("# " + skill.title);
  lines.push("");
  lines.push(skill.description);
  lines.push("");

  if (Array.isArray(skill.steps) && skill.steps.length > 0) {
    lines.push("## What this skill will do for you");
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
  lines.push("");
  lines.push("**Need help?** Visit " + appUrl + "/skills/" + skill.slug + " for the full guide,");
  lines.push("or email support@addonweb.io.");
  lines.push("");
  lines.push(`_Installed from AddonWeb Claude Toolkit · ${appUrl}_`);

  return lines.join("\n");
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const { userId } = await auth();
  if (userId === null) {
    const url = new URL(req.url);
    const redirect = `/sign-in?redirect_url=${encodeURIComponent(`/skills/${slug}`)}`;
    return Response.redirect(new URL(redirect, url.origin), 302);
  }

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

  const skill = data as Skill;
  const markdown = buildSkillMarkdown(skill);

  // Best-effort: log install + bump counter. Never block the download on failure.
  void supabaseAdmin
    .from("skill_installs")
    .insert({
      skill_id: skill.id,
      slug: skill.slug,
      user_id: userId,
      source: "web",
    })
    .then(() => undefined);

  void supabaseAdmin.rpc("increment_skill_install", { skill_slug: skill.slug });

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
