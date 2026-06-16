import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_AMOUNTS = [25, 50, 100, 200]

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { creatorId, amountTokens, message } = body

  if (!creatorId || typeof creatorId !== 'string')
    return NextResponse.json({ error: 'creatorId required' }, { status: 400 })
  if (!ALLOWED_AMOUNTS.includes(Number(amountTokens)))
    return NextResponse.json({ error: 'Invalid gift amount' }, { status: 400 })
  if (creatorId === session.user.id)
    return NextResponse.json({ error: 'Cannot gift yourself' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify creator exists before transferring tokens
  const { data: creatorProfile } = await admin.from('profiles').select('id').eq('id', creatorId).maybeSingle()
  if (!creatorProfile) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

  const tokens = Number(amountTokens)
  const senderId = session.user.id
  const cleanMsg = message && typeof message === 'string' ? message.trim().slice(0, 200) : null

  // check sender balance
  const { data: wallet } = await admin.from('user_wallets').select('balance').eq('user_id', senderId).maybeSingle()
  if (!wallet || wallet.balance < tokens)
    return NextResponse.json({ error: 'Insufficient token balance' }, { status: 402 })

  const senderBalanceAfter = wallet.balance - tokens

  // deduct from sender — optimistic lock guards against concurrent spends draining the wallet
  const { data: deductRows, error: deductErr } = await admin
    .from('user_wallets')
    .update({ balance: senderBalanceAfter })
    .eq('user_id', senderId)
    .eq('balance', wallet.balance)
    .select('balance')
  if (deductErr) {
    console.error('[creators/gift] deduct failed:', deductErr.message)
    return NextResponse.json({ error: 'Failed to process gift. Please try again.' }, { status: 500 })
  }
  if (!deductRows?.length) {
    return NextResponse.json({ error: 'Balance changed during transaction. Please try again.' }, { status: 409 })
  }

  // credit to creator wallet (upsert in case they don't have one yet)
  const { data: creatorWallet } = await admin.from('user_wallets').select('balance').eq('user_id', creatorId).maybeSingle()
  const creatorBalanceAfter = (creatorWallet?.balance ?? 0) + tokens
  if (creatorWallet) {
    await admin.from('user_wallets').update({ balance: creatorBalanceAfter }).eq('user_id', creatorId)
  } else {
    await admin.from('user_wallets').insert({ user_id: creatorId, balance: tokens })
  }

  // ledger entries — balance_after is NOT NULL, so it must be supplied for both sides
  const { error: ledgerErr } = await admin.from('token_ledger').insert([
    { user_id: senderId,   amount: -tokens, balance_after: senderBalanceAfter,  type: 'spend', description: `Gift to creator` },
    { user_id: creatorId,  amount:  tokens, balance_after: creatorBalanceAfter, type: 'bonus', description: `Gift received from fan` },
  ])
  if (ledgerErr) console.error('[creators/gift] ledger insert failed:', ledgerErr.message)

  // record the gift (fire-and-forget — tokens already transferred)
  admin.from('creator_gifts').insert({
    sender_id: senderId,
    creator_id: creatorId,
    amount_tokens: tokens,
    message: cleanMsg,
  }).then(({ error }) => { if (error) console.error('[creators/gift] gift record failed:', error.message) })

  return NextResponse.json({ ok: true, newBalance: wallet.balance - tokens })
}
