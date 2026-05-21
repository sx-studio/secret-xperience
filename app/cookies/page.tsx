'use client'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', t3: '#555', gold: '#c5a05a', serif: "'Cormorant Garamond', serif", sans: "'Jost', sans-serif" }

const SECTIONS = [
  { title: 'What are cookies?', body: `Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to site owners.\n\nSecretXperience.eu uses cookies to deliver a functional, personalised, and secure experience. By continuing to use the platform after being shown our cookie notice, you consent to our use of cookies as described in this policy.` },
  { title: 'Cookies we use', body: `**Essential cookies** — These are required for the platform to function. They include session cookies that keep you logged in, CSRF protection tokens, and cookies required by our payment processor (Stripe). You cannot opt out of essential cookies while using the platform.\n\n**Preference cookies** — These remember your settings, such as your selected theme (velvet, dark, or light mode), preferred language, and whether you have dismissed the age gate. These are stored in localStorage.\n\n**Analytics cookies** — We use privacy-respecting analytics to understand how the platform is used. These cookies help us measure page views, session duration, and feature usage. No personal identifying information is included. You may opt out via the cookie settings panel.` },
  { title: 'Third-party cookies', body: `**Stripe** — Our payment processor sets cookies necessary for secure transaction processing and fraud prevention. These are governed by Stripe's privacy policy.\n\n**Google Translate** — If you use the language switcher, Google's translation service may set cookies. These are governed by Google's privacy policy.\n\n**Supabase** — Our authentication and database provider sets secure session cookies. No personal data is shared with third parties beyond what is necessary to authenticate you.` },
  { title: 'How to manage cookies', body: `You can control and delete cookies through your browser settings. Most browsers allow you to:\n\n• Block all cookies (note: this will break most website functionality)\n• Block third-party cookies only\n• Delete existing cookies\n• Be notified before a cookie is set\n\nFor instructions on managing cookies in your browser, visit your browser's help section. Note that restricting cookies may affect the functionality of SecretXperience.eu.` },
  { title: 'Changes to this policy', body: `We may update this Cookie Policy from time to time. When we do, we will update the "Last updated" date below and, where appropriate, notify you. Continued use of the platform after changes constitutes acceptance of the revised policy.\n\nIf you have questions about our use of cookies, contact us at: privacy@secret-xperience.eu\n\nLast updated: January 2025` },
]

export default function CookiesPage() {
  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:${S.gold};text-decoration:none}a:hover{text-decoration:underline}`}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #c5a05a22', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em' }}>Secret<span style={{ color: S.gold }}>Xperience</span></a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: S.gold, textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</p>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px,5vw,54px)', fontWeight: 400, color: S.t, marginBottom: '0.5rem', lineHeight: 1.1 }}>Cookie <em style={{ fontStyle: 'italic', color: S.gold }}>Policy</em></h1>
        <p style={{ color: S.t2, fontSize: 14, marginBottom: '3rem' }}>Last updated: January 2025</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {SECTIONS.map((s, i) => (
            <section key={i}>
              <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>{s.title}</h2>
              <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
                {s.body.split('\n\n').map((para, j) => (
                  <p key={j} style={{ marginBottom: '1rem', whiteSpace: 'pre-line' }}>{para.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <footer style={{ borderTop: '0.5px solid #c5a05a22', padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2025 SecretXperience.eu · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/contact">Contact</a></p>
      </footer>
    </div>
  )
}
