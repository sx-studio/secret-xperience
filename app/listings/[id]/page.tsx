'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../app/lib/supabase'

/* ─── Category helpers ───────────────────────────────────── */

const CATEGORY_ICONS: Record<string, string> = {
  escorts:       '✦',
  massage:       '◈',
  companionship: '◇',
  domination:    '◉',
  adult:         '▲',
  creators:      '◎',
  nightlife:     '◐',
  experiences:   '◆',
  rentals:       '□',
  events:        '◳',
  photo:         '◑',
  memberships:   '◈',
}

const CATEGORY_LABELS: Record<string, string> = {
  escorts:       'Escort',
  massage:       'Massage',
  companionship: 'Companionship',
  domination:    'Domination',
  adult:         'Adult Services',
  creators:      'Creators',
  nightlife:     'Nightlife',
  experiences:   'Experiences',
  rentals:       'Rentals',
  events:        'Event Spaces',
  photo:         'Photo / Video',
  memberships:   'Memberships',
}

const MEET_LABELS: Record<string, string> = {
  incall:  'Incall',
  outcall: 'Outcall',
  both:    'Incall & Outcall',
}

/* ─── Types ─────────────────────────────────────────────── */

interface Listing {
  id:          string
  title:       string
  description: string | null
  category:    string
  subcategory: string | null
  city:        string
  country:     string
  price_from:  number | null
  price_to:    number | null
  currency:    string
  meet_type:   string | null
  images:      string[] | null
  verified:    boolean
  premium:     boolean
  trending:    boolean
  profile_id:  string
  profile: {
    full_name:  string | null
    username:   string | null
    avatar_url: string | null
    verified:   boolean
  }
}

/* ─── Page ──────────────────────────────────────────────── */

