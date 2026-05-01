-- Migration: 004_p02_waitlist.sql
-- Purpose: ChatBase (P02) beta waitlist capture
--
-- DO NOT APPLY directly — founder applies via Supabase Management API or
-- Supabase Studio SQL editor. This file is checked in for reference.
--
-- Apply order: after 003_skill_installs.sql

create table if not exists public.p02_waitlist (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  created_at timestamptz not null default now(),
  source     text        not null default 'web'   -- 'web' | 'campaign' | 'referral'
);

-- Indexes
create index if not exists p02_waitlist_created_at_idx on public.p02_waitlist (created_at desc);

-- Row-level security: table is locked down. Only service-role key can read or write.
-- The waitlist API route uses getSupabaseAdmin() (service-role) — bypasses RLS.
-- Anon/authenticated roles have zero access.
alter table public.p02_waitlist enable row level security;

-- Deny all access for anon role
create policy "p02_waitlist: deny anon read"
  on public.p02_waitlist for select
  to anon
  using (false);

create policy "p02_waitlist: deny anon insert"
  on public.p02_waitlist for insert
  to anon
  with check (false);

-- Deny all access for authenticated role (dashboard users)
create policy "p02_waitlist: deny authenticated read"
  on public.p02_waitlist for select
  to authenticated
  using (false);

create policy "p02_waitlist: deny authenticated insert"
  on public.p02_waitlist for insert
  to authenticated
  with check (false);

-- Service role bypasses RLS automatically — no policy needed.
-- Founder exports waitlist via: SELECT * FROM p02_waitlist ORDER BY created_at DESC;
