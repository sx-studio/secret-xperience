import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { email, userId, amount, note } = body as { email?: string; userId?: string; amount: number; note?: string }

  if (!amount || amount < 1) return NextResponse.json({ error: 'amount must be ≥ 1' }, { status: 400 })
  if (!email && !userId) return NextResponse.json({ error: 'email or userId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Resolve user
  let targetId = userId
  let targetEmail = email
  if (!targetId && email) {
    const { data: p } = await admin.from('profiles').select('id, email').eq('email', email).maybeSingle()
    if (!p) return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 })
    targetId = p.id
    targetEmail = p.email
  }

  // Get current balance for ledger running total
  const { data: wallet } = await admin.from('user_wallets').select('balance').eq('user_id', targetId).maybeSingle()
  const prevBalance = wallet?.balance ?? 0
  const newBalance = prevBalance + amount

  // Upsert wallet
  const { error: walletErr } = await admin.from('user_wallets').upsert(
    {
      user_id: targetId,
      balance: newBalance,
      total_purchased: (wallet as any)?.total_purchased ? (wallet as any).total_purchased + amount : amount,
    },
    { onConflict: 'user_id' }
  )
  if (walletErr) return NextResponse.json({ error: walletErr.message }, { status: 500 })

  // Ledger entry
  await admin.from('token_ledger').insert({
    user_id: targetId,
    amount,
    balance_after: newBalance,
    type: 'purchase',
    description: note || `Admin grant by ${session.user.email}`,
    reference_id: `admin-grant-${Date.now()}`,
  })

  return NextResponse.json({ ok: true, granted: amount, newBalance, email: targetEmail })
}