export default function ListingDetailPage() {
  const params  = useParams()
  const id      = params?.id as string

  const [listing,   setListing]   = useState<Listing | null>(null)
  const [notFound,  setNotFound]  = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [session,   setSession]   = useState<any>(null)
  const [activeImg, setActiveImg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = createClient()
      const [{ data: { session: sess } }, { data, error }] = await Promise.all([
        supabase.auth.getSession(),
        supabase
          .from('listings')
          .select(`
            *,
            profile:profiles!profile_id (
              full_name,
              username,
              avatar_url,
              verified
            )
          `)
          .eq('id', id)
          .single(),
      ])
      setSession(sess)
      if (error || !data) {
        setNotFound(true)
      } else {
        setListing(data as any)
        if (data.images?.length) setActiveImg(data.images[0])
        document.title = `${data.title} | SecretXperience`
        let meta = document.querySelector('meta[name="description"]')
        if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta) }
        meta.setAttribute('content', data.description?.slice(0, 160) || `Book ${data.title} in ${data.city}`)
      }
      setPageLoading(false)
    }
    load()
  }, [id])

  /* ── Navigate to message/book (auth guard) ── */
  function goToMessage() {
    if (!session) { window.location.href = '/login'; return }
    window.location.href = `/messages?provider_id=${listing!.profile_id}`
  }

  function goToBook() {
    if (!session) { window.location.href = '/login'; return }
    window.location.href = `/messages?provider_id=${listing!.profile_id}&listing_id=${listing!.id}`
  }

  /* ── Shared styles ── */
  const fonts = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');`

  /* ─── Loading ─── */
  if (pageLoading) return (
    <>
      <style>{`${fonts} body{background:#050505;margin:0;}`}</style>
      <div style={{
        minHeight: '100vh', background: '#050505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '1.5px solid rgba(197,160,90,0.2)',
          borderTop: '1.5px solid #c5a05a',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  )

  /* ─── Not found ─── */
  if (notFound || !listing) return (
    <>
      <style>{`${fonts} *, *::before, *::after{box-sizing:border-box;margin:0;padding:0;} body{background:#050505;}`}</style>
      <div style={{
        minHeight: '100vh', background: '#050505', color: '#ece8e1',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Jost', sans-serif", gap: '1.5rem', padding: '2rem',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', color: 'rgba(255,255,255,0.2)',
        }}>
          ◈
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '28px', fontWeight: 300,
          color: '#ece8e1', letterSpacing: '-0.01em',
        }}>
          Listing not found
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 300 }}>
          This listing may have been removed or doesn't exist.
        </p>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: '#c5a05a', fontSize: '13px', fontFamily: "'Jost', sans-serif",
          fontWeight: 500, letterSpacing: '0.06em', textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          ← Back to home
        </a>
      </div>
    </>
  )

  const cat       = listing.category
  const icon      = CATEGORY_ICONS[cat] || '◆'
  const catLabel  = CATEGORY_LABELS[cat] || cat
  const meetLabel = listing.meet_type ? (MEET_LABELS[listing.meet_type] || listing.meet_type) : null
  const hasImages = listing.images && listing.images.length > 0
  const prof      = listing.profile

  return (
    <>
      <style>{`
        ${fonts}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ld-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ld-tag {
          display: inline-flex; align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.45);
          font-size: 11px;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        .ld-thumb {
          width: 72px; height: 72px;
          object-fit: cover;
          border-radius: 8px;
          border: 1.5px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s, opacity 0.2s;
          opacity: 0.65;
        }
        .ld-thumb:hover { opacity: 1; }
        .ld-thumb.active {
          border-color: #c5a05a;
          opacity: 1;
        }
        .ld-book-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg,#c5a05a 0%,#a0803d 100%);
          border: none;
          border-radius: 12px;
          color: #080808;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
        }
        .ld-book-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);
          pointer-events: none;
        }
        .ld-book-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ld-msg-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 0.5px solid rgba(197,160,90,0.4);
          border-radius: 12px;
          color: #c5a05a;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .ld-msg-btn:hover {
          border-color: rgba(197,160,90,0.7);
          background: rgba(197,160,90,0.05);
        }
        @media (min-width: 768px) {
          .ld-layout { display: grid !important; grid-template-columns: 1fr 340px; gap: 2rem; }
        }
        @media (max-width: 480px) {
          .ld-hero-icon { font-size: 36px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#050505', color: '#ece8e1' }}>

        {/* ── Nav ── */}
        <nav style={{
          background: 'rgba(5,5,5,0.95)',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          height: '60px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '18px',
              lineHeight: 1,
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            aria-label="Go back"
          >
            ←
          </button>
          <a href="/" style={{ textDecoration: 'none', flex: 1 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20px',
              fontWeight: 400,
              color: '#c5a05a',
              letterSpacing: '0.04em',
            }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
          </a>
        </nav>

        {/* ── Body ── */}
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 6rem',
          animation: 'fadeUp 0.35s ease',
        }}>

          {/* Two-column layout on wide screens */}
          <div className="ld-layout" style={{ display: 'block' }}>

            {/* ── Left column ── */}
            <div>

              {/* Hero section */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                padding: '2rem 1.75rem',
                marginBottom: '1.5rem',
              }}>
                {/* Icon + Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="ld-hero-icon" style={{
                    fontSize: '44px',
                    color: 'rgba(197,160,90,0.7)',
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    {/* Badges row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.75rem' }}>
                      {/* Category pill */}
                      <span className="ld-badge" style={{
                        background: 'rgba(197,160,90,0.08)',
                        border: '0.5px solid rgba(197,160,90,0.25)',
                        color: 'rgba(197,160,90,0.8)',
                      }}>
                        {catLabel}
                      </span>
                      {listing.verified && (
                        <span className="ld-badge" style={{
                          background: 'rgba(80,160,120,0.1)',
                          border: '0.5px solid rgba(80,160,120,0.3)',
                          color: 'rgba(100,200,150,0.85)',
                        }}>
                          ✓ Verified
                        </span>
                      )}
                      {listing.premium && (
                        <span className="ld-badge" style={{
                          background: 'rgba(197,160,90,0.12)',
                          border: '0.5px solid rgba(197,160,90,0.35)',
                          color: '#c5a05a',
                        }}>
                          ★ Premium
                        </span>
                      )}
                      {listing.trending && (
                        <span className="ld-badge" style={{
                          background: 'rgba(184,77,114,0.1)',
                          border: '0.5px solid rgba(184,77,114,0.3)',
                          color: 'rgba(220,100,140,0.85)',
                        }}>
                          ↑ Trending
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(24px,4vw,36px)',
                      fontWeight: 400,
                      color: '#ece8e1',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      marginBottom: '0.75rem',
                    }}>
                      {listing.title}
                    </h1>

                    {/* City + meet type row */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
                    }}>
                      {listing.city && (
                        <span style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.4)',
                          fontWeight: 300,
                          letterSpacing: '0.03em',
                        }}>
                          📍 {listing.city}{listing.country ? `, ${listing.country}` : ''}
                        </span>
                      )}
                      {meetLabel && (
                        <span style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: '12px',
                          color: 'rgba(197,160,90,0.55)',
                          fontWeight: 400,
                          letterSpacing: '0.05em',
                        }}>
                          {meetLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price */}
                {(listing.price_from || listing.price_to) && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(197,160,90,0.07)',
                    border: '0.5px solid rgba(197,160,90,0.2)',
                    borderRadius: '10px',
                    marginBottom: '0',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '22px',
                      fontWeight: 400,
                      color: '#c5a05a',
                      letterSpacing: '0.01em',
                    }}>
                      {listing.price_from && listing.price_to
                        ? `€${listing.price_from} – €${listing.price_to}`
                        : listing.price_from
                        ? `from €${listing.price_from}`
                        : `up to €${listing.price_to}`}
                    </span>
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '11px',
                      color: 'rgba(197,160,90,0.45)',
                      fontWeight: 300,
                    }}>
                      {listing.currency || 'EUR'}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo gallery */}
              {hasImages && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  {/* Main image */}
                  {activeImg && (
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '0.875rem',
                      background: 'rgba(255,255,255,0.03)',
                    }}>
                      <img
                        src={activeImg}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  {/* Thumbnail strip */}
                  {listing.images!.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {listing.images!.map((url, i) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className={`ld-thumb${activeImg === url ? ' active' : ''}`}
                          onClick={() => setActiveImg(url)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem 1.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}>
                    About this service
                  </p>
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.55)',
                    fontWeight: 300,
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Tags / subcategory */}
              {listing.subcategory && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem 1.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    marginBottom: '0.875rem',
                  }}>
                    Tags
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="ld-tag">{listing.subcategory}</span>
                    <span className="ld-tag">{catLabel}</span>
                    {meetLabel && <span className="ld-tag">{meetLabel}</span>}
                  </div>
                </div>
              )}

            </div>

            {/* ── Right column (sidebar) ── */}
            <div>

              {/* Provider card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                padding: '1.5rem',
                marginBottom: '1rem',
              }}>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Provider
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                    background: 'rgba(197,160,90,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {prof?.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={prof.full_name || 'Provider'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px',
                        color: 'rgba(197,160,90,0.6)',
                        fontWeight: 300,
                      }}>
                        {(prof?.full_name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name + verified */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#ece8e1',
                        letterSpacing: '0.01em',
                      }}>
                        {prof?.full_name || 'Anonymous'}
                      </span>
                      {prof?.verified && (
                        <span style={{
                          fontSize: '11px',
                          color: 'rgba(100,200,150,0.85)',
                          fontFamily: "'Jost', sans-serif",
                          fontWeight: 500,
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                    {prof?.username && (
                      <span style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.28)',
                        fontWeight: 300,
                        letterSpacing: '0.03em',
                      }}>
                        @{prof.username}
                      </span>
                    )}
                  </div>
                </div>

                {/* View profile link */}
                <a
                  href={`/profile/${listing.profile_id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  View Profile →
                </a>
              </div>

              {/* Pricing card */}
              {(listing.price_from || listing.price_to || listing.meet_type) && (
                <div style={{
                  background: 'rgba(197,160,90,0.04)',
                  border: '0.5px solid rgba(197,160,90,0.15)',
                  borderRadius: '18px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1rem',
                }}>
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(197,160,90,0.45)',
                    fontWeight: 600,
                    marginBottom: '0.875rem',
                  }}>
                    Pricing details
                  </p>
                  {listing.price_from && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Starting from
                      </span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#c5a05a', fontWeight: 400 }}>
                        €{listing.price_from}
                      </span>
                    </div>
                  )}
                  {listing.price_to && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Up to
                      </span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#c5a05a', fontWeight: 400 }}>
                        €{listing.price_to}
                      </span>
                    </div>
                  )}
                  {listing.meet_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Meet type
                      </span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>
                        {meetLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button type="button" className="ld-book-btn" onClick={goToBook}>
                  Book Now
                </button>
                <button type="button" className="ld-msg-btn" onClick={goToMessage}>
                  Send Message
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
