import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'Exclusive Creators | SecretXperience',
    description: 'Subscribe to exclusive adult content creators across Europe. Premium photos, videos, and custom content from verified creators.',
    openGraph: {
      title: 'Exclusive Creators | SecretXperience',
      description: 'Subscribe to exclusive adult content creators across Europe.',
      url: 'https://www.secretxperience.eu/creators',
    },
  }
}

const CREATOR_FILTERS = [
  { value: 'all', label: 'All Creators' },
  { value: 'photo', label: 'Photo & Video' },
  { value: 'couple', label: 'Couple' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'custom', label: 'Custom Content' },
]

const GRAD_PALETTE = [
  'linear-gradient(145deg, #3d1d33 0%, #1a0d1a 100%)',
  'linear-gradient(145deg, #1a1230 0%, #0d0818 100%)',
  'linear-gradient(145deg, #2a1020 0%, #150810 100%)',
  'linear-gradient(145deg, #1a2830 0%, #0d1418 100%)',
  'linear-gradient(145deg, #281a10 0%, #140d08 100%)',
  'linear-gradient(145deg, #201a30 0%, #100d18 100%)',
]

function StarRating({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(0, Math.round(rating || 0)))
  return (
    <span style={{ color: 'var(--gold)', fontSize: '13px', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      {rating > 0 && <span style={{ color: 'var(--t3)', marginLeft: '5px', fontSize: '12px' }}>{Number(rating).toFixed(1)}</span>}
    </span>
  )
}

function CreatorCard({ l, isFeatured, idx }: { l: any; isFeatured: boolean; idx: number }) {
  const monogram = (l.title || 'Sx').slice(0, 2).toUpperCase()
  const gradBg = GRAD_PALETTE[idx % GRAD_PALETTE.length]

  return (
    <Link
      href={`/listings/${l.id}`}
      className="creator-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'var(--bg1)',
        border: isFeatured ? '1px solid rgba(197,160,90,0.55)' : '0.5px solid var(--b)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.15s',
        boxShadow: isFeatured
          ? '0 0 28px rgba(197,160,90,0.18), 0 8px 32px rgba(0,0,0,0.45)'
          : '0 4px 16px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Portrait image area */}
      <div style={{
        height: '260px',
        background: gradBg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {l.images?.[0] && (
          <img
            src={l.images[0]}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        )}
        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(8,6,18,0.88) 0%, rgba(8,6,18,0.15) 50%, transparent 100%)',
          zIndex: 1,
        }} />
        {/* Monogram */}
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: '88px',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'rgba(197,160,90,0.22)',
          lineHeight: 1,
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>{monogram}</div>
        {/* Top badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap', zIndex: 3 }}>
          {isFeatured && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: 'rgba(197,160,90,0.22)', color: 'var(--gold)', border: '0.5px solid rgba(197,160,90,0.45)', backdropFilter: 'blur(4px)' }}>
              ✦ Featured
            </span>
          )}
          {l.verified && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: 'rgba(38,212,160,0.16)', color: '#26d4a0', border: '0.5px solid rgba(38,212,160,0.32)', backdropFilter: 'blur(4px)' }}>
              ✓ Verified
            </span>
          )}
          {l.premium && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: 'rgba(139,92,246,0.16)', color: '#a78bfa', border: '0.5px solid rgba(139,92,246,0.32)', backdropFilter: 'blur(4px)' }}>
              Premium
            </span>
          )}
        </div>
        {/* Price badge pinned bottom-right */}
        <div style={{
          position: 'absolute', bottom: '10px', right: '10px', zIndex: 3,
          background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
          color: '#0a0a0a', fontSize: '12px', fontWeight: 700,
          padding: '5px 10px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
          letterSpacing: '0.02em',
        }}>
          {l.price_from ? `from €${l.price_from}/mo` : 'Free preview'}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1rem 1.1rem 1.1rem' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '4px', fontWeight: 600 }}>
          {l.subcategory || 'Creator'}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--t)', marginBottom: '6px', lineHeight: 1.25, letterSpacing: '0.01em' }}>
          {l.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <StarRating rating={l.rating} />
          {l.city && <span style={{ fontSize: '12px', color: 'var(--t3)' }}>📍 {l.city}</span>}
        </div>
        {/* Subscribe CTA */}
        <div style={{
          width: '100%', padding: '9px',
          background: 'linear-gradient(135deg,rgba(197,160,90,0.12),rgba(197,160,90,0.06))',
          border: '0.5px solid rgba(197,160,90,0.32)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '13px', fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.05em',
        }}>
          Subscribe →
        </div>
      </div>
    </Link>
  )
}

export default async function CreatorsPage() {
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
    .eq('category', 'creators')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  const featured = (listings || []).filter(l => l.featured_until && new Date(l.featured_until) > new Date())
  const regular  = (listings || []).filter(l => !l.featured_until || new Date(l.featured_until) <= new Date())
  const allListings = listings || []

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .creator-card:hover { transform: translateY(-5px) !important; box-shadow: 0 18px 52px rgba(0,0,0,0.6) !important; }
        .creator-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
        .filter-pill { height: 34px; padding: 0 16px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: background 0.15s, color 0.15s, border-color 0.15s; cursor: pointer; letter-spacing: 0.02em; }
        .filter-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .filter-pill.active { background: rgba(197,160,90,0.12); color: var(--gold); border-color: rgba(197,160,90,0.38); font-weight: 600; }
        @media(max-width:640px) { .creator-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
        @media(max-width:380px) { .creator-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '60px',
          position: 'sticky', top: 0, zIndex: 200,
          background: 'rgba(8,6,18,0.94)', backdropFilter: 'blur(18px)',
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
              Become a creator
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(140deg, #2a0d2a 0%, #1a0d1a 50%, #080612 100%)',
          borderBottom: '0.5px solid var(--b)',
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,rgba(197,160,90,0.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 30%,rgba(139,43,63,0.12) 0%,transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
              SecretXperience · Creators
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              Exclusive <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Creators</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Subscribe · Request custom content · Direct message
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allListings.length || 0}</span> creators available
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>Verified &amp; independent</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={{ borderBottom: '0.5px solid var(--b)', background: 'rgba(17,13,28,0.96)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '8px', alignItems: 'center', height: '52px', scrollbarWidth: 'none' }}>
            {CREATOR_FILTERS.map((f) => (
              <span key={f.value} className={`filter-pill${f.value === 'all' ? ' active' : ''}`}>
                {f.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

          {/* FEATURED SECTION */}
          {featured.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ height: '0.5px', flex: 1, background: 'linear-gradient(90deg,rgba(197,160,90,0.5),transparent)' }} />
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  ✦ Featured Creators
                </div>
                <div style={{ height: '0.5px', flex: 1, background: 'linear-gradient(270deg,rgba(197,160,90,0.5),transparent)' }} />
              </div>
              <div className="creator-grid">
                {featured.map((l, i) => <CreatorCard key={l.id} l={l} isFeatured idx={i} />)}
              </div>
              <div style={{ height: '0.5px', background: 'var(--b)', margin: '3rem 0 0' }} />
            </div>
          )}

          {/* ALL CREATORS */}
          {!listings || listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✦</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '24px' }}>Be a pioneer creator</div>
              <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '340px', lineHeight: 1.7 }}>No creators yet. Be among the first and build a following from day one.</p>
              <Link href="/advertise" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                Become a creator →
              </Link>
            </div>
          ) : (
            <div>
              {regular.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                    All Creators · {regular.length} profiles
                  </div>
                </div>
              )}
              <div className="creator-grid">
                {regular.map((l, i) => <CreatorCard key={l.id} l={l} isFeatured={false} idx={i} />)}
              </div>
            </div>
          )}

          {/* CTA BANNER */}
          {allListings.length > 0 && (
            <div style={{
              marginTop: '4rem',
              padding: '2.5rem',
              background: 'linear-gradient(140deg, #2a0d2a 0%, #1a0d1a 60%, #110d1c 100%)',
              border: '0.5px solid rgba(197,160,90,0.2)',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(197,160,90,0.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>Are you a creator?</div>
                <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Join SecretXperience and reach a curated audience of verified adult lifestyle enthusiasts across Europe.
                </p>
                <Link href="/advertise" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                  borderRadius: 'var(--r)', color: '#0a0a0a',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  Start your creator profile →
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
