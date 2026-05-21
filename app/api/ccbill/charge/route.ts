/**
 * CCBill FlexForm charge initiation
 *
 * Flow:
 *   1. Client POSTs { packageId }
 *   2. We create a pending payment_order in Supabase
 *   3. We build a signed CCBill FlexForm URL (MD5 digest)
 *   4. Return { url } — client redirects user there
 *   5. After payment CCBill hits /api/ccbill/webhook (Background Post)
 *
 * CCBill FlexForm URL format:
 *   https://api.ccbill.com/wap-frontflex/flexforms/{FORM_NAME}
 *   ?clientAccnum={ACCNUM}&clientSubacc={SUBACC}
 *   &initialPrice={EUR}&initialPeriod=2&currencyCode=978
 *   &formDigest={MD5}
 *   &x_orderId={our_order_id}   ← passed through as custom field
 *
 * formDigest = MD5(initialPrice + initialPeriod + recurringPrice +
 *              recurringPeriod + rebills + currencyCode + salt)
 * For one-time: recurringPrice=0.00, recurringPeriod=0, rebills=0
 */
import { createMD5 } from 'hash-wasm'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const CCBILL_ACCNUM  = process.env.CCBILL_ACCOUNT_NUMBER!
const CCBILL_SUBACC  = process.env.CCBILL_SUBACC ?? '0000'
const CCBILL_FORM    = process.env.CCBILL_FLEXFORM_NAME!
const CCBILL_SALT    = process.env.CCBILL_SALT!
const CCBILL_PERIOD  = '2'   // 2-day initial period (common for one-time charges)
const CURRENCY_EUR   = '978'

async function md5(str: string): Promise<string> {
  const hasher = await createMD5()
  hasher.update(str)
  return hasher.digest('hex')
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packageId } = await req.json()
  if (!packageId) return NextResponse.json({ error: 'packageId required' }, { status: 400 })

  // Fetch package
  const { data: pkg } = await supabase
    .from('token_packages')
    .select('*')
    .eq('id', packageId)
    .eq('active', true)
    .single()

  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  const totalTokens = pkg.tokens + pkg.bonus_tokens
  const priceStr    = pkg.price_eur.toFixed(2)

  // Create pending payment order (admin client bypasses RLS for insert)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order, error: orderErr } = await admin
    .from('payment_orders')
    .insert({
      user_id:       session.user.id,
      package_id:    pkg.id,
      tokens_granted: totalTokens,
      amount_eur:    pkg.price_eur,
      provider:      'ccbill',
      status:        'pending',
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Build CCBill form digest
  // MD5(price + period + 0.00 + 0 + 0 + currencyCode + salt)
  const digestInput = `${priceStr}${CCBILL_PERIOD}0.0000978${CCBILL_SALT}`
  const formDigest  = await md5(digestInput)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://secret-xperience.vercel.app'

  const params = new URLSearchParams({
    clientAccnum:   CCBILL_ACCNUM,
    clientSubacc:   CCBILL_SUBACC,
    initialPrice:   priceStr,
    initialPeriod:  CCBILL_PERIOD,
    currencyCode:   CURRENCY_EUR,
    formDigest,
    // Custom passthrough fields — returned in webhook
    'x-orderId':    order.id,
    'x-userId':     session.user.id,
    // Return URLs
    'x-successUrl': `${siteUrl}/tokens?status=success`,
    'x-cancelUrl':  `${siteUrl}/tokens?status=cancel`,
  })

  const ccbillUrl = `https://api.ccbill.com/wap-frontflex/flexforms/${CCBILL_FORM}?${params}`

  return NextResponse.json({ url: ccbillUrl, orderId: order.id })
}
