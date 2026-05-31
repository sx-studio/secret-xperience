/**
 * Toggle following a creator.
 * POST { creatorId } → { following: boolean, followerCount: number }
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = session.user.id

  const { creatorId } = await req.json()
  if (!creatorId) return NextResponse.json({ error: 'creatorId required' }, { status: 400 })
  if (creatorId === me) return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: existing } = await admin
    .from('creator_follows')
    .select('follower_id')
    .eq('follower_id', me)
    .eq('creator_id', creatorId)
    .maybeSingle()

  let following: boolean
  if (existing) {
    await admin.from('creator_follows').delete().eq('follower_id', me).eq('creator_id', creatorId)
    following = false
  } else {
    await admin.from('creator_follows').insert({ follower_id: me, creator_id: creatorId })
    following = true
  }

  const { count } = await admin
    .from('creator_follows')
    .select('creator_id', { count: 'exact', head: true })
    .eq('creator_id', creatorId)

  return NextResponse.json({ following, followerCount: count || 0 })
}
