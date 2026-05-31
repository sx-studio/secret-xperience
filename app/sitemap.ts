import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const BASE = 'https://www.secretxperience.eu'

const CITIES = ['brussels', 'antwerp', 'ghent', 'amsterdam', 'rotterdam', 'berlin', 'hamburg', 'paris', 'lyon', 'luxembourg', 'liege', 'bruges', 'cologne']
const CITY_CATEGORIES = ['escorts', 'nightlife', 'hotels', 'rentals']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: listings }, { data: profiles }, { data: events }] = await Promise.all([
    supabase.from('listings').select('id, created_at').eq('active', true),
    supabase.from('profiles').select('id, created_at').neq('role', 'user'),
    supabase.from('events').select('slug, created_at').eq('active', true),
  ])
  const staticRoutes = ['/', '/events', '/advertise', '/search', '/discover', '/nightlife', '/terms', '/privacy', '/login', '/partners', '/regulations', '/medical', '/refer', '/creators', '/shop', '/how-it-works', '/why-secretxperience'].map(path => ({ url: BASE + path, lastModified: new Date(), changeFrequency: path === '/' ? 'daily' as const : 'weekly' as const, priority: path === '/' ? 1 : path === '/why-secretxperience' ? 0.95 : ['/search', '/discover', '/nightlife', '/events', '/advertise', '/regulations', '/medical'].includes(path) ? 0.8 : 0.7 }))
  const categoryRoutes = ['escorts', 'private-reception', 'companionship', 'nightlife', 'creators', 'rentals', 'hotels', 'shop', 'events'].map(cat => ({ url: `${BASE}/${cat}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 }))
  const cityRoutes = CITY_CATEGORIES.flatMap(cat => CITIES.map(city => ({ url: `${BASE}/${cat}/${city}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.85 })))
  const listingRoutes = (listings || []).map(l => ({ url: `${BASE}/listings/${l.id}`, lastModified: new Date(l.created_at), changeFrequency: 'weekly' as const, priority: 0.8 }))
  const profileRoutes = (profiles || []).map(p => ({ url: `${BASE}/profile/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: 'weekly' as const, priority: 0.7 }))
  const eventRoutes = (events || []).map(e => ({ url: `${BASE}/events/${e.slug}`, lastModified: new Date(e.created_at), changeFrequency: 'weekly' as const, priority: 0.75 }))
  return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...listingRoutes, ...profileRoutes, ...eventRoutes]
}
