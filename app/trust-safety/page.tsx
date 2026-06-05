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

const sections = [
  {
    num: '01',
    title: 'Our Verification Process',
    body: `Every advertiser on SecretXperience must complete a multi-step identity and age verification process before their listing becomes visible to clients. This is not optional.

Our verification flow includes:

• Government-issued photo ID check (passport, national ID card, or driving licence) — performed by a trusted third-party verification partner, not stored on our servers.
• Facial liveness check — to confirm the person submitting the ID is the account holder.
• Age confirmation — we verify that the individual is at least 18 years of age.
• Profile review — our moderation team manually reviews each new listing before it goes live.

A gold verification badge appears on all listings that have passed our full check. You can trust that any verified advertiser has been authenticated as a real adult.`,
  },
  {
    num: '02',
    title: 'Community Guidelines',
    body: `SecretXperience is a professional marketplace. All users — clients and advertisers alike — are expected to conduct themselves with respect and good faith.

For advertisers:
• All profile content must depict only you. Using another person's images without their documented consent is prohibited and may constitute a criminal offence.
• Descriptions must be accurate and not misleading.
• You may not impersonate another person or platform.

For clients:
• Treat advertisers with respect at all times.
• Do not attempt to negotiate services or prices outside the platform in ways that violate our terms.
• Do not request or attempt to facilitate illegal activity.

For everyone:
• No harassment, threats, or abusive language in any communication.
• No sharing of private information without consent.
• No attempts to circumvent the platform's payment or communication systems.

Violations are investigated promptly. Accounts may be suspended or permanently banned without warning.`,
  },
  {
    num: '03',
    title: 'How to Stay Safe',
    body: `We provide the infrastructure — but your personal safety matters to us beyond the platform. Here are practical guidelines we recommend.

For clients:
• Always book through the platform. Off-platform arrangements remove your consumer protections and payment guarantees.
• Read reviews from verified previous clients.
• Trust your instincts. If something feels wrong, it probably is.
• Never share your home address until you are comfortable doing so.

For advertisers:
• You are never obligated to accept a booking. Decline any request that makes you uncomfortable.
• Screen clients using the platform's messaging tools before confirming.
• Share your location with a trusted person when meeting clients in person.
• Keep a record of all communications through the platform.
• Use our block and report tools if you experience any inappropriate behaviour.`,
  },
  {
    num: '04',
    title: 'Reporting Abuse',
    body: `If you encounter content or behaviour that violates our policies, please report it immediately. We take every report seriously.

How to report:
• Use the "Report" button on any listing or message thread.
• Visit our dedicated report page at secretxperience.eu/report.
• Email trust@secret-xperience.eu directly for urgent matters.

What happens after you report:
1. Your report is received and logged with a timestamp.
2. Our moderation team reviews it within 24 hours (typically much sooner for urgent cases).
3. If a violation is confirmed, the content or account is suspended immediately.
4. You receive a notification with the outcome.
5. Serious violations are escalated to law enforcement.

All reports are confidential. We do not disclose the identity of the reporting party to the subject of the report.`,
  },
  {
    num: '05',
    title: 'Zero-Tolerance Policies',
    body: `The following are absolute prohibitions with no exceptions, no warnings, and no second chances:

Minors — Any content depicting individuals under 18 years of age in a sexual context is illegal and will result in immediate permanent account termination, evidence preservation, and reporting to law enforcement including NCMEC and Belgian Federal Police.

Human Trafficking — Any content or activity that facilitates the trafficking, exploitation, or coercion of persons is strictly prohibited. We cooperate fully with Belgian and EU law enforcement on all trafficking-related investigations.

Coercion and Non-Consent — Any content depicting non-consensual acts, or any communication that suggests an advertiser is operating under duress or coercion, will be treated as an emergency. We will escalate immediately.

These policies are not subject to interpretation, negotiation, or appeal. Our commitment to eradicating exploitation on this platform is absolute.`,
  },
  {
    num: '06',
    title: 'Verification Badge Explained',
    body: `The gold verification badge that appears on advertiser profiles indicates the following has been confirmed:

✓ The advertiser's government-issued ID has been checked by our third-party verification partner.
✓ The advertiser is confirmed to be at least 18 years old.
✓ The profile photos match the verified individual via facial liveness check.
✓ The listing has been reviewed and approved by our moderation team.

The badge does not constitute an endorsement of any service, guarantee any particular outcome, or mean that SecretXperience vouches for the advertiser's character beyond identity and age confirmation.

Advertisers who let their verification lapse, or whose documents are found to be fraudulent after the fact, will have their badge removed and their account reviewed immediately.

If you have reason to believe a verified badge has been obtained fraudulently, please report it at trust@secret-xperience.eu.`,
  },
]

export default function TrustSafetyPage() {
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
          Safety First
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          Trust &amp; Safety
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          How we verify, protect, and support every person on the platform — from first listing to final payout.
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 120px' }}>
        {sections.map((section, idx) => (
          <article key={section.num} style={{ marginBottom: idx < sections.length - 1 ? 64 : 0, paddingTop: 8, scrollMarginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#c5a05a22', lineHeight: 1, minWidth: 52, userSelect: 'none' }}>
                {section.num}
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: '#c5a05a', letterSpacing: '0.01em', lineHeight: 1.2 }}>
                {section.title}
              </h2>
            </div>
            <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 24 }} />
            <div style={{ fontSize: 15, lineHeight: 1.85, color: '#999', whiteSpace: 'pre-wrap' }}>
              {section.body}
            </div>
          </article>
        ))}

        <div style={{ marginTop: 80, paddingTop: 40, borderTop: '0.5px solid #c5a05a18', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            To report urgent concerns contact <a href="mailto:trust@secret-xperience.eu" style={{ color: '#c5a05a' }}>trust@secret-xperience.eu</a>
            <br />
            <a href="/report" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>Report a Listing →</a>
          </div>
        </div>
      </main>
    </div>
  )
}
