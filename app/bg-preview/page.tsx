'use client'
import { useState } from 'react'
import Link from 'next/link'

type Mode = 'off' | 'subtle' | 'medium' | 'dramatic'

const MODES: { id: Mode; label: string; overlay: string; desc: string }[] = [
  { id: 'off',      label: 'Current (no image)', overlay: 'rgba(8,6,18,1)',    desc: 'The platform as it is today — no background.' },
  { id: 'subtle',   label: 'Subtle',             overlay: 'rgba(8,6,18,0.88)', desc: 'Silk texture barely visible — adds depth without distraction.' },
  { id: 'medium',   label: 'Medium',             overlay: 'rgba(8,6,18,0.75)', desc: 'Image clearly present, content fully readable.' },
  { id: 'dramatic', label: 'Dramatic',           overlay: 'rgba(8,6,18,0.55)', desc: 'Bold — SX logo and figures come through strongly.' },
]

// Silk texture as inline SVG data URI — approximates the dark satin fabric in the image
const SILK_BG = `
  radial-gradient(ellipse at 20% 50%, rgba(197,160,90,0.06) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 50%, rgba(197,160,90,0.04) 0%, transparent 45%),
  radial-gradient(ellipse at 50% 0%, rgba(197,160,90,0.03) 0%, transparent 60%),
  linear-gradient(135deg, #05040c 0%, #0a0810 25%, #07050f 50%, #09070e 75%, #04030a 100%)
`

const DEMO_CARDS = [
  { name: 'Élise V.', city: 'Brussels', price: '€250', tag: 'Verified' },
  { name: 'Sophia M.', city: 'Amsterdam', price: '€300', tag: 'Available' },
  { name: 'Victoria R.', city: 'Antwerp', price: '€200', tag: 'Featured' },
  { name: 'Chloé B.', city: 'Ghent', price: '€220', tag: null },
]

