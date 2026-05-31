import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Escort Girls Belgium — Verified, Real Photos & Prices | SecretXperience',
  description: 'Browse verified escort girls in Belgium — Brussels, Antwerp, Ghent, Liège & Bruges. ✓ Real photos ✓ Reviews ✓ Prices. Independent escorts, VIP companions & private reception.',
  keywords: ['escort girls Belgium', 'escort Belgium', 'escort Brussels', 'escort Antwerp', 'escort Ghent', 'escort Liège', 'escort Bruges', 'escorts belgique', 'escort meisjes belgie', 'independent escorts Belgium', 'VIP companions Brussels'],
  openGraph: {
    title: 'Escort Girls Belgium — Verified, Real Photos & Prices | SecretXperience',
    description: 'Browse verified escort girls in Belgium — Brussels, Antwerp, Ghent, Liège & Bruges. Real photos, reviews & prices.',
    type: 'website',
    url: 'https://www.secretxperience.eu/escorts',
  },
  alternates: {
    canonical: 'https://www.secretxperience.eu/escorts',
  },
}

export default function EscortsLayout({ children }: { children: React.ReactNode }) {
  return children
}
