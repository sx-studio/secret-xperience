import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/messages', '/api/'] },
    sitemap: 'https://www.secretxperience.eu/sitemap.xml',
  }
}
