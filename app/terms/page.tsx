'use client'
import { useEffect, useState } from 'react'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', t3: '#555', gold: '#c5a05a', b: '#c5a05a22', b2: '#ffffff18', serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif" }

const sections = [
  { num: '01', title: 'About SecretXperience' },
  { num: '02', title: 'Acceptance of Terms' },
  { num: '03', title: 'Registration' },
  { num: '04', title: 'Prohibited Content' },
  { num: '05', title: 'Advertising Rules' },
  { num: '06', title: 'Token System' },
  { num: '07', title: 'Right of Withdrawal' },
  { num: '08', title: 'Restrictions' },
  { num: '09', title: 'Liability' },
  { num: '10', title: 'General Provisions' },
]

const tokenPackages = [
  { price: '€2.50', tokens: '25', bonus: '' },
  { price: '€5', tokens: '50', bonus: '' },
  { price: '€15', tokens: '150', bonus: '' },
  { price: '€20', tokens: '210', bonus: '+10 bonus' },
  { price: '€35', tokens: '375', bonus: '+25 bonus' },
  { price: '€50', tokens: '550', bonus: '+50 bonus' },
  { price: '€75', tokens: '850', bonus: '+100 bonus' },
]

const tokenUsage = [
  { service: 'Basic listing (7 days)', tokens: '25' },
  { service: 'Featured listing (7 days)', tokens: '50' },
  { service: 'Top boost', tokens: '75' },
  { service: 'Premium listing (30 days)', tokens: '150' },
  { service: 'Verification badge', tokens: '25' },
  { service: 'Photo gallery', tokens: '15' },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400)
      const sectionEls = document.querySelectorAll('[data-section]')
      let current = ''
      sectionEls.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 120) current = (el as HTMLElement).dataset.section || ''
      })
      setActiveSection(current || sections[0].num)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    setActiveSection(sections[0].num)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (num: string) => {
    const el = document.querySelector(`[data-section="${num}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c5a05a44; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #c5a05a88; }
        a { color: #c5a05a; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid ${S.b}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Secret<span style={{ color: S.gold }}>Xperience</span>
        </a>
        <nav style={{ display: 'flex', gap: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any, scrollbarWidth: 'none' as any }}>
          {sections.map((s) => (
            <button
              key={s.num}
              onClick={() => scrollToSection(s.num)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: S.sans, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: activeSection === s.num ? S.gold : S.t2, whiteSpace: 'nowrap', padding: '4px 2px', borderBottom: activeSection === s.num ? `1px solid ${S.gold}` : '1px solid transparent', transition: 'color 0.2s, border-color 0.2s' }}
            >
              {s.num}
            </button>
          ))}
        </nav>
      </header>

      <div style={{ borderBottom: `0.5px solid #c5a05a18`, padding: '64px 24px 48px', textAlign: 'center', background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)' }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: 20 }}>Legal Document</div>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: S.t, lineHeight: 1.1, marginBottom: 16 }}>Terms of Use</h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Please read these terms carefully before using SecretXperience.eu. By accessing the Platform you agree to be bound by them.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, color: '#444', letterSpacing: '0.05em' }}>
          Last updated: 21 May 2025 &nbsp;·&nbsp; Governing law: Belgium / EU
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 120px' }}>

        {/* 01 About */}
        <article data-section="01" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>01</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>About SecretXperience</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>SecretXperience ("the Platform," "we," "us," or "our") is a premium adult services marketplace operated by <strong style={{ color: S.t }}>3S.lifestyle bv</strong>, Tangendallaan 23, 1850 Grimbergen, Belgium (BE 0749.661.728). The Platform connects adult service providers with clients seeking companionship, entertainment, and related adult experiences.</p>
            <p style={{ marginBottom: '1rem' }}>SecretXperience does not arrange, broker, or facilitate meetings between users. It acts solely as an advertising and communication medium. All interactions between providers and clients take place independently of the Platform and are the exclusive responsibility of the parties involved.</p>
            <p>This Platform is intended exclusively for adults aged 18 or older. By accessing or using SecretXperience.eu you acknowledge that you are at least 18 years of age and that you have read, understood, and agree to be bound by these Terms of Use in their entirety. If you do not agree, you must leave the Platform immediately.</p>
          </div>
        </article>

        {/* 02 Acceptance */}
        <article data-section="02" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>02</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Acceptance of Terms</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>These Terms of Use apply to all Users of the Platform, including visitors, registered users, providers, and clients. By accessing or using any part of the Platform, you agree to be bound by these Terms of Use, our <a href="/privacy">Privacy Policy</a>, and our <a href="/cookies">Cookie Policy</a>, all of which are incorporated herein by reference.</p>
            <p style={{ marginBottom: '1rem' }}>We reserve the right to modify these Terms at any time. Updated terms will be posted on this page with a revised "last updated" date. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.</p>
            <p>These Terms constitute a legally binding agreement between you and 3S.lifestyle bv.</p>
          </div>
        </article>

        {/* 03 Registration */}
        <article data-section="03" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>03</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Registration</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>To access certain features of the Platform, you must create a profile by completing the registration form. You agree to provide accurate, current, and complete information and to keep it up to date at all times.</p>
            <p style={{ marginBottom: '1rem' }}>Each user may hold only one profile. Profiles are personal and non-transferable; you may not share or sell access to your account. You are solely responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</p>
            <p>If you become aware of any unauthorised access to or use of your account, you must notify us immediately at <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a>.</p>
          </div>
        </article>

        {/* 04 Prohibited Content */}
        <article data-section="04" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>04</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Prohibited Content</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>The following content and activities are strictly prohibited on the Platform. Violations will result in immediate account termination and, where applicable, reporting to law enforcement:</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Illegal, harmful, or threatening content of any kind</li>
              <li>Any content depicting or involving minors in a sexual context (zero tolerance — immediately reported to authorities)</li>
              <li>Content that infringes the intellectual property rights of any third party</li>
              <li>Any reference to, promotion of, or facilitation of human trafficking or sexual coercion</li>
              <li>Distribution of malware, viruses, or any malicious code</li>
              <li>Misleading, false, or deceptive advertisements</li>
              <li>Listings posted in the wrong category</li>
              <li>Content that promotes violence, hatred, or discrimination</li>
            </ul>
          </div>
        </article>

        {/* 05 Advertising Rules */}
        <article data-section="05" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>05</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Advertising Rules</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>All advertisements published on SecretXperience must comply with the following rules:</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <li>Listings must be placed in the correct, relevant category</li>
              <li>Listings must not be misleading or contain false information</li>
              <li>All listings are reviewed before publication; we reserve the right to reject or remove any listing at our sole discretion</li>
              <li>Identity verification is required before a listing can be published</li>
              <li>Listings have a maximum duration of 3 months, after which they must be renewed</li>
            </ul>
            <p>By submitting a listing, you confirm that the content is accurate and that you hold all necessary rights to the images and text included.</p>
          </div>
        </article>

        {/* 06 Token System */}
        <article data-section="06" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>06</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Token System</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1.5rem' }}>Platform services are purchased using tokens. Tokens are available in the following packages:</p>

            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: '#0a0908', borderRadius: 4, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid #c5a05a22` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>Tokens</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenPackages.map((pkg, i) => (
                    <tr key={i} style={{ borderBottom: `0.5px solid #c5a05a11`, background: i % 2 === 0 ? '#0c0b09' : '#0a0908' }}>
                      <td style={{ padding: '11px 16px', color: S.t, fontWeight: 500 }}>{pkg.price}</td>
                      <td style={{ padding: '11px 16px', color: '#bbb' }}>{pkg.tokens} tokens</td>
                      <td style={{ padding: '11px 16px', color: pkg.bonus ? S.gold : '#3a3a3a', fontSize: 13 }}>{pkg.bonus || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ marginBottom: '1.5rem' }}>Tokens can be used for the following platform services:</p>

            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: '#0a0908', borderRadius: 4, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid #c5a05a22` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>Service</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: S.gold, fontWeight: 500, fontFamily: S.sans, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenUsage.map((item, i) => (
                    <tr key={i} style={{ borderBottom: `0.5px solid #c5a05a11`, background: i % 2 === 0 ? '#0c0b09' : '#0a0908' }}>
                      <td style={{ padding: '11px 16px', color: '#bbb' }}>{item.service}</td>
                      <td style={{ padding: '11px 16px', color: S.t, fontWeight: 500 }}>{item.tokens} tokens</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ marginBottom: '0.75rem' }}>Tokens are non-refundable once purchased, except as required by applicable law (see Section 07). Tokens have no cash value and cannot be transferred between accounts.</p>
            <p>Accepted payment methods: credit/debit card (Visa, Mastercard), cryptocurrency, and bank transfer.</p>
          </div>
        </article>

        {/* 07 Right of Withdrawal */}
        <article data-section="07" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>07</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Right of Withdrawal</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>As a consumer in the European Union, you have the right to withdraw from a purchase of tokens within <strong style={{ color: S.t }}>14 days</strong> from the date of purchase, without giving any reason, provided that the tokens have not been used.</p>
            <p style={{ marginBottom: '1rem' }}>To exercise your right of withdrawal, please contact us before the 14-day period expires:</p>
            <div style={{ background: '#0a0908', border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '16px 20px', marginBottom: '1rem' }}>
              <strong style={{ color: S.t }}>Email:</strong> <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a><br />
              <strong style={{ color: S.t }}>Subject line:</strong> Token Withdrawal Request — [your account email]
            </div>
            <p>Refunds will be processed within 14 days of receiving your withdrawal request. Please note that once tokens have been used to purchase a service, they are non-refundable.</p>
          </div>
        </article>

        {/* 08 Restrictions */}
        <article data-section="08" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>08</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Restrictions</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>When using the Platform, you may not:</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Use bots, crawlers, scrapers, or any automated tools to access or harvest data from the Platform</li>
              <li>Send unsolicited communications (spam) to other users</li>
              <li>Attempt to gain unauthorised access to any part of the Platform, its systems, or other users' accounts</li>
              <li>Stalk, harass, intimidate, or otherwise harm other users</li>
              <li>Use the Platform in any way that violates applicable Belgian law, EU law, or international treaty obligations</li>
              <li>Circumvent, disable, or interfere with security features of the Platform</li>
            </ul>
          </div>
        </article>

        {/* 09 Liability */}
        <article data-section="09" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>09</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Liability</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>The Platform is provided on an <em>"as is"</em> and <em>"as available"</em> basis without warranty of any kind, express or implied. We make no guarantee of uninterrupted availability, accuracy of listings, or the conduct of any user.</p>
            <p style={{ marginBottom: '1rem' }}>To the maximum extent permitted by Belgian law, the total aggregate liability of 3S.lifestyle bv to you for any claim arising out of or relating to these Terms or the Platform shall not exceed <strong style={{ color: S.t }}>€30</strong>.</p>
            <p style={{ marginBottom: '1rem' }}>We are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, even if advised of the possibility of such damages.</p>
            <p>Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other matter that cannot be excluded under Belgian law.</p>
          </div>
        </article>

        {/* 10 General Provisions */}
        <article data-section="10" style={{ marginBottom: 0, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>10</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>General Provisions</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}><strong style={{ color: S.t }}>Governing Law:</strong> These Terms of Use and any dispute arising out of or in connection with them shall be governed by the laws of Belgium. The courts of Brussels, Belgium shall have exclusive jurisdiction, except where mandatory EU consumer protection law requires otherwise.</p>
            <p style={{ marginBottom: '1rem' }}><strong style={{ color: S.t }}>Force Majeure:</strong> 3S.lifestyle bv shall not be liable for any failure or delay in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, government restrictions, pandemics, or internet outages.</p>
            <p style={{ marginBottom: '1rem' }}><strong style={{ color: S.t }}>Intellectual Property:</strong> All Platform Content — including but not limited to the SecretXperience name, logo, design, software, and text — is the exclusive property of 3S.lifestyle bv and is protected by applicable intellectual property laws. Reproduction or use without prior written consent is prohibited.</p>
            <p style={{ marginBottom: '1rem' }}><strong style={{ color: S.t }}>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</p>
            <p><strong style={{ color: S.t }}>Contact:</strong> For questions regarding these Terms, contact us at <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a> — 3S.lifestyle bv, Tangendallaan 23, 1850 Grimbergen, Belgium.</p>
          </div>
        </article>

        <div style={{ marginTop: 80, paddingTop: 40, borderTop: `0.5px solid #c5a05a18`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            Questions about these Terms? Contact <a href="mailto:support@secretxperience.eu" style={{ color: S.gold }}>support@secretxperience.eu</a>
            <br />
            <a href="/privacy" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>View Privacy Policy →</a>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `0.5px solid ${S.b}`, padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2025 SecretXperience.eu · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/cookies">Cookie Policy</a> · <a href="/dmca">DMCA</a> · <a href="/contact">Contact</a></p>
      </footer>

      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          style={{ position: 'fixed', bottom: 32, right: 32, width: 44, height: 44, background: '#0d0b08', border: `0.5px solid #c5a05a55`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.gold, fontSize: 18, zIndex: 200, transition: 'background 0.2s, border-color 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a160e'; (e.currentTarget as HTMLButtonElement).style.borderColor = S.gold }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0d0b08'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c5a05a55' }}
        >↑</button>
      )}
    </div>
  )
}
