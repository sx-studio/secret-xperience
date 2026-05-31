'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

const SITE = 'https://secretxperience.eu'

export default function ReferPage() {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, qualified: 0, rewardTokens: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setAuthed(false); setLoading(false); return }
        setAuthed(true)
        const res = await fetch('/api/referrals/me')
        if (res.ok) {
          const json = await res.json()
          setCode(json.code)
          setStats({ pending: json.pending || 0, qualified: json.qualified || 0, rewardTokens: json.rewardTokens || 0 })
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    })()
  }, [])

  const link = code ? `${SITE}/login?ref=${code}` : ''

  async function share() {
    const text = 'List with me on SecretXperience — free, permanent listings across the EU.'
    try {
      if ((navigator as any).share) { await (navigator as any).share({ title: 'SecretXperience', text, url: link }); return }
    } catch { /* fall through */ }
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  const card: React.CSSProperties = { background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.5rem' }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)' }}>
      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <Link href="/dashboard" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-arrow-left" /> Dashboard</Link>
      </nav>

      {/* HERO */}
      <section style={{ padding: '4.5rem 1.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid var(--b)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(197,160,90,0.08) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '620px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Refer & earn</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,6vw,46px)', fontWeight: 400, margin: '0 0 1rem', lineHeight: 1.1 }}>Invite providers. Earn featured credit.</h1>
          <p style={{ fontSize: '15px', color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>
            Share your link with other providers. When someone you invite publishes their first listing, we credit you <strong style={{ color: 'var(--gold)' }}>75 tokens</strong> automatically — enough to feature a listing and rise to the top.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ ...card, textAlign: 'center', color: 'var(--t3)' }}>Loading…</div>
        ) : authed === false ? (
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ color: 'var(--t2)', margin: '0 0 1.25rem' }}>Log in to get your personal referral link.</p>
            <Link href="/login?next=/refer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <i className="ti ti-login" /> Log in
            </Link>
          </div>
        ) : (
          <>
            {/* Referral link */}
            <div style={card}>
              <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '12px' }}>Your referral link</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input readOnly value={link} onFocus={e => e.currentTarget.select()} style={{ flex: '1 1 240px', minWidth: 0, padding: '12px 14px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', fontFamily: 'monospace' }} />
                <button onClick={copy} style={{ padding: '12px 18px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? '✓ Copied' : 'Copy'}</button>
                <button onClick={share} style={{ padding: '12px 18px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>↗ Share</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
              {[
                { label: 'Invited', value: stats.pending + stats.qualified, hint: 'signed up' },
                { label: 'Qualified', value: stats.qualified, hint: 'published a listing' },
                { label: 'Tokens earned', value: stats.rewardTokens, hint: 'credited to you' },
              ].map(s => (
                <div key={s.label} style={{ ...card, textAlign: 'center', padding: '1.25rem 0.75rem' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '34px', color: 'var(--gold)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t)', marginTop: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{s.hint}</div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={card}>
              <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '14px' }}>How it works</div>
              {[
                ['Share your link', 'Send it to other providers — on socials, in DMs, anywhere.'],
                ['They sign up & list', 'Your link tags them to you when they join.'],
                ['You get 75 tokens', 'Credited automatically the moment they publish their first listing.'],
              ].map(([t, d], i) => (
                <div key={t} style={{ display: 'flex', gap: '12px', padding: i === 0 ? '0 0 14px' : '14px 0', borderTop: i === 0 ? 'none' : '0.5px solid var(--b)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', color: '#0a0a0a', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t)' }}>{t}</div>
                    <div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '2px', lineHeight: 1.6 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
