import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AccessToken, EgressClient, EncodedFileType } from 'livekit-server-sdk'

const LIVEKIT_URL    = process.env.LIVEKIT_URL || ''
const LIVEKIT_KEY    = process.env.LIVEKIT_API_KEY || ''
const LIVEKIT_SECRET = process.env.LIVEKIT_API_SECRET || ''

export async function POST(req: Request) {
  if (!LIVEKIT_URL || !LIVEKIT_KEY || !LIVEKIT_SECRET) {
    return NextResponse.json({ configured: false, error: 'Live streaming is not configured yet.' }, { status: 503 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Compliance gate: only verified advertisers (or admin) can broadcast.
  const { data: prof } = await supabase
    .from('profiles').select('verified, role, full_name, username').eq('id', session.user.id).maybeSingle()
  let allowed = prof?.verified === true || prof?.role === 'admin'
  if (!allowed) {
    const { data: verif } = await supabase
      .from('identity_verifications').select('status').eq('user_id', session.user.id).maybeSingle()
    allowed = verif?.status === 'approved'
  }
  if (!allowed) {
    return NextResponse.json({ error: 'You must complete identity verification before going live.', gate: true }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const title = (body.title || 'Live Show').toString().slice(0, 80)

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // End any stale live rows for this advertiser first (one live stream per advertiser).
  await admin.from('live_streams').update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('provider_id', session.user.id).eq('status', 'live')

  const roomName = `sx_live_${session.user.id.slice(0, 8)}_${Date.now().toString(36)}`

  const { data: stream, error: insErr } = await admin.from('live_streams').insert({
    provider_id: session.user.id,
    title,
    room_name: roomName,
    status: 'live',
  }).select('id, room_name').single()

  if (insErr || !stream) {
    console.error('[live/start] stream insert failed:', insErr?.message)
    return NextResponse.json({ error: 'Could not create stream. Please try again.' }, { status: 500 })
  }

  // Broadcaster token — can publish camera/mic.
  const at = new AccessToken(LIVEKIT_KEY, LIVEKIT_SECRET, {
    identity: session.user.id,
    name: prof?.full_name || prof?.username || 'Host',
    ttl: '6h',
  })
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true })
  const token = await at.toJwt()

  // Best-effort recording via room-composite egress to S3-compatible storage.
  // Skipped silently if LIVE_REC_S3_* env vars are not set — streaming still works.
  let egressId: string | null = null
  if (process.env.LIVE_REC_S3_BUCKET && process.env.LIVE_REC_S3_ACCESS_KEY) {
    try {
      const egress = new EgressClient(LIVEKIT_URL, LIVEKIT_KEY, LIVEKIT_SECRET)
      const res = await egress.startRoomCompositeEgress(roomName, {
        fileType: EncodedFileType.MP4,
        filepath: `${stream.id}.mp4`,
        s3: {
          accessKey: process.env.LIVE_REC_S3_ACCESS_KEY!,
          secret:    process.env.LIVE_REC_S3_SECRET!,
          bucket:    process.env.LIVE_REC_S3_BUCKET!,
          region:    process.env.LIVE_REC_S3_REGION || 'us-east-1',
          endpoint:  process.env.LIVE_REC_S3_ENDPOINT || undefined,
          forcePathStyle: true,
        },
      } as any, { layout: 'speaker' })
      egressId = res.egressId
      await admin.from('live_streams').update({ egress_id: egressId }).eq('id', stream.id)
    } catch (e) {
      console.warn('[live] egress start failed (recording disabled):', (e as Error).message)
    }
  }

  return NextResponse.json({
    ok: true,
    streamId: stream.id,
    roomName,
    token,
    url: LIVEKIT_URL,
    recording: !!egressId,
  })
}
