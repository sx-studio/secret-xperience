'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [ready, setReady]       = useState(false)
  const [done, setDone]         = useState(false)

  // The reset link drops the user here with a recovery session in the URL hash.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setError('This reset link is invalid or has expired. Request a new one from the login page.')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('The two passwords don’t match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message || 'Could not update your password. Try again.'); return }
    setDone(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 1800)
  }

  const S = {
    bg: '#050505', t: '#ece8e1', t2: 'rgba(236,232,225,0.5)', gold: '#c5a05a',
    serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif",
  }
  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: S.t,
    fontSize: 15, fontFamily: S.sans, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.t, fontFamily: S.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <a href="/" style={{ display: 'block', textAlign: 'center', fontFamily: S.serif, fontSize: 24, fontWeight: 600, letterSpacing: '0.04em', color: S.t, textDecoration: 'none', marginBottom: 28 }}>
          Secret<span style={{ color: S.gold }}>Xperience</span>
        </a>

        {done ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontFamily: S.serif, fontSize: 26, marginBottom: 8 }}>Password updated</p>
            <p style={{ color: S.t2, fontSize: 13 }}>Signing you in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 style={{ fontFamily: S.serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>Choose a new password</h1>
            <p style={{ color: S.t2, fontSize: 13, marginBottom: 24 }}>Enter a new password for your account.</p>

            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input style={inp} type={showPass ? 'text' : 'password'} placeholder="New password"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" disabled={!ready} />
              <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: S.t2, cursor: 'pointer' }}>
                <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>

            <input style={{ ...inp, marginBottom: 18 }} type={showPass ? 'text' : 'password'} placeholder="Confirm new password"
              value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" disabled={!ready} />

            {error && <p style={{ color: '#e0708e', fontSize: 13, marginBottom: 16 }}>{error}</p>}

            <button type="submit" disabled={loading || !ready}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', border: 'none', borderRadius: 10, color: '#0a0a0a', fontSize: 14, fontWeight: 700, cursor: loading || !ready ? 'default' : 'pointer', opacity: loading || !ready ? 0.6 : 1 }}>
              {loading ? 'Updating…' : 'Update password'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 18 }}>
              <a href="/login" style={{ color: S.t2, fontSize: 13, textDecoration: 'none' }}>← Back to login</a>
            </p>
          </form>
        )}
      </div>
      <style>{`@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');`}</style>
    </div>
  )
}
