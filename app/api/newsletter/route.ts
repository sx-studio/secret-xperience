import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../../lib/ratelimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = rateLimit(ip, 'newsletter', 3, 3_600_000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { email } = await req.json()

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const normalised = email.toLowerCase().trim()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: normalised, subscribed_at: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    console.error('Newsletter upsert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Send welcome email via Resend if key is configured
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SecretXperience <hello@secretxperience.eu>',
        to: normalised,
        subject: 'Welcome to SecretXperience — you\'re on the list',
        html: `
          <div style="background:#080612;color:#ece8e1;font-family:sans-serif;padding:40px 24px;max-width:520px;margin:0 auto;border-radius:16px;">
            <div style="font-size:22px;font-weight:500;color:#c5a05a;margin-bottom:12px;">SecretXperience</div>
            <h2 style="font-size:20px;font-weight:400;margin:0 0 16px;">You're on the list.</h2>
            <p style="font-size:14px;line-height:1.7;color:rgba(236,232,225,0.65);margin:0 0 24px;">
              From now on you'll receive curated updates — new listings, private events, exclusive offers, and featured providers — delivered discreetly to your inbox.
            </p>
            <p style="font-size:13px;color:rgba(236,232,225,0.4);margin:0;">
              You can unsubscribe at any time by replying STOP to any email.<br/>
              SecretXperience.eu · Adults only (18+)
            </p>
          </div>
        `,
      }),
    }).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
