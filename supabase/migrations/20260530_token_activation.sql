-- Token-based listing activation (redlights.nl model)
-- Providers burn tokens daily to keep their listing visible.
-- New listings get a 7-day free trial; after that tokens are deducted daily.

-- Add trial period and daily-deduction tracking columns
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS trial_ends_at             timestamptz DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS last_token_deduction_at   date;

-- Daily token cost per tier
-- basic: 3/day  |  featured: 6/day  |  slider: 10/day  |  premium: 15/day
CREATE OR REPLACE FUNCTION public.deduct_daily_listing_tokens()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r          RECORD;
  daily_cost int;
  wallet_bal int;
BEGIN
  FOR r IN
    SELECT l.id, l.profile_id, l.tier, l.last_token_deduction_at, l.trial_ends_at
    FROM listings l
    WHERE l.active = true
      AND (l.trial_ends_at IS NULL OR l.trial_ends_at < now())
      AND (l.last_token_deduction_at IS NULL OR l.last_token_deduction_at < CURRENT_DATE)
  LOOP
    daily_cost := CASE r.tier
      WHEN 'premium'  THEN 15
      WHEN 'slider'   THEN 10
      WHEN 'featured' THEN 6
      ELSE 3
    END;

    SELECT balance INTO wallet_bal FROM user_wallets WHERE user_id = r.profile_id;

    IF wallet_bal IS NULL OR wallet_bal < daily_cost THEN
      -- Insufficient balance — deactivate listing and notify provider
      UPDATE listings SET active = false WHERE id = r.id;
      INSERT INTO notifications(user_id, type, title, body, link)
      VALUES (
        r.profile_id,
        'listing_deactivated',
        'Listing deactivated — tokens empty',
        'Your listing has been taken offline. Top up your token balance to reactivate it.',
        '/dashboard'
      );
    ELSE
      -- Deduct tokens and record in ledger
      UPDATE user_wallets
        SET balance     = balance - daily_cost,
            total_spent = total_spent + daily_cost,
            updated_at  = now()
      WHERE user_id = r.profile_id;

      INSERT INTO token_ledger(user_id, type, amount, balance_after, description, reference_id)
      SELECT
        r.profile_id,
        'spend',
        -daily_cost,
        w.balance,
        'Daily listing activation fee',
        r.id::text
      FROM user_wallets w WHERE w.user_id = r.profile_id;

      UPDATE listings SET last_token_deduction_at = CURRENT_DATE WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$;

-- Schedule daily at 00:05 UTC (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('deduct_daily_listing_tokens');
EXCEPTION WHEN others THEN
  NULL;
END;
$$;

SELECT cron.schedule(
  'deduct_daily_listing_tokens',
  '5 0 * * *',
  $$SELECT public.deduct_daily_listing_tokens();$$
);

-- Index to make the daily sweep fast
CREATE INDEX IF NOT EXISTS listings_token_deduction_idx
  ON listings (last_token_deduction_at, active, trial_ends_at)
  WHERE active = true;
