'use client'

import { useEffect, useState } from 'react'
import { signOut } from '../lib/auth'
import { createClient } from '../lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    }
    load()
  }, [])

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#c5a05a', fontFamily: 'sans-serif' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#ece8e1', fontFamily: 'sans-serif' }}>

      {/* Nav */}
      <nav style={{
        background: '#101010', borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span
          onClick={() => window.location.href = '/'}
          style={{ color: '#c5a05a', fontFamily: 'Georgia, serif', fontSize: '18px', cursor: 'pointer', letterSpacing: '.04em' }}
        >
          Secret<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</span>
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => window.location.href = '/listings/create'}
            style={{ background: 'linear-gradient(135deg,#c5a05a,#9a7a3a)', border: 'none', borderRadius: '8px', color: '#080808', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            + Create listing
          </button>
          <button
            onClick={handleSignOut}
            style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#8c8880', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '13px' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 1rem' }}>

        {/* Welcome */}
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, color: '#c5a05a', marginBottom: '0.25rem', fontSize: '28px' }}>
          Welcome, {profile?.full_name || user?.email}
        </h2>
        <p style={{ color: '#8c8880', marginBottom: '2rem', fontSize: '13px' }}>
          Role: <span style={{ color: '#ece8e1' }}>{profile?.role || 'user'}</span>
          {profile?.verified && <span style={{ marginLeft: '10px', color: '#26d4a0', fontSize: '12px' }}>✓ Verified</span>}
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Listings', value: listings.length },
            { label: 'Bookings', value: bookings.length },
            { label: 'Messages', value: 0 },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#101010', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '13px', padding: '1.5rem', textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: '#c5a05a', fontFamily: 'Georgia, serif' }}>{stat.value}</div>
              <div style={{ color: '#8c8880', fontSize: '13px', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ background: '#101010', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '13px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', fontWeight: 600 }}>Quick actions</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href = '/listings/create'} style={{ background: 'linear-gradient(135deg,#c5a05a,#9a7a3a)', border: 'none', borderRadius: '8px', color: '#080808', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              + Create listing
            </button>
            {['View bookings', 'Messages', 'Edit profile'].map(action => (
              <button key={action} style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ece8e1', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '13px' }}>
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* My listings */}
        <div style={{ background: '#101010', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '13px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', fontWeight: 600 }}>My listings</h3>
            <button onClick={() => window.location.href = '/listings/create'} style={{ background: 'transparent', border: '0.5px solid rgba(197,160,90,0.3)', borderRadius: '8px', color: '#c5a05a', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '12px' }}>
              + New
            </button>
          </div>

          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#4c4a47' }}>
              <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>📋</div>
              <p style={{ fontSize: '13px', marginBottom: '1rem' }}>No listings yet</p>
              <button onClick={() => window.location.href = '/listings/create'} style={{ background: 'linear-gradient(135deg,#c5a05a,#9a7a3a)', border: 'none', borderRadius: '8px', color: '#080808', padding: '0.6rem 1.4rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Create your first listing
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {listings.map(listing => (
                <div key={listing.id} style={{ background: '#181818', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ece8e1', marginBottom: '3px' }}>{listing.title}</div>
                    <div style={{ fontSize: '11px', color: '#8c8880' }}>{listing.category}{listing.subcategory ? ' · ' + listing.subcategory : ''} · {listing.city}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {listing.verified && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '7px', background: 'rgba(26,143,106,.2)', color: '#26d4a0', border: '0.5px solid rgba(26,143,106,.4)' }}>✓ Verified</span>}
                    <span style={{ fontSize: '12px', color: listing.active ? '#26d4a0' : '#8c8880' }}>{listing.active ? 'Live' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
