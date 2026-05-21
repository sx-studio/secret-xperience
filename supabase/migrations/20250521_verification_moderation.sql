-- ═══════════════════════════════════════════════════════════
-- SecretXperience — Identity Verification + Content Moderation
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── IDENTITY VERIFICATIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS identity_verifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'not_submitted'
    CHECK (status IN ('not_submitted','pending','approved','rejected')),
  doc_front_url   text,
  doc_back_url    text,
  selfie_url      text,
  submitted_at    timestamptz,
  reviewed_at     timestamptz,
  reviewer_id     uuid REFERENCES auth.users(id),
  reviewer_notes  text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_id_verif_user   ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_id_verif_status ON identity_verifications(status);

-- ── LISTING MODERATION STATUS ────────────────────────────────
-- status: pending (new, awaiting review) | approved | rejected | expired
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','expired')),
  ADD COLUMN IF NOT EXISTS moderation_score  numeric(5,4),
  ADD COLUMN IF NOT EXISTS moderation_flags  jsonb,
  ADD COLUMN IF NOT EXISTS moderation_at     timestamptz;

-- Existing active listings are already approved
UPDATE listings SET status = 'approved' WHERE active = true AND status = 'pending';

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own verification"
  ON identity_verifications FOR ALL USING (auth.uid() = user_id);

-- Admins can read all verifications (match your admin check)
CREATE POLICY "admin read all verifications"
  ON identity_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
