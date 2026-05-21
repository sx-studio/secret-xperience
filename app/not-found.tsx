'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{
      background: '#080808',
      minHeight: '100vh',
      color: '#e8e0d0',
      fontFamily: "'Jost', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nf-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: opacity 0.2s, background 0.2s, border-color 0.2s;
        }
        .nf-link:hover { opacity: 0.8; text-decoration: none; }
        .nf-link-gold {
          background: linear-gradient(135deg, #c5a05a 0%, #e8c97e 50%, #c5a05a 100%);
          color: #0d0b08;
        }
        .nf-link-ghost {
          background: transparent;
          border: 0.5px solid #c5a05a55;
          color: #c5a05a;
        }
        .nf-link-ghost:hover { border-color: #c5a05a; background: rgba(197,160,90,0.06); }
      `}</style>

      {/* Radial gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(197,160,90,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Link href="/" style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 22,
        fontWeight: 600,
        color: '#e8e0d0',
        letterSpacing: '0.04em',
        textDecoration: 'none',
        marginBottom: 56,
        display: 'block',
        position: 'relative',
        zIndex: 1,
      }}>
        Secret<span style={{ color: '#c5a05a' }}>Xperience</span>
      </Link>

      {/* Large faint 404 */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(120px, 22vw, 220px)',
        fontWeight: 400,
        lineHeight: 0.85,
        color: 'rgba(197,160,90,0.07)',
        userSelect: 'none',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        letterSpacing: '-0.02em',
      }}>
        404
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#c5a05a',
          marginBottom: 20,
        }}>
          Error 404
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 400,
          color: '#e8e0d0',
          lineHeight: 1.1,
          marginBottom: 16,
          letterSpacing: '0.01em',
        }}>
          Page not found
        </h1>

        {/* Divider */}
        <div style={{
          width: 40,
          height: '0.5px',
          background: 'linear-gradient(90deg, transparent, #c5a05a66, transparent)',
          margin: '0 auto 20px',
        }} />

        {/* Message */}
        <p style={{
          fontSize: 15,
          color: '#666',
          lineHeight: 1.7,
          maxWidth: 380,
          margin: '0 auto 48px',
        }}>
          This page doesn&apos;t exist or has been removed.
        </p>

        {/* Links */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <button
            onClick={() => router.back()}
            className="nf-link nf-link-ghost"
            style={{ border: '0.5px solid #c5a05a55', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <Link href="/" className="nf-link nf-link-gold">
            Browse Listings
          </Link>
          <Link href="/events" className="nf-link nf-link-ghost">
            Events
          </Link>
          <Link href="/advertise" className="nf-link nf-link-ghost">
            Advertise
          </Link>
          <Link href="mailto:support@secret-xperience.eu" className="nf-link nf-link-ghost">
            Contact
          </Link>
        </div>
      </div>
    </div>
  )
}
