import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { siteUrl as canonicalSiteUrl } from '../../lib/site'

const PLANS: Record<string, { label: string; days: number; amount: number }> = {
  week:  { label: '7-Day Featured Boost',  days: 7,  amount: 2900  },
  month: { label: '30-Day Featured Boost', days: 30, amount: 7900  },
}

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

  const { listing_id, plan } = await req.json()
  if (!listing_id || !plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, profile_id')
    .eq('id', listing_id)
    .eq('profile_id', session.user.id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 404 })

  const p = PLANS[plan]
  const siteUrl = canonicalSiteUrl()

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: p.label,
          description: `"${listing.title}" will appear at the top of search results for ${p.days} days.`,
        },
        unit_amount: p.amount,
      },
      quantity: 1,
    }],
    metadata: {
      type: 'featured_boost',
      listing_id,
      plan,
      days: String(p.days),
    },
    success_url: `${siteUrl}/dashboard?boost=success`,
    cancel_url:  `${siteUrl}/dashboard`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
