-- Drop the two old conflicting cron jobs that fight with the token activation system.
-- expire-listings ran every 15min setting active=false based on tier_expires_at (old model).
-- expire-basic-listings ran hourly doing the same.
-- The new token model uses trial_ends_at + deduct_daily_listing_tokens instead.
DO $$
BEGIN
  PERFORM cron.unschedule('expire-listings');
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  PERFORM cron.unschedule('expire-basic-listings');
EXCEPTION WHEN others THEN NULL;
END;
$$;

-- Fix Ludmilla's listing: clear stale tier_expires_at so no cron can re-hide her.
-- She is within her 7-day free trial (trial_ends_at = 2026-06-06).
UPDATE listings
SET active = true,
    status = 'approved',
    tier_expires_at = NULL
WHERE id = '1a3c7343-ca6a-4085-b018-779f115ec0e1';
