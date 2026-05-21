'use client'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', t3: '#555', gold: '#c5a05a', b: '#c5a05a22', b2: '#ffffff18', serif: "'Cormorant Garamond', serif", sans: "'Jost', sans-serif" }

const cookieTable = [
  {
    category: 'Functional',
    purpose: 'Session authentication, security tokens, login state, user preferences (language, settings)',
    examples: 'Session cookie, CSRF token, preference store',
    consent: 'Not required',
    consentColor: '#4a7a4a',
  },
  {
    category: 'Analytical',
    purpose: 'Anonymised usage data to understand how the Platform is used and to improve it (page views, session duration, feature usage)',
    examples: 'Analytics tracking (IP anonymised)',
    consent: 'Not required (anonymised)',
    consentColor: '#4a7a4a',
  },
  {
    category: 'Marketing',
    purpose: 'Personalised advertising and remarketing to users who have interacted with the Platform',
    examples: 'Ad targeting, cross-site tracking',
    consent: 'Required — explicit opt-in',
    consentColor: '#7a4a4a',
  },
]

export default function CookiesPage() {
  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c5a05a44; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #c5a05a88; }
        a { color: #c5a05a; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid ${S.b}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em' }}>Secret<span style={{ color: S.gold }}>Xperience</span></a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>

      <div style={{ borderBottom: `0.5px solid #c5a05a18`, padding: '64px 24px 48px', textAlign: 'center', background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)' }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: 20 }}>Legal Document</div>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: S.t, lineHeight: 1.1, marginBottom: 16 }}>Cookie Policy</h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          This policy explains what cookies we use, why, and how you can manage your preferences.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, color: '#444', letterSpacing: '0.05em' }}>
          Last updated: 21 May 2025 &nbsp;·&nbsp; Governing law: Belgium / EU
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* What are cookies */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>What are cookies?</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to site owners.</p>
              <p>SecretXperience.eu uses cookies to deliver a functional, personalised, and secure experience. When you first visit the Platform, you will be shown a cookie consent notice. You may manage or withdraw your consent at any time via your browser settings.</p>
            </div>
          </section>

          {/* Cookie types table */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Cookie categories</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85, marginBottom: '1.25rem' }}>
              <p>We use three categories of cookies. The table below summarises each category, its purpose, and whether your consent is required.</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#0a0908', borderRadius: 4, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid #c5a05a22` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>Purpose</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Examples</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Consent needed?</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieTable.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `0.5px solid #c5a05a11`, background: i % 2 === 0 ? '#0c0b09' : '#0a0908', verticalAlign: 'top' }}>
                      <td style={{ padding: '14px 16px', color: S.t, fontWeight: 500, whiteSpace: 'nowrap' }}>{row.category}</td>
                      <td style={{ padding: '14px 16px', color: '#999', lineHeight: 1.7 }}>{row.purpose}</td>
                      <td style={{ padding: '14px 16px', color: '#777', lineHeight: 1.7 }}>{row.examples}</td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, color: row.consentColor, background: row.consentColor + '22', padding: '3px 8px', borderRadius: 3, letterSpacing: '0.03em' }}>{row.consent}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Functional cookies detail */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Functional cookies</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>Functional cookies are strictly necessary for the Platform to operate. They include session authentication cookies that keep you logged in, security tokens (CSRF protection), and cookies required to remember your preferences such as language and accepted age gate.</p>
              <p>You cannot opt out of functional cookies while using the Platform. Disabling them via your browser will break core functionality, including the ability to log in.</p>
            </div>
          </section>

          {/* Analytical cookies detail */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Analytical cookies</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>We use anonymised analytics to understand how users interact with the Platform — for example, which pages are visited most, how long sessions last, and where users encounter issues. This helps us improve the Platform's performance and user experience.</p>
              <p>Analytics data is aggregated and does not identify you personally. IP addresses are anonymised before processing. Because the data cannot be attributed to an individual, no consent is required under ePrivacy rules.</p>
            </div>
          </section>

          {/* Marketing cookies detail */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Marketing & tracking cookies</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>Marketing cookies are used to show you personalised advertisements based on your browsing behaviour, both on and off the Platform. These cookies track your activity across websites to build a profile for targeted advertising.</p>
              <p style={{ marginBottom: '1rem' }}>Marketing cookies are only activated with your <strong style={{ color: S.t }}>explicit opt-in consent</strong>, requested when you first visit the Platform.</p>
              <p>You may withdraw your consent at any time by clearing cookies in your browser settings or by adjusting your preferences through the cookie settings panel.</p>
            </div>
          </section>

          {/* Managing cookies */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Managing your cookies</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>You can control and delete cookies through your browser settings. Most browsers allow you to:</p>
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <li>View and delete existing cookies</li>
                <li>Block all cookies or block third-party cookies only</li>
                <li>Receive a notification before a cookie is set</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>For instructions on managing cookies in your specific browser, visit your browser's help documentation. Please note that restricting or deleting cookies may affect the functionality of SecretXperience.eu — in particular, you will be logged out and your preferences will not be remembered.</p>
              <p>Consent given on first visit can be withdrawn at any time by clearing your cookies via browser settings.</p>
            </div>
          </section>

          {/* Changes */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Changes to this policy</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our services. When we do, we will update the "Last updated" date at the top of this page. Continued use of the Platform after changes constitutes acceptance of the revised policy.</p>
              <p>Questions about our use of cookies? Contact us at <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a>.</p>
            </div>
          </section>

        </div>
      </main>

      <footer style={{ borderTop: `0.5px solid ${S.b}`, padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2025 SecretXperience.eu · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/cookies">Cookie Policy</a> · <a href="/dmca">DMCA</a> · <a href="/contact">Contact</a></p>
      </footer>
    </div>
  )
}
