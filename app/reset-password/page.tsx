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

  // The reset link drops the user here with recovery credentials either in the
  // URL hash (implicit flow) or as ?code= (PKCE). Both are processed async by
  // the client, so never declare the link dead on first look — listen for the
  // auth event and poll briefly before giving up.
  useEffect(() => {
    const supabase = createClient()
    let settled = false

    // Supabase reports link problems in the hash, e.g. #error_description=...
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const hashError = hashParams.get('error_description')
    if (hashError) {
      setError(decodeURIComponent(hashError.replace(/\+/g, ' ')) + ' — request a new link from the login page.')
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        settled = true
        setReady(true)
        setError('')
      }
    })

    // PKCE flow: exchange ?code= explicitly in case detectSessionInUrl missed it.
    const code = new URLSearchParams(window.location.search).get('code')
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) { settled = true; setReady(true); return }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { settled = true; setReady(true); return }
      }
    }
    bootstrap()

    // Give async URL detection a few seconds before declaring the link invalid.
    const timer = setTimeout(async () => {
      if (settled) return
      const { data } = await supabase.auth.getSession()
      if (data.session) { setReady(true); return }
      setError('This reset link is invalid or has expired. Request a new one from the login page.')
    }, 3500)

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
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
