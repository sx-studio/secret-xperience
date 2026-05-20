import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'The Boutique | SecretXperience',
    description: 'Curated luxury accessories, intimate gifts, and premium wellness. Discreet EU shipping in plain packaging.',
    openGraph: {
      title: 'The Boutique | SecretXperience',
      description: 'Curated luxury accessories, intimate gifts, and premium wellness.',
      url: 'https://www.secretxperience.eu/shop',
    },
  }
}

const SHOP_FILTERS = [
  { value: 'all', label: 'All Products' },
  { value: 'lingerie', label: 'Lingerie' },
  { value: 'leather', label: 'Leather' },
  { value: 'wellness', label: 'Wellness & Toys' },
  { value: 'bdsm', label: 'BDSM Equipment' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'rating', label: 'Rating' },
]

const PRODUCT_GRADS = [
  'linear-gradient(140deg, #3a1020 0%, #1a0810 100%)',
  'linear-gradient(140deg, #1a1230 0%, #0d0820 100%)',
  'linear-gradient(140deg, #2a1a10 0%, #150d08 100%)',
  'linear-gradient(140deg, #1a2a18 0%, #0d1410 100%)',
  'linear-gradient(140deg, #2a1028 0%, #150814 100%)',
]

function ProductCard({ l, idx }: { l: any; idx: number }) {
  const monogram = (l.title || 'Sx').slice(0, 2).toUpperCase()
  const grad = PRODUCT_GRADS[idx % PRODUCT_GRADS.length]

  return (
    <div style={{ position: 'relative' }}>
      <Link
        href={`/listings/${l.id}`}
        className="shop-card"
        style={{
          display: 'block',
          textDecoration: 'none',
          background: 'var(--bg1)',
          border: '0.5px solid var(--b)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.15s',
        }}
      >
        {/* Product image area */}
        <div style={{
          height: '200px',
          background: grad,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            background: 'linear-gradient(0deg, rgba(8,6,18,0.5) 0%, transparent 55%)',
          }} />
          {l.subcategory && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px', zIndex: 2,
              fontSize: '10px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '6px',
              background: 'rgba(139,43,63,0.25)', color: '#d05b73',
              border: '0.5px solid rgba(139,43,63,0.4)',
              backdropFilter: 'blur(4px)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {l.subcategory}
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '0.9rem 1rem 1rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--t)', marginBottom: '6px', lineHeight: 1.3, letterSpacing: '0.01em' }}>
            {l.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--gold)', fontWeight: 500 }}>
              {l.price_from ? `€${l.price_from}${l.price_to ? `–€${l.price_to}` : ''}` : 'POA'}
            </span>
            {l.rating > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'var(--gold)' }}>★</span> {Number(l.rating).toFixed(1)}
                {l.review_count > 0 && <span>({l.review_count})</span>}
              </span>
            )}
          </div>
          {l.city && (
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '5px' }}>
              {l.city === 'online' ? '🌐 Available online' : `🏪 ${l.city}`}
            </div>
          )}
        </div>
      </Link>
      {/* Wishlist heart — purely visual */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 3,
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
        border: '0.5px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--t2)', fontSize: '16px',
        userSelect: 'none',
      }}>♡</div>
    </div>
  )
}

export default async function ShopPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, category, subcategory, city, country, price_from, price_to, images, verified, premium, rating, review_count, featured_until')
    .eq('active', true)
    .eq('category', 'shop')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  const allListings = listings || []

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .shop-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(0,0,0,0.5) !important; border-color: var(--b3) !important; }
        .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .filter-pill { height: 34px; padding: 0 16px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: all 0.15s; cursor: pointer; letter-spacing: 0.02em; flex-shrink: 0; }
        .filter-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .filter-pill.active { background: rgba(139,43,63,0.14); color: #d05b73; border-color: rgba(139,43,63,0.38); font-weight: 600; }
        .sort-sel { height: 34px; padding: 0 12px; background: var(--bg2); border: 0.5px solid var(--b2); border-radius: var(--r); color: var(--t2); font-size: 13px; cursor: pointer; outline: none; flex-shrink: 0; }
        .sort-sel:focus { border-color: var(--gbrd); }
        @media(max-width:640px) { .shop-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
        @media(max-width:380px) { .shop-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

        {/* STICKY SHIPPING BANNER */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(139,43,63,0.2),rgba(109,58,92,0.2))',
          borderBottom: '0.5px solid rgba(139,43,63,0.3)',
          padding: '7px 1.5rem',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--t2)',
          letterSpacing: '0.06em',
          position: 'sticky',
          top: 0,
          zIndex: 300,
          backdropFilter: 'blur(12px)',
        }}>
          <span style={{ color: 'var(--gold)', marginRight: '8px' }}>✦</span>
          Discreet EU shipping · 3–5 days · Plain packaging
          <span style={{ color: 'var(--gold)', marginLeft: '8px' }}>✦</span>
        </div>

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '58px',
          position: 'sticky', top: '34px', zIndex: 200,
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
              List your shop
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 50%, #080612 100%)',
          borderBottom: '0.5px solid var(--b)',
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 60%,rgba(139,43,63,0.14) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 20%,rgba(197,160,90,0.08) 0%,transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
              SecretXperience · Boutique
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              The <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Boutique</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Curated luxury accessories, intimate gifts, and premium wellness
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allListings.length}</span> products
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>🚚 Plain packaging · Free returns</span>
            </div>
          </div>
        </div>

        {/* FILTER + SORT BAR */}
        <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {SHOP_FILTERS.map((f) => (
                <span key={f.value} className={`filter-pill${f.value === 'all' ? ' active' : ''}`}>
                  {f.label}
                </span>
              ))}
            </div>
            <select className="sort-sel" defaultValue="relevance">
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

          {/* RESULTS META */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--t3)', letterSpacing: '0.04em' }}>
              {allListings.length} products found
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Shipping to:</span>
              <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: 500 }}>🇪🇺 EU</span>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {allListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(139,43,63,0.1)', border: '0.5px solid rgba(139,43,63,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🛍</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '24px' }}>Coming Soon</div>
              <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '340px', lineHeight: 1.7 }}>
                Our boutique is being curated. Be the first to list your products and reach thousands of customers.
              </p>
              <Link href="/advertise" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                List your products →
              </Link>
            </div>
          ) : (
            <div className="shop-grid">
              {allListings.map((l, i) => <ProductCard key={l.id} l={l} idx={i} />)}
            </div>
          )}

          {/* VENDOR CTA */}
          {allListings.length > 0 && (
            <div style={{
              marginTop: '4rem',
              padding: '2.5rem',
              background: 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 60%, #110d1c 100%)',
              border: '0.5px solid rgba(139,43,63,0.25)',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(139,43,63,0.12) 0%,transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>Sell in The Boutique</div>
                <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Reach thousands of European customers. Discreet, verified, adult-lifestyle focused.
                </p>
                <Link href="/advertise" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                  borderRadius: 'var(--r)', color: '#0a0a0a',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  Apply as a vendor →
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
