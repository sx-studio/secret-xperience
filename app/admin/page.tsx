'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'

const TABS = ['Listings', 'Users', 'Bookings'] as const
type Tab = typeof TABS[number]

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState<Tab>('Listings')
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState({ listings: 0, users: 0, bookings: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') { window.location.href = '/'; return }
      setIsAdmin(true)
      const [lr, ur, br] = await Promise.all([
        supabase.from('listings').select('*, profiles(full_name, username)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, listings(title), profiles!bookings_client_id_fkey(full_name, username)').order('created_at', { ascending: false }),
      ])
      const ls = lr.data || [], us = ur.data || [], bs = br.data || []
      const revenue = bs.filter((b: any) => b.status === 'confirmed').reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
      setListings(ls); setUsers(us); setBookings(bs)
      setStats({ listings: ls.length, users: us.length, bookings: bs.length, revenue })
      setLoading(false)
    }
    init()
  }, [])

  async function toggleListing(id: string, field: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('listings').update({ [field]: !current }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, [field]: !current } : l))
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

  const filteredListings = listings.filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid rgba(197,160,90,0.2)', borderTop: '1px solid #c5a05a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: '#4c4a47', fontSize: '13px', fontFamily: 'sans-serif' }}>Loading admin panel…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!isAdmin) return null

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#ece8e1', fontFamily: "'Jost', sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(197,160,90,0.2);border-radius:4px}
        tr:hover td{background:rgba(255,255,255,0.02)}
        .action-btn:hover{opacity:0.8}
        .tab-btn:hover{color:#c5a05a!important}
      `}</style>

      <div style={{ width: '220px', background: '#080808', borderRight: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#c5a05a', fontSize: '18px', marginBottom: '4px' }}>SecretXperience</div>
          <div style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: '#4c4a47', fontWeight: 600 }}>Admin Console</div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {TABS.map(t => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1.5rem', background: tab === t ? 'rgba(197,160,90,0.08)' : 'transparent', border: 'none', borderLeft: tab === t ? '2px solid #c5a05a' : '2px solid transparent', color: tab === t ? '#c5a05a' : '#8c8880', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t ? 600 : 400, textAlign: 'left', transition: 'all .15s' }}>
              <span style={{ fontSize: '16px' }}>{t === 'Listings' ? '▤' : t === 'Users' ? '◎' : '◈'}</span>
              {t}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#4c4a47', cursor: 'pointer', fontSize: '12px' }}>← Back to site</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#080808', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: '24px', color: '#ece8e1', margin: 0 }}>{tab}</h1>
            <div style={{ fontSize: '11px', color: '#4c4a47', marginTop: '2px' }}>
              {tab === 'Listings' ? `${filteredListings.length} listings` : tab === 'Users' ? `${filteredUsers.length} users` : `${bookings.length} bookings`}
            </div>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}…`} style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 14px', color: '#ece8e1', fontSize: '13px', outline: 'none', width: '240px' }} />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: '▤', label: 'Listings', value: stats.listings, color: '#c5a05a' },
              { icon: '◎', label: 'Users', value: stats.users, color: '#1dc9a0' },
              { icon: '◈', label: 'Bookings', value: stats.bookings, color: '#b0a0f8' },
              { icon: '€', label: 'Revenue', value: `€${stats.revenue.toLocaleString()}`, color: '#c5a05a' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }} />
                <div style={{ fontSize: '11px', color: '#4c4a47', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {tab === 'Listings' && (
            <div style={{ background: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {['Title', 'Category', 'Provider', 'Price', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#4c4a47' }}>No listings found</td></tr>}
                  {filteredListings.map(l => (
                    <tr key={l.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)', transition: 'background .1s' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: l.active ? '#ece8e1' : '#4c4a47' }}>{l.title}</div>
                        {!l.active && <div style={{ fontSize: '10px', color: '#b84d72', marginTop: '2px' }}>● Hidden</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}><span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', color: '#8c8880' }}>{l.category}</span></td>
                      <td style={{ padding: '14px 16px', color: '#8c8880', fontSize: '12px' }}>{l.profiles?.full_name || l.profiles?.username || '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#c5a05a', fontSize: '12px' }}>{l.price_from ? `€${l.price_from}` : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {l.verified && <span style={{ background: 'rgba(29,201,160,0.12)', color: '#1dc9a0', padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>Verified</span>}
                          {l.premium && <span style={{ background: 'rgba(197,160,90,0.12)', color: '#c5a05a', padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>Premium</span>}
                          {l.trending && <span style={{ background: 'rgba(176,160,248,0.12)', color: '#b0a0f8', padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>Trending</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button className="action-btn" onClick={() => toggleListing(l.id, 'verified', l.verified)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: l.verified ? 'rgba(255,255,255,0.06)' : 'rgba(29,201,160,0.12)', color: l.verified ? '#8c8880' : '#1dc9a0' }}>{l.verified ? 'Unverify' : 'Verify'}</button>
                          <button className="action-btn" onClick={() => toggleListing(l.id, 'premium', l.premium)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: l.premium ? 'rgba(255,255,255,0.06)' : 'rgba(197,160,90,0.12)', color: l.premium ? '#8c8880' : '#c5a05a' }}>{l.premium ? 'Unpremium' : 'Premium'}</button>
                          <button className="action-btn" onClick={() => toggleListing(l.id, 'trending', l.trending)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: l.trending ? 'rgba(255,255,255,0.06)' : 'rgba(176,160,248,0.12)', color: l.trending ? '#8c8880' : '#b0a0f8' }}>{l.trending ? 'Untrend' : 'Trending'}</button>
                          <button className="action-btn" onClick={() => toggleListing(l.id, 'active', l.active)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: 'rgba(184,77,114,0.1)', color: '#b84d72' }}>{l.active ? 'Hide' : 'Show'}</button>
                          <button className="action-btn" onClick={() => deleteListing(l.id)} style={{ padding: '4px 10px', borderRadius: '6px', border: '0.5px solid rgba(184,77,114,0.3)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: 'transparent', color: '#b84d72' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Users' && (
            <div style={{ background: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {['User', 'Role', 'Joined', 'Badges', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#4c4a47' }}>No users found</td></tr>}
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{u.full_name || u.username || 'Anonymous'}</div>
                        <div style={{ fontSize: '10px', color: '#4c4a47', marginTop: '2px', fontFamily: 'monospace' }}>{u.id.slice(0, 12)}…</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select value={u.role || 'user'} onChange={e => setUserRole(u.id, e.target.value)} style={{ background: '#151515', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ece8e1', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>
                          {['user', 'provider', 'venue', 'creator', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#8c8880', fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {u.verified && <span style={{ background: 'rgba(29,201,160,0.12)', color: '#1dc9a0', padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>Verified</span>}
                          {u.premium && <span style={{ background: 'rgba(197,160,90,0.12)', color: '#c5a05a', padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>Premium</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="action-btn" onClick={() => toggleUser(u.id, 'verified', u.verified)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: u.verified ? 'rgba(255,255,255,0.06)' : 'rgba(29,201,160,0.12)', color: u.verified ? '#8c8880' : '#1dc9a0' }}>{u.verified ? 'Unverify' : 'Verify'}</button>
                          <button className="action-btn" onClick={() => toggleUser(u.id, 'premium', u.premium)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: u.premium ? 'rgba(255,255,255,0.06)' : 'rgba(197,160,90,0.12)', color: u.premium ? '#8c8880' : '#c5a05a' }}>{u.premium ? 'Unpremium' : 'Premium'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Bookings' && (
            <div style={{ background: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {['Listing', 'Client', 'Date', 'Duration', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#4c4a47' }}>No bookings yet</td></tr>}
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{b.listings?.title || '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#8c8880', fontSize: '12px' }}>{b.profiles?.full_name || b.profiles?.username || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px' }}>{b.date}</td>
                      <td style={{ padding: '14px 16px', color: '#8c8880', fontSize: '12px' }}>{b.duration_hours}h</td>
                      <td style={{ padding: '14px 16px', color: '#c5a05a', fontWeight: 600 }}>{b.total_amount ? `€${b.total_amount}` : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: b.status === 'confirmed' ? 'rgba(29,201,160,0.12)' : b.status === 'cancelled' ? 'rgba(184,77,114,0.12)' : b.status === 'completed' ? 'rgba(197,160,90,0.12)' : 'rgba(255,255,255,0.06)', color: b.status === 'confirmed' ? '#1dc9a0' : b.status === 'cancelled' ? '#b84d72' : b.status === 'completed' ? '#c5a05a' : '#8c8880' }}>{b.status}</span>
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
