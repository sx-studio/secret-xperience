/**
 * Identity verification document submission.
 * Client uploads files directly to Supabase Storage (bypasses Vercel's 4.5MB body limit),
 * then POSTs the storage paths here. This route creates 10-year signed URLs for admin
 * review and upserts the identity_verifications record.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { frontPath, backPath, selfiePath, consent } = body
  if (!frontPath || !selfiePath) {
    return NextResponse.json({ error: 'frontPath and selfiePath are required' }, { status: 400 })
  }
  // Compliance: explicit consent is mandatory and recorded with a timestamp.
  if (consent !== true) {
    return NextResponse.json({ error: 'Consent is required to submit identity documents.' }, { status: 400 })
  }

  const bucket = 'identity-docs'
  const uid    = session.user.id

  // Verify the uploaded paths belong to this user
  if (!frontPath.startsWith(`${uid}/`) || !selfiePath.startsWith(`${uid}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (backPath && !backPath.startsWith(`${uid}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  async function signPath(path: string): Promise<string> {
    const { data } = await admin.storage.from(bucket).createSignedUrl(path, 315360000)
    return data?.signedUrl || ''
  }

  try {
    const frontUrl  = await signPath(frontPath)
    const backUrl   = backPath ? await signPath(backPath) : null
    const selfieUrl = await signPath(selfiePath)

    const now = new Date().toISOString()
    const baseRow = {
      user_id:       uid,
      status:        'pending',
      doc_front_url: frontUrl,
      doc_back_url:  backUrl,
      selfie_url:    selfieUrl,
      submitted_at:  now,
      updated_at:    now,
    }

    let { error } = await admin.from('identity_verifications')
      .upsert({ ...baseRow, consent_given: true, consent_at: now }, { onConflict: 'user_id' })

    // Graceful fallback if the consent columns aren't migrated yet (42703 = undefined_column).
    if (error && (error.code === '42703' || /consent_given|consent_at|column/i.test(error.message))) {
      console.warn('[verify/submit] consent columns missing — apply 20260604_verification_gate.sql. Recording without consent fields.')
      const retry = await admin.from('identity_verifications').upsert(baseRow, { onConflict: 'user_id' })
      error = retry.error
    }

    if (error) {
      console.error('[verify/submit] upsert error:', error.message)
      return NextResponse.json({ error: 'Failed to record submission. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: 'pending' })
  } catch (e: any) {
    console.error('[verify/submit] error:', e?.message, e)
    return NextResponse.json({ error: 'Failed to record submission. Please try again.' }, { status: 500 })
  }
}
