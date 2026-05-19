import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'SecretXperience — Premium Adult Services & Experiences', template: '%s | SecretXperience' },
  description: 'Discover and book exclusive adult services, escorts, massage, companionship and experiences across Europe. Verified providers, discreet & secure.',
  keywords: ['adult services', 'escort', 'massage', 'companionship', 'experiences', 'Belgium', 'Europe', 'discreet'],
  openGraph: {
    type: 'website',
    siteName: 'SecretXperience',
    title: 'SecretXperience — Premium Adult Services',
    description: 'Discover and book exclusive adult services and experiences across Europe.',
    url: 'https://secret-xperience.vercel.app',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
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
