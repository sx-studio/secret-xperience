'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

const PLANS = [
  {
    key: 'week',
    label: '7 Days',
    price: '€29',
    per: '€4.14 / day',
    badge: null,
    description: 'Get noticed this week. Your advertisement appears at the top of every search and category page with a ✦ Featured badge.',
  },
  {
    key: 'month',
    label: '30 Days',
    price: '€79',
    per: '€2.63 / day',
    badge: 'Best value',
    description: 'Maximum exposure for a full month. Appear in the featured slider on the homepage and top of all category pages.',
  },
]

export default function BoostPage() {
  const [listings, setListings]         = useState<any[]>([])
  const [selectedListing, setSelected]  = useState<string>('')
  const [selectedPlan, setPlan]         = useState<'week' | 'month'>('month')
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const [authed, setAuthed]             = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthed(false); setLoading(false); return }
      setAuthed(true)
      const { data } = await supabase
        .from('listings')
        .select('id, title, category, city, images, featured_until, active')
        .eq('profile_id', session.user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
      setListings(data || [])
      const params = new URLSearchParams(window.location.search)
      const preselect = params.get('listing')
      const match = data?.find((l: any) => l.id === preselect)
      setSelected(match?.id || data?.[0]?.id || '')
      setLoading(false)
    })
  }, [])

  async function checkout() {
    if (!selectedListing) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/featured-boost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: selectedListing, plan: selectedPlan }),
    })
    const json = await res.json()
    if (json.url) {
      window.location.href = json.url
    } else {
      setError(json.error || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const selectedListingData = listings.find(l => l.id === selectedListing)
  const isFeatured = (l: any) => l.featured_until && new Date(l.featured_until) > new Date()

  return (
    <>
      <style>{`
        body { background: #08060e; }
        .boost-wrap { min-height: 100vh; background: #08060e; color: #ece8e1; font-family: var(--sans, system-ui); }
        .boost-nav { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 0.5px solid rgba(255,255,255,0.06); }
        .boost-nav-logo { font-family: var(--serif, Georgia, serif); font-size: 20px; color: #ece8e1; text-decoration: none; }
        .boost-nav-logo em { font-style: italic; font-weight: 300; color: #c5a05a; }
        .boost-inner { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
        .boost-header { text-align: center; margin-bottom: 3rem; }
        .boost-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(197,160,90,0.7); margin-bottom: 1rem; }
        .boost-title { font-family: var(--serif, Georgia, serif); font-size: clamp(32px, 5vw, 52px); font-weight: 400; line-height: 1.1; margin-bottom: 1rem; }
        .boost-subtitle { font-size: 15px; color: rgba(236,232,225,0.55); max-width: 480px; margin: 0 auto; line-height: 1.6; }
        .boost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
        @media(max-width:640px){ .boost-grid { grid-template-columns: 1fr; } }
        .plan-card { border: 0.5px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.75rem; cursor: pointer; transition: border-color .15s, background .15s; position: relative; }
        .plan-card.selected { border-color: rgba(197,160,90,0.5); background: rgba(197,160,90,0.05); }
        .plan-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg,#c5a05a,#e8c97a); color: #000; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 3px 12px; border-radius: 20px; white-space: nowrap; }
        .plan-label { font-size: 12px; color: rgba(236,232,225,0.5); letter-spacing: 0.08em; margin-bottom: 6px; }
        .plan-price { font-family: var(--serif, Georgia, serif); font-size: 42px; font-weight: 400; color: #c5a05a; line-height: 1; margin-bottom: 4px; }
        .plan-per { font-size: 11px; color: rgba(197,160,90,0.5); margin-bottom: 1rem; }
        .plan-desc { font-size: 13px; color: rgba(236,232,225,0.55); line-height: 1.55; }
        .section-label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(197,160,90,0.6); margin-bottom: 0.875rem; }
        .listing-select { width: 100%; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1); border-radius: 10px; color: #ece8e1; font-size: 14px; padding: 12px 14px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c5a05a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 38px; }
        .listing-select:focus { border-color: rgba(197,160,90,0.4); }
        .listing-select option { background: #0f0d17; }
        .featured-until { display: inline-block; margin-top: 8px; font-size: 11px; color: #26d4a0; background: rgba(38,212,160,0.1); border-radius: 20px; padding: 3px 10px; }
        .checkout-btn { width: 100%; padding: 16px; background: linear-gradient(90deg,#c5a05a,#e8c97a); border: none; border-radius: 12px; color: #000; font-size: 15px; font-weight: 700; letter-spacing: 0.04em; cursor: pointer; transition: opacity .15s; margin-top: 1.5rem; }
        .checkout-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .checkout-btn:hover:not(:disabled) { opacity: 0.9; }
        .trust-row { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1.25rem; }
        .trust-item { font-size: 12px; color: rgba(236,232,225,0.4); display: flex; align-items: center; gap: 5px; }
        .boost-error { background: rgba(184,77,114,0.1); border: 0.5px solid rgba(184,77,114,0.3); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #e07aa0; margin-top: 1rem; }
        .no-listings { text-align: center; padding: 2rem; background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.07); border-radius: 12px; }
      `}</style>

      <div className="boost-wrap">
        <nav className="boost-nav">
          <a href="/" className="boost-nav-logo">Secret<em>Xperience</em></a>
          <a href="/dashboard" style={{ fontSize: 13, color: 'rgba(197,160,90,0.7)', textDecoration: 'none' }}>← Back to dashboard</a>
        </nav>

        <div className="boost-inner">
          <div className="boost-header">
            <div className="boost-eyebrow">✦ Featured Placement</div>
            <h1 className="boost-title">Put your advertisement<br /><em style={{ fontStyle:'italic', color:'#c5a05a' }}>in front of everyone</em></h1>
            <p className="boost-subtitle">Featured advertisements appear at the top of every search and category page, and in the homepage slider — seen by every visitor.</p>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'rgba(236,232,225,0.4)', fontSize:14 }}>Loading your advertisements…</div>
          ) : !authed ? (
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <p style={{ color:'rgba(236,232,225,0.55)', marginBottom:'1.5rem', fontSize:14 }}>You need to be signed in to feature a listing.</p>
              <a href="/login?next=/boost" style={{ display:'inline-block', padding:'12px 28px', background:'linear-gradient(90deg,#c5a05a,#e8c97a)', borderRadius:10, color:'#000', fontWeight:700, textDecoration:'none', fontSize:14 }}>Log in to continue</a>
            </div>
          ) : listings.length === 0 ? (
            <div className="no-listings">
              <p style={{ color:'rgba(236,232,225,0.55)', marginBottom:'1.25rem', fontSize:14 }}>You don't have any active listings yet.</p>
              <a href="/listings/create" style={{ display:'inline-block', padding:'11px 24px', background:'linear-gradient(90deg,#c5a05a,#e8c97a)', borderRadius:10, color:'#000', fontWeight:700, textDecoration:'none', fontSize:13 }}>+ Create a listing first</a>
            </div>
          ) : (
            <>
              {/* Step 1: Listing picker */}
              <div style={{ marginBottom: '2rem' }}>
                <div className="section-label">Step 1 — Choose your advertisement</div>
                <select
                  className="listing-select"
                  value={selectedListing}
                  onChange={e => setSelected(e.target.value)}
                >
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title}{l.city ? ` — ${l.city}` : ''}{isFeatured(l) ? ' (currently featured)' : ''}
                    </option>
                  ))}
                </select>
                {selectedListingData && isFeatured(selectedListingData) && (
                  <div className="featured-until">
                    ✦ Currently featured until {new Date(selectedListingData.featured_until).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })} — extending will add to remaining time
                  </div>
                )}
              </div>

              {/* Step 2: Plan selection */}
              <div className="section-label">Step 2 — Choose a duration</div>
              <div className="boost-grid">
                {PLANS.map(p => (
                  <div key={p.key} className={`plan-card${selectedPlan === p.key ? ' selected' : ''}`} onClick={() => setPlan(p.key as 'week' | 'month')}>
                    {p.badge && <div className="plan-badge">{p.badge}</div>}
                    <div className="plan-label">{p.label}</div>
                    <div className="plan-price">{p.price}</div>
                    <div className="plan-per">{p.per}</div>
                    <div className="plan-desc">{p.description}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="checkout-btn" disabled={submitting || !selectedListing} onClick={checkout}>
                {submitting ? 'Redirecting to payment…' : `Feature "${selectedListingData?.title || ''}" for ${selectedPlan === 'week' ? '€29 · 7 days' : '€79 · 30 days'} →`}
              </button>

              {error && <div className="boost-error">{error}</div>}

              <div className="trust-row">
                <span className="trust-item"><i className="ti ti-lock" /> Secure checkout via Stripe</span>
                <span className="trust-item"><i className="ti ti-clock" /> Activates instantly after payment</span>
                <span className="trust-item"><i className="ti ti-refresh" /> Extends if already featured</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
