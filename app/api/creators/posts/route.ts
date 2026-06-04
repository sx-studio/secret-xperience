/**
 * Creator content posts.
 * POST { caption, mediaUrl, mediaType } → creates a post (creator/advertiser only)
 * DELETE ?id=<postId> → removes own post
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function client() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = client()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { caption, mediaUrl, mediaType } = await req.json()
  if (!mediaUrl && !caption) return NextResponse.json({ error: 'A caption or media is required' }, { status: 400 })
  if (mediaUrl && !/^https?:\/\//i.test(mediaUrl)) return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })

  const { data, error } = await admin().from('creator_posts').insert({
    creator_id: session.user.id,
    caption: caption ? String(caption).slice(0, 2000) : null,
    media_url: mediaUrl || null,
    media_type: mediaType === 'video' ? 'video' : 'image',
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function DELETE(req: NextRequest) {
  const supabase = client()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await admin().from('creator_posts').delete().eq('id', id).eq('creator_id', session.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