export default function BgPreviewPage() {
  const [mode, setMode] = useState<Mode>('medium')
  const [useRealImage, setUseRealImage] = useState(true)

  const current = MODES.find(m => m.id === mode)!
  const showBg = mode !== 'off'

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif", background: '#05040c' }}>

      {/* SVG noise filter for silk texture */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="silk-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feBlend in="SourceGraphic" in2="grey" mode="soft-light" result="blend" />
            <feComponentTransfer in="blend">
              <feFuncA type="linear" slope="0.04" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* ── CONTROL PANEL ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(4,3,10,0.96)', backdropFilter: 'blur(24px)', borderBottom: '0.5px solid rgba(197,160,90,0.2)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c5a05a', boxShadow: '0 0 10px rgba(197,160,90,0.7)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#c5a05a', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Background Preview</span>
        </div>
        {/* Mode buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding: '5px 14px', borderRadius: '20px', border: `0.5px solid ${mode === m.id ? '#c5a05a' : 'rgba(255,255,255,0.1)'}`, background: mode === m.id ? 'rgba(197,160,90,0.12)' : 'transparent', color: mode === m.id ? '#c5a05a' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: mode === m.id ? 600 : 400, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {m.label}
            </button>
          ))}
        </div>
        {/* Real image toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          <div onClick={() => setUseRealImage(!useRealImage)}
            style={{ width: '32px', height: '18px', borderRadius: '9px', background: useRealImage ? 'rgba(197,160,90,0.4)' : 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
            <div style={{ position: 'absolute', top: '2px', left: useRealImage ? '14px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: useRealImage ? '#c5a05a' : 'rgba(255,255,255,0.3)', transition: 'left .2s' }} />
          </div>
          <span>/sx-bg.jpg {useRealImage ? '(when uploaded)' : '→ CSS only'}</span>
        </label>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', maxWidth: '220px', lineHeight: 1.4 }}>{current.desc}</div>
        <Link href="/" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>← Platform</Link>
      </div>

      {/* ── PREVIEW CANVAS ── */}
      <div style={{ paddingTop: '56px', position: 'relative', minHeight: '100vh' }}>

        {/* Layer 1: CSS silk approximation (always visible when bg is on) */}
        {showBg && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0,
            background: SILK_BG,
            transition: 'opacity 0.5s ease',
          }} />
        )}

        {/* Layer 2: Real image (if uploaded + toggle on) */}
        {showBg && useRealImage && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1,
            backgroundImage: 'url(/sx-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }} />
        )}

        {/* Layer 3: Dark overlay — controls how much bg shows through */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2,
          background: current.overlay,
          transition: 'background 0.45s ease',
        }} />

        {/* Layer 4: Subtle vignette edges (always) */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(4,3,10,0.7) 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 4 }}>

          {/* ── NAV ── */}
          <nav style={{
            height: '64px', padding: '0 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: showBg ? 'rgba(5,4,12,0.5)' : 'rgba(8,6,18,0.95)',
            backdropFilter: 'blur(24px)',
            borderBottom: '0.5px solid rgba(197,160,90,0.1)',
            position: 'sticky', top: '56px', zIndex: 10,
            transition: 'background .45s',
          }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '30px', color: '#c5a05a', letterSpacing: '.02em', filter: showBg ? 'drop-shadow(0 0 18px rgba(197,160,90,0.55))' : 'none', transition: 'filter .45s' }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
              {['Escorts', 'Nightlife', 'Events', 'Discover', 'Regulations'].map(l => (
                <span key={l} style={{ fontSize: '13px', color: 'rgba(236,232,225,0.55)', cursor: 'default' }}>{l}</span>
              ))}
              <span style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#080612', cursor: 'default', boxShadow: showBg ? '0 4px 20px rgba(197,160,90,0.35)' : 'none', transition: 'box-shadow .45s' }}>
                Log in
              </span>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section style={{ padding: '7rem 2rem 6rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.38em', color: '#c5a05a', textTransform: 'uppercase', marginBottom: '1.5rem', opacity: 0.85, textShadow: showBg ? '0 0 28px rgba(197,160,90,0.6)' : 'none', transition: 'text-shadow .45s' }}>
                Premium · Verified · Discreet
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.6rem,6vw,4.2rem)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 1.4rem', color: '#ece6da', textShadow: showBg ? '0 4px 48px rgba(0,0,0,0.9)' : 'none', transition: 'text-shadow .45s' }}>
                Europe&apos;s Most <em style={{ fontStyle: 'italic', color: '#c5a05a' }}>Exclusive</em><br />Adult Lifestyle Platform
              </h1>
              <p style={{ fontSize: '16px', color: 'rgba(236,232,225,0.6)', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 2.75rem', textShadow: showBg ? '0 2px 12px rgba(0,0,0,0.95)' : 'none', transition: 'text-shadow .45s' }}>
                Discreet introductions to verified escorts, companions, nightlife venues and adult experiences across Belgium, Netherlands and Europe.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '14px 34px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: '10px', fontSize: '15px', fontWeight: 700, color: '#080612', cursor: 'default', boxShadow: showBg ? '0 8px 40px rgba(197,160,90,0.45)' : '0 4px 16px rgba(197,160,90,0.2)', transition: 'box-shadow .45s' }}>
                  Browse listings
                </span>
                <span style={{ padding: '14px 34px', background: showBg ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '15px', color: 'rgba(236,232,225,0.65)', cursor: 'default', backdropFilter: 'blur(16px)', transition: 'background .45s' }}>
                  ✦ Discover
                </span>
              </div>
            </div>
          </section>

          {/* ── LISTING CARDS ── */}
          <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <span style={{ width: '3px', height: '22px', background: 'linear-gradient(#c5a05a,#80602a)', borderRadius: '2px' }} />
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: 500, color: '#ece6da' }}>Featured Escorts</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '14px' }}>
              {DEMO_CARDS.map((c, i) => (
                <div key={i} style={{
                  background: showBg ? 'rgba(12,9,22,0.68)' : 'rgba(17,13,28,0.98)',
                  border: '0.5px solid rgba(197,160,90,0.14)',
                  borderRadius: '16px', overflow: 'hidden',
                  backdropFilter: showBg ? 'blur(20px) saturate(1.2)' : 'none',
                  transition: 'background .45s, backdrop-filter .45s',
                  boxShadow: showBg ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
                }}>
                  <div style={{ height: '210px', background: `linear-gradient(155deg, rgba(197,160,90,0.${10+i*4}), rgba(100,65,20,0.${5+i*2}), rgba(8,6,18,0.9))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '42px', opacity: 0.18, color: '#c5a05a' }}>◈</span>
                    {c.tag && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', background: c.tag === 'Verified' ? 'rgba(38,212,160,0.18)' : c.tag === 'Featured' ? 'rgba(197,160,90,0.18)' : 'rgba(75,159,255,0.18)', color: c.tag === 'Verified' ? '#26d4a0' : c.tag === 'Featured' ? '#c5a05a' : '#4b9fff', border: `0.5px solid currentColor`, borderRadius: '8px', padding: '2px 9px', backdropFilter: 'blur(8px)', opacity: 0.9 }}>{c.tag}</span>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(8,6,18,0.85) 100%)' }} />
                  </div>
                  <div style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#ece6da' }}>{c.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#c5a05a' }}>{c.price}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(236,232,225,0.4)' }}>📍 {c.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── STATS BAR ── */}
          <section style={{
            borderTop: '0.5px solid rgba(197,160,90,0.1)',
            borderBottom: '0.5px solid rgba(197,160,90,0.1)',
            padding: '2.75rem 1.5rem',
            background: showBg ? 'rgba(5,4,12,0.5)' : 'rgba(12,9,22,0.95)',
            backdropFilter: 'blur(16px)',
            transition: 'background .45s',
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
              {[['2,400+', 'Verified listings'], ['8', 'EU countries'], ['100%', 'Discreet'], ['24/7', 'Support']].map(([num, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.6rem', fontWeight: 300, color: '#c5a05a', lineHeight: 1, textShadow: showBg ? '0 0 30px rgba(197,160,90,0.4)' : 'none', transition: 'text-shadow .45s' }}>{num}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(236,232,225,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '5px' }}>{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── UPLOAD INSTRUCTIONS ── */}
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '1.5rem 2rem', background: showBg ? 'rgba(12,9,22,0.65)' : 'rgba(17,13,28,0.9)', border: '0.5px solid rgba(197,160,90,0.2)', borderRadius: '16px', backdropFilter: 'blur(16px)', maxWidth: '560px', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#c5a05a', textTransform: 'uppercase', marginBottom: '0.75rem' }}>To use the real SX image</div>
              <ol style={{ fontSize: '13px', color: 'rgba(236,232,225,0.55)', lineHeight: 2, margin: 0, paddingLeft: '1.25rem' }}>
                <li>Go to your GitHub repo → <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px', color: '#c5a05a' }}>public/</code> folder</li>
                <li>Click <strong style={{ color: '#ece6da' }}>Add file → Upload files</strong></li>
                <li>Upload the SX image and name it <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px', color: '#c5a05a' }}>sx-bg.jpg</code></li>
                <li>Commit — this page will automatically use it</li>
              </ol>
              <div style={{ marginTop: '1rem', fontSize: '12px', color: 'rgba(236,232,225,0.35)' }}>
                The CSS silk approximation above is active right now until the real image is uploaded.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
