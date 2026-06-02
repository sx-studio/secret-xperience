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

const clientSteps = [
  {
    num: '01',
    icon: '◎',
    title: 'Browse Listings',
    body: 'Explore hundreds of verified provider profiles across Belgium and the EU. Filter by location, availability, service type, and language. All listings display a verification badge once identity has been confirmed.',
  },
  {
    num: '02',
    icon: '◈',
    title: 'Filter & Refine',
    body: 'Narrow your search with precision filters. Sort by rating, newest listings, or proximity. Save favourites to your private list for quick access later. Your browsing history is never shared.',
  },
  {
    num: '03',
    icon: '◉',
    title: 'View the Profile',
    body: 'Each profile page includes a gallery, a personal description written by the provider, rates, availability calendar, and verified reviews from previous clients. What you see is what you get.',
  },
  {
    num: '04',
    icon: '◫',
    title: 'Book or Message',
    body: 'Send a booking request with your preferred date, time, and duration — or open a private message thread to discuss details first. All communications are private and transmitted over encrypted connections.',
  },
  {
    num: '05',
    icon: '◆',
    title: 'Confirm & Pay',
    body: 'Once the provider accepts your request, complete your booking with a secure payment processed by Stripe. Your billing statement will show a discreet descriptor. A confirmation is sent to your registered email.',
  },
]

const creatorSteps = [
  {
    num: '01',
    icon: '◎',
    title: 'Create a Creator Account',
    body: 'Sign up free and select the Creator role. Set up your display name, a short bio, and a profile photo. Your personal details remain private — only what you choose to share is visible.',
  },
  {
    num: '02',
    icon: '◈',
    title: 'Publish Your Content',
    body: 'Open Creator Studio to post photos and videos with captions. Upload directly from your device — content is securely stored and displayed on your creator profile and in the discovery feed.',
  },
  {
    num: '03',
    icon: '◉',
    title: 'Link Your Other Platforms',
    body: 'Add links to your OnlyFans, Fansly, Instagram, or any external platform. Fans can discover you here and follow you across all your channels from one place.',
  },
  {
    num: '04',
    icon: '◫',
    title: 'Build Your Fanbase',
    body: 'Fans follow you with one tap and receive your latest posts in their feed. Use the live chat feature to engage directly, and grow a loyal audience that knows where to find you.',
  },
  {
    num: '05',
    icon: '◆',
    title: 'Receive Gifts & Tips',
    body: 'Fans can send token gifts (25 – 200 tokens) directly from any post as a show of appreciation. Received tokens land instantly in your wallet — redeem them for boosts or withdraw as platform credit.',
  },
]

const venueSteps = [
  {
    num: '01',
    icon: '◎',
    title: 'Create a Host Account',
    body: 'Sign up free and select the Provider role. Whether you manage a private apartment, a BDSM studio, an adult hotel, or a vacation rental — choose the category that fits your property.',
  },
  {
    num: '02',
    icon: '◈',
    title: 'List Your Property',
    body: 'Create a listing with photos, a description, pricing (hourly or nightly), and location details. Highlight amenities, house rules, and discretion measures. You control exactly what is displayed.',
  },
  {
    num: '03',
    icon: '◉',
    title: 'Get Verified',
    body: 'Complete identity and property verification to earn the verified badge. Verified listings rank higher in search and receive significantly more booking requests from trusted clients.',
  },
  {
    num: '04',
    icon: '◫',
    title: 'Accept Bookings',
    body: 'Clients send booking requests with their preferred dates and duration. You review and approve on your own schedule — no obligations, no minimums. Manage everything from your dashboard.',
  },
  {
    num: '05',
    icon: '◆',
    title: 'Get Paid',
    body: 'Payments for rentals, hotel stays, and experiences are processed securely via Stripe. Funds are released after the booking is confirmed. SecretXperience retains a 15% platform fee.',
  },
]

const providerSteps = [
  {
    num: '01',
    icon: '◎',
    title: 'Create an Account',
    body: 'Sign up with an email address. Choose a display name — your real name is never shown publicly. Set a strong password and enable two-factor authentication for added security.',
  },
  {
    num: '02',
    icon: '◈',
    title: 'Build Your Listing',
    body: 'Create a profile that represents you. Write a description in your own words, upload photos, set your rates, and define your availability. You are always in control of what is shown and what is hidden.',
  },
  {
    num: '03',
    icon: '◉',
    title: 'Get Verified',
    body: 'Complete our secure identity and age verification process. Verification is handled by a trusted third-party provider — your documents are never stored on our servers. Verified profiles receive a badge that significantly increases trust and bookings.',
  },
  {
    num: '04',
    icon: '◫',
    title: 'Receive Bookings',
    body: 'Accept or decline booking requests on your own schedule. You have full control — there are no obligations, no minimums, and no pressure. Manage everything from your private dashboard.',
  },
  {
    num: '05',
    icon: '◆',
    title: 'Get Paid',
    body: 'Funds are released to your linked account within 2–5 business days after a booking is marked complete. SecretXperience retains a 15% platform fee. Payouts are handled securely via Stripe Connect.',
  },
]

