import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data } = await supabase
    .from('listings')
    .select('title, description, images, city, country, category')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) return { title: 'SecretXperience' }

  const title = `${data.title}${data.city ? ` in ${data.city}` : ''} | SecretXperience`
  const description = data.description
    ? data.description.slice(0, 155) + (data.description.length > 155 ? '…' : '')
    : `${data.category} listing in ${data.city || 'Europe'} — verified on SecretXperience.`

  return {
    title,
    description,
    openGraph: {
      title: data.title,
      description,
      type: 'website',
      images: data.images?.[0] ? [{ url: data.images[0], width: 800, height: 600, alt: data.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
      images: data.images?.[0] ? [data.images[0]] : [],
    },
    alternates: { canonical: `https://www.secretxperience.eu/listings/${params.id}` },
  }
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
