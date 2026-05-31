'use client'

import { useState } from 'react'
import Link from 'next/link'
import { groupSelected } from '../../lib/possibilities'
import { ETHNIC_VALUES, HAIR_VALUES, BUILD_VALUES } from '../../lib/attributes'

/* ─────────────────────────────────────────────────────────
   Advertising profile — modelled on redlights.be format:
   • Breadcrumb → header (name + badges) → two-column body
   • Left col:  main photo + thumbnail grid → About →
                Possibilities checklist (2-col ✓) →
                Working hours grid → Reviews
   • Right sidebar (sticky): Contact CTAs → Rates →
                Personal details → Location
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
      phone?: string | null
      phone_verified?: boolean | null
      show_phone?: boolean | null
      whatsapp?: string | null
      whatsapp_verified?: boolean | null
      show_whatsapp?: boolean | null
    }
    tags?: string[] | null
    services?: string[] | null
    rating?: number
    review_count?: number
  }
  reviews: Review[]
  session: any
  onBook: () => void
  onMessage: () => void
  onReviewSubmit: (rating: number, text: string) => Promise<void>
  isBookable?: boolean
}

/* ── Tag classification ────────────────────────────────── */
const HAIR_SET   = HAIR_VALUES
const BUILD_SET  = BUILD_VALUES
const ETHNIC_SET = ETHNIC_VALUES
const LANG_SET   = new Set(['english','french','dutch','german','spanish','italian','portuguese','arabic','russian','polish','czech'])
const HEIGHT_RE  = /^(\d{3})\s*cm$/i
const WEIGHT_RE  = /^(\d{2,3})\s*kg$/i
const AGE_RE     = /^(\d{2})\s*(years?|yo|yrs?)?$/i
const NATIONALITY_SET = new Set(['belgian','dutch','german','french','spanish','italian','british','american','brazilian','colombian','czech','polish','romanian','ukrainian','russian'])
const WH_DAYS    = ['mon','tue','wed','thu','fri','sat','sun']

function classifyTags(tags: string[]) {
  const lower = tags.map(t => t.toLowerCase().trim())

  // Prefixed metadata tags
  const escortTypeTag = tags.find(t => t.toLowerCase().startsWith('type:'))
  const escortType = escortTypeTag ? escortTypeTag.slice(escortTypeTag.indexOf(':') + 1).trim() : null

  const orientationTag = tags.find(t => t.toLowerCase().startsWith('orientation:'))
  const orientation = orientationTag ? orientationTag.slice(orientationTag.indexOf(':') + 1).trim() : null

  // Working hours: wh:mon:10-22 or wh:mon:off
  const workingHours: Record<string, string | null> = {}
  let hasWhTags = false
  tags.forEach(t => {
    const l = t.toLowerCase()
    if (l.startsWith('wh:')) {
      const p = l.split(':')
      if (p.length === 3 && WH_DAYS.includes(p[1])) {
        workingHours[p[1]] = p[2] === 'off' ? null : p[2]
        hasWhTags = true
      }
    }
  })
  if (!hasWhTags) {
    WH_DAYS.forEach((d, i) => { workingHours[d] = i < 5 ? '10-22' : null })
  }

  // Handle both raw values and "Key: Value" prefixed formats (from create form)
  const getField = (prefixRe: RegExp, set: Set<string>) => {
    const prefixed = tags.find(t => prefixRe.test(t))
    if (prefixed) return prefixed.replace(prefixRe, '').toLowerCase().trim()
    return lower.find(t => set.has(t)) ?? null
  }

  const height     = lower.find(t => HEIGHT_RE.test(t))?.match(HEIGHT_RE)?.[1] ?? null
  const weight     = lower.find(t => WEIGHT_RE.test(t))?.match(WEIGHT_RE)?.[1] ?? null
  const ageMatch   = lower.find(t => AGE_RE.test(t))?.match(AGE_RE)?.[1] ?? null
  const hair       = getField(/^hair:\s*/i,        HAIR_SET)
  const build      = getField(/^build:\s*/i,       BUILD_SET)
  const ethnicity  = getField(/^ethnicity:\s*/i,   ETHNIC_SET)
  const nationality = getField(/^nationality:\s*/i, NATIONALITY_SET)
  const languages  = lower.filter(t => LANG_SET.has(t))

  const services = tags.filter(t => {
    const l = t.toLowerCase().trim()
    return !HEIGHT_RE.test(l) && !WEIGHT_RE.test(l) && !AGE_RE.test(l) &&
      !HAIR_SET.has(l) && !BUILD_SET.has(l) && !ETHNIC_SET.has(l) &&
      !NATIONALITY_SET.has(l) && !LANG_SET.has(l) &&
      !l.startsWith('type:') && !l.startsWith('orientation:') && !l.startsWith('wh:') &&
      !/^(hair|build|ethnicity|nationality):\s*/i.test(l)
  })

  return { height, weight, age: ageMatch, hair, build, ethnicity, nationality, languages, services, escortType, orientation, workingHours }
}

