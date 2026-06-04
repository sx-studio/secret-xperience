'use client'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', gold: '#c5a05a', serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif" }

export default function Page2257() {
  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:${S.gold};text-decoration:none}a:hover{text-decoration:underline}`}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #c5a05a22', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em' }}>Secret<span style={{ color: S.gold }}>Xperience</span></a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: S.gold, textTransform: 'uppercase', marginBottom: '1rem' }}>Legal Compliance</p>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(30px,4vw,48px)', fontWeight: 400, color: S.t, marginBottom: '0.5rem', lineHeight: 1.1 }}>18 U.S.C. § 2257 <em style={{ fontStyle: 'italic', color: S.gold }}>Compliance Statement</em></h1>
        <p style={{ color: S.t2, fontSize: 14, marginBottom: '3rem' }}>Record-Keeping Requirements</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
          <p>SecretXperience.eu is an online marketplace platform that connects adult content creators and service advertisers with clients. The platform does not itself produce, create, or distribute sexually explicit content and therefore operates as a <strong style={{ color: S.t }}>secondary producer</strong> as defined under 18 U.S.C. § 2257.</p>
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 500, color: S.t, marginBottom: '0.6rem' }}>Advertiser responsibility</h2>
            <p>All individuals who create or publish content on this platform, including photographs, videos, and written material depicting sexually explicit conduct, are <strong style={{ color: S.t }}>primary producers</strong> under 18 U.S.C. § 2257 and are solely responsible for:</p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Maintaining records verifying that all depicted persons are 18 years of age or older at the time of production;</li>
              <li>Ensuring that all required records include the legal name, date of birth, and any assumed names used by each performer;</li>
              <li>Making records available for inspection pursuant to 18 U.S.C. § 2257(c).</li>
            </ul>
          </section>
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 500, color: S.t, marginBottom: '0.6rem' }}>Platform compliance</h2>
            <p>As a secondary producer, SecretXperience.eu maintains records — in the form of user account information and identity verification data — in compliance with 18 U.S.C. § 2257 and 28 C.F.R. Part 75, to the extent required of secondary producers.</p>
            <p style={{ marginTop: '0.75rem' }}>All advertisers must confirm, during account registration and listing creation, that all content they upload depicts only individuals who are 18 years of age or older. Uploading content depicting minors is strictly prohibited and will result in immediate account termination and referral to appropriate law enforcement authorities.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 500, color: S.t, marginBottom: '0.6rem' }}>Custodian of records</h2>
            <p>SecretXperience.eu<br />Custodian of Records<br />Brussels, Belgium<br />Email: legal@secret-xperience.eu</p>
            <p style={{ marginTop: '0.75rem' }}>Records may be inspected during normal business hours (09:00–17:00 CET, Monday–Friday) by arrangement with the custodian of records. Requests for inspection must be submitted in writing with at least 5 business days' notice.</p>
          </section>
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 500, color: S.t, marginBottom: '0.6rem' }}>Zero tolerance</h2>
            <p>SecretXperience.eu has a strict zero-tolerance policy regarding content involving minors. Any user who uploads, shares, or links to such content will be permanently banned and reported to law enforcement. If you encounter content you believe depicts a minor, please <a href="/report">report it immediately</a>.</p>
          </section>
        </div>
      </main>
      <footer style={{ borderTop: '0.5px solid #c5a05a22', padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2025 SecretXperience.eu · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/dmca">DMCA</a></p>
      </footer>
    </div>
  )
}
