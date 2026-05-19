import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const BASE = 'https://secret-xperience.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: listings }, { data: profiles }] = await Promise.all([
    supabase.from('listings').select('id, created_at').eq('active', true),
    supabase.from('profiles').select('id, created_at').neq('role', 'user'),
  ])
  const staticRoutes = ['/', '/login'].map(path => ({ url: BASE + path, lastModified: new Date(), changeFrequency: 'daily' as const, priority: path === '/' ? 1 : 0.5 }))
  const listingRoutes = (listings || []).map(l => ({ url: `${BASE}/listings/${l.id}`, lastModified: new Date(l.created_at), changeFrequency: 'weekly' as const, priority: 0.8 }))
  const profileRoutes = (profiles || []).map(p => ({ url: `${BASE}/profile/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: 'weekly' as const, priority: 0.7 }))
  return [...staticRoutes, ...listingRoutes, ...profileRoutes]
}
