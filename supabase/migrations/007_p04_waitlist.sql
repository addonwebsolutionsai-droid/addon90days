-- Migration 007: TableFlow (P04) beta waitlist
-- DO NOT APPLY automatically. Founder applies via Supabase Management API.
-- Shape mirrors p02_waitlist (migration 004).

create table if not exists p04_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null default 'web',
  created_at timestamptz not null default now()
);

-- Enforce unique emails — duplicate inserts return PG error code 23505
-- which the API route handles as { ok: true, dedupe: true }.
create unique index if not exists p04_waitlist_email_uidx
  on p04_waitlist (lower(email));

-- RLS: service-role key bypasses; no direct client access needed.
alter table p04_waitlist enable row level security;

-- Allow the service role to insert (service role bypasses RLS by default,
-- but policy is explicit for audit clarity).
create policy "service_role_insert" on p04_waitlist
  for insert
  to service_role
  with check (true);
