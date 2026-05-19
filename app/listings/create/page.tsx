'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '../../lib/supabase'

/* ─── Data ─────────────────────────────────────────────── */

const CATEGORIES = [
  { value: 'escorts',       label: 'Escort',        icon: '✦' },
  { value: 'massage',       label: 'Massage',        icon: '◈' },
  { value: 'companionship', label: 'Companionship',  icon: '◇' },
  { value: 'domination',    label: 'Domination',     icon: '◉' },
  { value: 'adult',         label: 'Adult Services', icon: '▲' },
  { value: 'creators',      label: 'Creators',       icon: '◎' },
  { value: 'nightlife',     label: 'Nightlife',      icon: '◐' },
  { value: 'experiences',   label: 'Experiences',    icon: '◆' },
  { value: 'rentals',       label: 'Rentals',        icon: '□' },
  { value: 'events',        label: 'Event Spaces',   icon: '◳' },
  { value: 'photo',         label: 'Photo / Video',  icon: '◑' },
  { value: 'memberships',   label: 'Memberships',    icon: '◈' },
]

const ESCORT_TYPES = [
  'Independent', 'Private', 'Agency', 'VIP / Elite',
  'Touring', 'Duo / Couple', 'Male', 'Female', 'Non-binary', 'Trans',
]

const COUNTRIES = [
  'Belgium', 'Netherlands', 'France', 'Germany',
  'Luxembourg', 'United Kingdom', 'Switzerland', 'Austria',
  'Spain', 'Italy', 'Other',
]

const MEET_TYPES = [
  { value: 'incall',  label: 'Incall',   desc: 'At your location' },
  { value: 'outcall', label: 'Outcall',  desc: "At client's location" },
  { value: 'both',    label: 'Both',     desc: 'Either works' },
]

/* ─── Types ─────────────────────────────────────────────── */

interface FormState {
  category:    string
  subcategory: string
  title:       string
  description: string
  city:        string
  country:     string
  price_from:  string
  price_to:    string
  meet_type:   string
  images:      string[]
}

interface UploadingImage {
  id:       string
  name:     string
  preview:  string
  loading:  boolean
  error?:   string
}

/* ─── Helpers ───────────────────────────────────────────── */

