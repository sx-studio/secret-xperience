'use client'

import { useState, useEffect, useRef } from 'react'
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

const MAX_IMAGES = 5

interface UploadedImage {
  file: File
  preview: string
  publicUrl: string | null
  uploading: boolean
  error: string | null
}

export default function CreateListingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => images.forEach(img => URL.revokeObjectURL(img.preview))
  }, [])

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  async function uploadFile(img: UploadedImage, index: number) {
    setImages(prev => prev.map((m, i) => i === index ? { ...m, uploading: true, error: null } : m))
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: img.file.name, contentType: img.file.type, size: img.file.size }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Upload failed')
      }
      const { presignedUrl, publicUrl } = await res.json()

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': img.file.type },
        body: img.file,
      })
      if (!putRes.ok) throw new Error('Failed to upload to storage')

      setImages(prev => prev.map((m, i) => i === index ? { ...m, uploading: false, publicUrl } : m))
    } catch (err: any) {
      setImages(prev => prev.map((m, i) => i === index ? { ...m, uploading: false, error: err.message } : m))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - images.length
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      publicUrl: null,
      uploading: false,
      error: null,
    }))
    const startIndex = images.length
    setImages(prev => {
      const next = [...prev, ...toAdd]
      // kick off uploads after state settles
      toAdd.forEach((img, i) => {
        setTimeout(() => uploadFile(img, startIndex + i), 0)
      })
      return next
    })
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.category || !form.city) {
      setError('Please fill in all required fields.')
      return
    }
    const uploading = images.some(img => img.uploading)
    if (uploading) {
      setError('Please wait for all images to finish uploading.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single()
    const imageUrls = images.filter(img => img.publicUrl).map(img => img.publicUrl as string)

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
      images: imageUrls,
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

          {/* Image upload */}
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4c4a47', marginBottom: '.4rem', fontWeight: 600 }}>
            Photos ({images.length}/{MAX_IMAGES})
          </label>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.12)' }}>
                  <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: img.uploading ? 0.4 : 1 }} />
                  {img.uploading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid rgba(197,160,90,0.3)', borderTop: '2px solid #c5a05a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                  )}
                  {img.error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(184,77,114,0.7)', fontSize: '10px', color: '#fff', padding: '4px', textAlign: 'center' }}>
                      {img.error}
                    </div>
                  )}
                  {img.publicUrl && !img.uploading && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', background: '#c5a05a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
                  )}
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', left: '4px', width: '18px', height: '18px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', fontSize: '11px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: '8px', background: '#1a1a1a', border: '0.5px dashed rgba(197,160,90,0.4)', color: '#c5a05a', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  +
                </button>
              )}
            </div>
            <p style={{ color: '#4c4a47', fontSize: '11px', margin: 0 }}>JPG, PNG or WebP · max 10 MB each · up to {MAX_IMAGES} photos</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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

          <button type="submit" disabled={loading || images.some(img => img.uploading)} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#c5a05a,#9a7a3a)', border: 'none', borderRadius: '8px', color: '#080808', cursor: 'pointer', fontWeight: 600, fontSize: '14px', letterSpacing: '.04em', opacity: loading || images.some(img => img.uploading) ? 0.6 : 1 }}>
            {loading ? 'Creating listing…' : images.some(img => img.uploading) ? 'Uploading images…' : 'Publish listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
