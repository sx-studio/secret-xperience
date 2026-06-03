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

  // Use DataForSEO Labs (clickstream-backed) — Google Ads Keyword Planner
  // returns NULL volume for adult/sexual keywords, but Labs + clickstream does not.
  const endpoint = mode === 'ideas'
    ? '/v3/dataforseo_labs/google/keyword_ideas/live'
    : '/v3/dataforseo_labs/google/keyword_overview/live'

  const reqBody: any = {
    location_name: market.location,
    language_code: language,
    include_clickstream_data: true,   // unlocks volume for adult keywords
  }
  if (mode === 'ideas') {
    reqBody.keywords = keywords.slice(0, 20)   // ideas takes seeds
    reqBody.limit = 100
  } else {
    reqBody.keywords = keywords.slice(0, 100)  // overview takes exact terms
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
    // Labs nests rows under result[0].items; fall back to flat result for safety.
    const items: any[] = json?.tasks?.[0]?.result?.[0]?.items || json?.tasks?.[0]?.result || []

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
    console.log(`[keywords] mode=${mode} market=${marketKey}/${language} in=${keywords.length} status="${statusMsg}" out=${results.length}`)

    if (!upstream.ok || json?.status_code >= 40000) {
      return NextResponse.json({ error: `DataForSEO: ${statusMsg}`, results }, { status: 502 })
    }

    return NextResponse.json({ market: marketKey, language, mode, results })
  } catch (e: any) {
    console.error(`[keywords] fetch failed: ${e?.message || e}`)
    return NextResponse.json({ error: 'Failed to reach DataForSEO.' }, { status: 503 })
  }
}
