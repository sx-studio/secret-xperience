import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const BASE = 'https://www.secretxperience.eu'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: listings }, { data: profiles }, { data: events }] = await Promise.all([
    supabase.from('listings').select('id, created_at').eq('active', true),
    supabase.from('profiles').select('id, created_at').neq('role', 'user'),
    supabase.from('events').select('slug, created_at').eq('active', true),
  ])
  const staticRoutes = ['/', '/events', '/advertise', '/search', '/discover', '/nightlife', '/terms', '/privacy', '/login'].map(path => ({ url: BASE + path, lastModified: new Date(), changeFrequency: path === '/' ? 'daily' as const : 'weekly' as const, priority: path === '/' ? 1 : ['/search', '/discover', '/nightlife', '/events', '/advertise'].includes(path) ? 0.8 : 0.7 }))
  const categoryRoutes = ['escorts', 'companionship', 'nightlife', 'creators', 'rentals', 'hotels', 'shop', 'events'].map(cat => ({ url: `${BASE}/${cat}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 }))
  const listingRoutes = (listings || []).map(l => ({ url: `${BASE}/listings/${l.id}`, lastModified: new Date(l.created_at), changeFrequency: 'weekly' as const, priority: 0.8 }))
  const profileRoutes = (profiles || []).map(p => ({ url: `${BASE}/profile/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: 'weekly' as const, priority: 0.7 }))
  const eventRoutes = (events || []).map(e => ({ url: `${BASE}/events/${e.slug}`, lastModified: new Date(e.created_at), changeFrequency: 'weekly' as const, priority: 0.75 }))
  return [...staticRoutes, ...categoryRoutes, ...listingRoutes, ...profileRoutes, ...eventRoutes]
}
