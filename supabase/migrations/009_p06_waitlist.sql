-- Migration: 009_p06_waitlist.sql
-- Purpose: MachineGuard (P06) predictive maintenance pilot waitlist capture
--
-- DO NOT APPLY directly -- founder applies via Supabase Management API or
-- Supabase Studio SQL editor. This file is checked in for reference.
--
-- Apply order: after 008_p05_waitlist.sql

create table if not exists public.p06_waitlist (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  created_at timestamptz not null default now(),
  source     text        not null default 'web'   -- 'web' | 'campaign' | 'referral'
);

-- Indexes
create index if not exists p06_waitlist_created_at_idx on public.p06_waitlist (created_at desc);

-- Row-level security: table is locked down. Only service-role key can read or write.
-- The waitlist API route uses getUntypedAdmin() (service-role) -- bypasses RLS.
-- Anon/authenticated roles have zero access.
alter table public.p06_waitlist enable row level security;

-- Deny all access for anon role
create policy "p06_waitlist: deny anon read"
  on public.p06_waitlist for select
  to anon
  using (false);

create policy "p06_waitlist: deny anon insert"
  on public.p06_waitlist for insert
  to anon
  with check (false);

-- Deny all access for authenticated role (dashboard users)
create policy "p06_waitlist: deny authenticated read"
  on public.p06_waitlist for select
  to authenticated
  using (false);

create policy "p06_waitlist: deny authenticated insert"
  on public.p06_waitlist for insert
  to authenticated
  with check (false);

-- Service role bypasses RLS automatically -- no policy needed.
-- Founder exports pilot applicants via:
-- SELECT * FROM p06_waitlist ORDER BY created_at DESC;
