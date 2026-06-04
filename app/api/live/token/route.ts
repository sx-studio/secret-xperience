import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

const LIVEKIT_URL    = process.env.LIVEKIT_URL || ''
const LIVEKIT_KEY    = process.env.LIVEKIT_API_KEY || ''
const LIVEKIT_SECRET = process.env.LIVEKIT_API_SECRET || ''

// Issues a watch-only (subscribe) token for a live stream.
export async function POST(req: Request) {
  if (!LIVEKIT_URL || !LIVEKIT_KEY || !LIVEKIT_SECRET) {
    return NextResponse.json({ configured: false, error: 'Live streaming is not configured yet.' }, { status: 503 })
  }

  const { streamId, displayName } = await req.json().catch(() => ({}))
  if (!streamId) return NextResponse.json({ error: 'streamId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: stream } = await admin
    .from('live_streams').select('room_name, status').eq('id', streamId).maybeSingle()
  if (!stream) return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
  if (stream.status !== 'live') return NextResponse.json({ error: 'This stream has ended.', ended: true }, { status: 410 })

  const identity = `viewer_${Math.random().toString(36).slice(2, 11)}`
  const at = new AccessToken(LIVEKIT_KEY, LIVEKIT_SECRET, {
    identity,
    name: (displayName || 'Guest').toString().slice(0, 40),
    ttl: '3h',
  })
  // Watch-only: can subscribe and send chat data, cannot publish media.
  at.addGrant({ roomJoin: true, room: stream.room_name, canPublish: false, canSubscribe: true, canPublishData: true })
  const token = await at.toJwt()

  return NextResponse.json({ token, url: LIVEKIT_URL, roomName: stream.room_name })
}
