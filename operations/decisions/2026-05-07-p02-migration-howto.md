# P02 Migration How-To — Manual Steps for Founder
**Date:** 2026-05-07  
**Status:** Active  
**Context:** Supabase migration `010_p02_chatbase.sql` must be applied before any P02 API route works. The automatic applier (`scripts/apply-p02-migration.js`) will run it hands-free if `SUPABASE_PROJECT_REF` + `SUPABASE_ACCESS_TOKEN` are set. This document is the fallback for when the founder applies it manually via the Supabase Dashboard.

---

## Option A — Automatic (preferred, 3 min)

### Step 1 — Get your project ref
Your Supabase project URL looks like:
```
https://supabase.com/dashboard/project/abcdefghijklmnopqrst
```
The `abcdefghijklmnopqrst` part is your `SUPABASE_PROJECT_REF`.

### Step 2 — Create a personal access token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Name it "migration-applier"
4. Copy the token (starts with `sbp_`)

### Step 3 — Run the script
```bash
cd C:/Users/Lenovo/Downloads/AWS_90days

SUPABASE_PROJECT_REF=<your-ref> \
SUPABASE_ACCESS_TOKEN=sbp_<your-token> \
node scripts/apply-p02-migration.js
```

Expected output: `Migration applied successfully.` with 0 failed statements.

---

## Option B — Manual via Supabase Dashboard (5 min)

If the script fails or you prefer the dashboard:

### Step 1 — Open SQL Editor
https://supabase.com/dashboard/project/**YOUR_PROJECT_REF**/sql/new

### Step 2 — Paste and run
Copy the ENTIRE contents of `supabase/migrations/010_p02_chatbase.sql` (229 lines) and paste into the SQL editor. Click "Run" (or Ctrl+Enter / Cmd+Enter).

You should see: `Success. No rows returned`

The migration is **idempotent** — safe to run twice. All statements use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `CREATE OR REPLACE`, and `DROP IF EXISTS`.

### Step 3 — Verify
Run this query in the SQL Editor to confirm all 5 tables exist:

```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'p02_%'
ORDER BY table_name;
```

Expected result (5 rows):
```
p02_conversations
p02_intents
p02_kb_docs
p02_messages
p02_workspaces
```

Run this to verify intents were seeded (should return 6 rows):

```sql
SELECT intent_key, name, threshold 
FROM p02_intents 
WHERE workspace_id IS NULL
ORDER BY intent_key;
```

Expected:
```
complaint         | Complaint                 | 1.0
invoice-request   | Invoice Request           | 0.6
order-placement   | Order Placement           | 0.6
payment-status    | Payment Status            | 0.6
price-inquiry     | Price Inquiry             | 0.6
unknown           | Unknown / Clarification   | 1.0
```

---

## After the migration — remaining founder actions

### Action 2 — Add P02_ENCRYPTION_KEY to Vercel (3 min)

Generate the key:
```bash
openssl rand -hex 32
```

Add to Vercel:
- Dashboard → Project → Settings → Environment Variables
- Name: `P02_ENCRYPTION_KEY`
- Value: (the 64-character hex output)
- Environments: **All** (production + preview + development) — must be identical or tokens encrypt/decrypt fail across envs

### Action 3 (optional, deferred) — Meta Business Manager verification
Apply at https://business.facebook.com for WhatsApp Cloud API access. Takes 3–7 business days. The backend runs in `MOCK_MODE=true` until this is complete — the full dashboard works without real WhatsApp.

---

## After both actions above

1. Re-deploy Vercel (push any commit or manually trigger in Vercel dashboard).
2. Run smoke test:
   ```bash
   export CLERK_TOKEN="<your session JWT from browser DevTools → Application → Cookies → __session>"
   export BASE_URL="https://addon90days.vercel.app"
   bash scripts/p02-smoke.sh
   ```
3. Visit `/dashboard/chatbase` — create a workspace, add a KB doc, send a mock message. Full flow should work.

---

## Why direct Postgres connection was not used

The migration applier uses the Supabase Management REST API instead of a direct Postgres connection (`pg` or `postgres-js`) because:

1. No `pg` or `postgres-js` is installed in the project (adding it for a one-time script would violate the "no new dependencies unless required" constraint).
2. Supabase connection pooling uses pgBouncer on port 6543. Connecting with the service-role key as the Postgres password is not the standard auth flow — it would require the raw Postgres password, which is different from the JWT service-role key.
3. The Management API (`api.supabase.com/v1/projects/{ref}/database/query`) is the recommended approach for programmatic SQL execution against Supabase from outside the project.
