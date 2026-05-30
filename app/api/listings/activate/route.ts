/**
 * Reactivate a deactivated listing by deducting the first day's token cost.
 *
 * POST { listingId }
 *
 * Requirements:
 *  - User must be authenticated
 *  - Listing must belong to the authenticated user
 *  - Wallet must have at least the daily rate for the listing's tier
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const DAILY_RATES: Record<string, number> = {
  premium:  15,
  slider:   10,
  featured: 6,
  basic:    3,
}

export async function POST(req: NextRequest) {
  // cookies() is synchronous in Next.js 13.5.1 — never await
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { listingId } = body
  if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify listing belongs to this user
  const { data: listing } = await admin
    .from('listings')
    .select('id, profile_id, tier, trial_ends_at')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.profile_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const dailyCost = DAILY_RATES[listing.tier] ?? DAILY_RATES.basic

  // Check wallet balance
  const { data: wallet } = await admin
    .from('user_wallets')
    .select('balance, total_spent')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!wallet || wallet.balance < dailyCost) {
    return NextResponse.json(
      { error: 'Insufficient tokens', balance: wallet?.balance ?? 0, required: dailyCost },
      { status: 402 }
    )
  }

  const newBalance    = wallet.balance    - dailyCost
  const newTotalSpent = wallet.total_spent + dailyCost

  // Deduct from wallet
  await admin.from('user_wallets').update({
    balance:     newBalance,
    total_spent: newTotalSpent,
    updated_at:  new Date().toISOString(),
  }).eq('user_id', session.user.id)

  // Write ledger entry
  await admin.from('token_ledger').insert({
    user_id:       session.user.id,
    amount:        -dailyCost,
    balance_after: newBalance,
    type:          'spend',
    description:   'Listing reactivation (first day)',
    reference_id:  listingId,
  })

  // Reactivate listing and mark today's deduction as done
  await admin.from('listings').update({
    active:                    true,
    last_token_deduction_at:   new Date().toISOString().slice(0, 10),
  }).eq('id', listingId)

  return NextResponse.json({ ok: true, newBalance, dailyCost })
}
