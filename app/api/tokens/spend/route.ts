/**
 * Spend tokens to publish / upgrade a listing tier
 *
 * POST { listingId, tier }
 * Tier costs:
 *   basic    →  25 tokens / 7 days
 *   featured →  50 tokens / 7 days
 *   slider   →  75 tokens / 7 days
 *   premium  → 150 tokens / 30 days
 *
 * Deducts from user wallet, writes ledger entry, updates listing tier.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const TIER_COSTS: Record<string, { tokens: number; days: number; label: string }> = {
  basic:    { tokens: 0,   days: 1,  label: 'Basic listing (24 hours)'  },
  featured: { tokens: 50,  days: 7,  label: 'Featured listing (7 days)' },
  slider:   { tokens: 75,  days: 7,  label: 'Slider Ad (7 days)'        },
  premium:  { tokens: 150, days: 30, label: 'Premium listing (30 days)' },
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId, tier } = await req.json()
  if (!listingId || !tier) return NextResponse.json({ error: 'listingId and tier required' }, { status: 400 })

  const cost = TIER_COSTS[tier]
  if (!cost) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify listing belongs to this user
  const { data: listing } = await admin
    .from('listings')
    .select('id, profile_id, tier, tier_expires_at')
    .eq('id', listingId)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.profile_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Check wallet balance
  const { data: wallet } = await admin
    .from('user_wallets')
    .select('balance, total_spent')
    .eq('user_id', session.user.id)
    .single()

  if (!wallet || wallet.balance < cost.tokens) {
    return NextResponse.json({ error: 'Insufficient tokens', balance: wallet?.balance ?? 0, required: cost.tokens }, { status: 402 })
  }

  const newBalance   = wallet.balance    - cost.tokens
  const newTotalSpent = wallet.total_spent + cost.tokens

  // Calculate expiry — extend from current expiry if still active
  const base = listing.tier_expires_at && new Date(listing.tier_expires_at) > new Date()
    ? new Date(listing.tier_expires_at)
    : new Date()
  base.setDate(base.getDate() + cost.days)

  // Deduct from wallet
  await admin.from('user_wallets').update({
    balance:     newBalance,
    total_spent: newTotalSpent,
    updated_at:  new Date().toISOString(),
  }).eq('user_id', session.user.id)

  // Write ledger
  await admin.from('token_ledger').insert({
    user_id:      session.user.id,
    amount:       -cost.tokens,
    balance_after: newBalance,
    type:         'spend',
    description:  cost.label,
    reference_id: listingId,
  })

  // Update listing tier
  const tierUpdates: Record<string, boolean | string> = {
    tier,
    tier_expires_at: base.toISOString(),
  }
  // Sync legacy columns for backwards compat with existing queries
  if (tier === 'featured' || tier === 'slider') {
    tierUpdates.featured_until = base.toISOString()
    tierUpdates.premium        = false
  }
  if (tier === 'premium') {
    tierUpdates.featured_until = base.toISOString()
    tierUpdates.premium        = true
  }

  await admin.from('listings').update(tierUpdates).eq('id', listingId)

  return NextResponse.json({
    success:    true,
    newBalance,
    tier,
    expires:    base.toISOString(),
    tokensSpent: cost.tokens,
  })
}
