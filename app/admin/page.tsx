'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'

const TABS = ['Listings', 'Users', 'Verification', 'Bookings', 'Newsletter'] as const
type Tab = typeof TABS[number]

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState<Tab>('Listings')
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [stats, setStats] = useState({ listings: 0, users: 0, bookings: 0, revenue: 0, providers: 0, pendingListings: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verifWorking, setVerifWorking] = useState<string | null>(null)
  const [verifMsg, setVerifMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null)
  const [nlSubject, setNlSubject]     = useState('')
  const [nlBody, setNlBody]           = useState('')
  const [nlSending, setNlSending]     = useState(false)
  const [nlResult, setNlResult]       = useState<string | null>(null)
  const [nlSubCount, setNlSubCount]   = useState<number | null>(null)

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') { window.location.href = '/'; return }
      setIsAdmin(true)
      const [lr, ur, br, vr, nlr] = await Promise.all([
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, listings(title)').order('created_at', { ascending: false }),
        supabase.from('identity_verifications').select('*, profiles(full_name, username, email, role)').order('submitted_at', { ascending: false }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      ])
      setNlSubCount(nlr.count ?? 0)
      const ls = lr.data || [], us = ur.data || [], bs = br.data || []
      // Attach profile data to listings client-side (avoids PostgREST embedded join issues)
      const profileMap = Object.fromEntries(us.map((u: any) => [u.id, u]))
      const lsWithProfiles = ls.map((l: any) => ({ ...l, profiles: profileMap[l.profile_id] || null }))
      setVerifications(vr.data || [])
      const revenue = bs.filter((b: any) => b.status === 'confirmed').reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
      setListings(lsWithProfiles); setUsers(us); setBookings(bs)
      const providers = us.filter((u: any) => ['provider','venue','creator'].includes(u.role)).length
      const pendingListings = lsWithProfiles.filter((l: any) => !l.active).length
      setStats({ listings: lsWithProfiles.length, users: us.length, bookings: bs.length, revenue, providers, pendingListings })
      setLoading(false)

      // Real-time: reflect new listings, profile changes, and new verifications
      channel = supabase
        .channel('admin-watch')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, payload => {
          setListings(prev => [payload.new, ...prev])
          setStats(s => ({ ...s, listings: s.listings + 1, pendingListings: s.pendingListings + (!payload.new.active ? 1 : 0) }))
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listings' }, payload => {
          setListings(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l))
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
          setUsers(prev => prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u))
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, payload => {
          setUsers(prev => [payload.new, ...prev])
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'identity_verifications' }, payload => {
          setVerifications(prev => [payload.new, ...prev])
        })
        .subscribe()
    }
    init()
    return () => { channel?.unsubscribe() }
  }, [])

  async function toggleListing(id: string, field: string, current: boolean) {
    const supabase = createClient()
    const update: Record<string, unknown> = { [field]: !current }
    // Keep status in sync with active state
    if (field === 'active') update.status = !current ? 'approved' : 'pending'
    await supabase.from('listings').update(update).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...update } : l))
    if (field === 'active') {
      fetch('/api/admin/listing-moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, action: current ? 'reject' : 'approve' }),
      }).catch(() => {})
    }
  }

  async function featureListing(id: string, days: number) {
    const supabase = createClient()
    const until = new Date()
    until.setDate(until.getDate() + days)
    await supabase.from('listings').update({ featured_until: until.toISOString(), premium: true }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured_until: until.toISOString(), premium: true } : l))
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function toggleUser(id: string, field: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('profiles').update({ [field]: !current }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: !current } : u))
  }

  async function setUserRole(id: string, role: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ role }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
  }

  async function approveVerification(verifId: string, userId: string) {
    setVerifWorking(verifId)
    setVerifMsg(null)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { error: e1 } = await supabase
      .from('identity_verifications')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewer_id: session?.user.id })
      .eq('id', verifId)
    if (e1) {
      setVerifMsg({ id: verifId, ok: false, text: `Failed to approve: ${e1.message}` })
      setVerifWorking(null)
      return
    }
    await supabase.from('profiles').update({ verified: true }).eq('id', userId)
    await supabase.from('notifications').insert({
      user_id: userId, type: 'verification',
      title: '✓ You are now verified!',
      body: 'Your identity has been verified. You can now publish listings on SecretXperience.',
      link: '/listings/create',
    })
    setVerifications(prev => prev.map(v => v.id === verifId ? { ...v, status: 'approved' } : v))
    setVerifMsg({ id: verifId, ok: true, text: 'Approved — provider can now publish listings.' })
    setVerifWorking(null)
  }

  async function rejectVerification(verifId: string, userId: string) {
    setVerifWorking(verifId)
    setVerifMsg(null)
    const supabase = createClient()
    const { error: e1 } = await supabase
      .from('identity_verifications')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', verifId)
    if (e1) {
      setVerifMsg({ id: verifId, ok: false, text: `Failed to reject: ${e1.message}` })
      setVerifWorking(null)
      return
    }
    await supabase.from('notifications').insert({
      user_id: userId, type: 'verification',
      title: 'Verification update',
      body: 'We were unable to verify your profile at this time. Please resubmit with clearer documents or contact support.',
      link: '/verify',
    })
    setVerifications(prev => prev.map(v => v.id === verifId ? { ...v, status: 'rejected' } : v))
    setVerifMsg({ id: verifId, ok: true, text: 'Rejected — provider notified.' })
    setVerifWorking(null)
  }

  const filteredListings = listings.filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()))
  const filteredBookings = bookings.filter(b => !search ||
    b.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.status?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '0.5px solid rgba(197,160,90,0.2)', borderTop: '0.5px solid var(--gold, #c5a05a)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--t3, #4c4a47)', fontSize: '13px', fontFamily: 'var(--sans)' }}>Loading admin panel…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!isAdmin) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', color: 'var(--t, #ece8e1)', fontFamily: 'var(--sans)', display: 'flex' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--gbrd, rgba(197,160,90,0.2));border-radius:4px}
        .adm-tr:hover td { background: var(--bg2, rgba(255,255,255,0.02)); }
        .adm-action-btn { transition: opacity var(--t-fast, 0.15s); }
        .adm-action-btn:hover { opacity: 0.8; }
        .adm-tab-btn:hover { color: var(--gold, #c5a05a) !important; }
        .adm-search-input {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, #111);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
          border-radius: var(--r, 8px);
          color: var(--t, #ece8e1);
          font: 400 13px/1 var(--sans);
          width: 240px;
          outline: none;
          transition: border-color var(--t-fast, 0.15s), box-shadow var(--t-fast, 0.15s);
        }
        .adm-search-input:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }
        .adm-action-icon-btn {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          border-radius: var(--r, 8px);
          padding: 6px 10px;
          cursor: pointer;
          font-size: 13px;
          transition: opacity var(--t-fast, 0.15s), background var(--t-fast, 0.15s), border-color var(--t-fast, 0.15s);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .adm-action-icon-btn:hover { opacity: 0.85; }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ width: '220px', background: 'var(--bg1, #080808)', borderRight: '0.5px solid var(--b, rgba(255,255,255,0.06))', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '1.5rem', borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.06))' }}>
          <div style={{ fontFamily: 'var(--serif)', color: 'var(--gold, #c5a05a)', fontSize: '18px', marginBottom: '6px' }}>SecretXperience</div>
          <div style={{ display: 'inline-block', background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', borderRadius: '20px', padding: '3px 10px', font: '600 10px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin</div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {TABS.map(t => (
            <button key={t} className="adm-tab-btn" onClick={() => setTab(t)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1.5rem', background: tab === t ? 'var(--gbg, rgba(197,160,90,0.08))' : 'transparent', border: 'none', borderLeft: tab === t ? '2px solid var(--gold, #c5a05a)' : '2px solid transparent', color: tab === t ? 'var(--gold, #c5a05a)' : 'var(--t2, #8c8880)', cursor: 'pointer', font: `${tab === t ? 600 : 400} 13px/1 var(--sans)`, textAlign: 'left', transition: 'all var(--t-fast, .15s) var(--ease-out)' }}>
              <i className={`ti ti-${t === 'Listings' ? 'layout-list' : t === 'Users' ? 'users' : 'calendar-event'}`} style={{ fontSize: '16px' }} aria-hidden="true" />
              {t}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))' }}>
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: 'var(--r, 8px)', color: 'var(--t3, #4c4a47)', cursor: 'pointer', font: '400 12px/1 var(--sans)' }}>← Back to site</button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Page header ── */}
        <div style={{ background: 'var(--bg1, #080808)', borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.06))', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: '36px', color: 'var(--t, #ece8e1)', margin: 0, lineHeight: 1.1 }}>{tab}</h1>
            <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)', marginTop: '4px', letterSpacing: '0.04em' }}>
              {tab === 'Listings' ? `${filteredListings.length} listings` : tab === 'Users' ? `${filteredUsers.length} users` : tab === 'Newsletter' ? `${nlSubCount ?? '…'} subscribers` : `${filteredBookings.length} bookings`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', borderRadius: '20px', padding: '3px 10px', font: '600 10px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ADMIN</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}…`}
              className="adm-search-input"
            />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>

          {/* ── Stats row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: 'ti-layout-list', label: 'Active Listings', value: stats.listings, sub: 'total listings' },
              { icon: 'ti-users',       label: 'Total Users',     value: stats.users,    sub: 'registered' },
              { icon: 'ti-calendar-event', label: 'Bookings',     value: stats.bookings, sub: 'all time' },
              { icon: 'ti-coin-euro',   label: 'Revenue',         value: `€${(stats.revenue / 100).toLocaleString()}`, sub: 'confirmed bookings' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ font: '600 9px/1 var(--sans)', color: 'var(--t3, #4c4a47)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <i className={`ti ${stat.icon}`} style={{ marginRight: '5px', fontSize: '10px' }} aria-hidden="true" />
                  {stat.label}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', fontWeight: 500, color: 'var(--gold, #c5a05a)', lineHeight: 1, letterSpacing: '-0.01em', marginBottom: '6px' }}>{stat.value}</div>
                <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)', letterSpacing: '0.04em' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Listings table ── */}
          {tab === 'Listings' && (
            <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                    {['Title', 'Category', 'Provider', 'Price', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans)' }}>No listings found</td></tr>}
                  {filteredListings.map(l => (
                    <tr key={l.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))', color: 'var(--t, #ece8e1)', transition: 'background var(--t-fast, .1s)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <a href={`/listings/${l.id}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: l.active ? 'var(--t, #ece8e1)' : 'var(--t3, #4c4a47)', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold, #c5a05a)')} onMouseLeave={e => (e.currentTarget.style.color = l.active ? 'var(--t, #ece8e1)' : 'var(--t3, #4c4a47)')}>{l.title} ↗</a>
                        {l.city && <div style={{ font: '11px/1 var(--sans)', color: 'var(--t3, #4c4a47)', marginTop: '3px' }}><i className="ti ti-map-pin" style={{ fontSize: 10 }} /> {l.city}{l.country ? `, ${l.country}` : ''}</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}><span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '20px', font: '500 11px/1 var(--sans)', color: 'var(--t2, #8c8880)', letterSpacing: '0.06em' }}>{l.category}</span></td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{l.profiles?.full_name || l.profiles?.username || '—'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--gold, #c5a05a)', fontSize: '12px', fontWeight: 500 }}>{l.price_from ? `€${l.price_from}` : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ background: l.active ? 'rgba(38,212,160,0.12)' : 'rgba(184,77,114,0.12)', color: l.active ? 'var(--verified, #1dc9a0)' : 'var(--wine, #b84d72)', padding: '2px 8px', borderRadius: '20px', font: '700 10px/1 var(--sans)', letterSpacing: '0.1em' }}>{l.active ? '● Live' : '● Hidden'}</span>
                          {l.verified && <span style={{ background: 'rgba(38,212,160,0.12)', color: 'var(--verified, #1dc9a0)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Verified</span>}
                          {l.premium && <span style={{ background: 'var(--gbg)', color: 'var(--gold)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Premium</span>}
                          {l.trending && <span style={{ background: 'rgba(176,160,248,0.12)', color: '#b0a0f8', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Trending</span>}
                          {l.active && l.status && l.status !== 'approved' && <span style={{ background: 'rgba(245,168,38,0.12)', color: '#f5a826', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>{l.status}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleListing(l.id, 'verified', l.verified)}
                            style={{ color: l.verified ? 'var(--t2, #8c8880)' : 'var(--verified, #1dc9a0)', borderColor: l.verified ? 'var(--b2)' : 'rgba(38,212,160,0.3)' }}
                            title={l.verified ? 'Unverify' : 'Verify'}
                          >
                            <i className={`ti ${l.verified ? 'ti-x' : 'ti-circle-check'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{l.verified ? 'Unverify' : 'Verify'}</span>
                          </button>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleListing(l.id, 'premium', l.premium)}
                            style={{ color: l.premium ? 'var(--t2, #8c8880)' : 'var(--gold, #c5a05a)', borderColor: l.premium ? 'var(--b2)' : 'var(--gbrd)' }}
                            title={l.premium ? 'Unpremium' : 'Premium'}
                          >
                            <i className={`ti ${l.premium ? 'ti-star-off' : 'ti-star'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{l.premium ? 'Unpremium' : 'Premium'}</span>
                          </button>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => featureListing(l.id, 30)}
                            style={{ color: 'var(--gold, #c5a05a)', borderColor: 'var(--gbrd)' }}
                            title="Feature for 30 days"
                          >
                            <i className="ti ti-sparkles" aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>Feature 30d</span>
                          </button>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleListing(l.id, 'active', l.active)}
                            style={{ color: l.active ? 'var(--wine, #b84d72)' : 'var(--verified, #1dc9a0)', borderColor: l.active ? 'rgba(184,77,114,0.3)' : 'rgba(38,212,160,0.3)' }}
                            title={l.active ? 'Hide listing' : 'Show listing'}
                          >
                            <i className={`ti ${l.active ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{l.active ? 'Hide' : 'Show'}</span>
                          </button>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => deleteListing(l.id)}
                            style={{ color: 'var(--danger, #e2536b)', borderColor: 'rgba(226,83,107,0.3)' }}
                            title="Delete listing"
                          >
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Users table ── */}
          {tab === 'Users' && (
            <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                    {['User', 'Role', 'Joined', 'Badges', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans)' }}>No users found</td></tr>}
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))', color: 'var(--t, #ece8e1)', transition: 'background var(--t-fast, .1s)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{u.full_name || u.username || 'Anonymous'}</div>
                        <div style={{ font: '400 10px/1 monospace', color: 'var(--t3, #4c4a47)', marginTop: '3px' }}>{u.id.slice(0, 12)}…</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select value={u.role || 'user'} onChange={e => setUserRole(u.id, e.target.value)} style={{ background: 'var(--bg2, #151515)', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: 'var(--r, 6px)', color: 'var(--t, #ece8e1)', padding: '5px 10px', font: '400 12px/1 var(--sans)', cursor: 'pointer', outline: 'none' }}>
                          {['user', 'provider', 'venue', 'creator', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {u.verified && <span style={{ background: 'rgba(38,212,160,0.12)', color: 'var(--verified, #1dc9a0)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Verified</span>}
                          {u.premium && <span style={{ background: 'var(--gbg)', color: 'var(--gold)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Premium</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleUser(u.id, 'verified', u.verified)}
                            style={{ color: u.verified ? 'var(--t2, #8c8880)' : 'var(--verified, #1dc9a0)', borderColor: u.verified ? 'var(--b2)' : 'rgba(38,212,160,0.3)' }}
                          >
                            <i className={`ti ${u.verified ? 'ti-x' : 'ti-circle-check'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{u.verified ? 'Unverify' : 'Verify'}</span>
                          </button>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleUser(u.id, 'premium', u.premium)}
                            style={{ color: u.premium ? 'var(--t2, #8c8880)' : 'var(--gold, #c5a05a)', borderColor: u.premium ? 'var(--b2)' : 'var(--gbrd)' }}
                          >
                            <i className={`ti ${u.premium ? 'ti-star-off' : 'ti-star'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{u.premium ? 'Unpremium' : 'Premium'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Verification requests ── */}
          {tab === 'Verification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {verifications.length === 0 && (
                <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '3rem', textAlign: 'center', color: 'var(--t3)' }}>
                  No verification submissions yet
                </div>
              )}
              {verifications.map(v => {
                const profile = v.profiles || {}
                const statusColor = v.status === 'approved' ? '#26d4a0' : v.status === 'rejected' ? '#b84d72' : '#f5a826'
                const statusBg = v.status === 'approved' ? 'rgba(38,212,160,0.1)' : v.status === 'rejected' ? 'rgba(184,77,114,0.1)' : 'rgba(245,168,38,0.1)'
                return (
                  <div key={v.id} style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{profile.full_name || profile.username || 'Anonymous'}</div>
                        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{profile.email} · {profile.role || 'user'}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
                          Submitted: {v.submitted_at ? new Date(v.submitted_at).toLocaleString() : '—'}
                          {v.reviewed_at && ` · Reviewed: ${new Date(v.reviewed_at).toLocaleString()}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: statusBg, color: statusColor }}>
                            {v.status}
                          </span>
                          {v.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveVerification(v.id, v.user_id)}
                                disabled={verifWorking === v.id}
                                style={{ padding: '6px 14px', background: 'rgba(38,212,160,0.1)', border: '0.5px solid rgba(38,212,160,0.3)', borderRadius: 6, color: '#26d4a0', cursor: verifWorking === v.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: verifWorking === v.id ? 0.5 : 1 }}
                              >
                                {verifWorking === v.id ? '…' : '✓ Approve'}
                              </button>
                              <button
                                onClick={() => rejectVerification(v.id, v.user_id)}
                                disabled={verifWorking === v.id}
                                style={{ padding: '6px 14px', background: 'rgba(184,77,114,0.1)', border: '0.5px solid rgba(184,77,114,0.3)', borderRadius: 6, color: '#b84d72', cursor: verifWorking === v.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: verifWorking === v.id ? 0.5 : 1 }}
                              >
                                {verifWorking === v.id ? '…' : '✗ Reject'}
                              </button>
                            </>
                          )}
                        </div>
                        {verifMsg?.id === v.id && (
                          <div style={{ fontSize: 11, color: verifMsg.ok ? '#26d4a0' : '#b84d72', fontWeight: 500 }}>
                            {verifMsg.text}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Document thumbnails */}
                    <div style={{ display: 'flex', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
                      {v.doc_front_url && (
                        <a href={v.doc_front_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none' }}>
                          <img src={v.doc_front_url} alt="ID Front" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--b2)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>ID Front ↗</span>
                        </a>
                      )}
                      {v.doc_back_url && (
                        <a href={v.doc_back_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none' }}>
                          <img src={v.doc_back_url} alt="ID Back" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--b2)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>ID Back ↗</span>
                        </a>
                      )}
                      {v.selfie_url && (
                        <a href={v.selfie_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none' }}>
                          <img src={v.selfie_url} alt="Selfie" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--b2)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>Selfie ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Newsletter broadcast ── */}
          {tab === 'Newsletter' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--t2)' }}>
                  {nlSubCount !== null ? <><strong style={{ color: 'var(--gold)' }}>{nlSubCount}</strong> subscribers</> : 'Loading…'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 600 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6, fontFamily: 'var(--sans)' }}>Subject line</label>
                  <input
                    value={nlSubject}
                    onChange={e => setNlSubject(e.target.value)}
                    placeholder="e.g. New listings this week — exclusive access"
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 10, color: 'var(--t)', fontSize: 14, fontFamily: 'var(--sans)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6, fontFamily: 'var(--sans)' }}>Email body (HTML or plain text)</label>
                  <textarea
                    value={nlBody}
                    onChange={e => setNlBody(e.target.value)}
                    rows={10}
                    placeholder={`<h2>Hello from SecretXperience</h2>\n<p>This week we have...</p>`}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 10, color: 'var(--t)', fontSize: 13, fontFamily: 'var(--sans)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>
                <button
                  disabled={nlSending || !nlSubject.trim() || !nlBody.trim()}
                  onClick={async () => {
                    if (!confirm(`Send to ${nlSubCount} subscribers?`)) return
                    setNlSending(true); setNlResult(null)
                    const res = await fetch('/api/newsletter/broadcast', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subject: nlSubject, html: nlBody }),
                    })
                    const json = await res.json()
                    setNlResult(res.ok ? `✓ Sent to ${json.sent ?? nlSubCount} subscribers` : `✗ ${json.error || 'Failed'}`)
                    setNlSending(false)
                  }}
                  style={{ alignSelf: 'flex-start', padding: '10px 28px', background: nlSending ? 'var(--bg3)' : 'linear-gradient(135deg,#c5a05a,#a07840)', color: nlSending ? 'var(--t3)' : '#0a0808', border: 'none', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', cursor: nlSending ? 'default' : 'pointer' }}
                >
                  {nlSending ? 'Sending…' : 'Send broadcast'}
                </button>
                {nlResult && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: nlResult.startsWith('✓') ? 'rgba(62,207,142,0.08)' : 'rgba(212,95,114,0.08)', border: `0.5px solid ${nlResult.startsWith('✓') ? 'rgba(62,207,142,0.3)' : 'rgba(212,95,114,0.3)'}`, color: nlResult.startsWith('✓') ? '#3ecf8e' : '#d45f72', fontSize: 13, fontFamily: 'var(--sans)' }}>
                    {nlResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Bookings table ── */}
          {tab === 'Bookings' && (
            <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                    {['Listing', 'Client', 'Date', 'Duration', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans)' }}>No bookings yet</td></tr>}
                  {filteredBookings.map(b => (
                    <tr key={b.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))', color: 'var(--t, #ece8e1)', transition: 'background var(--t-fast, .1s)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{b.listings?.title || '—'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{b.profiles?.full_name || b.profiles?.username || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px' }}>{b.date}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{b.duration_hours}h</td>
                      <td style={{ padding: '14px 16px', color: 'var(--gold, #c5a05a)', fontWeight: 600 }}>{b.total_amount ? `€${b.total_amount}` : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', background: b.status === 'confirmed' ? 'rgba(38,212,160,0.12)' : b.status === 'cancelled' ? 'rgba(184,77,114,0.12)' : b.status === 'completed' ? 'var(--gbg)' : 'rgba(255,255,255,0.06)', color: b.status === 'confirmed' ? 'var(--verified, #1dc9a0)' : b.status === 'cancelled' ? 'var(--wine, #b84d72)' : b.status === 'completed' ? 'var(--gold, #c5a05a)' : 'var(--t2, #8c8880)' }}>{b.status}</span>
                          {b.status === 'pending' && (
                            <button
                              className="adm-action-icon-btn adm-action-btn"
                              onClick={async () => {
                                const supabase = createClient()
                                await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
                                setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x))
                              }}
                              style={{ color: 'var(--danger, #e2536b)', borderColor: 'rgba(226,83,107,0.3)' }}
                              title="Cancel booking"
                            >
                              <i className="ti ti-x" aria-hidden="true" />
                              <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
