'use client'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', t3: '#555', gold: '#c5a05a', b: '#c5a05a22', b2: '#ffffff18', serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif" }

export default function DmcaPage() {
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

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid ${S.b}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em' }}>Secret<span style={{ color: S.gold }}>Xperience</span></a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>

      <div style={{ borderBottom: `0.5px solid #c5a05a18`, padding: '64px 24px 48px', textAlign: 'center', background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)' }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: 20 }}>Legal Document</div>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: S.t, lineHeight: 1.1, marginBottom: 16 }}>DMCA Policy</h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          SecretXperience.eu respects the intellectual property rights of others and responds promptly to valid copyright infringement notices.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, color: '#444', letterSpacing: '0.05em' }}>
          Last updated: 21 May 2025 &nbsp;·&nbsp; Contact: support@secretxperience.eu
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* Copyright policy */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Our copyright policy</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>SecretXperience.eu is operated by 3S.lifestyle bv (Tangendallaan 23, 1850 Grimbergen, Belgium). We respect the intellectual property rights of others and expect our users to do the same.</p>
              <p style={{ marginBottom: '1rem' }}>If you believe that content hosted on SecretXperience.eu infringes your copyright, you may submit a takedown notice to us. We will investigate the claim and remove infringing content without undue delay upon receipt of a valid notice.</p>
              <p>All notices and counter-notifications should be sent to: <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a></p>
            </div>
          </section>

          {/* How to submit a notice */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>How to submit a copyright notice</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>Send a written notification to <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a> with the subject line <strong style={{ color: S.t }}>DMCA Takedown Notice</strong>. Your notice must include all of the following elements to be valid:</p>
              <ol style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><strong style={{ color: S.t }}>Your identity:</strong> Your full name, postal address, telephone number, and email address, or those of the person authorised to act on behalf of the copyright owner.</li>
                <li><strong style={{ color: S.t }}>Description of the copyrighted work:</strong> Identify the copyrighted work you claim has been infringed. If multiple works are covered by a single notice, a representative list is acceptable.</li>
                <li><strong style={{ color: S.t }}>Location of the infringing material:</strong> Provide the URL(s) or sufficient information to allow us to locate the allegedly infringing content on the Platform.</li>
                <li><strong style={{ color: S.t }}>Good faith statement:</strong> A statement that you have a good faith belief that use of the material in the manner complained of is not authorised by the copyright owner, its agent, or the law.</li>
                <li><strong style={{ color: S.t }}>Accuracy declaration:</strong> A statement that the information in your notice is accurate and, under penalty of perjury, that you are the copyright owner or are authorised to act on their behalf.</li>
                <li><strong style={{ color: S.t }}>Signature:</strong> Your physical or electronic signature.</li>
              </ol>
              <div style={{ marginTop: '1.25rem', background: '#0a0908', border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '16px 20px' }}>
                <strong style={{ color: S.t }}>Send notices to:</strong><br />
                <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a><br />
                <span style={{ color: S.t3, fontSize: 13 }}>Subject line: DMCA Takedown Notice — [URL of content]</span>
              </div>
            </div>
          </section>

          {/* Counter-notification */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Counter-notification</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>If you believe content was removed from the Platform as a result of mistake or misidentification, you may submit a counter-notification. Your counter-notification must include:</p>
              <ol style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <li><strong style={{ color: S.t }}>Your signature:</strong> Your physical or electronic signature.</li>
                <li><strong style={{ color: S.t }}>Identification of material:</strong> Identification of the material that was removed and the location where it appeared on the Platform before removal.</li>
                <li><strong style={{ color: S.t }}>Good faith statement:</strong> A statement under penalty of perjury that you have a good faith belief that the material was removed as a result of mistake or misidentification.</li>
                <li><strong style={{ color: S.t }}>Your contact information:</strong> Your name, address, telephone number, and email address.</li>
                <li><strong style={{ color: S.t }}>Jurisdiction consent:</strong> A statement that you consent to the jurisdiction of the courts of Brussels, Belgium, and that you will accept service of process from the person who submitted the original notice.</li>
              </ol>
              <p>Upon receipt of a valid counter-notification, we will forward it to the original complainant. If no court action is initiated by the complainant, we may restore the removed content after <strong style={{ color: S.t }}>10–14 business days</strong>.</p>
            </div>
          </section>

          {/* Repeat infringer policy */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Repeat infringer policy</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1rem' }}>SecretXperience.eu maintains a policy of terminating, at our sole discretion, the accounts of users who are deemed to be repeat infringers. A repeat infringer is any user against whom we receive multiple valid takedown notices, or any user who repeatedly uploads content that infringes third-party copyright.</p>
              <p>Users whose accounts are terminated under this policy are prohibited from re-registering on the Platform.</p>
            </div>
          </section>

          {/* Designated agent */}
          <section style={{ borderLeft: `2px solid ${S.b}`, paddingLeft: '1.5rem' }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 500, color: S.t, marginBottom: '0.75rem' }}>Designated DMCA agent</h2>
            <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.85 }}>
              <p style={{ marginBottom: '1.25rem' }}>All copyright notices and counter-notifications must be sent to:</p>
              <div style={{ background: '#0a0908', border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px 24px', lineHeight: 2 }}>
                <strong style={{ color: S.t }}>DMCA Agent — SecretXperience.eu</strong><br />
                3S.lifestyle bv, Tangendallaan 23, 1850 Grimbergen, Belgium<br />
                Email: <a href="mailto:support@secretxperience.eu">support@secretxperience.eu</a><br />
                <span style={{ color: S.t3, fontSize: 13 }}>Subject line: DMCA Takedown Notice or DMCA Counter-Notification</span>
              </div>
              <p style={{ marginTop: '1.25rem' }}>Please note that any person who knowingly materially misrepresents that material is infringing, or that material was removed by mistake, may be subject to liability for damages under applicable law.</p>
            </div>
          </section>

        </div>
      </main>

      <footer style={{ borderTop: `0.5px solid ${S.b}`, padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2025 SecretXperience.eu · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/cookies">Cookie Policy</a> · <a href="/dmca">DMCA</a> · <a href="/contact">Contact</a></p>
      </footer>
    </div>
  )
}
