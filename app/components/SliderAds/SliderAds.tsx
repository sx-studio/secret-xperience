'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '../../lib/supabase'

interface AdSlide {
  id: string
  title: string
  subtitle: string
  city: string
  category: string
  price_from?: number
  images?: string[]
  verified?: boolean
  premium?: boolean
  featured_until?: string
}

const CAT_GRADIENTS: Record<string, string> = {
  escorts:       'linear-gradient(135deg,#1a0a18 0%,#2d1040 50%,#1a0510 100%)',
  companionship: 'linear-gradient(135deg,#0d0b08 0%,#2a1a0d 50%,#1a0d0b 100%)',
  nightlife:     'linear-gradient(135deg,#06060f 0%,#0d0d2a 50%,#0a0614 100%)',
  creators:      'linear-gradient(135deg,#0a0808 0%,#1a0d1a 50%,#0d0a0a 100%)',
  rentals:       'linear-gradient(135deg,#080d10 0%,#0d1a24 50%,#080a0d 100%)',
  hotels:        'linear-gradient(135deg,#0a0a08 0%,#1a1a0d 50%,#0d0d08 100%)',
  events:        'linear-gradient(135deg,#0a0808 0%,#240d0d 50%,#140808 100%)',
}

const CAT_ACCENT: Record<string, string> = {
  escorts: '#c5a05a', companionship: '#d4956a', nightlife: '#7a8aee',
  creators: '#b06ae0', rentals: '#5ab0c5', hotels: '#c5b05a', events: '#e05a8a',
}

const MONOGRAM_BG: Record<string, string> = {
  escorts: 'rgba(197,160,90,0.12)', companionship: 'rgba(212,149,106,0.12)',
  nightlife: 'rgba(122,138,238,0.12)', creators: 'rgba(176,106,224,0.12)',
  rentals: 'rgba(90,176,197,0.12)', hotels: 'rgba(197,176,90,0.12)', events: 'rgba(224,90,138,0.12)',
}

