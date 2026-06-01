'use client'
import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'escort_agency',  label: 'Escort agency' },
  { value: 'venue',          label: 'Venue / club' },
  { value: 'nightlife',      label: 'Nightlife / bar' },
  { value: 'massage',        label: 'Massage / wellness studio' },
  { value: 'other',          label: 'Other' },
]

const COUNTRIES = ['Belgium', 'Netherlands', 'Germany', 'France', 'Luxembourg', 'Other']

const PERKS = [
  { icon: '◈', title: 'Multiple profiles under one account', body: 'Manage all your escorts or staff listings from a single agency dashboard.' },
  { icon: '◉', title: 'Agency-verified badge', body: 'A distinct verified badge marks your profiles as agency-represented, boosting conversion.' },
  { icon: '✦', title: 'Bulk spotlight placement', body: 'Feature your entire roster at the top of search and category pages at agency rates.' },
  { icon: '◇', title: 'Dedicated account manager', body: 'A real person handles your onboarding, billing and any issues — no support queue.' },
  { icon: '◈', title: 'Analytics across all profiles', body: 'See views, inquiries and conversion rates per profile and in aggregate for the whole agency.' },
  { icon: '✦', title: 'Custom agency landing page', body: 'Your own branded page on SecretXperience linking all your active profiles.' },
]

