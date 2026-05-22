-- Platform audit fixes applied 2026-05-22
-- Creates missing tables, fixes grants, security hardening, admin policies

-- ── 1. Create favorites table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, listing_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;
GRANT ALL ON favorites TO service_role;

-- ── 2. Create listing_views table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at  timestamptz DEFAULT now()
);
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone can track views"
  ON listing_views FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Providers read own listing views"
  ON listing_views FOR SELECT
  USING (
    listing_id IN (SELECT id FROM listings WHERE profile_id = auth.uid())
  );
GRANT INSERT ON listing_views TO anon, authenticated;
GRANT SELECT ON listing_views TO authenticated;
GRANT ALL ON listing_views TO service_role;

-- ── 3. Comprehensive service_role grants on all core tables ─────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON listings               TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles               TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings               TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages               TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications          TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_wallets           TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON token_ledger           TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON token_packages         TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON identity_verifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_orders         TO service_role;

-- Authenticated grants (tightened — wallet balance only via service_role)
GRANT SELECT, INSERT, UPDATE, DELETE ON listings     TO authenticated;
GRANT SELECT, UPDATE                 ON profiles     TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON bookings     TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON messages     TO authenticated;
GRANT SELECT, UPDATE                 ON notifications TO authenticated;
GRANT SELECT                         ON user_wallets  TO authenticated;
GRANT SELECT                         ON token_ledger  TO authenticated;
GRANT SELECT                         ON token_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON identity_verifications TO authenticated;

-- ── 4. Admin UPDATE policy on identity_verifications ─────────────────────
-- (allows admin to approve/reject via browser client)
CREATE POLICY IF NOT EXISTS "admin update all verifications"
  ON identity_verifications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── 5. Admin INSERT policy on notifications ──────────────────────────────
-- (allows admin page to send verification result notifications)
CREATE POLICY IF NOT EXISTS "admin insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── 6. Prevent authenticated users from deleting their wallet ────────────
REVOKE DELETE ON user_wallets FROM authenticated;
-- (balance changes are service_role only)
