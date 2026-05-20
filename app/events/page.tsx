'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

const COUNTRIES = ['All', 'Belgium', 'Germany', 'Netherlands', 'United Kingdom', 'Spain', 'Switzerland']
const CATEGORIES = ['All', 'fetish', 'nightlife', 'lifestyle', 'wellness']
const CATEGORY_LABELS: Record<string, string> = { fetish: 'Fetish', nightlife: 'Nightlife', lifestyle: 'Lifestyle', wellness: 'Wellness' }
const COUNTRY_FLAGS: Record<string, string> = { Belgium: '🇧🇪', Germany: '🇩🇪', Netherlands: '🇳🇱', 'United Kingdom': '🇬🇧', Spain: '🇪🇸', Switzerland: '🇨🇭', France: '🇫🇷', Austria: '🇦🇹', 'Czech Republic': '🇨🇿' }

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function EventCard({ event }: { event: any }) {
  const flag = COUNTRY_FLAGS[event.country] || '🌍'
  const isFree = !event.price_from || event.price_from === 0
  const isUpcoming = event.date_start && new Date(event.date_start) >= new Date()

  return (
    <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', overflow: 'hidden', transition: 'border-color .2s, transform .2s', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b)'; (e.currentTarget as HTMLElement).style.transform = '' }}>

        {/* Date strip */}
        <div style={{ background: 'var(--grad-noir)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--b)' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--gold)', lineHeight: 1 }}>
              {event.date_start ? new Date(event.date_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBA'}
            </div>
            {event.date_end && event.date_end !== event.date_start && (
              <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>— {new Date(event.date_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            )}
            {!event.date_end && event.date_start && (
              <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{new Date(event.date_start).getFullYear()}</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            {event.featured && <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', borderRadius: '10px', padding: '2px 10px' }}>FEATURED</span>}
            {event.recurring !== 'one-time' && <span style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'capitalize' }}>{event.recurring}</span>}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '.75rem' }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500, margin: 0, color: 'var(--t)', lineHeight: 1.3 }}>{event.title}</h3>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--bg2)', color: 'var(--t2)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '3px 10px', flexShrink: 0 }}>
              {CATEGORY_LABELS[event.category] || event.category}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--t3)' }}>
              <span>{flag}</span>
              <span>{event.city}, {event.country}</span>
              {event.venue_name && <span style={{ color: 'var(--b3)' }}>·</span>}
              {event.venue_name && <span>{event.venue_name}</span>}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isFree ? '#26d4a0' : 'var(--gold)' }}>
              {isFree ? 'Free entry' : `From €${event.price_from}`}
            </div>
          </div>
          {event.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {event.tags.slice(0, 4).map((t: string) => (
                <span key={t} style={{ fontSize: '11px', color: 'var(--t3)', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '6px', padding: '2px 8px' }}>#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [country, setCountry] = useState('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('events').select('*').eq('active', true).order('featured', { ascending: false }).order('date_start', { ascending: true })
      .then(({ data }) => { setEvents(data || []); setFiltered(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    let res = events
    if (country !== 'All') res = res.filter(e => e.country === country)
    if (category !== 'All') res = res.filter(e => e.category === category)
    if (search) res = res.filter(e => (e.title + e.city + e.description + e.venue_name).toLowerCase().includes(search.toLowerCase()))
    setFiltered(res)
  }, [country, category, search, events])

  const featured = filtered.filter(e => e.featured)
  const rest = filtered.filter(e => !e.featured)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 14px rgba(197,160,90,0.35))' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-arrow-left" /> Browse listings</Link>
          <Link href="/advertise" style={{ height: '36px', padding: '0 16px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-plus" /> List an event</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid var(--b)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(197,160,90,0.07) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Fetish · Nightlife · Lifestyle</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>
            European<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> Adult Events</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--t2)', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 2rem' }}>
            Fetish festivals, leather parties, lifestyle events and club nights — curated across Europe.
          </p>
          {/* Search */}
          <div style={{ maxWidth: '460px', margin: '0 auto', position: 'relative' }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '16px', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, cities, venues…" style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--rl)', color: 'var(--t)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = 'var(--gbrd)')}
              onBlur={e => (e.target.style.borderColor = 'var(--b2)')} />
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <div style={{ position: 'sticky', top: '64px', zIndex: 100, background: 'rgba(8,6,18,0.95)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {/* Country tabs */}
          <div style={{ display: 'flex', gap: '6px', padding: '.7rem 0', flexShrink: 0, borderRight: '0.5px solid var(--b)', paddingRight: '1rem', marginRight: '1rem', flexWrap: 'nowrap' }}>
            {COUNTRIES.map(c => (
              <button key={c} onClick={() => setCountry(c)} style={{ height: '30px', padding: '0 12px', borderRadius: '20px', border: `0.5px solid ${country === c ? 'var(--gbrd)' : 'var(--b)'}`, background: country === c ? 'var(--gbg)' : 'transparent', color: country === c ? 'var(--gold)' : 'var(--t2)', fontSize: '12px', fontWeight: country === c ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {COUNTRY_FLAGS[c] && c !== 'All' ? `${COUNTRY_FLAGS[c]} ${c}` : c}
              </button>
            ))}
          </div>
          {/* Category pills */}
          <div style={{ display: 'flex', gap: '6px', padding: '.7rem 0', flexShrink: 0 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ height: '30px', padding: '0 12px', borderRadius: '20px', border: `0.5px solid ${category === c ? 'var(--gbrd)' : 'var(--b)'}`, background: category === c ? 'var(--gbg)' : 'transparent', color: category === c ? 'var(--gold)' : 'var(--t2)', fontSize: '12px', fontWeight: category === c ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'capitalize' }}>
                {c === 'All' ? 'All categories' : CATEGORY_LABELS[c] || c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--t3)' }}>Loading events…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--t3)' }}>
            <i className="ti ti-calendar-off" style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }} />
            No events found for your selection.
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <i className="ti ti-star-filled" style={{ color: 'var(--gold)', fontSize: '16px' }} />
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500 }}>Featured events</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)', marginLeft: '4px' }}>{featured.length} events</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
                  {featured.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {/* All other events */}
            {rest.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <i className="ti ti-calendar" style={{ color: 'var(--t3)', fontSize: '16px' }} />
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500 }}>All events</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)', marginLeft: '4px' }}>{rest.length} events</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
                  {rest.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SUBMIT CTA */}
      <div style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, margin: '0 0 .75rem' }}>Organising an event?</h2>
        <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem' }}>List your fetish party, lifestyle event or club night — reach thousands of visitors across Europe.</p>
        <Link href="/advertise" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
          <i className="ti ti-plus" /> Submit your event
        </Link>
      </div>
    </div>
  )
}
