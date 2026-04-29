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
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
  const lines: string[] = [];

  // ---- Frontmatter — Claude Code uses this to register the slash command ----
  lines.push("---");
  lines.push(`description: ${skill.tagline}`);
  lines.push(`argument-hint: [optional context or inputs]`);
  lines.push("---");
  lines.push("");

  // ---- Prompt body — instructions to Claude when /<slug> is invoked ----
  lines.push(`# ${skill.title}`);
  lines.push("");
  lines.push(`You are executing the **${skill.title}** skill.`);
  lines.push("");
  lines.push(skill.description);
  lines.push("");

  if (skill.tags && skill.tags.length > 0) {
    lines.push(`**Tags:** ${skill.tags.join(", ")}`);
    lines.push("");
  }

  lines.push("## Workflow");
  lines.push("");
  lines.push("Follow these steps in order. If the user provided arguments via `$ARGUMENTS`,");
  lines.push("use them as context. If any required input is missing, ask the user for it");
  lines.push("before proceeding.");
  lines.push("");
  lines.push("**User-provided arguments:** $ARGUMENTS");
  lines.push("");

  if (Array.isArray(skill.steps) && skill.steps.length > 0) {
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
  } else {
    lines.push("_(No detailed steps provided — use your best judgment based on the description above.)_");
    lines.push("");
  }

  lines.push("## Output expectations");
  lines.push("");
  lines.push("- Confirm each step before moving to the next when state-changing operations are involved.");
  lines.push("- Show the user a summary at the end.");
  lines.push("- If you need permissions or tools that aren't available, stop and ask.");
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("<!-- ============================================================ -->");
  lines.push("<!-- HOW TO USE THIS FILE (you're reading this in a text editor)  -->");
  lines.push("<!-- ============================================================ -->");
  lines.push("<!--                                                                -->");
  lines.push("<!-- This is a Claude Code SLASH COMMAND. Three steps:             -->");
  lines.push("<!--                                                                -->");
  lines.push("<!-- STEP 1 — Move this file into your project's .claude/commands/-->");
  lines.push("<!--                                                                -->");
  lines.push("<!--   macOS / Linux:                                               -->");
  lines.push(`<!--     mkdir -p .claude/commands && mv ~/Downloads/${skill.slug}.md .claude/commands/ -->`);
  lines.push("<!--                                                                -->");
  lines.push("<!--   Windows PowerShell:                                          -->");
  lines.push(`<!--     New-Item -ItemType Directory -Force .claude/commands; Move-Item $HOME/Downloads/${skill.slug}.md .claude/commands/ -->`);
  lines.push("<!--                                                                -->");
  lines.push("<!-- STEP 2 — Start Claude Code (interactive session)              -->");
  lines.push("<!--                                                                -->");
  lines.push("<!--   In your terminal, type:                                      -->");
  lines.push("<!--     claude                                                     -->");
  lines.push("<!--                                                                -->");
  lines.push("<!--   You'll see a NEW prompt like '> ' or '? ' — that's Claude   -->");
  lines.push("<!--   Code itself. Slash commands work ONLY here, not in zsh/bash.-->");
  lines.push("<!--                                                                -->");
  lines.push(`<!-- STEP 3 — Inside Claude Code, type:  /${skill.slug}            -->`);
  lines.push("<!--                                                                -->");
  lines.push("<!-- ─────────────────────────────────────────────────────────── -->");
  lines.push("<!-- IF claude: command not found                                  -->");
  lines.push("<!--                                                                -->");
  lines.push("<!--   curl -fsSL https://claude.ai/install.sh | bash              -->");
  lines.push("<!--   echo 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ~/.zshrc    -->");
  lines.push("<!--   source ~/.zshrc                                              -->");
  lines.push("<!--                                                                -->");
  lines.push("<!-- ─────────────────────────────────────────────────────────── -->");
  lines.push("<!-- ONE-COMMAND ALTERNATIVE (skips manual move):                  -->");
  lines.push(`<!--    npx addonweb-claude-skills install ${skill.slug}           -->`);
  lines.push("<!-- ============================================================ -->");
  lines.push("");
  lines.push(`_Skill: \`${skill.slug}\` · Source: ${appUrl}/skills/${skill.slug}_`);

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
