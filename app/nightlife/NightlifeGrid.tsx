'use client'
import { useState } from 'react'

interface Listing {
  id: string
  title: string
  description: string | null
  city: string | null
  country: string | null
  category: string
  subcategory: string | null
  images: string[] | null
  active: boolean
  created_at: string
  tags: string[] | null
  verified?: boolean
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

function isOpenNow(): boolean {
  const h = new Date().getHours()
  return h >= 21 || h < 4
}

function isTonightOpen(): boolean {
  const h = new Date().getHours()
  return h >= 16
}

function isNewListing(createdAt: string): boolean {
  return (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
}

function venueTypeFromSubcategory(sub: string | null): string {
  if (!sub) return 'Club'
  const s = sub.toLowerCase()
  if (s.includes('sauna')) return 'Sauna'
  if (s.includes('strip')) return 'Strip Club'
  if (s.includes('private') || s.includes('party')) return 'Private Party'
  if (s.includes('lounge')) return 'Lounge'
  if (s.includes('bar')) return 'Bar'
  if (s.includes('club')) return 'Club'
  return 'Club'
}

export default function NightlifeGrid({ listings }: { listings: Listing[] }) {
  const [discreet, setDiscreet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('discreetMode') === '1'
  })

  const openNow = isOpenNow()
  const tonightOk = isTonightOpen()

  return (
    <>
      {/* Count bar with discreet toggle */}
      <div className="nl-count-bar">
        <div>
          <span className="nl-count-label">Venues</span>
          <span className="nl-count-num">{listings.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--sans, "Poppins", sans-serif)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            fontWeight: 300,
            letterSpacing: '0.04em',
          }}>
            Updated nightly
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
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: '999px',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 600,
              color: discreet ? 'var(--gold, #c5a05a)' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--sans, "Poppins", sans-serif)',
            }}
          >
            <i className={`ti ${discreet ? 'ti-eye-off' : 'ti-eye'}`} />
            {discreet ? 'Discreet ON' : 'Discreet'}
          </button>
        </div>
      </div>

      {/* Venue Grid */}
      <div className="nl-grid" id="nl-grid">
        {listings.length === 0 ? (
          <div className="nl-empty">
            <div className="nl-empty-icon">◐</div>
            <p className="nl-empty-text">The night is still young</p>
            <p className="nl-empty-sub">No venues listed yet — be the first to list yours.</p>
          </div>
        ) : listings.map((listing, idx) => {
          const vType = venueTypeFromSubcategory(listing.subcategory)
          const img = listing.images?.[0] ?? null
          const tags = listing.tags ?? []
          const availNow = isAvailableNow(listing.tags) || openNow
          const newListing = isNewListing(listing.created_at)

          return (
            <a
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="nl-card"
              data-city={listing.city ?? 'All'}
              data-vtype={vType}
              style={{ animationDelay: `${idx * 0.06}s`, textDecoration: 'none' }}
            >
              {/* Image area */}
              <div className="nl-card-img">
                {img ? (
                  <img
                    src={img}
                    alt={listing.title}
                    style={{ filter: discreet ? 'blur(24px) brightness(0.5)' : 'none', transition: 'filter 0.3s ease' }}
                  />
                ) : (
                  <div className="nl-card-img-placeholder">
                    <span style={{ fontSize: '48px', opacity: 0.2, color: '#c5a05a' }}>◐</span>
                  </div>
                )}
                <div className="nl-card-img-overlay" />

                {/* Availability badges (top-right, existing style) */}
                <div className="nl-badge">
                  {availNow && (
                    <span className="nl-badge-pill nl-badge-open">Open Now</span>
                  )}
                  {!availNow && tonightOk && (
                    <span className="nl-badge-pill nl-badge-tonight">Tonight</span>
                  )}
                </div>

                {/* Verified / New badges (top-left) */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 2 }}>
                  {listing.verified && (
                    <span style={{ background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>VERIFIED</span>
                  )}
                  {newListing && !availNow && (
                    <span style={{ background: 'rgba(130,100,220,0.18)', border: '0.5px solid rgba(130,100,220,0.4)', color: '#a78bfa', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>NEW</span>
                  )}
                </div>

                <div className="nl-card-name">{listing.title}</div>
              </div>

              {/* Body */}
              <div className="nl-card-body">
                <div className="nl-card-meta">
                  {listing.city && (
                    <span className="nl-card-city">{listing.city}</span>
                  )}
                  <span className="nl-card-type">{vType}</span>
                </div>

                {listing.description && (
                  <p className="nl-card-desc">{listing.description}</p>
                )}

                {tags.length > 0 && (
                  <div className="nl-card-tags">
                    {tags.filter(t => !t.startsWith('wh:')).slice(0, 4).map(tag => (
                      <span key={tag} className="nl-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="nl-card-cta">
                  <span className="nl-cta-link">View venue →</span>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Shown by filter script when all cards are filtered out */}
      {listings.length > 0 && (
        <div id="nl-filter-empty" style={{
          display: 'none', textAlign: 'center', padding: '4rem 1rem',
        }}>
          <div style={{ fontSize: '40px', opacity: 0.2, color: '#c5a05a', marginBottom: '1rem' }}>◐</div>
          <p className="nl-empty-text">No venues found</p>
          <p className="nl-empty-sub">Try a different city or venue type.</p>
        </div>
      )}
    </>
  )
}
