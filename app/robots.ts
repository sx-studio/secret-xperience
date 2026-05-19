import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/messages', '/api/'] },
    sitemap: 'https://secret-xperience.vercel.app/sitemap.xml',
  }
}
