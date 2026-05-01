#!/usr/bin/env node
const https = require("https");
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const GEMINI_KEY = process.env.GEMINI_KEY;
if (!VERCEL_TOKEN || !GEMINI_KEY) { console.error("Set VERCEL_TOKEN and GEMINI_KEY"); process.exit(1); }

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({ hostname: "api.vercel.com", path, method,
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json", ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}) } },
      (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } }); });
    req.on("error", reject); if (bodyStr) req.write(bodyStr); req.end();
  });
}

(async () => {
  const projects = await api("GET", "/v9/projects?limit=20");
  const project = projects.body.projects?.find(p => p.name === "addon90days");
  if (!project) { console.error("addon90days not found"); process.exit(1); }
  process.stdout.write("GEMINI_API_KEY... ");
  const create = await api("POST", `/v10/projects/${project.id}/env`, { key: "GEMINI_API_KEY", value: GEMINI_KEY, type: "encrypted", target: ["production", "preview"] });
  if (create.status === 200 || create.status === 201) console.log("✓ created");
  else if (create.body.error?.code === "ENV_ALREADY_EXISTS" || create.body.error?.code === "ENV_CONFLICT") {
    const all = await api("GET", `/v10/projects/${project.id}/env`);
    const m = all.body.envs?.find(e => e.key === "GEMINI_API_KEY");
    const upd = await api("PATCH", `/v10/projects/${project.id}/env/${m.id}`, { value: GEMINI_KEY, target: ["production", "preview"] });
    console.log(upd.status === 200 ? "✓ updated" : `✗ ${JSON.stringify(upd.body).slice(0,200)}`);
  } else { console.log(`✗ ${JSON.stringify(create.body).slice(0,200)}`); }
})().catch(e => { console.error(e); process.exit(1); });