function StepCard({ step, index }: { step: typeof clientSteps[0], index: number }) {
  return (
    <div style={{
      display: 'flex', gap: 24, alignItems: 'flex-start',
      padding: '28px 0',
      borderBottom: '0.5px solid #c5a05a14',
    }}>
      {/* Number + icon column */}
      <div style={{ flexShrink: 0, width: 56, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: '#c5a05a18', lineHeight: 1, fontWeight: 400, userSelect: 'none' }}>
          {step.num}
        </div>
        <div style={{ fontSize: 20, color: '#c5a05a55', marginTop: 4 }}>{step.icon}</div>
      </div>
      {/* Text column */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: '#c5a05a', marginBottom: 10, letterSpacing: '0.01em' }}>
          {step.title}
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#888' }}>
          {step.body}
        </p>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
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
          Platform Guide
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#e8e0d0', lineHeight: 1.1, marginBottom: 16 }}>
          How It Works
        </h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          A simple, secure process — whether you are booking an experience or listing your services.
        </p>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 120px' }}>

        {/* For Clients */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: '#e8e0d0', letterSpacing: '0.02em' }}>
              For Clients
            </h2>
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5a05a', border: '0.5px solid #c5a05a44', padding: '3px 10px', borderRadius: 2 }}>
              Browse &amp; Book
            </span>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 8 }}>
            Finding the right experience on SecretXperience takes just minutes. Here is how.
          </p>
          {clientSteps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </section>

        {/* Divider */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <span style={{ fontSize: 22, color: '#c5a05a22', letterSpacing: '0.4em' }}>✦ ✦ ✦</span>
        </div>

        {/* For Providers */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: '#e8e0d0', letterSpacing: '0.02em' }}>
              For Providers
            </h2>
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5a05a', border: '0.5px solid #c5a05a44', padding: '3px 10px', borderRadius: 2 }}>
              List &amp; Earn
            </span>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 8 }}>
            List your services professionally, reach verified clients, and manage your schedule on your terms.
          </p>
          {providerSteps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </section>

        {/* Divider */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <span style={{ fontSize: 22, color: '#c5a05a22', letterSpacing: '0.4em' }}>✦ ✦ ✦</span>
        </div>

        {/* For Creators */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: '#e8e0d0', letterSpacing: '0.02em' }}>
              For Creators
            </h2>
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5a05a', border: '0.5px solid #c5a05a44', padding: '3px 10px', borderRadius: 2 }}>
              Publish &amp; Earn
            </span>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 8 }}>
            Share content, build a following, and earn tokens from fans — all in one place.
          </p>
          {creatorSteps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </section>

        {/* Divider */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <span style={{ fontSize: 22, color: '#c5a05a22', letterSpacing: '0.4em' }}>✦ ✦ ✦</span>
        </div>

        {/* For Venues & Hosts */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: '#e8e0d0', letterSpacing: '0.02em' }}>
              For Venues &amp; Hosts
            </h2>
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5a05a', border: '0.5px solid #c5a05a44', padding: '3px 10px', borderRadius: 2 }}>
              List &amp; Host
            </span>
          </div>
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, #c5a05a44 0%, transparent 70%)', marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 8 }}>
            Rentals, hotels, BDSM studios, private apartments — list your space and receive bookings from verified clients.
          </p>
          {venueSteps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </section>

        {/* CTA row */}
        <div style={{ marginTop: 80, paddingTop: 40, borderTop: '0.5px solid #c5a05a18', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.8 }}>
            Questions?{' '}
            <a href="/faq" style={{ color: '#c5a05a' }}>Browse the FAQ</a>
            {' '}or contact{' '}
            <a href="mailto:support@secretxperience.eu" style={{ color: '#c5a05a' }}>support@secretxperience.eu</a>
            <br />
            <a href="/trust-safety" style={{ color: '#c5a05a66', fontSize: 11, letterSpacing: '0.05em' }}>Trust &amp; Safety →</a>
          </div>
        </div>
      </main>
    </div>
  )
}
