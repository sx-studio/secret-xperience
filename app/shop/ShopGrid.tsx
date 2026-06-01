'use client'
import { useState } from 'react'
import Link from 'next/link'
import { focusPosition } from '../lib/imageFocus'

interface Listing {
  id: string
  title: string
  description?: string | null
  category: string
  subcategory?: string | null
  city?: string | null
  price_from?: number | null
  price_to?: number | null
  images?: string[] | null
  image_focus?: Record<string, { x: number; y: number }>
  verified?: boolean
  premium?: boolean
  rating?: number
  review_count?: number
  featured_until?: string | null
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

function ProductCard({ l, idx }: { l: Listing; idx: number }) {
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
            <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, l.images[0]), position: 'absolute', inset: 0 }} />
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
            {l.rating != null && l.rating > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'var(--gold)' }}>★</span> {Number(l.rating).toFixed(1)}
                {(l.review_count ?? 0) > 0 && <span>({l.review_count})</span>}
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

function applySort(items: Listing[], sort: string): Listing[] {
  const out = [...items]
  if (sort === 'price_asc') out.sort((a, b) => (a.price_from ?? 0) - (b.price_from ?? 0))
  else if (sort === 'price_desc') out.sort((a, b) => (b.price_from ?? 0) - (a.price_from ?? 0))
  else if (sort === 'rating') out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  return out
}

export default function ShopGrid({ listings }: { listings: Listing[] }) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sort, setSort] = useState('relevance')

  const filtered = listings.filter(l =>
    categoryFilter === 'all' || (l.subcategory ?? '').toLowerCase().includes(categoryFilter)
  )

  const sorted = applySort(filtered, sort)

  return (
    <>
      {/* FILTER + SORT BAR */}
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {SHOP_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className={`filter-pill${categoryFilter === f.value ? ' active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            className="sort-sel"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2.5rem 0 1.5rem' }}>
        <span style={{ fontSize: '12px', color: 'var(--t3)', letterSpacing: '0.04em' }}>
          {sorted.length} products found
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Shipping to:</span>
          <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: 500 }}>🇪🇺 EU</span>
        </div>
      </div>

      {listings.length === 0 ? (
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
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '36px', opacity: 0.3 }}>🛍</div>
          <p style={{ fontSize: '14px', color: 'var(--t3)' }}>No products match this filter</p>
        </div>
      ) : (
        <div className="shop-grid">
          {sorted.map((l, i) => <ProductCard key={l.id} l={l} idx={i} />)}
        </div>
      )}
    </>
  )
}
