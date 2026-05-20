'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ─── Types ─────────────────────────────────────────────── */

interface ProviderRequest {
  id: string
  sender_id: string
  receiver_id: string
  listing_id: string | null
  body: string
  created_at: string
  read: boolean
}

interface Booking {
  id: string
  listing_id: string | null
  client_id: string
  provider_id: string
  status: string
  date: string
  duration_hours: number
  total_amount: number
  currency: string
  notes: string | null
  created_at: string
}

/* ─── Helpers ───────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtDate(str: string): string {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getMonthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split('-')
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

/* ─── Calendar helpers ──────────────────────────────────── */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  // Monday = 0
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

/* ─── Status badge ──────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    pending:   { bg: 'rgba(245,168,38,0.1)',  color: '#f5a826', border: 'rgba(245,168,38,0.3)'  },
    confirmed: { bg: 'rgba(62,207,142,0.1)',  color: '#3ecf8e', border: 'rgba(62,207,142,0.3)'  },
    cancelled: { bg: 'rgba(212,95,114,0.1)',  color: '#d45f72', border: 'rgba(212,95,114,0.3)'  },
    completed: { bg: 'rgba(120,120,200,0.1)', color: '#9090e8', border: 'rgba(120,120,200,0.3)' },
  }
  const s = map[status?.toLowerCase()] ?? map['pending']
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px',
      background: s.bg, color: s.color, border: `0.5px solid ${s.border}`,
      fontFamily: 'var(--sans, "Jost", sans-serif)', flexShrink: 0,
    }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  )
}

/* ─── Page ──────────────────────────────────────────────── */

