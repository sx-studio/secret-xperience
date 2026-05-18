'use client'

import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'
import { createClient } from '../lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        background: '#101010',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#c5a05a', textAlign: 'center', marginBottom: '0.5rem' }}>
          SecretXperience
        </h1>
        <p style={{ color: '#8c8880', textAlign: 'center', marginBottom: '2rem', fontSize: '14px' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </p>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '0.75rem',
          background: '#222', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', color: '#ece8e1', cursor: 'pointer',
          marginBottom: '1.5rem', fontSize: '14px'
        }}>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', color: '#4c4a47', marginBottom: '1.5rem', fontSize: '12px' }}>
          or
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <input
                placeholder="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={inputStyle}
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={inputStyle}
              >
                <option value="user">User</option>
                <option value="provider">Provider</option>
                <option value="venue">Venue</option>
                <option value="creator">Creator</option>
              </select>
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: '#b84d72', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.75rem',
            background: '#c5a05a', border: 'none',
            borderRadius: '8px', color: '#080808',
            cursor: 'pointer', fontWeight: '600', fontSize: '14px'
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#8c8880', fontSize: '13px', marginTop: '1.5rem' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: '#c5a05a', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem',
  background: '#181818', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', color: '#ece8e1',
  marginBottom: '1rem', fontSize: '14px'
}