/**
 * Verifies the one-time code the provider received. On success, stores the
 * number on their profile and marks it verified (phone via SMS, or whatsapp).
 *
 * POST { phone: string (E.164), code: string, channel: 'sms' | 'whatsapp' }
 *   → { ok: true } and the number is saved + flagged verified
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../../../lib/ratelimit'

const E164 = /^\+[1-9]\d{6,14}$/

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || userId
  const rl = rateLimit(ip, 'phone-check', 8, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  const { phone, code, channel } = await request.json().catch(() => ({}))
  const ch = channel === 'whatsapp' ? 'whatsapp' : 'sms'

  if (!phone || !E164.test(String(phone).trim())) {
    return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 })
  }
  if (!code || !/^\d{4,10}$/.test(String(code).trim())) {
    return NextResponse.json({ error: 'Enter the code you received.' }, { status: 400 })
  }

  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const svc   = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!sid || !token || !svc) {
    return NextResponse.json({ error: 'Phone verification is not configured yet.' }, { status: 503 })
  }

  const body = new URLSearchParams({ To: String(phone).trim(), Code: String(code).trim() })
  const res = await fetch(`https://verify.twilio.com/v2/Services/${svc}/VerificationCheck`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const result = await res.json().catch(() => ({}))
  if (!res.ok || result?.status !== 'approved') {
    return NextResponse.json({ error: 'That code is incorrect or has expired. Request a new one.' }, { status: 400 })
  }

  // Code approved — persist the verified number via service role.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now = new Date().toISOString()
  const update = ch === 'whatsapp'
    ? { whatsapp: String(phone).trim(), whatsapp_verified: true, whatsapp_verified_at: now }
    : { phone: String(phone).trim(), phone_verified: true, phone_verified_at: now }

  const { error } = await admin.from('profiles').update(update).eq('id', userId)
  if (error) return NextResponse.json({ error: 'Verified, but could not save the number. Please try again.' }, { status: 500 })

  return NextResponse.json({ ok: true, channel: ch })
}
