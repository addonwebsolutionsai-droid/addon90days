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
  const lines = [];

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
  }

  lines.push("---");
  lines.push(`*Installed from Claude Toolkit — ${API_BASE}/skills/${skill.slug}*`);

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

  // Create .claude/skills/ directory in cwd
  const skillsDir = path.join(process.cwd(), ".claude", "skills");
  try {
    fs.mkdirSync(skillsDir, { recursive: true });
  } catch (err) {
    console.error(`\nFailed to create directory ${skillsDir}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // Write skill file
  const filePath = path.join(skillsDir, `${slug}.md`);
  const content  = formatSkillFile(skill);
  try {
    fs.writeFileSync(filePath, content, "utf8");
  } catch (err) {
    console.error(`\nFailed to write file ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.log(`\nSkill installed: ${skill.title}`);
  console.log(`File: .claude/skills/${slug}.md`);
  console.log(`\nHow to use in Claude Code:`);
  console.log(`  /${slug}`);
  console.log(`\nOr reference it in your CLAUDE.md:`);
  console.log(`  @.claude/skills/${slug}.md`);
  console.log(`\nBrowse more skills: ${API_BASE}/skills\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
