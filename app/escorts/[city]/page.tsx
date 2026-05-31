import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const CITIES: Record<string, string> = {
  brussels:    'Brussels',
  antwerp:     'Antwerp',
  ghent:       'Ghent',
  grimbergen:  'Grimbergen',
  leuven:      'Leuven',
  mechelen:    'Mechelen',
  hasselt:     'Hasselt',
  namur:       'Namur',
  charleroi:   'Charleroi',
  kortrijk:    'Kortrijk',
  ostend:      'Ostend',
  amsterdam:   'Amsterdam',
  rotterdam:   'Rotterdam',
  berlin:      'Berlin',
  hamburg:     'Hamburg',
  paris:       'Paris',
  lyon:        'Lyon',
  luxembourg:  'Luxembourg',
  liege:       'Liège',
  bruges:      'Bruges',
  cologne:     'Cologne',
}

/** Country slugs — queries by `country` column instead of `city`. */
const COUNTRIES: Record<string, { name: string; code: string; cities: string; desc: string }> = {
  belgium:     { name: 'Belgium', code: 'BE', cities: 'Brussels, Antwerp & Ghent', desc: 'Browse verified escort ads in Belgium — women, couples, men & trans. Independent escorts and agencies for dinner dates, business trips and private meetings. Real photos, reviews & prices.' },
  netherlands: { name: 'Netherlands', code: 'NL', cities: 'Amsterdam, Rotterdam & Den Haag', desc: 'View escort ads in the Netherlands — women, couples, men, trans & private houses for home reception, escort service or erotic massage. Verified profiles, real photos & prices.' },
  germany:     { name: 'Germany', code: 'DE', cities: 'Berlin, Cologne & Hamburg', desc: 'Escort directory for Germany — independent escorts, escort agencies and private houses. Find female, male & trans escorts in Berlin, Cologne and beyond. Real photos & reviews.' },
  france:      { name: 'France', code: 'FR', cities: 'Paris, Lyon & Marseille', desc: 'Browse verified escort ads in France — women, men, couples & trans. Independent escorts and agencies for dinner dates, travel and private meetings. Real photos, reviews & prices.' },
  luxembourg:  { name: 'Luxembourg', code: 'LU', cities: 'Luxembourg City', desc: 'Verified escort ads in Luxembourg — women, men, couples & trans. Independent escorts for dinner dates, business trips and private meetings. Real photos, reviews & prices.' },
}

const ALL_SLUGS = [...Object.keys(CITIES), ...Object.keys(COUNTRIES)]

export async function generateStaticParams() {
  return ALL_SLUGS.map(slug => ({ city: slug }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const slug = params.city.toLowerCase()
  if (COUNTRIES[slug]) {
    const c = COUNTRIES[slug]
    const title = `Escort ${c.name} — Escorts in ${c.cities} | SecretXperience`
    return {
      title,
      description: c.desc,
      openGraph: { title, description: c.desc, type: 'website' },
      alternates: { canonical: `https://www.secretxperience.eu/escorts/${slug}` },
    }
  }
  const cityName = CITIES[slug]
  if (!cityName) return { title: 'SecretXperience' }
  const title = `Escort Girls ${cityName} — Verified Escorts, Real Photos & Prices | SecretXperience`
  const desc = `View escort ads in ${cityName} — women, men, couples & trans for escort service, private reception or erotic massage. Independent escorts & VIP companions. Real photos, reviews & prices.`
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'website' },
    alternates: { canonical: `https://www.secretxperience.eu/escorts/${slug}` },
  }
}

export default async function EscortsCityPage({ params }: { params: { city: string } }) {
  const slug = params.city.toLowerCase()
  const isCountry = !!COUNTRIES[slug]
  const countryInfo = COUNTRIES[slug]
  const cityName = CITIES[slug]

  if (!isCountry && !cityName) notFound()

  const displayName = isCountry ? countryInfo.name : cityName!

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  let query = supabase
    .from('listings')
    .select('id, title, category, city, country, price_from, images, verified, premium, age, tags')
    .eq('active', true)
    .eq('status', 'approved')
    .in('category', ['escorts', 'companionship', 'massage', 'domination'])
    .order('premium', { ascending: false })
    .limit(60)

  if (isCountry) {
    // Match both full name ("Belgium") and 2-letter code ("BE")
    query = query.or(`country.ilike.%${countryInfo.name}%,country.ilike.${countryInfo.code}`)
  } else {
    query = query.ilike('city', `%${cityName}%`)
  }

  const { data: listings } = await query

  // For country pages: collect unique cities for sub-navigation
  const citiesInCountry = isCountry
    ? [...new Set((listings ?? []).map(l => l.city).filter(Boolean))].sort()
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Escorts in ${displayName}`,
    url: `https://www.secretxperience.eu/escorts/${slug}`,
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
          .pill-link{font-size:13px;padding:5px 14px;border:0.5px solid ${S.b};border-radius:20px;color:${S.t2};transition:border-color .2s,color .2s;display:inline-block}
          .pill-link:hover{border-color:${S.gold};color:${S.gold}}
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
            <span style={{ color: S.gold }}>{displayName}</span>
          </nav>

          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, marginBottom: '0.5rem', lineHeight: 1.15 }}>
            Escorts in <em style={{ fontStyle: 'italic', color: S.gold }}>{displayName}</em>
          </h1>
          <p style={{ fontSize: 14, color: S.t2, marginBottom: isCountry && citiesInCountry.length > 0 ? '1.5rem' : '2.5rem', maxWidth: 560, lineHeight: 1.7 }}>
            {isCountry
              ? countryInfo.desc
              : `${listings?.length ?? 0} verified provider${listings?.length !== 1 ? 's' : ''} available in ${displayName}. All listings independently submitted and identity-reviewed.`
            }
          </p>

          {/* Country: city sub-navigation */}
          {isCountry && citiesInCountry.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2.5rem' }}>
              {citiesInCountry.map(city => {
                const citySlug = Object.entries(CITIES).find(([,v]) => v.toLowerCase() === city.toLowerCase())?.[0]
                return citySlug
                  ? <a key={city} href={`/escorts/${citySlug}`} className="pill-link">{city}</a>
                  : <span key={city} className="pill-link" style={{ cursor: 'default' }}>{city}</span>
              })}
            </div>
          )}

          {(!listings || listings.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: S.t2 }}>
              <p style={{ fontSize: 16, marginBottom: 16 }}>No listings yet in {displayName}.</p>
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

          {/* Internal links */}
          <div style={{ marginTop: '4rem', borderTop: `0.5px solid ${S.b}`, paddingTop: '2rem' }}>
            {/* Browse by country */}
            <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Browse by country</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
              {Object.entries(COUNTRIES).filter(([k]) => k !== slug).map(([k, c]) => (
                <a key={k} href={`/escorts/${k}`} className="pill-link">{c.name}</a>
              ))}
            </div>

            {/* Browse by city */}
            <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Browse by city</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(CITIES).filter(([k]) => k !== slug).map(([k, name]) => (
                <a key={k} href={`/escorts/${k}`} className="pill-link">{name}</a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
