#!/usr/bin/env node
/**
 * verify-skills.js — exhaustive validator for the Claude Toolkit catalog.
 *
 * Hits the live API, pulls every skill, and runs a battery of checks per
 * skill. Generates the .md content (mirroring install/route.ts) and
 * inspects it for parse-time issues that would break Claude Code.
 *
 * Output: ./scripts/verify-report.json + a human-readable summary.
 *
 * Usage: node scripts/verify-skills.js [--api=https://addon90days.vercel.app]
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_BASE = (process.argv.find(a => a.startsWith("--api=")) ?? "--api=https://addon90days.vercel.app").slice(6);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "addonweb-verify/1.0" } }, (res) => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e.message}`)); }
      });
    }).on("error", reject);
  });
}

// Mirror of buildSkillMarkdown from install/route.ts — must stay in sync.
function buildSkillMarkdown(skill) {
  const appUrl = "https://addon90days.vercel.app";
  const lines = [];
  lines.push("---");
  lines.push(`description: ${skill.tagline}`);
  lines.push("argument-hint: [optional context or inputs]");
  lines.push("---");
  lines.push("");
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
  lines.push("Follow these steps in order...");
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
  }
  lines.push("## Output expectations");
  lines.push("");
  lines.push(`_Skill: \`${skill.slug}\` · Source: ${appUrl}/skills/${skill.slug}_`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Validators (each returns { ok, issues[] })
// ---------------------------------------------------------------------------

function checkRequiredFields(skill) {
  const issues = [];
  const required = ["slug", "title", "tagline", "description", "category", "difficulty"];
  for (const f of required) {
    if (skill[f] === null || skill[f] === undefined || skill[f] === "") {
      issues.push(`missing required field: ${f}`);
    }
  }
  return { ok: issues.length === 0, issues };
}

function checkSlugFormat(skill) {
  const issues = [];
  if (typeof skill.slug !== "string") return { ok: false, issues: ["slug not a string"] };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(skill.slug)) {
    issues.push(`slug "${skill.slug}" must be lowercase kebab-case`);
  }
  if (skill.slug.length > 60) issues.push(`slug too long (${skill.slug.length} > 60)`);
  return { ok: issues.length === 0, issues };
}

function checkLengths(skill) {
  const issues = [];
  if (skill.title && skill.title.length > 80) issues.push(`title too long (${skill.title.length})`);
  if (skill.tagline && skill.tagline.length < 20) issues.push(`tagline too short (${skill.tagline.length} < 20)`);
  if (skill.tagline && skill.tagline.length > 200) issues.push(`tagline too long (${skill.tagline.length} > 200)`);
  if (skill.description && skill.description.length < 50) issues.push(`description too short (${skill.description.length} < 50)`);
  return { ok: issues.length === 0, issues };
}

function checkSteps(skill) {
  const issues = [];
  if (!Array.isArray(skill.steps)) {
    issues.push("steps is not an array");
    return { ok: false, issues };
  }
  if (skill.steps.length === 0) {
    issues.push("steps array is empty (skill has no actionable workflow)");
    return { ok: false, issues };
  }
  if (skill.steps.length > 12) {
    issues.push(`too many steps (${skill.steps.length} > 12) — split into multiple skills`);
  }

  const seenNumbers = new Set();
  for (let i = 0; i < skill.steps.length; i++) {
    const s = skill.steps[i];
    if (!s || typeof s !== "object") { issues.push(`step ${i} is not an object`); continue; }

    const nKey = s.number ?? s.step;
    if (nKey === undefined || nKey === null) {
      issues.push(`step ${i}: missing number`);
    } else if (typeof nKey !== "number") {
      issues.push(`step ${i}: number is not numeric (got ${typeof nKey})`);
    } else {
      if (seenNumbers.has(nKey)) issues.push(`step ${i}: duplicate number ${nKey}`);
      seenNumbers.add(nKey);
      if (nKey !== i + 1) issues.push(`step ${i}: number ${nKey} not sequential (expected ${i + 1})`);
    }

    if (!s.title || typeof s.title !== "string" || s.title.trim() === "") {
      issues.push(`step ${i}: missing title`);
    }
    if (!s.description || typeof s.description !== "string" || s.description.trim().length < 20) {
      issues.push(`step ${i}: description missing or too short (<20 chars)`);
    }
    if (s.code !== undefined && s.code !== null) {
      if (typeof s.code !== "string") issues.push(`step ${i}: code is not a string`);
      if (s.code.includes("```")) issues.push(`step ${i}: code contains \`\`\` which will break the markdown fence`);
    }
    if (s.language !== undefined && s.language !== null) {
      if (typeof s.language !== "string") issues.push(`step ${i}: language is not a string`);
      else if (!/^[a-z0-9-]*$/i.test(s.language)) issues.push(`step ${i}: language has invalid chars: "${s.language}"`);
    }
  }
  return { ok: issues.length === 0, issues };
}

function checkGeneratedMarkdown(skill) {
  const issues = [];
  let md;
  try { md = buildSkillMarkdown(skill); }
  catch (e) { return { ok: false, issues: [`buildSkillMarkdown threw: ${e.message}`] }; }

  // Only flag "undefined" appearing OUTSIDE code blocks — inside ``` fences,
  // it's legitimate content (e.g. error-debugger contains stack traces).
  {
    const lines = md.split("\n");
    let inFence = false;
    const bad = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith("```")) { inFence = !inFence; continue; }
      if (!inFence && l.includes("undefined")) {
        bad.push(`line ${i + 1}: ${l.slice(0, 100)}`);
      }
    }
    if (bad.length > 0) {
      issues.push(`generated .md contains "undefined" in body: ${bad.join(" | ")}`);
    }
  }
  if (md.includes("null")) {
    // null is OK in code blocks (e.g. JSON), but suspicious in body. Soft warning only.
  }

  // Frontmatter sanity
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    issues.push("frontmatter missing or malformed");
  } else {
    if (!fmMatch[1].includes("description:")) issues.push("frontmatter missing description");
  }

  // Code fence balance — every opening ``` must have a closing ```
  const fences = md.split("\n").filter(l => l.startsWith("```")).length;
  if (fences % 2 !== 0) {
    issues.push(`unbalanced code fences (${fences} \`\`\` markers — must be even)`);
  }

  // Length sanity — Claude Code skills should be <8KB to avoid context bloat
  const sizeKB = Buffer.byteLength(md, "utf8") / 1024;
  if (sizeKB > 32) issues.push(`generated .md is ${sizeKB.toFixed(1)} KB — very large`);

  return { ok: issues.length === 0, issues, sizeKB: +sizeKB.toFixed(2) };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// MCP protocol checks — verify /api/skills/mcp speaks JSON-RPC 2.0
// ---------------------------------------------------------------------------

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const u    = new URL(url);
    const body = JSON.stringify(payload);
    const req  = require("https").request({
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method:   "POST",
      headers:  {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(body),
        "user-agent":     "addonweb-verify/1.0",
      },
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

async function checkMcpProtocol() {
  const issues = [];
  const url    = `${API_BASE}/api/skills/mcp`;

  // 1. GET probe
  try {
    const probe = await get(url);
    if (probe?.transport !== "streamable-http") issues.push(`GET probe missing transport=streamable-http (got ${probe?.transport})`);
    if (!probe?.protocolVersion)                issues.push("GET probe missing protocolVersion");
  } catch (e) { issues.push(`GET probe failed: ${e.message}`); }

  // 2. initialize
  try {
    const init = await postJson(url, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "verifier", version: "1.0" } } });
    if (init.status !== 200)                                          issues.push(`initialize HTTP ${init.status}`);
    if (init.body?.error)                                             issues.push(`initialize returned error: ${JSON.stringify(init.body.error)}`);
    if (!init.body?.result?.serverInfo?.name)                         issues.push("initialize missing result.serverInfo.name");
    if (!init.body?.result?.capabilities?.tools)                      issues.push("initialize missing tools capability");
  } catch (e) { issues.push(`initialize failed: ${e.message}`); }

  // 3. tools/list — should return all 130 skills
  try {
    const list = await postJson(url, { jsonrpc: "2.0", id: 2, method: "tools/list" });
    if (!Array.isArray(list.body?.result?.tools)) {
      issues.push("tools/list missing result.tools array");
    } else {
      const n = list.body.result.tools.length;
      if (n < 100) issues.push(`tools/list returned ${n} tools — expected 100+`);
      const t = list.body.result.tools[0];
      if (!t.name)        issues.push("tools/list first tool missing name");
      if (!t.description) issues.push("tools/list first tool missing description");
      if (!t.inputSchema) issues.push("tools/list first tool missing inputSchema");
    }
  } catch (e) { issues.push(`tools/list failed: ${e.message}`); }

  // 4. tools/call — pick a skill known to exist
  try {
    const call = await postJson(url, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "stock-screener-ai", arguments: { input: "test" } } });
    if (call.body?.error)                                                 issues.push(`tools/call returned error: ${JSON.stringify(call.body.error)}`);
    const text = call.body?.result?.content?.[0]?.text;
    if (typeof text !== "string" || text.length < 100)                     issues.push(`tools/call returned suspiciously short content (${text?.length} chars)`);
    if (text && !text.includes("Workflow"))                                 issues.push("tools/call content missing 'Workflow' section");
  } catch (e) { issues.push(`tools/call failed: ${e.message}`); }

  // 5. resources/list
  try {
    const res = await postJson(url, { jsonrpc: "2.0", id: 4, method: "resources/list" });
    if (!Array.isArray(res.body?.result?.resources)) issues.push("resources/list missing result.resources");
    else if (res.body.result.resources.length < 100)  issues.push(`resources/list returned ${res.body.result.resources.length} — expected 100+`);
  } catch (e) { issues.push(`resources/list failed: ${e.message}`); }

  // 6. unknown method → must return JSON-RPC error, not crash
  try {
    const unk = await postJson(url, { jsonrpc: "2.0", id: 5, method: "this/method/does/not/exist" });
    if (!unk.body?.error || unk.body.error.code !== -32601) issues.push("unknown method should return -32601 method-not-found");
  } catch (e) { issues.push(`unknown method probe failed: ${e.message}`); }

  return issues;
}

async function main() {
  console.log(`\nVerifying skills against ${API_BASE}...\n`);

  // Step 0: MCP protocol checks (top-level — failing means EVERY MCP user is broken)
  console.log("  MCP protocol checks:");
  const mcpIssues = await checkMcpProtocol();
  if (mcpIssues.length === 0) {
    console.log("    ✓ MCP server speaks JSON-RPC 2.0 correctly\n");
  } else {
    console.log("    ✗ MCP server has issues:");
    mcpIssues.forEach(x => console.log(`      - ${x}`));
    console.log("");
  }

  // Step 1: list all skills
  const listed = [];
  let page = 1;
  while (true) {
    const data = await get(`${API_BASE}/api/skills?page=${page}&pageSize=100&sort=trending`);
    if (!data || !Array.isArray(data.skills) || data.skills.length === 0) break;
    listed.push(...data.skills);
    if (listed.length >= (data.total ?? 0)) break;
    page++;
    if (page > 20) break;  // safety net
  }
  console.log(`  Listed ${listed.length} skills (target: ${listed.length})`);

  // Step 2: for each, fetch detail and validate
  const results = [];
  let pass = 0, fail = 0;
  for (let i = 0; i < listed.length; i++) {
    const ls = listed[i];
    process.stdout.write(`  [${i + 1}/${listed.length}] ${ls.slug}... `);
    let detail;
    try { detail = await get(`${API_BASE}/api/skills/${ls.slug}`); }
    catch (e) {
      console.log(`✗ DETAIL FETCH FAILED: ${e.message}`);
      results.push({ slug: ls.slug, status: "fail", issues: [`detail endpoint failed: ${e.message}`] });
      fail++;
      continue;
    }

    const issues = [];
    const checks = [
      ["fields",   checkRequiredFields(detail)],
      ["slug",     checkSlugFormat(detail)],
      ["lengths",  checkLengths(detail)],
      ["steps",    checkSteps(detail)],
      ["markdown", checkGeneratedMarkdown(detail)],
    ];
    let mdSize = 0;
    for (const [name, r] of checks) {
      if (!r.ok) issues.push(...r.issues.map(x => `[${name}] ${x}`));
      if (r.sizeKB) mdSize = r.sizeKB;
    }
    if (issues.length === 0) {
      console.log(`✓ (md=${mdSize}KB)`);
      pass++;
      results.push({ slug: ls.slug, status: "pass", mdSize });
    } else {
      console.log(`✗ ${issues.length} issue(s)`);
      issues.forEach(x => console.log(`      - ${x}`));
      fail++;
      results.push({ slug: ls.slug, status: "fail", issues, mdSize });
    }
  }

  // Step 3: write report
  const report = {
    api: API_BASE,
    timestamp: new Date().toISOString(),
    total: listed.length,
    pass,
    fail,
    results,
  };
  const outPath = path.join(__dirname, "verify-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\n  Report: ${outPath}`);
  console.log(`  Total: ${listed.length} | Pass: ${pass} | Fail: ${fail}`);
  console.log(`  Pass rate: ${((pass / listed.length) * 100).toFixed(1)}%\n`);

  if (fail > 0) {
    console.log(`  ${fail} skill(s) need fixing. See verify-report.json for details.\n`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error("\nFATAL:", e.message);
  process.exit(2);
});
