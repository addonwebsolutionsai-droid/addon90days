#!/usr/bin/env node
/**
 * Sets TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID on Vercel.
 * Used only for future webhook handlers — the cloud routines embed
 * these directly in their prompts (different transport).
 */

const https = require("https");
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
if (!VERCEL_TOKEN || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("Set VERCEL_TOKEN, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID env vars");
  process.exit(1);
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.vercel.com", path, method,
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}) },
    }, (res) => {
      let data = ""; res.on("data", c => data += c);
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

async function setVar(projectId, key, value) {
  process.stdout.write(`  ${key}... `);
  const create = await api("POST", `/v10/projects/${projectId}/env`, { key, value, type: "encrypted", target: ["production", "preview"] });
  if (create.status === 200 || create.status === 201) { console.log("✓ created"); return; }
  if (create.body.error?.code === "ENV_ALREADY_EXISTS") {
    const all = await api("GET", `/v10/projects/${projectId}/env`);
    const match = all.body.envs?.find(e => e.key === key);
    if (!match) { console.log("✗ exists but not found"); return; }
    const upd = await api("PATCH", `/v10/projects/${projectId}/env/${match.id}`, { value, target: ["production", "preview"] });
    console.log(upd.status === 200 ? "✓ updated" : `✗ ${JSON.stringify(upd.body).slice(0,200)}`);
  } else {
    console.log(`✗ ${JSON.stringify(create.body).slice(0,200)}`);
  }
}

async function main() {
  const projects = await api("GET", "/v9/projects?limit=20");
  const project = projects.body.projects?.find(p => p.name === "addon90days");
  if (!project) { console.error("addon90days not found"); process.exit(1); }
  console.log(`Project: ${project.name} (${project.id})`);
  await setVar(project.id, "TELEGRAM_BOT_TOKEN", TELEGRAM_TOKEN);
  await setVar(project.id, "TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID);
}
main().catch(e => { console.error(e); process.exit(1); });
