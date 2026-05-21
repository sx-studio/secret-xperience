'use client'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', gold: '#c5a05a', serif: "'Cormorant Garamond', serif", sans: "'Jost', sans-serif" }

const SECTIONS = [
  { title: 'Our copyright policy', body: `SecretXperience.eu respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512), we will respond expeditiously to claims of copyright infringement committed using our platform.\n\nIf you believe that content hosted on SecretXperience.eu infringes your copyright, you may submit a DMCA takedown notice to our designated agent.` },
  { title: 'How to submit a DMCA notice', body: `Send a written notification to our DMCA agent at: legal@secret-xperience.eu\n\nYour notice must include all of the following elements to be valid under 17 U.S.C. § 512(c)(3):\n\n1. A physical or electronic signature of the copyright owner or authorised representative.\n\n2. Identification of the copyrighted work you claim has been infringed.\n\n3. Identification of the material that is claimed to be infringing, and information reasonably sufficient for us to locate it on the platform (e.g. the URL).\n\n4. Your contact information: name, address, telephone number, and email address.\n\n5. A statement that you have a good-faith belief that use of the material in the manner complained of is not authorised by the copyright owner, its agent, or the law.\n\n6. A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorised to act on behalf of the copyright owner.` },
  { title: 'Counter-notification', body: `If you believe content was removed from the platform as a result of mistake or misidentification, you may submit a counter-notification. Your counter-notification must include:\n\n1. Your physical or electronic signature.\n\n2. Identification of the material that was removed and the location where it appeared before removal.\n\n3. A statement under penalty of perjury that you have a good-faith belief that the material was removed as a result of mistake or misidentification.\n\n4. Your name, address, telephone number, and email address.\n\n5. A statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located.\n\nUpon receipt of a valid counter-notification, we will forward it to the original complainant and may restore the content after 10–14 business days unless the complainant files a court action.` },
  { title: 'Repeat infringer policy', body: `SecretXperience.eu maintains a policy of terminating, in appropriate circumstances and at our sole discretion, the accounts of users who are deemed to be repeat infringers. A "repeat infringer" is any user about whom we receive multiple valid DMCA notices, or any user who repeatedly uploads content that infringes third-party copyright.\n\nUsers whose accounts are terminated under this policy are prohibited from re-registering on the platform.` },
  { title: 'Designated DMCA agent', body: `All DMCA notices and counter-notifications must be sent to:\n\nDMCA Agent — SecretXperience.eu\nEmail: legal@secret-xperience.eu\n\nPlease note that under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing, or that material was removed by mistake, may be subject to liability for damages.` },
]

export default function DmcaPage() {
  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:${S.gold};text-decoration:none}a:hover{text-decoration:underline}`}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #c5a05a22', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em' }}>Secret<span style={{ color: S.gold }}>Xperience</span></a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: S.gold, textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</p>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px,5vw,54px)', fontWeight: 400, color: S.t, marginBottom: '0.5rem', lineHeight: 1.1 }}>DMCA <em style={{ fontStyle: 'italic', color: S.gold }}>Policy</em></h1>
        <p style={{ color: S.t2, fontSize: 14, marginBottom: '3rem' }}>Digital Millennium Copyright Act — 17 U.S.C. § 512</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {SECTIONS.map((s, i) => (
            <section key={i} style={{ borderLeft: '2px solid #c5a05a22', paddingLeft: '1.5rem' }}>
              <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>{s.title}</h2>
              <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85, whiteSpace: 'pre-line' }}>{s.body}</div>
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
