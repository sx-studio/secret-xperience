-- COMPLIANCE: only identity-verified providers may publish listings.
-- Required for payment-processor (Verotel) onboarding — performers must have
-- submitted and had approved ID before any content goes live.
--
-- Implemented as a RESTRICTIVE policy so it AND's with the existing permissive
-- "insert own listing" policy: a row can only be inserted if the author's
-- profile is verified (or they are an admin). service_role (server routes)
-- bypasses RLS entirely and is unaffected.

DROP POLICY IF EXISTS "Only verified providers can publish listings" ON public.listings;

CREATE POLICY "Only verified providers can publish listings"
  ON public.listings
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.verified = true OR p.role = 'admin')
    )
  );

-- COMPLIANCE: record the performer's explicit, affirmative consent at the moment
-- of ID submission (age confirmation, ownership of documents, permission to
-- process them for age/identity verification). Verotel requires a consent record.
ALTER TABLE public.identity_verifications
  ADD COLUMN IF NOT EXISTS consent_given boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_at    timestamptz;
