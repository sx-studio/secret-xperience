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
    title: 'Our Story',
    body: `SecretXperience was born in Brussels — a city that has long stood at the intersection of cultures, discretion, and European cosmopolitanism. Founded in 2024 by a small team of product designers, legal professionals, and privacy advocates, we set out to build something the industry had never truly seen: a premium adult marketplace that places dignity, safety, and discretion at its very core.

We had grown tired of platforms that treated their users as a liability — where advertisers operated in the shadows, clients had no assurance of authenticity, and everyone was left vulnerable. We believed a better experience was possible. One that treated adults as capable, autonomous individuals deserving of a trustworthy, elegant environment.

So we built SecretXperience.`,
  },
  {
    num: '02',
    title: 'Our Mission',
    body: `Our mission is simple: connect consenting adults through a verified, safe, and discreet platform that upholds the highest standards of privacy and respect.

Every design decision, every policy, every feature on this platform flows from three guiding principles:

• Verified — Every advertiser on SecretXperience completes an identity verification process before their advertisement goes live. Clients can browse with confidence, knowing who they are engaging with.

• Safe — We maintain a zero-tolerance policy toward exploitation, coercion, and any content involving minors. Our moderation team operates around the clock. We cooperate fully with law enforcement.

• Discreet — Your privacy is not a feature we bolt on — it is the foundation we build on. From private, secure communications to anonymous billing descriptors, discretion is engineered into every layer of the platform.`,
  },
  {
    num: '03',
    title: 'Why We Exist',
    body: `The adult services industry operates in many jurisdictions across Europe under a patchwork of legal frameworks. In Belgium and much of the EU, adult work between consenting adults is legal. Yet most platforms serving this space were built without regard for the safety of workers or the expectations of discerning clients.

We exist to change that dynamic. By providing a regulated, professional marketplace, we:

• Reduce the risks that come with unverified, street-based or informal arrangements
• Give advertisers a professional platform to manage their business with dignity
• Give clients a transparent, authentic experience free from scams and deception
• Demonstrate to regulators, journalists, and the public that this industry can operate responsibly

We are not naive about the complexity of this space. We engage legal counsel, ethics advisors, and advocacy groups to continuously improve our policies and practices.`,
  },
  {
    num: '04',
    title: 'The Team',
    body: `We are a lean, privacy-first team based primarily in Brussels, with remote contributors across the EU.

Our founders come from backgrounds in fintech compliance, digital rights law, and UX design. We do not publicise individual names — not because we have anything to hide, but because discretion is a value we apply to ourselves as much as to our users.

What unites us is a shared conviction: that adults deserve a platform built with as much care, craft, and legal rigour as any mainstream marketplace — and that the stigma historically attached to this industry should never be an excuse for shoddy, unsafe products.

We are small, intentional, and deeply committed to getting this right.`,
  },
  {
    num: '05',
    title: 'Brussels & Beyond',
    body: `Brussels was the natural birthplace for this project. As the de-facto capital of the European Union, it sits at the heart of the regulatory frameworks — GDPR, the Digital Services Act, the AI Act — that shape how digital platforms must behave.

Operating here keeps us honest. We are not offshore, not in a regulatory grey zone. We are headquartered in the same city where the rules are written, and we believe that proximity to accountability makes us a better, more responsible company.

SecretXperience currently serves clients and advertisers across Belgium, the Netherlands, Germany, France, Luxembourg, and Spain, with further expansion planned across the EU.

We are registered and operating in full compliance with Belgian law and applicable EU regulations.`,
  },
  {
    num: '06',
    title: 'Contact & Legal',
    body: `General enquiries: hello@secret-xperience.eu
Press & media: press@secret-xperience.eu
Legal & compliance: legal@secret-xperience.eu
Data & privacy: privacy@secret-xperience.eu

SecretXperience.eu — Brussels, Belgium

Last updated: May 2025`,
  },
]

export default function AboutPage() {
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
          About the Platform
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          Our Story
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          A discreet, verified, and premium European adult marketplace — built with care, in Brussels.
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
            Want to work with us?{' '}
            <a href="mailto:hello@secret-xperience.eu" style={{ color: '#c5a05a' }}>hello@secret-xperience.eu</a>
            <br />
            <a href="/press" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>View Press Page →</a>
            {' '}·{' '}
            <a href="/regulations" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>Regulation &amp; Rights →</a>
            {' '}·{' '}
            <a href="/medical" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>Medical Resources →</a>
          </div>
        </div>
      </main>
    </div>
  )
}
