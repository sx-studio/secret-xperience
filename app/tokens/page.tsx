'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

interface Package {
  id: string
  name: string
  slug: string
  tokens: number
  bonus_tokens: number
  price_eur: number
  popular: boolean
}

interface Wallet {
  balance: number
  total_purchased: number
  total_spent: number
}

interface LedgerEntry {
  id: string
  amount: number
  type: 'purchase' | 'spend' | 'refund'
  description: string
  created_at: string
  balance_after: number
}

const TIER_COSTS = [
  { tier: 'basic',    label: 'Basic Listing',    tokens: 0,   days: 1,  desc: 'Standard grid listing — free, 24-hour duration, one per day.' },
  { tier: 'featured', label: 'Featured Listing',  tokens: 50,  days: 7,  desc: 'Gold-bordered card, priority placement in category grid.' },
  { tier: 'slider',   label: 'Slider Ad',         tokens: 75,  days: 7,  desc: 'Animated ad in the GSAP slider on every page — maximum visibility.' },
  { tier: 'premium',  label: 'Premium Listing',   tokens: 150, days: 30, desc: 'Top of category for 30 days, larger card, premium badge.' },
]

const ADD_ONS = [
  { label: 'Photo gallery add-on',   tokens: 15  },
  { label: 'Verification badge',     tokens: 25  },
  { label: 'Top boost (24 h)',        tokens: 75  },
]

const S = {
  bg:    '#080808',
  bg2:   '#0e0c18',
  t:     '#e8e0d0',
  t2:    '#888',
  t3:    '#555',
  gold:  '#c5a05a',
  serif: "'Cormorant Garamond', serif",
  sans:  "'Jost', sans-serif",
}

