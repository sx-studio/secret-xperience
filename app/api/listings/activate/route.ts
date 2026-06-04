/**
 * Set a listing live again — free.
 *
 * POST { listingId }
 *
 * Basic listings are free and permanent on SecretXperience, so reactivating a
 * listing that a advertiser manually paused simply flips it back to active. No
 * tokens are charged. Paid tiers (featured/slider/premium) are purchased
 * separately via the /boost flow.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // cookies() is synchronous in Next.js 13.5.1 — never await
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify advertisement belongs to this user
  const { data: listing } = await admin
    .from('listings')
    .select('id, profile_id')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.profile_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Free reactivation — clear any stale expiry so it stays live.
  await admin.from('listings').update({
    active:          true,
    status:          'approved',
    tier_expires_at: null,
  }).eq('id', listingId)

  return NextResponse.json({ ok: true })
}
