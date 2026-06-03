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

  const endpoint = mode === 'ideas'
    ? '/v3/keywords_data/google_ads/keywords_for_keywords/live'
    : '/v3/keywords_data/google_ads/search_volume/live'

  const auth = Buffer.from(`${DFS_LOGIN}:${DFS_PASS}`).toString('base64')

  try {
    const upstream = await fetch(`${DFS_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        location_name: market.location,
        language_code: language,
        keywords: keywords.slice(0, mode === 'ideas' ? 20 : 100),
      }]),
    })

    const json = await upstream.json().catch(() => null)
    const statusMsg = json?.status_message || 'unknown'
    const items: any[] = json?.tasks?.[0]?.result || []

    // Normalise to a stable shape the UI/skill can rely on.
    const results = items
      .filter((it: any) => it && it.keyword)
      .map((it: any) => ({
        keyword:    it.keyword,
        volume:     it.search_volume ?? null,
        cpc:        it.cpc ?? null,
        competition: it.competition ?? null,
        competitionIndex: it.competition_index ?? null,
      }))
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
