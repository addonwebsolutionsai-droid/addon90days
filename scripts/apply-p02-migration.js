#!/usr/bin/env node
/**
 * apply-p02-migration.js
 *
 * Applies supabase/migrations/010_p02_chatbase.sql to the Supabase project.
 *
 * Strategy: Supabase's service-role key is a JWT accepted by the PostgREST
 * REST layer, but raw DDL cannot be POSTed over the standard table endpoints.
 * To execute arbitrary SQL we use Supabase's /rest/v1/rpc/ with a helper
 * function — EXCEPT we cannot create that function without already being
 * connected. So instead we call the Supabase Management API endpoint
 *   POST https://<ref>.supabase.co/rest/v1/  (not available for SQL)
 *
 * Actual approach used here:
 *   The @supabase/supabase-js client that is already installed supports
 *   `.rpc('pg_exec', { sql })` if a pg_exec function exists in the DB.
 *   That doesn't exist either.
 *
 * THEREFORE: We use the Supabase Management REST API which DOES allow
 * arbitrary SQL execution:
 *   POST https://api.supabase.com/v1/projects/{ref}/database/query
 *   Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
 *
 * This requires:
 *   SUPABASE_PROJECT_REF  — the short ref (e.g. "abcdefghijklmnopqrst")
 *   SUPABASE_ACCESS_TOKEN — a personal access token from supabase.com/dashboard/account/tokens
 *
 * Both are zero-cost to obtain and take 2 minutes.
 *
 * If those env vars are absent, the script prints the exact manual steps
 * the founder needs to apply the migration via the Supabase Dashboard SQL Editor
 * and exits 0 (so CI does not break).
 *
 * IDEMPOTENT: The migration uses IF NOT EXISTS / ON CONFLICT DO NOTHING /
 * CREATE OR REPLACE / DROP IF EXISTS everywhere, so re-running is safe.
 *
 * Usage:
 *   # Option A — automatic (preferred):
 *   SUPABASE_PROJECT_REF=xxxx SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-p02-migration.js
 *
 *   # Option B — dry-run (print SQL only, don't execute):
 *   DRY_RUN=true node scripts/apply-p02-migration.js
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const MIGRATION_FILE = path.join(__dirname, "../supabase/migrations/010_p02_chatbase.sql");
const PROJECT_REF = process.env["SUPABASE_PROJECT_REF"];
const ACCESS_TOKEN = process.env["SUPABASE_ACCESS_TOKEN"];
const DRY_RUN = process.env["DRY_RUN"] === "true";

// ---------------------------------------------------------------------------
// SQL splitter — respects $$ ... $$ dollar-quoted blocks
// ---------------------------------------------------------------------------

/**
 * Split a SQL file into individual statements, respecting dollar-quoted
 * blocks ($$...$$) so we don't split inside a DO $$ ... END $$ block.
 *
 * Rules:
 * - Semicolons inside $$...$$ blocks are NOT statement separators.
 * - Empty statements (only whitespace) are dropped.
 * - The returned array includes the trailing semicolons.
 */
function splitSql(sql) {
  const statements = [];
  let current = "";
  let inDollarQuote = false;
  let i = 0;

  while (i < sql.length) {
    // Detect start/end of $$-quoted block
    if (sql[i] === "$" && sql[i + 1] === "$") {
      inDollarQuote = !inDollarQuote;
      current += "$$";
      i += 2;
      continue;
    }

    if (sql[i] === ";" && !inDollarQuote) {
      current += ";";
      const trimmed = current.trim();
      if (trimmed && trimmed !== ";") {
        statements.push(trimmed);
      }
      current = "";
      i++;
      continue;
    }

    current += sql[i];
    i++;
  }

  // Capture trailing statement without semicolon (if any)
  const trailing = current.trim();
  if (trailing && trailing !== ";") {
    statements.push(trailing);
  }

  return statements;
}

// ---------------------------------------------------------------------------
// Execute single SQL statement via Supabase Management API
// ---------------------------------------------------------------------------

