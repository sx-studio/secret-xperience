'use client'
import { useState, FormEvent } from 'react'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', gold: '#c5a05a', serif: "'Cormorant Garamond', serif", sans: "'Jost', sans-serif" }
const inp: React.CSSProperties = { width: '100%', background: '#0d0b08', border: '0.5px solid #c5a05a33', color: S.t, fontFamily: S.sans, fontSize: 14, padding: '12px 14px', borderRadius: 3, outline: 'none' }

export default function ReportPage() {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ url: '', reason: '', detail: '', email: '' })
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:${S.gold};text-decoration:none}a:hover{text-decoration:underline}input:focus,select:focus,textarea:focus{border-color:${S.gold}66!important}`}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #c5a05a22', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em' }}>Secret<span style={{ color: S.gold }}>Xperience</span></a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#c45a5a', textTransform: 'uppercase', marginBottom: '1rem' }}>Safety</p>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(34px,5vw,52px)', fontWeight: 400, color: S.t, marginBottom: '0.5rem', lineHeight: 1.1 }}>Report a <em style={{ fontStyle: 'italic', color: '#c45a5a' }}>listing</em></h1>
        <p style={{ color: S.t2, fontSize: 14, lineHeight: 1.7, marginBottom: '2.5rem' }}>All reports are reviewed by our moderation team within 24 hours. For emergencies involving minors or trafficking, also contact <strong style={{ color: S.t }}>local law enforcement</strong> immediately.</p>
        {done ? (
          <div style={{ border: '0.5px solid rgba(196,90,90,0.4)', borderRadius: 12, padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontFamily: S.serif, fontSize: 24, color: '#e09090', marginBottom: 8 }}>Report submitted</h2>
            <p style={{ color: S.t2, fontSize: 14 }}>Our moderation team will review this within 24 hours. If you provided an email, we'll update you on the outcome.</p>
          </div>
        ) : (
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); if (form.url && form.reason && form.detail) setDone(true) }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { label: 'Listing URL', key: 'url', placeholder: 'https://secretxperience.eu/listings/...', type: 'url' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', color: S.t2, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                <input style={inp} type={f.type} required placeholder={f.placeholder} value={(form as any)[f.key]} onChange={set(f.key)} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', color: S.t2, textTransform: 'uppercase', marginBottom: 6 }}>Reason for report</label>
              <select required style={{ ...inp, cursor: 'pointer' }} value={form.reason} onChange={set('reason')}>
                <option value="" disabled>Select a reason…</option>
                {['Underage content','Non-consensual content','Stolen / fake photos','Scam or fraud','Human trafficking','Harassment','Other illegal content'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', color: S.t2, textTransform: 'uppercase', marginBottom: 6 }}>Details</label>
              <textarea required rows={5} style={{ ...inp, resize: 'vertical' }} placeholder="Describe the issue in detail…" value={form.detail} onChange={set('detail')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', color: S.t2, textTransform: 'uppercase', marginBottom: 6 }}>Your email <span style={{ color: '#555' }}>(optional — for follow-up)</span></label>
              <input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <button type="submit" style={{ background: 'linear-gradient(135deg,#9b3030,#7a2020)', border: 'none', borderRadius: 10, padding: '13px 24px', color: '#fff', fontFamily: S.sans, fontWeight: 600, fontSize: 14, cursor: 'pointer', letterSpacing: '0.04em' }}>Submit report →</button>
          </form>
        )}
      </main>
    </div>
  )
}
