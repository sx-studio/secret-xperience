import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/messages', '/provider', '/api/'] },
    sitemap: 'https://www.secretxperience.eu/sitemap.xml',
  }
}
