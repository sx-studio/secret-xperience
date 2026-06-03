import { NextRequest, NextResponse } from 'next/server'

// Stripcash credentials — set in Vercel env vars:
//   STRIPCASH_USER_ID   — your userId from the default affiliate link
//   STRIPCASH_API_KEY   — from Service → API for Domain (Bearer token)
const USER_ID = process.env.STRIPCASH_USER_ID || ''
const API_KEY  = process.env.STRIPCASH_API_KEY  || ''

// Aggregators endpoint (requires Bearer key); falls back to basic endpoint
const AGG_URL   = 'https://go.mavrtracktor.com/app/models-ext/models'
const BASIC_URL = 'https://go.mavrtracktor.com/api/models/online'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp    = new URL(req.url).searchParams
  const tag   = sp.get('tag')   || 'girls'
  const limit = Math.min(parseInt(sp.get('limit') || '24'), 48)

  // Viewer country from Vercel edge headers — used for geoban filtering
  const viewerCountry = (
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    ''
  ).toLowerCase()

  const params = new URLSearchParams({
    userId: USER_ID,
    tag,
    limit: String(limit),
    broadcastHD: '0',   // include SD too — more models
    status: 'public',
    // EU audience targeting — surface EN/NL/DE/FR/PT/PL speakers first
    modelsLanguage: 'en,nl,de,fr,pt,pl,it,es',
    scLabel: '1',       // required by EU law for EU-facing ad placements
  })

  try {
    // Try aggregators API first (richer data, requires API key)
    const headers: Record<string, string> = {}
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`

    let models: any[] = []
    let upstreamStatus = 0
    let upstreamUsed = 'aggregator'

    const aggRes = await fetch(`${AGG_URL}?${params}`, {
      headers,
      next: { revalidate: 30 },
    })
    upstreamStatus = aggRes.status

    if (aggRes.ok) {
      const d = await aggRes.json()
      models = d.models || []
    } else {
      // Fallback: basic endpoint
      upstreamUsed = 'basic'
      const basicRes = await fetch(`${BASIC_URL}?${params}`, {
        next: { revalidate: 30 },
      })
      upstreamStatus = basicRes.status
      if (basicRes.ok) {
        const d = await basicRes.json()
        models = d.models || []
      }
    }

    // Filter: only public streams, respect geobans
    const filtered = models
      .filter((m: any) => m.status === 'public')
      .filter((m: any) => {
        if (!viewerCountry || !m.geobans) return true
        const blocked: string[] = m.geobans.blockedCountries || []
        return !blocked.includes(viewerCountry)
      })
      .map((m: any) => ({
        id:                   m.id,
        username:             m.username,
        snapshotUrl:          m.snapshotUrl,
        previewUrlThumbSmall: m.previewUrlThumbSmall,
        clickUrl:             m.clickUrl ? `${m.clickUrl}${m.clickUrl.includes('?') ? '&' : '?'}action=sb50tokens` : m.clickUrl,
        modelsCountry:        m.modelsCountry || '',
        tags:                 m.tags || [],
        viewersCount:         m.viewersCount || 0,
        broadcastHD:          m.broadcastHD || false,
        broadcastVR:          m.broadcastVR || false,
        languages:            m.languages || [],
        streamRatio:          m.stream ? (m.stream.height > m.stream.width ? 'vertical' : 'horizontal') : 'horizontal',
      }))

    // Observability (no PII): credential presence, upstream status, counts.
    console.log(`[cams] tag=${tag} keyPresent=${!!API_KEY} userIdPresent=${!!USER_ID} upstream=${upstreamUsed} status=${upstreamStatus} raw=${models.length} returned=${filtered.length} viewer=${viewerCountry || 'n/a'}`)

    return NextResponse.json({ models: filtered }, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (e: any) {
    console.error(`[cams] fetch failed keyPresent=${!!API_KEY} userIdPresent=${!!USER_ID} err=${e?.message || e}`)
    return NextResponse.json({ models: [] }, { status: 503 })
  }
}
