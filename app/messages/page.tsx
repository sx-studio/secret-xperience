$ git -C /home/user/Secret-Xperience show 22f8b3b:app/listings/create/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'

const CATEGORIES = [
  { value: 'escorts', label: 'Escorts' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'creators', label: 'Creators' },
  { value: 'adult', label: 'Adult Services' },
  { value: 'rentals', label: 'Rentals' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'events', label: 'Event Spaces' },
  { value: 'photo', label: 'Photo / Video' },
  { value: 'affiliate', label: 'Affiliate Commerce' },
  { value: 'memberships', label: 'Memberships' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'shop', label: 'Adult Shop' },
]

const ESCORT_TYPES = ['Independent', 'Private', 'Agency', 'VIP / Elite', 'Touring', 'Duo / Couple', 'Male', 'Female', 'Non-binary', 'Trans']

export default function CreateListingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'escorts',
    subcategory: '',
    price_from: '',
    price_to: '',
    city: '',
    country: 'Belgium',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUser(session.user)
    }
    load()
  }, [])

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.category || !form.city) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single()

    const { error: err } = await supabase.from('listings').insert({
      profile_id: profile?.id,
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory || null,
      price_from: form.price_from ? parseInt(form.price_from) : null,
      price_to: form.price_to ? parseInt(form.price_to) : null,
      city: form.city,
      country: form.country,
      active: true,
    })

    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  const s: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: '#222', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', color: '#ece8e1', fontSize: '13px',
    outline: 'none', marginBottom: '1rem',
    fontFamily: 'sans-serif',
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#ece8e1' }}>
        <div style={{ fontSize: '48px', color: '#c5a05a', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, color: '#c5a05a', marginBottom: '0.5rem' }}>Listing created!</h2>
        <p style={{ color: '#8c8880', marginBottom: '1.5rem' }}>Your listing is now live on SecretXperience.</p>
        <button onClick={() => window.location.href = '/'} style={{ padding: '0.75rem 1.5rem', background: '#c5a05a', border: 'none', borderRadius: '8px', color: '#080808', cursor: 'pointer', fontWeight: 600 }}>
          View platform
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'sans-serif', color: '#ece8e1' }}>
      <nav style={{ background: '#101010', borderBottom: '0.5px solid rgba(255,255,255,0.07)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#c5a05a', fontFamily: 'Georgia, serif', fontSize: '18px' }}>SecretXperience</span>
        <button onClick={() => window.location.href = '/dashboard'} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#8c8880', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '13px' }}>
          Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '560px', margin: '3rem auto', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, color: '#c5a05a', marginBottom: '0.25rem', fontSize: '28px' }}>Create a listing</h2>
        <p style={{ color: '#8c8880', fontSize: '13px', marginBottom: '2rem' }}>Fill in the details below to list your service on SecretXperience.</p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Sophia A. — Independent Escort Brussels" style={s} />

          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Category *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={s}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          {form.category === 'escorts' && (
            <>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Escort type</label>
              <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} style={s}>
                <option value="">Select type</option>
                {ESCORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}

          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your service, availability, and what clients can expect…" rows={4} style={{ ...s, resize: 'vertical', lineHeight: 1.6 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Price from (€)</label>
              <input type="number" value={form.price_from} onChange={e => set('price_from', e.target.value)} placeholder="e.g. 200" style={s} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Price to (€)</label>
              <input type="number" value={form.price_to} onChange={e => set('price_to', e.target.value)} placeholder="e.g. 1200" style={s} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>City *</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Brussels" style={s} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>Country</label>
              <select value={form.country} onChange={e => set('country', e.target.value)} style={s}>
                <option>Belgium</option>
                <option>Netherlands</option>
                <option>France</option>
                <option>Germany</option>
                <option>Luxembourg</option>
                <option>United Kingdom</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: '#b84d72', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#c5a05a,#9a7a3a)', border: 'none', borderRadius: '8px', color: '#080808', cursor: 'pointer', fontWeight: 600, fontSize: '14px', letterSpacing: '.04em' }}>
            {loading ? 'Creating listing…' : 'Publish listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
