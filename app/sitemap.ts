import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://upgrade-main.vercel.app'

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/services',
    '/all-services',
    '/service-areas',
    '/special-offer',
    '/gallery',
    '/blog',
    '/reviews',
    '/contact',
    '/sitemap-page',
    '/privacy',
    '/terms',
  ]

  // Service pages
  const servicePages = [
    '/services/tile-slate-roofing',
    '/services/flat-roofing',
    '/services/chimney-repairs',
    '/services/gutters-fascias',
    '/services/skylights-roof-windows',
    '/services/cladding',
  ]

  // Blog pages
  const blogPages = [
    '/blog/roof-damage-signs',
    '/blog/flat-vs-tile-roofs',
  ]

  return [
    ...staticPages.map((page) => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.9,
    })),
    ...servicePages.map((page) => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...blogPages.map((page) => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
