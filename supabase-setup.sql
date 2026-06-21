-- =====================================================================
--  The Fit Geek — Supabase database setup
--  Run this once in your Supabase project: SQL Editor -> New query -> Run
-- =====================================================================

-- 1. The global "clients" table (one row per signed-up user)
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text unique,
  age         integer,
  gender      text,
  goal        text,
  weight      numeric,
  height      numeric,
  activity    text,
  phone       text,
  medical     text,
  created_at  timestamptz default now()
);

-- 2. Turn on Row Level Security
alter table public.clients enable row level security;

-- 3. Allow the browser (anon key) to read + add + update client rows.
--    This is a simple shared CRM, so public access is intentional.
drop policy if exists "fitgeek_public_select" on public.clients;
drop policy if exists "fitgeek_public_insert" on public.clients;
drop policy if exists "fitgeek_public_update" on public.clients;
drop policy if exists "fitgeek_public_delete" on public.clients;

create policy "fitgeek_public_select" on public.clients
  for select using (true);

create policy "fitgeek_public_insert" on public.clients
  for insert with check (true);

create policy "fitgeek_public_update" on public.clients
  for update using (true) with check (true);

create policy "fitgeek_public_delete" on public.clients
  for delete using (true);
