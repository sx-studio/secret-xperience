import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partners & Links — SecretXperience.eu',
  description: 'Curated adult industry partners, EU sex shops, lifestyle affiliates and services for the adult entertainment world.',
}

// ─── Data types ─────────────────────────────────────────────────────────────

interface BizLink {
  name: string
  tagline: string
  url: string           // real URL (replace with affiliate/tracking link when active)
  network?: string      // affiliate network, if applicable
  badge?: string
  emoji: string
}

interface Section {
  id: string
  title: string
  emoji: string
  description: string
  items: BizLink[]
}

// ─── Content ─────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  // ══════════════════════════════════════════════════════════════
  //  ADULT INDUSTRY — REAL BUSINESSES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'sexshops',
    title: 'Adult Shops & Toy Retailers',
    emoji: '🛍️',
    description: 'EU-based online adult retailers with wide product ranges, discrete shipping and active affiliate programmes.',
    items: [
      { name: 'EasyToys.eu', emoji: '🌹', tagline: 'Europe\'s fast-growing adult retailer — NL-based, ships EU-wide. Strong affiliate commissions via TradeTracker.', url: 'https://www.easytoys.eu', network: 'TradeTracker', badge: 'EU Favourite' },
      { name: 'Amorelie', emoji: '💜', tagline: 'Premium German adult boutique — elegant branding that resonates with our audience. Affiliate via Awin.', url: 'https://www.amorelie.de', network: 'Awin', badge: 'Trending' },
      { name: 'Orion.de', emoji: '⚡', tagline: 'Germany\'s largest adult retailer since 1969. Huge range, fast EU shipping. Solid Awin affiliate programme.', url: 'https://www.orion.de', network: 'Awin', badge: 'Top Earner' },
      { name: 'Eis.de', emoji: '❄️', tagline: 'German adult shop with 40,000+ products. High conversion rate. Affiliate via Awin with competitive commissions.', url: 'https://www.eis.de', network: 'Awin' },
      { name: 'Fun Factory', emoji: '🎨', tagline: 'Luxury German designer intimacy brand. Body-safe, sustainably produced. High AOV. Affiliate via Impact.', url: 'https://www.funfactory.com', network: 'Impact', badge: 'Luxury' },
      { name: 'Beate Uhse', emoji: '🖤', tagline: 'Europe\'s most iconic adult brand since 1946. Strong brand recognition. Physical stores + online EU-wide.', url: 'https://www.beate-uhse.ag', network: 'Awin' },
      { name: 'Beter in Bed', emoji: '💋', tagline: 'Dutch sex toy specialist — beterinbed.nl. Popular in BE/NL, strong local SEO and loyal customer base.', url: 'https://www.beterinbed.nl', network: 'TradeTracker' },
      { name: 'LoveHoney EU', emoji: '🌺', tagline: 'The UK\'s biggest adult retailer with full EU operations. Discrete packaging, huge range, top affiliate payouts.', url: 'https://www.lovehoney.co.uk', network: 'Awin', badge: 'Top Earner' },
    ],
  },

  {
    id: 'webcam',
    title: 'Webcam & Live Platforms',
    emoji: '🎥',
    description: 'Live streaming and content platforms with traffic-share and affiliate programmes. Among the highest-paying affiliate verticals online.',
    items: [
      { name: 'Chaturbate', emoji: '📡', tagline: 'The world\'s largest free webcam community. Their affiliate programme (20% recurring) is one of the best in adult.', url: 'https://chaturbate.com', network: 'Direct affiliate', badge: 'Top Earner' },
      { name: 'LiveJasmin', emoji: '💎', tagline: 'Premium HD webcam platform. High-paying clientele. Affiliate via AWEmpire — solid recurring commissions.', url: 'https://www.livejasmin.com', network: 'AWEmpire', badge: 'Luxury' },
      { name: 'BongaCams', emoji: '🔴', tagline: 'EU-headquartered live cam site. Strong European audience. Good referral programme for sending models or viewers.', url: 'https://bongacams.com', network: 'Direct affiliate', badge: 'EU Favourite' },
      { name: 'Stripchat', emoji: '🎬', tagline: 'Fast-growing cam platform with VR shows. Competitive model and viewer affiliate rates.', url: 'https://stripchat.com', network: 'Direct affiliate' },
      { name: 'ManyVids', emoji: '🎞️', tagline: 'Creator marketplace for adult video content. Traffic affiliate programme + model referrals available.', url: 'https://www.manyvids.com', network: 'Direct affiliate' },
    ],
  },

  {
    id: 'nightlife-venues',
    title: 'Nightlife & Gentleman\'s Clubs',
    emoji: '🥂',
    description: 'Premium nightlife venues across Belgium, Netherlands and Europe that welcome link exchanges and cross-promotion.',
    items: [
      { name: 'El Patio Spicy Gentleman\'s Club', emoji: '🌶️', tagline: 'Open daily 7/7 from 11:00 until the early hours. Belgium\'s well-known adult entertainment venue.', url: 'https://www.el-patio-club.be' },
      { name: 'Coco\'s Gentleman Club Antwerp', emoji: '🃏', tagline: 'Antwerp\'s adult entertainment club. Premium atmosphere, professional hostesses. Link exchange opportunity.', url: 'https://www.cocos.be' },
      { name: 'Désiré Lounge Brussels', emoji: '🌙', tagline: 'Private members club in Brussels. Discreet, premium experience. Cross-referral with escort listings.', url: 'https://www.desirelounge.be' },
      { name: 'Club NV Amsterdam', emoji: '💫', tagline: 'Amsterdam premium night venue. Well-established clientele overlap with escort/companion services.', url: 'https://www.clubnv.nl' },
      { name: 'Moulin Rouge Brussels', emoji: '🎭', tagline: 'Classic Brussels adult entertainment. Evening shows and private arrangements. Link exchange opportunity.', url: 'https://www.moulinrouge.be' },
    ],
  },

  {
    id: 'massage',
    title: 'Massage & Spa',
    emoji: '💆',
    description: 'Erotic and relaxation massage services across Belgium, Netherlands and Germany. Cross-referral opportunities.',
    items: [
      { name: 'Thai-Massages-Link.be', emoji: '🌿', tagline: 'Complete overview of Thai massage parlours in Belgium. High organic traffic, strong link exchange value.', url: 'https://thai-massages-link.be' },
      { name: 'EroMassage.nl', emoji: '🌸', tagline: 'Dutch erotic massage directory. Complementary audience to escorts and companions. Link exchange.', url: 'https://www.eromassage.nl' },
      { name: 'Tantramassage.be', emoji: '🕯️', tagline: 'Belgian tantra and sensual massage listings. Niche audience that overlaps significantly with our users.', url: 'https://www.tantramassage.be' },
    ],
  },

  {
    id: 'directories',
    title: 'Adult Directories & Sister Sites',
    emoji: '🔗',
    description: 'EU escort directories, adult portals and industry listing sites. Link exchange and cross-traffic opportunities.',
    items: [
      { name: 'The Best Fetish Sites', emoji: '📋', tagline: 'Curated list of the best escort and fetish sites. Strong SEO presence. Link exchange value for our domain.', url: 'https://www.thebestfetishsites.com' },
      { name: 'Erotiek4ever.nl', emoji: '🇳🇱', tagline: 'Dutch adult directory with strong NL organic traffic. Sister-site link exchange opportunity.', url: 'https://www.erotiek4ever.nl' },
      { name: 'Redlights.be', emoji: '🔴', tagline: 'Belgium\'s established adult listings platform. Cross-referral and link exchange with leading BE site.', url: 'https://www.redlights.be' },
      { name: 'Escort Amsterdam', emoji: '🌷', tagline: 'Leading Amsterdam escort directory. High NL traffic. Mutual link listing increases domain authority.', url: 'https://www.escortamsterdam1.com' },
      { name: 'Scarlet Blue', emoji: '💙', tagline: 'EU\'s premium independent escort platform. Non-competing audience for mutual promotion.', url: 'https://www.scarletblue.com.au' },
    ],
  },

  {
    id: 'industry-services',
    title: 'Industry Services & Tools',
    emoji: '🔧',
    description: 'Tech, billing, design and marketing services specifically for adult businesses. All EU-friendly.',
    items: [
      { name: 'Erotic & Escort Web Design — Van Der Linde Media', emoji: '🖥️', tagline: 'Specialist adult web design from the Netherlands. Quality sites at affordable rates. Regular advertiser in the EU adult space.', url: 'https://www.vanderlindemedia.nl' },
      { name: 'Segpay', emoji: '💳', tagline: 'Adult-friendly payment processing. Accepts major cards for adult businesses. Strong EU bank relationships.', url: 'https://segpay.com' },
      { name: 'Paxum', emoji: '🏦', tagline: 'The go-to e-wallet for adult industry professionals. Used by models, agencies and platforms globally.', url: 'https://www.paxum.com', badge: 'Industry Standard' },
      { name: 'NATS by Too Much Media', emoji: '📊', tagline: 'The industry-standard affiliate tracking and billing software. Powers most major adult affiliate programmes.', url: 'https://www.toomuchmedia.com' },
      { name: 'Adult Site Broker', emoji: '🤝', tagline: 'Buy and sell adult websites. Valuations, brokerage and M&A for adult digital businesses.', url: 'https://adultsitebroker.com' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  //  LIFESTYLE AFFILIATES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'lingerie',
    title: 'Lingerie & Fashion',
    emoji: '🖤',
    description: 'Premium and luxury lingerie brands with strong EU presence and active affiliate programmes.',
    items: [
      { name: 'Honey Birdette', emoji: '🖤', tagline: 'High-fashion luxury lingerie, PVC and fantasy pieces. Premium brand, high AOV. Affiliate via Commission Factory.', url: 'https://www.honeybirdette.com', network: 'Rakuten', badge: 'Premium' },
      { name: 'Agent Provocateur', emoji: '🌙', tagline: 'The world\'s most iconic luxury lingerie. Hand-crafted. Very high AOV commissions. Affiliate via Rakuten.', url: 'https://www.agentprovocateur.com', network: 'Rakuten', badge: 'Luxury' },
      { name: 'Ann Summers', emoji: '💋', tagline: 'UK\'s favourite adult fashion brand. Wide range, constant promotions, huge EU affiliate audience.', url: 'https://www.annsummers.com', network: 'Awin', badge: 'EU Favourite' },
      { name: 'Bluebella', emoji: '🌿', tagline: 'Modern sensual lingerie. Contemporary, inclusive, affordable-luxury. Strong EU shipping and affiliate.', url: 'https://www.bluebella.com', network: 'Awin' },
      { name: 'La Perla', emoji: '🤍', tagline: 'Ultra-premium Italian couture lingerie. Low volume, very high commission per sale.', url: 'https://www.laperla.com', network: 'Rakuten', badge: 'Luxury' },
    ],
  },

  {
    id: 'privacy',
    title: 'Privacy & Digital Security',
    emoji: '🛡️',
    description: 'VPN and privacy tools — essential for a privacy-conscious adult services audience. Top affiliate commissions online.',
    items: [
      { name: 'NordVPN', emoji: '🛡️', tagline: 'The world\'s most recognised VPN. Extremely relevant for our audience. Very high commissions via Impact.', url: 'https://nordvpn.com', network: 'Impact', badge: 'Top Earner' },
      { name: 'ExpressVPN', emoji: '🔐', tagline: 'Premium VPN, 105 countries. One of the highest-paying affiliate programmes online.', url: 'https://www.expressvpn.com', network: 'Impact' },
      { name: 'Proton', emoji: '🔒', tagline: 'Swiss encrypted email, VPN and cloud storage. Deeply trusted in Europe. Direct affiliate programme.', url: 'https://proton.me', network: 'Direct', badge: 'EU Trusted' },
      { name: 'Surfshark', emoji: '🌊', tagline: 'Budget VPN, unlimited devices. Very popular with younger EU users. Good commissions via Impact.', url: 'https://surfshark.com', network: 'Impact' },
    ],
  },

  {
    id: 'beauty',
    title: 'Beauty & Fragrance',
    emoji: '💄',
    description: 'Skincare, makeup and fragrance brands with strong EU affiliate programmes and high audience crossover.',
    items: [
      { name: 'Lookfantastic', emoji: '✨', tagline: 'Europe\'s largest online beauty retailer. Hundreds of brands, frequent deals. Strong Awin conversion.', url: 'https://www.lookfantastic.com', network: 'Awin', badge: 'EU Favourite' },
      { name: 'Charlotte Tilbury', emoji: '🪄', tagline: 'Cult Hollywood glamour makeup. Pillow Talk range is hugely popular with our audience.', url: 'https://www.charlottetilbury.com', network: 'Awin', badge: 'Trending' },
      { name: 'Fragrance Direct', emoji: '🌺', tagline: 'Authentic designer perfumes (Dior, Chanel, YSL) at a discount. Popular gifting affiliate.', url: 'https://www.fragrancedirect.co.uk', network: 'Awin' },
      { name: 'Sephora EU', emoji: '💄', tagline: 'Premium EU beauty destination. Luxury perfumes and skincare. Rakuten/direct affiliate.', url: 'https://www.sephora.com', network: 'Rakuten' },
    ],
  },

  {
    id: 'creator',
    title: 'Creator Tools',
    emoji: '🎬',
    description: 'Essential tech and software for adult content creators — webcams, lighting, editing and streaming tools.',
    items: [
      { name: 'Elgato', emoji: '🎬', tagline: 'Ring lights, key lights, green screens and capture cards. The creator standard. Amazon Associates affiliate.', url: 'https://www.elgato.com', network: 'Amazon Associates', badge: 'Creator Pick' },
      { name: 'Logitech', emoji: '📷', tagline: 'Industry-standard webcams (Brio 4K, C920). Essential for live cam and content creation.', url: 'https://www.logitech.com', network: 'Awin / Impact' },
      { name: 'Canva Pro', emoji: '🎨', tagline: 'Design promo graphics, banners and social content fast. €120/yr plan. High conversion affiliate.', url: 'https://www.canva.com', network: 'Impact' },
      { name: 'Streamyard', emoji: '🎙️', tagline: 'Browser-based multi-platform live streaming. Growing creator tool with recurring affiliate commissions.', url: 'https://streamyard.com', network: 'Direct' },
    ],
  },

  {
    id: 'travel',
    title: 'Travel & Accommodation',
    emoji: '🏨',
    description: 'Booking platforms highly relevant for escorts, companions and clients. High conversion, strong EU inventory.',
    items: [
      { name: 'Booking.com', emoji: '🏨', tagline: 'Europe\'s dominant accommodation platform. Huge EU hotel inventory. Direct affiliate programme, high volume.', url: 'https://www.booking.com', network: 'Booking Affiliate (direct)', badge: 'EU Favourite' },
      { name: 'Hotels.com', emoji: '🛎️', tagline: 'Loyalty rewards + city hotels. Good commissions per completed stay. Affiliate via CJ.', url: 'https://www.hotels.com', network: 'CJ Affiliate' },
      { name: 'GetYourGuide', emoji: '🗺️', tagline: 'Curated experiences in 150+ cities — excellent upsell for companion bookings including dinners or shows.', url: 'https://www.getyourguide.com', network: 'Awin' },
    ],
  },

  {
    id: 'finance',
    title: 'Payments & Finance',
    emoji: '💸',
    description: 'International money transfer and multi-currency tools. Highly relevant for providers working across EU borders.',
    items: [
      { name: 'Wise', emoji: '💸', tagline: 'Low-fee international transfers. Huge relevance for BE/NL/DE/FR/LU cross-border work. Strong Impact affiliate.', url: 'https://wise.com', network: 'Impact', badge: 'EU Trusted' },
      { name: 'Revolut', emoji: '💳', tagline: 'Multi-currency super-app. Instant payments, expense cards. Very popular in Belgium and Netherlands.', url: 'https://www.revolut.com', network: 'Revolut referral' },
      { name: 'Coinbase', emoji: '₿', tagline: 'Regulated EU crypto exchange. Privacy-conscious audience increasingly prefers crypto payments.', url: 'https://www.coinbase.com', network: 'Impact' },
      { name: 'Paysafecard', emoji: '🎫', tagline: 'Prepaid voucher payments. Anonymous, widely used in adult platforms. No affiliate but strong cross-referral.', url: 'https://www.paysafecard.com' },
    ],
  },

  {
    id: 'wellness',
    title: 'Health & Wellness',
    emoji: '🌿',
    description: 'Sexual health, supplements and wellness products. Practical essentials for providers and clients.',
    items: [
      { name: 'Durex', emoji: '❤️', tagline: 'World\'s leading sexual wellness brand. Subscription bundles drive repeat commissions. Discrete EU shipping.', url: 'https://www.durex.com', network: 'Direct (regional)' },
      { name: 'Superdrug Online Doctor', emoji: '💊', tagline: 'UK/EU sexual health — STI testing, contraception, PrEP. Essential for a safety-conscious audience.', url: 'https://www.superdrug.com', network: 'Awin' },
      { name: 'iHerb', emoji: '🌿', tagline: 'Natural supplements shipped EU-wide. Libido, energy and wellness categories perform very well here.', url: 'https://www.iherb.com', network: 'Impact' },
    ],
  },
]

// ─── Badge styles ────────────────────────────────────────────────────────────

const BADGE: Record<string, { bg: string; color: string; border: string }> = {
  'Top Earner':       { bg: 'rgba(197,160,90,0.15)', color: '#c5a05a', border: 'rgba(197,160,90,0.4)' },
  'EU Favourite':     { bg: 'rgba(62,207,142,0.12)', color: '#3ecf8e', border: 'rgba(62,207,142,0.35)' },
  'Luxury':           { bg: 'rgba(176,106,224,0.12)', color: '#c084f5', border: 'rgba(176,106,224,0.35)' },
  'Trending':         { bg: 'rgba(234,120,77,0.12)', color: '#ea784d', border: 'rgba(234,120,77,0.35)' },
  'EU Trusted':       { bg: 'rgba(90,176,197,0.12)', color: '#5ab0c5', border: 'rgba(90,176,197,0.35)' },
  'Creator Pick':     { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.35)' },
  'Premium':          { bg: 'rgba(232,201,126,0.12)', color: '#e8c97e', border: 'rgba(232,201,126,0.35)' },
  'Industry Standard':{ bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.15)' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnersPage() {
  const industryIds  = ['sexshops','webcam','nightlife-venues','massage','directories','industry-services']
  const lifestyleIds = ['lingerie','privacy','beauty','creator','travel','finance','wellness']

  return (
    <div style={{ minHeight: '100vh', background: '#080608', color: '#ece8e1' }}>
      <style>{`
        
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cat-pill { height: 32px; padding: 0 13px; border-radius: 20px; border: 0.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4); font: 500 11px 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all .15s; flex-shrink: 0; }
        .cat-pill:hover { border-color: rgba(197,160,90,0.4); background: rgba(197,160,90,0.07); color: #c5a05a; }
        .p-card { background: #0e0c12; border: 0.5px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.65rem; transition: border-color .2s, transform .15s; }
        .p-card:hover { border-color: rgba(197,160,90,0.18); transform: translateY(-2px); }
        .p-visit { display: inline-flex; align-items: center; gap: 4px; padding: 6px 13px; background: rgba(197,160,90,0.07); border: 0.5px solid rgba(197,160,90,0.25); border-radius: 7px; color: #c5a05a; font: 600 11px 'DM Sans', sans-serif; text-decoration: none; transition: background .15s; white-space: nowrap; }
        .p-visit:hover { background: rgba(197,160,90,0.14); border-color: rgba(197,160,90,0.45); }
        .p-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        .sec-label { font: 700 9px 'DM Sans',sans-serif; letter-spacing: .16em; text-transform: uppercase; color: rgba(197,160,90,0.55); margin: 2.5rem 0 0.75rem; display: flex; align-items: center; gap: 8px; }
        .sec-label::after { content:''; flex:1; height:.5px; background:rgba(255,255,255,0.05); }
        .group-head { padding: 2rem 0 1.5rem; border-top: 0.5px solid rgba(255,255,255,0.05); margin-top: 2rem; }
        @media(max-width:640px){ .p-grid{grid-template-columns:1fr} .p-main{padding:2rem 1rem 5rem!important} .p-nav{padding:0 1rem!important} }
      `}</style>

      {/* Nav */}
      <nav className="p-nav" style={{ position:'sticky', top:0, zIndex:100, height:54, padding:'0 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,6,8,0.97)', borderBottom:'0.5px solid rgba(197,160,90,0.08)', backdropFilter:'blur(18px)' }}>
        <Link href="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:'#c5a05a', textDecoration:'none', fontStyle:'italic' }}>
          Secret<em style={{ fontStyle:'normal' }}>Xperience</em>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Link href="/advertise" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Advertise</Link>
          <Link href="/" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>← Home</Link>
        </div>
      </nav>

      <main className="p-main" style={{ maxWidth:1200, margin:'0 auto', padding:'3rem 1.5rem 6rem' }}>

        {/* Hero */}
        <div style={{ marginBottom:'2.5rem' }}>
          <p style={{ fontSize:9, letterSpacing:'.18em', color:'rgba(197,160,90,0.55)', textTransform:'uppercase', marginBottom:'0.875rem' }}>✦ SecretXperience.eu</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(32px,5vw,54px)', fontWeight:400, lineHeight:1.1, marginBottom:'1rem' }}>
            Partners &amp; <em style={{ color:'#c5a05a', fontStyle:'italic' }}>Links</em>
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', maxWidth:580, lineHeight:1.75, marginBottom:'1.5rem' }}>
            Carefully selected businesses for the adult services world — EU adult shops, webcam platforms, nightlife venues, lifestyle affiliates and industry tools. Want a listing? <a href="mailto:heyokanaga@gmail.com?subject=Link+listing+—+SecretXperience" style={{ color:'#c5a05a', textDecoration:'none' }}>Contact us →</a>
          </p>

          {/* Affiliate notice */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:10, color:'rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.05)', borderRadius:20, padding:'4px 12px' }}>
            <i className="ti ti-info-circle" style={{ fontSize:11 }} />
            Some links are affiliate links — we may earn a commission at no cost to you
          </div>
        </div>

        {/* Quick jump pills */}
        <div style={{ display:'flex', gap:5, overflowX:'auto', scrollbarWidth:'none', paddingBottom:4, marginBottom:'3rem', flexWrap:'wrap' }}>
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="cat-pill">
              <span style={{ fontSize:13 }}>{s.emoji}</span> {s.title}
            </a>
          ))}
        </div>

        {/* ══ Group 1: Adult Industry ══ */}
        <div className="group-head" id="adult-industry">
          <p style={{ fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(197,160,90,0.5)', marginBottom:8 }}>✦ Adult Industry</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,3vw,30px)', fontWeight:400 }}>
            EU Adult Businesses
          </h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6, maxWidth:520, lineHeight:1.7 }}>
            Sex shops, webcam platforms, nightlife venues, massage directories and industry services — real businesses serving the same audience as SecretXperience.eu.
          </p>
        </div>

        {SECTIONS.filter(s => industryIds.includes(s.id)).map(section => (
          <section key={section.id} id={section.id}>
            <div className="sec-label">
              <span style={{ fontSize:14 }}>{section.emoji}</span>
              {section.title}
              <span style={{ color:'rgba(255,255,255,0.12)', fontWeight:400 }}>— {section.items.length}</span>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginBottom:'0.875rem', lineHeight:1.65 }}>{section.description}</p>
            <div className="p-grid">
              {section.items.map(p => {
                const bs = p.badge ? BADGE[p.badge] : null
                return (
                  <div key={p.name} className="p-card">
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                        {p.emoji}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
                          <span style={{ fontSize:13, fontWeight:600, color:'#ece8e1' }}>{p.name}</span>
                          {bs && (
                            <span style={{ fontSize:8, fontWeight:700, letterSpacing:'.08em', padding:'2px 6px', borderRadius:20, background:bs.bg, color:bs.color, border:`0.5px solid ${bs.border}` }}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.65, flex:1 }}>{p.tagline}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="p-visit">
                        {new URL(p.url).hostname.replace('www.','')} <i className="ti ti-external-link" style={{ fontSize:10 }} />
                      </a>
                      {p.network && (
                        <span style={{ fontSize:9, color:'rgba(255,255,255,0.18)', fontFamily:"'DM Sans',sans-serif" }}>
                          via {p.network}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* ══ Group 2: Lifestyle Affiliates ══ */}
        <div className="group-head" id="lifestyle">
          <p style={{ fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(197,160,90,0.5)', marginBottom:8 }}>✦ Lifestyle</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,3vw,30px)', fontWeight:400 }}>
            Lifestyle &amp; Affiliate Partners
          </h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6, maxWidth:520, lineHeight:1.7 }}>
            Lingerie, beauty, privacy tools, creator gear, travel and finance — brands that serve our audience's lifestyle with competitive affiliate commissions.
          </p>
        </div>

        {SECTIONS.filter(s => lifestyleIds.includes(s.id)).map(section => (
          <section key={section.id} id={section.id}>
            <div className="sec-label">
              <span style={{ fontSize:14 }}>{section.emoji}</span>
              {section.title}
              <span style={{ color:'rgba(255,255,255,0.12)', fontWeight:400 }}>— {section.items.length}</span>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginBottom:'0.875rem', lineHeight:1.65 }}>{section.description}</p>
            <div className="p-grid">
              {section.items.map(p => {
                const bs = p.badge ? BADGE[p.badge] : null
                return (
                  <div key={p.name} className="p-card">
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                        {p.emoji}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
                          <span style={{ fontSize:13, fontWeight:600, color:'#ece8e1' }}>{p.name}</span>
                          {bs && (
                            <span style={{ fontSize:8, fontWeight:700, letterSpacing:'.08em', padding:'2px 6px', borderRadius:20, background:bs.bg, color:bs.color, border:`0.5px solid ${bs.border}` }}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.65, flex:1 }}>{p.tagline}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="p-visit">
                        {new URL(p.url).hostname.replace('www.','')} <i className="ti ti-external-link" style={{ fontSize:10 }} />
                      </a>
                      {p.network && (
                        <span style={{ fontSize:9, color:'rgba(255,255,255,0.18)', fontFamily:"'DM Sans',sans-serif" }}>
                          via {p.network}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* ══ List your business CTA ══ */}
        <div style={{ marginTop:'5rem', padding:'2.5rem 2rem', background:'linear-gradient(135deg,#0e0c12,#120e08)', border:'0.5px solid rgba(197,160,90,0.12)', borderRadius:18, display:'flex', flexWrap:'wrap', gap:'2rem', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(197,160,90,0.5)', marginBottom:8 }}>✦ Get listed</p>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,3vw,30px)', fontWeight:400, marginBottom:8 }}>
              Want your business here?
            </h3>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', maxWidth:420, lineHeight:1.75 }}>
              We accept link exchanges, paid listings and affiliate-based partnerships for businesses that serve the adult services lifestyle. EU businesses prioritised. Includes placement in our newsletter and footer.
            </p>
          </div>
          <a
            href="mailto:heyokanaga@gmail.com?subject=Partner+listing+enquiry+—+SecretXperience.eu"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 26px', background:'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius:10, color:'#080808', fontSize:13, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}
          >
            <i className="ti ti-mail" /> Contact us →
          </a>
        </div>

        {/* Disclosure */}
        <p style={{ marginTop:'3rem', fontSize:10, color:'rgba(255,255,255,0.13)', textAlign:'center', lineHeight:1.8, maxWidth:640, margin:'3rem auto 0' }}>
          <strong style={{ color:'rgba(255,255,255,0.22)' }}>Disclosure:</strong> SecretXperience.eu participates in affiliate programmes. When you click a partner link and make a purchase, we may earn a commission at no additional cost to you. Links showing a network name are affiliate links — replace the URL with your tracking link from that network once approved. Non-affiliate links are link exchanges or paid directory listings.
        </p>
      </main>
    </div>
  )
}
