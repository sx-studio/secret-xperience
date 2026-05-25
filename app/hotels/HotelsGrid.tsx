'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Listing {
  id: string
  title: string
  description?: string | null
  category: string
  subcategory?: string | null
  city?: string | null
  country?: string | null
  price_from?: number | null
  price_to?: number | null
  images?: string[] | null
  verified?: boolean
  premium?: boolean
  rating?: number
  review_count?: number
  meet_type?: string | null
  featured_until?: string | null
  created_at: string
  tags?: string[] | null
}

const CITY_FILTERS = [
  { value: 'all', label: 'All Cities' },
  { value: 'brussels', label: '🇧🇪 Brussels' },
  { value: 'amsterdam', label: '🇳🇱 Amsterdam' },
  { value: 'berlin', label: '🇩🇪 Berlin' },
  { value: 'paris', label: '🇫🇷 Paris' },
  { value: 'vienna', label: '🇦🇹 Vienna' },
  { value: 'barcelona', label: '🇪🇸 Barcelona' },
]

const HOTEL_GRADS = [
  'linear-gradient(140deg, #1f2a2e 0%, #0d1416 100%)',
  'linear-gradient(140deg, #1a2018 0%, #0d1008 100%)',
  'linear-gradient(140deg, #2a1a20 0%, #140d10 100%)',
  'linear-gradient(140deg, #20201a 0%, #10100d 100%)',
  'linear-gradient(140deg, #1a1a2a 0%, #0d0d16 100%)',
]

const HOTEL_SUBCATS = ['Boutique', 'Luxury', 'Lifestyle']
const AMENITY_ICONS = ['🔒 Private', '🍾 Bar', '🛁 Spa', '🌐 Discreet', '🅿 Valet', '🍳 Breakfast']

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

function getCountryFlag(city: string, country: string): string {
  const c = (city || '').toLowerCase()
  const co = (country || '').toLowerCase()
  return CITY_FLAGS[c] || COUNTRY_FLAGS[co] || '🏨'
}

function isAvailableNow(tags: string[] | null | undefined): boolean {
  if (!tags) return false
  const days = ['sun','mon','tue','wed','thu','fri','sat']
  const now = new Date()
  const day = days[now.getDay()]
  const whTag = tags.find(t => t.startsWith(`wh:${day}:`))
  if (!whTag) return false
  const range = whTag.split(':')[2]
  if (!range || range === 'off') return false
  const [startStr, endStr] = range.split('-')
  if (!startStr || !endStr) return false
  const sh = parseInt(startStr), eh = parseInt(endStr)
  const cur = now.getHours()
  return cur >= sh && cur < eh
}

function isNewListing(createdAt: string): boolean {
  return (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
}

function HotelCard({ l, idx, discreet }: { l: Listing; idx: number; discreet: boolean }) {
  const monogram = (l.title || 'Sx').slice(0, 2).toUpperCase()
  const grad = HOTEL_GRADS[idx % HOTEL_GRADS.length]
  const flag = getCountryFlag(l.city ?? '', l.country ?? '')
  const isFeatured = l.featured_until && new Date(l.featured_until) > new Date()
  const subcat = l.subcategory || HOTEL_SUBCATS[idx % HOTEL_SUBCATS.length]
  const amenities = AMENITY_ICONS.slice(0, 3 + (idx % 2))
  const availNow = isAvailableNow(l.tags)
  const newListing = isNewListing(l.created_at)

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

      {/* Verified / Available / New badges stacked below featured */}
      <div style={{ position: 'absolute', top: isFeatured ? '44px' : '12px', left: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {l.verified && (
          <span style={{ background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>VERIFIED</span>
        )}
        {availNow && (
          <span style={{ background: 'rgba(62,207,142,0.18)', border: '0.5px solid rgba(62,207,142,0.45)', color: '#3ecf8e', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3ecf8e', display: 'inline-block', boxShadow: '0 0 4px #3ecf8e' }} />
            AVAILABLE
          </span>
        )}
        {newListing && !availNow && (
          <span style={{ background: 'rgba(130,100,220,0.18)', border: '0.5px solid rgba(130,100,220,0.4)', color: '#a78bfa', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>NEW</span>
        )}
      </div>

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
          <img
            src={l.images[0]}
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0,
              filter: discreet ? 'blur(24px) brightness(0.5)' : 'none',
              transition: 'filter 0.3s ease',
            }}
          />
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
            {(l.rating ?? 0) > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: 'var(--gold)' }}>★</span>
                {Number(l.rating).toFixed(1)}
                {(l.review_count ?? 0) > 0 && <span>({l.review_count} reviews)</span>}
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

export default function HotelsGrid({ listings }: { listings: Listing[] }) {
  const [discreet, setDiscreet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('discreetMode') === '1'
  })
  const [cityFilter, setCityFilter] = useState('all')

  const filteredAll = listings.filter(l =>
    cityFilter === 'all' || (l.city ?? '').toLowerCase().includes(cityFilter)
  )

  const featured = filteredAll.filter(l => l.featured_until && new Date(l.featured_until) > new Date())
  const regular  = filteredAll.filter(l => !l.featured_until || new Date(l.featured_until) <= new Date())

  return (
    <>
      {/* CITY FILTER TABS */}
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem 1.5rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '56px', scrollbarWidth: 'none' }}>
          {CITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCityFilter(f.value)}
              className={`filter-pill${cityFilter === f.value ? ' active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count + discreet toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--t3)' }}>
          {filteredAll.length} hotels found
        </span>
        <button
          onClick={() => {
            const next = !discreet
            setDiscreet(next)
            localStorage.setItem('discreetMode', next ? '1' : '0')
          }}
          title={discreet ? 'Exit discreet mode' : 'Discreet mode — blur photos'}
          style={{
            background: discreet ? 'rgba(197,160,90,0.15)' : 'transparent',
            border: '0.5px solid var(--b3)',
            borderRadius: '999px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: discreet ? 'var(--gold)' : 'var(--t3)',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <i className={`ti ${discreet ? 'ti-eye-off' : 'ti-eye'}`} />
          {discreet ? 'Discreet ON' : 'Discreet'}
        </button>
      </div>

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
            {featured.map((l, i) => <HotelCard key={l.id} l={l} idx={i} discreet={discreet} />)}
          </div>
          <div style={{ height: '0.5px', background: 'var(--b)', margin: '2.5rem 0 0' }} />
        </div>
      )}

      {/* HOTEL LIST */}
      {listings.length === 0 ? (
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
      ) : filteredAll.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '36px', opacity: 0.3 }}>🏨</div>
          <p style={{ fontSize: '14px', color: 'var(--t3)' }}>No hotels match this filter</p>
        </div>
      ) : (
        <div className="hotel-list">
          {regular.map((l, i) => <HotelCard key={l.id} l={l} idx={i + featured.length} discreet={discreet} />)}
        </div>
      )}
    </>
  )
}
