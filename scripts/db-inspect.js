#!/usr/bin/env node
const https = require("https");

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF || "ithclsbnnkijdwtpsaja";
if (!PAT) { console.error("Set SUPABASE_PAT env var"); process.exit(1); }

const slug = process.argv[2];
if (!slug) { console.error("Usage: node db-inspect.js <slug>"); process.exit(1); }

const query = `SELECT slug, title, jsonb_pretty(steps) AS steps FROM skills WHERE slug='${slug}' LIMIT 1`;

const body = JSON.stringify({ query });
const req = https.request(
  { hostname: "api.supabase.com", path: `/v1/projects/${REF}/database/query`, method: "POST",
    headers: { "Authorization": `Bearer ${PAT}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
  res => { let b=""; res.on("data",c=>b+=c); res.on("end",()=>console.log(b)); }
);
req.write(body); req.end();
