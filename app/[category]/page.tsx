import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_META: Record<string, { title: string; description: string; heading: string }> = {
  escorts: {
    title: 'Escort Services Belgium | SecretXperience',
    description: 'Browse verified escort services in Belgium. Discreet, professional, and fully verified providers in Brussels, Antwerp, Ghent and beyond.',
    heading: 'Escort Services',
  },
  companionship: {
    title: 'Companionship Services | SecretXperience',
    description: 'Refined companionship experiences in Belgium. Verified providers for dinner dates, travel companions, and private meetings.',
    heading: 'Companionship',
  },
  nightlife: {
    title: 'Adult Nightlife Venues | SecretXperience',
    description: 'Discover premium adult nightlife venues in Belgium. Private clubs, bars, and exclusive events.',
    heading: 'Nightlife & Venues',
  },
  creators: {
    title: 'Adult Content Creators | SecretXperience',
    description: 'Subscribe to exclusive adult creator content. Premium photos, videos, and custom requests from verified creators.',
    heading: 'Content Creators',
  },
  rentals: {
    title: 'Discreet Rental Spaces | SecretXperience',
    description: 'Private apartments, suites and discreet rental spaces. Verified locations for private meetings.',
    heading: 'Private Rentals',
  },
  adult: {
    title: 'Adult Services | SecretXperience',
    description: 'Premium adult services and experiences. All providers verified and independently listed.',
    heading: 'Adult Services',
  },
  experiences: {
    title: 'Luxury Experiences | SecretXperience',
    description: 'Exclusive adult experiences and premium encounters. Curated, verified, discreet.',
    heading: 'Experiences',
  },
  photo: {
    title: 'Adult Photography Studios | SecretXperience',
    description: 'Professional adult photography and video studios. Private sets, verified locations.',
    heading: 'Photo & Video Studios',
  },
  events: {
    title: 'Private Adult Events | SecretXperience',
    description: 'Exclusive private events and adult entertainment spaces available for booking.',
    heading: 'Events & Spaces',
  },
  memberships: {
    title: 'Adult Memberships | SecretXperience',
    description: 'Exclusive membership programs for premium adult services and experiences.',
    heading: 'Memberships',
  },
  hotels: {
    title: 'Discreet Hotels | SecretXperience',
    description: 'Adult-friendly hotels in Belgium with guaranteed privacy and member discounts.',
    heading: 'Discreet Hotels',
  },
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const meta = CATEGORY_META[params.category]
  if (!meta) return { title: 'SecretXperience' }
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://secret-xperience.vercel.app/${params.category}`,
    },
  }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const meta = CATEGORY_META[params.category]
  if (!meta) notFound()

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, category, subcategory, city, country, price_from, price_to, images, verified, premium, trending, rating, review_count, meet_type, featured_until')
    .eq('active', true)
    .ilike('category', params.category + '%')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#080808', color: '#ece8e1', fontFamily: "'Jost', sans-serif" }}>

        {/* Nav */}
        <nav style={{ background: 'rgba(8,8,8,0.95)', borderBottom: '0.5px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
          <Link href="/" style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#c5a05a', letterSpacing: '0.04em' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '13px', color: '#8c8880', letterSpacing: '0.04em' }}>← All listings</Link>
        </nav>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, rgba(197,160,90,0.06) 0%, transparent 60%)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '3rem 2rem 2.5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5a05a', marginBottom: '0.75rem', fontWeight: 600 }}>SecretXperience</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: '#ece8e1', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>{meta.heading}</h1>
            <p style={{ fontSize: '15px', color: '#8c8880', maxWidth: '560px', lineHeight: 1.6, fontWeight: 300 }}>{meta.description}</p>
            <div style={{ marginTop: '1rem', fontSize: '13px', color: '#4c4a47' }}>{listings?.length || 0} listings available</div>
          </div>
        </div>

        {/* Listings grid */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
          {!listings || listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#ece8e1', marginBottom: '0.75rem' }}>No listings yet</div>
              <p style={{ color: '#8c8880', marginBottom: '1.5rem' }}>Be among the first providers in this category.</p>
              <Link href="/listings/create" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: '10px', color: '#080808', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>List your service →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {listings.map(l => {
                const isFeatured = l.featured_until && new Date(l.featured_until) > new Date()
                return (
                  <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none', display: 'block', background: '#0f0f0f', border: `0.5px solid ${isFeatured ? 'rgba(197,160,90,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    <div style={{ height: '180px', background: l.images?.[0] ? `url('${l.images[0]}') center/cover` : 'rgba(197,160,90,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {!l.images?.[0] && <span style={{ fontSize: '32px', opacity: 0.3 }}>✦</span>}
                      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {isFeatured && <span style={{ background: 'rgba(197,160,90,0.9)', color: '#080808', fontSize: '10px', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>✦ Featured</span>}
                        {l.verified && <span style={{ background: 'rgba(29,201,160,0.85)', color: '#080808', fontSize: '10px', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>✓ Verified</span>}
                      </div>
                    </div>
                    <div style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '11px', color: '#4c4a47', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{l.subcategory || l.category}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: '#ece8e1', marginBottom: '6px', fontWeight: 400 }}>{l.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#c5a05a', fontSize: '14px' }}>{l.price_from ? `€${l.price_from}` : 'POA'}</span>
                        <span style={{ color: '#4c4a47', fontSize: '12px' }}>{l.city || ''}</span>
                      </div>
                      {l.rating > 0 && <div style={{ marginTop: '4px', fontSize: '12px', color: '#8c8880' }}>★ {Number(l.rating).toFixed(1)} · {l.review_count} reviews</div>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '2rem', textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#c5a05a', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>SecretXperience</Link>
          <p style={{ fontSize: '12px', color: '#4c4a47' }}>Adults only (18+) · <Link href="/terms" style={{ color: '#4c4a47' }}>Terms</Link> · <Link href="/privacy" style={{ color: '#4c4a47' }}>Privacy</Link></p>
        </div>
      </div>
    </>
  )
}
