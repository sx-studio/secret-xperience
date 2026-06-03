import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// DataForSEO credentials — set in Vercel env vars (server-only):
//   DATAFORSEO_LOGIN     — API login (the support@ email)
//   DATAFORSEO_PASSWORD  — API password from the DataForSEO dashboard
const DFS_LOGIN = process.env.DATAFORSEO_LOGIN || ''
const DFS_PASS  = process.env.DATAFORSEO_PASSWORD || ''
const DFS_BASE  = 'https://api.dataforseo.com'

export const dynamic = 'force-dynamic'

// Market → DataForSEO location + default language for our EU markets.
const MARKETS: Record<string, { location: string; language: string }> = {
  be: { location: 'Belgium',     language: 'nl' },
  nl: { location: 'Netherlands', language: 'nl' },
  de: { location: 'Germany',     language: 'de' },
  fr: { location: 'France',      language: 'fr' },
  lu: { location: 'Luxembourg',  language: 'fr' },
  ch: { location: 'Switzerland', language: 'de' },
}

export async function POST(req: NextRequest) {
  // --- Auth: admins only (keyword data costs money per call) ---
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!DFS_LOGIN || !DFS_PASS) {
    return NextResponse.json({ error: 'DataForSEO credentials not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in Vercel.' }, { status: 503 })
  }

  // --- Parse request ---
  let body: any = {}
  try { body = await req.json() } catch { /* empty */ }
  const keywords: string[] = Array.isArray(body.keywords)
    ? body.keywords.map((k: any) => String(k).trim()).filter(Boolean).slice(0, 100)
    : []
  const marketKey = String(body.market || 'be').toLowerCase()
  const market = MARKETS[marketKey] || MARKETS.be
  const language = String(body.language || market.language).toLowerCase()
  const mode = body.mode === 'ideas' ? 'ideas' : 'volume'

  if (keywords.length === 0) {
    return NextResponse.json({ error: 'Provide at least one keyword.' }, { status: 400 })
  }

  // Exact volume: use the dedicated clickstream search-volume endpoint — it
  // computes volume for ANY keyword (incl. adult terms not in the Labs static DB,
  // which Google Ads nulls and keyword_overview returns empty for).
  // Ideas: Labs keyword_ideas expands seeds into DB keywords with clickstream volume.
  const endpoint = mode === 'ideas'
    ? '/v3/dataforseo_labs/google/keyword_ideas/live'
    : '/v3/keywords_data/clickstream_data/dataforseo_search_volume/live'

  const reqBody: any = {
    location_name: market.location,
    language_code: language,
  }
  if (mode === 'ideas') {
    reqBody.keywords = keywords.slice(0, 20)   // seeds
    reqBody.limit = 100
    reqBody.include_clickstream_data = true    // unlocks volume for adult keywords
  } else {
    reqBody.keywords = keywords.slice(0, 1000) // clickstream endpoint takes many exact terms
  }

  const auth = Buffer.from(`${DFS_LOGIN}:${DFS_PASS}`).toString('base64')

  try {
    const upstream = await fetch(`${DFS_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([reqBody]),
    })

    const json = await upstream.json().catch(() => null)
    const statusMsg = json?.status_message || 'unknown'
    const statusCode = json?.status_code ?? 0
    const task = json?.tasks?.[0] || {}
    const taskMsg = task?.status_message || 'n/a'
    const taskCode = task?.status_code ?? 0
    // Labs nests rows under result[0].items; fall back to flat result for safety.
    const items: any[] = task?.result?.[0]?.items || task?.result || []

    // Normalise. Prefer clickstream volume (works for adult terms), then Google Ads.
    const results = items
      .filter((it: any) => it && it.keyword)
      .map((it: any) => {
        const ki = it.keyword_info || {}
        const cs = it.clickstream_keyword_info || {}
        return {
          keyword:    it.keyword,
          volume:     ki.search_volume ?? cs.search_volume ?? it.search_volume ?? null,
          cpc:        ki.cpc ?? it.cpc ?? null,
          competition: ki.competition_level ?? ki.competition ?? it.competition ?? null,
          difficulty: it.keyword_properties?.keyword_difficulty ?? null,
        }
      })
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))

    // Observability (no creds, no PII).
    console.log(`[keywords] mode=${mode} market=${marketKey}/${language} in=${keywords.length} apiCode=${statusCode} taskCode=${taskCode} items=${items.length} out=${results.length}`)

    // Surface DataForSEO task-level errors (e.g. clickstream not in plan) to the UI.
    if (taskCode >= 40000) {
      return NextResponse.json({ error: `DataForSEO task ${taskCode}: ${taskMsg}`, results: [] }, { status: 502 })
    }
    if (!upstream.ok || statusCode >= 40000) {
      return NextResponse.json({ error: `DataForSEO: ${statusMsg}`, results }, { status: 502 })
    }
    // Friendly note when the provider has no volume for these terms (common for
    // exact adult keywords in smaller EU markets — use ideas mode / broader seeds).
    if (results.length === 0 || results.every(r => r.volume == null)) {
      return NextResponse.json({
        market: marketKey, language, mode, results,
        note: 'No volume data from DataForSEO for these terms in this market. Adult exact-match terms are often sparse — try "Keyword ideas" mode, a broader seed, or English.',
      })
    }

    return NextResponse.json({ market: marketKey, language, mode, results })
  } catch (e: any) {
    console.error(`[keywords] fetch failed: ${e?.message || e}`)
    return NextResponse.json({ error: 'Failed to reach DataForSEO.' }, { status: 503 })
  }
}
