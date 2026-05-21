import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = adminClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName || '', role },
      email_confirm: false, // sends confirmation email
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // Upsert profile — safe even if trigger already created it
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName || '',
      role: role || 'user',
    }, { onConflict: 'id', ignoreDuplicates: false })

    // Ensure wallet exists
    await supabase.from('user_wallets').upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 })
  }
}
