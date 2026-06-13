import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Host pings this while live so the public grid shows a current viewer count.
export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { streamId, viewers } = await req.json().catch(() => ({}))
  if (!streamId) return NextResponse.json({ error: 'streamId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const v = Math.max(0, parseInt(viewers, 10) || 0)
  const { data: cur } = await admin.from('live_streams').select('peak_viewers, status, provider_id').eq('id', streamId).maybeSingle()
  if (!cur || cur.status !== 'live') return NextResponse.json({ ok: false })
  if (cur.provider_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await admin.from('live_streams').update({
    viewer_count: v,
    peak_viewers: Math.max(v, cur.peak_viewers || 0),
  }).eq('id', streamId)

  return NextResponse.json({ ok: true })
}
