-- Structured "Possibilities" service menu for escort / private-reception listings.
-- Stored as a flat array of selected labels; grouped into sections at display time.
-- Applied to project duwuzaelmggldhkgoebn via MCP on 2026-05-31; kept here for version control.

alter table public.listings
  add column if not exists services text[] default '{}'::text[];
