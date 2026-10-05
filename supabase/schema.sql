-- Run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists chapter_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  grade_group text,
  thrust text,
  content text not null,
  created_at timestamptz not null default now()
);

-- The app uses the service-role key server-side only. RLS stays on so the anon key cannot read.
alter table chapter_docs enable row level security;
alter table plans enable row level security;
