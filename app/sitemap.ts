import { MetadataRoute } from 'next';
import { allIndexableRoutes, BASE_URL } from '@/lib/routes';

/**
 * Route-aware sitemap generated from lib/routes.ts.
 * To add or remove a page, update the route inventory in lib/routes.ts.
 * lastModified values are stable dates, NOT new Date().
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return allIndexableRoutes.map((route) => ({
    url: `${BASE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
