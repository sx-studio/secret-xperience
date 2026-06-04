-- Add two new paid ad placements to mirror competitor (Quartier-Rouge) structure:
--   section  → full-width banner across one category section page (7 days)
--   homepage → full-width banner on the homepage (30 days)
-- These extend the existing tier ladder (basic/featured/slider/premium).
-- The CHECK constraint on listings.tier must be widened to accept them.

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_tier_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_tier_check
  CHECK (tier IN ('basic','featured','slider','premium','section','homepage'));

-- Partial indexes so the section/homepage banner lookups stay fast.
CREATE INDEX IF NOT EXISTS listings_section_tier_idx
  ON public.listings (category, tier_expires_at)
  WHERE tier = 'section' AND active = true;

CREATE INDEX IF NOT EXISTS listings_homepage_tier_idx
  ON public.listings (tier_expires_at)
  WHERE tier = 'homepage' AND active = true;
