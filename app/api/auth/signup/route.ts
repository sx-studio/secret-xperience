import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.secretxperience.eu'

async function sendWelcomeEmail(email: string, name: string, role: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  const isProvider = role === 'provider'
  const subject = isProvider
    ? 'Welcome to SecretXperience — set up your first listing'
    : 'Welcome to SecretXperience'
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:0;background:#080808;font-family:'Poppins',Arial,sans-serif;color:#e8e0d0}
    .wrap{max-width:560px;margin:40px auto;padding:0 24px}
    .brand{font-size:22px;font-weight:600;color:#e8e0d0;letter-spacing:0.04em;margin-bottom:32px}
    .brand span{color:#c5a05a}
    h1{font-size:28px;font-weight:400;color:#e8e0d0;margin:0 0 16px;font-family:Georgia,serif;font-style:italic}
    p{font-size:14px;line-height:1.7;color:#888;margin:0 0 20px}
    .btn{display:inline-block;background:linear-gradient(135deg,#c5a05a,#a07840);color:#000;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.06em;margin-top:8px}
    .footer{margin-top:48px;font-size:11px;color:#444;border-top:0.5px solid #1a1a1a;padding-top:20px}
  </style></head><body><div class="wrap">
    <div class="brand">Secret<span>Xperience</span></div>
    <h1>Welcome${name ? `, ${name}` : ''}</h1>
    <p>You've joined the EU's most modern adult services marketplace. ${isProvider
      ? 'To start receiving enquiries, create your first listing — it takes about 5 minutes.'
      : 'Browse verified providers, save your favourites, and book with confidence.'
    }</p>
    <a href="${isProvider ? `${SITE}/listings/create` : `${SITE}/escorts`}" class="btn">
      ${isProvider ? 'Create your first listing →' : 'Browse listings →'}
    </a>
    <div class="footer">SecretXperience · <a href="${SITE}/privacy" style="color:#555;text-decoration:none">Privacy</a> · <a href="${SITE}/terms" style="color:#555;text-decoration:none">Terms</a></div>
  </div></body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'SecretXperience <hello@secretxperience.eu>', to: [email], subject, html }),
  })
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName || '', role },
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Fire-and-forget — don't block signup on email delivery
    sendWelcomeEmail(email, fullName || '', role).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 })
  }
}