export default function AdvertiseAgencyPage() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name:  '',
    email:         '',
    phone:         '',
    category:      '',
    country:       '',
    city:          '',
    message:       '',
    consent:       false,
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consent) { setErrMsg('Please accept the consent checkbox to continue.'); return }
    setStatus('sending')
    setErrMsg('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'agency_form' }),
      })
      const json = await res.json()
      if (!res.ok) { setErrMsg(json.error || 'Something went wrong.'); setStatus('error'); return }
      setStatus('sent')
    } catch {
      setErrMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  const S = {
    bg: '#050505', bg2: '#0e0e0e', bg3: '#141414',
    t: '#ece8e1', t2: 'rgba(236,232,225,0.5)', t3: 'rgba(236,232,225,0.3)',
    gold: '#c5a05a', gbg: 'rgba(197,160,90,0.08)', gbrd: 'rgba(197,160,90,0.3)',
    b: 'rgba(255,255,255,0.07)', serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif",
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        .ag-input{width:100%;background:${S.bg2};border:0.5px solid ${S.b};border-radius:10px;padding:11px 14px;color:${S.t};font-size:13px;font-family:${S.sans};outline:none;transition:border-color .15s}
        .ag-input:focus{border-color:${S.gbrd}}
        .ag-input::placeholder{color:${S.t3}}
        .ag-select{width:100%;background:${S.bg2};border:0.5px solid ${S.b};border-radius:10px;padding:11px 14px;color:${S.t};font-size:13px;font-family:${S.sans};outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c5a05a' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;transition:border-color .15s}
        .ag-select:focus{border-color:${S.gbrd}}
        .ag-cta{display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#c5a05a,#e8c97a);color:#080808;font-weight:700;font-size:14px;padding:14px 32px;border-radius:999px;border:none;cursor:pointer;letter-spacing:.04em;transition:transform .15s,box-shadow .15s;width:100%;font-family:${S.sans}}
        .ag-cta:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(197,160,90,0.3)}
        .ag-cta:disabled{opacity:0.6;cursor:not-allowed}
        .perk-card{background:${S.bg2};border:0.5px solid ${S.b};border-radius:16px;padding:1.5rem;transition:border-color .2s}
        .perk-card:hover{border-color:${S.gbrd}}
        .perk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
        @media(max-width:768px){.perk-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:480px){.perk-grid{grid-template-columns:1fr}}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        @media(max-width:640px){.form-grid{grid-template-columns:1fr}}
      `}</style>

      {/* Header */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(5,5,5,0.96)', backdropFilter:'blur(12px)', borderBottom:`0.5px solid rgba(197,160,90,0.1)`, padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ fontFamily:S.serif, fontSize:18, fontWeight:600, letterSpacing:'0.04em' }}>
          Secret<span style={{ color:S.gold }}>Xperience</span>
        </Link>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Link href="/advertise" style={{ fontSize:13, color:S.t2 }}>← Advertise</Link>
          <Link href="/listings/create" style={{ fontSize:13, color:S.gold, border:`0.5px solid ${S.gbrd}`, padding:'6px 14px', borderRadius:8, fontWeight:500 }}>Create individual profile</Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position:'relative', overflow:'hidden', background:`linear-gradient(160deg, rgba(197,160,90,0.09) 0%, ${S.bg} 50%)`, padding:'5rem 24px 4.5rem', borderBottom:`0.5px solid rgba(197,160,90,0.08)` }}>
        <div style={{ position:'absolute', top:'-80px', right:'-60px', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(197,160,90,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:S.gold, marginBottom:'1.25rem', opacity:.85 }}>SecretXperience · Agency & Venue Partners</div>
          <h1 style={{ fontFamily:S.serif, fontSize:'clamp(36px,5.5vw,62px)', fontWeight:400, lineHeight:1.08, marginBottom:'1.25rem' }}>
            Grow your agency or venue<br />
            <em style={{ color:S.gold }}>across Europe</em>
          </h1>
          <p style={{ fontSize:15, color:S.t2, maxWidth:500, margin:'0 auto 2rem', lineHeight:1.75 }}>
            Reach verified clients across Belgium, Netherlands, Germany, France and beyond. Agency accounts include multi-profile management, dedicated support and agency-rate placements.
          </p>
          <a href="#contact-form" style={{ display:'inline-block', background:'linear-gradient(135deg,#c5a05a,#e8c97a)', color:'#080808', fontWeight:700, fontSize:14, padding:'13px 32px', borderRadius:999, letterSpacing:'.04em' }}>Request agency access →</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderBottom:`0.5px solid ${S.b}`, background:S.bg2 }}>
        <div style={{ maxWidth:800, margin:'0 auto', padding:'1.25rem 24px', display:'flex', gap:'2.5rem', justifyContent:'center', flexWrap:'wrap' }}>
          {[['EU-wide','Active market coverage'],['0%','Commission on bookings'],['24 h','Agency onboarding'],['5 countries','Belgium · NL · DE · FR · LU']].map(([val,lbl]) => (
            <div key={lbl} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:S.serif, fontSize:26, fontStyle:'italic', color:S.gold, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:12, color:S.t2, marginTop:3 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>

        {/* Perks */}
        <section style={{ padding:'5rem 0 4rem' }}>
          <div style={{ fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:S.gold, marginBottom:'.75rem', opacity:.8 }}>Why agencies choose us</div>
          <h2 style={{ fontFamily:S.serif, fontSize:'clamp(26px,4vw,40px)', fontWeight:400, marginBottom:'2.5rem', lineHeight:1.2 }}>
            Everything an agency needs
          </h2>
          <div className="perk-grid">
            {PERKS.map(p => (
              <div key={p.title} className="perk-card">
                <div style={{ fontSize:20, color:S.gold, marginBottom:'.65rem' }}>{p.icon}</div>
                <h3 style={{ fontSize:14, fontWeight:600, marginBottom:'.4rem', color:S.t }}>{p.title}</h3>
                <p style={{ fontSize:13, color:S.t2, lineHeight:1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section id="contact-form" style={{ padding:'3rem 0 6rem', borderTop:`0.5px solid ${S.b}` }}>
          <div style={{ fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:S.gold, marginBottom:'.75rem', opacity:.8 }}>Get in touch</div>
          <h2 style={{ fontFamily:S.serif, fontSize:'clamp(26px,4vw,40px)', fontWeight:400, marginBottom:'.5rem', lineHeight:1.2 }}>
            Request agency access
          </h2>
          <p style={{ fontSize:14, color:S.t2, marginBottom:'2.5rem', maxWidth:480, lineHeight:1.7 }}>
            Fill in the form and our team will reach out within 24 hours to discuss your agency setup, pricing and onboarding.
          </p>

          {status === 'sent' ? (
            <div style={{ maxWidth:520, background:S.bg2, border:`0.5px solid rgba(197,160,90,0.3)`, borderRadius:20, padding:'3rem 2rem', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:'1rem' }}>✦</div>
              <h3 style={{ fontFamily:S.serif, fontSize:28, fontWeight:400, marginBottom:'.75rem', color:S.gold }}>Request received</h3>
              <p style={{ fontSize:14, color:S.t2, lineHeight:1.7, marginBottom:'1.5rem' }}>
                We'll be in touch within 24 hours to discuss your agency account. Check your inbox — including spam.
              </p>
              <Link href="/advertise" style={{ fontSize:13, color:S.gold }}>← Back to advertise</Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth:580, background:S.bg2, border:`0.5px solid ${S.b}`, borderRadius:20, padding:'2.5rem' }}>
              <div className="form-grid" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                    Business / agency name
                  </label>
                  <input className="ag-input" value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Elite Companions Agency" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                    Your name <span style={{ color:'rgba(197,160,90,0.6)' }}>*</span>
                  </label>
                  <input className="ag-input" required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Sophie" />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                    Email address <span style={{ color:'rgba(197,160,90,0.6)' }}>*</span>
                  </label>
                  <input className="ag-input" type="email" required autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@agency.com" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                    Phone / WhatsApp
                  </label>
                  <input className="ag-input" type="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+32 470 …" />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                    Type of business
                  </label>
                  <select className="ag-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                    Country
                  </label>
                  <select className="ag-select" value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="">Select…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:'1.25rem' }}>
                <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                  City
                </label>
                <input className="ag-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Brussels" />
              </div>

              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:S.t3, marginBottom:6, fontWeight:600 }}>
                  Message (optional)
                </label>
                <textarea
                  className="ag-input"
                  rows={4}
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder="Tell us about your agency — number of profiles, cities you operate in, any questions…"
                  style={{ resize:'vertical', lineHeight:1.65 }}
                />
              </div>

              {/* GDPR consent */}
              <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:'1.5rem', padding:'.9rem', background:'rgba(197,160,90,0.04)', border:`0.5px solid rgba(197,160,90,0.15)`, borderRadius:10 }}>
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={e => set('consent', e.target.checked)}
                  style={{ marginTop:2, accentColor:S.gold, width:15, height:15, flexShrink:0 }}
                />
                <span style={{ fontSize:12, color:S.t2, lineHeight:1.6 }}>
                  I agree that SecretXperience (3S.lifestyle bv, Grimbergen, BE 0749.661.728) may contact me at the email and/or phone number provided to discuss advertising and partnership options.
                  My data will be processed in accordance with our <Link href="/privacy" style={{ color:S.gold }}>Privacy Policy</Link> and not shared with third parties.
                  I can withdraw consent at any time by emailing <span style={{ color:S.gold }}>privacy@secretxperience.eu</span>. <span style={{ color:'rgba(197,160,90,0.6)' }}>*</span>
                </span>
              </label>

              {errMsg && (
                <div role="alert" style={{ background:'rgba(220,38,38,0.08)', border:'0.5px solid rgba(220,38,38,0.3)', borderRadius:8, padding:'.75rem 1rem', fontSize:13, color:'#f87171', marginBottom:'1rem' }}>
                  {errMsg}
                </div>
              )}

              <button className="ag-cta" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request agency access →'}
              </button>

              <p style={{ fontSize:11, color:S.t3, textAlign:'center', marginTop:'.9rem', lineHeight:1.6 }}>
                We typically respond within 24 hours · No commitment required
              </p>
            </form>
          )}
        </section>

      </div>
    </div>
  )
}
