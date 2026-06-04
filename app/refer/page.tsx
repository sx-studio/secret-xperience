'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

const SITE = 'https://secretxperience.eu'

const MSG_ADVERTISER = (link: string) =>
  `Hey! I list on SecretXperience — the new premium adult platform across the EU. Free to join, real bookings, discreet. Create your listing here: ${link}`

const MSG_CLIENT = (link: string) =>
  `Check out SecretXperience — the most discreet way to find escorts, venues, events and more across Europe. Sign up here: ${link}`

export default function ReferPage() {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, qualified: 0, rewardTokens: 0 })
  const [copied, setCopied] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState<'provider' | 'client' | null>(null)
  const [msgType, setMsgType] = useState<'provider' | 'client'>('provider')

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
  const msgText = msgType === 'provider' ? MSG_ADVERTISER(link) : MSG_CLIENT(link)
  const waLink = `https://wa.me/?text=${encodeURIComponent(msgText)}`
  const smsLink = `sms:?body=${encodeURIComponent(msgText)}`
  const tgLink = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msgType === 'provider' ? MSG_ADVERTISER('') : MSG_CLIENT(''))}`

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  async function copyMsg(type: 'provider' | 'client') {
    const text = type === 'provider' ? MSG_ADVERTISER(link) : MSG_CLIENT(link)
    try { await navigator.clipboard.writeText(text); setCopiedMsg(type); setTimeout(() => setCopiedMsg(null), 2000) } catch { /* ignore */ }
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
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,6vw,46px)', fontWeight: 400, margin: '0 0 1rem', lineHeight: 1.1 }}>Invite advertisers. Earn featured credit.</h1>
          <p style={{ fontSize: '15px', color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>
            Share your link with other advertisers. When someone you invite publishes their first listing, we credit you <strong style={{ color: 'var(--gold)' }}>75 tokens</strong> automatically — enough to feature a listing and rise to the top.
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
                <button onClick={copy} style={{ padding: '12px 18px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? '✓ Copied' : 'Copy link'}</button>
              </div>
            </div>

            {/* Share via messaging */}
            <div style={card}>
              <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '14px' }}>Send it directly</div>

              {/* Message type toggle */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['provider', 'client'] as const).map(t => (
                  <button key={t} onClick={() => setMsgType(t)} style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: `0.5px solid ${msgType === t ? 'var(--gold)' : 'var(--b2)'}`, background: msgType === t ? 'rgba(197,160,90,0.1)' : 'transparent', color: msgType === t ? 'var(--gold)' : 'var(--t2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {t === 'provider' ? '🎭 For advertisers' : '👤 For clients'}
                  </button>
                ))}
              </div>

              {/* Pre-written message preview */}
              <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', padding: '14px', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.7, marginBottom: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {msgText}
              </div>

              {/* Channel buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '8px' }}>
                <a href={smsLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 14px', background: '#1a9e3f', border: 'none', borderRadius: 'var(--r)', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                  <i className="ti ti-message" /> SMS
                </a>
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 14px', background: '#25d366', border: 'none', borderRadius: 'var(--r)', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="ti ti-brand-whatsapp" /> WhatsApp
                </a>
                <a href={tgLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 14px', background: '#229ed9', border: 'none', borderRadius: 'var(--r)', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="ti ti-brand-telegram" /> Telegram
                </a>
                <button onClick={() => copyMsg(msgType)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 14px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <i className={`ti ti-${copiedMsg === msgType ? 'check' : 'copy'}`} /> {copiedMsg === msgType ? 'Copied!' : 'Copy text'}
                </button>
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
                ['Share your link', 'Send it to other advertisers — on socials, in DMs, anywhere.'],
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
