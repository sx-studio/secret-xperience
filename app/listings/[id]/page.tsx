'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../app/lib/supabase'
import EscortProfile from './EscortProfile'

const ESCORT_CATEGORIES = new Set(['escorts', 'companionship', 'massage', 'domination', 'experiences'])

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

interface Review {
  id:          string
  listing_id:  string
  reviewer_id: string
  rating:      number
  content:     string | null
  created_at:  string
  profiles: {
    full_name: string | null
    username:  string | null
  } | null
}

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
  const [isFaved,   setIsFaved]   = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // Reviews state
  const [reviews,        setReviews]        = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating,    setHoverRating]    = useState(0)
  const [reviewText,     setReviewText]     = useState('')
  const [submitting,     setSubmitting]     = useState(false)
  const [submitError,    setSubmitError]    = useState<string | null>(null)
  const [similarListings, setSimilarListings] = useState<any[]>([])

  async function fetchReviews() {
    if (!id) return
    setReviewsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, username)')
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) || [])
    setReviewsLoading(false)
  }

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
      if (sess?.user?.id) {
        supabase.from('favorites').select('listing_id').eq('user_id', sess.user.id).eq('listing_id', id).single()
          .then(({ data: fav }) => setIsFaved(!!fav))
      }
      if (error || !data) {
        setNotFound(true)
      } else {
        setListing(data as any)
        if (data.images?.length) setActiveImg(data.images[0])
        // Track view (fire-and-forget)
        supabase.from('listing_views').insert({ listing_id: id, user_id: sess?.user?.id || null }).then(() => {})
        // Fetch similar listings by same category
        const { data: sims } = await supabase
          .from('listings')
          .select('id, title, category, subcategory, city, country, price_from, verified, premium, rating')
          .eq('active', true)
          .ilike('category', (data.category || '') + '%')
          .neq('id', id)
          .order('rating', { ascending: false })
          .limit(3)
        setSimilarListings(sims || [])
        document.title = `${data.title} | SecretXperience`
        let meta = document.querySelector('meta[name="description"]')
        if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta) }
        meta.setAttribute('content', data.description?.slice(0, 160) || `Book ${data.title} in ${data.city}`)
      }
      setPageLoading(false)
    }
    load()
    fetchReviews()
  }, [id])

  async function submitReview() {
    if (!session || selectedRating === 0) return
    setSubmitting(true)
    setSubmitError(null)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      listing_id:  id,
      reviewer_id: session.user.id,
      rating:      selectedRating,
      content:     reviewText.trim() || null,
    })
    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
      return
    }
    // Refetch reviews to get updated list
    const { data: updatedReviews } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, username)')
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
    const revList = (updatedReviews as Review[]) || []
    setReviews(revList)
    // Recalculate and update listing stats
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listing_id', id)
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      await supabase
        .from('listings')
        .update({
          rating: Math.round(avg * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', id)
      setListing(prev => prev ? { ...prev, rating: Math.round(avg * 10) / 10, review_count: allReviews.length } : prev)
    }
    // Reset form
    setSelectedRating(0)
    setReviewText('')
    setShowReviewForm(false)
    setSubmitting(false)
  }

  /* ── Navigate to message/book (auth guard) ── */
  async function toggleFavorite() {
    if (!session) { window.location.href = `/login?next=/listings/${id}`; return }
    setFavLoading(true)
    const supabase = createClient()
    if (isFaved) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('listing_id', listing!.id)
      setIsFaved(false)
    } else {
      await supabase.from('favorites').upsert({ user_id: session.user.id, listing_id: listing!.id })
      setIsFaved(true)
    }
    setFavLoading(false)
  }

  function goToMessage() {
    if (!session) { window.location.href = `/login?next=/listings/${id}`; return }
    window.location.href = `/messages?provider_id=${listing!.profile_id}&listing_id=${listing!.id}&listing_title=${encodeURIComponent(listing!.title)}`
  }

  function goToBook() {
    if (!session) { window.location.href = `/login?next=/listings/${id}`; return }
    window.location.href = `/messages?provider_id=${listing!.profile_id}&listing_id=${listing!.id}&listing_title=${encodeURIComponent(listing!.title)}&preset=book`
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

  // Only rentals and hotels support on-platform booking/payments
  const BOOKABLE_CATEGORIES = ['rentals', 'hotels', 'events']
  const isBookable = BOOKABLE_CATEGORIES.includes(listing.category?.toLowerCase() || '')

  const cat       = listing.category
  const icon      = CATEGORY_ICONS[cat] || '◆'
  const catLabel  = CATEGORY_LABELS[cat] || cat
  const meetLabel = listing.meet_type ? (MEET_LABELS[listing.meet_type] || listing.meet_type) : null
  const hasImages = listing.images && listing.images.length > 0
  const prof      = listing.profile

  /* ── Escort/companion/massage/domination — use dedicated profile layout ── */
  if (ESCORT_CATEGORIES.has(cat)) {
    return (
      <>
        <style>{`
          ${fonts}
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #050505; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @media (min-width: 900px) { .ep-mobile-cta { display: none !important; } }
        `}</style>
        <div style={{ minHeight: '100vh', background: '#050505', color: '#ece8e1' }}>
          <nav style={{ background: 'rgba(5,5,5,0.95)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', height: '60px', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
            <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px 8px', fontSize: '18px', lineHeight: 1, borderRadius: '6px' }} aria-label="Go back">←</button>
            <a href="/" style={{ textDecoration: 'none', flex: 1 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: '#c5a05a', letterSpacing: '0.04em' }}>
                Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
              </span>
            </a>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{catLabel}</span>
          </nav>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem', animation: 'fadeUp 0.35s ease' }}>
            <EscortProfile
              listing={{ ...listing, tags: (listing as any).tags ?? [] }}
              reviews={reviews}
              session={session}
              isBookable={isBookable}
              onBook={isBookable ? goToBook : goToMessage}
              onMessage={goToMessage}
              onReviewSubmit={async (rating, text) => {
                if (!session) return
                const supabase = createClient()
                await supabase.from('reviews').insert({ listing_id: id, reviewer_id: session.user.id, rating, content: text.trim() || null })
                await fetchReviews()
              }}
            />
          </div>
        </div>
      </>
    )
  }

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
          font-size: 12px;
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
          font-size: 12px;
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
        .rv-star {
          cursor: pointer;
          font-size: 22px;
          color: rgba(197,160,90,0.25);
          transition: color 0.15s, transform 0.1s;
          line-height: 1;
          background: none;
          border: none;
          padding: 0 2px;
        }
        .rv-star.filled { color: #c5a05a; }
        .rv-star:hover { transform: scale(1.15); }
        .rv-submit {
          padding: 11px 28px;
          background: linear-gradient(135deg,#c5a05a 0%,#a0803d 100%);
          border: none;
          border-radius: 10px;
          color: #080808;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .rv-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);
          pointer-events: none;
        }
        .rv-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .rv-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .rv-cancel {
          padding: 11px 20px;
          background: transparent;
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: rgba(255,255,255,0.35);
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .rv-cancel:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.6); }
        .rv-leave-btn {
          padding: 10px 22px;
          background: transparent;
          border: 0.5px solid rgba(197,160,90,0.35);
          border-radius: 10px;
          color: #c5a05a;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .rv-leave-btn:hover { border-color: rgba(197,160,90,0.65); background: rgba(197,160,90,0.06); }
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
                          fontSize: '13px',
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
                      fontSize: '12px',
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
                    fontSize: '12px',
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

              {/* ── Reviews section ── */}
              {(() => {
                const avgRating = reviews.length > 0
                  ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                  : 0
                const canReview = !!session && session.user.id !== listing.profile_id
                return (
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '0.5px solid rgba(255,255,255,0.07)',
                    borderRadius: '18px',
                    padding: '1.5rem 1.75rem',
                    marginBottom: '1.5rem',
                  }}>
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <p style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: '12px',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.2)',
                          fontWeight: 600,
                          margin: 0,
                        }}>
                          Reviews
                        </p>
                        {reviews.length > 0 && (
                          <>
                            <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '12px' }}>·</span>
                            <span style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: '12px',
                              color: '#c5a05a',
                              fontWeight: 500,
                              letterSpacing: '0.02em',
                            }}>
                              {avgRating.toFixed(1)} ★
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '12px' }}>·</span>
                            <span style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: '12px',
                              color: 'rgba(255,255,255,0.28)',
                              fontWeight: 300,
                            }}>
                              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                            </span>
                          </>
                        )}
                      </div>
                      {canReview && !showReviewForm && (
                        <button
                          type="button"
                          className="rv-leave-btn"
                          onClick={() => setShowReviewForm(true)}
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>

                    {/* Inline review form */}
                    {showReviewForm && (
                      <div style={{
                        background: 'rgba(197,160,90,0.04)',
                        border: '0.5px solid rgba(197,160,90,0.15)',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        marginBottom: '1.25rem',
                      }}>
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '18px',
                          fontWeight: 400,
                          color: '#ece8e1',
                          letterSpacing: '0.01em',
                          marginBottom: '1rem',
                        }}>
                          Your Rating
                        </p>

                        {/* Star selector */}
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`rv-star${star <= (hoverRating || selectedRating) ? ' filled' : ''}`}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setSelectedRating(star)}
                              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        {/* Textarea */}
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          placeholder="Share your experience (optional)…"
                          rows={4}
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '0.5px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            color: 'rgba(255,255,255,0.7)',
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '13px',
                            fontWeight: 300,
                            lineHeight: 1.65,
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box',
                            marginBottom: '0.875rem',
                          }}
                        />

                        {submitError && (
                          <p style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '12px',
                            color: 'rgba(220,80,80,0.85)',
                            fontWeight: 300,
                            marginBottom: '0.75rem',
                          }}>
                            {submitError}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="rv-submit"
                            onClick={submitReview}
                            disabled={submitting || selectedRating === 0}
                          >
                            {submitting ? 'Submitting…' : 'Submit Review'}
                          </button>
                          <button
                            type="button"
                            className="rv-cancel"
                            onClick={() => {
                              setShowReviewForm(false)
                              setSelectedRating(0)
                              setHoverRating(0)
                              setReviewText('')
                              setSubmitError(null)
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Review list */}
                    {reviewsLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
                        <div style={{
                          width: '28px', height: '28px',
                          border: '1.5px solid rgba(197,160,90,0.15)',
                          borderTop: '1.5px solid #c5a05a',
                          borderRadius: '50%',
                          animation: 'spin 0.9s linear infinite',
                        }} />
                      </div>
                    ) : reviews.length === 0 ? (
                      <p style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.25)',
                        fontWeight: 300,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '1.5rem 0',
                        lineHeight: 1.6,
                      }}>
                        No reviews yet. Be the first to leave one.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reviews.map(review => {
                          const reviewerName = review.profiles?.full_name || review.profiles?.username || 'Anonymous'
                          const dateStr = new Date(review.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                          return (
                            <div key={review.id} style={{
                              background: 'rgba(255,255,255,0.025)',
                              border: '0.5px solid rgba(255,255,255,0.07)',
                              borderRadius: '12px',
                              padding: '1rem 1.25rem',
                            }}>
                              {/* Reviewer name + date row */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '6px' }}>
                                <span style={{
                                  fontFamily: "'Cormorant Garamond', serif",
                                  fontSize: '16px',
                                  fontWeight: 400,
                                  color: '#ece8e1',
                                  letterSpacing: '0.01em',
                                }}>
                                  {reviewerName}
                                </span>
                                <span style={{
                                  fontFamily: "'Jost', sans-serif",
                                  fontSize: '12px',
                                  color: 'rgba(255,255,255,0.2)',
                                  fontWeight: 300,
                                }}>
                                  {dateStr}
                                </span>
                              </div>
                              {/* Star rating display */}
                              <div style={{ display: 'flex', gap: '2px', marginBottom: review.content ? '0.75rem' : '0' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span key={star} style={{
                                    fontSize: '14px',
                                    color: star <= review.rating ? '#c5a05a' : 'rgba(197,160,90,0.18)',
                                    lineHeight: 1,
                                  }}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              {/* Review content */}
                              {review.content && (
                                <p style={{
                                  fontFamily: "'Jost', sans-serif",
                                  fontSize: '13px',
                                  color: 'rgba(255,255,255,0.5)',
                                  fontWeight: 300,
                                  lineHeight: 1.7,
                                  margin: 0,
                                  whiteSpace: 'pre-wrap',
                                }}>
                                  {review.content}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}

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
                    fontSize: '12px',
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

            {/* ── Similar listings ── */}
            {similarListings.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginBottom: '1rem' }}>
                  Similar listings
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {similarListings.map(s => (
                    <a key={s.id} href={`/listings/${s.id}`} style={{ textDecoration: 'none', display: 'block', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem 1.25rem', transition: 'border-color 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(197,160,90,0.3)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                    >
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                        {s.category}{s.subcategory ? ' · ' + s.subcategory : ''}
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#ece8e1', marginBottom: '6px', fontWeight: 400 }}>
                        {s.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#c5a05a' }}>
                          {s.price_from ? `€${s.price_from}` : 'POA'}
                        </span>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                          {s.city || ''}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
                  fontSize: '12px',
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
                          fontSize: '13px',
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
                        fontSize: '13px',
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
                    fontSize: '13px',
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
                    fontSize: '12px',
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
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Starting from
                      </span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#c5a05a', fontWeight: 400 }}>
                        €{listing.price_from}
                      </span>
                    </div>
                  )}
                  {listing.price_to && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Up to
                      </span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#c5a05a', fontWeight: 400 }}>
                        €{listing.price_to}
                      </span>
                    </div>
                  )}
                  {listing.meet_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
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
                <button type="button" className="ld-book-btn" onClick={isBookable ? goToBook : goToMessage}>
                  {isBookable ? 'Book Now' : 'Send Message'}
                </button>
                {isBookable && (
                  <button type="button" className="ld-msg-btn" onClick={goToMessage}>
                    Send Message
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '11px', borderRadius: 'var(--r, 8px)',
                    border: `0.5px solid ${isFaved ? 'rgba(197,160,90,0.5)' : 'var(--b, rgba(255,255,255,0.08))'}`,
                    background: isFaved ? 'rgba(197,160,90,0.1)' : 'transparent',
                    color: isFaved ? 'var(--gold, #c5a05a)' : 'var(--t2, rgba(236,232,225,0.55))',
                    cursor: favLoading ? 'default' : 'pointer',
                    fontSize: '13px', fontFamily: 'var(--sans)', transition: 'all .2s',
                  }}
                >
                  <i className={isFaved ? 'ti ti-heart-filled' : 'ti ti-heart'} />
                  {isFaved ? 'Saved' : 'Save listing'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
