-- Allow providers to attach short video clips to their listings (max 3).
-- Stored as an array of public Supabase Storage URLs, same pattern as images.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS videos text[] DEFAULT NULL;
