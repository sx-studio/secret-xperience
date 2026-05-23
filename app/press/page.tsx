'use client'

const STYLES = `
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #c5a05a44; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #c5a05a88; }
  a { color: #c5a05a; text-decoration: none; }
  a:hover { text-decoration: underline; }
`

export default function PressPage() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#e8e0d0', fontFamily: "'Poppins', sans-serif" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid #c5a05a22',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#e8e0d0', letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Secret<span style={{ color: '#c5a05a' }}>Xperience</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: '#888', letterSpacing: '0.06em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> Back
        </a>
      </header>

      {/* Hero */}
      <div style={{
        borderBottom: '0.5px solid #c5a05a18',
        padding: '64px 24px 48px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5a05a', marginBottom: 20 }}>
          Media
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          Press
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Resources for journalists, editors, and media professionals covering SecretXperience.
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 120px' }}>

        {/* About the Platform */}
        <article style={{ marginBottom: 64, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>01</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: '#c5a05a', letterSpacing: '0.01em', lineHeight: 1.2 }}>
              About the Platform
            </h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <p style={{ fontSize: 15, lineHeight: 1.85, color: '#999', marginBottom: 16 }}>
            SecretXperience is a premium adult marketplace headquartered in Brussels, Belgium. The platform connects adult service providers with clients across Belgium and the European Union, operating under Belgian law and the General Data Protection Regulation (GDPR).
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: '#999', marginBottom: 16 }}>
            Founded in 2024, SecretXperience was built to address a gap in the market: a professionally governed, discreet, and verified adult marketplace that treats providers as independent professionals and gives clients the confidence of authenticated listings.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 24 }}>
            {[
              { label: 'Founded', value: '2024' },
              { label: 'Headquarters', value: 'Brussels, Belgium' },
              { label: 'Legal framework', value: 'Belgian law · GDPR · DSA' },
              { label: 'Platform fee', value: '15%' },
            ].map(({ label, value }) => (
              <div key={label} style={{ border: '0.5px solid #c5a05a22', borderRadius: 4, padding: '16px', background: '#0a0a0a' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#c5a05a' }}>{value}</div>
              </div>
            ))}
          </div>
        </article>

        {/* Media Kit */}
        <article style={{ marginBottom: 64, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>02</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: '#c5a05a', letterSpacing: '0.01em', lineHeight: 1.2 }}>
              Media Kit &amp; Brand Assets
            </h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <p style={{ fontSize: 15, lineHeight: 1.85, color: '#999', marginBottom: 24 }}>
            Our media kit includes high-resolution logos, brand guidelines, platform screenshots, and approved descriptions for use in editorial coverage. Please do not alter the logo or use brand assets in a misleading or defamatory context.
          </p>
          <a
            href="#"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              border: '0.5px solid #c5a05a55', color: '#c5a05a',
              padding: '12px 24px', borderRadius: 3,
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              fontWeight: 500, textDecoration: 'none',
            }}
          >
            ↓ Download Media Kit
          </a>
          <p style={{ fontSize: 13, color: '#444', marginTop: 12, lineHeight: 1.6 }}>
            ZIP archive · Logos (SVG, PNG) · Brand guidelines PDF · Platform screenshots
          </p>
        </article>

        {/* Recent Coverage */}
        <article style={{ marginBottom: 64, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>03</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: '#c5a05a', letterSpacing: '0.01em', lineHeight: 1.2 }}>
              Recent Coverage
            </h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <p style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontStyle: 'italic' }}>
            Coverage listings will appear here as SecretXperience is featured in editorial publications. Check back soon, or contact our press team to discuss a story.
          </p>
          {/* Placeholder cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ border: '0.5px solid #c5a05a11', borderRadius: 4, padding: '20px', marginTop: 16, background: '#0a0a0a', opacity: 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#e8e0d0', marginBottom: 6 }}>
                    Coverage placeholder {i}
                  </div>
                  <div style={{ fontSize: 13, color: '#555' }}>Publication name · 2025</div>
                </div>
                <span style={{ fontSize: 11, letterSpacing: '0.1em', color: '#c5a05a44', border: '0.5px solid #c5a05a22', padding: '2px 8px', borderRadius: 2, whiteSpace: 'nowrap' }}>COMING SOON</span>
              </div>
            </div>
          ))}
        </article>

        {/* Press Contact */}
        <article style={{ marginBottom: 0, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>04</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: '#c5a05a', letterSpacing: '0.01em', lineHeight: 1.2 }}>
              Press Contact
            </h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <p style={{ fontSize: 15, lineHeight: 1.85, color: '#999', marginBottom: 20 }}>
            For press enquiries, interview requests, comment on coverage, or questions about our policies, please contact our media team directly. We aim to respond to press requests within one business day.
          </p>
          <div style={{ border: '0.5px solid #c5a05a22', borderRadius: 4, padding: '24px', background: '#0a0a0a' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>Press enquiries</div>
              <a href="mailto:press@secret-xperience.eu" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#c5a05a' }}>
                press@secret-xperience.eu
              </a>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>Response time</div>
              <div style={{ fontSize: 14, color: '#777' }}>Typically within one business day</div>
            </div>
          </div>
        </article>

        <div style={{ marginTop: 80, paddingTop: 40, borderTop: '0.5px solid #c5a05a18', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            General enquiries: <a href="mailto:hello@secret-xperience.eu" style={{ color: '#c5a05a' }}>hello@secret-xperience.eu</a>
            <br />
            <a href="/about" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>About SecretXperience →</a>
          </div>
        </div>
      </main>
    </div>
  )
}
