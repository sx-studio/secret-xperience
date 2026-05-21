-- ═══════════════════════════════════════════════════════════
-- SecretXperience — Token System & Listing Tiers Migration
-- Safe first-run version — no DROP statements
-- ═══════════════════════════════════════════════════════════

-- ── TOKEN PACKAGES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_packages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  tokens       int  NOT NULL,
  bonus_tokens int  NOT NULL DEFAULT 0,
  price_eur    numeric(8,2) NOT NULL,
  popular      boolean NOT NULL DEFAULT false,
  active       boolean NOT NULL DEFAULT true,
  sort_order   int  NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

INSERT INTO token_packages (name, slug, tokens, bonus_tokens, price_eur, popular, sort_order) VALUES
  ('Starter',  'starter',  25,  0,   2.50,  false, 1),
  ('Basic',    'basic',    50,  0,   5.00,  false, 2),
  ('Standard', 'standard', 150, 0,   15.00, false, 3),
  ('Popular',  'popular',  200, 10,  20.00, true,  4),
  ('Pro',      'pro',      350, 25,  35.00, false, 5),
  ('Business', 'business', 500, 50,  50.00, false, 6),
  ('Elite',    'elite',    750, 100, 75.00, false, 7)
ON CONFLICT (slug) DO NOTHING;

-- ── USER WALLETS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_wallets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance         int  NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased int  NOT NULL DEFAULT 0,
  total_spent     int  NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_wallets(user_id);

-- Auto-create wallet for every new signup
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();

-- ── TOKEN LEDGER ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_ledger (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       int  NOT NULL,
  balance_after int NOT NULL,
  type         text NOT NULL CHECK (type IN ('purchase','spend','refund','bonus','admin')),
  description  text,
  reference_id text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_ledger_user ON token_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_token_ledger_type ON token_ledger(type);

-- ── PAYMENT ORDERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id        uuid REFERENCES token_packages(id),
  tokens_granted    int  NOT NULL,
  amount_eur        numeric(8,2) NOT NULL,
  provider          text NOT NULL DEFAULT 'ccbill',
  provider_order_id text,
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','failed','refunded','chargeback')),
  webhook_payload   jsonb,
  created_at        timestamptz DEFAULT now(),
  completed_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user        ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status      ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_provider_id ON payment_orders(provider_order_id);

-- ── LISTING TIERS ─────────────────────────────────────────────
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS tier            text NOT NULL DEFAULT 'basic'
    CHECK (tier IN ('basic','featured','slider','premium')),
  ADD COLUMN IF NOT EXISTS tier_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS token_order_id  uuid REFERENCES payment_orders(id);

-- ── AFFILIATES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  affiliate_code   text NOT NULL UNIQUE,
  ccbill_aff_id    text,
  clicks           int  NOT NULL DEFAULT 0,
  conversions      int  NOT NULL DEFAULT 0,
  total_earned_eur numeric(10,2) NOT NULL DEFAULT 0,
  payout_email     text,
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_ledger   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read token_packages" ON token_packages FOR SELECT USING (active = true);
CREATE POLICY "own wallet"    ON user_wallets   FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "own ledger"    ON token_ledger   FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own orders"    ON payment_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own affiliate" ON affiliates     FOR SELECT USING (auth.uid() = user_id);