async function execStatement(projectRef, token, sql) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: token,
    },
    body: JSON.stringify({ query: sql }),
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = { raw: await res.text().catch(() => "(unreadable)") };
  }

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status}: ${JSON.stringify(body).slice(0, 400)}`
    );
  }

  return body;
}

// ---------------------------------------------------------------------------
// Print manual runbook when auto-apply is not possible
// ---------------------------------------------------------------------------

function printManualRunbook(sql) {
  console.log(`
================================================================================
MANUAL MIGRATION REQUIRED
================================================================================

The automatic migration applier needs two env vars that are not set:
  SUPABASE_PROJECT_REF  — e.g. "abcdefghijklmnopqrst" (20-char string in your
                          Supabase project URL: https://supabase.com/dashboard/project/<ref>)
  SUPABASE_ACCESS_TOKEN — personal access token from:
                          https://supabase.com/dashboard/account/tokens

To apply automatically next time:
  SUPABASE_PROJECT_REF=xxxx SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-p02-migration.js

TO APPLY MANUALLY (5 minutes, one-time):
--------------------------------------------------------------------------------
1. Open: https://supabase.com/dashboard/project/<your-project-ref>/sql/new
2. Paste the ENTIRE contents of:
     supabase/migrations/010_p02_chatbase.sql
3. Click "Run" (or Ctrl+Enter).
4. You should see "Success. No rows returned" for each statement.
5. Verify by running this check query in SQL Editor:
     SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name LIKE 'p02_%'
     ORDER BY table_name;
   Expected output (5 rows):
     p02_conversations
     p02_intents
     p02_kb_docs
     p02_messages
     p02_workspaces

6. Then add P02_ENCRYPTION_KEY to Vercel (see .env.required.md).
7. Re-deploy Vercel (push any empty commit or trigger via dashboard).
8. Run: bash scripts/p02-smoke.sh

The migration is idempotent — safe to re-run if you run it twice by accident.
================================================================================
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== P02 Migration Applier ===");
  console.log(`Migration file: ${MIGRATION_FILE}`);

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`ERROR: Migration file not found at ${MIGRATION_FILE}`);
    process.exit(1);
  }

  const rawSql = fs.readFileSync(MIGRATION_FILE, "utf8");
  const statements = splitSql(rawSql);
  console.log(`Parsed ${statements.length} SQL statement(s).`);

  if (DRY_RUN) {
    console.log("\n--- DRY RUN: SQL statements that would be executed ---\n");
    statements.forEach((s, i) => {
      console.log(`[${i + 1}/${statements.length}] ${s.slice(0, 120).replace(/\n/g, " ")}...`);
    });
    console.log("\nDry run complete. Set DRY_RUN=false to apply.");
    return;
  }

  if (!PROJECT_REF || !ACCESS_TOKEN) {
    console.warn(
      "\nWARNING: SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN not set."
    );
    printManualRunbook(rawSql);
    // Exit 0 — this is expected during local dev without credentials.
    process.exit(0);
  }

  console.log(`\nConnecting to project: ${PROJECT_REF}`);
  console.log("Applying statements...\n");

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.slice(0, 80).replace(/\n/g, " ").replace(/\s+/g, " ");

    process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}... `);

    try {
      await execStatement(PROJECT_REF, ACCESS_TOKEN, stmt);
      console.log("OK");
      passed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      // Treat "already exists" errors as success (idempotent re-run)
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate_object") ||
        msg.includes("DUPLICATE")
      ) {
        console.log("OK (already exists)");
        passed++;
      } else {
        console.log(`FAIL — ${msg}`);
        failed++;
      }
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

  if (failed > 0) {
    console.error(
      "\nSome statements failed. Check output above. Fix and re-run — migration is idempotent."
    );
    process.exit(1);
  } else {
    console.log(
      "\nMigration applied successfully.\n" +
        "Next steps:\n" +
        "  1. Add P02_ENCRYPTION_KEY to Vercel env (see products/02-whatsapp-ai-suite/.env.required.md)\n" +
        "  2. Re-deploy Vercel.\n" +
        "  3. Run: bash scripts/p02-smoke.sh"
    );
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