function derivedRates(base: number, sym: string) {
  return [
    { label: '30 minutes', price: Math.round(base * 0.6) },
    { label: '1 hour',     price: base },
    { label: '2 hours',    price: Math.round(base * 1.75) },
    { label: '3 hours',    price: Math.round(base * 2.5) },
    { label: 'Overnight',  price: Math.round(base * 5) },
  ].map(r => ({ ...r, sym }))
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7)  return `${d} days ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const CATEGORY_LABEL: Record<string,string> = {
  escorts: 'Escort', companionship: 'Companion', massage: 'Massage',
  domination: 'Domination', experiences: 'Experience',
}
const CATEGORY_COLOR: Record<string,string> = {
  escorts: 'rgba(197,160,90,0.18)', companionship: 'rgba(109,58,92,0.2)',
  massage: 'rgba(26,143,106,0.15)', domination: 'rgba(139,43,63,0.2)',
  experiences: 'rgba(197,160,90,0.15)',
}
const CATEGORY_TEXT: Record<string,string> = {
  escorts: '#c5a05a', companionship: '#c07ad0', massage: '#26d4a0',
  domination: '#e07080', experiences: '#c5a05a',
}

export default function EscortProfile({
  listing, reviews, session, onBook, onMessage, onReviewSubmit, isBookable = false,
}: EscortProfileProps) {
  const [imgIdx, setImgIdx]     = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [rvRating, setRvRating] = useState(0)
  const [rvHover,  setRvHover]  = useState(0)
  const [rvText,   setRvText]   = useState('')
  const [rvBusy,   setRvBusy]   = useState(false)
  const [showRvForm, setShowRvForm] = useState(false)
  const [shared, setShared] = useState(false)

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: listing.title,
      text: `${listing.title} · ${listing.city} — on SecretXperience`,
      url,
    }
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share(shareData)
        return
      }
    } catch { /* user cancelled native sheet — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch { /* clipboard blocked — no-op */ }
  }

  const images  = (listing.images ?? []).filter(Boolean)
  const tags    = listing.tags ?? []
  const { height, weight, age, hair, build, ethnicity, nationality, languages, services, escortType, orientation, workingHours } = classifyTags(tags)
  // Structured Possibilities (new): grouped checklist from listing.services.
  // Falls back to the legacy flat tag-derived services for older listings.
  const possibilityGroups = groupSelected(listing.services ?? [])
  const sym     = listing.currency === 'GBP' ? '£' : '€'
  const rates   = listing.price_from ? derivedRates(listing.price_from, sym) : []
  const catLabel = CATEGORY_LABEL[listing.category] ?? cap(listing.category)
  const catColor = CATEGORY_COLOR[listing.category] ?? 'rgba(197,160,90,0.18)'
  const catText  = CATEGORY_TEXT[listing.category]  ?? '#c5a05a'
  const meetLabel = listing.meet_type === 'both' ? 'Incall & Outcall' : listing.meet_type ? cap(listing.meet_type) : null

  async function handleRvSubmit() {
    if (rvRating === 0) return
    setRvBusy(true)
    await onReviewSubmit(rvRating, rvText)
    setRvRating(0); setRvText(''); setShowRvForm(false); setRvBusy(false)
  }

  /* ── Shared token colours ──────────────────────────────── */
  const C = {
    bg:    '#050509',
    bg1:   'rgba(255,255,255,0.03)',
    bg2:   'rgba(255,255,255,0.055)',
    b:     'rgba(255,255,255,0.07)',
    b2:    'rgba(255,255,255,0.11)',
    t:     '#ece8e1',
    t2:    'rgba(236,232,225,0.6)',
    t3:    'rgba(236,232,225,0.32)',
    gold:  '#c5a05a',
    green: '#26d4a0',
  }

  return (
    <>
      <style>{`
        
        *, *::before, *::after { box-sizing: border-box; }

        /* Lightbox */
        .rl-lb { position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;cursor:zoom-out; }
        .rl-lb img { max-width:92vw;max-height:92vh;object-fit:contain;border-radius:6px; }
        .rl-lb-arrow { position:fixed;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.08);border:none;color:#fff;width:44px;height:44px;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2001;transition:background 0.15s; }
        .rl-lb-arrow:hover { background:rgba(255,255,255,0.16); }

        /* Main photo */
        .rl-main-photo { position:relative;width:100%;aspect-ratio:4/3;background:#0d0d14;border-radius:12px;overflow:hidden;cursor:pointer; }
        .rl-main-photo img { width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.4s ease; }
        .rl-main-photo:hover img { transform:scale(1.02); }

        /* Thumbnail grid */
        .rl-thumb-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px;margin-top:8px; }
        .rl-thumb { width:100%;aspect-ratio:1;object-fit:cover;border-radius:7px;cursor:pointer;border:2px solid transparent;opacity:0.58;transition:opacity 0.2s,border-color 0.2s; }
        .rl-thumb:hover { opacity:0.9; }
        .rl-thumb.active { border-color:#c5a05a;opacity:1; }
        .rl-thumb-more { aspect-ratio:1;border-radius:7px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;color:rgba(255,255,255,0.4);cursor:pointer;transition:background 0.15s; }
        .rl-thumb-more:hover { background:rgba(255,255,255,0.1); }

        /* Section */
        .rl-section { margin-bottom:1.75rem; }
        .rl-section-title { font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(236,232,225,0.3);font-weight:600;margin-bottom:0.9rem;display:flex;align-items:center;gap:8px; }
        .rl-section-title::after { content:'';flex:1;height:0.5px;background:rgba(255,255,255,0.07); }

        /* Possibilities checklist */
        .rl-poss-group { font-size:12px;font-weight:600;color:rgba(236,232,225,0.85);margin-bottom:6px;letter-spacing:0.02em; }
        .rl-possibilities { display:grid;grid-template-columns:1fr 1fr;gap:4px 16px; }
        .rl-poss-item { display:flex;align-items:center;gap:7px;padding:5px 0;font-size:13px;color:rgba(236,232,225,0.65);border-bottom:0.5px solid rgba(255,255,255,0.04); }
        .rl-poss-check { width:16px;height:16px;border-radius:4px;background:rgba(26,143,106,0.15);border:0.5px solid rgba(26,143,106,0.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;color:#26d4a0; }

        /* Working hours */
        .rl-hours-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center; }
        .rl-day-col { display:flex;flex-direction:column;align-items:center;gap:4px; }
        .rl-day-label { font-size:11px;color:rgba(236,232,225,0.35);font-weight:600;letter-spacing:0.06em; }
        .rl-day-dot { width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600; }
        .rl-day-dot.on  { background:rgba(26,143,106,0.15);border:0.5px solid rgba(26,143,106,0.35);color:#26d4a0; }
        .rl-day-dot.off { background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.2); }
        .rl-day-time { font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:0.04em; }

        /* Sidebar cards */
        .rl-scard { background:rgba(255,255,255,0.025);border:0.5px solid rgba(255,255,255,0.08);border-radius:14px;padding:1.25rem;margin-bottom:1rem; }

        /* Rate rows */
        .rl-rate-row { display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.05); }
        .rl-rate-row:last-child { border-bottom:none; }
        .rl-rate-label { font-size:13px;color:rgba(255,255,255,0.45); }
        .rl-rate-price { font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:500;color:#c5a05a;letter-spacing:0.02em; }

        /* Detail rows */
        .rl-detail-row { display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:0.5px solid rgba(255,255,255,0.05); }
        .rl-detail-row:last-child { border-bottom:none; }
        .rl-detail-label { font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.08em;min-width:80px;flex-shrink:0;padding-top:1px; }
        .rl-detail-val { font-size:13px;color:rgba(255,255,255,0.72);font-weight:500;line-height:1.4; }

        /* CTAs */
        .rl-btn-primary { width:100%;padding:15px;border:none;border-radius:10px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;position:relative;overflow:hidden;transition:opacity 0.2s,transform 0.15s;margin-bottom:8px; }
        .rl-btn-primary:hover { opacity:0.88;transform:translateY(-1px); }
        .rl-btn-primary::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);pointer-events:none; }
        .rl-btn-outline { width:100%;padding:12px;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;background:transparent;transition:border-color 0.2s,background 0.2s; }
        .rl-btn-outline:hover { background:rgba(197,160,90,0.05); }

        /* Review */
        .rv-star { cursor:pointer;font-size:22px;color:rgba(197,160,90,0.22);transition:color 0.15s,transform 0.1s;line-height:1;background:none;border:none;padding:0 2px; }
        .rv-star.filled { color:#c5a05a; }
        .rv-star:hover { transform:scale(1.15); }

        /* Two-column layout */
        .rl-layout { display:block; }
        @media (min-width:860px) {
          .rl-layout { display:grid;grid-template-columns:1fr 300px;gap:2rem;align-items:start; }
          .rl-mobile-cta { display:none !important; }
        }
        @media (max-width:520px) {
          .rl-main-photo { aspect-ratio:3/4; border-radius:8px; }
          .rl-possibilities { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div className="rl-lb" onClick={() => setLightbox(false)}>
          {images.length > 1 && (
            <>
              <button className="rl-lb-arrow" style={{ left: 16 }} onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length) }}>‹</button>
              <button className="rl-lb-arrow" style={{ right: 16 }} onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length) }}>›</button>
            </>
          )}
          <img src={images[imgIdx]} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.t3, flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: C.t3, textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href={`/${listing.category}`} style={{ color: C.t3, textDecoration: 'none' }}>{catLabel}</Link>
        <span>›</span>
        <Link href={`/${listing.category}?city=${encodeURIComponent(listing.city)}`} style={{ color: C.t3, textDecoration: 'none' }}>{listing.city}</Link>
        <span>›</span>
        <span style={{ color: C.t2 }}>{listing.title}</span>
      </div>

      {/* ── Profile header ── */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: `0.5px solid ${C.b}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          {/* Category badge */}
          <span style={{ padding: '3px 12px', borderRadius: '20px', background: catColor, border: `0.5px solid ${catText}44`, color: catText, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {catLabel}
          </span>
          {listing.verified && (
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(38,212,160,0.1)', border: '0.5px solid rgba(38,212,160,0.3)', color: C.green, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
              ✓ Verified
            </span>
          )}
          {listing.premium && (
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(197,160,90,0.15)', border: '0.5px solid rgba(197,160,90,0.4)', color: C.gold, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>
              VIP
            </span>
          )}
          {/* Online indicator */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.green, marginLeft: 'auto' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            Online
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: C.t, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {listing.title}
          </h1>
          {/* Rating */}
          {(listing.rating ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '14px', color: s <= Math.round(listing.rating ?? 0) ? C.gold : 'rgba(197,160,90,0.2)' }}>★</span>)}
              </div>
              <span style={{ fontSize: '13px', color: C.t3 }}>{Number(listing.rating).toFixed(1)} <span style={{ opacity: 0.6 }}>({listing.review_count} reviews)</span></span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: C.t2, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ opacity: 0.6 }}>📍</span> {listing.city}{listing.country ? `, ${listing.country}` : ''}
          </span>
          {meetLabel && (
            <span style={{ fontSize: '12px', color: C.t3 }}>·</span>
          )}
          {meetLabel && (
            <span style={{ fontSize: '13px', color: C.t2 }}>{meetLabel}</span>
          )}
          {listing.price_from && (
            <>
              <span style={{ fontSize: '12px', color: C.t3 }}>·</span>
              <span style={{ fontSize: '13px', color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500 }}>
                from {sym}{listing.price_from}/hr
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="rl-layout">

        {/* ══ LEFT COLUMN ══ */}
        <div>

          {/* Main photo + thumbnail grid */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div className="rl-main-photo" onClick={() => images.length > 0 && setLightbox(true)}>
              {images.length > 0 ? (
                <img src={images[imgIdx]} alt={listing.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '72px', color: 'rgba(197,160,90,0.07)' }}>
                  {listing.title.charAt(0)}
                </div>
              )}
              {/* Photo count */}
              {images.length > 1 && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', zIndex: 2 }}>
                  {imgIdx + 1} / {images.length}
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff', width: 38, height: 38, borderRadius: '50%', fontSize: 18, cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length) }}>‹</button>
                  <button style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff', width: 38, height: 38, borderRadius: '50%', fontSize: 18, cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length) }}>›</button>
                </>
              )}
            </div>

            {/* Thumbnail grid */}
            {images.length > 1 && (
              <div className="rl-thumb-grid">
                {images.slice(0, 8).map((src, i) => (
                  <img key={i} src={src} alt="" className={`rl-thumb${i === imgIdx ? ' active' : ''}`} onClick={() => setImgIdx(i)} />
                ))}
                {images.length > 8 && (
                  <div className="rl-thumb-more" onClick={() => setLightbox(true)}>+{images.length - 8}</div>
                )}
              </div>
            )}
          </div>

          {/* Mobile CTAs */}
          <div className="rl-mobile-cta" style={{ marginBottom: '1.75rem' }}>
            <button className="rl-btn-primary" onClick={onBook} style={{ background: `linear-gradient(135deg,${catText} 0%,#8a6a30 100%)`, color: '#080808' }}>
              {isBookable ? '📅 Book Now' : '📩 Send Message'}
            </button>
            <button className="rl-btn-outline" onClick={onMessage} style={{ border: `0.5px solid ${catText}66`, color: catText }}>
              💬 Send Message
            </button>
            <button className="rl-btn-outline" onClick={handleShare} style={{ border: `0.5px solid ${C.b2}`, color: C.t2 }}>
              {shared ? '✓ Link copied' : '↗ Share'}
            </button>
          </div>

          {/* About */}
          {listing.description && (
            <div className="rl-section">
              <div className="rl-section-title">About</div>
              <p style={{ fontSize: '15px', color: C.t2, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Possibilities / Services */}
          {possibilityGroups.length > 0 ? (
            <div className="rl-section">
              <div className="rl-section-title">Possibilities</div>
              {possibilityGroups.map(group => (
                <div key={group.label} style={{ marginBottom: '1.1rem' }}>
                  <div className="rl-poss-group">{group.label}</div>
                  <div className="rl-possibilities">
                    {group.items.map(s => (
                      <div key={s} className="rl-poss-item">
                        <div className="rl-poss-check">✓</div>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : services.length > 0 && (
            <div className="rl-section">
              <div className="rl-section-title">Possibilities</div>
              <div className="rl-possibilities">
                {services.map(s => (
                  <div key={s} className="rl-poss-item">
                    <div className="rl-poss-check">✓</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Working hours */}
          <div className="rl-section">
            <div className="rl-section-title">Working Hours</div>
            <div className="rl-hours-grid">
              {DAYS.map((d) => {
                const key = d.toLowerCase()
                const hours = workingHours[key]
                const isOn = hours !== null && hours !== undefined
                const displayTime = isOn ? hours.split('-').map(h => `${h.padStart(2,'0')}:00`).join('–') : ''
                return (
                  <div key={d} className="rl-day-col">
                    <div className="rl-day-label">{d}</div>
                    <div className={`rl-day-dot ${isOn ? 'on' : 'off'}`}>{isOn ? '✓' : '–'}</div>
                    {displayTime && <div className="rl-day-time">{displayTime}</div>}
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: '12px', color: C.t3, marginTop: '10px', lineHeight: 1.5 }}>
              Hours are indicative — contact directly to confirm availability.
            </p>
          </div>

          {/* Reviews */}
          <div className="rl-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <div className="rl-section-title" style={{ marginBottom: 0 }}>Reviews <span style={{ color: C.t3, fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: '12px' }}>({reviews.length})</span></div>
              {session && !showRvForm && (
                <button onClick={() => setShowRvForm(true)} style={{ background: 'none', border: `0.5px solid ${C.b2}`, borderRadius: '8px', color: C.gold, fontSize: '12px', padding: '5px 12px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                  + Leave review
                </button>
              )}
            </div>

            {showRvForm && (
              <div style={{ background: C.bg1, border: `0.5px solid ${C.b}`, borderRadius: '12px', padding: '1.2rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className={`rv-star${s <= (rvHover || rvRating) ? ' filled' : ''}`} onMouseEnter={() => setRvHover(s)} onMouseLeave={() => setRvHover(0)} onClick={() => setRvRating(s)}>★</button>
                  ))}
                </div>
                <textarea
                  value={rvText} onChange={e => setRvText(e.target.value)}
                  placeholder="Describe your experience (optional)…" rows={3}
                  style={{ width: '100%', background: C.bg2, border: `0.5px solid ${C.b}`, borderRadius: '8px', color: C.t, padding: '10px 12px', fontSize: '14px', resize: 'vertical', fontFamily: "'Poppins',sans-serif", outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button disabled={rvRating === 0 || rvBusy} onClick={handleRvSubmit} style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', border: 'none', borderRadius: '8px', color: '#080808', fontWeight: 600, fontSize: '12px', cursor: rvRating === 0 ? 'not-allowed' : 'pointer', opacity: rvRating === 0 ? 0.4 : 1, fontFamily: "'Poppins',sans-serif" }}>
                    {rvBusy ? 'Submitting…' : 'Submit review'}
                  </button>
                  <button onClick={() => setShowRvForm(false)} style={{ padding: '9px 18px', background: 'none', border: `0.5px solid ${C.b}`, borderRadius: '8px', color: C.t3, fontSize: '12px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>Cancel</button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p style={{ color: C.t3, fontSize: '14px' }}>No reviews yet. Be the first to leave one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: C.bg1, border: `0.5px solid ${C.b}`, borderRadius: '12px', padding: '1rem 1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '13px', color: s <= r.rating ? C.gold : 'rgba(197,160,90,0.18)' }}>★</span>)}
                      </div>
                      <span style={{ fontSize: '11px', color: C.t3 }}>{timeAgo(r.created_at)}</span>
                    </div>
                    {r.content && <p style={{ fontSize: '14px', color: C.t2, lineHeight: 1.65 }}>{r.content}</p>}
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
                      — {r.profiles?.full_name ?? r.profiles?.username ?? 'Anonymous'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column' }}>

          {/* Verified contact numbers */}
          {(() => {
            const p = listing.profile || ({} as any)
            const showPhone = p.phone && p.phone_verified && p.show_phone !== false
            const showWa    = p.whatsapp && p.whatsapp_verified && p.show_whatsapp !== false
            if (!showPhone && !showWa) return null
            const waDigits = showWa ? String(p.whatsapp).replace(/[^0-9]/g, '') : ''
            return (
              <div className="rl-scard">
                <div className="rl-section-title" style={{ fontSize: '10px' }}>Contact</div>
                {showPhone && (
                  <a href={`tel:${p.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', textDecoration: 'none', color: C.t }}>
                    <span style={{ fontSize: '17px' }}>📞</span>
                    <span style={{ fontSize: '15px', fontFamily: "'Poppins',sans-serif", letterSpacing: '0.02em' }}>{p.phone}</span>
                    <span title="Verified number" style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: C.green, background: 'rgba(38,212,160,0.12)', border: `0.5px solid ${C.green}55`, borderRadius: '20px', padding: '2px 8px' }}>✓</span>
                  </a>
                )}
                {showWa && (
                  <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: showPhone ? `0.5px solid ${C.b}` : 'none', textDecoration: 'none', color: C.t }}>
                    <span style={{ fontSize: '17px' }}>🟢</span>
                    <span style={{ fontSize: '15px', fontFamily: "'Poppins',sans-serif", letterSpacing: '0.02em' }}>WhatsApp</span>
                    <span title="Verified WhatsApp" style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: C.green, background: 'rgba(38,212,160,0.12)', border: `0.5px solid ${C.green}55`, borderRadius: '20px', padding: '2px 8px' }}>✓</span>
                  </a>
                )}
              </div>
            )
          })()}

          {/* Contact CTAs */}
          <div className="rl-scard">
            <button className="rl-btn-primary" onClick={onBook} style={{ background: `linear-gradient(135deg,${catText} 0%,#8a6a30 100%)`, color: '#080808' }}>
              📩 Send Enquiry
            </button>
            <button className="rl-btn-outline" onClick={onMessage} style={{ border: `0.5px solid ${catText}55`, color: catText }}>
              💬 Send Message
            </button>
            <button className="rl-btn-outline" onClick={handleShare} style={{ border: `0.5px solid ${C.b2}`, color: C.t2, marginTop: '8px' }}>
              {shared ? '✓ Link copied' : '↗ Share this profile'}
            </button>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.t3 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green, flexShrink: 0 }} />
              Active recently · responds within a day
            </div>
          </div>

          {/* Rates */}
          {rates.length > 0 && (
            <div className="rl-scard">
              <div className="rl-section-title" style={{ fontSize: '10px' }}>Rates</div>
              {rates.map(r => (
                <div key={r.label} className="rl-rate-row">
                  <span className="rl-rate-label">{r.label}</span>
                  <span className="rl-rate-price">{r.sym}{r.price}</span>
                </div>
              ))}
              <p style={{ marginTop: '10px', fontSize: '11px', color: C.t3, lineHeight: 1.55, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                Prices are indicative. Confirm directly with the provider.
              </p>
            </div>
          )}

          {/* Personal details */}
          <div className="rl-scard">
            <div className="rl-section-title" style={{ fontSize: '10px' }}>Profile Details</div>

            {(escortType || listing.subcategory) && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Type</span>
                <span className="rl-detail-val">{cap(escortType ?? listing.subcategory ?? '')}</span>
              </div>
            )}
            {orientation && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Orientation</span>
                <span className="rl-detail-val">{cap(orientation)}</span>
              </div>
            )}
            {age && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Age</span>
                <span className="rl-detail-val">{age} years</span>
              </div>
            )}
            {nationality && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Nationality</span>
                <span className="rl-detail-val">{cap(nationality)}</span>
              </div>
            )}
            {languages.length > 0 && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Languages</span>
                <span className="rl-detail-val">{languages.map(cap).join(', ')}</span>
              </div>
            )}
            {ethnicity && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Ethnicity</span>
                <span className="rl-detail-val">{cap(ethnicity)}</span>
              </div>
            )}
            {hair && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Hair</span>
                <span className="rl-detail-val">{cap(hair)}</span>
              </div>
            )}
            {build && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Build</span>
                <span className="rl-detail-val">{cap(build)}</span>
              </div>
            )}
            {height && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Height</span>
                <span className="rl-detail-val">{height} cm</span>
              </div>
            )}
            {weight && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Weight</span>
                <span className="rl-detail-val">{weight} kg</span>
              </div>
            )}
            <div className="rl-detail-row">
              <span className="rl-detail-label">Location</span>
              <span className="rl-detail-val">{listing.city}</span>
            </div>
            {meetLabel && (
              <div className="rl-detail-row">
                <span className="rl-detail-label">Meet type</span>
                <span className="rl-detail-val">{meetLabel}</span>
              </div>
            )}
          </div>

          {/* Safety note */}
          <div style={{ padding: '0.9rem 1rem', background: 'rgba(38,212,160,0.04)', border: '0.5px solid rgba(38,212,160,0.1)', borderRadius: '10px', fontSize: '11.5px', color: C.t3, lineHeight: 1.65 }}>
            🔒 All contact is private between you and the provider. SecretXperience never shares your personal data.
          </div>

        </div>
      </div>
    </>
  )
}
