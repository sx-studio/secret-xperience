-- Search performance indexes for /search page
-- Uses pg_trgm for fast ilike '%q%' queries on title/description/city/subcategory

create extension if not exists pg_trgm;

create index if not exists listings_title_trgm_idx
  on public.listings using gin (title gin_trgm_ops);

create index if not exists listings_description_trgm_idx
  on public.listings using gin (description gin_trgm_ops);

create index if not exists listings_city_trgm_idx
  on public.listings using gin (city gin_trgm_ops);

create index if not exists listings_subcategory_trgm_idx
  on public.listings using gin (subcategory gin_trgm_ops);

-- Composite for the active-listings filter path
create index if not exists listings_active_category_idx
  on public.listings (active, category)
  where active = true;
