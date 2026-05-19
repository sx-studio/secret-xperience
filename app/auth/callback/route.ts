import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  if (code) {
    const cookieStore = cookies()
    const response = NextResponse.redirect(`${siteUrl}/dashboard`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync email to profiles
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        await supabase
          .from('profiles')
          .update({ email: user.email })
          .eq('id', user.id)
          .is('email', null)  // only update if not already set
      }
      return response
    }
  }

  return NextResponse.redirect(`${siteUrl}/login`)
}