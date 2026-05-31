/**
 * Sends a one-time verification code to a phone number via Twilio Verify.
 * Channel is 'sms' (regular phone) or 'whatsapp' (link a WhatsApp number).
 *
 * POST { phone: string (E.164), channel: 'sms' | 'whatsapp' }
 *   → { ok: true } on success
 *   → 503 if Twilio is not configured (no fake bypass — number stays unverified)
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
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

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session.user.id
  const rl = rateLimit(ip, 'phone-start', 5, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  const { phone, channel } = await request.json().catch(() => ({}))
  const ch = channel === 'whatsapp' ? 'whatsapp' : 'sms'

  if (!phone || typeof phone !== 'string' || !E164.test(phone.trim())) {
    return NextResponse.json({ error: 'Enter a valid phone number in international format, e.g. +32470123456.' }, { status: 400 })
  }

  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const svc   = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!sid || !token || !svc) {
    return NextResponse.json({ error: 'Phone verification is not configured yet. Please try again later.' }, { status: 503 })
  }

  const body = new URLSearchParams({ To: phone.trim(), Channel: ch })
  const res = await fetch(`https://verify.twilio.com/v2/Services/${svc}/Verifications`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    // 60200 = invalid number; 60203 = max send attempts; 21211 = invalid 'To'
    const msg = err?.code === 60200 || err?.code === 21211
      ? 'That number doesn’t look valid. Check the country code and try again.'
      : ch === 'whatsapp'
      ? 'Could not send a WhatsApp code — make sure this number has WhatsApp, or try SMS instead.'
      : 'Could not send the code. Please try again.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true, channel: ch })
}
