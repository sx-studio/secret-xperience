'use client'
import { useState } from 'react'
import Link from 'next/link'

type Mode = 'off' | 'subtle' | 'medium' | 'dramatic'

const MODES: { id: Mode; label: string; overlay: string; desc: string }[] = [
  { id: 'off',      label: 'Current (no image)', overlay: 'rgba(8,6,18,1)',    desc: 'The platform as it is today.' },
  { id: 'subtle',   label: 'Subtle',             overlay: 'rgba(8,6,18,0.88)', desc: 'Background barely visible — texture only.' },
  { id: 'medium',   label: 'Medium',             overlay: 'rgba(8,6,18,0.75)', desc: 'Image present but content clearly readable.' },
  { id: 'dramatic', label: 'Dramatic',           overlay: 'rgba(8,6,18,0.55)', desc: 'Bold image presence — high visual impact.' },
]

// Dummy listing cards for the preview
const DEMO_CARDS = [
  { name: 'Élise V.', city: 'Brussels', price: '€250', tag: 'Verified', img: null },
  { name: 'Sophia M.', city: 'Amsterdam', price: '€300', tag: 'Available', img: null },
  { name: 'Victoria R.', city: 'Antwerp', price: '€200', tag: 'Featured', img: null },
  { name: 'Chloé B.', city: 'Ghent', price: '€220', tag: null, img: null },
]

