-- Auto-expire listing tiers when tier_expires_at passes
-- Resets premium flag, clears featured_until and tier so badges stop showing

create or replace function public.expire_listing_tiers()
returns void
language plpgsql
security definer
as $$
begin
  update public.listings
  set
    premium = false,
    featured_until = null,
    tier = 'basic'
  where tier_expires_at is not null
    and tier_expires_at < now()
    and (premium = true or featured_until is not null or tier <> 'basic');
end;
$$;

-- Schedule hourly via pg_cron (idempotent: unschedule first if it already exists)
do $$
begin
  perform cron.unschedule('expire_listing_tiers_hourly');
exception when others then
  null;
end;
$$;

select cron.schedule(
  'expire_listing_tiers_hourly',
  '0 * * * *',
  $$select public.expire_listing_tiers();$$
);

-- Index to make the expiry sweep fast
create index if not exists listings_tier_expires_at_idx
  on public.listings (tier_expires_at)
  where tier_expires_at is not null;
