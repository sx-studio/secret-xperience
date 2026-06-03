# DataForSEO integration (Tier 3 — real volume/CPC/difficulty)

SecretXperience uses **DataForSEO** for live keyword metrics. This file is the
concrete how-to. Use it when the user wants real numbers instead of relative
estimates.

## Credentials

DataForSEO uses HTTP Basic auth (login + password, not a bearer token).
Set these as environment variables — never hardcode or commit them:

- `DATAFORSEO_LOGIN`
- `DATAFORSEO_PASSWORD`

Check they exist before calling:
```bash
[ -n "$DATAFORSEO_LOGIN" ] && [ -n "$DATAFORSEO_PASSWORD" ] && echo "creds present" || echo "MISSING — fall back to Tier 1/2"
```

> Network note: this execution environment allowlists outbound hosts. If
> `api.dataforseo.com` is blocked, the call fails — fall back to Tier 1/2 and
> tell the user the host needs allowlisting (or run the skill where the API is reachable).

## Base

- Base URL: `https://api.dataforseo.com`
- Auth header: `Authorization: Basic $(printf '%s:%s' "$DATAFORSEO_LOGIN" "$DATAFORSEO_PASSWORD" | base64)`
- All POST bodies are a JSON **array of task objects** (you can batch up to 100 tasks/call).
- Locations/languages use DataForSEO codes. Common ones for our markets:

| Market | location_name | location_code | language_code |
|---|---|---|---|
| Belgium | Belgium | 2056 | nl / fr |
| Netherlands | Netherlands | 2528 | nl |
| Germany | Germany | 2276 | de |
| France | France | 2250 | fr |
| Luxembourg | Luxembourg | 2442 | fr |
| Switzerland | Switzerland | 2756 | de / fr |

Use `location_name`/`language_name` if you don't have the numeric codes handy — the API accepts either.

## The three endpoints you'll actually use

### 1. Search volume (exact terms you already have)
`POST /v3/keywords_data/google_ads/search_volume/live`
Returns avg monthly volume, CPC, competition for a list of keywords.

```bash
AUTH=$(printf '%s:%s' "$DATAFORSEO_LOGIN" "$DATAFORSEO_PASSWORD" | base64)
curl -s -X POST "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live" \
  -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  -d '[{
    "location_name": "Belgium",
    "language_code": "nl",
    "keywords": ["escort antwerpen", "privé ontvangst brussel", "escort gent"]
  }]'
```

### 2. Keyword ideas / expansion (seed → related keywords)
`POST /v3/keywords_data/google_ads/keywords_for_keywords/live`
Give it 1–20 seed keywords; it returns hundreds of related terms with volumes.
Best for Step 1 (seed expansion) when you want real demand attached.

```bash
curl -s -X POST "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live" \
  -H "Authorization: Basic $AUTH" -H "Content-Type: application/json" \
  -d '[{
    "location_name": "Germany",
    "language_code": "de",
    "keywords": ["begleitservice berlin", "escort berlin"]
  }]'
```

### 3. Ranked competitors / keyword gap
`POST /v3/dataforseo_labs/google/ranked_keywords/live` — keywords a given domain ranks for.
Use against a competitor domain for Step 6 gap analysis.

```bash
curl -s -X POST "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live" \
  -H "Authorization: Basic $AUTH" -H "Content-Type: application/json" \
  -d '[{
    "target": "redlights.be",
    "location_name": "Belgium",
    "language_code": "nl",
    "limit": 100
  }]'
```

For keyword difficulty specifically: `POST /v3/dataforseo_labs/google/bulk_keyword_difficulty/live`.

## Parsing results

Responses nest under `tasks[0].result[]`. Each item carries `keyword`,
`search_volume`, `cpc`, `competition` (and for Labs endpoints, `keyword_difficulty`,
`ranked_serp_element`). Pull the fields you need into the Step 3 cluster table.

Quick jq to flatten search-volume results:
```bash
... | jq -r '.tasks[0].result[] | [.keyword, .search_volume, .cpc, .competition] | @tsv'
```

## Cost discipline

DataForSEO bills per task/row. Be economical:
- Batch keywords into one task object rather than one call per keyword.
- Use `keywords_for_keywords` once per market with good seeds instead of many small calls.
- Cache results into `keyword-research/output/` so re-runs don't re-bill.
- For a first pass, Tier 1 already produces the cluster structure; call DataForSEO
  only to attach real volume to the clusters that survived prioritisation.

## Adapter shape for other providers (Ahrefs / Semrush)

If the user ever switches providers, keep the skill's logic identical and swap
only the fetch layer: input = list of keywords + market; output = normalise to
`{ keyword, volume, cpc, difficulty }`. The clustering, intent, mapping, and
prioritisation steps in `SKILL.md` don't change.
