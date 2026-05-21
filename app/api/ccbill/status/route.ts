/**
 * Query CCBill transaction status via RESTful API
 * Used to verify a payment server-side after user returns from CCBill
 *
 * CCBill REST Auth: OAuth2 client_credentials
 *   POST https://api.ccbill.com/ccbill-auth/oauth/token
 *   Authorization: Basic base64(clientId:clientSecret)
 *   Body: grant_type=client_credentials
 *
 * Then: GET https://api.ccbill.com/transactions/{subscriptionId}
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const CCBILL_API_BASE   = 'https://api.ccbill.com'
const CCBILL_AUTH_URL   = `${CCBILL_API_BASE}/ccbill-auth/oauth/token`

async function getCCBillToken(): Promise<string> {
  const clientId     = process.env.CCBILL_API_CLIENT_ID!
  const clientSecret = process.env.CCBILL_API_CLIENT_SECRET!
  const creds        = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(CCBILL_AUTH_URL, {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`CCBill auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  // Fetch order from DB — ensures user can only query their own orders
  const { data: order } = await supabase
    .from('payment_orders')
    .select('status, provider_order_id, tokens_granted, amount_eur, created_at, completed_at')
    .eq('id', orderId)
    .eq('user_id', session.user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // If already completed, return from DB (avoid unnecessary CCBill API calls)
  if (order.status === 'completed') {
    return NextResponse.json({ status: 'completed', order })
  }

  // Query CCBill API for live status
  if (order.provider_order_id) {
    try {
      const token = await getCCBillToken()
      const txRes = await fetch(
        `${CCBILL_API_BASE}/transactions/${order.provider_order_id}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      )
      if (txRes.ok) {
        const txData = await txRes.json()
        return NextResponse.json({ status: order.status, order, ccbill: txData })
      }
    } catch (e) {
      console.error('CCBill status check error:', e)
    }
  }

  return NextResponse.json({ status: order.status, order })
}
