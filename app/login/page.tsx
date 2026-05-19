'use client'

import { useState, useEffect } from 'react'
import { signIn, signUp } from '../lib/auth'
import { createClient } from '../lib/supabase'

type Role = 'user' | 'provider' | 'venue' | 'creator'

const ROLES: { value: Role; label: string; description: string; icon: string }[] = [
  { value: 'user',     label: 'User / Client',     description: 'Discover & book experiences', icon: '◈' },
  { value: 'provider', label: 'Service Provider',   description: 'Offer premium services',      icon: '◆' },
  { value: 'venue',    label: 'Venue',              description: 'List your space',              icon: '◇' },
  { value: 'creator',  label: 'Creator',            description: 'Share exclusive content',      icon: '✦' },
]

export default function LoginPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole]         = useState<Role>('user')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [shake, setShake]       = useState(false)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    if (error) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(t)
    }
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { error } = await signUp(email, password, fullName, role)
      if (error) setError(error.message)
      else setSuccess(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError('')
    setSuccess(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #050505; }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-7px); }
          30%      { transform: translateX(7px); }
          45%      { transform: translateX(-5px); }
          60%      { transform: translateX(5px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }

        @keyframes checkDraw {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0; }
        }

        .lx-page {
          min-height: 100vh;
          background: #050505;
          display: flex;
          font-family: 'Jost', sans-serif;
        }

        /* ── Left panel ── */
        .lx-left {
          display: none;
          flex: 1 1 0;
          background: linear-gradient(160deg, #0b0b0b 0%, #060606 55%, #0e0b02 100%);
          border-right: 0.5px solid rgba(255,255,255,0.055);
          flex-direction: column;
          justify-content: space-between;
          padding: 4rem 3.5rem;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .lx-left { display: flex !important; }
        }

        .lx-glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(197,160,90,0.055) 0%, transparent 68%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: glowPulse 4s ease-in-out infinite;
        }

        .lx-glow-orb-2 {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(197,160,90,0.04) 0%, transparent 70%);
          bottom: 10%;
          right: -60px;
          pointer-events: none;
        }

        .lx-left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* ── Right panel ── */
        .lx-right {
          flex: 0 0 auto;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2.5rem 2rem;
          min-height: 100vh;
        }

        @media (min-width: 768px) {
          .lx-right {
            max-width: 460px;
            padding: 3rem 2.5rem;
          }
        }

        /* ── Inputs ── */
        .lx-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.025);
          border: 0.5px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          color: #ece8e1;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.02em;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          appearance: none;
          -webkit-appearance: none;
        }
        .lx-input::placeholder { color: rgba(255,255,255,0.22); }
        .lx-input:focus {
          border-color: rgba(197,160,90,0.5);
          background: rgba(197,160,90,0.03);
          box-shadow: 0 0 0 3px rgba(197,160,90,0.06);
        }
        .lx-input:hover:not(:focus) { border-color: rgba(255,255,255,0.17); }

        /* ── Password wrap ── */
        .lx-pass-wrap { position: relative; }
        .lx-pass-wrap .lx-input { padding-right: 46px; }

        .lx-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.28);
          padding: 4px;
          line-height: 1;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .lx-eye-btn:hover { color: rgba(197,160,90,0.7); }

        /* ── Tabs ── */
        .lx-tab {
          flex: 1;
          padding: 10px 0;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.07em;
          transition: color 0.2s, background 0.2s;
          border-radius: 8px;
          text-transform: uppercase;
        }

        /* ── Role cards ── */
        .role-card {
          padding: 14px 12px;
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.22s, background 0.22s, transform 0.15s;
          text-align: left;
          width: 100%;
        }
        .role-card:hover {
          border-color: rgba(197,160,90,0.28);
          background: rgba(197,160,90,0.03);
          transform: translateY(-1px);
        }
        .role-card.selected {
          border-color: rgba(197,160,90,0.6);
          background: rgba(197,160,90,0.07);
          box-shadow: 0 0 0 3px rgba(197,160,90,0.06);
        }
        .role-card.selected:hover { transform: none; }

        /* ── Google button ── */
        .lx-google-btn {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #ece8e1;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.22s, background 0.22s;
        }
        .lx-google-btn:hover {
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.055);
        }

        /* ── Submit button ── */
        .lx-submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #c5a05a 0%, #a0803d 100%);
          border: none;
          border-radius: 10px;
          color: #06040100;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          color: #080808;
          position: relative;
          overflow: hidden;
        }
        .lx-submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .lx-submit-btn:disabled { opacity: 0.48; cursor: default; }
        .lx-submit-btn:not(:disabled):hover { opacity: 0.88; transform: translateY(-1px); }
        .lx-submit-btn:not(:disabled):active { transform: translateY(0); opacity: 0.95; }

        /* ── Divider ── */
        .lx-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 0 0 22px;
        }
        .lx-divider-line {
          flex: 1;
          height: 0.5px;
          background: rgba(255,255,255,0.07);
        }
        .lx-divider-label {
          color: rgba(255,255,255,0.2);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
        }
      `}</style>

      <div className="lx-page">

        {/* ── Left decorative panel ── */}
        <div className="lx-left">
          <div className="lx-glow-orb" />
          <div className="lx-glow-orb-2" />
          <div className="lx-left-grid" />

          {/* Top wordmark */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '26px',
              fontWeight: 400,
              color: '#c5a05a',
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </div>
            <div style={{
              width: '32px',
              height: '0.5px',
              background: 'linear-gradient(90deg, rgba(197,160,90,0.8), transparent)',
            }} />
          </div>

          {/* Centre tagline */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '42px',
              fontWeight: 300,
              color: '#ece8e1',
              lineHeight: 1.28,
              letterSpacing: '-0.01em',
              marginBottom: '1.75rem',
            }}>
              Where desire<br />meets{' '}
              <em style={{ color: '#c5a05a', fontStyle: 'italic' }}>discretion.</em>
            </p>

            <p style={{
              color: 'rgba(255,255,255,0.28)',
              fontSize: '13px',
              fontWeight: 300,
              lineHeight: 1.75,
              maxWidth: '310px',
              letterSpacing: '0.04em',
            }}>
              A curated platform for extraordinary experiences,
              exclusive venues, and unforgettable connections.
            </p>

            {/* Feature list */}
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Verified service providers & venues',
                'End-to-end booking & payments',
                'Complete discretion guaranteed',
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#c5a05a',
                    opacity: 0.7,
                    flexShrink: 0,
                  }} />
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', letterSpacing: '0.04em', fontWeight: 300 }}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
            <div style={{
              padding: '5px 12px',
              border: '0.5px solid rgba(197,160,90,0.2)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c5a05a', opacity: 0.6 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Members only · 18+
              </span>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="lx-right">

          {/* Mobile wordmark */}
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 400,
                color: '#c5a05a',
                letterSpacing: '0.04em',
              }}>
                Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
              </span>
            </a>
          </div>

          {/* Card */}
          <div style={{
            background: 'linear-gradient(145deg, #111111 0%, #0d0d0d 100%)',
            border: '0.5px solid rgba(255,255,255,0.09)',
            borderRadius: '16px',
            padding: '2rem 1.875rem 1.875rem',
            animation: 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
          }}>

            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.5)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '11px',
              padding: '4px',
              marginBottom: '1.875rem',
              gap: '2px',
            }}>
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  className="lx-tab"
                  onClick={() => switchMode(m)}
                  style={{
                    color: mode === m ? '#c5a05a' : 'rgba(255,255,255,0.28)',
                    background: mode === m
                      ? 'linear-gradient(135deg, rgba(197,160,90,0.12) 0%, rgba(197,160,90,0.06) 100%)'
                      : 'transparent',
                    boxShadow: mode === m ? '0 0 0 0.5px rgba(197,160,90,0.2) inset' : 'none',
                  }}
                >
                  {m === 'login' ? 'Log in' : 'Create account'}
                </button>
              ))}
            </div>

            {/* ── Success state ── */}
            {success ? (
              <div style={{ textAlign: 'center', padding: '2.25rem 0 1.5rem', animation: 'fadeUp 0.45s ease' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(197,160,90,0.12) 0%, transparent 70%)',
                  border: '0.5px solid rgba(197,160,90,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 0 30px rgba(197,160,90,0.1)',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="#c5a05a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="30"
                      style={{ animation: 'checkDraw 0.5s ease 0.15s forwards', strokeDashoffset: 30 }}
                    />
                  </svg>
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '24px',
                  fontWeight: 400,
                  color: '#ece8e1',
                  marginBottom: '0.65rem',
                  letterSpacing: '0.01em',
                }}>
                  Check your email
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.32)',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}>
                  We sent a confirmation link to{' '}
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>{email}</span>.
                  <br />Click it to activate your account.
                </p>
              </div>
            ) : (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>

                {/* Google OAuth */}
                <button className="lx-google-btn" onClick={handleGoogle} style={{ marginBottom: '20px' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96l3.007 2.333C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="lx-divider">
                  <div className="lx-divider-line" />
                  <span className="lx-divider-label">or</span>
                  <div className="lx-divider-line" />
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  style={{ animation: shake ? 'shake 0.45s ease' : 'none' }}
                >
                  {mode === 'signup' && (
                    <>
                      {/* Full name */}
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          className="lx-input"
                          placeholder="Full name"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          required
                          autoComplete="name"
                        />
                      </div>

                      {/* Role selector 2×2 */}
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.25)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          marginBottom: '10px',
                        }}>
                          I am a…
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {ROLES.map(r => (
                            <button
                              key={r.value}
                              type="button"
                              className={`role-card${role === r.value ? ' selected' : ''}`}
                              onClick={() => setRole(r.value)}
                            >
                              <div style={{
                                fontSize: '16px',
                                color: role === r.value ? '#c5a05a' : 'rgba(255,255,255,0.25)',
                                marginBottom: '6px',
                                transition: 'color 0.2s',
                                lineHeight: 1,
                              }}>
                                {r.icon}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: role === r.value ? '#c5a05a' : '#ece8e1',
                                marginBottom: '3px',
                                fontFamily: "'Jost', sans-serif",
                                letterSpacing: '0.03em',
                                transition: 'color 0.2s',
                              }}>
                                {r.label}
                              </div>
                              <div style={{
                                fontSize: '10.5px',
                                color: 'rgba(255,255,255,0.28)',
                                fontFamily: "'Jost', sans-serif",
                                lineHeight: 1.4,
                                fontWeight: 300,
                              }}>
                                {r.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      className="lx-input"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div className="lx-pass-wrap" style={{ marginBottom: error ? '12px' : '16px' }}>
                    <input
                      className="lx-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="lx-eye-btn"
                      onClick={() => setShowPass(v => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Inline error */}
                  {error && (
                    <div style={{
                      color: '#d45f72',
                      fontSize: '12.5px',
                      marginBottom: '14px',
                      padding: '10px 13px',
                      background: 'rgba(212,95,114,0.07)',
                      border: '0.5px solid rgba(212,95,114,0.25)',
                      borderRadius: '8px',
                      lineHeight: 1.55,
                      letterSpacing: '0.02em',
                    }}>
                      {error}
                    </div>
                  )}

                  <button className="lx-submit-btn" type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <p style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.18)',
            fontSize: '11px',
            marginTop: '1.5rem',
            letterSpacing: '0.05em',
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            By continuing you confirm you are 18 or older.
          </p>
        </div>
      </div>
    </>
  )
}
