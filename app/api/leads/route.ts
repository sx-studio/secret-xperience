import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Basic sanitize — strip HTML tags
function sanitize(v: unknown): string {
  return String(v ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 500)
}

const ALLOWED_CATEGORIES = ['escort_agency', 'venue', 'nightlife', 'massage', 'other']
const ALLOWED_SOURCES    = ['agency_form', 'advertise_page', 'partner_page']

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const contact_name = sanitize(body.contact_name)
  const email        = sanitize(body.email)

  if (!contact_name) return NextResponse.json({ error: 'contact_name required' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!body.consent) return NextResponse.json({ error: 'Consent required (GDPR)' }, { status: 400 })

  const category = ALLOWED_CATEGORIES.includes(sanitize(body.category)) ? sanitize(body.category) : 'other'
  const source   = ALLOWED_SOURCES.includes(sanitize(body.source))       ? sanitize(body.source)   : 'agency_form'

  const { error } = await admin.from('leads').insert({
    business_name: sanitize(body.business_name) || null,
    contact_name,
    email,
    phone:         sanitize(body.phone)   || null,
    category,
    country:       sanitize(body.country) || null,
    city:          sanitize(body.city)    || null,
    message:       sanitize(body.message) || null,
    source,
    consent_at:    new Date().toISOString(),
    status:        'new',
  })

  if (error) {
    console.error('[leads] insert error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
