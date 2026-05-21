import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import NightlifeGrid from './NightlifeGrid'

/* ─── Types ─────────────────────────────────────────────── */

interface Listing {
  id: string
  title: string
  description: string | null
  city: string | null
  country: string | null
  category: string
  subcategory: string | null
  images: string[] | null
  active: boolean
  created_at: string
  tags: string[] | null
  verified?: boolean
}

/* ─── Supabase Server Client ─────────────────────────────── */

async function getListings() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('category', 'nightlife')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(60)
  return (data as Listing[]) || []
}

/* ─── Page ──────────────────────────────────────────────── */

export default async function NightlifePage() {
  const listings = await getListings()

  const CITIES = ['All', 'Brussels', 'Antwerp', 'Amsterdam', 'Berlin', 'Paris']
  const VENUE_TYPES = ['All', 'Club', 'Bar', 'Strip Club', 'Private Party', 'Lounge']

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Nightlife', item: 'https://www.secretxperience.eu/nightlife' },
        ]},
        { '@context': 'https://schema.org', '@type': 'Service', name: 'Nightlife Services', serviceType: 'Adult Nightlife Services', provider: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' }, areaServed: ['BE','NL','DE','FR'], url: 'https://www.secretxperience.eu/nightlife', description: 'Exclusive clubs, bars, strip venues and adult nightlife experiences across Europe.' },
      ]) }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGold {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        body { background: var(--bg, #050505); }

        /* ── Sticky Nav ── */
        .nl-nav {
          position: sticky;
          top: 0;
          z-index: 200;
          height: 60px;
          background: rgba(5,5,5,0.92);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .nl-nav-logo {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 20px;
          font-weight: 400;
          color: var(--gold, #c5a05a);
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .nl-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nl-nav-link {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .nl-nav-link:hover { color: rgba(255,255,255,0.75); }
        .nl-nav-link.active { color: var(--gold, #c5a05a); }

        /* ── Hero ── */
        .nl-hero {
          position: relative;
          overflow: hidden;
          min-height: 480px;
          display: flex;
          align-items: flex-end;
          padding: 4rem 2rem 3.5rem;
        }
        .nl-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #0a0006 0%,
            #0d0318 20%,
            #120520 40%,
            #0f0210 60%,
            #180614 80%,
            #0a0006 100%
          );
          background-size: 300% 300%;
          animation: gradShift 12s ease infinite;
        }
        .nl-hero-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(197,160,90,0.08) 0%, transparent 70%);
        }
        .nl-hero-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
          pointer-events: none;
        }
        .nl-hero-content {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
          width: 100%;
          animation: fadeUp 0.7s ease;
        }
        .nl-hero-eyebrow {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold, #c5a05a);
          opacity: 0.7;
          margin-bottom: 1rem;
        }
        .nl-hero-h1 {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: clamp(42px, 7vw, 80px);
          font-weight: 300;
          font-style: italic;
          color: var(--t, #ece8e1);
          line-height: 1.0;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }
        .nl-hero-h1 em {
          background: linear-gradient(135deg, #e8d4a4 0%, #c5a05a 40%, #a0803d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }
        .nl-hero-sub {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 16px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.02em;
          line-height: 1.6;
          max-width: 480px;
        }
        .nl-hero-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold, #c5a05a);
          margin-right: 10px;
          animation: pulseGold 2s ease-in-out infinite;
          vertical-align: middle;
          margin-bottom: 2px;
        }

        /* ── Filters ── */
        .nl-filters-wrap {
          background: rgba(5,5,5,0.98);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          padding: 0 2rem;
          position: sticky;
          top: 60px;
          z-index: 100;
        }
        .nl-city-tabs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
        }
        .nl-city-tabs::-webkit-scrollbar { display: none; }
        .nl-city-tab {
          padding: 16px 20px;
          border-bottom: 2px solid transparent;
          background: transparent;
          border-top: none;
          border-left: none;
          border-right: none;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nl-city-tab:hover { color: rgba(255,255,255,0.65); }
        .nl-city-tab.active {
          color: var(--gold, #c5a05a);
          border-bottom-color: var(--gold, #c5a05a);
        }
        .nl-type-pills {
          display: flex;
          gap: 8px;
          padding: 12px 0;
          overflow-x: auto;
          scrollbar-width: none;
          align-items: center;
        }
        .nl-type-pills::-webkit-scrollbar { display: none; }
        .nl-type-pill {
          padding: 6px 14px;
          border-radius: 20px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: transparent;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.03em;
        }
        .nl-type-pill:hover { border-color: rgba(197,160,90,0.35); color: rgba(197,160,90,0.7); }
        .nl-type-pill.active {
          background: rgba(197,160,90,0.08);
          border-color: rgba(197,160,90,0.5);
          color: var(--gold, #c5a05a);
        }

        /* ── Grid ── */
        .nl-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 6rem;
        }
        .nl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 640px) {
          .nl-grid { grid-template-columns: 1fr; }
          .nl-nav-links { display: none; }
        }

        /* ── Venue Card ── */
        .nl-card {
          background: var(--bg1, #111);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: var(--rl, 13px);
          overflow: hidden;
          transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          animation: fadeUp 0.4s ease both;
        }
        .nl-card:hover {
          border-color: rgba(197,160,90,0.3);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(197,160,90,0.12);
        }
        .nl-card-img {
          position: relative;
          height: 260px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .nl-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .nl-card:hover .nl-card-img img { transform: scale(1.04); }
        .nl-card-img-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0d0a16 0%, #1a0f22 50%, #0a0810 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nl-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.1) 0%,
            rgba(0,0,0,0.2) 40%,
            rgba(0,0,0,0.75) 100%
          );
        }
        .nl-card-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem 1.25rem 0.9rem;
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 22px;
          font-weight: 400;
          color: #ece8e1;
          letter-spacing: 0.01em;
          line-height: 1.2;
          z-index: 1;
        }
        .nl-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .nl-badge-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .nl-badge-open {
          background: rgba(62,207,142,0.2);
          border: 0.5px solid rgba(62,207,142,0.5);
          color: #3ecf8e;
        }
        .nl-badge-tonight {
          background: rgba(197,160,90,0.18);
          border: 0.5px solid rgba(197,160,90,0.45);
          color: #c5a05a;
        }
        .nl-card-body {
          padding: 1.1rem 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          flex: 1;
        }
        .nl-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .nl-card-city {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(197,160,90,0.55);
        }
        .nl-card-type {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.04em;
        }
        .nl-card-desc {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .nl-card-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .nl-tag {
          padding: 3px 9px;
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 10px;
          font-weight: 400;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.04em;
        }
        .nl-card-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.65rem;
          border-top: 0.5px solid rgba(255,255,255,0.06);
        }
        .nl-cta-link {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 12px;
          font-weight: 500;
          color: var(--gold, #c5a05a);
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .nl-cta-link:hover { opacity: 0.7; }

        /* ── Empty state ── */
        .nl-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 5rem 1rem;
          color: rgba(255,255,255,0.15);
        }
        .nl-empty-icon {
          font-size: 56px;
          margin-bottom: 1.5rem;
          opacity: 0.25;
        }
        .nl-empty-text {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 22px;
          font-weight: 300;
          font-style: italic;
          margin-bottom: 0.75rem;
          color: rgba(255,255,255,0.2);
        }
        .nl-empty-sub {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.03em;
        }

        /* ── Count bar ── */
        .nl-count-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 10px;
        }
        .nl-count-label {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }
        .nl-count-num {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 18px;
          font-weight: 400;
          color: rgba(197,160,90,0.5);
          margin-left: 8px;
        }

        /* ── CTA Block ── */
        .nl-cta-block {
          position: relative;
          overflow: hidden;
          border-radius: var(--rl, 13px);
          border: 0.5px solid rgba(197,160,90,0.2);
          background: linear-gradient(135deg, rgba(197,160,90,0.06) 0%, rgba(10,5,20,0) 60%);
          padding: 3rem 2.5rem;
          margin-top: 3rem;
          text-align: center;
        }
        .nl-cta-block::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(197,160,90,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .nl-cta-block-title {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 32px;
          font-weight: 300;
          font-style: italic;
          color: var(--t, #ece8e1);
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }
        .nl-cta-block-sub {
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.02em;
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        .nl-cta-block-btn {
          display: inline-block;
          padding: 13px 32px;
          background: linear-gradient(135deg, #c5a05a 0%, #a0803d 100%);
          border: none;
          border-radius: var(--r, 8px);
          font-family: var(--sans, 'Jost', sans-serif);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #080808;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 8px 32px rgba(197,160,90,0.25);
          position: relative;
          overflow: hidden;
        }
        .nl-cta-block-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%);
          pointer-events: none;
        }
        .nl-cta-block-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Filter interactivity (client-side via data attrs) ── */
        [data-city]:not([data-city="All"]) { display: none; }
        [data-city="All"] { display: flex; }
      `}</style>

      {/* Sticky Nav */}
      <nav className="nl-nav">
        <a href="/" className="nl-nav-logo">
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </a>
        <div className="nl-nav-links">
          <a href="/escorts" className="nl-nav-link">Listings</a>
          <a href="/nightlife" className="nl-nav-link active">Nightlife</a>
          <a href="/events" className="nl-nav-link">Events</a>
          <a href="/dashboard" className="nl-nav-link">Dashboard</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="nl-hero">
        <div className="nl-hero-bg" />
        <div className="nl-hero-overlay" />
        <div className="nl-hero-noise" />
        <div className="nl-hero-content">
          <div className="nl-hero-eyebrow">
            <span className="nl-hero-dot" />
            Premier Nightlife Directory
          </div>
          <h1 className="nl-hero-h1">
            <em>Tonight&apos;s</em> Scene
          </h1>
          <p className="nl-hero-sub">
            Discover Europe&apos;s most exclusive clubs, private lounges and after-dark experiences — curated for the discerning night.
          </p>
        </div>
      </section>

      {/* Filters — city tabs + type pills (client-side interaction via script) */}
      <div className="nl-filters-wrap" id="nl-filters">
        <div className="nl-city-tabs" role="tablist" id="nl-city-tabs">
          {CITIES.map((city, i) => (
            <button
              key={city}
              className={`nl-city-tab${i === 0 ? ' active' : ''}`}
              data-city-filter={city}
              role="tab"
              aria-selected={i === 0}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="nl-type-pills" id="nl-type-pills">
          {VENUE_TYPES.map((type, i) => (
            <button
              key={type}
              className={`nl-type-pill${i === 0 ? ' active' : ''}`}
              data-type-filter={type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="nl-main">

        <NightlifeGrid listings={listings} />

        {/* List your venue CTA */}
        <div className="nl-cta-block">
          <h2 className="nl-cta-block-title">List your venue</h2>
          <p className="nl-cta-block-sub">
            Reach Europe&apos;s most exclusive clientele.<br />
            List your club, bar, lounge or private event space on SecretXperience.
          </p>
          <a href="/listings/create" className="nl-cta-block-btn">
            Get listed →
          </a>
        </div>

      </main>

      {/* Client-side filter script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var cityFilter = 'All';
          var typeFilter = 'All';

          function applyFilters() {
            var cards = document.querySelectorAll('#nl-grid [data-city]');
            cards.forEach(function(card) {
              var city  = card.getAttribute('data-city') || '';
              var vtype = card.getAttribute('data-vtype') || '';
              var cityOk = cityFilter === 'All' || city.toLowerCase() === cityFilter.toLowerCase();
              var typeOk = typeFilter === 'All' || vtype.toLowerCase() === typeFilter.toLowerCase();
              card.style.display = (cityOk && typeOk) ? 'flex' : 'none';
            });
          }

          document.querySelectorAll('[data-city-filter]').forEach(function(btn) {
            btn.addEventListener('click', function() {
              cityFilter = btn.getAttribute('data-city-filter');
              document.querySelectorAll('[data-city-filter]').forEach(function(b) {
                b.classList.toggle('active', b === btn);
              });
              applyFilters();
            });
          });

          document.querySelectorAll('[data-type-filter]').forEach(function(btn) {
            btn.addEventListener('click', function() {
              typeFilter = btn.getAttribute('data-type-filter');
              document.querySelectorAll('[data-type-filter]').forEach(function(b) {
                b.classList.toggle('active', b === btn);
              });
              applyFilters();
            });
          });

          applyFilters();
        })();
      ` }} />
    </>
  )
}
