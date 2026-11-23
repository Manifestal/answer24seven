-- Answer24Seven demo receptionist. This is a dedicated calls table; do not add synthetic rows.
create extension if not exists pgcrypto;
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  vapi_call_id text not null unique,
  caller_number text,
  caller_name text,
  business_name text,
  need text,
  demo_time_requested text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  transcript text,
  summary text,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists calls_created_at_desc_idx on public.calls (created_at desc);
-- RLS enabled; server accesses via service_role, never expose that key to browser code.
alter table public.calls enable row level security;
