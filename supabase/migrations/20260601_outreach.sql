-- ── 1. Provider contact opt-in on listings ──────────────────────────────────
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS contact_phone    text,
  ADD COLUMN IF NOT EXISTS whatsapp_optin   boolean NOT NULL DEFAULT false;

-- ── 2. B2B leads table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name   text,
  contact_name    text NOT NULL,
  email           text NOT NULL,
  phone           text,
  category        text,   -- 'escort_agency' | 'venue' | 'nightlife' | 'massage' | 'other'
  country         text,
  city            text,
  message         text,
  source          text NOT NULL DEFAULT 'agency_form',   -- which form/page sent this
  consent_at      timestamptz NOT NULL DEFAULT now(),    -- GDPR consent timestamp
  created_at      timestamptz NOT NULL DEFAULT now(),
  contacted_at    timestamptz,
  status          text NOT NULL DEFAULT 'new'            -- 'new' | 'contacted' | 'converted' | 'declined'
);

-- RLS: only service_role can read/write leads (no public access)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role all leads"
  ON leads FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Anyone can insert their own lead (the form submission)
CREATE POLICY "public insert leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON leads TO anon, authenticated;
GRANT ALL    ON leads TO service_role;
