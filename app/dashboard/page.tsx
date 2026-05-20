'use client'

import { useEffect, useState } from 'react'
import { signOut } from '../lib/auth'
import { createClient } from '../lib/supabase'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: active ? '#3ecf8e' : 'rgba(255,255,255,0.2)',
      boxShadow: active ? '0 0 6px rgba(62,207,142,0.5)' : 'none',
      flexShrink: 0,
    }} />
  )
}

function BookingBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending:   { bg: 'rgba(245,168,38,0.1)',  color: '#f5a826', border: 'rgba(245,168,38,0.3)',  label: 'Pending'   },
    confirmed: { bg: 'rgba(62,207,142,0.1)',  color: '#3ecf8e', border: 'rgba(62,207,142,0.3)',  label: 'Confirmed' },
    cancelled: { bg: 'rgba(212,95,114,0.1)',  color: '#d45f72', border: 'rgba(212,95,114,0.3)',  label: 'Cancelled' },
  }
  const s = map[status?.toLowerCase()] ?? map['pending']
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '3px 10px',
      borderRadius: '20px',
      background: s.bg,
      color: s.color,
      border: `0.5px solid ${s.border}`,
      fontFamily: 'var(--sans)',
    }}>
      {s.label}
    </span>
  )
}

function TrendIcon({ up }: { up?: boolean }) {
  if (up === undefined) return null
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
      {up ? (
        <path d="M2 9l3.5-3.5L8 8l3.5-3.5" stroke="#3ecf8e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M2 3l3.5 3.5L8 4l3.5 3.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  )
}

export default function DashboardPage() {
  const [user, setUser]             = useState<any>(null)
  const [profile, setProfile]       = useState<any>(null)
  const [listings, setListings]     = useState<any[]>([])
  const [bookings, setBookings]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft]     = useState<any>({})
  const [savingProfile, setSavingProfile]   = useState(false)
  const [editingListing, setEditingListing] = useState<any | null>(null)
  const [listingDraft, setListingDraft]     = useState<any>({})
  const [savingListing, setSavingListing]   = useState(false)
  const [boostingListing, setBoostingListing] = useState<any | null>(null)
  const [boostPlan, setBoostPlan]             = useState<'week' | 'month'>('month')
  const [boostLoading, setBoostLoading]       = useState(false)
  const [notification, setNotification]       = useState<string | null>(null)
  const [connectLoading, setConnectLoading]   = useState(false)
  const [connectLoginLoading, setConnectLoginLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      setUser(session.user)

      const [{ data: profile }, { data: listings }, { data: bookings }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('listings').select('*').eq('profile_id', session.user.id),
        supabase.from('bookings').select('*').or(`client_id.eq.${session.user.id},provider_id.eq.${session.user.id}`),
      ])

      setProfile(profile)
      setListings(listings || [])
      setBookings(bookings || [])
      setLoading(false)

      const params = new URLSearchParams(window.location.search)
      if (params.get('booking') === 'success') {
        setNotification('Booking confirmed! Payment received.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (params.get('boost') === 'success') {
        setNotification('✦ Your listing is now featured! It will appear at the top of results.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (params.get('connect') === 'success') {
        setNotification('✓ Stripe payouts connected! You\'ll receive payments directly.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (params.get('connect') === 'refresh') {
        // Re-trigger onboarding if the link expired
        setTimeout(() => handleConnectStripe(), 500)
        window.history.replaceState({}, '', '/dashboard')
      }

      if (localStorage.getItem('sx_show_connect_prompt') === '1') {
        localStorage.removeItem('sx_show_connect_prompt')
        if (!profile?.stripe_connect_account_id) {
          setNotification('🎉 Listing created! Connect Stripe to start receiving payments from bookings.')
        }
      }
    }
    load()
  }, [])

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  async function saveProfile() {
    setSavingProfile(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const updates: any = {
      full_name: profileDraft.full_name,
      bio: profileDraft.bio,
      availability: profileDraft.availability,
      city: profileDraft.city,
      country: profileDraft.country,
      phone: profileDraft.phone,
    }
    if (profileDraft.age) updates.age = parseInt(profileDraft.age) || null
    if (profileDraft.languages) updates.languages = profileDraft.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
    await supabase.from('profiles').update(updates).eq('id', session.user.id)
    setProfile((p: any) => ({ ...p, ...updates }))
    setEditingProfile(false)
    setSavingProfile(false)
  }

  async function saveListing() {
    if (!editingListing) return
    setSavingListing(true)
    const supabase = createClient()
    const updates: any = {
      title:      listingDraft.title,
      description: listingDraft.description,
      category:   listingDraft.category,
      city:       listingDraft.city,
      country:    listingDraft.country,
      meet_type:  listingDraft.meet_type,
      active:     listingDraft.active,
    }
    if (listingDraft.price_from !== '' && listingDraft.price_from !== undefined) updates.price_from = parseFloat(listingDraft.price_from) || null
    if (listingDraft.price_to !== '' && listingDraft.price_to !== undefined) updates.price_to = parseFloat(listingDraft.price_to) || null
    await supabase.from('listings').update(updates).eq('id', editingListing.id)
    setListings((prev: any[]) => prev.map(l => l.id === editingListing.id ? { ...l, ...updates } : l))
    setEditingListing(null)
    setSavingListing(false)
  }

  async function handleConnectStripe() {
    setConnectLoading(true)
    const res = await fetch('/api/connect/onboard', { method: 'POST' })
    const json = await res.json()
    if (json.url) { window.location.href = json.url }
    else { setConnectLoading(false) }
  }

  async function handleConnectDashboard() {
    setConnectLoginLoading(true)
    const res = await fetch('/api/connect/login', { method: 'POST' })
    const json = await res.json()
    if (json.url) { window.location.href = json.url }
    else { setConnectLoginLoading(false) }
  }

  async function startBoost() {
    if (!boostingListing) return
    setBoostLoading(true)
    const res = await fetch('/api/featured-boost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: boostingListing.id, plan: boostPlan }),
    })
    const json = await res.json()
    if (json.url) { window.location.href = json.url }
    else { setBoostLoading(false) }
  }

  const displayName: string = profile?.full_name || user?.email?.split('@')[0] || 'there'
  const initials = getInitials(profile?.full_name || user?.email || '')

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');`}</style>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '0.5px solid rgba(197,160,90,0.3)',
          borderTopColor: 'var(--gold, #c5a05a)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{
          color: 'var(--t3, rgba(255,255,255,0.2))',
          fontSize: '13px',
          fontFamily: 'var(--sans)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Loading
        </span>
      </div>
    </>
  )

  const recentBookings = bookings.slice(0, 5)
  const activeListings = listings.filter(l => l.active).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=Jost:wght@300;400;500;600&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg, #080808); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .db-nav-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t2, rgba(255,255,255,0.45));
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), color var(--t-base, 0.22s) var(--ease-out), background var(--t-base, 0.22s) var(--ease-out);
        }
        .db-nav-btn-ghost:hover {
          border-color: var(--b3, rgba(255,255,255,0.2));
          color: var(--t, #ece8e1);
          background: rgba(255,255,255,0.03);
        }

        .db-nav-btn-gold {
          background: var(--grad-gold, linear-gradient(135deg, #c5a05a 0%, #a0803d 100%));
          border: none;
          border-radius: var(--r, 8px);
          color: var(--t-on-gold, #080808);
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: var(--shadow-gold);
          transition: opacity var(--t-base, 0.22s) var(--ease-out), transform var(--t-fast, 0.15s) var(--ease-out);
          position: relative;
          overflow: hidden;
        }
        .db-nav-btn-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%);
          pointer-events: none;
        }
        .db-nav-btn-gold:hover { opacity: 0.88; transform: translateY(-1px); }

        .db-stat-card {
          background: var(--bg1, #111111);
          border: 0.5px solid var(--b, rgba(255,255,255,0.08));
          border-radius: var(--rl, 13px);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), transform var(--t-base, 0.22s) var(--ease-out);
        }
        .db-stat-card:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.35));
          transform: translateY(-2px);
        }

        .db-stat-eyebrow {
          font: 600 9px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--t3, rgba(255,255,255,0.28));
          margin-bottom: 4px;
        }

        .db-stat-number {
          font-family: var(--serif);
          font-size: 32px;
          font-weight: 500;
          color: var(--gold, #c5a05a);
          line-height: 1;
          letter-spacing: -0.01em;
        }

        .db-stat-caption {
          font: 300 11px/1 var(--sans);
          color: var(--t3, rgba(255,255,255,0.25));
          letter-spacing: 0.04em;
        }

        .db-card {
          background: var(--bg1, #111111);
          border: 0.5px solid var(--b, rgba(255,255,255,0.08));
          border-radius: var(--rl, 13px);
          padding: 1.625rem;
        }

        .db-listing-item {
          background: var(--bg1, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b, rgba(255,255,255,0.07));
          border-radius: var(--rl, 13px);
          padding: 1rem 1.125rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), background var(--t-base, 0.22s) var(--ease-out);
        }
        .db-listing-item:hover {
          border-color: var(--b3, rgba(255,255,255,0.12));
          background: var(--bg2, rgba(255,255,255,0.03));
        }

        .db-icon-btn {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--t2, rgba(255,255,255,0.4));
          font-size: 15px;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), color var(--t-fast, 0.15s) var(--ease-out), background var(--t-fast, 0.15s) var(--ease-out);
          flex-shrink: 0;
        }
        .db-icon-btn:hover {
          border-color: var(--gold, #c5a05a);
          color: var(--gold, #c5a05a);
          background: var(--gbg, rgba(197,160,90,0.07));
        }
        .db-icon-btn.danger:hover {
          border-color: rgba(226,83,107,0.5);
          color: var(--danger, #e2536b);
          background: rgba(226,83,107,0.07);
        }

        .db-edit-btn {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t2, rgba(255,255,255,0.35));
          padding: 5px 12px;
          cursor: pointer;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), color var(--t-fast, 0.15s) var(--ease-out);
          white-space: nowrap;
        }
        .db-edit-btn:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.35));
          color: var(--gold, #c5a05a);
        }

        .db-category-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 20px;
          background: var(--gbg, rgba(197,160,90,0.07));
          border: 0.5px solid var(--gbrd, rgba(197,160,90,0.2));
          color: var(--goldl, rgba(197,160,90,0.7));
          font: 500 11px/1 var(--sans);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .db-quick-btn-gold {
          background: var(--grad-gold, linear-gradient(135deg, #c5a05a 0%, #a0803d 100%));
          border: none;
          border-radius: var(--r, 8px);
          color: var(--t-on-gold, #080808);
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: var(--shadow-gold);
          transition: opacity var(--t-base, 0.22s) var(--ease-out), transform var(--t-fast, 0.15s) var(--ease-out);
          position: relative;
          overflow: hidden;
        }
        .db-quick-btn-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .db-quick-btn-gold:hover { opacity: 0.88; transform: translateY(-1px); }

        .db-quick-btn-dark {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t, #ece8e1);
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), color var(--t-base, 0.22s) var(--ease-out), background var(--t-base, 0.22s) var(--ease-out);
        }
        .db-quick-btn-dark:hover {
          border-color: var(--b3, rgba(255,255,255,0.2));
          color: var(--t, #ece8e1);
          background: rgba(255,255,255,0.04);
        }

        .db-section-title {
          font-family: var(--serif);
          font-size: 26px;
          font-weight: 500;
          color: var(--t, #ece8e1);
        }

        .db-section-label {
          font: 600 9px/1 var(--sans);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--t3, rgba(255,255,255,0.22));
        }

        .db-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 14px;
          text-align: center;
        }

        .db-booking-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.125rem;
          background: var(--bg1, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b, rgba(255,255,255,0.07));
          border-radius: var(--rl, 13px);
          transition: border-color var(--t-base, 0.22s) var(--ease-out);
        }
        .db-booking-row:hover { border-color: var(--b3, rgba(255,255,255,0.12)); }

        .db-status-pill-active {
          background: var(--tbg, rgba(38,212,160,0.1));
          color: var(--verified, #26d4a0);
          border: 0.5px solid rgba(38,212,160,0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .db-status-pill-paused {
          background: var(--gbg, rgba(197,160,90,0.1));
          color: var(--gold, #c5a05a);
          border: 0.5px solid rgba(197,160,90,0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .db-status-pill-inactive {
          background: var(--wbg, rgba(184,77,114,0.1));
          color: var(--wine, #b84d72);
          border: 0.5px solid rgba(184,77,114,0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .db-input {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, #0a0a0a);
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          font: 400 14px/1 var(--sans);
          width: 100%;
          outline: none;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), box-shadow var(--t-fast, 0.15s) var(--ease-out);
        }
        .db-input:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }

        .db-textarea {
          padding: 10px 14px;
          background: var(--bg3, #0a0a0a);
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          font: 400 14px/1.5 var(--sans);
          width: 100%;
          outline: none;
          resize: vertical;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), box-shadow var(--t-fast, 0.15s) var(--ease-out);
        }
        .db-textarea:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }

        .db-select {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, #0a0a0a);
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          font: 400 14px/1 var(--sans);
          width: 100%;
          outline: none;
          cursor: pointer;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), box-shadow var(--t-fast, 0.15s) var(--ease-out);
        }
        .db-select:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }

        @media (max-width: 640px) {
          .db-stats-grid { grid-template-columns: 1fr !important; }
          .db-quick-actions { flex-direction: column !important; }
          .db-quick-actions button { width: 100%; }
          .db-nav-right { gap: 6px !important; }
          .db-create-btn-label { display: none; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg, #080808)', color: 'var(--t, #ece8e1)' }}>

        {/* ── Notification banner ── */}
        {notification && (
          <div style={{
            background: 'var(--gbg, rgba(197,160,90,0.1))',
            border: '0.5px solid var(--gbrd, rgba(197,160,90,0.3))',
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            padding: '12px 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--gold, #c5a05a)', fontFamily: 'var(--sans)' }}>{notification}</span>
            <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'var(--gold, #c5a05a)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav style={{
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.07))',
          padding: '0 2rem',
          height: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          {/* Wordmark */}
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: '20px',
              fontWeight: 400,
              color: 'var(--gold, #c5a05a)',
              letterSpacing: '0.04em',
            }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
          </a>

          {/* Right side */}
          <div className="db-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Admin panel link */}
            {profile?.role === 'admin' && (
              <a
                href="/admin"
                style={{
                  color: 'var(--gold, rgba(197,160,90,0.65))',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--sans)',
                  fontWeight: 600,
                  padding: '3px 10px',
                  background: 'var(--gbg, rgba(197,160,90,0.1))',
                  border: '0.5px solid var(--gbrd, rgba(197,160,90,0.3))',
                  borderRadius: '20px',
                  transition: 'opacity 0.2s',
                }}
              >
                Admin
              </a>
            )}

            {/* Create listing */}
            <button
              className="db-nav-btn-gold"
              onClick={() => window.location.href = '/listings/create'}
            >
              <span>+ </span>
              <span className="db-create-btn-label">Create listing</span>
            </button>

            {/* Avatar initials */}
            <div
              title={displayName}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(197,160,90,0.2), rgba(197,160,90,0.08))',
                border: '0.5px solid var(--gbrd, rgba(197,160,90,0.35))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'default',
              }}
            >
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gold, #c5a05a)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                {initials}
              </span>
            </div>

            {/* Sign out */}
            <button className="db-nav-btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </nav>

        {/* ── Page content ── */}
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
          animation: 'fadeUp 0.4s ease',
        }}>

          {/* ── Hero greeting ── */}
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 300,
              color: 'var(--t, #ece8e1)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              marginBottom: '10px',
            }}>
              {getGreeting()},{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ color: 'var(--gold, #c5a05a)' }}>{displayName.split(' ')[0]}</span>
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  right: 0,
                  height: '0.5px',
                  background: 'linear-gradient(90deg, rgba(197,160,90,0.7), rgba(197,160,90,0.1))',
                }} />
              </span>
            </h1>
            <p style={{
              color: 'var(--t3, rgba(255,255,255,0.28))',
              fontSize: '13px',
              fontWeight: 300,
              letterSpacing: '0.04em',
              fontFamily: 'var(--sans)',
            }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {profile?.role && (
                <>
                  {' · '}
                  <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
                  {profile?.verified && (
                    <span style={{ marginLeft: '8px', color: 'var(--verified, #3ecf8e)', fontSize: '13px' }}>✓ Verified</span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* ── Stats row ── */}
          <div
            className="db-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            {[
              { label: 'Listings',  value: listings.length,         sub: `${activeListings} active`,         up: activeListings > 0 },
              { label: 'Bookings',  value: bookings.length,         sub: 'total bookings',                   up: bookings.length > 0 },
              { label: 'Messages',  value: 0,                        sub: 'unread',                           up: undefined },
              { label: 'Active',    value: activeListings,           sub: 'live listings',                    up: activeListings > 0 },
            ].map(stat => (
              <div key={stat.label} className="db-stat-card">
                <div className="db-stat-eyebrow">{stat.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="db-stat-number">
                    {stat.value}
                  </span>
                  <TrendIcon up={stat.up} />
                </div>
                <div className="db-stat-caption">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── Verification Card ── */}
          {(profile?.role === 'provider' || profile?.role === 'venue' || profile?.role === 'creator') && !profile?.verified && (
            <div className="db-card" style={{ marginBottom: '1.5rem', border: profile?.verification_status === 'pending' ? '0.5px solid rgba(245,168,38,0.3)' : '0.5px solid var(--gbrd, rgba(197,160,90,0.25))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(197,160,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-shield-check" style={{ color: 'var(--gold)', fontSize: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--t)', marginBottom: '3px' }}>
                      {profile?.verification_status === 'pending' ? 'Verification pending' : 'Get verified'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4 }}>
                      {profile?.verification_status === 'pending'
                        ? 'Our team is reviewing your profile. Usually within 24–48 hours.'
                        : 'Verified providers get a ✓ badge, appear higher in results, and earn more trust.'}
                    </div>
                  </div>
                </div>
                {profile?.verification_status !== 'pending' && (
                  <button
                    onClick={async () => {
                      const supabase = (await import('../lib/supabase')).createClient()
                      await supabase.from('profiles').update({ verification_status: 'pending', verification_requested_at: new Date().toISOString() }).eq('id', user.id)
                      setProfile((p: any) => ({ ...p, verification_status: 'pending' }))
                      setNotification('✓ Verification request submitted. We\'ll review your profile within 48 hours.')
                    }}
                    className="db-quick-btn-gold"
                  >
                    Request verification →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Stripe Payouts Card ── */}
          {(profile?.role === 'provider' || profile?.role === 'venue' || profile?.role === 'creator') && (
            <div className="db-card" style={{ marginBottom: '1.5rem', border: profile?.stripe_connect_account_id ? '0.5px solid rgba(62,207,142,0.2)' : '0.5px solid var(--gbrd, rgba(197,160,90,0.25))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: profile?.stripe_connect_account_id ? 'rgba(62,207,142,0.1)' : 'var(--gbg, rgba(197,160,90,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {profile?.stripe_connect_account_id ? (
                      <i className="ti ti-circle-check" style={{ color: 'var(--verified, #3ecf8e)', fontSize: '20px' }} aria-hidden="true" />
                    ) : (
                      <i className="ti ti-credit-card" style={{ color: 'var(--gold, #c5a05a)', fontSize: '20px' }} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--t, #ece8e1)', fontFamily: 'var(--sans)', marginBottom: '3px' }}>
                      {profile?.stripe_connect_account_id ? 'Payouts connected' : 'Set up payouts'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2, #8c8880)', fontFamily: 'var(--sans)', lineHeight: 1.4 }}>
                      {profile?.stripe_connect_account_id
                        ? 'You receive 85% of each booking. Platform fee: 15%.'
                        : 'Connect Stripe to receive payments from bookings. Takes 2 minutes.'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {profile?.stripe_connect_account_id ? (
                    <button
                      onClick={handleConnectDashboard}
                      disabled={connectLoginLoading}
                      style={{ padding: '8px 16px', background: 'transparent', border: '0.5px solid rgba(62,207,142,0.4)', borderRadius: 'var(--r, 8px)', color: 'var(--verified, #3ecf8e)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'var(--sans)' }}
                    >
                      {connectLoginLoading ? 'Opening…' : 'View Stripe dashboard →'}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      disabled={connectLoading}
                      className="db-quick-btn-gold"
                    >
                      {connectLoading ? 'Redirecting…' : 'Connect Stripe →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── My Listings ── */}
          <div className="db-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.375rem',
            }}>
              <span className="db-section-title">My listings</span>
              <button
                className="db-edit-btn"
                onClick={() => window.location.href = '/listings/create'}
                style={{
                  borderColor: 'var(--gbrd, rgba(197,160,90,0.25))',
                  color: 'var(--goldl, rgba(197,160,90,0.6))',
                }}
              >
                + New
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="db-empty-state">
                <i className="ti ti-clipboard-list" aria-hidden="true" style={{ fontSize: 48, color: 'var(--t3)', display: 'block', marginBottom: '1rem' }}></i>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: 'var(--t, #ece8e1)',
                  marginBottom: '4px',
                }}>
                  No listings yet
                </p>
                <p style={{
                  color: 'var(--t3, rgba(255,255,255,0.28))',
                  fontSize: '13px',
                  fontWeight: 300,
                  fontFamily: 'var(--sans)',
                  letterSpacing: '0.03em',
                }}>
                  Create your first listing to start receiving bookings.
                </p>
                <button
                  className="db-quick-btn-gold"
                  onClick={() => window.location.href = '/listings/create'}
                  style={{ marginTop: '4px' }}
                >
                  Create a listing
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {listings.map(listing => (
                  <div key={listing.id} className="db-listing-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--serif)',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: 'var(--t, #ece8e1)',
                          letterSpacing: '0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {listing.title}
                        </span>
                        {listing.category && (
                          <span className="db-category-pill">{listing.category}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {listing.city && (
                          <span style={{
                            fontSize: '13px',
                            color: 'var(--t3, rgba(255,255,255,0.28))',
                            fontFamily: 'var(--sans)',
                            fontWeight: 300,
                          }}>
                            {listing.city}
                          </span>
                        )}
                        {(listing.price_min || listing.price_max) && (
                          <span style={{
                            fontSize: '13px',
                            color: 'var(--goldl, rgba(197,160,90,0.5))',
                            fontFamily: 'var(--sans)',
                            fontWeight: 300,
                          }}>
                            {listing.price_min && listing.price_max
                              ? `$${listing.price_min} – $${listing.price_max}`
                              : listing.price_min
                              ? `from $${listing.price_min}`
                              : `up to $${listing.price_max}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {listing.featured_until && new Date(listing.featured_until) > new Date() && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', fontFamily: 'var(--sans)', fontWeight: 500 }}>
                          ✦ Featured · {new Date(listing.featured_until).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                        </span>
                      )}
                      {listing.verified && (
                        <span className="db-status-pill-active">
                          ✓ Verified
                        </span>
                      )}
                      <span className={listing.active ? 'db-status-pill-active' : 'db-status-pill-inactive'}>
                        {listing.active ? 'Live' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => { setBoostPlan('month'); setBoostingListing(listing) }}
                        style={{ padding: '5px 12px', borderRadius: 'var(--r, 8px)', border: '0.5px solid var(--gbrd, rgba(197,160,90,0.4))', background: 'transparent', color: 'var(--gold, #c5a05a)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'var(--sans)', letterSpacing: '0.04em', transition: 'all .15s' }}
                        onMouseOver={e => { (e.target as HTMLElement).style.background = 'var(--gbg, rgba(197,160,90,0.1))' }}
                        onMouseOut={e => { (e.target as HTMLElement).style.background = 'transparent' }}
                      >✦ Boost</button>
                      <button
                        className="db-icon-btn"
                        title="Edit listing"
                        onClick={() => { setListingDraft({ title: listing.title || '', description: listing.description || '', category: listing.category || '', city: listing.city || '', country: listing.country || '', price_from: listing.price_from ?? '', price_to: listing.price_to ?? '', meet_type: listing.meet_type || '', active: listing.active ?? true }); setEditingListing(listing) }}
                      >
                        <i className="ti ti-edit" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent Bookings ── */}
          <div className="db-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.375rem' }}>
              <span className="db-section-title">Recent bookings</span>
            </div>

            {recentBookings.length === 0 ? (
              <div className="db-empty-state">
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: '22px', color: 'var(--gold)' }} />
                </div>
                <p style={{
                  color: 'var(--t3, rgba(255,255,255,0.28))',
                  fontSize: '13px',
                  fontWeight: 300,
                  fontFamily: 'var(--sans)',
                  letterSpacing: '0.03em',
                }}>
                  No bookings yet. Once clients book your listings they will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentBookings.map((booking, i) => (
                  <div key={booking.id ?? i} className="db-booking-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--serif)',
                        fontSize: '15px',
                        fontWeight: 400,
                        color: 'var(--t, #ece8e1)',
                        marginBottom: '3px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {booking.listing_title || booking.listing_id || 'Booking'}
                      </div>
                      {booking.created_at && (
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--t3, rgba(255,255,255,0.25))',
                          fontFamily: 'var(--sans)',
                          fontWeight: 300,
                        }}>
                          {new Date(booking.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                    <BookingBadge status={booking.status ?? 'pending'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick Actions ── */}
          <div className="db-card">
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="db-section-title">Quick actions</span>
            </div>
            <div
              className="db-quick-actions"
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
            >
              <button
                className="db-quick-btn-gold"
                onClick={() => window.location.href = '/listings/create'}
              >
                + Create listing
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/messages'}
              >
                View messages
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/'}
              >
                Browse platform
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => { setProfileDraft({ full_name: profile?.full_name || '', bio: profile?.bio || '', availability: profile?.availability || '', city: profile?.city || '', country: profile?.country || '', phone: profile?.phone || '', age: profile?.age || '', languages: (profile?.languages || []).join(', ') }); setEditingProfile(true) }}
              >
                Edit profile
              </button>
              {profile?.role && profile.role !== 'user' && (
                <button
                  className="db-quick-btn-dark"
                  onClick={() => window.location.href = `/profile/${user?.id}`}
                >
                  View public profile
                </button>
              )}
              {(profile?.role === 'provider' || profile?.role === 'creator' || profile?.role === 'venue') && (
                <button
                  className="db-quick-btn-gold"
                  onClick={() => window.location.href = '/provider'}
                >
                  Provider Hub →
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Listing edit modal ── */}
      {editingListing && (
        <div onClick={() => setEditingListing(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg1, #111)',border:'0.5px solid var(--b3, rgba(197,160,90,0.25))',borderRadius:'var(--rxl, 20px)',padding:'2rem',width:'100%',maxWidth:'520px',maxHeight:'90vh',overflowY:'auto',boxShadow:'var(--shadow-modal)' }}>
            <div style={{ fontFamily:'var(--serif)',fontSize:'22px',fontWeight:500,color:'var(--t, #ece8e1)',marginBottom:'1.5rem' }}>Edit Listing</div>
            {[
              { label:'Title', key:'title', type:'text', placeholder:'Listing title' },
              { label:'City', key:'city', type:'text', placeholder:'e.g. Brussels' },
              { label:'Country', key:'country', type:'text', placeholder:'e.g. Belgium' },
              { label:'Price from (€)', key:'price_from', type:'number', placeholder:'e.g. 150' },
              { label:'Price to (€, optional)', key:'price_to', type:'number', placeholder:'e.g. 300' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>{f.label}</label>
                <input type={f.type} value={listingDraft[f.key] ?? ''} onChange={e => setListingDraft((d: any) => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="db-input" />
              </div>
            ))}
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Category</label>
              <select value={listingDraft.category || ''} onChange={e => setListingDraft((d: any) => ({ ...d, category: e.target.value }))}
                className="db-select">
                {['escorts','massage','companionship','domination','adult','creators','nightlife','experiences','rentals','events','photo','memberships'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Meet type</label>
              <select value={listingDraft.meet_type || ''} onChange={e => setListingDraft((d: any) => ({ ...d, meet_type: e.target.value }))}
                className="db-select">
                <option value="incall">Incall</option>
                <option value="outcall">Outcall</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Description</label>
              <textarea value={listingDraft.description || ''} onChange={e => setListingDraft((d: any) => ({ ...d, description: e.target.value }))} rows={4}
                className="db-textarea" />
            </div>
            <div style={{ marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'10px' }}>
              <input type="checkbox" id="listingActive" checked={!!listingDraft.active} onChange={e => setListingDraft((d: any) => ({ ...d, active: e.target.checked }))} style={{ accentColor:'var(--gold, #c5a05a)',width:'16px',height:'16px',cursor:'pointer' }} />
              <label htmlFor="listingActive" style={{ fontSize:'13px',color:'var(--t, #ece8e1)',cursor:'pointer',fontFamily:'var(--sans)' }}>Listing is active and visible to clients</label>
            </div>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={() => setEditingListing(null)} className="db-quick-btn-dark">Cancel</button>
              <button onClick={saveListing} disabled={savingListing} className="db-quick-btn-gold">{savingListing ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile edit modal ── */}
      {editingProfile && (
        <div onClick={() => setEditingProfile(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg1, #111)',border:'0.5px solid var(--b3, rgba(197,160,90,0.25))',borderRadius:'var(--rxl, 20px)',padding:'2rem',width:'100%',maxWidth:'480px',maxHeight:'90vh',overflowY:'auto',boxShadow:'var(--shadow-modal)' }}>
            <div style={{ fontFamily:'var(--serif)',fontSize:'22px',fontWeight:500,color:'var(--t, #ece8e1)',marginBottom:'1.5rem' }}>Edit Profile</div>
            {[
              { label:'Full name', key:'full_name', type:'text', placeholder:'Your name' },
              { label:'City', key:'city', type:'text', placeholder:'e.g. Brussels' },
              { label:'Country', key:'country', type:'text', placeholder:'e.g. Belgium' },
              { label:'Age', key:'age', type:'number', placeholder:'Your age' },
              { label:'Phone (optional)', key:'phone', type:'text', placeholder:'+32 ...' },
              { label:'Languages (comma-separated)', key:'languages', type:'text', placeholder:'English, French, Dutch' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>{f.label}</label>
                <input type={f.type} value={profileDraft[f.key] || ''} onChange={e => setProfileDraft((d: any) => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="db-input" />
              </div>
            ))}
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Bio</label>
              <textarea value={profileDraft.bio || ''} onChange={e => setProfileDraft((d: any) => ({ ...d, bio: e.target.value }))} placeholder="Tell clients about yourself…" rows={4}
                className="db-textarea" />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Availability</label>
              <input type="text" value={profileDraft.availability || ''} onChange={e => setProfileDraft((d: any) => ({ ...d, availability: e.target.value }))} placeholder="e.g. Mon–Fri 10:00–22:00, weekends on request"
                className="db-input" />
              <div style={{ fontSize:'11px',color:'var(--t3, #4c4a47)',marginTop:'4px',fontFamily:'var(--sans)' }}>Shown on your public profile</div>
            </div>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={() => setEditingProfile(false)} className="db-quick-btn-dark">Cancel</button>
              <button onClick={saveProfile} disabled={savingProfile} className="db-quick-btn-gold">{savingProfile ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Boost listing modal ── */}
      {boostingListing && (
        <div onClick={() => setBoostingListing(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg1, #0f0f0f)',border:'0.5px solid var(--b3, rgba(197,160,90,0.2))',borderRadius:'var(--rxl, 20px)',padding:'2rem',width:'100%',maxWidth:'440px',fontFamily:'var(--sans)',boxShadow:'var(--shadow-modal)' }}>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'var(--serif)',fontSize:'22px',color:'var(--gold, #c5a05a)',fontWeight:500,marginBottom:'6px' }}>✦ Boost Listing</div>
              <div style={{ fontSize:'13px',color:'var(--t2, #8c8880)',lineHeight:1.5 }}>Feature <strong style={{ color:'var(--t, #ece8e1)' }}>{boostingListing.title}</strong> at the top of search results.</div>
            </div>
            <div style={{ display:'flex',gap:'10px',marginBottom:'1.5rem' }}>
              {([
                { key:'week',  label:'7 Days',  price:'€29', note:'Quick boost' },
                { key:'month', label:'30 Days', price:'€79', note:'Best value' },
              ] as const).map(p => (
                <div key={p.key} onClick={() => setBoostPlan(p.key)} style={{ flex:1,padding:'1rem',borderRadius:'var(--rl, 13px)',border:`0.5px solid ${boostPlan===p.key?'var(--gbrd, rgba(197,160,90,0.6))':'var(--b2, rgba(255,255,255,0.08))'}`,background:boostPlan===p.key?'var(--gbg, rgba(197,160,90,0.07))':'var(--bg2, transparent)',cursor:'pointer',textAlign:'center',transition:'all var(--t-fast, .15s) var(--ease-out)' }}>
                  <div style={{ fontSize:'13px',color:'var(--t2, #8c8880)',marginBottom:'4px' }}>{p.label}</div>
                  <div style={{ fontSize:'22px',fontFamily:'var(--serif)',color:'var(--gold, #c5a05a)',fontWeight:400 }}>{p.price}</div>
                  <div style={{ fontSize:'11px',color:'var(--t3, #4c4a47)',marginTop:'3px' }}>{p.note}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--gbg, rgba(197,160,90,0.06))',border:'0.5px solid var(--gbrd, rgba(197,160,90,0.15))',borderRadius:'var(--r, 8px)',padding:'0.875rem 1rem',marginBottom:'1.5rem',fontSize:'12px',color:'var(--t2, #8c8880)',lineHeight:1.6 }}>
              Your listing will appear at the top of all search results and category pages with a ✦ Featured badge for the selected duration.
            </div>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={() => setBoostingListing(null)} className="db-quick-btn-dark">Cancel</button>
              <button onClick={startBoost} disabled={boostLoading} className="db-quick-btn-gold">{boostLoading ? 'Redirecting…' : `Boost for ${boostPlan==='week'?'€29':'€79'}`}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
