# SecretXperience site taxonomy (for page-mapping)

Source of truth: `app/sitemap.ts`. Keep this in sync if routes change.

## Categories (top-level routes)
`/escorts`, `/private-reception`, `/companionship`, `/nightlife`, `/creators`,
`/rentals`, `/hotels`, `/shop`, `/events`, `/live` (live cams), `/discover`,
`/partners`, `/search`.

## Cities (26) — used in city×category routes
brussels, antwerp, ghent, grimbergen, leuven, mechelen, hasselt, namur,
charleroi, kortrijk, ostend, amsterdam, rotterdam, berlin, hamburg, paris,
lyon, luxembourg, liege, bruges, cologne, zurich, geneva, basel, bern, lausanne.

## Countries (6)
belgium, netherlands, germany, france, luxembourg, switzerland.

## Route patterns
- **City × category**: `/{category}/{city}` where category ∈
  `{escorts, private-reception, nightlife, hotels, rentals}` (CITY_CATEGORIES).
  → These are the bread-and-butter local-SEO pages. 26 cities × 5 categories = 130 possible.
- **Country × category**: `/{category}/{country}` where category ∈
  `{escorts, private-reception}` (COUNTRY_CATEGORIES). 6 × 2 = 12 possible.
- **Listing**: `/listings/{id}` — individual provider/listing (DB-driven).
- **Profile**: `/profile/{id}` — provider profile (DB-driven).
- **Event**: `/events/{slug}` — DB-driven.

## Page-mapping rules
- A "local-commercial" keyword like `escort antwerp` → `/escorts/antwerp` (CITY_CATEGORY → **likely EXISTS**).
- `private reception luxembourg` → `/private-reception/luxembourg` (country×category → EXISTS).
- A city×category combo NOT in CITY_CATEGORIES (e.g. `/creators/berlin`) → **CREATE (new type)** or route to `/search?...`.
- Informational queries (`is escorting legal in belgium`) → no page exists → **CREATE (blog/guide)**.
- Brand queries → homepage `/`.

## Inventory check (optional, Tier 1)
To prioritise pages that will actually have listings, query the DB via Supabase MCP:
```sql
select city, category, count(*) 
from listings 
where active = true 
group by city, category 
order by count(*) desc;
```
Prioritise city×category pages that already have ≥1 active listing — they can rank AND convert immediately.
