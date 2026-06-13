/**
 * Save a creator's external platform links.
 * POST { links: [{ label, url }] } → { ok: true }
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

  const { links } = await req.json()
  if (!Array.isArray(links)) return NextResponse.json({ error: 'links must be an array' }, { status: 400 })

  const clean = links
    .filter((l: any) => l && typeof l.url === 'string')
    .map((l: any) => {
      try {
        const u = new URL(l.url.trim())
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
        if (/[^\x00-\x7F]/.test(u.hostname)) return null
        return { label: String(l.label || u.hostname).slice(0, 40), url: u.href }
      } catch { return null }
    })
    .filter(Boolean)
    .slice(0, 8)

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await admin.from('profiles').update({ external_links: clean }).eq('id', session.user.id)
  if (error) {
    console.error('[creators/links] update failed:', error.message)
    return NextResponse.json({ error: 'Failed to save links. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, links: clean })
}
