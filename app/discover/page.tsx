'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '../lib/supabase'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'

if (typeof window !== 'undefined') gsap.registerPlugin(Draggable)

interface Card {
  id: string
  title: string
  category: string
  subcategory: string | null
  city: string
  country: string
  price_from: number | null
  images: string[] | null
  verified: boolean
  premium: boolean
  rating: number | null
  review_count: number | null
  tags: string[] | null
  description: string | null
}

const SKIP_KEY = 'sx_discover_skipped'
const BATCH    = 20

function getSkipped(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SKIP_KEY) || '[]')) } catch { return new Set() }
}
function addSkipped(id: string) {
  const s = getSkipped(); s.add(id)
  localStorage.setItem(SKIP_KEY, JSON.stringify([...s].slice(-200)))
}

export default function DiscoverPage() {
  const [cards, setCards]       = useState<Card[]>([])
  const [index, setIndex]       = useState(0)
  const [userId, setUserId]     = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [liking, setLiking]     = useState(false)
  const [noMore, setNoMore]     = useState(false)
  const [action, setAction]     = useState<'like' | 'skip' | null>(null)
  const [category, setCategory] = useState('all')

  const cardRef    = useRef<HTMLDivElement>(null)
  const draggable  = useRef<any>(null)

  const CATS = [
    { v: 'all', l: 'All' },
    { v: 'escorts', l: 'Escorts' },
    { v: 'companionship', l: 'Companionship' },
    { v: 'massage', l: 'Massage' },
    { v: 'nightlife', l: 'Nightlife' },
    { v: 'creators', l: 'Creators' },
  ]

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id)
    })
  }, [])

  const loadCards = useCallback(async (cat: string) => {
    setLoading(true)
    setNoMore(false)
    setIndex(0)
    const supabase = createClient()
    const skipped = getSkipped()

    let q = supabase
      .from('listings')
      .select('id,title,category,subcategory,city,country,price_from,images,verified,premium,rating,review_count,tags,description')
      .eq('active', true)
      .order('featured_until', { ascending: false, nullsFirst: false })
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(BATCH + skipped.size + 10)

    if (cat !== 'all') q = q.ilike('category', cat + '%')

    const { data } = await q
    const filtered = (data || []).filter(c => !skipped.has(c.id))
    setCards(filtered.slice(0, BATCH))
    setLoading(false)
  }, [])

  useEffect(() => { loadCards(category) }, [category, loadCards])

  // Set up GSAP Draggable on the active card
  useEffect(() => {
    if (!cardRef.current || loading || noMore) return
    const el = cardRef.current

    if (draggable.current) { draggable.current.forEach((d: any) => d.kill()) }

    draggable.current = Draggable.create(el, {
      type: 'x',
      inertia: false,
      onDrag() {
        const x = this.x
        const rot = x * 0.08
        const opacity = Math.max(0.4, 1 - Math.abs(x) / 400)
        gsap.set(el, { rotation: rot, opacity })
        // Show action indicators
        const likeEl  = el.querySelector<HTMLElement>('.disc-like-ind')
        const skipEl  = el.querySelector<HTMLElement>('.disc-skip-ind')
        if (likeEl)  likeEl.style.opacity = x > 30  ? String(Math.min(1, (x - 30) / 80))  : '0'
        if (skipEl)  skipEl.style.opacity = x < -30 ? String(Math.min(1, (-x - 30) / 80)) : '0'
      },
      onDragEnd() {
        const x = this.x
        if (x > 120) {
          flyOut('like')
        } else if (x < -120) {
          flyOut('skip')
        } else {
          gsap.to(el, { x: 0, rotation: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
          const likeEl = el.querySelector<HTMLElement>('.disc-like-ind')
          const skipEl = el.querySelector<HTMLElement>('.disc-skip-ind')
          if (likeEl) likeEl.style.opacity = '0'
          if (skipEl) skipEl.style.opacity = '0'
        }
      },
    })

    return () => { if (draggable.current) draggable.current.forEach((d: any) => d.kill()) }
  }, [index, cards, loading])

  async function flyOut(type: 'like' | 'skip') {
    if (!cardRef.current) return
    setAction(type)
    const el = cardRef.current
    const x  = type === 'like' ? 600 : -600

    gsap.to(el, {
      x, rotation: type === 'like' ? 25 : -25, opacity: 0,
      duration: 0.4, ease: 'power2.in',
      onComplete: async () => {
        const current = cards[index]
        if (!current) return

        if (type === 'like' && userId) {
          setLiking(true)
          const supabase = createClient()
          await supabase.from('favorites').upsert({ user_id: userId, listing_id: current.id }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true })
          setLiking(false)
        } else {
          addSkipped(current.id)
        }

        // Reset card position for next render
        gsap.set(el, { x: 0, rotation: 0, opacity: 1 })
        const likeEl = el.querySelector<HTMLElement>('.disc-like-ind')
        const skipEl = el.querySelector<HTMLElement>('.disc-skip-ind')
        if (likeEl) likeEl.style.opacity = '0'
        if (skipEl) skipEl.style.opacity = '0'

        const next = index + 1
        if (next >= cards.length) {
          setNoMore(true)
        } else {
          setIndex(next)
        }
        setAction(null)
      },
    })
  }

  const card = cards[index]

  return (
    <div style={{ minHeight: '100vh', background: '#080608', color: '#ece8e1', fontFamily: "'Jost', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        *{box-sizing:border-box;margin:0;padding:0}
        .disc-like-ind,.disc-skip-ind{position:absolute;top:32px;z-index:10;font-size:22px;font-weight:700;letter-spacing:.08em;padding:10px 20px;border-radius:12px;transition:none;pointer-events:none;opacity:0}
        .disc-like-ind{right:24px;color:#3ecf8e;border:3px solid #3ecf8e;background:rgba(62,207,142,0.12);transform:rotate(12deg)}
        .disc-skip-ind{left:24px;color:#e2536b;border:3px solid #e2536b;background:rgba(226,83,107,0.12);transform:rotate(-12deg)}
        .disc-btn{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:26px;transition:transform .15s,box-shadow .15s;border:none}
        .disc-btn:hover{transform:scale(1.1)}
        .disc-btn:active{transform:scale(0.93)}
        .disc-cat-pill{height:30px;padding:0 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.45);font:500 12px 'Jost',sans-serif;cursor:pointer;transition:all .15s;white-space:nowrap}
        .disc-cat-pill.active,.disc-cat-pill:hover{border-color:rgba(197,160,90,0.5);background:rgba(197,160,90,0.1);color:#c5a05a}
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 56, background: 'rgba(8,6,8,0.96)', borderBottom: '0.5px solid rgba(197,160,90,0.1)', position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#c5a05a', textDecoration: 'none', fontStyle: 'italic' }}>
          Secret<em style={{ fontStyle: 'normal' }}>X</em>perience
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!userId && (
            <a href="/login?next=/discover" style={{ fontSize: 13, color: '#c5a05a', textDecoration: 'none' }}>Sign in to save →</a>
          )}
          <a href="/escorts" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Browse all</a>
        </div>
      </nav>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, padding: '1rem 1.5rem 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c.v} onClick={() => setCategory(c.v)} className={`disc-cat-pill${category === c.v ? ' active' : ''}`}>
            {c.l}
          </button>
        ))}
      </div>

      {/* Main card area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem 2rem', gap: '1.5rem' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '0.5px solid rgba(197,160,90,0.3)', borderTopColor: '#c5a05a', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : noMore ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✦</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400 }}>You've seen them all</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 280, lineHeight: 1.6 }}>Check your saved listings or browse the full catalogue.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { localStorage.removeItem(SKIP_KEY); loadCards(category) }} style={{ padding: '10px 20px', border: '0.5px solid rgba(197,160,90,0.4)', borderRadius: 10, background: 'transparent', color: '#c5a05a', cursor: 'pointer', fontSize: 13, fontFamily: "'Jost',sans-serif" }}>
                Start over
              </button>
              <a href="/dashboard" style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: 10, color: '#080808', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                View saved →
              </a>
            </div>
          </div>
        ) : card ? (
          <>
            {/* Card count */}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {index + 1} / {cards.length}
            </div>

            {/* The card */}
            <div
              ref={cardRef}
              style={{
                width: '100%', maxWidth: 380, borderRadius: 20, overflow: 'hidden',
                background: '#0e0c12', border: '0.5px solid rgba(197,160,90,0.15)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                cursor: 'grab', userSelect: 'none', position: 'relative',
                touchAction: 'none',
              }}
            >
              {/* Action indicators */}
              <div className="disc-like-ind">SAVE ♥</div>
              <div className="disc-skip-ind">PASS ✕</div>

              {/* Photo */}
              <div style={{ height: 420, background: 'linear-gradient(140deg,#1a0a1a,#0d0610)', position: 'relative', overflow: 'hidden' }}>
                {card.images?.[0] ? (
                  <img src={card.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 96, fontStyle: 'italic', color: 'rgba(197,160,90,0.12)' }}>
                    {card.title.charAt(0)}
                  </div>
                )}

                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(8,6,12,0.95) 0%,rgba(8,6,12,0.2) 50%,transparent 75%)', pointerEvents: 'none' }} />

                {/* Badges */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 5 }}>
                  {card.verified && <span style={{ background: 'rgba(62,207,142,0.18)', border: '0.5px solid rgba(62,207,142,0.4)', color: '#3ecf8e', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>VERIFIED</span>}
                  {card.premium && <span style={{ background: 'linear-gradient(90deg,#c5a05a,#e8c97e)', color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.06em' }}>VIP</span>}
                </div>

                {/* Price badge */}
                {card.price_from && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(197,160,90,0.35)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: '#c5a05a' }}>
                    €{card.price_from}/hr
                  </div>
                )}

                {/* Bottom overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1.25rem 1rem' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: 'italic', fontWeight: 400, color: '#ece8e1', lineHeight: 1.15, marginBottom: 6 }}>
                    {card.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>📍 {card.city}{card.country ? `, ${card.country}` : ''}</span>
                    {card.rating && card.rating > 0 && (
                      <span style={{ fontSize: 11, color: '#c5a05a' }}>★ {Number(card.rating).toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {card.category}{card.subcategory ? ` · ${card.subcategory}` : ''}
                </div>
                {card.description && (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {card.description}
                  </p>
                )}
                <a href={`/listings/${card.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: '0.75rem', fontSize: 12, color: 'rgba(197,160,90,0.7)', textDecoration: 'none' }}
                  onClick={e => e.stopPropagation()}>
                  Full profile →
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <button
                className="disc-btn"
                onClick={() => flyOut('skip')}
                style={{ background: 'rgba(226,83,107,0.1)', border: '0.5px solid rgba(226,83,107,0.35)', color: '#e2536b', boxShadow: '0 4px 20px rgba(226,83,107,0.15)' }}
                title="Pass"
              >✕</button>

              <a href={`/listings/${card.id}`} style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 18 }}
                title="View profile">
                <i className="ti ti-user" />
              </a>

              <button
                className="disc-btn"
                onClick={() => flyOut('like')}
                disabled={liking}
                style={{ background: 'rgba(62,207,142,0.1)', border: '0.5px solid rgba(62,207,142,0.35)', color: '#3ecf8e', boxShadow: '0 4px 20px rgba(62,207,142,0.15)' }}
                title="Save to favourites"
              >♥</button>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              Swipe right to save · Swipe left to pass · Tap ♥ or ✕ to choose
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
