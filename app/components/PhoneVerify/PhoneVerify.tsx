'use client'

import { useState } from 'react'

type Channel = 'sms' | 'whatsapp'

interface Props {
  profile: any
  onUpdate: (patch: Record<string, any>) => void
}

const SLOTS: { channel: Channel; numberKey: string; verifiedKey: string; showKey: string; label: string; icon: string; hint: string }[] = [
  { channel: 'sms',      numberKey: 'phone',    verifiedKey: 'phone_verified',    showKey: 'show_phone',    label: 'Phone number', icon: 'ti-phone',          hint: 'We text you a code by SMS.' },
  { channel: 'whatsapp', numberKey: 'whatsapp', verifiedKey: 'whatsapp_verified', showKey: 'show_whatsapp', label: 'WhatsApp',     icon: 'ti-brand-whatsapp', hint: 'We message you a code on WhatsApp.' },
]

function Slot({ channel, numberKey, verifiedKey, showKey, label, icon, hint, profile, onUpdate }: any) {
  const verified = !!profile?.[verifiedKey]
  const saved    = profile?.[numberKey] || ''
  const [number, setNumber] = useState<string>(saved)
  const [stage, setStage]   = useState<'idle' | 'sent'>('idle')
  const [code, setCode]     = useState('')
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')
  const [editing, setEditing] = useState(false)

  async function sendCode() {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/phone/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: number.trim(), channel }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error || 'Could not send the code.'); setBusy(false); return }
      setStage('sent')
    } catch { setError('Network error. Try again.') }
    setBusy(false)
  }

  async function checkCode() {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/phone/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: number.trim(), code: code.trim(), channel }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.error || 'Incorrect code.'); setBusy(false); return }
      const now = new Date().toISOString()
      onUpdate(channel === 'whatsapp'
        ? { whatsapp: number.trim(), whatsapp_verified: true, whatsapp_verified_at: now }
        : { phone: number.trim(), phone_verified: true, phone_verified_at: now })
      setStage('idle'); setCode(''); setEditing(false)
    } catch { setError('Network error. Try again.') }
    setBusy(false)
  }

  const inp: React.CSSProperties = { flex: '1 1 180px', minWidth: 0, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'var(--t,#ece8e1)', fontSize: '14px', fontFamily: 'var(--sans)' }
  const btnGold: React.CSSProperties = { padding: '10px 18px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', border: 'none', borderRadius: '8px', color: '#0a0a0a', fontSize: '13px', fontWeight: 700, cursor: busy ? 'default' : 'pointer', whiteSpace: 'nowrap', opacity: busy ? 0.6 : 1 }
  const btnGhost: React.CSSProperties = { padding: '10px 14px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'var(--t2,#8c8880)', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }

  return (
    <div style={{ padding: '14px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <i className={`ti ${icon}`} style={{ fontSize: '18px', color: verified ? 'var(--verified,#3ecf8e)' : 'var(--gold,#c5a05a)' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t,#ece8e1)' }}>{label}</span>
        {verified && !editing && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--verified,#3ecf8e)', background: 'rgba(62,207,142,0.1)', border: '0.5px solid rgba(62,207,142,0.3)', borderRadius: '20px', padding: '2px 10px', letterSpacing: '0.04em' }}>✓ Verified</span>
        )}
      </div>

      {verified && !editing ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', color: 'var(--t,#ece8e1)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{saved}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--t2,#8c8880)', cursor: 'pointer' }}>
              <input type="checkbox" checked={profile?.[showKey] !== false} onChange={e => onUpdate({ [showKey]: e.target.checked })} />
              Show on listing
            </label>
            <button style={btnGhost} onClick={() => { setEditing(true); setStage('idle'); setNumber(saved) }}>Change</button>
          </div>
        </div>
      ) : stage === 'idle' ? (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input style={inp} value={number} onChange={e => setNumber(e.target.value)} placeholder="+32 470 12 34 56" inputMode="tel" />
            <button style={btnGold} disabled={busy} onClick={sendCode}>{busy ? 'Sending…' : 'Send code'}</button>
            {editing && <button style={btnGhost} onClick={() => setEditing(false)}>Cancel</button>}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--t3,rgba(255,255,255,0.3))', marginTop: '7px' }}>{hint} Use international format (e.g. +32…).</p>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input style={inp} value={code} onChange={e => setCode(e.target.value)} placeholder="Enter 6-digit code" inputMode="numeric" maxLength={10} />
            <button style={btnGold} disabled={busy} onClick={checkCode}>{busy ? 'Checking…' : 'Verify'}</button>
            <button style={btnGhost} onClick={() => { setStage('idle'); setCode(''); setError('') }}>Back</button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--t3,rgba(255,255,255,0.3))', marginTop: '7px' }}>Code sent to {number}. <button onClick={sendCode} disabled={busy} style={{ background: 'none', border: 'none', color: 'var(--gold,#c5a05a)', cursor: 'pointer', fontSize: '11px', padding: 0 }}>Resend</button></p>
        </>
      )}

      {error && <p style={{ fontSize: '12px', color: '#e05a5a', marginTop: '7px' }}>{error}</p>}
    </div>
  )
}

export default function PhoneVerify({ profile, onUpdate }: Props) {
  return (
    <div className="db-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <i className="ti ti-device-mobile-message" style={{ fontSize: '18px', color: 'var(--gold,#c5a05a)' }} />
        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--t,#ece8e1)' }}>Contact numbers</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--t2,#8c8880)', lineHeight: 1.5, marginBottom: '4px' }}>
        Verify a phone and/or WhatsApp number. Verified numbers appear on your listings so clients can reach you directly. You choose which to show.
      </p>
      {SLOTS.map(s => <Slot key={s.channel} {...s} profile={profile} onUpdate={onUpdate} />)}
    </div>
  )
}
