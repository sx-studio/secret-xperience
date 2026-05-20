'use client'

import { useState } from 'react'

/* ─────────────────────────────────────────────────────────
   Escort / companion / massage / domination profile layout
   Modelled after the redlights.be advertising-profile style:
   — full-width photo gallery with dot/arrow nav
   — two-column: left = bio + services + reviews
                  right (sticky) = rates + stats + contact CTA
   ───────────────────────────────────────────────────────── */

interface Review {
  id: string
  rating: number
  content: string | null
  created_at: string
  profiles: { full_name: string | null; username: string | null } | null
}

interface EscortProfileProps {
  listing: {
    id: string
    title: string
    description: string | null
    category: string
    subcategory: string | null
    city: string
    country: string
    price_from: number | null
    price_to: number | null
    currency: string
    meet_type: string | null
    images: string[] | null
    verified: boolean
    premium: boolean
    profile_id: string
    profile: {
      full_name: string | null
      username: string | null
      avatar_url: string | null
      verified: boolean
    }
    tags?: string[] | null
    rating?: number
    review_count?: number
  }
  reviews: Review[]
  session: any
  onBook: () => void
  onMessage: () => void
  onReviewSubmit: (rating: number, text: string) => Promise<void>
}

/* Classify tags into buckets */
const HAIR_TAGS   = new Set(['blonde', 'brunette', 'redhead', 'black hair', 'auburn', 'dark hair'])
const BUILD_TAGS  = new Set(['slim', 'athletic', 'curvy', 'petite', 'bbw', 'muscular', 'fit'])
const ETHNIC_TAGS = new Set(['european', 'latina', 'asian', 'ebony', 'arabic', 'mixed', 'eastern european'])
const SERVICE_TAGS = new Set([
  'gfe', 'girlfriend experience', 'bdsm', 'massage', 'erotic massage', 'tantric',
  'roleplay', 'fetish', 'domination', 'submission', 'bondage', 'anal', 'oral',
  'duo', 'couples', 'threesome', 'striptease', 'sexting', 'video calls',
  'overnight', 'travel companion', 'dinner date', 'party girl',
  'toys', 'strap-on', 'pegging', 'prostate massage', 'golden shower',
])

function classifyTags(tags: string[]) {
  const lower = tags.map(t => t.toLowerCase())
  return {
    hair:     lower.find(t => HAIR_TAGS.has(t)) ?? null,
    build:    lower.find(t => BUILD_TAGS.has(t)) ?? null,
    ethnicity: lower.find(t => ETHNIC_TAGS.has(t)) ?? null,
    services: tags.filter(t => !HAIR_TAGS.has(t.toLowerCase()) && !BUILD_TAGS.has(t.toLowerCase()) && !ETHNIC_TAGS.has(t.toLowerCase())),
  }
}

