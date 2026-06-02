-- Adds optional contact fields used by the listing creation form.
-- Without these, publishing fails: "column 'contact_phone' could not be found in the schema cache".
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS whatsapp_optin boolean NOT NULL DEFAULT false;
