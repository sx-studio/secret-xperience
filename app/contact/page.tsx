'use client'
import { useState, FormEvent } from 'react'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #c5a05a44; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #c5a05a88; }
  a { color: #c5a05a; text-decoration: none; }
  a:hover { text-decoration: underline; }
  input, select, textarea {
    background: #0d0b08;
    border: 0.5px solid #c5a05a33;
    color: #e8e0d0;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    padding: 12px 14px;
    border-radius: 3px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: #c5a05a88;
  }
  input::placeholder, textarea::placeholder {
    color: #444;
  }
  select option {
    background: #111;
    color: #e8e0d0;
  }
`

const inputStyle: React.CSSProperties = {
  background: '#0d0b08',
  border: '0.5px solid #c5a05a33',
  color: '#e8e0d0',
  fontFamily: "'Jost', sans-serif",
  fontSize: 14,
  padding: '12px 14px',
  borderRadius: 3,
  width: '100%',
  outline: 'none',
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#e8e0d0', fontFamily: "'Jost', sans-serif" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid #c5a05a22',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#e8e0d0', letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Secret<span style={{ color: '#c5a05a' }}>Xperience</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: '#888', letterSpacing: '0.06em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> Back
        </a>
      </header>

      {/* Hero */}
      <div style={{
        borderBottom: '0.5px solid #c5a05a18',
        padding: '64px 24px 48px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5a05a', marginBottom: 20 }}>
          Get in Touch
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          Contact Support
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Our support team responds within 24 hours. For urgent safety concerns, please use our <a href="/report">report page</a>.
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 48, alignItems: 'flex-start' }}>

          {/* Form column */}
          <div>
            {submitted ? (
              <div style={{ border: '0.5px solid #c5a05a44', borderRadius: 4, padding: '40px 32px', textAlign: 'center', background: '#0a0a0a' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#c5a05a', marginBottom: 16, lineHeight: 1 }}>✓</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: '#e8e0d0', marginBottom: 12 }}>
                  Message Sent
                </h2>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.8 }}>
                  Thank you for reaching out. Our support team will review your message and respond to <strong style={{ color: '#c5a05a' }}>{form.email || 'your email'}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  style={{ marginTop: 24, background: 'none', border: '0.5px solid #c5a05a44', color: '#c5a05a', cursor: 'pointer', padding: '10px 20px', borderRadius: 3, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Jost', sans-serif" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Display name or alias"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Subject</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" disabled>Select a subject…</option>
                    <option value="general">General inquiry</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical issue</option>
                    <option value="abuse">Report abuse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Message</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Describe your question or issue in detail…"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#c5a05a', color: '#080808', border: 'none', cursor: 'pointer',
                    padding: '14px 28px', borderRadius: 3, fontSize: 12,
                    letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
                    fontFamily: "'Jost', sans-serif", alignSelf: 'flex-start',
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ border: '0.5px solid #c5a05a22', borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Email Support</div>
              <a href="mailto:support@secret-xperience.eu" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#c5a05a', wordBreak: 'break-all' }}>
                support@secret-xperience.eu
              </a>
            </div>
            <div style={{ border: '0.5px solid #c5a05a22', borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Response Time</div>
              <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>Within 24 hours<br /><span style={{ color: '#444', fontSize: 12 }}>Mon – Sun, including weekends</span></div>
            </div>
            <div style={{ border: '0.5px solid #c5a05a22', borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Self-Service</div>
              <a href="/faq" style={{ fontSize: 14, color: '#c5a05a', lineHeight: 1.7, display: 'block' }}>Browse the FAQ →</a>
              <a href="/trust-safety" style={{ fontSize: 14, color: '#c5a05a66', lineHeight: 1.7, display: 'block' }}>Trust &amp; Safety →</a>
            </div>
            <div style={{ border: '0.5px solid #c5a05a11', borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>Legal &amp; Press</div>
              <div style={{ fontSize: 13, color: '#444', lineHeight: 1.8 }}>
                Legal: <a href="mailto:legal@secret-xperience.eu" style={{ color: '#c5a05a55' }}>legal@…</a><br />
                Press: <a href="mailto:press@secret-xperience.eu" style={{ color: '#c5a05a55' }}>press@…</a><br />
                Privacy: <a href="mailto:privacy@secret-xperience.eu" style={{ color: '#c5a05a55' }}>privacy@…</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
