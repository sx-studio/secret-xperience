-- Events table (app/events/*, app/sitemap.ts) — backfills the schema into
-- version control. The live project already has this table (created earlier in
-- the Supabase SQL editor); this migration is idempotent so it is a no-op there
-- and reproduces the schema on a fresh environment.
--
-- Columns are derived from every read/write site in app/events/ and the
-- refresh_events() function in 20260531_events_realtime_refresh.sql.

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  description  text,
  category     text,
  venue_name   text,
  city         text,
  country      text,
  date_start   date not null,
  date_end     date,
  recurring    text,                 -- '', 'weekly', 'monthly', 'quarterly', 'annual'/'yearly'
  price_from   numeric(8,2),
  image_url    text,
  website      text,
  tags         text[],
  featured     boolean not null default false,
  verified     boolean not null default false,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists events_active_date_idx on public.events (active, date_start);
create index if not exists events_country_idx     on public.events (country) where active = true;

alter table public.events enable row level security;

-- Public can read active events; only service_role writes (events are seeded/managed admin-side).
drop policy if exists "Active events are public" on public.events;
create policy "Active events are public" on public.events
  for select to anon, authenticated
  using (active = true);

grant select on public.events to anon, authenticated;
grant select, insert, update, delete on public.events to service_role;
