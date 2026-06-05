import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { RoomServiceClient } from 'livekit-server-sdk'

const LIVEKIT_URL    = process.env.LIVEKIT_URL || ''
const LIVEKIT_KEY    = process.env.LIVEKIT_API_KEY || ''
const LIVEKIT_SECRET = process.env.LIVEKIT_API_SECRET || ''

// Called by the livestreams list page on load.
// Checks every "live" stream against LiveKit: if the room is empty or gone, marks it ended.
export async function POST() {
  if (!LIVEKIT_URL || !LIVEKIT_KEY || !LIVEKIT_SECRET) {
    return NextResponse.json({ ok: true, cleaned: 0 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: liveStreams } = await admin
    .from('live_streams').select('id, room_name').eq('status', 'live')

  if (!liveStreams?.length) return NextResponse.json({ ok: true, cleaned: 0 })

  const roomSvc = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_KEY, LIVEKIT_SECRET)
  const toEnd: string[] = []

  await Promise.all(liveStreams.map(async (stream) => {
    try {
      const participants = await roomSvc.listParticipants(stream.room_name)
      // Mark ended if no one is publishing (broadcaster left, only viewers remain or room is empty).
      const hasPublisher = participants.some((p: any) => p.permission?.canPublish !== false)
      if (!hasPublisher) toEnd.push(stream.id)
    } catch {
      // Room not found in LiveKit → broadcaster already gone
      toEnd.push(stream.id)
    }
  }))

  if (toEnd.length > 0) {
    await admin.from('live_streams').update({
      status: 'ended',
      ended_at: new Date().toISOString(),
    }).in('id', toEnd)
  }

  return NextResponse.json({ ok: true, cleaned: toEnd.length })
}
