import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const FLASH_BOOST_TOKENS = 20 // ~€2 worth of tokens
const FLASH_BOOST_HOURS  = 6

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing_id } = await req.json()
  if (!listing_id) return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify advertisement ownership
  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select('id, title, featured_until')
    .eq('id', listing_id)
    .eq('profile_id', session.user.id)
    .maybeSingle()

  if (!listing) return NextResponse.json({ error: 'Listing not found or access denied' }, { status: 404 })

  // Check token balance
  const { data: wallet } = await supabaseAdmin
    .from('user_wallets')
    .select('balance')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!wallet || wallet.balance < FLASH_BOOST_TOKENS) {
    return NextResponse.json(
      { error: `Not enough tokens. Flash boost costs ${FLASH_BOOST_TOKENS} tokens.` },
      { status: 402 }
    )
  }

  // Set featured_until to 6 hours from now (or extend if already boosted)
  const base = listing.featured_until && new Date(listing.featured_until) > new Date()
    ? new Date(listing.featured_until)
    : new Date()
  const featured_until = new Date(base.getTime() + FLASH_BOOST_HOURS * 60 * 60 * 1000).toISOString()

  const [{ error: walletErr }, { error: listingErr }, { error: ledgerErr }] = await Promise.all([
    supabaseAdmin
      .from('user_wallets')
      .update({ balance: wallet.balance - FLASH_BOOST_TOKENS })
      .eq('user_id', session.user.id),
    supabaseAdmin
      .from('listings')
      .update({ featured_until, premium: true })
      .eq('id', listing_id),
    supabaseAdmin
      .from('token_ledger')
      .insert({
        user_id: session.user.id,
        amount: -FLASH_BOOST_TOKENS,
        type: 'spend',
        description: `Flash boost: "${listing.title}" — 6 hours`,
      }),
  ])

  if (walletErr || listingErr) {
    console.error('[flash-boost]', walletErr, listingErr, ledgerErr)
    return NextResponse.json({ error: 'Update failed, tokens not deducted' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, featured_until })
}
