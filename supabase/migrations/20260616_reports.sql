-- Safety reports (app/report/page.tsx)
-- Anyone — including logged-out visitors — can file a report against a listing.
-- Admins review them in the Admin → Reports tab.
--
-- Idempotent: safe to run whether or not the table already exists in production.

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid,                       -- extracted from the reported URL; not FK-constrained (URL may be stale/external)
  url          text not null,
  reason       text not null,
  detail       text not null,
  email        text,                       -- optional reporter contact
  status       text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  admin_notes  text,
  reviewed_at  timestamptz,
  reviewed_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists reports_status_idx     on public.reports (status, created_at desc);
create index if not exists reports_listing_idx    on public.reports (listing_id);

alter table public.reports enable row level security;

-- Anyone may file a report (public safety feature). No SELECT for the public.
drop policy if exists "Anyone can file a report" on public.reports;
create policy "Anyone can file a report" on public.reports
  for insert to anon, authenticated
  with check (true);

-- Admins can read and triage every report.
drop policy if exists "Admins can read reports" on public.reports;
create policy "Admins can read reports" on public.reports
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports" on public.reports
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Service role retains full access for server-side moderation tooling.
grant select, insert, update, delete on public.reports to service_role;
grant insert on public.reports to anon, authenticated;
grant select, update on public.reports to authenticated;
