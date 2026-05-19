import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SecretXperience — Premium Adult Services Marketplace',
    template: '%s | SecretXperience',
  },
  description: 'Discover verified adult services, escorts, companionship, nightlife and more. Discreet, premium, and exclusive. Adults only (18+).',
  keywords: ['adult services', 'escorts Belgium', 'companionship', 'adult entertainment', 'nightlife Belgium'],
  metadataBase: new URL('https://secret-xperience.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://secret-xperience.vercel.app',
    siteName: 'SecretXperience',
    title: 'SecretXperience — Premium Adult Services Marketplace',
    description: 'Discover verified adult services, escorts, companionship, and premium experiences. Discreet and exclusive.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SecretXperience' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecretXperience',
    description: 'Premium adult services marketplace.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  themeColor: '#080808',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
