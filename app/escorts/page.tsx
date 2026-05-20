'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ── Types ──────────────────────────────────────────────── */
type Listing = {
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
  rating: number | null
  review_count: number | null
  tags: string[] | null
}

/* ── Filter config ──────────────────────────────────────── */
const ESCORT_TYPES = [
  { value: 'all',        label: 'All',           icon: '✦' },
  { value: 'women',      label: 'Women',         icon: '♀' },
  { value: 'men',        label: 'Men / Gigolo',  icon: '♂' },
  { value: 'trans-woman',label: 'Trans Woman',   icon: '⚧' },
  { value: 'trans-man',  label: 'Trans Man',     icon: '⚧' },
  { value: 'non-binary', label: 'Non-Binary',    icon: '⊕' },
  { value: 'couples',    label: 'Couples',       icon: '♥' },
  { value: 'fetish',     label: 'Fetish',        icon: '◈' },
]

const SEXUAL_ORIENTATION = [
  { value: 'all',          label: 'Any' },
  { value: 'heterosexual', label: 'Straight' },
  { value: 'gay',          label: 'Gay / Lesbian' },
  { value: 'bisexual',     label: 'Bisexual' },
  { value: 'for-all',      label: 'For all' },
]

const MEET_TYPES = [
  { value: 'all',     label: 'Any' },
  { value: 'incall',  label: 'Incall' },
  { value: 'outcall', label: 'Outcall' },
  { value: 'both',    label: 'Both' },
]

const ETHNICITIES = ['Any', 'European', 'Latina', 'Asian', 'Ebony', 'Arabic', 'Mixed', 'Eastern European']
const HAIR_COLORS = ['Any', 'Blonde', 'Brunette', 'Black', 'Redhead', 'Auburn', 'Other']
const BUILDS      = ['Any', 'Slim', 'Athletic', 'Curvy', 'Petite', 'BBW', 'Muscular']
const CITIES      = ['All Cities', 'Brussels', 'Antwerp', 'Ghent', 'Amsterdam', 'Berlin', 'Paris', 'Cologne', 'Rotterdam']

const SERVICES_LIST = [
  'GFE', 'BDSM', 'Massage', 'Tantric', 'Roleplay', 'Dinner Date',
  'Travel Companion', 'Duo', 'Couples', 'Overnight', 'Striptease',
  'Domination', 'Fetish', 'Oral', 'Anal', 'Bondage', 'Pegging',
]

