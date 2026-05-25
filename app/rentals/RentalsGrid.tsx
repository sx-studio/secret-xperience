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
  { value: 'antwerp', label: '🇧🇪 Antwerp' },
  { value: 'ghent', label: '🇧🇪 Ghent' },
  { value: 'amsterdam', label: '🇳🇱 Amsterdam' },
  { value: 'berlin', label: '🇩🇪 Berlin' },
]

const TYPE_FILTERS = [
  { value: 'all', label: 'All types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'suite', label: 'Suite' },
  { value: 'studio', label: 'Studio' },
]

const SPACE_GRADS = [
  'linear-gradient(140deg, #1a1a2e 0%, #0d0d1a 100%)',
  'linear-gradient(140deg, #1e1e2e 0%, #10101e 100%)',
  'linear-gradient(140deg, #2a2018 0%, #181208 100%)',
  'linear-gradient(140deg, #1a2020 0%, #0d1414 100%)',
  'linear-gradient(140deg, #281a18 0%, #140d0d 100%)',
]

const CITY_FLAGS: Record<string, string> = {
  brussels: '🇧🇪',
  antwerp: '🇧🇪',
  ghent: '🇧🇪',
  amsterdam: '🇳🇱',
  berlin: '🇩🇪',
  cologne: '🇩🇪',
  paris: '🇫🇷',
  rotterdam: '🇳🇱',
  vienna: '🇦🇹',
  madrid: '🇪🇸',
}

function getFlag(city: string): string {
  const lower = (city || '').toLowerCase()
  return CITY_FLAGS[lower] || '🏙'
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

function RentalCard({ l, idx, discreet }: { l: Listing; idx: number; discreet: boolean }) {
  const monogram = (l.title || 'Sx').slice(0, 2).toUpperCase()
  const grad = SPACE_GRADS[idx % SPACE_GRADS.length]
  const flag = getFlag(l.city ?? '')
  const availNow = isAvailableNow(l.tags)
  const newListing = isNewListing(l.created_at)

  const amenities: string[] = []
  if (l.subcategory?.toLowerCase().includes('private') || idx % 3 === 0) amenities.push('🔑 Private entry')
  if (l.subcategory?.toLowerCase().includes('suite') || idx % 4 === 0) amenities.push('🛁 Jacuzzi')
  amenities.push('📍 Centre')
  if (idx % 2 === 0) amenities.push('🚗 Parking')

  const isHourly = l.meet_type === 'incall' || idx % 2 === 0
  const priceLabel = l.price_from
    ? isHourly ? `€${l.price_from}/hr` : `€${l.price_from}/night`
    : null

  return (
    <Link
      href={`/listings/${l.id}`}
      className="rental-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'var(--bg1)',
        border: '0.5px solid var(--b)',
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.15s',
      }}
    >
      {/* Image area */}
      <div style={{
        height: '180px',
        background: grad,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
            fontSize: '80px',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'rgba(197,160,90,0.15)',
            lineHeight: 1,
            userSelect: 'none',
          }}>{monogram}</span>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(8,6,18,0.7) 0%, transparent 50%)',
        }} />

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '5px' }}>
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

        {/* Price badge pinned bottom-right */}
        {priceLabel && (
          <div style={{
            position: 'absolute', bottom: '10px', right: '10px', zIndex: 2,
            background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
            color: '#0a0a0a', fontSize: '13px', fontWeight: 700,
            padding: '5px 10px', borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            letterSpacing: '0.02em',
          }}>
            {priceLabel}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{ padding: '0.9rem 1rem 1rem' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--t)', marginBottom: '4px', lineHeight: 1.3, letterSpacing: '0.01em' }}>
          {l.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{flag}</span>
          <span>{l.city}{l.country ? `, ${l.country}` : ''}</span>
        </div>
        {/* Amenity tags */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {amenities.slice(0, 3).map(a => (
            <span key={a} style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '6px',
              background: 'var(--bg2)', border: '0.5px solid var(--b)',
              color: 'var(--t2)', whiteSpace: 'nowrap',
            }}>{a}</span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(l.rating ?? 0) > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ color: 'var(--gold)' }}>★</span> {Number(l.rating).toFixed(1)}
            </span>
          )}
          {l.meet_type && (
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
              background: 'rgba(197,160,90,0.1)', color: 'var(--gold)',
              border: '0.5px solid rgba(197,160,90,0.3)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {l.meet_type}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function RentalsGrid({ listings }: { listings: Listing[] }) {
  const [discreet, setDiscreet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('discreetMode') === '1'
  })
  const [cityFilter, setCityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = listings.filter(l => {
    const cityOk = cityFilter === 'all' || (l.city ?? '').toLowerCase().includes(cityFilter)
    const typeOk = typeFilter === 'all' || (l.subcategory ?? '').toLowerCase().includes(typeFilter)
    return cityOk && typeOk
  })

  return (
    <>
      {/* CITY FILTER TABS */}
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'rgba(17,13,28,0.96)', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '52px', scrollbarWidth: 'none' }}>
          {CITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCityFilter(f.value)}
              className={`loc-pill${cityFilter === f.value ? ' active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TYPE FILTER */}
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg)', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem 1.5rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '44px', scrollbarWidth: 'none' }}>
          <span style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '4px', whiteSpace: 'nowrap' }}>Type:</span>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`type-pill${typeFilter === f.value ? ' active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results meta + discreet toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--t3)' }}>
          {filtered.length} spaces found
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

      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(122,170,238,0.08)', border: '0.5px solid rgba(122,170,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏠</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '24px' }}>No spaces yet</div>
          <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '340px', lineHeight: 1.7 }}>
            Be among the first to list your private space and attract discreet bookings from day one.
          </p>
          <Link href="/advertise" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            List your space →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '36px', opacity: 0.3 }}>🏠</div>
          <p style={{ fontSize: '14px', color: 'var(--t3)' }}>No spaces match this filter</p>
        </div>
      ) : (
        <div className="rental-grid">
          {filtered.map((l, i) => <RentalCard key={l.id} l={l} idx={i} discreet={discreet} />)}
        </div>
      )}
    </>
  )
}
