/**
 * CCBill Background Post (webhook) handler
 *
 * CCBill sends a GET/POST to this URL after every payment event.
 * We verify authenticity via responseDigest = MD5(subscriptionId + "1" + salt)
 * then credit the user's token wallet.
 *
 * Configure in CCBill Admin:
 *   Merchant Admin → Account Info → Background Post URL
 *   → https://yourdomain.com/api/ccbill/webhook
 *
 * Key fields CCBill sends:
 *   subscriptionId, clientAccnum, clientSubacc
 *   initialPrice, billedInitialPrice, currencyCode
 *   responseDigest
 *   x-orderId (our passthrough custom field)
 *   x-userId
 */
import { createMD5 } from 'hash-wasm'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CCBILL_SALT    = process.env.CCBILL_SALT!
const CCBILL_ACCNUM  = process.env.CCBILL_ACCOUNT_NUMBER!

async function md5(str: string): Promise<string> {
  const hasher = await createMD5()
  hasher.update(str)
  return hasher.digest('hex')
}

// CCBill sends both GET and POST; support both
export async function GET(req: NextRequest)  { return handle(req) }
export async function POST(req: NextRequest) { return handle(req) }

async function handle(req: NextRequest) {
  // Parse query params (GET) or form body (POST)
  let params: Record<string, string> = {}
  if (req.method === 'GET') {
    req.nextUrl.searchParams.forEach((v, k) => { params[k] = v })
  } else {
    const text = await req.text()
    new URLSearchParams(text).forEach((v, k) => { params[k] = v })
  }

  const {
    subscriptionId,
    clientAccnum,
    responseDigest,
    billedInitialPrice,
    'x-orderId': orderId,
    'x-userId':  userId,
  } = params

  // Verify account number matches ours
  if (clientAccnum !== CCBILL_ACCNUM) {
    console.error('CCBill webhook: wrong account number', clientAccnum)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Verify digest: MD5(subscriptionId + "1" + salt)
  const expectedDigest = await md5(`${subscriptionId}1${CCBILL_SALT}`)
  if (responseDigest !== expectedDigest) {
    console.error('CCBill webhook: invalid digest')
    return new NextResponse('Invalid digest', { status: 400 })
  }

  if (!orderId || !userId || !subscriptionId) {
    console.error('CCBill webhook: missing fields', { orderId, userId, subscriptionId })
    return new NextResponse('Missing fields', { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch order (idempotency guard — ignore if already completed)
  const { data: order } = await admin
    .from('payment_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    console.error('CCBill webhook: order not found', orderId)
    return new NextResponse('Order not found', { status: 404 })
  }

  if (order.status === 'completed') {
    // Already processed — idempotent OK response
    return new NextResponse('OK', { status: 200 })
  }

  // Mark order completed
  await admin.from('payment_orders').update({
    status:            'completed',
    provider_order_id: subscriptionId,
    webhook_payload:   params,
    completed_at:      new Date().toISOString(),
  }).eq('id', orderId)

  // Credit wallet using a transaction-safe approach
  // 1. Upsert wallet (handles first-time users)
  await admin.from('user_wallets').upsert(
    { user_id: userId, balance: 0, total_purchased: 0, total_spent: 0 },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  // 2. Atomically increment balance
  const { data: wallet } = await admin
    .from('user_wallets')
    .select('balance, total_purchased')
    .eq('user_id', userId)
    .single()

  const newBalance      = (wallet?.balance ?? 0) + order.tokens_granted
  const newTotalBought  = (wallet?.total_purchased ?? 0) + order.tokens_granted

  await admin.from('user_wallets').update({
    balance:         newBalance,
    total_purchased: newTotalBought,
    updated_at:      new Date().toISOString(),
  }).eq('user_id', userId)

  // 3. Write ledger entry
  await admin.from('token_ledger').insert({
    user_id:      userId,
    amount:       order.tokens_granted,
    balance_after: newBalance,
    type:         'purchase',
    description:  `Token package purchase — CCBill #${subscriptionId}`,
    reference_id: orderId,
  })

  console.log(`CCBill webhook: credited ${order.tokens_granted} tokens to ${userId}`)
  return new NextResponse('OK', { status: 200 })
}