export default function ProviderHubPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState<'requests' | 'bookings' | 'earnings' | 'availability'>('requests')
  const [loading, setLoading] = useState(true)

  // Requests
  const [requests, setRequests] = useState<ProviderRequest[]>([])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([])
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null)

  // Availability
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [availNotes, setAvailNotes] = useState('')
  const [savingAvail, setSavingAvail] = useState(false)
  const [availSaved, setAvailSaved] = useState(false)

  /* ── Init ── */
  useEffect(() => {
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        window.location.href = '/login?next=/provider'
        return
      }
      setUserId(user.id)

      const [
        { data: msgs },
        { data: bkgs },
        { data: prof },
      ] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', user.id)
          .not('listing_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('bookings')
          .select('*')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('profiles')
          .select('availability')
          .eq('id', user.id)
          .single(),
      ])

      setRequests((msgs as ProviderRequest[]) || [])
      setBookings((bkgs as Booking[]) || [])

      if (prof?.availability) {
        try {
          const parsed = JSON.parse(prof.availability)
          const avail: { blocked?: string[]; notes?: string } = (parsed && typeof parsed === 'object')
            ? parsed
            : { blocked: [], notes: '' }
          setBlockedDates(Array.isArray(avail.blocked) ? avail.blocked : [])
          setAvailNotes(typeof avail.notes === 'string' ? avail.notes : '')
        } catch {
          // legacy plain text or malformed JSON — default to empty
          setBlockedDates([])
          setAvailNotes(typeof prof.availability === 'string' ? prof.availability : '')
        }
      }

      setLoading(false)
    }
    init()
  }, [])

  /* ── Mark booking confirmed from request ── */
  async function confirmFromRequest(req: ProviderRequest) {
    if (!userId || confirmingId) return
    setConfirmingId(req.id)
    await supabase.from('bookings').insert({
      listing_id: req.listing_id,
      client_id: req.sender_id,
      provider_id: userId,
      status: 'confirmed',
      date: new Date().toISOString().slice(0, 10),
      duration_hours: 1,
      total_amount: 0,
      currency: 'EUR',
      notes: req.body,
    })
    // Refresh bookings
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    setBookings((data as Booking[]) || [])
    setConfirmingId(null)
  }

  /* ── Update booking status ── */
  async function updateBookingStatus(id: string, status: string) {
    if (updatingBooking) return
    setUpdatingBooking(id)
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    setUpdatingBooking(null)
  }

  /* ── Save availability ── */
  async function saveAvailability() {
    if (!userId || savingAvail) return
    setSavingAvail(true)
    const availData = JSON.stringify({ blocked: blockedDates, notes: availNotes })
    await supabase.from('profiles').update({ availability: availData }).eq('id', userId)
    setSavingAvail(false)
    setAvailSaved(true)
    setTimeout(() => setAvailSaved(false), 2000)
  }

  /* ── Toggle blocked date ── */
  function toggleDate(dateStr: string) {
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    )
  }

  /* ── Earnings calc ── */
  const earnedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
  const totalEarned = earnedBookings.reduce((s, b) => s + (b.total_amount || 0), 0)
  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`
  const thisMonthEarned = earnedBookings.filter(b => getMonthKey(b.created_at) === thisMonthKey).reduce((s, b) => s + (b.total_amount || 0), 0)
  const lastMonthEarned = earnedBookings.filter(b => getMonthKey(b.created_at) === lastMonthKey).reduce((s, b) => s + (b.total_amount || 0), 0)

  // Monthly totals for bar chart
  const monthlyMap: Record<string, number> = {}
  earnedBookings.forEach(b => {
    const k = getMonthKey(b.created_at)
    monthlyMap[k] = (monthlyMap[k] || 0) + (b.total_amount || 0)
  })
  const monthlyKeys = Object.keys(monthlyMap).sort().slice(-6)
  const maxMonthly = Math.max(...monthlyKeys.map(k => monthlyMap[k]), 1)

  /* ── Calendar grid — 3 months ── */
  const calMonths: { year: number; month: number }[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    calMonths.push({ year: d.getFullYear(), month: d.getMonth() })
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg, #050505)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500;600&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '0.5px solid rgba(197,160,90,0.3)', borderTopColor: '#c5a05a', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', fontFamily: 'var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</span>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg, #050505); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ph-tab-pill {
          padding: 8px 20px;
          border-radius: 20px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ph-tab-pill:hover { border-color: rgba(197,160,90,0.35); color: rgba(197,160,90,0.7); }
        .ph-tab-pill.active {
          background: linear-gradient(135deg, #c5a05a 0%, #a0803d 100%);
          border-color: transparent;
          color: #080808;
        }

        .ph-card {
          background: var(--bg1, #111111);
          border: 0.5px solid var(--b, rgba(255,255,255,0.08));
          border-radius: var(--rl, 13px);
          padding: 1.25rem 1.5rem;
          transition: border-color 0.2s;
        }
        .ph-card:hover { border-color: rgba(255,255,255,0.12); }

        .ph-action-btn {
          padding: 7px 14px;
          border-radius: var(--r, 8px);
          border: 0.5px solid rgba(197,160,90,0.35);
          background: transparent;
          color: #c5a05a;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ph-action-btn:hover { background: rgba(197,160,90,0.08); border-color: rgba(197,160,90,0.6); }
        .ph-action-btn:disabled { opacity: 0.4; cursor: default; }

        .ph-action-btn-danger {
          padding: 7px 14px;
          border-radius: var(--r, 8px);
          border: 0.5px solid rgba(212,95,114,0.3);
          background: transparent;
          color: #d45f72;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ph-action-btn-danger:hover { background: rgba(212,95,114,0.07); border-color: rgba(212,95,114,0.6); }
        .ph-action-btn-danger:disabled { opacity: 0.4; cursor: default; }

        .ph-action-btn-green {
          padding: 7px 14px;
          border-radius: var(--r, 8px);
          border: 0.5px solid rgba(62,207,142,0.3);
          background: transparent;
          color: #3ecf8e;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ph-action-btn-green:hover { background: rgba(62,207,142,0.07); border-color: rgba(62,207,142,0.6); }
        .ph-action-btn-green:disabled { opacity: 0.4; cursor: default; }

        .ph-gold-btn {
          padding: 11px 24px;
          border-radius: var(--r, 8px);
          border: none;
          background: linear-gradient(135deg, #c5a05a 0%, #a0803d 100%);
          color: #080808;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .ph-gold-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%); pointer-events: none; }
        .ph-gold-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .ph-gold-btn:disabled { opacity: 0.4; cursor: default; }

        .ph-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: var(--r, 8px);
          color: var(--t, #ece8e1);
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ph-input:focus { border-color: rgba(197,160,90,0.5); box-shadow: 0 0 0 3px rgba(197,160,90,0.08); }
        .ph-input::placeholder { color: rgba(255,255,255,0.2); }

        .ph-day-box {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: 0.5px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s;
          user-select: none;
        }
        .ph-day-box:hover { border-color: rgba(197,160,90,0.4); }
        .ph-day-box.available { background: rgba(62,207,142,0.07); color: rgba(62,207,142,0.7); border-color: rgba(62,207,142,0.2); }
        .ph-day-box.blocked { background: rgba(212,95,114,0.1); color: rgba(212,95,114,0.6); border-color: rgba(212,95,114,0.25); }
        .ph-day-box.empty { pointer-events: none; opacity: 0; }
        .ph-day-box.today { box-shadow: 0 0 0 1.5px rgba(197,160,90,0.5); }

        .ph-stat-card {
          background: var(--bg1, #111);
          border: 0.5px solid var(--b, rgba(255,255,255,0.08));
          border-radius: var(--rl, 13px);
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ph-bar-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ph-bar-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ph-bar-label {
          width: 48px;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
          text-align: right;
        }
        .ph-bar-track {
          flex: 1;
          height: 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 4px;
          overflow: hidden;
        }
        .ph-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #c5a05a, #a0803d);
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        .ph-bar-amount {
          width: 56px;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          color: rgba(197,160,90,0.7);
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .ph-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .ph-cal-row { gap: 4px !important; }
          .ph-day-box { width: 30px !important; height: 30px !important; font-size: 11px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', color: 'var(--t, #ece8e1)' }}>

        {/* ── Nav ── */}
        <nav style={{
          background: 'rgba(5,5,5,0.95)',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          height: '60px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--serif, "Cormorant Garamond", serif)', fontSize: '20px', fontWeight: 400, color: '#c5a05a', letterSpacing: '0.04em' }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/messages" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontFamily: 'var(--sans)', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
              Messages
            </a>
            <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontFamily: 'var(--sans)', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
              Dashboard
            </a>
          </div>
        </nav>

        {/* ── Page body ── */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 6rem', animation: 'fadeUp 0.35s ease' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontFamily: 'var(--serif, "Cormorant Garamond", serif)', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 300, color: 'var(--t, #ece8e1)', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '8px' }}>
              Provider Hub
            </h1>
            <p style={{ fontFamily: 'var(--sans, "Jost", sans-serif)', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300, letterSpacing: '0.03em' }}>
              Manage your requests, bookings, earnings and availability.
            </p>
          </div>

          {/* ── Tab pills ── */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {(['requests', 'bookings', 'earnings', 'availability'] as const).map(t => (
              <button
                key={t}
                className={`ph-tab-pill${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'requests' && requests.length > 0 && (
                  <span style={{ marginLeft: '6px', background: tab === t ? 'rgba(0,0,0,0.2)' : 'rgba(197,160,90,0.15)', color: tab === t ? '#080808' : '#c5a05a', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: 600 }}>
                    {requests.length}
                  </span>
                )}
                {t === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span style={{ marginLeft: '6px', background: tab === t ? 'rgba(0,0,0,0.2)' : 'rgba(245,168,38,0.15)', color: tab === t ? '#080808' : '#f5a826', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: 600 }}>
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* Tab: Requests                                       */}
          {/* ═══════════════════════════════════════════════════ */}
          {tab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 300 }}>
                  <div style={{ fontSize: '40px', marginBottom: '1rem', opacity: 0.3 }}>◈</div>
                  No booking requests yet. Requests from clients will appear here.
                </div>
              ) : requests.map(req => (
                <div key={req.id} className="ph-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Sender info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: 'var(--serif)', fontSize: '16px', color: 'rgba(197,160,90,0.7)',
                      }}>
                        {req.sender_id.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--t)', fontWeight: 400 }}>
                          Client {req.sender_id.slice(0, 8)}…
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--sans)', fontWeight: 300 }}>
                          {timeAgo(req.created_at)}
                          {req.listing_id && (
                            <span style={{ marginLeft: '8px', color: 'rgba(197,160,90,0.5)' }}>
                              · re: listing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message preview */}
                  <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.65, margin: 0, background: 'rgba(255,255,255,0.025)', borderRadius: '8px', padding: '10px 12px' }}>
                    {req.body.slice(0, 120)}{req.body.length > 120 ? '…' : ''}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                      href={`/messages?provider_id=${req.sender_id}`}
                      style={{
                        display: 'inline-block',
                        padding: '7px 14px',
                        borderRadius: 'var(--r, 8px)',
                        border: '0.5px solid rgba(255,255,255,0.12)',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--sans)',
                        fontSize: '12px',
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
                    >
                      Reply →
                    </a>
                    <button
                      className="ph-action-btn-green"
                      onClick={() => confirmFromRequest(req)}
                      disabled={confirmingId === req.id}
                    >
                      {confirmingId === req.id ? 'Confirming…' : 'Mark booking confirmed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* Tab: Bookings                                       */}
          {/* ═══════════════════════════════════════════════════ */}
          {tab === 'bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 300 }}>
                  <div style={{ fontSize: '40px', marginBottom: '1rem', opacity: 0.3 }}>◳</div>
                  No bookings yet. Confirmed bookings will appear here.
                </div>
              ) : bookings.map(bk => (
                <div key={bk.id} className="ph-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <StatusBadge status={bk.status} />
                        <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                          {fmtDate(bk.date)} · {bk.duration_hours}h
                        </span>
                        {bk.total_amount > 0 && (
                          <span style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: '#c5a05a' }}>
                            €{bk.total_amount}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                        Client: {bk.client_id.slice(0, 12)}…
                      </div>
                      {bk.notes && (
                        <div style={{ marginTop: '6px', fontFamily: 'var(--sans)', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 300, lineHeight: 1.5, fontStyle: 'italic' }}>
                          "{bk.notes.slice(0, 100)}{bk.notes.length > 100 ? '…' : ''}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {bk.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="ph-action-btn-green"
                        onClick={() => updateBookingStatus(bk.id, 'confirmed')}
                        disabled={updatingBooking === bk.id}
                      >
                        {updatingBooking === bk.id ? 'Updating…' : 'Confirm'}
                      </button>
                      <button
                        className="ph-action-btn-danger"
                        onClick={() => updateBookingStatus(bk.id, 'cancelled')}
                        disabled={updatingBooking === bk.id}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {bk.status === 'confirmed' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="ph-action-btn"
                        onClick={() => updateBookingStatus(bk.id, 'completed')}
                        disabled={updatingBooking === bk.id}
                      >
                        {updatingBooking === bk.id ? 'Updating…' : 'Mark complete'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* Tab: Earnings                                       */}
          {/* ═══════════════════════════════════════════════════ */}
          {tab === 'earnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Stats grid */}
              <div className="ph-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Earned', value: `€${totalEarned.toFixed(2)}`, sub: 'all time' },
                  { label: 'This Month', value: `€${thisMonthEarned.toFixed(2)}`, sub: new Date().toLocaleDateString('en-GB', { month: 'long' }) },
                  { label: 'Last Month', value: `€${lastMonthEarned.toFixed(2)}`, sub: new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString('en-GB', { month: 'long' }) },
                  { label: 'Bookings', value: earnedBookings.length, sub: 'confirmed/completed' },
                ].map(s => (
                  <div key={s.label} className="ph-stat-card">
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '4px' }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 500, color: '#c5a05a', lineHeight: 1, letterSpacing: '-0.01em' }}>
                      {s.value}
                    </div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 300, letterSpacing: '0.03em' }}>
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="ph-card">
                <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem' }}>
                  Monthly Earnings
                </div>
                {monthlyKeys.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 300, fontStyle: 'italic' }}>
                    No earnings data yet.
                  </div>
                ) : (
                  <div className="ph-bar-wrap">
                    {monthlyKeys.map(k => (
                      <div key={k} className="ph-bar-row">
                        <div className="ph-bar-label">{getMonthLabel(k)}</div>
                        <div className="ph-bar-track">
                          <div
                            className="ph-bar-fill"
                            style={{ width: `${(monthlyMap[k] / maxMonthly) * 100}%` }}
                          />
                        </div>
                        <div className="ph-bar-amount">€{monthlyMap[k].toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* Tab: Availability                                   */}
          {/* ═══════════════════════════════════════════════════ */}
          {tab === 'availability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(62,207,142,0.07)', border: '0.5px solid rgba(62,207,142,0.2)' }} />
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(212,95,114,0.1)', border: '0.5px solid rgba(212,95,114,0.25)' }} />
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Blocked</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid rgba(197,160,90,0.5)' }} />
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Today</span>
                </div>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                  Click a day to toggle
                </span>
              </div>

              {/* 3-month calendar */}
              {calMonths.map(({ year, month }) => {
                const daysInMonth = getDaysInMonth(year, month)
                const firstDay = getFirstDayOfWeek(year, month)
                const monthName = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                const todayStr = now.toISOString().slice(0, 10)

                return (
                  <div key={`${year}-${month}`} className="ph-card">
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 400, color: 'var(--t)', marginBottom: '1rem' }}>
                      {monthName}
                    </div>

                    {/* Weekday headers */}
                    <div className="ph-cal-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: '6px', marginBottom: '6px' }}>
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                        <div key={d} style={{ width: '36px', textAlign: 'center', fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Days grid */}
                    <div className="ph-cal-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: '6px' }}>
                      {/* Empty offset cells */}
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="ph-day-box empty" />
                      ))}
                      {/* Day cells */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isBlocked = blockedDates.includes(dateStr)
                        const isToday = dateStr === todayStr

                        return (
                          <div
                            key={dateStr}
                            className={`ph-day-box${isBlocked ? ' blocked' : ' available'}${isToday ? ' today' : ''}`}
                            onClick={() => toggleDate(dateStr)}
                            title={isBlocked ? 'Blocked — click to unblock' : 'Available — click to block'}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Availability notes */}
              <div className="ph-card">
                <label style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.6)', marginBottom: '10px' }}>
                  General Availability Notes
                </label>
                <input
                  type="text"
                  className="ph-input"
                  value={availNotes}
                  onChange={e => setAvailNotes(e.target.value)}
                  placeholder="e.g. Available evenings and weekends, Mon–Sat 10:00–22:00…"
                />
                <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '6px', fontWeight: 300 }}>
                  Shown on your public profile.
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  className="ph-gold-btn"
                  onClick={saveAvailability}
                  disabled={savingAvail}
                >
                  {savingAvail ? 'Saving…' : 'Save Availability'}
                </button>
                {availSaved && (
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#3ecf8e', fontWeight: 400 }}>
                    ✓ Saved
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
