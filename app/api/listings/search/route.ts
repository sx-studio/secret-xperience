import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q         = searchParams.get('q') || ''
  const category  = searchParams.get('category') || ''
  const city      = searchParams.get('city') || ''
  const minPrice  = searchParams.get('min_price')
  const maxPrice  = searchParams.get('max_price')
  const verified  = searchParams.get('verified') === 'true'
  const meetType  = searchParams.get('meet_type') || ''
  const sort      = searchParams.get('sort') || 'relevance'
  const page      = parseInt(searchParams.get('page') || '0')
  const limit     = Math.min(parseInt(searchParams.get('limit') || '24'), 48)

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  let query = supabase
    .from('listings')
    .select('id,title,description,category,subcategory,city,country,price_from,price_to,images,verified,premium,trending,rating,review_count,meet_type,featured_until,profile_id', { count: 'exact' })
    .eq('active', true)

  if (q) {
    // Use full-text search via search_vector for ranking/relevance; fall back to ilike for short/partial terms
    const words = q.trim().split(/\s+/).filter(Boolean)
    if (words.length >= 1 && q.length >= 3) {
      // websearch_to_tsquery handles phrases, AND/OR, and partial words gracefully
      query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' })
    } else {
      const safe = q.replace(/[%_(),"\\]/g, '\\$&')
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%,city.ilike.%${safe}%`)
    }
  }
  if (category && category !== 'all') query = query.ilike('category', category + '%')
  if (city) query = query.ilike('city', city + '%')
  if (verified) query = query.eq('verified', true)
  if (meetType) query = query.or(`meet_type.eq.${meetType},meet_type.eq.both`)
  if (minPrice) query = query.gte('price_from', parseInt(minPrice))
  if (maxPrice) query = query.lte('price_from', parseInt(maxPrice))

  query = query.order('featured_until', { ascending: false, nullsFirst: false })
  if (sort === 'rating') query = query.order('rating', { ascending: false })
  else if (sort === 'price_asc') query = query.order('price_from', { ascending: true, nullsFirst: false })
  else if (sort === 'price_desc') query = query.order('price_from', { ascending: false, nullsFirst: false })
  else query = query.order('created_at', { ascending: false })

  const { data, count, error } = await query.range(page * limit, (page + 1) * limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ listings: data || [], total: count || 0, page, limit })
}
