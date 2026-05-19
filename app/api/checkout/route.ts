import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
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

  // Create a pending booking record first
  const { data: booking, error: bookingErr } = await supabase.from('bookings').insert({
    listing_id,
    client_id: session.user.id,
    provider_id: listing.profile_id,
    date: date || new Date().toISOString().split('T')[0],
    duration_hours: duration ? Math.round(parseFloat(duration)) : 1,
    total_amount: price * 100,
    currency: 'EUR',
    status: 'pending',
  }).select('id').single()

  if (bookingErr) return NextResponse.json({ error: bookingErr.message }, { status: 500 })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: listing.title,
          description: `${duration} · ${meet_type || 'Incall'} · ${date} ${time}`,
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
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://secret-xperience.vercel.app'}/dashboard?booking=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://secret-xperience.vercel.app'}/?booking=cancelled`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