export default function BgPreviewPage() {
  const [mode, setMode] = useState<Mode>('medium')

  const current = MODES.find(m => m.id === mode)!
  const showImage = mode !== 'off'

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif", background: '#08060f' }}>

      {/* ── CONTROL PANEL ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(197,160,90,0.25)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c5a05a', boxShadow: '0 0 8px #c5a05a' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(197,160,90,0.9)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Background Preview</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>— comparing /sx-bg.jpg</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: `0.5px solid ${mode === m.id ? '#c5a05a' : 'rgba(255,255,255,0.12)'}`, background: mode === m.id ? 'rgba(197,160,90,0.15)' : 'transparent', color: mode === m.id ? '#c5a05a' : 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: mode === m.id ? 600 : 400, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {m.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', maxWidth: '260px' }}>
          {current.desc}
        </div>
        <Link href="/" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ← Back to platform
        </Link>
      </div>

      {/* ── PREVIEW CANVAS ── */}
      <div style={{ paddingTop: '60px', position: 'relative' }}>

        {/* Background image layer */}
        {showImage && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0,
            backgroundImage: 'url(/sx-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundAttachment: 'fixed',
            transition: 'opacity 0.4s ease',
          }} />
        )}

        {/* Overlay layer */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1,
          background: current.overlay,
          transition: 'background 0.4s ease',
        }} />

        {/* Content — sits above both layers */}
        <div style={{ position: 'relative', zIndex: 2 }}>

          {/* ── NAV ── */}
          <nav style={{ height: '64px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: showImage ? 'rgba(8,6,18,0.55)' : 'rgba(8,6,18,0.92)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(197,160,90,0.12)', position: 'sticky', top: '60px', zIndex: 10, transition: 'background .4s' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '28px', color: '#c5a05a', letterSpacing: '.02em', filter: 'drop-shadow(0 0 14px rgba(197,160,90,0.5))' }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {['Escorts', 'Nightlife', 'Events', 'Discover'].map(l => (
                <span key={l} style={{ fontSize: '13px', color: 'rgba(236,232,225,0.65)', cursor: 'default' }}>{l}</span>
              ))}
              <span style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#080612', cursor: 'default' }}>Log in</span>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section style={{ padding: '6rem 1.5rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Radial glow — more visible when image is off */}
            {!showImage && (
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(197,160,90,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
            )}
            <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.32em', color: '#c5a05a', textTransform: 'uppercase', marginBottom: '1.5rem', textShadow: showImage ? '0 0 20px rgba(197,160,90,0.6)' : 'none', transition: 'text-shadow .4s' }}>
                Premium · Verified · Discreet
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 1.25rem', color: '#ece6da', textShadow: showImage ? '0 4px 40px rgba(0,0,0,0.8)' : 'none', transition: 'text-shadow .4s' }}>
                Europe&apos;s Most <em style={{ fontStyle: 'italic', color: '#c5a05a' }}>Exclusive</em><br />Adult Lifestyle Platform
              </h1>
              <p style={{ fontSize: '16px', color: 'rgba(236,232,225,0.65)', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 2.5rem', textShadow: showImage ? '0 2px 10px rgba(0,0,0,0.9)' : 'none', transition: 'text-shadow .4s' }}>
                Discreet introductions to verified escorts, companions, nightlife venues and adult experiences across Belgium, Netherlands and Europe.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '13px 32px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: '10px', fontSize: '15px', fontWeight: 700, color: '#080612', cursor: 'default', boxShadow: showImage ? '0 8px 32px rgba(197,160,90,0.4)' : 'none', transition: 'box-shadow .4s' }}>
                  Browse listings
                </span>
                <span style={{ padding: '13px 32px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '15px', color: 'rgba(236,232,225,0.7)', cursor: 'default', backdropFilter: 'blur(12px)' }}>
                  ✦ Discover
                </span>
              </div>
            </div>
          </section>

          {/* ── LISTING CARDS GRID ── */}
          <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <span style={{ width: '3px', height: '20px', background: 'linear-gradient(#c5a05a,#a0803d)', borderRadius: '2px' }} />
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '22px', fontWeight: 500, color: '#ece6da' }}>Featured Escorts</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
              {DEMO_CARDS.map((c, i) => (
                <div key={i} style={{ background: showImage ? 'rgba(17,13,28,0.72)' : 'rgba(17,13,28,1)', border: '0.5px solid rgba(197,160,90,0.14)', borderRadius: '14px', overflow: 'hidden', backdropFilter: showImage ? 'blur(18px)' : 'none', transition: 'background .4s, backdrop-filter .4s' }}>
                  {/* Card image placeholder */}
                  <div style={{ height: '200px', background: `linear-gradient(140deg, rgba(197,160,90,0.${8+i*3}), rgba(120,80,30,0.${4+i*2}))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '36px', opacity: 0.3 }}>◈</span>
                    {c.tag && (
                      <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', background: c.tag === 'Verified' ? 'rgba(38,212,160,0.2)' : c.tag === 'Featured' ? 'rgba(197,160,90,0.2)' : 'rgba(75,159,255,0.2)', color: c.tag === 'Verified' ? '#26d4a0' : c.tag === 'Featured' ? '#c5a05a' : '#4b9fff', border: `0.5px solid ${c.tag === 'Verified' ? 'rgba(38,212,160,0.4)' : c.tag === 'Featured' ? 'rgba(197,160,90,0.4)' : 'rgba(75,159,255,0.4)'}`, borderRadius: '8px', padding: '2px 8px', backdropFilter: 'blur(8px)' }}>{c.tag}</span>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(8,6,18,0.8) 100%)' }} />
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#ece6da' }}>{c.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#c5a05a' }}>{c.price}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(236,232,225,0.45)', marginTop: '3px' }}>📍 {c.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── STATS ROW ── */}
          <section style={{ borderTop: '0.5px solid rgba(197,160,90,0.1)', borderBottom: '0.5px solid rgba(197,160,90,0.1)', padding: '2.5rem 1.5rem', background: showImage ? 'rgba(8,6,18,0.5)' : 'rgba(17,13,28,0.9)', backdropFilter: 'blur(12px)', transition: 'background .4s' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
              {[['2,400+', 'Verified listings'], ['8', 'EU countries'], ['100%', 'Discreet'], ['24/7', 'Support']].map(([num, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 300, color: '#c5a05a', lineHeight: 1, textShadow: showImage ? '0 0 24px rgba(197,160,90,0.5)' : 'none', transition: 'text-shadow .4s' }}>{num}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(236,232,225,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── NOTE ── */}
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(197,160,90,0.07)', border: '0.5px solid rgba(197,160,90,0.2)', borderRadius: '12px', fontSize: '13px', color: 'rgba(197,160,90,0.8)' }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span>Upload <strong>/public/sx-bg.jpg</strong> to see the image. Use the buttons above to compare overlay intensities.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