const TOTAL_STEPS = 5

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem' }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const idx = i + 1
        const done    = idx < current
        const active  = idx === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: done
                ? 'linear-gradient(135deg,#c5a05a,#a0803d)'
                : active
                ? 'transparent'
                : 'transparent',
              border: done
                ? 'none'
                : active
                ? '1px solid #c5a05a'
                : '0.5px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.3s',
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{
                  fontSize: '12px',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: active ? 500 : 400,
                  color: active ? '#c5a05a' : 'rgba(255,255,255,0.2)',
                  lineHeight: 1,
                }}>
                  {idx}
                </span>
              )}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div style={{
                width: '32px',
                height: '0.5px',
                background: done
                  ? 'linear-gradient(90deg,#c5a05a,rgba(197,160,90,0.3))'
                  : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */

export default function CreateListingPage() {
  const [step, setStep]       = useState(1)
  const [user, setUser]       = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState<FormState>({
    category:    '',
    subcategory: '',
    title:       '',
    description: '',
    city:        '',
    country:     'Belgium',
    price_from:  '',
    price_to:    '',
    meet_type:   'both',
    images:      [],
  })

  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([])
  const [isDragging, setIsDragging]           = useState(false)
  const [draftBanner, setDraftBanner]         = useState(false)
  const [draftSaved, setDraftSaved]           = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUser(session.user)
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      // Check for saved draft
      try {
        const saved = localStorage.getItem('sx_listing_draft')
        if (saved) setDraftBanner(true)
      } catch(e) {}
    }
    load()
  }, [])

  function saveDraft() {
    try {
      localStorage.setItem('sx_listing_draft', JSON.stringify({ step, form }))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
    } catch(e) {}
  }

  function restoreDraft() {
    try {
      const saved = localStorage.getItem('sx_listing_draft')
      if (!saved) return
      const { step: savedStep, form: savedForm } = JSON.parse(saved)
      setForm(savedForm)
      setStep(savedStep || 1)
      setDraftBanner(false)
    } catch(e) { setDraftBanner(false) }
  }

  const set = (field: keyof FormState, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  /* ── Image upload ── */
  const uploadFile = useCallback(async (file: File) => {
    if (form.images.length + uploadingImages.filter(u => u.loading).length >= 5) return
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} exceeds the 10 MB limit.`)
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert(`${file.name} is not a supported format (JPEG, PNG, WebP).`)
      return
    }

    const uid     = Math.random().toString(36).slice(2)
    const preview = URL.createObjectURL(file)
    setUploadingImages(prev => [...prev, { id: uid, name: file.name, preview, loading: true }])

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Failed to upload image')
      const { publicUrl } = await res.json()

      setForm(f => ({ ...f, images: [...f.images, publicUrl] }))
      setUploadingImages(prev => prev.filter(u => u.id !== uid))
      URL.revokeObjectURL(preview)
    } catch (err: any) {
      setUploadingImages(prev =>
        prev.map(u => u.id === uid ? { ...u, loading: false, error: err.message } : u)
      )
    }
  }, [form.images, uploadingImages])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const remaining = 5 - form.images.length - uploadingImages.filter(u => u.loading).length
    Array.from(files).slice(0, remaining).forEach(uploadFile)
  }, [form.images.length, uploadingImages, uploadFile])

  const removeImage = (url: string) =>
    setForm(f => ({ ...f, images: f.images.filter(u => u !== url) }))

  const removeUploading = (id: string) =>
    setUploadingImages(prev => prev.filter(u => u.id !== id))

  /* ── Submit ── */
  async function handleSubmit() {
    setLoading(true); setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }

    const { error: err } = await supabase.from('listings').insert({
      profile_id:  session.user.id,
      title:       form.title,
      description: form.description || null,
      category:    form.category,
      subcategory: form.subcategory || null,
      price_from:  form.price_from ? parseInt(form.price_from) : null,
      price_to:    form.price_to   ? parseInt(form.price_to)   : null,
      currency:    'EUR',
      city:        form.city,
      country:     form.country,
      meet_type:   form.meet_type,
      images:      form.images.length > 0 ? form.images : null,
      active:      true,
    })

    if (err) { setError(err.message); setLoading(false); return }
    try { localStorage.removeItem('sx_listing_draft') } catch(e) {}

    // Check if provider has Stripe connected
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, role')
      .eq('id', session.user.id)
      .single()

    if (!profile?.stripe_connect_account_id && ['provider','venue','creator'].includes(profile?.role || '')) {
      // Store flag to show Connect prompt after redirect
      localStorage.setItem('sx_show_connect_prompt', '1')
    }

    setSuccess(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 1800)
  }

  /* ── Step validation ── */
  function canAdvance(): boolean {
    if (step === 1) return !!form.category
    if (step === 2) return form.title.trim().length >= 3
    if (step === 3) return !!form.city.trim()
    if (step === 4) return true  // photos optional
    return true
  }

  /* ── Shared input style ── */
  const inp: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '9px',
    color: '#ece8e1',
    fontSize: '14px',
    outline: 'none',
    fontFamily: "'Jost', sans-serif",
    fontWeight: 300,
    letterSpacing: '0.02em',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  }

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '8px',
    fontWeight: 600,
    fontFamily: "'Jost', sans-serif",
  }

  const fieldWrap: React.CSSProperties = { marginBottom: '1.25rem' }

  /* ─── Success screen ─── */
  if (success) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');`}</style>
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Jost', sans-serif",
      }}>
        <div style={{ textAlign: 'center', color: '#ece8e1', animation: 'fadeUp 0.5s ease' }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(197,160,90,0.15),rgba(197,160,90,0.05))',
            border: '0.5px solid rgba(197,160,90,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l4.5 4.5L19 7" stroke="#c5a05a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: '32px',
            color: '#c5a05a',
            marginBottom: '0.75rem',
            letterSpacing: '-0.01em',
          }}>
            Listing published
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '14px',
            fontWeight: 300,
            letterSpacing: '0.03em',
            marginBottom: '2rem',
          }}>
            Your listing is now live on SecretXperience.
          </p>
          <span style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 300,
            letterSpacing: '0.06em',
          }}>
            Redirecting to dashboard…
          </span>
        </div>
      </div>
    </>
  )

  /* ─── Main render ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cl-category-card {
          position: relative;
          padding: 1.25rem 1rem;
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          user-select: none;
        }
        .cl-category-card:hover {
          border-color: rgba(197,160,90,0.3);
          background: rgba(197,160,90,0.04);
          transform: translateY(-2px);
        }
        .cl-category-card.selected {
          border-color: rgba(197,160,90,0.7);
          background: rgba(197,160,90,0.07);
        }
        .cl-category-card.selected .cl-cat-icon {
          color: #c5a05a;
        }

        .cl-inp:focus {
          border-color: rgba(197,160,90,0.5) !important;
          background: rgba(197,160,90,0.03) !important;
        }

        .cl-meet-btn {
          flex: 1;
          padding: 12px 10px;
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: border-color 0.2s, background 0.2s;
          user-select: none;
        }
        .cl-meet-btn:hover {
          border-color: rgba(197,160,90,0.3);
          background: rgba(197,160,90,0.04);
        }
        .cl-meet-btn.selected {
          border-color: rgba(197,160,90,0.65);
          background: rgba(197,160,90,0.07);
        }

        .cl-btn-gold {
          background: linear-gradient(135deg,#c5a05a 0%,#a0803d 100%);
          border: none;
          border-radius: 9px;
          color: #080808;
          padding: 12px 28px;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .cl-btn-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);
          pointer-events: none;
        }
        .cl-btn-gold:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .cl-btn-gold:disabled { opacity: 0.35; cursor: not-allowed; }

        .cl-btn-ghost {
          background: transparent;
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          color: rgba(255,255,255,0.4);
          padding: 12px 24px;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          transition: border-color 0.2s, color 0.2s;
        }
        .cl-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.65); }

        select option { background: #1a1a1a; color: #ece8e1; }

        .cl-upload-zone {
          border: 1.5px dashed rgba(197,160,90,0.25);
          border-radius: 14px;
          background: rgba(197,160,90,0.02);
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-align: center;
          gap: 10px;
        }
        .cl-upload-zone:hover,
        .cl-upload-zone.dragging {
          border-color: rgba(197,160,90,0.7);
          background: rgba(197,160,90,0.05);
        }
        .cl-thumb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin-top: 1rem;
        }
        .cl-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 0.5px solid rgba(255,255,255,0.1);
        }
        .cl-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .cl-thumb-remove {
          position: absolute;
          top: 5px; right: 5px;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(5,5,5,0.85);
          border: 0.5px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .cl-thumb-remove:hover { background: rgba(180,60,80,0.85); }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .cl-category-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cl-price-grid    { grid-template-columns: 1fr !important; }
          .cl-location-grid { grid-template-columns: 1fr !important; }
        }
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
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
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
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.4)',
              padding: '7px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: "'Jost', sans-serif",
              letterSpacing: '0.06em',
            }}
          >
            Dashboard
          </button>
        </nav>

        {/* ── Body ── */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '3rem 1.5rem 6rem',
          animation: 'fadeUp 0.35s ease',
        }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(197,160,90,0.5)',
              marginBottom: '10px',
              fontWeight: 500,
            }}>
              New listing — Step {step} of {TOTAL_STEPS}
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(26px,5vw,36px)',
              fontWeight: 300,
              color: '#ece8e1',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}>
              {step === 1 && 'Choose a category'}
              {step === 2 && 'Describe your service'}
              {step === 3 && 'Location & pricing'}
              {step === 4 && 'Add photos'}
              {step === 5 && 'Review & publish'}
            </h1>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* Draft restore banner */}
          {draftBanner && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(197,160,90,0.07)',
              border: '0.5px solid rgba(197,160,90,0.25)',
              borderRadius: '9px', padding: '10px 14px', marginBottom: '1.5rem',
              fontFamily: "'Jost', sans-serif", fontSize: '13px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>You have a saved draft.</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={restoreDraft} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5a05a', fontSize: '13px', fontFamily: "'Jost', sans-serif", fontWeight: 500, padding: 0 }}>Restore</button>
                <button type="button" onClick={() => { localStorage.removeItem('sx_listing_draft'); setDraftBanner(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '13px', fontFamily: "'Jost', sans-serif", fontWeight: 300, padding: 0 }}>Discard</button>
              </div>
            </div>
          )}

          {/* ─── Step 1: Category ─── */}
          {step === 1 && (
            <div>
              <div
                className="cl-category-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '2rem',
                }}
              >
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.value}
                    className={`cl-category-card${form.category === cat.value ? ' selected' : ''}`}
                    onClick={() => set('category', cat.value)}
                  >
                    <span
                      className="cl-cat-icon"
                      style={{
                        fontSize: '18px',
                        color: form.category === cat.value ? '#c5a05a' : 'rgba(255,255,255,0.18)',
                        lineHeight: 1,
                        transition: 'color 0.2s',
                      }}
                    >
                      {cat.icon}
                    </span>
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '12px',
                      fontWeight: form.category === cat.value ? 500 : 400,
                      color: form.category === cat.value ? '#c5a05a' : 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.04em',
                      lineHeight: 1.3,
                      transition: 'color 0.2s',
                    }}>
                      {cat.label}
                    </span>
                    {form.category === cat.value && (
                      <div style={{
                        position: 'absolute',
                        top: '8px', right: '8px',
                        width: '7px', height: '7px',
                        borderRadius: '50%',
                        background: '#c5a05a',
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Subcategory for escorts */}
              {form.category === 'escorts' && (
                <div style={fieldWrap}>
                  <label style={label}>Escort type (optional)</label>
                  <select
                    value={form.subcategory}
                    onChange={e => set('subcategory', e.target.value)}
                    className="cl-inp"
                    style={{ ...inp }}
                  >
                    <option value="">Select type…</option>
                    {ESCORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 2: Basic info ─── */}
          {step === 2 && (
            <div>
              <div style={fieldWrap}>
                <label style={label}>Title *</label>
                <input
                  className="cl-inp"
                  style={inp}
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Sophia A. — Independent Escort Brussels"
                  maxLength={120}
                />
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.18)',
                  fontFamily: "'Jost', sans-serif",
                  marginTop: '6px',
                  fontWeight: 300,
                }}>
                  {form.title.length} / 120
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={label}>Description</label>
                <textarea
                  className="cl-inp"
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.7, minHeight: '140px' }}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe your service, availability, and what clients can expect…"
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* ─── Step 3: Location, Pricing, Meet type ─── */}
          {step === 3 && (
            <div>
              {/* Location */}
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Location
                </p>
                <div
                  className="cl-location-grid"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                >
                  <div>
                    <label style={label}>City *</label>
                    <input
                      className="cl-inp"
                      style={inp}
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="Brussels"
                    />
                  </div>
                  <div>
                    <label style={label}>Country</label>
                    <select
                      className="cl-inp"
                      style={inp}
                      value={form.country}
                      onChange={e => set('country', e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Pricing (EUR)
                </p>
                <div
                  className="cl-price-grid"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                >
                  <div>
                    <label style={label}>Starting from (€)</label>
                    <input
                      type="number"
                      min="0"
                      className="cl-inp"
                      style={inp}
                      value={form.price_from}
                      onChange={e => set('price_from', e.target.value)}
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label style={label}>Up to (€)</label>
                    <input
                      type="number"
                      min="0"
                      className="cl-inp"
                      style={inp}
                      value={form.price_to}
                      onChange={e => set('price_to', e.target.value)}
                      placeholder="1 200"
                    />
                  </div>
                </div>
              </div>

              {/* Meet type */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Meet type
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {MEET_TYPES.map(mt => (
                    <button
                      key={mt.value}
                      type="button"
                      className={`cl-meet-btn${form.meet_type === mt.value ? ' selected' : ''}`}
                      onClick={() => set('meet_type', mt.value)}
                    >
                      <span style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: form.meet_type === mt.value ? '#c5a05a' : 'rgba(255,255,255,0.55)',
                        letterSpacing: '0.04em',
                        transition: 'color 0.2s',
                      }}>
                        {mt.label}
                      </span>
                      <span style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.22)',
                        fontWeight: 300,
                        letterSpacing: '0.03em',
                      }}>
                        {mt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4: Photo upload ─── */}
          {step === 4 && (
            <div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />

              {/* Upload zone */}
              <div
                className={`cl-upload-zone${isDragging ? ' dragging' : ''}`}
                onClick={() => {
                  if (form.images.length + uploadingImages.filter(u => u.loading).length < 5)
                    fileInputRef.current?.click()
                }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
              >
                {/* Camera icon */}
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(197,160,90,0.07)',
                  border: '0.5px solid rgba(197,160,90,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(197,160,90,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.65)',
                  letterSpacing: '0.03em',
                }}>
                  Add Photos
                </span>
                <span style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.04em',
                }}>
                  Up to 5 photos · JPEG, PNG, WebP · 10 MB each
                </span>
                {form.images.length + uploadingImages.filter(u => u.loading).length >= 5 && (
                  <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'rgba(197,160,90,0.5)',
                    letterSpacing: '0.06em',
                  }}>
                    Maximum reached
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {(form.images.length > 0 || uploadingImages.length > 0) && (
                <div className="cl-thumb-grid">
                  {/* Uploaded images */}
                  {form.images.map(url => (
                    <div key={url} className="cl-thumb">
                      <img src={url} alt="listing photo" />
                      <button
                        type="button"
                        className="cl-thumb-remove"
                        onClick={() => removeImage(url)}
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* Uploading / errored */}
                  {uploadingImages.map(u => (
                    <div key={u.id} className="cl-thumb" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <img src={u.preview} alt={u.name} style={{ opacity: 0.4 }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: '6px',
                      }}>
                        {u.loading ? (
                          <div style={{
                            width: '24px', height: '24px',
                            border: '2px solid rgba(197,160,90,0.25)',
                            borderTop: '2px solid #c5a05a',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                        ) : (
                          <>
                            <span style={{ fontSize: '18px' }}>⚠</span>
                            <button
                              type="button"
                              className="cl-thumb-remove"
                              style={{ position: 'relative', top: 'unset', right: 'unset' }}
                              onClick={() => removeUploading(u.id)}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Count indicator */}
              <p style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '11px',
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 300,
                marginTop: '1rem',
                textAlign: 'right',
                letterSpacing: '0.04em',
              }}>
                {form.images.length} / 5 photos added
              </p>
            </div>
          )}

          {/* ─── Step 5: Review & Submit ─── */}
          {step === 5 && (
            <div>
              {/* Review card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}>
                {/* Category badge */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(197,160,90,0.08)',
                    border: '0.5px solid rgba(197,160,90,0.25)',
                    color: 'rgba(197,160,90,0.7)',
                    fontSize: '10px',
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {CATEGORIES.find(c => c.value === form.category)?.label || form.category}
                    {form.subcategory && ` · ${form.subcategory}`}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  fontWeight: 400,
                  color: '#ece8e1',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.01em',
                }}>
                  {form.title || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No title</span>}
                </h3>

                {/* Description preview */}
                {form.description && (
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 300,
                    lineHeight: 1.65,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                  }}>
                    {form.description}
                  </p>
                )}

                {/* Meta row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  paddingTop: '1rem',
                  borderTop: '0.5px solid rgba(255,255,255,0.07)',
                }}>
                  {form.city && (
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.35)',
                      fontWeight: 300,
                    }}>
                      📍 {form.city}, {form.country}
                    </span>
                  )}
                  {(form.price_from || form.price_to) && (
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '12px',
                      color: 'rgba(197,160,90,0.6)',
                      fontWeight: 400,
                    }}>
                      {form.price_from && form.price_to
                        ? `€${form.price_from} – €${form.price_to}`
                        : form.price_from
                        ? `from €${form.price_from}`
                        : `up to €${form.price_to}`}
                    </span>
                  )}
                  <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.28)',
                    fontWeight: 300,
                    textTransform: 'capitalize',
                  }}>
                    {MEET_TYPES.find(m => m.value === form.meet_type)?.label}
                  </span>
                  {form.images.length > 0 && (
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.28)',
                      fontWeight: 300,
                    }}>
                      {form.images.length} photo{form.images.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Photo strip preview */}
                {form.images.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                  }}>
                    {form.images.map(url => (
                      <img
                        key={url}
                        src={url}
                        alt=""
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '0.5px solid rgba(255,255,255,0.1)',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Admin toggles — only for admins */}
              {profile?.role === 'admin' && (
                <div style={{
                  background: 'rgba(197,160,90,0.04)',
                  border: '0.5px solid rgba(197,160,90,0.18)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                }}>
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(197,160,90,0.5)',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}>
                    Admin flags
                  </p>
                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.25)',
                    fontWeight: 300,
                  }}>
                    Verified, Premium and Trending flags can be toggled from the admin panel after publishing.
                  </p>
                </div>
              )}

              {error && (
                <div style={{
                  background: 'rgba(184,77,114,0.08)',
                  border: '0.5px solid rgba(184,77,114,0.3)',
                  borderRadius: '9px',
                  padding: '12px 16px',
                  marginBottom: '1.25rem',
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '13px',
                  color: '#d45f72',
                  fontWeight: 400,
                }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={{
            display: 'flex',
            justifyContent: step === 1 ? 'flex-end' : 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '0.5px solid rgba(255,255,255,0.06)',
          }}>
            {step > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  className="cl-btn-ghost"
                  onClick={() => { setError(''); setStep(s => s - 1) }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300,
                    color: draftSaved ? '#c5a05a' : 'rgba(255,255,255,0.22)',
                    letterSpacing: '0.04em', transition: 'color 0.2s',
                  }}
                >
                  {draftSaved ? 'Saved ✓' : 'Save progress'}
                </button>
              </div>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="cl-btn-gold"
                disabled={!canAdvance()}
                onClick={() => { setError(''); setStep(s => s + 1) }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="cl-btn-gold"
                disabled={loading || !canAdvance()}
                onClick={handleSubmit}
                style={{ minWidth: '160px' }}
              >
                {loading ? 'Publishing…' : 'Publish listing'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
