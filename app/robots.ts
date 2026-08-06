import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/thank-you'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
      {
        userAgent: 'OAI-SearchBot-Extended',
        allow: '/',
        disallow: ['/api/', '/admin/', '/thank-you'],
      },
    ],
    sitemap: 'https://www.upgraderoofs.co.uk/sitemap.xml',
    host: 'https://www.upgraderoofs.co.uk',
  }
}
