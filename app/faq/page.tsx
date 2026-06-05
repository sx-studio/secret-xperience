'use client'
import { useState } from 'react'

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

const faqGroups = [
  {
    group: 'For Clients',
    items: [
      {
        q: 'How do I book an advertiser?',
        a: `Browse verified advertiser listings and select a profile that interests you. On the profile page, click "Request Booking" and choose your preferred date, time, and duration. The advertiser will receive your request and confirm or decline. Once accepted, you complete payment securely through Stripe. You will receive a confirmation email with all details.`,
      },
      {
        q: 'Is my booking discreet?',
        a: `Yes. Your billing statement will display a neutral, non-identifying descriptor — not "SecretXperience" or anything related to adult services. All communications on the platform are private and transmitted securely over HTTPS. We do not share your personal information with advertisers beyond what is necessary to complete the booking, and we never share your data with third parties for commercial purposes.`,
      },
      {
        q: 'How do payments work?',
        a: `All payments are processed by Stripe, a certified PCI-DSS compliant payment advertiser. We accept major credit and debit cards. SecretXperience does not store your full card details. A platform fee of 15% is applied to all bookings processed through the platform. The breakdown is shown clearly before you confirm payment.`,
      },
      {
        q: 'Can I cancel a booking?',
        a: `Cancellation policies are set by individual advertisers and are displayed on their listing before you book. As a general guideline, cancellations made more than 48 hours before the scheduled time are typically eligible for a refund of the advertiser's fee. The platform service fee (15%) is non-refundable in all cases. To request a cancellation, go to your bookings dashboard and submit a cancellation request.`,
      },
      {
        q: 'How do I know a profile is real?',
        a: `Look for the gold verification badge. This indicates the advertiser has passed our identity and age verification process — including a government ID check and facial liveness verification conducted by our third-party partner. Unverified advertisements are marked accordingly. We also encourage reading client reviews, which are only submitted by users who have completed a booking.`,
      },
    ],
  },
  {
    group: 'For Advertisers',
    items: [
      {
        q: 'How do I list my services?',
        a: `Create an account with your email address and choose a display name. From your advertiser dashboard, click "Create Advertisement" and complete your profile — bio, photos, rates, availability, and service areas. Your advertisement will be held for moderation review and typically approved within 24 hours. You can update your advertisement at any time.`,
      },
      {
        q: 'How do I get verified?',
        a: `From your advertiser dashboard, click "Get Verified" and follow the steps. You will be asked to upload a government-issued photo ID and complete a facial liveness check. This process is handled by our trusted third-party verification partner — your documents are not stored on our servers. Verification typically takes 1–2 business days.`,
      },
      {
        q: "What is the platform's commission?",
        a: `SecretXperience retains a 15% platform fee on all bookings processed through the platform's payment system. This fee covers secure payment processing, fraud prevention, customer support, moderation, and platform infrastructure. The fee is deducted automatically before payout. There are no listing fees, no monthly subscription charges, and no hidden costs.`,
      },
      {
        q: 'How and when do I get paid?',
        a: `Payouts are processed via Stripe Connect to your linked bank account. Funds are typically released within 2–5 business days after a booking is marked as completed. You can view your earnings and payout history in your advertiser dashboard. Minimum payout threshold is €20. Payouts are issued in euros.`,
      },
    ],
  },
  {
    group: 'General',
    items: [
      {
        q: 'Is SecretXperience legal?',
        a: `Yes. SecretXperience is a legal marketplace operating under Belgian law and applicable EU regulations, including the GDPR and the Digital Services Act. In Belgium and most EU member states, adult work between consenting adults of legal age is legal. SecretXperience does not operate in jurisdictions where such services are prohibited, and we actively decline to serve users in those regions.`,
      },
      {
        q: 'Which countries does SecretXperience serve?',
        a: `SecretXperience currently serves clients and advertisers in Belgium, the Netherlands, France, Germany, Luxembourg, and Spain. We are expanding to additional EU member states where the legal environment permits our services. Users attempting to access the platform from restricted jurisdictions will be presented with a geo-restriction notice.`,
      },
      {
        q: 'How is my personal data protected?',
        a: `We take data protection seriously. SecretXperience is GDPR-compliant. We collect only the data necessary to operate the platform, store it with encryption at rest and in transit, and never sell or share it with third parties for commercial purposes. You have the right to access, correct, export, or delete your data at any time. Full details are in our Privacy Policy at secretxperience.eu/privacy. Data requests can be sent to privacy@secret-xperience.eu.`,
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '0.5px solid #c5a05a18',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 400, color: open ? '#c5a05a' : '#e8e0d0', lineHeight: 1.5, flex: 1, transition: 'color 0.2s' }}>
          {q}
        </span>
        <span style={{ color: '#c5a05a', fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>
          +
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20, paddingRight: 32 }}>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: '#888', whiteSpace: 'pre-wrap' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
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
          Help
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          FAQ
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Answers to the most common questions from clients, advertisers, and newcomers to the platform.
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 120px' }}>
        {faqGroups.map((group, gIdx) => (
          <section key={group.group} style={{ marginBottom: gIdx < faqGroups.length - 1 ? 64 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: '#e8e0d0', letterSpacing: '0.01em' }}>
                {group.group}
              </h2>
            </div>
            <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 0 }} />
            <div>
              {group.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}

        <div style={{ marginTop: 80, paddingTop: 40, borderTop: '0.5px solid #c5a05a18', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            Still have questions?{' '}
            <a href="/contact" style={{ color: '#c5a05a' }}>Contact Support</a>
            {' '}or email{' '}
            <a href="mailto:support@secretxperience.eu" style={{ color: '#c5a05a' }}>support@secretxperience.eu</a>
            <br />
            <a href="/regulations" style={{ color: 'rgba(197,160,90,0.55)', fontSize: 11, letterSpacing: '0.05em' }}>Regulation &amp; Rights Guide →</a>
            {' '}·{' '}
            <a href="/medical" style={{ color: 'rgba(197,160,90,0.55)', fontSize: 11, letterSpacing: '0.05em' }}>Medical Resources →</a>
          </div>
        </div>
      </main>
    </div>
  )
}