export default function SliderAds() {
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [slides, setSlides] = useState<AdSlide[]>([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gsapRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('listings')
        .select('id,title,category,city,country,price_from,images,verified,premium,featured_until,description')
        .eq('active', true)
        .not('featured_until', 'is', null)
        .order('featured_until', { ascending: false })
        .limit(8)
      if (data && data.length > 0) {
        setSlides(data.map((l: any) => ({
          id: l.id,
          title: l.title || '—',
          subtitle: [l.category, l.description?.slice(0, 60)].filter(Boolean).join(' · '),
          city: [l.city, l.country].filter(Boolean).join(', '),
          category: l.category || 'escorts',
          price_from: l.price_from,
          images: l.images || [],
          verified: l.verified,
          premium: l.premium,
          featured_until: l.featured_until,
        })))
      }
    }
    load()
  }, [])

  // Load GSAP dynamically
  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.gsap || mod.default })
  }, [])

  const goTo = (idx: number, dir: 1 | -1 = 1) => {
    const gsap = gsapRef.current
    const track = trackRef.current
    if (!track || !gsap) { setCurrent(idx); return }
    const cards = track.querySelectorAll<HTMLElement>('.sx-adslide')
    if (!cards.length) return
    // Animate out current
    gsap.to(cards[current], { x: dir > 0 ? -60 : 60, opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        gsap.set(cards[current], { x: dir > 0 ? 60 : -60 })
        setCurrent(idx)
      }
    })
    // Prepare next
    gsap.set(cards[idx], { x: dir > 0 ? 60 : -60, opacity: 0 })
    gsap.to(cards[idx], { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out', delay: 0.2 })
  }

  const next = () => { const n = (current + 1) % slides.length; goTo(n, 1) }
  const prev = () => { const n = (current - 1 + slides.length) % slides.length; goTo(n, -1) }

  useEffect(() => {
    if (slides.length < 2 || paused) return
    intervalRef.current = setInterval(next, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [slides.length, current, paused])

  // Initial animation on mount
  useEffect(() => {
    if (!slides.length || !gsapRef.current || !trackRef.current) return
    const gsap = gsapRef.current
    const cards = trackRef.current.querySelectorAll<HTMLElement>('.sx-adslide')
    gsap.fromTo(cards, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'power2.out' })
  }, [slides.length])

  const [mountEl, setMountEl] = useState<Element | null>(null)
  useEffect(() => {
    const el = document.getElementById('sliderAdsMount')
    if (el) setMountEl(el)
  }, [])

  if (!slides.length || !mountEl) return null

  const slide = slides[current]
  const accent = CAT_ACCENT[slide.category] || '#c5a05a'
  const grad = CAT_GRADIENTS[slide.category] || CAT_GRADIENTS.escorts
  const monoBg = MONOGRAM_BG[slide.category] || 'rgba(197,160,90,0.12)'

  const slider = (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ margin: '0 0 1.5rem', position: 'relative' }}
    >
      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 9, letterSpacing: '0.16em', fontWeight: 700, color: 'var(--t3, #888)', textTransform: 'uppercase' }}>Sponsored Feature</span>
          <span style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: 'var(--t3, #888)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
            <span style={{ color: accent, fontWeight: 600 }}>{String(current + 1).padStart(2, '0')}</span>
            {' / '}
            {String(slides.length).padStart(2, '0')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button aria-label="Previous" onClick={prev} style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '50%', cursor: 'pointer', color: 'var(--t, #fff)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }} onMouseOver={e => (e.currentTarget.style.background = `${accent}22`)} onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>‹</button>
          <button aria-label="Next" onClick={next} style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '50%', cursor: 'pointer', color: 'var(--t, #fff)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }} onMouseOver={e => (e.currentTarget.style.background = `${accent}22`)} onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>›</button>
        </div>
      </div>

      {/* Slide track */}
      <div ref={trackRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
        {slides.map((s, i) => {
          const a = CAT_ACCENT[s.category] || '#c5a05a'
          const g = CAT_GRADIENTS[s.category] || CAT_GRADIENTS.escorts
          const mb = MONOGRAM_BG[s.category] || 'rgba(197,160,90,0.12)'
          const isActive = i === current
          return (
            <div key={s.id} className="sx-adslide"
              style={{
                position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, right: 0,
                display: isActive || i === 0 ? 'flex' : 'none',
                visibility: isActive ? 'visible' : 'hidden',
                background: g,
                border: `0.5px solid ${a}28`,
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow .3s',
                boxShadow: isActive ? `0 8px 48px ${a}18` : 'none',
              }}
              onClick={() => { window.location.href = `/listings/${s.id}` }}
            >
              {/* Glow orb */}
              <div style={{ position: 'absolute', top: -60, right: 80, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${a}14 0%, transparent 70%)`, pointerEvents: 'none' }} />

              {/* Image / Monogram column */}
              <div style={{ width: 200, flexShrink: 0, position: 'relative', overflow: 'hidden', minHeight: 160 }}>
                {s.images && s.images.length > 0 ? (
                  <img src={s.images[0]} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mb }}>
                    <span style={{ fontFamily: 'var(--serif, serif)', fontSize: 52, fontWeight: 600, color: a, opacity: 0.8 }}>{s.title.slice(0, 2)}</span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 50%, rgba(0,0,0,0.5))', pointerEvents: 'none' }} />
                {/* Top badges */}
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
                  {s.verified && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(29,201,143,0.2)', color: '#1dc98f', border: '0.5px solid rgba(29,201,143,0.4)', borderRadius: 6, padding: '2px 6px', letterSpacing: '0.06em' }}>✓ VER</span>}
                  {s.premium && <span style={{ fontSize: 9, fontWeight: 700, background: `${a}22`, color: a, border: `0.5px solid ${a}44`, borderRadius: 6, padding: '2px 6px', letterSpacing: '0.06em' }}>PREM</span>}
                </div>
                {/* Category plate — bottom of image */}
                <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 9, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', color: a, background: 'rgba(0,0,0,0.65)', border: `0.5px solid ${a}44`, borderRadius: 20, padding: '3px 9px', backdropFilter: 'blur(8px)' }}>✦ {s.category}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: a, background: `${a}14`, border: `0.5px solid ${a}33`, borderRadius: 6, padding: '2px 8px' }}>✦ Featured</span>
                    <span style={{ fontSize: 11, color: 'var(--t3, #555)' }}>{s.category}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--serif, serif)', fontSize: 'clamp(18px,2vw,26px)', fontWeight: 500, color: 'var(--t, #ece8e1)', lineHeight: 1.2, marginBottom: '0.4rem' }}>{s.title}</h3>
                  {s.subtitle && <p style={{ fontSize: 12, color: 'var(--t2, rgba(236,232,225,0.5))', lineHeight: 1.5, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' as any }}>{s.subtitle}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {s.city && <span style={{ fontSize: 12, color: 'var(--t3, #555)', display: 'flex', alignItems: 'center', gap: 4 }}>📍 {s.city}</span>}
                    {s.price_from && <span style={{ fontSize: 14, fontWeight: 600, color: a }}>From €{s.price_from}</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: a, background: `${a}14`, border: `0.5px solid ${a}44`, borderRadius: 8, padding: '5px 14px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>View listing →</span>
                </div>
              </div>

              {/* Left / right edge arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    aria-label="Previous"
                    onClick={e => { e.stopPropagation(); prev() }}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(0,0,0,0.55)', border: `0.5px solid ${a}44`, borderRadius: '50%', cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(8px)', transition: 'background .2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = `${a}44`)}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
                  >‹</button>
                  <button
                    aria-label="Next"
                    onClick={e => { e.stopPropagation(); next() }}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(0,0,0,0.55)', border: `0.5px solid ${a}44`, borderRadius: '50%', cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(8px)', transition: 'background .2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = `${a}44`)}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
                  >›</button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom rail: dots + pause hint + advertise CTA */}
      <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {slides.map((_, i) => (
            <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => goTo(i, i > current ? 1 : -1)}
              style={{ width: i === current ? 20 : 5, height: 5, borderRadius: 3, background: i === current ? accent : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s' }} />
          ))}
          {paused && (
            <span style={{ fontSize: 10, color: 'var(--t3, #888)', marginLeft: 6, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 8 }}>⏸</span> Paused
            </span>
          )}
        </div>
        <a href="/advertise" style={{ fontSize: 11, color: 'var(--t3, #555)', textDecoration: 'none', letterSpacing: '0.04em' }} onMouseOver={e => (e.currentTarget.style.color = accent)} onMouseOut={e => (e.currentTarget.style.color = 'var(--t3, #555)')}>
          Want your listing here? <span style={{ color: accent, fontWeight: 600 }}>Get featured →</span>
        </a>
      </div>
    </div>
  )

  return createPortal(slider, mountEl)
}
