import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing_id, date, time, duration, price, notes, meet_type, location } = await req.json()

  if (!listing_id || !price) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, profile_id, category')
    .eq('id', listing_id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  // On-platform card payments only for rentals, hotels, events, shop — never for escort/sexual services
  const BOOKABLE = ['rentals', 'hotels', 'events', 'shop']
  if (!BOOKABLE.includes((listing.category || '').toLowerCase())) {
    return NextResponse.json({ error: 'On-platform payment is not available for this listing type.' }, { status: 400 })
  }

  const { data: provider } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id')
    .eq('id', listing.profile_id)
    .single()

  // Create a pending booking record first
  const { data: booking, error: bookingErr } = await supabase.from('bookings').insert({
    listing_id,
    client_id: session.user.id,
    provider_id: listing.profile_id,
    date: date || new Date().toISOString().split('T')[0],
    time: time || null,
    duration_hours: duration ? Math.round(parseFloat(duration)) : 1,
    total_amount: price,
    notes: notes || null,
    currency: 'EUR',
    status: 'pending',
  }).select('id').single()

  if (bookingErr) return NextResponse.json({ error: bookingErr.message }, { status: 500 })

  // Notify provider of new booking request (fire-and-forget)
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'
  fetch(`${siteOrigin}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.INTERNAL_SECRET || 'sx-internal'}` },
    body: JSON.stringify({ type: 'booking_created', booking_id: booking.id }),
  }).catch(() => {})

  const PLATFORM_FEE_PCT = 0.15
  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: listing.title,
          description: `${duration} · ${meet_type || 'Incall'} · ${date} ${time || ''}`.trim(),
        },
        unit_amount: price * 100,
      },
      quantity: 1,
    }],
    metadata: {
      booking_id: booking.id,
      listing_id,
      client_id: session.user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'}/dashboard?booking=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'}/?booking=cancelled`,
  }

  if (provider?.stripe_connect_account_id) {
    checkoutParams.payment_intent_data = {
      application_fee_amount: Math.round(price * 100 * PLATFORM_FEE_PCT),
      transfer_data: { destination: provider.stripe_connect_account_id },
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

  return NextResponse.json({ url: checkoutSession.url })
}
