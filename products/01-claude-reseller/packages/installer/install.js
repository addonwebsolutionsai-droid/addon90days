#!/usr/bin/env node

/**
 * @addonweb/claude-toolkit installer
 *
 * Usage:
 *   npx addonweb-claude-skills@latest install <skill-slug>
 *
 * What it does:
 *   1. Fetches skill data from the Claude Toolkit API
 *   2. Creates a .claude/skills/<slug>.md file in the current directory
 *   3. The .md file registers the skill as a Claude Code slash command
 *   4. Prints usage instructions
 *
 * The generated file follows the Claude Code skill file format so that
 * /skill-slug becomes available as a slash command in Claude Code sessions.
 */

const https = require("https");
const http  = require("http");
const fs    = require("fs");
const path  = require("path");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE = process.env["CLAUDE_TOOLKIT_API"] ?? "https://addon90days.vercel.app";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch JSON from a URL. Returns a Promise resolving to the parsed object.
 * @param {string} url
 * @returns {Promise<unknown>}
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const transport = url.startsWith("https") ? https : http;
    transport.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode === 404) {
          reject(new Error(`Skill not found (404). Check the slug and try again.`));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`API error: HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Failed to parse API response"));
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Format a skill object into a Claude Code skill markdown file.
 * @param {object} skill
 * @returns {string}
 */
function formatSkillFile(skill) {
  // Slash command file format for Claude Code:
  //   - Frontmatter: description (required), argument-hint (optional)
  //   - Body: prompt template Claude executes when user runs /<slug>
  //   - $ARGUMENTS gets replaced with whatever the user typed after /<slug>
  const lines = [];

  // ---------- Frontmatter ----------
  lines.push("---");
  lines.push(`description: ${skill.tagline}`);
  lines.push(`argument-hint: [optional context or inputs]`);
  lines.push("---");
  lines.push("");

  // ---------- Prompt body — instructions to Claude ----------
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
    for (let i = 0; i < skill.steps.length; i++) {
      const step = skill.steps[i];
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
  lines.push(`_Skill: \`${skill.slug}\` · Source: ${API_BASE}/skills/${skill.slug}_`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  // Support both:
  //   npx @addonweb/claude-toolkit install <slug>
  //   npx @addonweb/claude-toolkit <slug>  (direct)
  let slug = args[0] === "install" ? args[1] : args[0];

  if (!slug) {
    console.error("\nUsage: npx addonweb-claude-skills@latest install <skill-slug>\n");
    console.error("Example: npx addonweb-claude-skills@latest install invoice-generator\n");
    process.exit(1);
  }

  // Sanitise slug — alphanumeric + hyphens only
  slug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  if (!slug) {
    console.error("Invalid skill slug. Slugs contain only lowercase letters, numbers, and hyphens.");
    process.exit(1);
  }

  console.log(`\nFetching skill: ${slug}...`);

  let skill;
  try {
    skill = await fetchJson(`${API_BASE}/api/skills/${slug}`);
  } catch (err) {
    console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // Write to .claude/commands/<slug>.md so it becomes a Claude Code slash
  // command. (The .claude/skills/ folder is for Agent Skills which are
  // auto-invoked by Claude based on context, not by typing /<name>.)
  const commandsDir = path.join(process.cwd(), ".claude", "commands");
  try {
    fs.mkdirSync(commandsDir, { recursive: true });
  } catch (err) {
    console.error(`\nFailed to create directory ${commandsDir}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // Write slash command file
  const filePath = path.join(commandsDir, `${slug}.md`);
  const content  = formatSkillFile(skill);
  try {
    fs.writeFileSync(filePath, content, "utf8");
  } catch (err) {
    console.error(`\nFailed to write file ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.log(`\n✓ Skill installed: ${skill.title}`);
  console.log(`  File: .claude/commands/${slug}.md`);
  console.log(`\nHow to use it (do this NOW):\n`);
  console.log(`  Step 1 — Start Claude Code (you'll enter an interactive session):`);
  console.log(`    claude\n`);
  console.log(`  Step 2 — Inside Claude Code's prompt (you'll see a > or ? prompt), type:`);
  console.log(`    /${slug}\n`);
  console.log(`  Note: slash commands ONLY work AFTER you've started 'claude' and see`);
  console.log(`        Claude Code's prompt. Typing /${slug} in your terminal directly`);
  console.log(`        will fail (zsh / bash will look for a file at that path).\n`);
  console.log(`  If "claude: command not found":`);
  console.log(`    curl -fsSL https://claude.ai/install.sh | bash`);
  console.log(`    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc`);
  console.log(`    source ~/.zshrc\n`);
  console.log(`Browse more skills: ${API_BASE}/skills\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
