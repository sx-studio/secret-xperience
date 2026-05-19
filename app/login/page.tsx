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
      if (error) { setError(error.message) } else {
        // Providers/venues/creators with no listings → onboard them straight to create
        const nextUrl = new URLSearchParams(window.location.search).get('next')
        if (nextUrl && nextUrl.startsWith('/')) {
          window.location.href = nextUrl
          return
        }
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
            if (profile && ['provider','venue','creator'].includes(profile.role || '')) {
              const { count } = await supabase.from('listings').select('id', { count: 'exact', head: true }).eq('profile_id', session.user.id)
              if ((count ?? 0) === 0) { window.location.href = '/listings/create'; return }
            }
          }
        } catch { /* fall through to dashboard */ }
        window.location.href = '/dashboard'
      }
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
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

        @keyframes checkDraw {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0; }
        }

        .lx-page {
          background: var(--grad-velvet, linear-gradient(160deg,#0b0b0b 0%,#060606 55%,#0e0b02 100%));
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--sans, 'Jost', sans-serif);
        }

        .lx-card {
          max-width: 420px;
          width: 100%;
          padding: 2.5rem 2rem;
          background: var(--bg1, #111111);
          border: 0.5px solid var(--b3, rgba(255,255,255,0.09));
          border-radius: var(--rxl, 20px);
          box-shadow: var(--shadow-modal, 0 24px 80px rgba(0,0,0,0.6));
          position: relative;
          overflow: hidden;
          animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lx-glow-top {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(197,160,90,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Tabs ── */
        .lx-tabs-row {
          background: var(--bg2, rgba(0,0,0,0.5));
          border-radius: var(--r, 8px);
          padding: 4px;
          display: flex;
          margin-bottom: 1.5rem;
        }

        .lx-tab {
          flex: 1;
          height: 40px;
          border: none;
          background: transparent;
          color: var(--t2, rgba(255,255,255,0.5));
          font: 600 12px/1 var(--sans, 'Jost', sans-serif);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }

        .lx-tab.active {
          background: var(--bg3, rgba(255,255,255,0.06));
          color: var(--gold, #c5a05a);
          border-bottom: 2px solid var(--gold, #c5a05a);
        }

        /* ── Social buttons ── */
        .lx-social-btn {
          width: 100%;
          height: 44px;
          background: var(--bg2, rgba(255,255,255,0.03));
          border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          border-radius: var(--r, 8px);
          color: var(--t, #ece8e1);
          font: 500 13px/1 var(--sans, 'Jost', sans-serif);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: border-color 0.22s, background 0.22s;
        }
        .lx-social-btn:hover {
          border-color: var(--b3, rgba(255,255,255,0.22));
          background: var(--bg3, rgba(255,255,255,0.055));
        }
        .lx-social-btn i { font-size: 16px; }

        /* ── OR divider ── */
        .lx-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.25rem 0;
        }
        .lx-divider-line {
          flex: 1;
          height: 0.5px;
          background: var(--b, rgba(255,255,255,0.07));
        }
        .lx-divider-label {
          font: 600 9px var(--sans, 'Jost', sans-serif);
          letter-spacing: 0.12em;
          color: var(--t3, rgba(255,255,255,0.2));
          text-transform: uppercase;
        }

        /* ── Field labels ── */
        .lx-label {
          font: 600 10px/1 var(--sans, 'Jost', sans-serif);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--t3, rgba(255,255,255,0.3));
          margin-bottom: 6px;
          display: block;
        }

        /* ── Inputs ── */
        .lx-input {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, rgba(255,255,255,0.025));
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.10));
          border-radius: var(--r, 8px);
          font: 400 14px var(--sans, 'Jost', sans-serif);
          width: 100%;
          outline: none;
          transition: border-color var(--t-fast, 0.15s), box-shadow var(--t-fast, 0.15s);
          appearance: none;
          -webkit-appearance: none;
        }
        .lx-input::placeholder { color: var(--t3, rgba(255,255,255,0.22)); }
        .lx-input:focus {
          border-color: var(--gold, rgba(197,160,90,0.5));
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.08));
        }

        /* ── Password wrap ── */
        .lx-pass-wrap { position: relative; }
        .lx-pass-wrap .lx-input { padding-right: 46px; }

        .lx-eye-btn {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--t3, rgba(255,255,255,0.28));
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: color 0.2s;
        }
        .lx-eye-btn:hover { color: var(--gold, rgba(197,160,90,0.7)); }

        /* ── Role cards ── */
        .lx-role-card {
          background: var(--bg2, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
          border-radius: var(--r, 8px);
          padding: 14px;
          cursor: pointer;
          transition: all var(--t-fast, 0.15s);
          text-align: left;
          width: 100%;
        }
        .lx-role-card:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.4));
          background: var(--gbg, rgba(197,160,90,0.04));
        }
        .lx-role-card.selected {
          border-color: var(--gbrd, rgba(197,160,90,0.6));
          background: var(--gbg, rgba(197,160,90,0.07));
          color: var(--gold, #c5a05a);
        }

        /* ── Submit button ── */
        .lx-submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: var(--grad-gold, linear-gradient(135deg,#c5a05a 0%,#a0803d 100%));
          color: var(--t-on-gold, #080808);
          border: none;
          border-radius: var(--r, 8px);
          font: 600 13px/1 var(--sans, 'Jost', sans-serif);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: var(--shadow-gold, 0 4px 24px rgba(197,160,90,0.25));
          cursor: pointer;
          margin-top: 1.25rem;
          position: relative;
          overflow: hidden;
          transition: transform var(--t-fast, 0.15s), box-shadow var(--t-fast, 0.15s);
        }
        .lx-submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .lx-submit-btn:disabled { opacity: 0.48; cursor: default; }
        .lx-submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-gold-h, 0 8px 32px rgba(197,160,90,0.35));
        }
        .lx-submit-btn:not(:disabled):active { transform: translateY(0); }

        /* ── Error pill ── */
        .lx-error {
          background: var(--pbg, rgba(212,95,114,0.07));
          color: var(--pink, #d45f72);
          border-radius: var(--r, 8px);
          padding: 12px 14px;
          font: 400 13px var(--sans, 'Jost', sans-serif);
          margin-bottom: 1rem;
          width: 100%;
        }
      `}</style>

      <div className="lx-page">
        <div className="lx-card">

          {/* Gold glow at top */}
          <div className="lx-glow-top" />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <div style={{
                fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--gold, #c5a05a)',
                letterSpacing: '0.02em',
              }}>
                Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
              </div>
            </a>
            <div style={{
              font: '600 10px/1 var(--sans, "Jost", sans-serif)',
              letterSpacing: '0.16em',
              color: 'var(--t3, rgba(255,255,255,0.3))',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}>
              Log in to SecretXperience
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="lx-tabs-row">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                className={`lx-tab${mode === m ? ' active' : ''}`}
                onClick={() => switchMode(m)}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
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
                fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
                fontSize: '24px',
                fontWeight: 400,
                color: 'var(--t, #ece8e1)',
                marginBottom: '0.65rem',
                letterSpacing: '0.01em',
              }}>
                Check your email
              </p>
              <p style={{
                color: 'var(--t2, rgba(255,255,255,0.4))',
                fontSize: '13px',
                lineHeight: 1.7,
                fontWeight: 300,
              }}>
                We sent a confirmation link to{' '}
                <span style={{ color: 'var(--t, rgba(255,255,255,0.7))' }}>{email}</span>.
                <br />Click it to activate your account.
              </p>
            </div>
          ) : (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>

              {/* Social buttons */}
              <button className="lx-social-btn" onClick={handleGoogle}>
                <i className="ti ti-brand-google" />
                Continue with Google
              </button>
              <button className="lx-social-btn" type="button" onClick={() => {}}>
                <i className="ti ti-brand-apple" />
                Continue with Apple
              </button>

              {/* OR divider */}
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
                      <label className="lx-label">Full Name</label>
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
                      <label className="lx-label">I am a…</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {ROLES.map(r => (
                          <button
                            key={r.value}
                            type="button"
                            className={`lx-role-card${role === r.value ? ' selected' : ''}`}
                            onClick={() => setRole(r.value)}
                          >
                            <div style={{
                              fontSize: '16px',
                              color: role === r.value ? 'var(--gold, #c5a05a)' : 'var(--t3, rgba(255,255,255,0.25))',
                              marginBottom: '6px',
                              transition: 'color 0.2s',
                              lineHeight: 1,
                            }}>
                              {r.icon}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: role === r.value ? 'var(--gold, #c5a05a)' : 'var(--t, #ece8e1)',
                              marginBottom: '3px',
                              fontFamily: 'var(--sans, "Jost", sans-serif)',
                              letterSpacing: '0.03em',
                              transition: 'color 0.2s',
                            }}>
                              {r.label}
                            </div>
                            <div style={{
                              fontSize: '10.5px',
                              color: 'var(--t2, rgba(255,255,255,0.4))',
                              fontFamily: 'var(--sans, "Jost", sans-serif)',
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
                  <label className="lx-label">Email</label>
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
                <div style={{ marginBottom: error ? '0' : '4px' }}>
                  <label className="lx-label">Password</label>
                  <div className="lx-pass-wrap">
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
                      <i className={showPass ? 'ti ti-eye-off' : 'ti ti-eye'} />
                    </button>
                  </div>
                </div>

                {/* Inline error */}
                {error && (
                  <div className="lx-error" style={{ marginTop: '0.75rem' }}>
                    {error}
                  </div>
                )}

                <button className="lx-submit-btn" type="submit" disabled={loading}>
                  {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
