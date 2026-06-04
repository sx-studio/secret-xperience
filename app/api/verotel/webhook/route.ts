/**
 * Verotel FlexPay postback (webhook) handler
 *
 * Verotel sends a GET to this URL after every payment event. We verify the
 * SHA256 signature, confirm the shopID, then credit the user's token wallet.
 *
 * Configure in Verotel control panel:
 *   Setup Websites → (your FlexPay website) → FlexPay options → Postback URL
 *   → https://www.secretxperience.eu/api/verotel/webhook
 *
 * Key fields Verotel sends (FlexPay one-time purchase):
 *   type=purchase, saleID, referenceID, shopID, priceAmount, priceCurrency,
 *   custom1 (our orderId), custom2 (our userId), paymentMethod, email, signature
 *
 * Signature verification (same algorithm as charge):
 *   text = SIGNATURE_KEY
 *   for each param sorted case-insensitively by name (excluding "signature"):
 *     text += ":" + name + "=" + value
 *   expected = lowercase( SHA256(text) ); compare to incoming "signature"
 */
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const VEROTEL_SHOP_ID       = process.env.VEROTEL_SHOP_ID
const VEROTEL_SIGNATURE_KEY = process.env.VEROTEL_SIGNATURE_KEY

function signParams(params: Record<string, string>, secret: string): string {
  const keys = Object.keys(params)
    .filter(k => k !== 'signature' && params[k] !== '' && params[k] != null)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  let text = secret
  for (const k of keys) text += `:${k}=${params[k]}`
  return createHash('sha256').update(text, 'utf8').digest('hex').toLowerCase()
}

// Verotel uses GET for postbacks; accept POST too for safety.
export async function GET(req: NextRequest)  { return handle(req) }
export async function POST(req: NextRequest) { return handle(req) }

async function handle(req: NextRequest) {
  if (!VEROTEL_SHOP_ID || !VEROTEL_SIGNATURE_KEY) {
    console.error('Verotel webhook: env not configured')
    return new NextResponse('Not configured', { status: 503 })
  }

  let params: Record<string, string> = {}
  if (req.method === 'GET') {
    req.nextUrl.searchParams.forEach((v, k) => { params[k] = v })
  } else {
    const text = await req.text()
    new URLSearchParams(text).forEach((v, k) => { params[k] = v })
  }

  const incomingSig = params.signature || ''
  const expectedSig = signParams(params, VEROTEL_SIGNATURE_KEY)
  if (!incomingSig || incomingSig.toLowerCase() !== expectedSig) {
    console.error('Verotel webhook: invalid signature')
    return new NextResponse('Invalid signature', { status: 400 })
  }

  if (String(params.shopID) !== String(VEROTEL_SHOP_ID)) {
    console.error('Verotel webhook: wrong shopID', params.shopID)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Only credit on a completed purchase. (Subscription rebill/cancel events are
  // not used by the token top-up flow.)
  const type = (params.type || '').toLowerCase()
  if (type !== 'purchase') {
    // Acknowledge other event types so Verotel doesn't retry.
    return new NextResponse('OK', { status: 200 })
  }

  const orderId = params.custom1
  const userId  = params.custom2
  const saleId  = params.saleID || params.referenceID || ''

  if (!orderId || !userId) {
    console.error('Verotel webhook: missing custom fields', { orderId, userId })
    return new NextResponse('Missing fields', { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: order } = await admin
    .from('payment_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    console.error('Verotel webhook: order not found', orderId)
    return new NextResponse('Order not found', { status: 404 })
  }

  // Idempotency guard — already processed.
  if (order.status === 'completed') {
    return new NextResponse('OK', { status: 200 })
  }

  // Sanity: the order must belong to the user named in the postback.
  if (order.user_id !== userId) {
    console.error('Verotel webhook: user mismatch', { orderUser: order.user_id, userId })
    return new NextResponse('User mismatch', { status: 400 })
  }

  await admin.from('payment_orders').update({
    status:            'completed',
    provider_order_id: saleId,
    webhook_payload:   params,
    completed_at:      new Date().toISOString(),
  }).eq('id', orderId)

  // Credit wallet (mirror of CCBill flow).
  await admin.from('user_wallets').upsert(
    { user_id: userId, balance: 0, total_purchased: 0, total_spent: 0 },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  const { data: wallet } = await admin
    .from('user_wallets')
    .select('balance, total_purchased')
    .eq('user_id', userId)
    .single()

  const newBalance     = (wallet?.balance ?? 0) + order.tokens_granted
  const newTotalBought = (wallet?.total_purchased ?? 0) + order.tokens_granted

  await admin.from('user_wallets').update({
    balance:         newBalance,
    total_purchased: newTotalBought,
    updated_at:      new Date().toISOString(),
  }).eq('user_id', userId)

  await admin.from('token_ledger').insert({
    user_id:       userId,
    amount:        order.tokens_granted,
    balance_after: newBalance,
    type:          'purchase',
    description:   `Token package purchase — Verotel #${saleId}`,
    reference_id:  orderId,
  })

  return new NextResponse('OK', { status: 200 })
}
