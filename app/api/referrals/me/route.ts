/**
 * Returns the signed-in user's referral code + stats, creating the code on
 * first request. Used by the /refer page.
 *
 * GET → { code, pending, qualified, rewardTokens }
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function genCode(): string {
  // 7-char uppercase alphanumeric, no ambiguous chars (0/O, 1/I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 7; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get or create this user's referral code
  let code: string | null = null
  const { data: existing } = await admin
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.code) {
    code = existing.code
  } else {
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const candidate = genCode()
      const { error } = await admin
        .from('referral_codes')
        .insert({ user_id: userId, code: candidate })
      if (!error) { code = candidate; break }
      // unique violation on code → retry; unique violation on user_id → re-read
      const { data: again } = await admin
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .maybeSingle()
      if (again?.code) { code = again.code; break }
    }
  }

  if (!code) return NextResponse.json({ error: 'Could not allocate referral code' }, { status: 500 })

  // Conversion stats
  const { data: rows } = await admin
    .from('referrals')
    .select('status, reward_tokens')
    .eq('referrer_id', userId)

  const list = rows || []
  const pending = list.filter(r => r.status === 'pending').length
  const qualified = list.filter(r => r.status === 'qualified').length
  const rewardTokens = list.reduce((sum, r) => sum + (r.reward_tokens || 0), 0)

  return NextResponse.json({ code, pending, qualified, rewardTokens })
}
