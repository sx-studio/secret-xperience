-- Signup attribution: track which directory / ad network drove each signup.
-- First-touch UTM params are captured client-side into a cookie and recorded
-- here by the signup route (service_role).

create table if not exists signup_sources (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  email         text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  landing_page  text,
  referrer      text,
  created_at    timestamptz not null default now()
);

alter table signup_sources enable row level security;

-- service_role only — admin reads go through a service_role API route
create policy "service_role all signup_sources" on signup_sources
  for all to service_role using (true) with check (true);

grant all on signup_sources to service_role;

create index if not exists signup_sources_source_idx  on signup_sources (utm_source);
create index if not exists signup_sources_created_idx on signup_sources (created_at desc);
