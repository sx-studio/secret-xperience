-- NEW MODEL: Basic listings are free and permanent. Paid tiers (featured/slider/
-- premium) are bought for a fixed duration, then downgrade to basic on expiry
-- (they stay ACTIVE — they just lose the badge/placement). No daily token burn.
-- This supersedes the daily-deduction model in 20260530_token_activation.sql.

-- 1. Stop the daily token deduction cron entirely.
DO $$
BEGIN
  PERFORM cron.unschedule('deduct_daily_listing_tokens');
EXCEPTION WHEN others THEN NULL;
END;
$$;

-- 2. Tier expiry now DOWNGRADES to basic and keeps the listing live.
CREATE OR REPLACE FUNCTION public.expire_listing_tiers()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.listings
  SET
    premium         = false,
    featured_until  = NULL,
    tier            = 'basic',
    tier_expires_at = NULL,
    status          = CASE WHEN status = 'expired' THEN 'approved' ELSE status END
  WHERE tier_expires_at IS NOT NULL
    AND tier_expires_at < now()
    AND (premium = true OR featured_until IS NOT NULL OR tier <> 'basic');
END;
$$;

-- 3. Revive every basic listing that a previous cron wrongly hid.
UPDATE public.listings
SET active = true,
    status = CASE WHEN status = 'expired' THEN 'approved' ELSE status END,
    tier_expires_at = NULL
WHERE tier = 'basic'
  AND active = false
  AND status IN ('expired', 'approved');

-- 4. Basic listings never carry a tier_expires_at going forward.
UPDATE public.listings
SET tier_expires_at = NULL
WHERE tier = 'basic' AND tier_expires_at IS NOT NULL;
