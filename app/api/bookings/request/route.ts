import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Non-payment booking request — used for escorts, companions, creators, nightlife, etc.
// Creates a meetup-request record with no online payment. Provider confirms via dashboard.
const NON_PAYABLE = ['escorts', 'companionship', 'massage', 'nightlife', 'creators', 'domination', 'experiences']

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing_id, date, time, duration, notes, meet_type } = await req.json()
  if (!listing_id) return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, profile_id, category')
    .eq('id', listing_id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  // Block anyone trying to route rentals/hotels/events/shop through here
  const cat = (listing.category || '').toLowerCase()
  if (!NON_PAYABLE.includes(cat)) {
    return NextResponse.json({ error: 'This listing type requires payment at booking.' }, { status: 400 })
  }

  const { data: booking, error } = await supabase.from('bookings').insert({
    listing_id,
    client_id:      session.user.id,
    provider_id:    listing.profile_id,
    date:           date || null,
    time:           time || null,
    duration_hours: duration ? Math.round(parseFloat(duration)) : null,
    total_amount:   0,
    currency:       'EUR',
    status:         'pending',
    notes:          notes || null,
    meet_type:      meet_type || null,
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify provider (fire-and-forget)
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'
  fetch(`${origin}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.INTERNAL_SECRET || 'sx-internal'}` },
    body: JSON.stringify({ type: 'booking_created', booking_id: booking.id }),
  }).catch(() => {})

  return NextResponse.json({ ok: true, booking_id: booking.id })
}
