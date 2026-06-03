import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Cams — SecretXperience',
  description: 'Watch live adult cams from verified performers. Private shows, live chat, and more — exclusively on SecretXperience.',
  openGraph: {
    title: 'Live Cams — SecretXperience',
    description: 'Live adult cams from verified performers. Private shows and live chat.',
    url: 'https://www.secretxperience.eu/live',
  },
}

// ── Stripchat affiliate config ──────────────────────────────────────────────
// Replace STRIPCHAT_REF_CODE with your affiliate ref code from
// https://stripchat.com/affiliates → My Links
const STRIPCHAT_REF = process.env.NEXT_PUBLIC_STRIPCHAT_REF || 'STRIPCHAT_REF_CODE'

export default function LivePage() {
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg,#050505)}
        .live-page{min-height:100vh;background:var(--bg,#050505);color:var(--t,#ece8e1);font-family:var(--sans,'Poppins',sans-serif)}

        /* ── Hero bar ── */
        .live-hero{
          padding:56px 24px 0;
          max-width:1200px;margin:0 auto;
          display:flex;align-items:flex-end;justify-content:space-between;gap:16px;
          flex-wrap:wrap;
        }
        .live-hero-left{}
        .live-pill{
          display:inline-flex;align-items:center;gap:6px;
          background:rgba(239,68,68,0.12);border:0.5px solid rgba(239,68,68,0.3);
          color:#ef4444;padding:3px 10px;border-radius:20px;
          font:600 11px/1.6 var(--sans);letter-spacing:.08em;text-transform:uppercase;
          margin-bottom:12px;
        }
        .live-pill span.dot{
          width:6px;height:6px;border-radius:50%;background:#ef4444;
          animation:livepulse 1.4s ease-in-out infinite;
        }
        @keyframes livepulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        .live-title{
          font-family:var(--serif,'Cormorant Garamond',serif);
          font-size:clamp(28px,5vw,48px);font-weight:400;
          line-height:1.1;letter-spacing:-0.01em;
          color:var(--t,#ece8e1);margin-bottom:8px;
        }
        .live-title em{
          font-style:italic;
          background:linear-gradient(90deg,#c5a05a 0%,#e8cc88 50%,#c5a05a 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .live-sub{font-size:14px;color:var(--t2,#8c8880);max-width:480px;line-height:1.6}
        .live-hero-right{display:flex;gap:10px;flex-wrap:wrap}
        .live-filter-btn{
          display:inline-flex;align-items:center;gap:7px;
          padding:9px 16px;border-radius:10px;cursor:pointer;
          background:var(--bg2,rgba(255,255,255,0.05));
          border:0.5px solid var(--b2,rgba(255,255,255,0.1));
          color:var(--t2,#8c8880);font:500 13px var(--sans);
          text-decoration:none;transition:border-color .2s,color .2s;
        }
        .live-filter-btn:hover,.live-filter-btn.active{
          border-color:rgba(197,160,90,0.4);color:var(--gold,#c5a05a);
        }
        .live-filter-btn i{font-size:15px}

        /* ── Widget container ── */
        .live-widget-wrap{
          max-width:1200px;margin:28px auto 0;padding:0 24px 56px;
        }
        .live-widget-frame{
          width:100%;border-radius:14px;overflow:hidden;
          border:0.5px solid var(--b2,rgba(255,255,255,0.08));
          background:#0a0a0a;
          box-shadow:0 24px 80px rgba(0,0,0,0.6);
          position:relative;
        }
        .live-widget-frame iframe{
          display:block;width:100%;height:680px;border:none;
        }

        /* ── Info cards ── */
        .live-info{
          max-width:1200px;margin:0 auto;padding:40px 24px 60px;
          display:grid;grid-template-columns:repeat(3,1fr);gap:16px;
        }
        .live-info-card{
          background:var(--bg1,#0d0d0d);
          border:0.5px solid var(--b2,rgba(255,255,255,0.07));
          border-radius:12px;padding:24px;
        }
        .live-info-icon{
          width:36px;height:36px;border-radius:8px;
          background:rgba(197,160,90,0.1);
          display:flex;align-items:center;justify-content:center;
          color:var(--gold,#c5a05a);font-size:18px;margin-bottom:12px;
        }
        .live-info-card h3{
          font-family:var(--serif);font-size:18px;font-weight:400;
          color:var(--t,#ece8e1);margin-bottom:6px;
        }
        .live-info-card p{font-size:13px;color:var(--t2,#8c8880);line-height:1.6}

        /* ── Disclaimer ── */
        .live-disclaimer{
          max-width:1200px;margin:0 auto;padding:0 24px 48px;
          font-size:11px;color:var(--t3,#4c4a47);line-height:1.7;
          border-top:0.5px solid var(--b,rgba(255,255,255,0.05));
          padding-top:20px;
        }
        .live-disclaimer a{color:inherit;text-decoration:underline;opacity:0.7}

        /* ── Mobile ── */
        @media(max-width:768px){
          .live-hero{padding-top:32px}
          .live-widget-frame iframe{height:480px}
          .live-info{grid-template-columns:1fr}
          .live-hero-right{display:none}
        }
        @media(max-width:480px){
          .live-widget-frame iframe{height:380px}
        }

        /* Nav back link */
        .live-back{
          display:inline-flex;align-items:center;gap:6px;
          padding:10px 24px;color:var(--t2,#8c8880);font:400 13px var(--sans);
          text-decoration:none;transition:color .2s;
        }
        .live-back:hover{color:var(--t,#ece8e1)}
        .live-back i{font-size:14px}
      `}</style>

      <div className="live-page">
        <a href="/" className="live-back">
          <i className="ti ti-arrow-left" aria-hidden="true" />
          SecretXperience
        </a>

        <div className="live-hero">
          <div className="live-hero-left">
            <div className="live-pill">
              <span className="dot" />
              Live Now
            </div>
            <h1 className="live-title">
              Private <em>Live Shows</em>
            </h1>
            <p className="live-sub">
              Watch and connect with live performers in real time. Discreet, exclusive, and available now.
            </p>
          </div>
          <div className="live-hero-right">
            <a
              href={`https://stripchat.com/?ref=${STRIPCHAT_REF}`}
              target="_blank"
              rel="noopener noreferrer"
              className="live-filter-btn"
            >
              <i className="ti ti-user" />
              Female
            </a>
            <a
              href={`https://stripchat.com/couples?ref=${STRIPCHAT_REF}`}
              target="_blank"
              rel="noopener noreferrer"
              className="live-filter-btn"
            >
              <i className="ti ti-hearts" />
              Couples
            </a>
            <a
              href={`https://stripchat.com/trans?ref=${STRIPCHAT_REF}`}
              target="_blank"
              rel="noopener noreferrer"
              className="live-filter-btn"
            >
              <i className="ti ti-rainbow" />
              Trans
            </a>
            <a
              href={`https://stripchat.com/male?ref=${STRIPCHAT_REF}`}
              target="_blank"
              rel="noopener noreferrer"
              className="live-filter-btn"
            >
              <i className="ti ti-gender-male" />
              Male
            </a>
          </div>
        </div>

        <div className="live-widget-wrap">
          <div className="live-widget-frame">
            {/* Stripchat Adaptive Widget — replace STRIPCHAT_REF_CODE env var with your affiliate code */}
            <iframe
              src={`https://stripchat.com/widget/2?desktop_url=https%3A%2F%2Fstripchat.com%2F%3Fref%3D${STRIPCHAT_REF}&theme=black&autoplay=1&type=popular&gender=female&ref=${STRIPCHAT_REF}`}
              title="Live Cams"
              allow="autoplay; fullscreen"
              allowFullScreen
              scrolling="no"
            />
          </div>
        </div>

        <div className="live-info">
          <div className="live-info-card">
            <div className="live-info-icon">
              <i className="ti ti-lock" aria-hidden="true" />
            </div>
            <h3>100% Private</h3>
            <p>All sessions are encrypted and completely discreet. Your identity is never shared with performers or third parties.</p>
          </div>
          <div className="live-info-card">
            <div className="live-info-icon">
              <i className="ti ti-star" aria-hidden="true" />
            </div>
            <h3>Verified Performers</h3>
            <p>Every live host is age-verified and consenting. Browse hundreds of performers available right now.</p>
          </div>
          <div className="live-info-card">
            <div className="live-info-icon">
              <i className="ti ti-device-mobile" aria-hidden="true" />
            </div>
            <h3>Any Device</h3>
            <p>Seamlessly works on mobile, tablet, and desktop. Private shows and HD streaming included.</p>
          </div>
        </div>

        <div className="live-disclaimer">
          Live cam content is provided by Stripchat. All performers are consenting adults aged 18+.
          By viewing this page you confirm you are 18 or older and agree to our{' '}
          <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>.
          SecretXperience participates in the Stripchat affiliate programme and may receive compensation for referrals.
        </div>
      </div>
    </>
  )
}
