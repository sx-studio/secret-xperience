'use client'
import { useEffect, useState } from 'react'

const sections = [
  {
    num: '01',
    title: 'Introduction',
    body: `SecretXperience.eu ("the Platform," "we," "us," or "our") is a premium adult marketplace operating under Belgian and EU law. The Platform facilitates connections between adult service providers and clients seeking companionship, entertainment, and related adult experiences.

This website contains content of an adult nature and is intended exclusively for individuals who are at least 18 years of age — or the legal age of majority in their jurisdiction, whichever is greater. By accessing or using SecretXperience.eu, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use in their entirety. If you do not agree, you must leave the Platform immediately.

These Terms constitute a legally binding agreement. We reserve the right to modify them at any time; continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.`,
  },
  {
    num: '02',
    title: 'Eligibility',
    body: `To access or use SecretXperience.eu you must:

• Be at least 18 years of age, or the age of majority in your country or jurisdiction, whichever is higher.
• Have the legal capacity to enter into a binding contract under the laws of your jurisdiction.
• Not be prohibited from receiving services of this nature under any applicable law.
• Not be located in a jurisdiction where accessing adult content or services of this nature is illegal.

By creating an account or accessing the Platform, you represent and warrant that you meet all of the foregoing eligibility requirements. SecretXperience.eu reserves the right to request age verification documentation at any time and to immediately suspend or terminate access for any user who cannot satisfy these requirements. Providing false information regarding your age is a material breach of these Terms and may result in permanent account termination and referral to appropriate authorities.`,
  },
  {
    num: '03',
    title: 'User Accounts',
    body: `Registration: To access certain features of the Platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete at all times.

Account Security: You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at legal@secret-xperience.eu upon becoming aware of any unauthorized use of your account. SecretXperience.eu will not be liable for any loss or damage arising from your failure to safeguard your credentials.

Single Accounts: Each individual may maintain only one personal account. Operating multiple accounts is prohibited unless you are a business entity with prior written approval from SecretXperience.eu.

Account Suspension: We reserve the right to suspend or permanently terminate your account at our sole discretion, without prior notice, for any breach of these Terms or for conduct that we determine to be harmful to the Platform, its users, or third parties.`,
  },
  {
    num: '04',
    title: 'Provider Listings',
    body: `Independent Contractor Status: All service providers listed on SecretXperience.eu are independent contractors acting entirely on their own behalf. They are not employees, agents, partners, or representatives of SecretXperience.eu. The Platform serves solely as a neutral advertising and communication medium. SecretXperience.eu does not supervise, direct, or control the services offered by providers, nor does it participate in any service transaction.

Content Accuracy: Providers are solely responsible for the accuracy, legality, and completeness of their listings. All content — including photographs, videos, descriptions, and pricing — must be truthful, must not mislead users, and must depict only the individual operating the account. Use of another person's images without their express, documented consent is strictly prohibited.

Content Standards: Listings must not contain content that is defamatory, harassing, discriminatory, or otherwise unlawful. Explicit images or descriptions must comply with all applicable laws and may only be published in designated adult-content sections accessible to verified users.

Verification: SecretXperience.eu may offer optional or mandatory identity and age verification programs. Verified status does not constitute an endorsement of a provider's services, character, or reliability; it indicates only that a verification process was completed.`,
  },
  {
    num: '05',
    title: 'Booking & Payments',
    body: `Booking Process: SecretXperience.eu provides a booking request system that facilitates communication between clients and providers. A booking is confirmed only when the provider explicitly accepts a request. SecretXperience.eu is not a party to any booking agreement; such agreements are solely between the client and the provider.

Platform Fee: SecretXperience.eu charges a service fee of 15% of the agreed transaction value for bookings processed through the Platform's payment infrastructure. This fee is non-negotiable and covers platform operations, fraud prevention, and customer support services.

Payments: All payments are processed through secure third-party payment processors (including Stripe). By initiating a payment, you agree to the applicable terms and privacy policy of the payment processor. SecretXperience.eu does not store full payment card data.

Refunds: Refund eligibility is determined on a case-by-case basis. Requests must be submitted to support@secret-xperience.eu within 48 hours of the scheduled booking time. SecretXperience.eu will mediate disputes in good faith but cannot guarantee refunds in every circumstance. The platform fee is non-refundable in all cases. Chargebacks initiated outside of the Platform's dispute process may result in immediate account suspension.

Pricing: All prices displayed on the Platform are indicative and set exclusively by the providers. SecretXperience.eu does not control, set, or guarantee any provider's pricing.`,
  },
  {
    num: '06',
    title: 'Prohibited Content & Zero-Tolerance Policy',
    body: `The following content and activities are strictly and absolutely prohibited on SecretXperience.eu. Violations will result in immediate and permanent account termination, reporting to law enforcement, and cooperation with any resulting investigation:

• Any content that depicts, promotes, or facilitates the sexual exploitation or abuse of minors (CSAM) in any form whatsoever.
• Any content that depicts, promotes, or facilitates human trafficking, sexual coercion, or non-consensual acts.
• Any content or activity relating to non-consensual pornography ("revenge porn").
• Explicit illegal content of any kind under Belgian law, EU law, or international treaty obligations.
• Solicitation of illegal services or activities.
• Impersonation of any person, entity, or SecretXperience.eu staff.
• Spam, phishing, malware distribution, or any form of automated data scraping.
• Content that promotes violence, hatred, or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or national origin.

SecretXperience.eu actively monitors the Platform for prohibited content. Upon detection or credible report, we will remove the content, permanently ban the responsible account, preserve relevant evidence, and report the matter to competent Belgian authorities and/or NCMEC where applicable. There are no warnings for violations in this section.`,
  },
  {
    num: '07',
    title: 'Privacy & Data',
    body: `Your privacy matters to us. Our collection, use, and protection of your personal data is governed by our Privacy Policy, which is incorporated into these Terms by reference and forms an integral part of this agreement.

By using the Platform, you consent to the data practices described in the Privacy Policy, including the processing of personal data for the purposes of operating and improving the Platform, preventing fraud, and complying with applicable legal obligations.

Please review our Privacy Policy at secretxperience.eu/privacy for full details on what data we collect, how we use it, and your rights under the General Data Protection Regulation (GDPR).`,
  },
  {
    num: '08',
    title: 'Intellectual Property',
    body: `Platform Content: The SecretXperience.eu name, logo, design, software, text, graphics, and all other content produced by or for SecretXperience.eu (collectively, "Platform Content") are the exclusive property of SecretXperience.eu or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit Platform Content without our express prior written consent.

User Content: By uploading, posting, or transmitting content to the Platform, you grant SecretXperience.eu a worldwide, non-exclusive, royalty-free, sublicensable, and transferable licence to use, reproduce, distribute, display, and transmit such content solely for the purposes of operating and promoting the Platform. You represent and warrant that you own or have all necessary rights to grant this licence, and that your content does not infringe the intellectual property or other rights of any third party.

DMCA: SecretXperience.eu respects intellectual property rights and expects users to do the same. If you believe your copyrighted work has been infringed on the Platform, please send a notice to legal@secret-xperience.eu with the information required under applicable copyright law.`,
  },
  {
    num: '09',
    title: 'Limitation of Liability',
    body: `To the fullest extent permitted by applicable law:

The Platform is provided on an "as is" and "as available" basis without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

SecretXperience.eu is not liable for: (a) the conduct, content, services, or representations of any provider or user; (b) any harm arising from a booking or encounter facilitated through the Platform; (c) indirect, incidental, special, consequential, or punitive damages of any kind; (d) loss of profits, data, or goodwill; (e) any interruption or cessation of the Platform's availability.

Our total aggregate liability to you for any claim arising out of or relating to these Terms or the Platform shall not exceed the greater of (i) €100 or (ii) the total fees paid by you to SecretXperience.eu in the three months preceding the event giving rise to liability.

Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other matter that cannot be excluded or limited under Belgian law.`,
  },
  {
    num: '10',
    title: 'Governing Law & Dispute Resolution',
    body: `These Terms of Use and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of Belgium, without regard to its conflict of law provisions.

The courts of Brussels, Belgium shall have exclusive jurisdiction over any dispute arising from these Terms or your use of the Platform, except where mandatory EU consumer protection law confers jurisdiction on the courts of your country of residence.

As a user in the European Union, you may also have the right to submit disputes to an alternative dispute resolution body. Details of EU online dispute resolution can be found at: https://ec.europa.eu/consumers/odr/.

SecretXperience.eu complies with the General Data Protection Regulation (EU) 2016/679, the Digital Services Act (EU) 2022/2065, and all applicable Belgian law.`,
  },
  {
    num: '11',
    title: 'Contact',
    body: `If you have any questions, concerns, or legal notices relating to these Terms of Use, please contact us:

Email: legal@secret-xperience.eu
Postal: SecretXperience.eu Legal Department, Belgium

For account support: support@secret-xperience.eu
For privacy and data requests: privacy@secret-xperience.eu
For DMCA notices: legal@secret-xperience.eu

We aim to respond to all legal correspondence within 5 business days.

Last updated: May 2025`,
  },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400)

      // Highlight active section in sticky nav
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
          Terms of Use
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Please read these terms carefully before using SecretXperience.eu. By accessing the Platform you agree to be bound by them.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, color: '#444', letterSpacing: '0.05em' }}>
          Effective date: May 2025 &nbsp;·&nbsp; Governing law: Belgium / EU
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
              {section.num === '07'
                ? section.body.split('secretxperience.eu/privacy').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <a href="/privacy" style={{ color: '#c5a05a' }}>secretxperience.eu/privacy</a>}
                    </span>
                  ))
                : section.body
              }
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
            Questions about these Terms? Contact{' '}
            <a href="mailto:legal@secret-xperience.eu" style={{ color: '#c5a05a' }}>legal@secret-xperience.eu</a>
            <br />
            <a href="/privacy" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>View Privacy Policy →</a>
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
