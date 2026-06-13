'use client'
import { useEffect, useState } from 'react'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', t3: '#555', gold: '#c5a05a', b: '#c5a05a22', b2: '#ffffff18', serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif" }

const sections = [
  { num: '01', title: 'Data Controller' },
  { num: '02', title: 'Data We Collect' },
  { num: '03', title: 'Legal Bases & Purposes' },
  { num: '04', title: 'Data Sharing' },
  { num: '05', title: 'International Transfers' },
  { num: '06', title: 'Data Retention' },
  { num: '07', title: 'Your Rights Under GDPR' },
  { num: '08', title: 'Complaints & Contact' },
]

export default function PrivacyPage() {
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
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: S.t, lineHeight: 1.1, marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Your privacy matters. This policy explains what personal data we collect, how we use it, and the rights you have under GDPR.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, color: '#444', letterSpacing: '0.05em' }}>
          Last updated: 21 May 2025 &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Data controller: 3S.lifestyle bv
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 120px' }}>

        {/* 01 Data Controller */}
        <article data-section="01" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>01</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Data Controller</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>The data controller responsible for the processing of personal data through SecretXperience.eu is:</p>
            <div style={{ background: '#0a0908', border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px 24px', marginBottom: '1rem', lineHeight: 2 }}>
              <strong style={{ color: S.t }}>3S.lifestyle bv</strong><br />
              Tangendallaan 23, 1850 Grimbergen, Belgium<br />
              VAT: BE 0749.661.728<br />
              <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a>
            </div>
            <p>We do not collect any personal data from persons under the age of 18. The Platform is strictly for adults only. If we become aware that data has been collected from a minor, we will delete it immediately.</p>
          </div>
        </article>

        {/* 02 Data We Collect */}
        <article data-section="02" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>02</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Data We Collect</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1.25rem' }}>We collect personal data only to the extent necessary to operate the Platform and fulfil our legal obligations. Categories of data include:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Account &amp; Identity Data</strong>
                <span>Email address, chosen username, and — for advertisers undergoing verification — government-issued ID documents and a selfie for age and identity confirmation. Verification documents are processed by a trusted third-party partner.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Profile Data</strong>
                <span>Information you voluntarily add to your profile: gender, age, biography, service descriptions, photos, location (city/region level), spoken languages, and physical characteristics if provided.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Payment Data</strong>
                <span>Payment processing is handled by third-party processors. We do not store full card numbers or CVV codes. We may retain transaction identifiers, amounts, and timestamps for accounting and fraud prevention.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Usage &amp; Technical Data</strong>
                <span>IP address, browser type, device identifiers, pages visited, session duration, referral URLs, and interaction logs collected automatically as part of normal web server operation and analytics.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Communications Data</strong>
                <span>Messages sent via the Platform's internal system, support tickets, and correspondence with our team.</span>
              </div>
            </div>
          </div>
        </article>

        {/* 03 Legal Bases & Purposes */}
        <article data-section="03" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>03</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Legal Bases & Purposes</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1.25rem' }}>We process personal data under the following GDPR legal bases:</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <li><strong style={{ color: S.t }}>Contract performance</strong> (Art. 6(1)(b)) — account management, service delivery, payment processing</li>
              <li><strong style={{ color: S.t }}>Legal obligation</strong> (Art. 6(1)(c)) — compliance with Belgian and EU law, financial record-keeping</li>
              <li><strong style={{ color: S.t }}>Legitimate interest</strong> (Art. 6(1)(f)) — fraud prevention, platform security, analytics, dispute resolution</li>
              <li><strong style={{ color: S.t }}>Consent</strong> (Art. 6(1)(a)) — marketing communications and non-essential cookies (withdrawable at any time)</li>
            </ul>
            <p style={{ marginBottom: '1rem' }}>Purposes for which we use your data include:</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Creating and managing your account and profile</li>
              <li>Processing payments and token purchases</li>
              <li>Providing customer support and responding to enquiries</li>
              <li>Identity verification and age confirmation</li>
              <li>Detecting and preventing fraud and abuse</li>
              <li>Complying with legal obligations and responding to lawful authority requests</li>
              <li>Analysing platform usage to improve our services (aggregated / anonymised where possible)</li>
              <li>Sending marketing communications where you have given explicit consent</li>
            </ul>
          </div>
        </article>

        {/* 04 Data Sharing */}
        <article data-section="04" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>04</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Data Sharing</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>We do not sell, rent, or trade your personal data to third parties for their own commercial purposes.</p>
            <p style={{ marginBottom: '1.25rem' }}>We share data only with the following categories of trusted service advertisers, subject to binding data processing agreements:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Hosting &amp; Infrastructure</strong>
                <span>Our database and backend infrastructure advertiser stores your account and profile data on secure, EU-hosted infrastructure. They act as a data processor and may not use your data for any independent purpose.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Payment Processors</strong>
                <span>Payment data is handled by certified third-party processors who receive only the information necessary to process your transaction securely.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Identity Verification Partners</strong>
                <span>Third-party advertisers engaged solely to verify user ages and identities. Data shared is limited to what is strictly necessary for verification.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Analytics</strong>
                <span>Privacy-conscious analytics tools configured to anonymise or pseudonymise data wherever possible.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Legal &amp; Law Enforcement</strong>
                <span>We may disclose personal data to competent authorities when required by law or court order, or in connection with investigations of illegal activity including child exploitation material, human trafficking, or fraud.</span>
              </div>
            </div>
          </div>
        </article>

        {/* 05 International Transfers */}
        <article data-section="05" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>05</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>International Transfers</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>Your personal data is primarily stored and processed within the European Economic Area (EEA). Where we engage service advertisers outside the EEA, we ensure appropriate safeguards are in place, including:</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions for countries recognised as providing equivalent data protection</li>
              <li>Binding corporate rules where applicable</li>
            </ul>
            <p>For details about the safeguards applied to any specific transfer, contact us at <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a>.</p>
          </div>
        </article>

        {/* 06 Data Retention */}
        <article data-section="06" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>06</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Data Retention</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1.25rem' }}>We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Active Account Data</strong>
                <span>Retained for the duration of your account and for up to 12 months following account deletion, to allow for dispute resolution and fraud investigation.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Financial Records</strong>
                <span>Transaction records are retained for 7 years from the date of the transaction to comply with Belgian and EU accounting and tax law obligations.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Verification Documents</strong>
                <span>Retained for the minimum period required by law and then securely deleted.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Support &amp; Communications</strong>
                <span>Retained for up to 3 years from the last interaction, unless subject to an ongoing legal matter.</span>
              </div>
            </div>
            <p style={{ marginTop: '1.25rem' }}>Upon expiry of the applicable retention period, data is securely deleted or anonymised so that it cannot be reconstructed.</p>
          </div>
        </article>

        {/* 07 Your Rights */}
        <article data-section="07" style={{ marginBottom: 64, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>07</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Your Rights Under GDPR</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1.25rem' }}>If you are located in the European Economic Area, you have the following rights under GDPR (EU) 2016/679. To exercise any of these rights, contact us at <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a>. We will respond within 30 days.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right of Access (Art. 15)</strong>
                <span>Obtain a copy of the personal data we hold about you and information about how it is processed.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right to Rectification (Art. 16)</strong>
                <span>Have inaccurate or incomplete personal data corrected.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right to Erasure (Art. 17)</strong>
                <span>Request deletion of your personal data where it is no longer necessary for the purposes for which it was collected, where you withdraw consent, or where processing is unlawful. Note that we may retain certain data for legal compliance.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right to Restriction of Processing (Art. 18)</strong>
                <span>Request that we restrict the processing of your data in certain circumstances.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right to Object (Art. 21)</strong>
                <span>Object to processing based on our legitimate interests, including for direct marketing purposes.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right to Data Portability (Art. 20)</strong>
                <span>Receive a copy of your personal data in a structured, machine-readable format and transmit it to another controller.</span>
              </div>
              <div style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1rem' }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: '0.25rem' }}>Right to Withdraw Consent</strong>
                <span>Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</span>
              </div>
            </div>
          </div>
        </article>

        {/* 08 Complaints & Contact */}
        <article data-section="08" style={{ marginBottom: 0, paddingTop: 8, scrollMarginTop: 80 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: S.serif, fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>08</span>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, fontWeight: 500, color: S.gold, letterSpacing: '0.01em', lineHeight: 1.2 }}>Complaints & Contact</h2>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
          <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999' }}>
            <p style={{ marginBottom: '1rem' }}>For any questions, requests, or concerns regarding this Privacy Policy or our data practices, please contact our data protection team:</p>
            <div style={{ background: '#0a0908', border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px 24px', marginBottom: '1.25rem', lineHeight: 2 }}>
              <strong style={{ color: S.t }}>3S.lifestyle bv — Data Protection</strong><br />
              Tangendallaan 23, 1850 Grimbergen, Belgium<br />
              Email: <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a>
            </div>
            <p style={{ marginBottom: '1rem' }}>We aim to respond to all privacy-related correspondence within 30 calendar days. For complex requests we may extend this by a further 60 days, in which case we will notify you.</p>
            <p style={{ marginBottom: '1rem' }}>You also have the right to lodge a complaint at any time with the Belgian supervisory authority:</p>
            <div style={{ background: '#0a0908', border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px 24px', lineHeight: 2 }}>
              <strong style={{ color: S.t }}>Gegevensbeschermingsautoriteit (GBA) / Autorité de protection des données (APD)</strong><br />
              Rue de la Presse 35, 1000 Brussels, Belgium<br />
              <a href="https://www.dataprotectionauthority.be" target="_blank" rel="noopener noreferrer">www.dataprotectionauthority.be</a>
            </div>
          </div>
        </article>

        <div style={{ marginTop: 80, paddingTop: 40, borderTop: `0.5px solid #c5a05a18`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            Questions about your data? Contact <a href="mailto:support@secretxperience.eu" style={{ color: S.gold }}>support@secretxperience.eu</a>
            <br />
            <a href="/terms" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>View Terms of Use →</a>
            &nbsp;&nbsp;
            <a href="/cookies" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>View Cookie Policy →</a>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `0.5px solid ${S.b}`, padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2026 SecretXperience.eu · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/cookies">Cookie Policy</a> · <a href="/dmca">DMCA</a> · <a href="/contact">Contact</a></p>
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