/* ── Helpers ────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d < 7) return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

/* ── Card component ─────────────────────────────────────── */
function EscortCard({ l }: { l: Listing }) {
  const img = l.images?.[0]
  const price = l.price_from ? `€${l.price_from}/hr` : null

  return (
    <Link href={`/listings/${l.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article
        style={{
          background: 'var(--bg1)', border: '0.5px solid var(--b)',
          borderRadius: 'var(--rl)', overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.15s',
          cursor: 'pointer', position: 'relative',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(-4px)'
          el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)'
          el.style.borderColor = 'var(--b3)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = ''
          el.style.boxShadow = ''
          el.style.borderColor = 'var(--b)'
        }}
      >
        {/* Portrait image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--bg2)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '72px', fontStyle: 'italic', color: 'rgba(197,160,90,0.08)' }}>
              {l.title.charAt(0)}
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 45%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {l.verified && (
              <span style={{ background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>VERIFIED</span>
            )}
            {l.premium && (
              <span style={{ background: 'var(--grad-gold)', color: '#000', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em' }}>VIP</span>
            )}
          </div>

          {/* Price badge */}
          {price && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(197,160,90,0.35)', borderRadius: '8px', padding: '4px 10px', fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
              {price}
            </div>
          )}

          {/* Bottom info overlay */}
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', fontWeight: 400, color: '#ece8e1', lineHeight: 1.15, marginBottom: '4px' }}>
              {l.title}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>📍 {l.city}</span>
              {l.meet_type && l.meet_type !== 'both' && (
                <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '4px', background: 'rgba(197,160,90,0.15)', color: 'var(--gold)', border: '0.5px solid rgba(197,160,90,0.3)' }}>
                  {cap(l.meet_type)}
                </span>
              )}
              {l.meet_type === 'both' && (
                <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '4px', background: 'rgba(197,160,90,0.15)', color: 'var(--gold)', border: '0.5px solid rgba(197,160,90,0.3)' }}>In+Out</span>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div className="card-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(197,160,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
            <span style={{ background: 'var(--grad-gold)', color: '#000', fontWeight: 700, fontSize: '13px', padding: '10px 24px', borderRadius: '999px', letterSpacing: '0.06em' }}>View Profile →</span>
          </div>
        </div>

        {/* Rating row */}
        {(l.rating ?? 0) > 0 && (
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '0.5px solid var(--b)' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '11px', color: s <= Math.round(l.rating ?? 0) ? 'var(--gold)' : 'rgba(197,160,90,0.18)' }}>★</span>)}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{Number(l.rating).toFixed(1)} ({l.review_count})</span>
          </div>
        )}
      </article>
    </Link>
  )
}

/* ── Main page ──────────────────────────────────────────── */
export default function EscortsPage() {
  const [listings, setListings]         = useState<Listing[]>([])
  const [loading, setLoading]           = useState(true)
  const [showFilters, setShowFilters]   = useState(false)

  // Filter state
  const [escortType, setEscortType]     = useState('all')
  const [orientation, setOrientation]   = useState('all')
  const [meetType, setMeetType]         = useState('all')
  const [city, setCity]                 = useState('All Cities')
  const [priceMin, setPriceMin]         = useState(0)
  const [priceMax, setPriceMax]         = useState(1000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [ethnicity, setEthnicity]       = useState('Any')
  const [hairColor, setHairColor]       = useState('Any')
  const [build, setBuild]               = useState('Any')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sortBy, setSortBy]             = useState<'rating' | 'price_asc' | 'price_desc' | 'newest'>('rating')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select('id,title,description,category,subcategory,city,country,price_from,price_to,currency,meet_type,images,verified,premium,rating,review_count,tags')
      .eq('active', true)
      .in('category', ['escorts', 'companionship', 'domination', 'experiences', 'massage'])

    if (city !== 'All Cities') q = q.eq('city', city)
    if (verifiedOnly) q = q.eq('verified', true)
    if (meetType !== 'all') q = q.eq('meet_type', meetType)
    if (priceMin > 0) q = q.gte('price_from', priceMin)
    if (priceMax < 1000) q = q.lte('price_from', priceMax)

    if (sortBy === 'rating') q = q.order('rating', { ascending: false })
    else if (sortBy === 'price_asc') q = q.order('price_from', { ascending: true })
    else if (sortBy === 'price_desc') q = q.order('price_from', { ascending: false })
    else q = q.order('created_at', { ascending: false })

    q = q.limit(60)

    const { data } = await q
    let results = data ?? []

    // Client-side filters for tag-based fields
    if (escortType !== 'all') {
      results = results.filter(l => {
        const tags = (l.tags ?? []).map((t: string) => t.toLowerCase())
        const sub = (l.subcategory ?? '').toLowerCase()
        if (escortType === 'women') return tags.some((t: string) => ['woman','female','women'].includes(t)) || (!tags.some((t: string) => ['man','male','men','trans','couple','non-binary'].includes(t)))
        if (escortType === 'men') return tags.some((t: string) => ['man','male','men','gigolo'].includes(t)) || sub.includes('gigolo') || sub.includes('male')
        if (escortType === 'trans-woman') return tags.some((t: string) => t.includes('trans woman') || t.includes('transwoman') || t.includes('transsexual'))
        if (escortType === 'trans-man') return tags.some((t: string) => t.includes('trans man') || t.includes('transman'))
        if (escortType === 'non-binary') return tags.some((t: string) => t.includes('non-binary') || t.includes('nonbinary') || t.includes('enby'))
        if (escortType === 'couples') return tags.some((t: string) => t === 'couples' || t === 'duo') || sub.includes('couple')
        if (escortType === 'fetish') return tags.some((t: string) => ['fetish','bdsm','domination'].includes(t)) || l.category === 'domination'
        return true
      })
    }
    if (orientation !== 'all') {
      results = results.filter(l => {
        const tags = (l.tags ?? []).map((t: string) => t.toLowerCase())
        return tags.includes(orientation) || tags.includes('for all') || tags.includes('for-all')
      })
    }
    if (ethnicity !== 'Any') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => t.toLowerCase() === ethnicity.toLowerCase()))
    }
    if (hairColor !== 'Any') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => t.toLowerCase() === hairColor.toLowerCase()))
    }
    if (build !== 'Any') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => t.toLowerCase() === build.toLowerCase()))
    }
    if (selectedServices.length > 0) {
      results = results.filter(l => {
        const tags = (l.tags ?? []).map((t: string) => t.toLowerCase())
        return selectedServices.some(s => tags.includes(s.toLowerCase()))
      })
    }

    setListings(results)
    setLoading(false)
  }, [escortType, orientation, meetType, city, priceMin, priceMax, verifiedOnly, ethnicity, hairColor, build, selectedServices, sortBy])

  useEffect(() => { fetchListings() }, [fetchListings])

  function toggleService(s: string) {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function resetFilters() {
    setEscortType('all'); setOrientation('all'); setMeetType('all')
    setCity('All Cities'); setPriceMin(0); setPriceMax(1000)
    setVerifiedOnly(false); setEthnicity('Any'); setHairColor('Any')
    setBuild('Any'); setSelectedServices([])
  }

  const activeFilterCount = [
    escortType !== 'all', orientation !== 'all', meetType !== 'all',
    city !== 'All Cities', priceMin > 0, priceMax < 1000, verifiedOnly,
    ethnicity !== 'Any', hairColor !== 'Any', build !== 'Any',
    selectedServices.length > 0,
  ].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t)', fontFamily: 'var(--sans)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .card-container:hover .card-hover-overlay { opacity: 1 !important; }
        .filter-select { background: var(--bg2); border: 0.5px solid var(--b2); border-radius: var(--r); color: var(--t); padding: 8px 12px; font-size: 13px; font-family: var(--sans); outline: none; width: 100%; cursor: pointer; }
        .filter-select:focus { border-color: var(--b3); }
        .price-slider { -webkit-appearance: none; width: 100%; height: 3px; border-radius: 2px; background: var(--b2); outline: none; cursor: pointer; }
        .price-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); cursor: pointer; border: 2px solid var(--bg); box-shadow: 0 0 6px rgba(197,160,90,0.4); }
        .service-chip { padding: 5px 12px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 12px; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: var(--sans); }
        .service-chip.active { background: var(--gbg); color: var(--gold); border-color: var(--gbrd); }
        .type-btn { padding: 8px 16px; border-radius: 999px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: var(--sans); display: inline-flex; align-items: center; gap: 5px; }
        .type-btn.active { background: var(--gbg); color: var(--gold); border-color: var(--gbrd); font-weight: 600; }
        .filter-panel { display: none; }
        .filter-panel.open { display: block; }
        @media (min-width: 900px) { .filter-panel { display: block !important; } .mobile-filter-toggle { display: none !important; } }
        .listing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        @media (max-width: 640px) { .listing-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }
        @media (max-width: 380px) { .listing-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: '60px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(5,5,5,0.95)', borderBottom: '0.5px solid var(--b)', backdropFilter: 'blur(18px)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', color: 'var(--gold)', textDecoration: 'none' }}>
          Secret<em style={{ fontStyle: 'normal' }}>X</em>perience
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/companionship" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Companionship</Link>
        <Link href="/massage" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Massage</Link>
        <Link href="/nightlife" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Nightlife</Link>
        <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
        <Link href="/listings/create" style={{ background: 'var(--grad-gold)', color: '#000', fontSize: '13px', fontWeight: 700, padding: '7px 16px', borderRadius: '999px', textDecoration: 'none', letterSpacing: '0.04em' }}>
          + Advertise
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(197,160,90,0.07) 0%, var(--bg) 60%)', borderBottom: '0.5px solid var(--b)', padding: '3rem 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', opacity: 0.8 }}>SecretXperience · Escorts</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 5vw, 56px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.08, marginBottom: '0.75rem' }}>
            Escort Services
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: '15px', maxWidth: '520px', lineHeight: 1.7 }}>
            Verified independent escorts and companions across Europe. Browse by type, orientation, location and services.
          </p>
        </div>
      </div>

      {/* Escort type tabs */}
      <div style={{ background: 'rgba(10,10,14,0.9)', backdropFilter: 'blur(16px)', borderBottom: '0.5px solid var(--b)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {ESCORT_TYPES.map(t => (
            <button key={t.value} className={`type-btn${escortType === t.value ? ' active' : ''}`} onClick={() => setEscortType(t.value)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ── Filter sidebar ── */}
        <aside style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '80px' }}>

          {/* Mobile toggle */}
          <button
            className="mobile-filter-toggle"
            onClick={() => setShowFilters(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', padding: '12px 16px', color: 'var(--t)', fontSize: '14px', cursor: 'pointer', marginBottom: '1rem', fontFamily: 'var(--sans)' }}
          >
            <span>Filters {activeFilterCount > 0 && <span style={{ background: 'var(--grad-gold)', color: '#000', borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: 700, marginLeft: '6px' }}>{activeFilterCount}</span>}</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>

          <div className={`filter-panel${showFilters ? ' open' : ''}`}>
            <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Search city */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>City</div>
                <select className="filter-select" value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Sexual orientation */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Sexual Orientation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {SEXUAL_ORIENTATION.map(o => (
                    <button key={o.value} onClick={() => setOrientation(o.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', borderRadius: '8px', fontSize: '13px', color: orientation === o.value ? 'var(--gold)' : 'var(--t2)', background: orientation === o.value ? 'var(--gbg)' : 'transparent', fontFamily: 'var(--sans)', textAlign: 'left' } as any}>
                      <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid ' + (orientation === o.value ? 'var(--gold)' : 'var(--b2)'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {orientation === o.value && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gold)' }} />}
                      </span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meet type */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Meet Type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {MEET_TYPES.map(m => (
                    <button key={m.value} onClick={() => setMeetType(m.value)} style={{ padding: '5px 12px', borderRadius: '20px', border: '0.5px solid ' + (meetType === m.value ? 'var(--gbrd)' : 'var(--b)'), background: meetType === m.value ? 'var(--gbg)' : 'transparent', color: meetType === m.value ? 'var(--gold)' : 'var(--t2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Price per Hour</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--t)', flex: 1, textAlign: 'center' }}>
                    €{priceMin}
                  </div>
                  <span style={{ color: 'var(--t3)', fontSize: '12px' }}>–</span>
                  <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--t)', flex: 1, textAlign: 'center' }}>
                    €{priceMax === 1000 ? '1000+' : priceMax}
                  </div>
                </div>
                <input type="range" className="price-slider" min={0} max={1000} step={25} value={priceMin} onChange={e => setPriceMin(Number(e.target.value))} />
                <input type="range" className="price-slider" min={0} max={1000} step={25} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ marginTop: '4px' }} />
              </div>

              {/* Ethnicity */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Ethnicity</div>
                <select className="filter-select" value={ethnicity} onChange={e => setEthnicity(e.target.value)}>
                  {ETHNICITIES.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>

              {/* Build */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Build</div>
                <select className="filter-select" value={build} onChange={e => setBuild(e.target.value)}>
                  {BUILDS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              {/* Hair color */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Hair Color</div>
                <select className="filter-select" value={hairColor} onChange={e => setHairColor(e.target.value)}>
                  {HAIR_COLORS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>

              {/* Services */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Services / Possibilities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {SERVICES_LIST.map(s => (
                    <button key={s} className={`service-chip${selectedServices.includes(s) ? ' active' : ''}`} onClick={() => toggleService(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified only */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div onClick={() => setVerifiedOnly(v => !v)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1.5px solid ' + (verifiedOnly ? 'var(--gold)' : 'var(--b2)'), background: verifiedOnly ? 'var(--gbg)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
                  {verifiedOnly && <span style={{ color: 'var(--gold)', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--t2)' }}>Verified only</span>
              </label>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} style={{ width: '100%', padding: '9px', background: 'none', border: '0.5px solid var(--b)', borderRadius: 'var(--r)', color: 'var(--t3)', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--sans)', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b3)'; (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b)'; (e.currentTarget as HTMLElement).style.color = 'var(--t3)' }}
                >
                  ✕ Reset filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Results ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Results bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
              {loading ? 'Loading…' : <><span style={{ color: 'var(--t)', fontWeight: 600 }}>{listings.length}</span> escorts found</>}
              {activeFilterCount > 0 && <span style={{ color: 'var(--gold)', marginLeft: '8px', fontSize: '12px' }}>({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)</span>}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Sort:</span>
              <select
                className="filter-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{ width: 'auto', padding: '6px 10px' }}
              >
                <option value="rating">Top rated</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
              {escortType !== 'all' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>Type: {ESCORT_TYPES.find(t => t.value === escortType)?.label} <button onClick={() => setEscortType('all')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {orientation !== 'all' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>{SEXUAL_ORIENTATION.find(o => o.value === orientation)?.label} <button onClick={() => setOrientation('all')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {meetType !== 'all' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>{cap(meetType)} <button onClick={() => setMeetType('all')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {city !== 'All Cities' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>📍 {city} <button onClick={() => setCity('All Cities')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {verifiedOnly && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(38,212,160,0.08)', border: '0.5px solid rgba(38,212,160,0.3)', color: '#26d4a0', fontSize: '12px' }}>✓ Verified only <button onClick={() => setVerifiedOnly(false)} style={{ background: 'none', border: 'none', color: '#26d4a0', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {selectedServices.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>{s} <button onClick={() => toggleService(s)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>)}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4', background: 'var(--bg1)', borderRadius: 'var(--rl)', border: '0.5px solid var(--b)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--t3)' }}>
              <div style={{ fontSize: '40px', marginBottom: '1rem' }}>◈</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontStyle: 'italic', color: 'var(--t2)', marginBottom: '0.5rem' }}>No results found</h3>
              <p style={{ fontSize: '14px', marginBottom: '1.5rem' }}>Try adjusting your filters</p>
              <button onClick={resetFilters} style={{ background: 'var(--grad-gold)', border: 'none', borderRadius: '999px', padding: '10px 24px', color: '#000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>Clear all filters</button>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map(l => <EscortCard key={l.id} l={l} />)}
            </div>
          )}

          {/* List CTA */}
          <div style={{ marginTop: '4rem', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--rl)', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.6rem' }}>Independent Escorts & Agencies</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '0.5rem' }}>Advertise your profile</h3>
              <p style={{ color: 'var(--t2)', fontSize: '14px', lineHeight: 1.65, maxWidth: '420px' }}>Reach verified clients across Europe. Free listing, discreet, no middlemen.</p>
            </div>
            <Link href="/listings/create" style={{ background: 'var(--grad-gold)', borderRadius: '999px', padding: '12px 28px', color: '#000', fontWeight: 700, fontSize: '14px', textDecoration: 'none', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              Create profile →
            </Link>
          </div>
        </main>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
    </div>
  )
}
