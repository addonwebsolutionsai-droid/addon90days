#!/usr/bin/env node
/**
 * Sets AGENT_API_SECRET and GITHUB_TOKEN on Vercel for the addon90days
 * project. Idempotent — updates if the var already exists.
 *
 * Inputs come from env, not args:
 *   VERCEL_TOKEN     — Vercel personal access token
 *   AGENT_SECRET     — random secret for /api/agents/* auth
 *   GITHUB_PAT       — GitHub PAT with `repo` scope
 */

const https = require("https");

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const AGENT_SECRET = process.env.AGENT_SECRET;
const GITHUB_PAT   = process.env.GITHUB_PAT;

if (!VERCEL_TOKEN || !AGENT_SECRET || !GITHUB_PAT) {
  console.error("Set VERCEL_TOKEN, AGENT_SECRET, GITHUB_PAT env vars");
  process.exit(1);
}

const ENV_VARS = [
  { key: "AGENT_API_SECRET", value: AGENT_SECRET, target: ["production", "preview"] },
  { key: "GITHUB_TOKEN",     value: GITHUB_PAT,   target: ["production", "preview"] },
  { key: "GITHUB_OWNER",     value: "addonwebsolutionsai-droid", target: ["production", "preview", "development"] },
  { key: "GITHUB_REPO",      value: "addon90days", target: ["production", "preview", "development"] },
  { key: "GITHUB_BRANCH",    value: "main",        target: ["production", "preview", "development"] },
];

function vercelAPI(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: "api.vercel.com",
      path,
      method,
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type":  "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  const projects = await vercelAPI("GET", "/v9/projects?limit=20");
  const project = projects.body.projects?.find(p => p.name === "addon90days" || p.name?.includes("addon90"));
  if (!project) {
    console.error("Could not find addon90days project. Available:", projects.body.projects?.map(p => p.name));
    process.exit(1);
  }
  console.log(`Found project: ${project.name} (${project.id})`);

  for (const v of ENV_VARS) {
    process.stdout.write(`  ${v.key}... `);
    const create = await vercelAPI("POST", `/v10/projects/${project.id}/env`, {
      key: v.key, value: v.value, type: "encrypted", target: v.target,
    });
    if (create.status === 200 || create.status === 201) {
      console.log("✓ created");
      continue;
    }
    if (create.body.error?.code === "ENV_ALREADY_EXISTS") {
      const all = await vercelAPI("GET", `/v10/projects/${project.id}/env`);
      const match = all.body.envs?.find(e => e.key === v.key);
      if (!match) { console.log("✗ exists but not found in list"); continue; }
      const upd = await vercelAPI("PATCH", `/v10/projects/${project.id}/env/${match.id}`, {
        value: v.value, target: v.target,
      });
      console.log(upd.status === 200 ? "✓ updated" : `✗ update failed: ${JSON.stringify(upd.body).slice(0,200)}`);
    } else {
      console.log(`✗ ${JSON.stringify(create.body).slice(0,200)}`);
    }
  }

  console.log("\nTriggering redeploy...");
  const dep = await vercelAPI("POST", "/v13/deployments", {
    name: project.name,
    gitSource: { type: "github", repoId: project.link?.repoId, ref: "main" },
    projectId: project.id,
  });
  console.log(dep.status < 300 ? `✓ Deploy started: ${dep.body.url}` : `Response: ${JSON.stringify(dep.body).slice(0,200)}`);
}

main().catch(e => { console.error(e); process.exit(1); });
