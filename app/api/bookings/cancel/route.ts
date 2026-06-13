import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, client_id')
    .eq('id', bookingId)
    .maybeSingle()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.client_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return NextResponse.json({ error: 'Booking cannot be cancelled' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: cancelErr } = await admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
  if (cancelErr) {
    console.error('[bookings/cancel] update failed:', cancelErr.message)
    return NextResponse.json({ error: 'Failed to cancel booking. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
