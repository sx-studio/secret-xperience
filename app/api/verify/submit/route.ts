/**
 * Identity verification document submission
 * Providers upload front-of-ID, back-of-ID, and a selfie.
 * Files are stored in Supabase Storage (private bucket: identity-docs).
 * Creates / updates the identity_verifications record.
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
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await req.formData()
  const docFront = formData.get('doc_front') as File | null
  const docBack  = formData.get('doc_back')  as File | null
  const selfie   = formData.get('selfie')    as File | null

  if (!docFront || !selfie) {
    return NextResponse.json({ error: 'doc_front and selfie are required' }, { status: 400 })
  }

  const uid     = session.user.id
  const bucket  = 'identity-docs'
  const prefix  = `${uid}/${Date.now()}`

  async function uploadFile(file: File, name: string): Promise<string> {
    const bytes = await file.arrayBuffer()
    const { error } = await admin.storage.from(bucket).upload(
      `${prefix}/${name}`,
      Buffer.from(bytes),
      { contentType: file.type, upsert: true }
    )
    if (error) throw new Error(error.message)
    // Return a signed URL valid 10 years (for admin review)
    const { data } = await admin.storage.from(bucket).createSignedUrl(`${prefix}/${name}`, 315360000)
    return data?.signedUrl || ''
  }

  try {
    const frontUrl  = await uploadFile(docFront, 'doc_front')
    const backUrl   = docBack ? await uploadFile(docBack, 'doc_back') : null
    const selfieUrl = await uploadFile(selfie, 'selfie')

    const { error } = await admin.from('identity_verifications').upsert({
      user_id:       uid,
      status:        'pending',
      doc_front_url: frontUrl,
      doc_back_url:  backUrl,
      selfie_url:    selfieUrl,
      submitted_at:  new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, status: 'pending' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
