-- Newsletter subscribers table
create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  active      boolean generated always as (unsubscribed_at is null) stored
);

alter table newsletter_subscribers enable row level security;

-- Service role can do everything; no public access
create policy "service role only" on newsletter_subscribers
  using (false);

-- Index for quick lookups
create index if not exists newsletter_subscribers_email_idx on newsletter_subscribers (email);
