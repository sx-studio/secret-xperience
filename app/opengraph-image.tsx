import { ImageResponse } from 'next/server'

export const runtime = 'edge'
export const alt = 'SecretXperience.eu — Premium Adult Services'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #08060e 0%, #100c1e 60%, #080612 100%)',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Ambient glow top-left */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,160,90,0.18) 0%, transparent 65%)',
        }} />
        {/* Ambient glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,160,90,0.1) 0%, transparent 65%)',
        }} />

        {/* Top label */}
        <div style={{
          position: 'absolute', top: 48,
          fontSize: 13, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(197,160,90,0.65)',
          fontFamily: 'Georgia, serif',
        }}>
          Private · Members Only · 18+
        </div>

        {/* Main logo */}
        <div style={{
          fontSize: 72, fontWeight: 400, color: '#ece8e1',
          letterSpacing: '0.01em', lineHeight: 1.1,
          display: 'flex', alignItems: 'baseline', gap: 0,
        }}>
          <span>Secret</span>
          <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#c5a05a' }}>Xperience</span>
        </div>

        {/* Gold rule */}
        <div style={{
          width: 80, height: 1,
          background: 'linear-gradient(90deg, transparent, #c5a05a, transparent)',
          margin: '28px 0',
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: 22, fontWeight: 300, color: 'rgba(236,232,225,0.55)',
          letterSpacing: '0.04em', textAlign: 'center', maxWidth: 680,
          lineHeight: 1.5,
        }}>
          Verified escorts, companions, nightlife & creators
          <br />
          across Belgium, Netherlands & Germany
        </div>

        {/* Bottom URL */}
        <div style={{
          position: 'absolute', bottom: 44,
          fontSize: 14, letterSpacing: '0.12em',
          color: 'rgba(197,160,90,0.5)',
        }}>
          secretxperience.eu
        </div>
      </div>
    ),
    { ...size }
  )
}
