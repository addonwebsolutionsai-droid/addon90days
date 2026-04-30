#!/usr/bin/env node
/**
 * Rotate GITHUB_TOKEN env var on Vercel without redeploying.
 *
 * Usage:
 *   VERCEL_TOKEN=... NEW_GITHUB_PAT=ghp_xxx node scripts/rotate-github-token.js
 *
 * Triggers a redeploy at the end so the new value is picked up.
 */

const https = require("https");
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const NEW_PAT      = process.env.NEW_GITHUB_PAT;
if (!VERCEL_TOKEN || !NEW_PAT) {
  console.error("Set VERCEL_TOKEN and NEW_GITHUB_PAT env vars"); process.exit(1);
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.vercel.com",
      path,
      method,
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    }, (res) => {
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
  const projects = await api("GET", "/v9/projects?limit=20");
  const project = projects.body.projects?.find(p => p.name === "addon90days");
  if (!project) { console.error("addon90days project not found"); process.exit(1); }

  const all = await api("GET", `/v10/projects/${project.id}/env`);
  const match = all.body.envs?.find(e => e.key === "GITHUB_TOKEN");
  if (!match) { console.error("GITHUB_TOKEN env var not found on Vercel"); process.exit(1); }

  process.stdout.write("Rotating GITHUB_TOKEN... ");
  const upd = await api("PATCH", `/v10/projects/${project.id}/env/${match.id}`, {
    value: NEW_PAT,
    target: ["production", "preview"],
  });
  console.log(upd.status === 200 ? "✓" : `✗ ${JSON.stringify(upd.body).slice(0,200)}`);
  if (upd.status !== 200) process.exit(1);

  process.stdout.write("Triggering redeploy... ");
  const dep = await api("POST", "/v13/deployments", {
    name: project.name,
    gitSource: { type: "github", repoId: project.link?.repoId, ref: "main" },
  });
  if (dep.status < 300) {
    console.log(`✓ ${dep.body.url}`);
  } else {
    console.log(`(redeploy via API failed; push a no-op commit instead) ${JSON.stringify(dep.body).slice(0,200)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
