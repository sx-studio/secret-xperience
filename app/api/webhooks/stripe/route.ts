import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata || {}

    if (meta.type === 'featured_boost' && meta.listing_id) {
      // Extend featured_until: start from now or current expiry, whichever is later
      const days = parseInt(meta.days || '7')
      const { data: listing } = await supabaseAdmin
        .from('listings')
        .select('featured_until')
        .eq('id', meta.listing_id)
        .single()
      const base = listing?.featured_until && new Date(listing.featured_until) > new Date()
        ? new Date(listing.featured_until)
        : new Date()
      base.setDate(base.getDate() + days)
      await supabaseAdmin.from('listings').update({
        featured_until: base.toISOString(),
        premium: true,
      }).eq('id', meta.listing_id)
      // Fire listing_boosted notification (fire-and-forget)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.INTERNAL_SECRET || 'sx-internal'}` },
        body: JSON.stringify({ type: 'listing_boosted', booking_id: meta.listing_id }),
      }).catch(() => {})
    } else if (meta.booking_id) {
      await supabaseAdmin.from('bookings').update({
        status: 'confirmed',
        stripe_payment_intent: session.payment_intent as string,
      }).eq('id', meta.booking_id)
      // Fire booking_confirmed notification
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.INTERNAL_SECRET || 'sx-internal'}` },
        body: JSON.stringify({ type: 'booking_confirmed', booking_id: meta.booking_id }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ received: true })
}