export default function TokensPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [wallet,   setWallet]   = useState<Wallet | null>(null)
  const [ledger,   setLedger]   = useState<LedgerEntry[]>([])
  const [session,  setSession]  = useState<any>(null)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [status,   setStatus]   = useState<'idle' | 'success' | 'cancel'>('idle')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('status') === 'success') setStatus('success')
    if (sp.get('status') === 'cancel')  setStatus('cancel')
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        supabase.from('user_wallets').select('balance,total_purchased,total_spent').eq('user_id', session.user.id).single()
          .then(({ data }) => setWallet(data))
        supabase.from('token_ledger').select('id,amount,type,description,created_at,balance_after').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(15)
          .then(({ data }) => setLedger(data || []))
      }
    })
    supabase.from('token_packages').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => setPackages(data || []))
  }, [])

  async function handlePurchase(pkg: Package) {
    if (!session) { window.location.href = '/login?redirect=/tokens'; return }
    setLoading(true)
    setSelected(pkg.id)
    try {
      const res  = await fetch('/api/ccbill/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Payment initiation failed')
    } catch {
      alert('Network error — please try again')
    } finally {
      setLoading(false)
      setSelected(null)
    }
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:${S.gold};text-decoration:none}
        .pkg-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(197,160,90,0.12)!important}
        .pkg-card{transition:transform .2s,box-shadow .2s}
        .buy-btn:hover{filter:brightness(1.12)}
        .buy-btn{transition:filter .15s}
        @media(max-width:640px){.pkg-grid{grid-template-columns:1fr!important}.tier-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Nav */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(8,8,8,0.96)', backdropFilter:'blur(12px)', borderBottom:`0.5px solid #c5a05a22`, padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <a href="/" style={{ fontFamily:S.serif, fontSize:18, fontWeight:600, color:S.t, letterSpacing:'0.04em' }}>Secret<span style={{ color:S.gold }}>Xperience</span></a>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {wallet && (
            <span style={{ fontSize:13, color:S.gold, fontWeight:600 }}>
              ◈ {wallet.balance.toLocaleString()} tokens
            </span>
          )}
          <a href="/" style={{ fontSize:13, color:S.t2 }}>← Back</a>
        </div>
      </header>

      {/* Status banners */}
      {status === 'success' && (
        <div style={{ background:'rgba(29,201,143,0.12)', border:'0.5px solid rgba(29,201,143,0.3)', padding:'14px 24px', textAlign:'center', fontSize:14, color:'#1dc98f' }}>
          ✓ Payment successful — your tokens have been credited to your account!
        </div>
      )}
      {status === 'cancel' && (
        <div style={{ background:'rgba(224,90,90,0.1)', border:'0.5px solid rgba(224,90,90,0.3)', padding:'14px 24px', textAlign:'center', fontSize:14, color:'#e05a5a' }}>
          Payment cancelled — no charges were made.
        </div>
      )}

      <main style={{ maxWidth:1080, margin:'0 auto', padding:'4rem 24px 6rem' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:'4rem' }}>
          <p style={{ fontSize:11, letterSpacing:'0.16em', color:S.gold, textTransform:'uppercase', marginBottom:'1rem' }}>◈ Token Credits</p>
          <h1 style={{ fontFamily:S.serif, fontSize:'clamp(36px,5vw,58px)', fontWeight:400, lineHeight:1.1, marginBottom:'1rem' }}>
            Power your <em style={{ color:S.gold, fontStyle:'italic' }}>listings</em>
          </h1>
          <p style={{ fontSize:15, color:S.t2, maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>
            Purchase token credits to publish, feature, and boost your listings. Tokens never expire — use them whenever you're ready.
          </p>
        </div>

        {/* Wallet card (logged-in) */}
        {wallet && (
          <div style={{ background:'linear-gradient(135deg,#1a1408 0%,#0e0c08 100%)', border:`0.5px solid #c5a05a33`, borderRadius:16, padding:'1.5rem 2rem', marginBottom:'3rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:'0.1em', color:S.gold, textTransform:'uppercase', marginBottom:'0.4rem' }}>Your balance</p>
              <p style={{ fontFamily:S.serif, fontSize:42, fontWeight:400, color:S.t, lineHeight:1 }}>
                {wallet.balance.toLocaleString()} <span style={{ fontSize:18, color:S.gold }}>tokens</span>
              </p>
            </div>
            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11, color:S.t3, letterSpacing:'0.08em', textTransform:'uppercase' }}>Purchased</p>
                <p style={{ fontSize:20, fontWeight:600, color:S.t }}>{wallet.total_purchased.toLocaleString()}</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11, color:S.t3, letterSpacing:'0.08em', textTransform:'uppercase' }}>Spent</p>
                <p style={{ fontSize:20, fontWeight:600, color:S.t }}>{wallet.total_spent.toLocaleString()}</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11, color:S.t3, letterSpacing:'0.08em', textTransform:'uppercase' }}>Value left</p>
                <p style={{ fontSize:20, fontWeight:600, color:S.gold }}>
                  ≈ €{(wallet.balance * (75 / 850)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction history */}
        {ledger.length > 0 && (
          <div style={{ marginBottom:'3rem' }}>
            <h2 style={{ fontFamily:S.serif, fontSize:22, fontWeight:400, marginBottom:'1rem' }}>
              Transaction <em style={{ color:S.gold, fontStyle:'italic' }}>history</em>
            </h2>
            <div style={{ background:'#0a0908', border:'0.5px solid #ffffff0f', borderRadius:12, overflow:'hidden' }}>
              {ledger.map((entry, i) => (
                <div key={entry.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom: i < ledger.length - 1 ? '0.5px solid #ffffff08' : 'none', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background: entry.type === 'purchase' ? 'rgba(62,207,142,0.1)' : entry.type === 'spend' ? 'rgba(197,160,90,0.1)' : 'rgba(130,100,220,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>
                      {entry.type === 'purchase' ? '↓' : entry.type === 'spend' ? '◈' : '↑'}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, color:S.t, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{entry.description}</div>
                      <div style={{ fontSize:11, color:S.t3 }}>{new Date(entry.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color: entry.type === 'purchase' ? '#3ecf8e' : entry.amount < 0 ? '#e2536b' : S.gold }}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount} ◈
                    </div>
                    <div style={{ fontSize:11, color:S.t3 }}>bal: {entry.balance_after}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token packages */}
        <h2 style={{ fontFamily:S.serif, fontSize:28, fontWeight:400, marginBottom:'1.5rem' }}>
          Buy tokens <span style={{ color:S.gold }}>—</span> get more, save more
        </h2>
        <div className="pkg-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16, marginBottom:'4rem' }}>
          {packages.map(pkg => {
            const total = pkg.tokens + pkg.bonus_tokens
            const ppt   = (pkg.price_eur / total).toFixed(3) // price per token
            const isPop = pkg.popular
            return (
              <div key={pkg.id} className="pkg-card" style={{
                position:'relative',
                background: isPop ? 'linear-gradient(135deg,#1a1408 0%,#120e04 100%)' : '#0a0908',
                border:`0.5px solid ${isPop ? '#c5a05a55' : '#ffffff14'}`,
                borderRadius:16, padding:'1.75rem 1.5rem',
                boxShadow: isPop ? '0 8px 32px rgba(197,160,90,0.1)' : 'none',
              }}>
                {isPop && (
                  <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(90deg,#c5a05a,#e8c97e)', borderRadius:20, padding:'4px 14px', fontSize:10, fontWeight:700, color:'#080808', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <p style={{ fontSize:13, fontWeight:600, color:S.t, letterSpacing:'0.04em', marginBottom:'0.5rem' }}>{pkg.name}</p>
                <p style={{ fontFamily:S.serif, fontSize:42, fontWeight:400, color:S.gold, lineHeight:1, marginBottom:'0.25rem' }}>
                  {pkg.tokens.toLocaleString()}
                  {pkg.bonus_tokens > 0 && <span style={{ fontSize:16, color:'#1dc98f', marginLeft:6 }}>+{pkg.bonus_tokens}</span>}
                </p>
                <p style={{ fontSize:12, color:S.t3, marginBottom:'1.25rem' }}>tokens · €{ppt}/token</p>
                <p style={{ fontFamily:S.serif, fontSize:26, fontWeight:400, color:S.t, marginBottom:'1.5rem' }}>€{pkg.price_eur.toFixed(2)}</p>
                <button className="buy-btn" onClick={() => handlePurchase(pkg)}
                  disabled={loading && selected === pkg.id}
                  style={{
                    width:'100%', padding:'12px 0',
                    background: isPop ? 'linear-gradient(90deg,#c5a05a,#d4b06e)' : 'transparent',
                    border:`0.5px solid ${isPop ? 'transparent' : '#c5a05a55'}`,
                    borderRadius:8, color: isPop ? '#080808' : S.gold,
                    fontFamily:S.sans, fontWeight:600, fontSize:13, cursor:'pointer',
                    letterSpacing:'0.04em',
                  }}>
                  {loading && selected === pkg.id ? 'Redirecting…' : `Buy ${total.toLocaleString()} tokens`}
                </button>
              </div>
            )
          })}
        </div>

        {/* How tokens are used */}
        <h2 style={{ fontFamily:S.serif, fontSize:28, fontWeight:400, marginBottom:'0.5rem' }}>
          Listing <em style={{ color:S.gold, fontStyle:'italic' }}>tiers</em>
        </h2>
        <p style={{ fontSize:14, color:S.t2, marginBottom:'2rem' }}>Choose the right visibility for your listing. Tiers stack — extend any time by spending more tokens.</p>
        <div className="tier-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, marginBottom:'3rem' }}>
          {TIER_COSTS.map(t => (
            <div key={t.tier} style={{ background:'#0a0908', border:'0.5px solid #ffffff14', borderRadius:12, padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
                <span style={{ fontSize:13, fontWeight:600, color:S.t }}>{t.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:S.gold, background:'rgba(197,160,90,0.12)', borderRadius:6, padding:'2px 8px' }}>
                  {t.tokens === 0 ? 'Free' : `${t.tokens} ◈`}
                </span>
              </div>
              <p style={{ fontSize:12, color:S.t2, lineHeight:1.6, marginBottom:'0.6rem' }}>{t.desc}</p>
              <p style={{ fontSize:11, color:S.t3 }}>Duration: {t.days === 1 ? '24 hours' : `${t.days} days`}</p>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <h2 style={{ fontFamily:S.serif, fontSize:28, fontWeight:400, marginBottom:'1.25rem' }}>
          Add‑ons
        </h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:'4rem' }}>
          {ADD_ONS.map(a => (
            <div key={a.label} style={{ background:'#0a0908', border:'0.5px solid #ffffff14', borderRadius:10, padding:'0.75rem 1.25rem', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:13, color:S.t }}>{a.label}</span>
              <span style={{ fontSize:12, fontWeight:700, color:S.gold }}>{a.tokens} ◈</span>
            </div>
          ))}
        </div>

        {/* Payment methods + compliance */}
        <div style={{ borderTop:`0.5px solid #ffffff0a`, paddingTop:'2rem' }}>
          <p style={{ fontSize:11, letterSpacing:'0.1em', color:S.t3, textTransform:'uppercase', marginBottom:'1rem' }}>Accepted payment methods</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:'1.5rem' }}>
            {['Visa', 'Mastercard', 'Cryptocurrency', 'Bank Transfer'].map(m => (
              <span key={m} style={{ fontSize:12, color:S.t2, background:'#0f0f0f', border:'0.5px solid #ffffff14', borderRadius:8, padding:'6px 14px' }}>{m}</span>
            ))}
          </div>
          <p style={{ fontSize:12, color:S.t3, lineHeight:1.8, maxWidth:640 }}>
            Payments are processed securely via CCBill, an adult-friendly payment processor. All transactions are encrypted. Tokens are non-refundable except as required by applicable Belgian consumer law (14-day withdrawal right). Token purchases appear discreetly on your statement. By purchasing you agree to our <a href="/terms">Terms of Use</a>.
          </p>
        </div>
      </main>

      <footer style={{ borderTop:`0.5px solid #c5a05a22`, padding:'2rem 24px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:S.t2 }}>© 2025 SecretXperience.eu · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/contact">Support</a></p>
      </footer>
    </div>
  )
}
