-- Per-photo thumbnail focal point, keyed by image URL: { "<url>": { "x": 50, "y": 20 } }
-- x/y are percentages (0-100) used as CSS object-position on listing card thumbnails.
-- Keyed by URL (not array index) so it survives photo reordering/removal.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS image_focus jsonb NOT NULL DEFAULT '{}'::jsonb;
