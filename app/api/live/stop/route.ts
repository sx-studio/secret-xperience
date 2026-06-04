import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { EgressClient } from 'livekit-server-sdk'

const LIVEKIT_URL    = process.env.LIVEKIT_URL || ''
const LIVEKIT_KEY    = process.env.LIVEKIT_API_KEY || ''
const LIVEKIT_SECRET = process.env.LIVEKIT_API_SECRET || ''

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { streamId } = await req.json().catch(() => ({}))
  if (!streamId) return NextResponse.json({ error: 'streamId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: stream } = await admin
    .from('live_streams').select('id, provider_id, egress_id, status').eq('id', streamId).maybeSingle()
  if (!stream) return NextResponse.json({ error: 'Stream not found' }, { status: 404 })

  // Only the host or an admin can stop it.
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
  if (stream.provider_id !== session.user.id && prof?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let recordingUrl: string | null = null
  if (stream.egress_id && LIVEKIT_URL) {
    try {
      const egress = new EgressClient(LIVEKIT_URL, LIVEKIT_KEY, LIVEKIT_SECRET)
      await egress.stopEgress(stream.egress_id)
      // Public URL where the egress wrote the MP4 (Supabase Storage public bucket).
      if (process.env.LIVE_REC_PUBLIC_BASE) {
        recordingUrl = `${process.env.LIVE_REC_PUBLIC_BASE.replace(/\/$/, '')}/${stream.id}.mp4`
      }
    } catch (e) {
      console.warn('[live] egress stop failed:', (e as Error).message)
    }
  }

  await admin.from('live_streams').update({
    status: 'ended',
    ended_at: new Date().toISOString(),
    ...(recordingUrl ? { recording_url: recordingUrl } : {}),
  }).eq('id', streamId)

  return NextResponse.json({ ok: true, recordingUrl })
}
