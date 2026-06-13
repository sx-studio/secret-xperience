/**
 * Spend tokens to publish / upgrade a listing tier
 *
 * POST { listingId, tier }
 * Tier costs (priced ~20% under competitor Quartier-Rouge):
 *   basic    →   free / permanent
 *   featured →   50 tokens / 7 days   (€5  — entry placement)
 *   slider   →  200 tokens / 7 days   (€20 — rotating slideshow ad)
 *   premium  →  300 tokens / 30 days  (€30 — top of category for a month)
 *   section  →  240 tokens / 7 days   (€24 — full-width banner on one category page)
 *   homepage → 1100 tokens / 30 days  (€110 — full-width banner on the homepage)
 *
 * Deducts from user wallet, writes ledger entry, updates listing tier.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const TIER_COSTS: Record<string, { tokens: number; days: number; label: string }> = {
  basic:    { tokens: 0,    days: 1,  label: 'Basic listing (24 hours)'         },
  featured: { tokens: 50,   days: 7,  label: 'Featured advertisement (7 days)'        },
  slider:   { tokens: 200,  days: 7,  label: 'Slider Ad (7 days)'               },
  premium:  { tokens: 300,  days: 30, label: 'Premium listing (30 days)'        },
  section:  { tokens: 240,  days: 7,  label: 'Section Premium banner (7 days)'  },
  homepage: { tokens: 1100, days: 30, label: 'Homepage Premium banner (30 days)'},
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

  // Verify advertisement belongs to this user
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

  // Deduct from wallet — optimistic lock: only update if balance is still what we read.
  // If another request changed the balance concurrently, this affects 0 rows and we reject.
  const { error: walletErr, data: walletResult } = await admin.from('user_wallets').update({
    balance:     newBalance,
    total_spent: newTotalSpent,
    updated_at:  new Date().toISOString(),
  }).eq('user_id', session.user.id).eq('balance', wallet.balance).select('balance')

  if (walletErr || !walletResult?.length) {
    if (!walletErr) {
      // 0 rows matched — balance changed concurrently; re-check current balance
      return NextResponse.json({ error: 'Balance changed during transaction. Please try again.' }, { status: 409 })
    }
    console.error('Token spend: wallet update failed', walletErr)
    return NextResponse.json({ error: 'Failed to deduct tokens. Please try again.' }, { status: 500 })
  }

  // Write ledger
  const { error: ledgerErr } = await admin.from('token_ledger').insert({
    user_id:      session.user.id,
    amount:       -cost.tokens,
    balance_after: newBalance,
    type:         'spend',
    description:  cost.label,
    reference_id: listingId,
  })

  if (ledgerErr) {
    console.error('Token spend: ledger insert failed', ledgerErr)
    // Reverse wallet deduction to keep balance consistent.
    await admin.from('user_wallets').update({
      balance:     wallet.balance,
      total_spent: wallet.total_spent,
    }).eq('user_id', session.user.id)
    return NextResponse.json({ error: 'Transaction record failed. Your balance was not changed.' }, { status: 500 })
  }

  // Update listing tier
  const tierUpdates: Record<string, boolean | string> = {
    tier,
    tier_expires_at: base.toISOString(),
  }
  // Sync legacy columns for backwards compat with existing queries.
  // Every paid tier sets featured_until so it keeps slider/featured visibility;
  // premium/section/homepage also flip the premium badge on.
  if (tier === 'featured' || tier === 'slider') {
    tierUpdates.featured_until = base.toISOString()
    tierUpdates.premium        = false
  }
  if (tier === 'premium' || tier === 'section' || tier === 'homepage') {
    tierUpdates.featured_until = base.toISOString()
    tierUpdates.premium        = true
  }

  const { error: listingErr } = await admin.from('listings').update(tierUpdates).eq('id', listingId)

  if (listingErr) {
    console.error('Token spend: listing tier update failed', listingErr)
    // Tokens were spent and ledger was written — return success but flag the
    // tier update failure so the client can show a warning to contact support.
    return NextResponse.json({
      success:     true,
      newBalance,
      tier,
      expires:     base.toISOString(),
      tokensSpent: cost.tokens,
      warning:     'Tier upgrade may not have applied. Contact support if your listing does not show the upgraded tier.',
    })
  }

  return NextResponse.json({
    success:    true,
    newBalance,
    tier,
    expires:    base.toISOString(),
    tokensSpent: cost.tokens,
  })
}
