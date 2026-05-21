import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'Adult-Friendly Hotels | SecretXperience',
    description: 'Hand-picked hotels that respect your privacy. Boutique, luxury and lifestyle hotels across Europe.',
    openGraph: {
      title: 'Adult-Friendly Hotels | SecretXperience',
      description: 'Hand-picked hotels that respect your privacy.',
      url: 'https://www.secretxperience.eu/hotels',
    },
  }
}

const COUNTRY_FLAGS: Record<string, string> = {
  belgium: '🇧🇪',
  netherlands: '🇳🇱',
  germany: '🇩🇪',
  france: '🇫🇷',
  austria: '🇦🇹',
  spain: '🇪🇸',
  italy: '🇮🇹',
  switzerland: '🇨🇭',
  uk: '🇬🇧',
}

const CITY_FLAGS: Record<string, string> = {
  brussels: '🇧🇪',
  antwerp: '🇧🇪',
  amsterdam: '🇳🇱',
  berlin: '🇩🇪',
  paris: '🇫🇷',
  vienna: '🇦🇹',
  madrid: '🇪🇸',
  barcelona: '🇪🇸',
  cologne: '🇩🇪',
  munich: '🇩🇪',
  rotterdam: '🇳🇱',
}

function getCountryFlag(city: string, country: string): string {
  const c = (city || '').toLowerCase()
  const co = (country || '').toLowerCase()
  return CITY_FLAGS[c] || COUNTRY_FLAGS[co] || '🏨'
}

const HOTEL_GRADS = [
  'linear-gradient(140deg, #1f2a2e 0%, #0d1416 100%)',
  'linear-gradient(140deg, #1a2018 0%, #0d1008 100%)',
  'linear-gradient(140deg, #2a1a20 0%, #140d10 100%)',
  'linear-gradient(140deg, #20201a 0%, #10100d 100%)',
  'linear-gradient(140deg, #1a1a2a 0%, #0d0d16 100%)',
]

const HOTEL_SUBCATS = ['Boutique', 'Luxury', 'Lifestyle']
const AMENITY_ICONS = ['🔒 Private', '🍾 Bar', '🛁 Spa', '🌐 Discreet', '🅿 Valet', '🍳 Breakfast']

