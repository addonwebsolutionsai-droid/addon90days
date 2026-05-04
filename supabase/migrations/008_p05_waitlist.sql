-- Migration: 008_p05_waitlist.sql
-- Purpose: ConnectOne (P05) IoT pilot program waitlist capture
--
-- DO NOT APPLY directly -- founder applies via Supabase Management API or
-- Supabase Studio SQL editor. This file is checked in for reference.
--
-- Apply order: after 005_rate_limits.sql

create table if not exists public.p05_waitlist (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  created_at timestamptz not null default now(),
  source     text        not null default 'web'   -- 'web' | 'campaign' | 'referral'
);

-- Indexes
create index if not exists p05_waitlist_created_at_idx on public.p05_waitlist (created_at desc);

-- Row-level security: table is locked down. Only service-role key can read or write.
-- The waitlist API route uses getUntypedAdmin() (service-role) -- bypasses RLS.
-- Anon/authenticated roles have zero access.
alter table public.p05_waitlist enable row level security;

-- Deny all access for anon role
create policy "p05_waitlist: deny anon read"
  on public.p05_waitlist for select
  to anon
  using (false);

create policy "p05_waitlist: deny anon insert"
  on public.p05_waitlist for insert
  to anon
  with check (false);

-- Deny all access for authenticated role (dashboard users)
create policy "p05_waitlist: deny authenticated read"
  on public.p05_waitlist for select
  to authenticated
  using (false);

create policy "p05_waitlist: deny authenticated insert"
  on public.p05_waitlist for insert
  to authenticated
  with check (false);

-- Service role bypasses RLS automatically -- no policy needed.
-- Founder exports pilot applicants via:
-- SELECT * FROM p05_waitlist ORDER BY created_at DESC;