function derivedRates(base: number, currency: string) {
  const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  return [
    { label: '30 min',   price: Math.round(base * 0.6) },
    { label: '1 hour',   price: base },
    { label: '2 hours',  price: Math.round(base * 1.7) },
    { label: '3 hours',  price: Math.round(base * 2.4) },
    { label: 'Overnight', price: Math.round(base * 5) },
  ].filter(r => r.price > 0).map(r => ({ ...r, sym }))
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function EscortProfile({
  listing, reviews, session, onBook, onMessage, onReviewSubmit,
}: EscortProfileProps) {
  const [imgIdx, setImgIdx]         = useState(0)
  const [lightbox, setLightbox]     = useState(false)
  const [showAllServices, setShowAllServices] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover]   = useState(0)
  const [reviewText, setReviewText]     = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const images = listing.images?.filter(Boolean) ?? []
  const tags   = listing.tags ?? []
  const { hair, build, ethnicity, services } = classifyTags(tags)
  const rates  = listing.price_from ? derivedRates(listing.price_from, listing.currency ?? 'EUR') : []
  const sym    = listing.currency === 'EUR' ? '€' : '£'

  const displayedServices = showAllServices ? services : services.slice(0, 12)
  const catColor = listing.category === 'domination' ? '#8b2b3f' : '#c5a05a'

  async function handleReviewSubmit() {
    if (reviewRating === 0) return
    setSubmittingReview(true)
    await onReviewSubmit(reviewRating, reviewText)
    setReviewRating(0)
    setReviewText('')
    setShowReviewForm(false)
    setSubmittingReview(false)
  }

  return (
    <>
      <style>{`
        .ep-photo-gallery { position: relative; width: 100%; aspect-ratio: 4/3; background: #0d0d14; border-radius: 18px; overflow: hidden; cursor: pointer; }
        .ep-photo-gallery img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.3s; }
        .ep-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); border: 0.5px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; z-index: 3; transition: background 0.2s; }
        .ep-arrow:hover { background: rgba(0,0,0,0.8); }
        .ep-arrow.left { left: 14px; }
        .ep-arrow.right { right: 14px; }
        .ep-dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 3; }
        .ep-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: background 0.2s, width 0.2s; }
        .ep-dot.active { background: #c5a05a; width: 20px; border-radius: 3px; }
        .ep-thumb-strip { display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .ep-thumb { width: 68px; height: 68px; object-fit: cover; border-radius: 8px; border: 1.5px solid transparent; cursor: pointer; flex-shrink: 0; opacity: 0.55; transition: opacity 0.2s, border-color 0.2s; }
        .ep-thumb:hover { opacity: 0.85; }
        .ep-thumb.active { border-color: #c5a05a; opacity: 1; }
        .ep-thumb-placeholder { width: 68px; height: 68px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; font-size: 22px; color: rgba(255,255,255,0.12); flex-shrink: 0; }
        .ep-service-tag { display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 20px; border: 0.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.55); font-size: 12.5px; letter-spacing: 0.03em; }
        .ep-service-tag::before { content: '✓'; color: #c5a05a; font-size: 11px; }
        .ep-stat-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 0.5px solid rgba(255,255,255,0.05); }
        .ep-stat-row:last-child { border-bottom: none; }
        .ep-stat-label { font-size: 12px; color: rgba(255,255,255,0.35); letter-spacing: 0.06em; text-transform: uppercase; }
        .ep-stat-val { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .ep-rate-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 0.5px solid rgba(255,255,255,0.05); }
        .ep-rate-row:last-child { border-bottom: none; }
        .ep-rate-label { font-size: 13px; color: rgba(255,255,255,0.45); }
        .ep-rate-price { font-size: 16px; font-weight: 600; color: #c5a05a; font-family: 'Cormorant Garamond', serif; letter-spacing: 0.02em; }
        .ep-contact-btn { width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; position: relative; overflow: hidden; transition: opacity 0.2s, transform 0.15s; }
        .ep-contact-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ep-contact-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%); pointer-events: none; }
        .ep-msg-btn { width: 100%; padding: 13px; border-radius: 12px; font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: border-color 0.2s, background 0.2s; background: transparent; border: 0.5px solid rgba(197,160,90,0.4); color: #c5a05a; }
        .ep-msg-btn:hover { border-color: rgba(197,160,90,0.7); background: rgba(197,160,90,0.05); }
        .ep-sidebar { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 1rem; }
        .ep-card { background: rgba(255,255,255,0.025); border: 0.5px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.4rem; }
        .ep-section { margin-bottom: 2rem; }
        .ep-section-title { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 1rem; font-weight: 500; }
        .ep-avail-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .ep-lightbox { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.94); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
        .ep-lightbox img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
        .rv-star { cursor: pointer; font-size: 22px; color: rgba(197,160,90,0.25); transition: color 0.15s, transform 0.1s; line-height: 1; background: none; border: none; padding: 0 2px; }
        .rv-star.filled { color: #c5a05a; }
        .rv-star:hover { transform: scale(1.15); }
        @media (min-width: 900px) { .ep-layout { display: grid !important; grid-template-columns: 1fr 320px; gap: 2.5rem; align-items: start; } }
        @media (max-width: 520px) { .ep-photo-gallery { aspect-ratio: 3/4; border-radius: 12px; } }
      `}</style>

      {/* Lightbox */}
      {lightbox && images[imgIdx] && (
        <div className="ep-lightbox" onClick={() => setLightbox(false)}>
          <img src={images[imgIdx]} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="ep-layout" style={{ display: 'block' }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Photo gallery */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div className="ep-photo-gallery" onClick={() => images.length > 0 && setLightbox(true)}>
              {images.length > 0 ? (
                <img src={images[imgIdx]} alt={listing.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: 'rgba(197,160,90,0.08)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  {listing.title.charAt(0)}
                </div>
              )}
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,5,5,0.5) 0%, transparent 40%)', pointerEvents: 'none' }} />
              {/* Name overlay */}
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 2 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: '#ece8e1', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                  {listing.title}
                  {listing.verified && <span style={{ fontSize: '16px', marginLeft: '8px', color: '#26d4a0' }}>✓</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>📍 {listing.city}</span>
                  {listing.meet_type && (
                    <span style={{ fontSize: '12px', padding: '1px 8px', borderRadius: '20px', background: 'rgba(197,160,90,0.15)', border: '0.5px solid rgba(197,160,90,0.3)', color: '#c5a05a' }}>
                      {listing.meet_type === 'both' ? 'Incall & Outcall' : capitalize(listing.meet_type)}
                    </span>
                  )}
                  {listing.premium && <span style={{ fontSize: '12px', padding: '1px 8px', borderRadius: '20px', background: 'rgba(197,160,90,0.2)', border: '0.5px solid rgba(197,160,90,0.45)', color: '#c5a05a', fontWeight: 600, letterSpacing: '0.06em' }}>VIP</span>}
                </div>
              </div>
              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button className="ep-arrow left" onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length) }}>‹</button>
                  <button className="ep-arrow right" onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length) }}>›</button>
                  <div className="ep-dots">
                    {images.slice(0, 8).map((_, i) => <div key={i} className={`ep-dot${i === imgIdx ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setImgIdx(i) }} />)}
                  </div>
                </>
              )}
              {/* Photo count badge */}
              {images.length > 1 && <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', zIndex: 2 }}>{imgIdx + 1}/{images.length}</div>}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="ep-thumb-strip">
                {images.map((src, i) => (
                  <img key={i} src={src} alt="" className={`ep-thumb${i === imgIdx ? ' active' : ''}`} onClick={() => setImgIdx(i)} />
                ))}
                {images.length < 3 && Array.from({ length: 3 - images.length }).map((_, i) => (
                  <div key={`ph-${i}`} className="ep-thumb-placeholder">+</div>
                ))}
              </div>
            )}
          </div>

          {/* Rating strip */}
          {(listing.rating ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: '16px', color: s <= Math.round(listing.rating ?? 0) ? '#c5a05a' : 'rgba(197,160,90,0.2)' }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                {Number(listing.rating).toFixed(1)} · {listing.review_count} {listing.review_count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}

          {/* About */}
          {listing.description && (
            <div className="ep-section">
              <div className="ep-section-title">About</div>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div className="ep-section">
              <div className="ep-section-title">Services</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {displayedServices.map(s => <span key={s} className="ep-service-tag">{s}</span>)}
              </div>
              {services.length > 12 && (
                <button
                  onClick={() => setShowAllServices(v => !v)}
                  style={{ marginTop: '10px', background: 'none', border: 'none', color: '#c5a05a', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.06em' }}
                >
                  {showAllServices ? 'Show less ↑' : `Show all ${services.length} services ↓`}
                </button>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="ep-section">
            <div className="ep-section-title">Availability & Working Areas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
              {listing.meet_type && (
                <span className="ep-avail-pill" style={{ background: 'rgba(38,212,160,0.08)', border: '0.5px solid rgba(38,212,160,0.25)', color: '#26d4a0' }}>
                  ✓ {listing.meet_type === 'both' ? 'Incall & Outcall' : capitalize(listing.meet_type)}
                </span>
              )}
              <span className="ep-avail-pill" style={{ background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.25)', color: '#c5a05a' }}>
                📍 {listing.city}
              </span>
            </div>
          </div>

          {/* Mobile contact CTA */}
          <div style={{ display: 'block', marginBottom: '2rem' }} className="ep-mobile-cta">
            <button
              className="ep-contact-btn"
              onClick={onBook}
              style={{ background: `linear-gradient(135deg, ${catColor} 0%, #a0803d 100%)`, color: '#080808', marginBottom: '10px', fontFamily: "'Jost', sans-serif" }}
            >
              📩 Send Booking Request
            </button>
            <button className="ep-msg-btn" onClick={onMessage} style={{ fontFamily: "'Jost', sans-serif" }}>
              💬 Send Message
            </button>
          </div>

          {/* Reviews */}
          <div className="ep-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="ep-section-title" style={{ marginBottom: 0 }}>Reviews ({reviews.length})</div>
              {session && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} style={{ background: 'none', border: '0.5px solid rgba(197,160,90,0.35)', borderRadius: '8px', color: '#c5a05a', fontSize: '12px', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  + Leave review
                </button>
              )}
            </div>

            {showReviewForm && (
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className={`rv-star${s <= (reviewHover || reviewRating) ? ' filled' : ''}`} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)} onClick={() => setReviewRating(s)}>★</button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience (optional)…"
                  rows={3}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ece8e1', padding: '10px 12px', fontSize: '14px', resize: 'vertical', fontFamily: "'Jost', sans-serif", outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    disabled={reviewRating === 0 || submittingReview}
                    onClick={handleReviewSubmit}
                    style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', border: 'none', borderRadius: '8px', color: '#080808', fontWeight: 600, fontSize: '12px', letterSpacing: '0.07em', cursor: reviewRating === 0 ? 'not-allowed' : 'pointer', opacity: reviewRating === 0 ? 0.4 : 1, fontFamily: "'Jost', sans-serif" }}
                  >
                    {submittingReview ? 'Submitting…' : 'Submit'}
                  </button>
                  <button onClick={() => setShowReviewForm(false)} style={{ padding: '9px 18px', background: 'none', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.35)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}>Cancel</button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No reviews yet. Be the first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem 1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '13px', color: s <= r.rating ? '#c5a05a' : 'rgba(197,160,90,0.18)' }}>★</span>)}
                      </div>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{timeAgo(r.created_at)}</span>
                    </div>
                    {r.content && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{r.content}</p>}
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
                      — {r.profiles?.full_name ?? r.profiles?.username ?? 'Anonymous'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="ep-sidebar">

          {/* Contact CTA card (desktop) */}
          <div className="ep-card">
            <button
              className="ep-contact-btn"
              onClick={onBook}
              style={{ background: `linear-gradient(135deg, ${catColor} 0%, #a0803d 100%)`, color: '#080808', marginBottom: '10px', fontFamily: "'Jost', sans-serif" }}
            >
              📩 Book / Enquire
            </button>
            <button className="ep-msg-btn" onClick={onMessage} style={{ fontFamily: "'Jost', sans-serif" }}>
              💬 Send Message
            </button>
          </div>

          {/* Rates table */}
          {rates.length > 0 && (
            <div className="ep-card">
              <div className="ep-section-title">Rates</div>
              {rates.map(r => (
                <div key={r.label} className="ep-rate-row">
                  <span className="ep-rate-label">{r.label}</span>
                  <span className="ep-rate-price">{r.sym}{r.price}</span>
                </div>
              ))}
              <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
                Rates are indicative. Final price agreed directly with the provider.
              </div>
            </div>
          )}

          {/* Physical stats */}
          {(hair || build || ethnicity || listing.subcategory) && (
            <div className="ep-card">
              <div className="ep-section-title">Profile</div>
              {listing.subcategory && (
                <div className="ep-stat-row">
                  <span className="ep-stat-label">Type</span>
                  <span className="ep-stat-val">{capitalize(listing.subcategory)}</span>
                </div>
              )}
              {ethnicity && (
                <div className="ep-stat-row">
                  <span className="ep-stat-label">Ethnicity</span>
                  <span className="ep-stat-val">{capitalize(ethnicity)}</span>
                </div>
              )}
              {build && (
                <div className="ep-stat-row">
                  <span className="ep-stat-label">Build</span>
                  <span className="ep-stat-val">{capitalize(build)}</span>
                </div>
              )}
              {hair && (
                <div className="ep-stat-row">
                  <span className="ep-stat-label">Hair</span>
                  <span className="ep-stat-val">{capitalize(hair)}</span>
                </div>
              )}
              <div className="ep-stat-row">
                <span className="ep-stat-label">Location</span>
                <span className="ep-stat-val">{listing.city}</span>
              </div>
              {listing.meet_type && (
                <div className="ep-stat-row">
                  <span className="ep-stat-label">Meet type</span>
                  <span className="ep-stat-val">{listing.meet_type === 'both' ? 'Incall & Outcall' : capitalize(listing.meet_type)}</span>
                </div>
              )}
            </div>
          )}

          {/* Meet type (if no stats card shown) */}
          {!hair && !build && !ethnicity && !listing.subcategory && listing.meet_type && (
            <div className="ep-card">
              <div className="ep-section-title">Details</div>
              <div className="ep-stat-row">
                <span className="ep-stat-label">Location</span>
                <span className="ep-stat-val">{listing.city}</span>
              </div>
              <div className="ep-stat-row">
                <span className="ep-stat-label">Meet type</span>
                <span className="ep-stat-val">{listing.meet_type === 'both' ? 'Incall & Outcall' : capitalize(listing.meet_type)}</span>
              </div>
            </div>
          )}

          {/* Safety note */}
          <div style={{ padding: '1rem 1.2rem', background: 'rgba(38,212,160,0.04)', border: '0.5px solid rgba(38,212,160,0.12)', borderRadius: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>
            🔒 All contact is handled privately between you and the provider. SecretXperience does not share your personal information.
          </div>

        </div>
      </div>
    </>
  )
}