function HotelCard({ l, idx }: { l: any; idx: number }) {
  const monogram = (l.title || 'Sx').slice(0, 2).toUpperCase()
  const grad = HOTEL_GRADS[idx % HOTEL_GRADS.length]
  const flag = getCountryFlag(l.city, l.country)
  const isFeatured = l.featured_until && new Date(l.featured_until) > new Date()
  const subcat = l.subcategory || HOTEL_SUBCATS[idx % HOTEL_SUBCATS.length]

  // Sample amenities
  const amenities = AMENITY_ICONS.slice(0, 3 + (idx % 2))

  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg1)',
      border: isFeatured ? '1px solid rgba(197,160,90,0.45)' : '0.5px solid var(--b)',
      borderRadius: '14px',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.15s',
      boxShadow: isFeatured ? '0 0 24px rgba(197,160,90,0.12)' : 'none',
      position: 'relative',
    }}
    className="hotel-card"
    >
      {/* Featured badge (absolute) */}
      {isFeatured && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 10,
          fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
          background: 'rgba(197,160,90,0.22)', color: 'var(--gold)',
          border: '0.5px solid rgba(197,160,90,0.45)',
          backdropFilter: 'blur(4px)', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          ✦ Featured
        </div>
      )}

      {/* Image — left side, 180px wide */}
      <div style={{
        width: '180px',
        minWidth: '180px',
        background: grad,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {l.images?.[0] ? (
          <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : (
          <span style={{
            fontFamily: 'var(--serif)',
            fontSize: '72px',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'rgba(197,160,90,0.18)',
            lineHeight: 1,
            userSelect: 'none',
          }}>{monogram}</span>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 60%, rgba(8,6,18,0.3) 100%)',
        }} />
      </div>

      {/* Content — right side */}
      <div style={{ flex: 1, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          {/* Hotel name + subcategory */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--t)', lineHeight: 1.25, letterSpacing: '0.01em' }}>
              {l.title}
            </div>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
              background: 'var(--gbg)', color: 'var(--gold)',
              border: '0.5px solid var(--gbrd)',
              whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {subcat}
            </span>
          </div>

          {/* Location */}
          <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{flag}</span>
            <span>{l.city}{l.country ? `, ${l.country}` : ''}</span>
          </div>

          {/* Amenities */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {amenities.map(a => (
              <span key={a} style={{
                fontSize: '11px', padding: '2px 7px', borderRadius: '6px',
                background: 'var(--bg2)', border: '0.5px solid var(--b)',
                color: 'var(--t2)', whiteSpace: 'nowrap',
              }}>{a}</span>
            ))}
          </div>
        </div>

        {/* Bottom row: price + rating + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div>
            {l.price_from ? (
              <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold)' }}>
                €{l.price_from}{l.price_to ? `–€${l.price_to}` : ''}
                <span style={{ fontSize: '12px', color: 'var(--t3)', fontFamily: 'var(--sans)', fontWeight: 400, marginLeft: '3px' }}>/night</span>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--t3)' }}>Price on request</div>
            )}
            {l.rating > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'var(--gold)' }}>★</span>
                {Number(l.rating).toFixed(1)}
                {l.review_count > 0 && <span>({l.review_count} reviews)</span>}
              </div>
            )}
          </div>
          <Link
            href={`/listings/${l.id}`}
            style={{
              height: '36px', padding: '0 16px',
              background: isFeatured
                ? 'linear-gradient(135deg,var(--gold),var(--goldd))'
                : 'var(--bg2)',
              border: isFeatured ? 'none' : '0.5px solid var(--b2)',
              borderRadius: 'var(--r)',
              color: isFeatured ? '#0a0a0a' : 'var(--t)',
              fontSize: '13px', fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            Check availability →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function HotelsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, category, subcategory, city, country, price_from, price_to, images, verified, premium, rating, review_count, meet_type, featured_until')
    .eq('active', true)
    .eq('category', 'hotels')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  const allListings = listings || []
  const featured = allListings.filter(l => l.featured_until && new Date(l.featured_until) > new Date())
  const regular  = allListings.filter(l => !l.featured_until || new Date(l.featured_until) <= new Date())

  const CITIES = ['All cities', 'Brussels', 'Amsterdam', 'Berlin', 'Paris', 'Vienna', 'Barcelona']

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Hotels', item: 'https://www.secretxperience.eu/hotels' },
        ]},
        { '@context': 'https://schema.org', '@type': 'Service', name: 'Discreet Hotels & Suites', serviceType: 'Adult Hospitality', provider: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' }, areaServed: ['BE','NL','DE','FR'], url: 'https://www.secretxperience.eu/hotels', description: 'Curated adult-friendly hotels and suites for discreet stays across Europe.' },
      ]) }} />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .hotel-card:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 36px rgba(0,0,0,0.45) !important; border-color: var(--b3) !important; }
        .hotel-list { display: flex; flex-direction: column; gap: 16px; }
        .filter-pill { height: 34px; padding: 0 14px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: all 0.15s; cursor: pointer; flex-shrink: 0; }
        .filter-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .filter-pill.active { background: var(--gbg); color: var(--gold); border-color: var(--gbrd); font-weight: 600; }
        .toggle-adults { height: 34px; padding: 0 14px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
        .toggle-adults:hover { background: var(--bg2); color: var(--t); }
        .city-sel { height: 34px; padding: 0 12px; background: var(--bg2); border: 0.5px solid var(--b2); border-radius: var(--r); color: var(--t2); font-size: 13px; cursor: pointer; outline: none; flex-shrink: 0; }
        .checkin-fake { height: 34px; padding: 0 12px; background: var(--bg2); border: 0.5px solid var(--b2); border-radius: var(--r); color: var(--t3); font-size: 13px; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
        @media(max-width:640px) {
          .hotel-card { flex-direction: column !important; }
          .hotel-card > div:first-child { width: 100% !important; min-width: unset !important; height: 160px; }
        }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '60px',
          position: 'sticky', top: 0, zIndex: 200,
          background: 'rgba(8,6,18,0.96)', backdropFilter: 'blur(18px)',
          borderBottom: '0.5px solid var(--b)',
        }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 12px rgba(197,160,90,0.25))' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
            <Link href="/advertise" style={{
              height: '34px', padding: '0 16px',
              background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
              borderRadius: 'var(--r)', color: '#0a0a0a',
              fontSize: '13px', fontWeight: 700,
              textDecoration: 'none', display: 'flex', alignItems: 'center',
            }}>
              List your hotel
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(140deg, #1a2028 0%, #0d1018 50%, #080612 100%)',
          borderBottom: '0.5px solid var(--b)',
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,rgba(197,160,90,0.07) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(122,170,238,0.06) 0%,transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
              SecretXperience · Hotels
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              Adult-Friendly <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Hotels</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Hand-picked hotels that respect your privacy
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allListings.length}</span> properties
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                🇧🇪 🇳🇱 🇩🇪 🇫🇷 🇦🇹 🇪🇸
              </span>
            </div>
          </div>
        </div>

        {/* FILTER + SORT BAR */}
        <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '10px', alignItems: 'center', height: '56px', scrollbarWidth: 'none' }}>
            {/* Check-in placeholder (static UI) */}
            <div className="checkin-fake">
              <span>📅</span>
              <span>Check-in date</span>
            </div>
            <div style={{ width: '0.5px', height: '20px', background: 'var(--b2)', flexShrink: 0 }} />
            {/* Adults-only toggle */}
            <div className="toggle-adults">
              <span style={{
                width: '28px', height: '16px', borderRadius: '8px',
                background: 'rgba(197,160,90,0.15)', border: '0.5px solid rgba(197,160,90,0.35)',
                display: 'inline-flex', alignItems: 'center', padding: '2px',
              }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              </span>
              Adults-only
            </div>
            <div style={{ width: '0.5px', height: '20px', background: 'var(--b2)', flexShrink: 0 }} />
            {/* City select */}
            <select className="city-sel" defaultValue="">
              <option value="">All cities</option>
              {CITIES.slice(1).map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

          {/* FEATURED */}
          {featured.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ height: '0.5px', flex: 1, background: 'linear-gradient(90deg,rgba(197,160,90,0.5),transparent)' }} />
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  ✦ Featured Properties
                </div>
                <div style={{ height: '0.5px', flex: 1, background: 'linear-gradient(270deg,rgba(197,160,90,0.5),transparent)' }} />
              </div>
              <div className="hotel-list">
                {featured.map((l, i) => <HotelCard key={l.id} l={l} idx={i} />)}
              </div>
              <div style={{ height: '0.5px', background: 'var(--b)', margin: '2.5rem 0 0' }} />
            </div>
          )}

          {/* RESULTS COUNT */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--t3)' }}>
              {allListings.length} hotels found
            </span>
          </div>

          {/* HOTEL LIST */}
          {allListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏨</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '24px' }}>No hotels listed yet</div>
              <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '340px', lineHeight: 1.7 }}>
                Be among the first hotels to join SecretXperience and reach a curated adult lifestyle audience.
              </p>
              <Link href="/advertise" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                List your hotel →
              </Link>
            </div>
          ) : (
            <div className="hotel-list">
              {regular.map((l, i) => <HotelCard key={l.id} l={l} idx={i + featured.length} />)}
            </div>
          )}

          {/* HOTEL CTA */}
          {allListings.length > 0 && (
            <div style={{
              marginTop: '4rem',
              padding: '2.5rem',
              background: 'linear-gradient(140deg, #1a2028 0%, #0d1018 60%, #080612 100%)',
              border: '0.5px solid rgba(197,160,90,0.15)',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(197,160,90,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>Is your hotel adult-friendly?</div>
                <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Join our curated directory and attract a privacy-conscious, high-spending clientele from across Europe.
                </p>
                <Link href="/advertise" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                  borderRadius: 'var(--r)', color: '#0a0a0a',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  Partner with us →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--gold)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--t3)' }}>
            Adults only (18+) ·{' '}
            <Link href="/terms" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Terms</Link>
            {' '}·{' '}
            <Link href="/privacy" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Privacy</Link>
          </p>
        </footer>
      </div>
    </>
  )
}
