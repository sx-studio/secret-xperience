import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { streamId, url } = await req.json().catch(() => ({}))
  if (!streamId || !url) return NextResponse.json({ error: 'streamId and url required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: stream } = await admin
    .from('live_streams').select('id, provider_id, status').eq('id', streamId).maybeSingle()
  if (!stream) return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
  if (stream.provider_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await admin.from('live_streams').update({ thumbnail_url: url }).eq('id', streamId)
  return NextResponse.json({ ok: true })
}
