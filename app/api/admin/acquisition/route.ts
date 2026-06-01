import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await admin
    .from('signup_sources')
    .select('utm_source, utm_medium, utm_campaign, referrer, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data || []

  // Group by source/medium/campaign, count signups, track most recent.
  const map = new Map<string, { source: string; medium: string; campaign: string; signups: number; last: string }>()
  for (const r of rows) {
    const source = r.utm_source || (r.referrer ? hostOf(r.referrer) : '(direct)')
    const medium = r.utm_medium || (r.referrer ? 'referral' : '(none)')
    const campaign = r.utm_campaign || '(none)'
    const key = `${source}|${medium}|${campaign}`
    const cur = map.get(key)
    if (cur) {
      cur.signups += 1
      if (r.created_at > cur.last) cur.last = r.created_at
    } else {
      map.set(key, { source, medium, campaign, signups: 1, last: r.created_at })
    }
  }

  const summary = Array.from(map.values()).sort((a, b) => b.signups - a.signups)

  return NextResponse.json({ summary, totalTracked: rows.length })
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}
