import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const CITIES: Record<string, string> = {
  brussels:   'Brussels',
  antwerp:    'Antwerp',
  ghent:      'Ghent',
  amsterdam:  'Amsterdam',
  rotterdam:  'Rotterdam',
  berlin:     'Berlin',
  hamburg:    'Hamburg',
  paris:      'Paris',
  lyon:       'Lyon',
  luxembourg: 'Luxembourg',
  liege:      'Liège',
  bruges:     'Bruges',
  cologne:    'Cologne',
}

export async function generateStaticParams() {
  return Object.keys(CITIES).map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cityKey = params.city.toLowerCase()
  const cityName = CITIES[cityKey]
  if (!cityName) return { title: 'SecretXperience' }
  return {
    title: `Escorts in ${cityName} | SecretXperience`,
    description: `Browse verified escort profiles in ${cityName}. Discreet, professional providers — incall and outcall available.`,
    openGraph: {
      title: `Escorts in ${cityName} | SecretXperience`,
      description: `Verified escort listings in ${cityName}. Browse profiles, view photos, and book securely.`,
      type: 'website',
    },
    alternates: { canonical: `https://www.secretxperience.eu/escorts/${cityKey}` },
  }
}

export default async function EscortsCityPage({ params }: { params: { city: string } }) {
  const cityKey = params.city.toLowerCase()
  const cityName = CITIES[cityKey]
  if (!cityName) notFound()

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, category, city, price_from, images, verified, premium, age, tags')
    .eq('active', true)
    .in('category', ['escorts', 'companionship', 'massage', 'domination'])
    .ilike('city', `%${cityName}%`)
    .order('premium', { ascending: false })
    .limit(48)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Escorts in ${cityName}`,
    url: `https://www.secretxperience.eu/escorts/${cityKey}`,
    numberOfItems: listings?.length ?? 0,
    itemListElement: (listings || []).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.secretxperience.eu/listings/${l.id}`,
      name: l.title,
    })),
  }

  const S = {
    bg: '#050505', bg2: '#0e0e0e', t: '#ece8e1', t2: 'rgba(236,232,225,0.5)',
    gold: '#c5a05a', b: 'rgba(255,255,255,0.07)', serif: "'Cormorant Garamond', serif",
    sans: "'Poppins', sans-serif",
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          a{color:inherit;text-decoration:none}
          .city-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
          @media(max-width:640px){.city-grid{grid-template-columns:repeat(2,1fr);gap:.65rem}}
          .city-card{background:${S.bg2};border:0.5px solid ${S.b};border-radius:14px;overflow:hidden;transition:border-color .2s,transform .2s;cursor:pointer}
          .city-card:hover{border-color:rgba(197,160,90,0.35);transform:translateY(-3px)}
          .city-card-img{aspect-ratio:3/4;background:#111;overflow:hidden;position:relative}
          .city-card-img img{width:100%;height:100%;object-fit:cover;display:block}
          .city-card-body{padding:10px 12px 12px}
          .city-card-name{font-family:${S.serif};font-size:15px;font-weight:400;color:${S.t};margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .city-card-meta{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:${S.t2}}
        `}</style>

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid rgba(197,160,90,0.12)`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, letterSpacing: '0.04em' }}>
            Secret<span style={{ color: S.gold }}>Xperience</span>
          </a>
          <a href="/escorts" style={{ fontSize: 13, color: S.t2 }}>← All escorts</a>
        </header>

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 24px 6rem' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: 12, color: S.t2, marginBottom: '1.5rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <a href="/" style={{ color: S.t2 }}>Home</a>
            <span>›</span>
            <a href="/escorts" style={{ color: S.t2 }}>Escorts</a>
            <span>›</span>
            <span style={{ color: S.gold }}>{cityName}</span>
          </nav>

          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, marginBottom: '0.5rem', lineHeight: 1.15 }}>
            Escorts in <em style={{ fontStyle: 'italic', color: S.gold }}>{cityName}</em>
          </h1>
          <p style={{ fontSize: 14, color: S.t2, marginBottom: '2.5rem', maxWidth: 560, lineHeight: 1.7 }}>
            {listings?.length ?? 0} verified provider{listings?.length !== 1 ? 's' : ''} available in {cityName}. All listings independently submitted and identity-reviewed.
          </p>

          {(!listings || listings.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: S.t2 }}>
              <p style={{ fontSize: 16, marginBottom: 16 }}>No listings yet in {cityName}.</p>
              <a href="/escorts" style={{ color: S.gold, fontSize: 14 }}>Browse all escorts →</a>
            </div>
          ) : (
            <div className="city-grid">
              {listings.map(l => (
                <Link key={l.id} href={`/listings/${l.id}`}>
                  <div className="city-card">
                    <div className="city-card-img">
                      {l.images?.[0]
                        ? <img src={l.images[0]} alt={l.title} loading="lazy" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.serif, fontSize: '60px', fontStyle: 'italic', color: 'rgba(197,160,90,0.1)' }}>{l.title.charAt(0)}</div>
                      }
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(5,5,5,0.75) 0%,transparent 55%)', pointerEvents: 'none' }} />
                      {l.verified && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', letterSpacing: '0.06em', backdropFilter: 'blur(4px)' }}>✓</span>
                      )}
                    </div>
                    <div className="city-card-body">
                      <div className="city-card-name">{l.title}</div>
                      <div className="city-card-meta">
                        <span>📍 {l.city}</span>
                        {l.age ? <span>{l.age} yrs</span> : (l.price_from ? <span style={{ color: S.gold }}>€{l.price_from}</span> : null)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Internal links to other cities */}
          <div style={{ marginTop: '4rem', borderTop: `0.5px solid ${S.b}`, paddingTop: '2rem' }}>
            <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Other cities</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(CITIES).filter(([k]) => k !== cityKey).map(([k, name]) => (
                <a key={k} href={`/escorts/${k}`} style={{ fontSize: 13, padding: '5px 14px', border: `0.5px solid ${S.b}`, borderRadius: '20px', color: S.t2, transition: 'border-color .2s,color .2s' }}
                  onMouseOver={e => { (e.target as HTMLElement).style.borderColor = S.gold; (e.target as HTMLElement).style.color = S.gold }}
                  onMouseOut={e => { (e.target as HTMLElement).style.borderColor = S.b; (e.target as HTMLElement).style.color = S.t2 }}
                >{name}</a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
