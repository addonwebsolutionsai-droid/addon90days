#!/usr/bin/env node
/**
 * fix-skill-descriptions.js
 *
 * For every skill flagged by verify-skills.js where one or more steps
 * are missing a `description` field, generate a sensible description
 * from the step's title + code, then push the updated steps array back
 * to Supabase via the Management API (one UPDATE per skill).
 *
 * Run:
 *   node scripts/fix-skill-descriptions.js
 *
 * After running, re-run verify-skills.js to confirm pass rate.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF || "ithclsbnnkijdwtpsaja";
if (!PAT) {
  console.error("Set SUPABASE_PAT environment variable (Personal Access Token)");
  process.exit(1);
}
const API = "https://addon90days.vercel.app";

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "addonweb-fix/1.0" } }, (res) => {
      let body = ""; res.on("data", c => body += c);
      res.on("end", () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} ${url}`));
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`bad JSON from ${url}: ${e.message}`)); }
      });
    }).on("error", reject);
  });
}

function supaQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: "api.supabase.com",
      path: `/v1/projects/${REF}/database/query`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAT}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      }
    }, (res) => {
      let b = ""; res.on("data", c => b += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.on("error", reject);
    req.write(body); req.end();
  });
}

// ---------------------------------------------------------------------------
// Description generator
// ---------------------------------------------------------------------------

/**
 * Heuristic description generator. The intent is to produce a 1-sentence
 * description that reads naturally and gives Claude enough context to
 * execute the step well, even when the original DB row was thin.
 */
function generateDescription(step, idx, totalSteps, skillTitle) {
  const title = (step.title || "").trim();
  const lang  = (step.language || "").toLowerCase();
  const code  = step.code || "";

  // ---- Pattern 1: code calls runSkill(...) with config
  if (/runSkill\s*\(/.test(code) && /\{[^}]*:/.test(code)) {
    return `Invoke the ${skillTitle} skill with the configuration below. Adjust the input values (domain, ids, paths, thresholds) to match your specific environment before running.`;
  }

  // ---- Pattern 2: configuration / output file (nginx, yaml, dockerfile, etc.)
  if (/^(nginx|yaml|yml|dockerfile|toml|ini|conf|json|hcl|tf)$/.test(lang)) {
    return `This is the generated ${lang} configuration. Review each section, replace placeholder values (hostnames, ports, secrets), and place the file at the standard path for your platform before deploying.`;
  }

  // ---- Pattern 3: shell / bash commands
  if (/^(bash|sh|shell|zsh)$/.test(lang)) {
    return `Run the commands below in your project directory. Confirm the working directory and any required environment variables (API keys, credentials) are set first.`;
  }

  // ---- Pattern 4: SQL
  if (/^(sql|psql|postgres)$/.test(lang)) {
    return `Execute the SQL below against your target database. Wrap in a transaction if you're modifying production data, and verify each query plan before running on a large dataset.`;
  }

  // ---- Pattern 5: TypeScript / JS that's not a runSkill call (manual integration)
  if (/^(typescript|javascript|ts|js|tsx|jsx)$/.test(lang) && !/runSkill\s*\(/.test(code)) {
    return `Drop this ${lang === "ts" || lang === "typescript" ? "TypeScript" : "JavaScript"} into your project. Wire it up to your existing module, then test with a representative payload before promoting to production.`;
  }

  // ---- Pattern 6: Python
  if (/^(python|py)$/.test(lang)) {
    return `Run this Python snippet with your environment activated. Install any missing dependencies (\`pip install ...\`) and adapt the imports to match your project structure.`;
  }

  // ---- Pattern 7: explicit "result" / "output" / "expected" titles
  if (/\b(result|output|expected|response|payload|sample)\b/i.test(title)) {
    return `Expected output for the previous step. Compare your actual output against this — any divergence usually points to missing inputs or version mismatches.`;
  }

  // ---- Pattern 8: explicit "deploy" / "run" / "test" / "verify" titles
  if (/\b(deploy|run|test|verify|check|confirm)\b/i.test(title)) {
    return `${title}. Use the snippet below as a starting point — adjust paths, hostnames, or credentials to match your environment.`;
  }

  // ---- Generic fallback (uses title)
  if (idx === 0) {
    return `${title}. Use the code below as the starting point — review every value and substitute project-specific inputs before running.`;
  }
  if (idx === totalSteps - 1) {
    return `${title}. This is the final step in the workflow — verify the output before considering the skill complete.`;
  }
  return `${title}. Apply the code below in sequence with the previous step's output. Adjust inputs as needed.`;
}

// ---------------------------------------------------------------------------
// SQL escaping
// ---------------------------------------------------------------------------

function sqlString(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }

function jsonbLiteral(obj) {
  // Produce a SQL-quoted JSONB literal: '...the json...'::jsonb
  // Escape single quotes by doubling per Postgres convention.
  return sqlString(JSON.stringify(obj)) + "::jsonb";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const reportPath = path.join(__dirname, "verify-report.json");
  if (!fs.existsSync(reportPath)) {
    console.error(`Run verify-skills.js first (no ${reportPath})`); process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const failed = report.results.filter(r => r.status === "fail");

  console.log(`\nFound ${failed.length} skills to fix.\n`);

  let fixed = 0, skipped = 0, errors = 0;

  for (let i = 0; i < failed.length; i++) {
    const slug = failed[i].slug;
    process.stdout.write(`  [${i + 1}/${failed.length}] ${slug}... `);

    let detail;
    try { detail = await getJson(`${API}/api/skills/${slug}`); }
    catch (e) { console.log(`✗ fetch failed: ${e.message}`); errors++; continue; }

    if (!Array.isArray(detail.steps) || detail.steps.length === 0) {
      console.log(`skip: no steps`); skipped++; continue;
    }

    const newSteps = detail.steps.map((s, idx) => {
      const out = { ...s };
      // Normalise: ensure `number` field is set (some rows use `step`)
      if (out.number === undefined && out.step !== undefined) out.number = out.step;
      if (out.number === undefined) out.number = idx + 1;
      // Backfill description if missing or too short
      const desc = (typeof out.description === "string" ? out.description : "").trim();
      if (desc.length < 20) {
        out.description = generateDescription(out, idx, detail.steps.length, detail.title);
      }
      return out;
    });

    // Compose UPDATE
    const sql = `UPDATE public.skills SET steps = ${jsonbLiteral(newSteps)}, updated_at = NOW() WHERE slug = ${sqlString(slug)};`;

    const res = await supaQuery(sql);
    if (res.status >= 400 || (res.body && res.body.error)) {
      console.log(`✗ DB error: ${JSON.stringify(res.body).slice(0, 200)}`);
      errors++; continue;
    }

    console.log(`✓ updated (${newSteps.length} steps backfilled)`);
    fixed++;
  }

  console.log(`\n  Summary: fixed=${fixed}, skipped=${skipped}, errors=${errors}\n`);
  if (errors > 0) process.exit(1);
}

main().catch(e => { console.error("FATAL:", e); process.exit(2); });
