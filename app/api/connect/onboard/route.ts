import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { siteUrl as canonicalSiteUrl } from '../../../lib/site'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id, full_name, email')
    .eq('id', session.user.id)
    .single()

  let accountId = profile?.stripe_connect_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: profile?.email || session.user.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: { supabase_user_id: session.user.id },
    })
    accountId = account.id
    await supabase
      .from('profiles')
      .update({ stripe_connect_account_id: accountId })
      .eq('id', session.user.id)
  }

  const siteUrl = canonicalSiteUrl()
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl}/dashboard?connect=refresh`,
    return_url:  `${siteUrl}/dashboard?connect=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
