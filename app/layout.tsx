import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.secretxperience.eu'),
  title: 'SecretXperience.eu — Premium Adult Services Platform',
  description: 'Discreet, verified, premium adult experiences across Europe. Browse escorts, companions, nightlife, creators, rentals, and more.',
  manifest: '/manifest.json',
  themeColor: '#080612',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SecretXperience' },
  openGraph: {
    type: 'website',
    locale: 'en_EU',
    url: 'https://www.secretxperience.eu',
    siteName: 'SecretXperience.eu',
    title: 'SecretXperience.eu — Premium Adult Services Platform',
    description: 'Discreet, verified, premium adult experiences across Europe.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SecretXperience.eu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecretXperience.eu — Premium Adult Services Platform',
    description: 'Discreet, verified, premium adult experiences across Europe.',
    images: ['/og-image.jpg'],
  },
  icons: {
    apple: '/icon-192.png',
    icon: '/favicon.ico',
  },
}

// Theme bootstrap — runs before paint to avoid a flash of the wrong theme.
// Default is "velvet". A stored localStorage.theme overrides.
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.theme;
    var t = (stored === 'dark' || stored === 'light' || stored === 'velvet') ? stored : 'velvet';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'velvet';
  }
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="velvet">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
