'use client'
import { useEffect, useState } from 'react'

const sections = [
  {
    num: '01',
    title: 'Data We Collect',
    body: `SecretXperience.eu ("we," "us," or "our") collects personal data only to the extent necessary to operate the Platform and fulfil our legal obligations. The categories of data we may collect include:

Account & Identity Data: When you register, we collect your email address, chosen username, and — for providers undergoing verification — government-issued ID documents and a selfie for age and identity confirmation. These documents are processed by a trusted third-party verification partner and are not stored on our primary servers beyond the verification period.

Profile Data: Information you voluntarily add to your public or private profile, such as display name, biography, service descriptions, photos, videos, pricing, and location (city/region level).

Payment Data: When you make or receive payments through the Platform, payment processing is handled exclusively by Stripe, Inc. We do not collect or store full credit or debit card numbers, CVV codes, or bank account details. We may retain transaction identifiers, amounts, and timestamps for accounting and fraud prevention purposes.

Usage & Technical Data: IP address, browser type, device identifiers, pages visited, session duration, referral URLs, and interaction logs. This data is collected automatically as part of normal web server operation and analytics.

Communications Data: Messages sent through the Platform's internal messaging system, booking requests, support tickets, and correspondence with our team.

Cookies & Tracking: Information collected via cookies and similar technologies — see Section 4 for full details.`,
  },
  {
    num: '02',
    title: 'How We Use Your Data',
    body: `We use the personal data we collect for the following purposes:

Platform Operations: To create and manage your account, display your profile, process bookings and payments, and deliver the core features of the Platform.

Safety & Trust: To verify user identities and ages, detect and prevent fraud, investigate reports of prohibited content, enforce our Terms of Use, and protect the safety of all users.

Communications: To send transactional emails (account verification, booking confirmations, receipts), service announcements, and — where you have opted in — marketing communications. You may unsubscribe from marketing emails at any time.

Legal Compliance: To comply with applicable Belgian law, EU regulations (including GDPR and the Digital Services Act), and lawful requests from competent authorities.

Analytics & Improvement: To understand how users interact with the Platform and to improve its performance, features, and user experience. Where possible, analytics data is aggregated or anonymised.

Dispute Resolution: To mediate disputes between users and providers, and to maintain records required for legal proceedings if necessary.

The legal bases under GDPR for our processing activities are: contractual necessity (Article 6(1)(b)), compliance with legal obligations (Article 6(1)(c)), our legitimate interests (Article 6(1)(f)), and — where required — your explicit consent (Article 6(1)(a)).`,
  },
  {
    num: '03',
    title: 'Data Sharing',
    body: `We do not sell, rent, or trade your personal data to third parties for their own marketing or commercial purposes. Period.

We may share your data with the following categories of trusted service providers, strictly for the purposes described and subject to binding data processing agreements:

Stripe, Inc.: Our payment processing partner. Stripe receives transaction data necessary to process payments. Stripe's privacy policy is available at stripe.com/privacy.

Supabase, Inc.: Our database and backend infrastructure provider. Your account data and profile information are stored on Supabase's secure, EU-hosted infrastructure. Supabase acts as a data processor under GDPR and does not have the right to use your data for any independent purpose.

Identity Verification Partners: Third-party providers engaged solely to verify user ages and identities. Data shared with these providers is limited to what is strictly necessary for verification.

Legal & Law Enforcement: We may disclose personal data to competent authorities, law enforcement agencies, or courts when required to do so by law, court order, or in connection with an investigation of illegal activity — including, without limitation, child exploitation material, human trafficking, or fraud.

Business Transfers: In the event of a merger, acquisition, or sale of all or substantially all of our assets, your data may be transferred as part of that transaction. We will notify you before your data is transferred and becomes subject to a different privacy policy.

All third-party service providers are contractually required to process your data only on our instructions, to implement appropriate security measures, and to comply with GDPR.`,
  },
  {
    num: '04',
    title: 'Cookies & Tracking Technologies',
    body: `SecretXperience.eu uses cookies and similar tracking technologies to operate the Platform and enhance your experience.

Essential Cookies: Required for the Platform to function. These include session authentication cookies and security tokens. You cannot opt out of essential cookies without disabling core functionality.

Preference Cookies: Store your settings and preferences (such as age-gate acceptance and language). These persist across sessions.

Analytics Cookies: Help us understand how users navigate the Platform so we can improve it. We use privacy-conscious analytics tools configured to anonymise IP addresses and minimise data collection.

We do not use third-party advertising or tracking cookies designed to build profiles for behavioural advertising.

Cookie Consent: When you first visit the Platform, you are shown a cookie notice. By continuing to use the site after dismissing that notice, you consent to the use of non-essential cookies as described above. You may withdraw consent at any time by clearing cookies in your browser settings; note that this will log you out of the Platform.

Most browsers allow you to refuse or delete cookies. For guidance on how to do this, visit your browser's help documentation.`,
  },
  {
    num: '05',
    title: 'Your Rights Under GDPR',
    body: `If you are located in the European Economic Area or United Kingdom, you have the following rights regarding your personal data under the General Data Protection Regulation (EU) 2016/679:

Right of Access (Article 15): You have the right to obtain a copy of the personal data we hold about you, along with information about how it is processed.

Right to Rectification (Article 16): You have the right to have inaccurate or incomplete personal data corrected.

Right to Erasure / "Right to Be Forgotten" (Article 17): You have the right to request deletion of your personal data where it is no longer necessary for the purposes for which it was collected, where you withdraw consent, or where processing is unlawful. Note that we may be required to retain certain data for legal compliance purposes.

Right to Restriction of Processing (Article 18): You have the right to request that we restrict the processing of your data in certain circumstances.

Right to Data Portability (Article 20): You have the right to receive a copy of your personal data in a structured, commonly used, machine-readable format, and to transmit it to another controller.

Right to Object (Article 21): You have the right to object to processing based on our legitimate interests, including for direct marketing purposes.

Right to Withdraw Consent: Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of processing carried out before withdrawal.

To exercise any of these rights, please contact us at privacy@secret-xperience.eu. We will respond within 30 days. You also have the right to lodge a complaint with the Belgian Data Protection Authority (Autorité de protection des données / Gegevensbeschermingsautoriteit) at www.dataprotectionauthority.be.`,
  },
  {
    num: '06',
    title: 'Data Retention',
    body: `We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law:

Active Account Data: Retained for the duration of your account and for up to 12 months following account deletion, to allow for dispute resolution and fraud investigation.

Transaction Records: Retained for 7 years from the date of the transaction to comply with Belgian and EU accounting and tax law obligations.

Verification Documents: Retained for the minimum period required by law (typically 3 years from the date of verification) and then securely deleted.

Communications & Support Records: Retained for up to 3 years from the last interaction, unless subject to an ongoing legal matter.

Analytics Data: Aggregated and anonymised analytics data may be retained indefinitely as it no longer constitutes personal data.

Upon the expiry of the applicable retention period, data is securely deleted or anonymised in a manner that ensures it cannot be reconstructed.`,
  },
  {
    num: '07',
    title: 'Security',
    body: `SecretXperience.eu implements a range of technical and organisational measures to protect your personal data against unauthorised access, disclosure, alteration, or destruction:

• All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security).
• Passwords are hashed using industry-standard algorithms; we never store passwords in plain text.
• Database access is restricted to authorised personnel on a need-to-know basis, with multi-factor authentication enforced.
• Our infrastructure (hosted on Supabase with EU data residency) is subject to SOC 2 and ISO 27001 compliance programmes.
• Payment data is handled exclusively by Stripe, which is PCI DSS Level 1 certified.
• We conduct regular security reviews and promptly address identified vulnerabilities.

Despite these measures, no method of transmission over the internet or electronic storage is 100% secure. In the event of a personal data breach that is likely to result in a high risk to your rights and freedoms, we will notify you and the Belgian Data Protection Authority as required by Article 33–34 GDPR.

If you discover a potential security vulnerability, please disclose it responsibly to security@secret-xperience.eu.`,
  },
  {
    num: '08',
    title: 'Contact & Data Controller',
    body: `SecretXperience.eu is the data controller for personal data processed through the Platform.

For any questions, requests, or concerns regarding this Privacy Policy or our data practices, please contact:

Privacy & Data Protection
Email: privacy@secret-xperience.eu
Postal: SecretXperience.eu Privacy Team, Belgium

For general support: support@secret-xperience.eu
For legal notices: legal@secret-xperience.eu

We aim to respond to all privacy-related correspondence within 30 calendar days. For complex requests or those involving third-party coordination, we may extend this period by up to a further 60 days, in which case we will notify you of the extension.

You also have the right to lodge a complaint at any time with the Belgian supervisory authority:
Autorité de protection des données (APD) / Gegevensbeschermingsautoriteit (GBA)
Rue de la Presse 35, 1000 Brussels, Belgium
www.dataprotectionauthority.be

Last updated: May 2025`,
  },
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
    <div style={{ background: '#080808', minHeight: '100vh', color: '#e8e0d0', fontFamily: "'Jost', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c5a05a44; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #c5a05a88; }
        a { color: #c5a05a; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Top nav bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid #c5a05a22',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#e8e0d0', letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Secret<span style={{ color: '#c5a05a' }}>Xperience</span>
        </a>
        <nav style={{ display: 'flex', gap: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any, scrollbarWidth: 'none' as any }}>
          {sections.map((s) => (
            <button
              key={s.num}
              onClick={() => scrollToSection(s.num)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: activeSection === s.num ? '#c5a05a' : '#888',
                whiteSpace: 'nowrap',
                padding: '4px 2px',
                borderBottom: activeSection === s.num ? '1px solid #c5a05a' : '1px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {s.num}
            </button>
          ))}
        </nav>
      </header>

      {/* Page hero */}
      <div style={{
        borderBottom: '0.5px solid #c5a05a18',
        padding: '64px 24px 48px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5a05a', marginBottom: 20 }}>
          Legal Document
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Your privacy is important to us. This policy explains what data we collect, how we use it, and your rights under EU law.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, color: '#444', letterSpacing: '0.05em' }}>
          Effective date: May 2025 &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Data controller: SecretXperience.eu
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 120px' }}>
        {sections.map((section, idx) => (
          <article
            key={section.num}
            data-section={section.num}
            style={{
              marginBottom: idx < sections.length - 1 ? 64 : 0,
              paddingTop: 8,
              scrollMarginTop: 80,
            }}
          >
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48,
                fontWeight: 400,
                color: '#c5a05a22',
                lineHeight: 1,
                minWidth: 52,
                userSelect: 'none',
              }}>
                {section.num}
              </span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26,
                fontWeight: 500,
                color: '#c5a05a',
                letterSpacing: '0.01em',
                lineHeight: 1.2,
              }}>
                {section.title}
              </h2>
            </div>

            {/* Divider */}
            <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />

            {/* Body */}
            <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999', whiteSpace: 'pre-wrap' }}>
              {section.body}
            </div>
          </article>
        ))}

        {/* Footer note */}
        <div style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: '0.5px solid #c5a05a18',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            Questions about your data? Contact{' '}
            <a href="mailto:privacy@secret-xperience.eu" style={{ color: '#c5a05a' }}>privacy@secret-xperience.eu</a>
            <br />
            <a href="/terms" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>View Terms of Use →</a>
          </div>
        </div>
      </main>

      {/* Back to top button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 44,
            height: 44,
            background: '#0d0b08',
            border: '0.5px solid #c5a05a55',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c5a05a',
            fontSize: 18,
            zIndex: 200,
            transition: 'background 0.2s, border-color 0.2s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1a160e'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#c5a05a'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#0d0b08'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#c5a05a55'
          }}
        >
          ↑
        </button>
      )}
    </div>
  )
}
