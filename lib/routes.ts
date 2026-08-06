/**
 * ---------------------------------------------------------------
 * ROUTE INVENTORY — Single source of truth for indexable pages.
 * Used by: sitemap.ts, keyword-map.ts, internal-link helpers.
 *
 * HOW TO ADD A PAGE:
 *   1. Add the route object to the correct category array.
 *   2. Set a stable `lastModified` date (YYYY-MM-DD).
 *      - Use the date the page content was last meaningfully changed.
 *      - Do NOT use `new Date()` — that defeats sitemap caching.
 *   3. Choose the correct `changeFreq` and `priority`.
 *
 * HOW TO EXCLUDE A PAGE:
 *   Pages NOT listed here will NOT appear in the sitemap.
 *   Excluded by design:
 *     /thank-you          — post-conversion, no ranking value
 *     /all-services       — duplicate of /services, kept as redirect
 *     /offer-cheshire     — geo-variant landing pages (ads only, noindex)
 *     /offer-congleton    — same
 *     /offer-crewe        — same
 *     /offer-holmes-chapel — same
 *     /offer-middlewich    — same
 *     /offer-nantwich     — same
 *     /offer-alsager       — same
 *     /special-offer      — ads conversion page (noindex)
 *     /offer-sandbach     — ads conversion page (noindex)
 *     /sitemap-page       — HTML sitemap for humans, not for crawlers
 * ---------------------------------------------------------------
 */

export type PageType =
  | 'homepage'
  | 'core-commercial'
  | 'service-subpage'
  | 'local-commercial'
  | 'trust'
  | 'conversion'
  | 'informational'
  | 'utility';

export interface RouteEntry {
  path: string;
  pageType: PageType;
  /** Stable date string YYYY-MM-DD — last meaningful content update */
  lastModified: string;
  changeFreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  /** Human label used in keyword map & internal links */
  label: string;
}

// ---------- HOMEPAGE ----------
const homepage: RouteEntry[] = [
  {
    path: '/',
    pageType: 'homepage',
    lastModified: '2025-03-19',
    changeFreq: 'weekly',
    priority: 1.0,
    label: 'Home',
  },
];

// ---------- CORE COMMERCIAL (money pages) ----------
const coreCommercial: RouteEntry[] = [
  {
    path: '/roof-repairs',
    pageType: 'core-commercial',
    lastModified: '2025-03-31',
    changeFreq: 'monthly',
    priority: 0.9,
    label: 'Roof Repairs',
  },
  {
    path: '/new-roofs',
    pageType: 'core-commercial',
    lastModified: '2025-03-31',
    changeFreq: 'monthly',
    priority: 0.9,
    label: 'New Roofs',
  },
  {
    path: '/emergency-roofing',
    pageType: 'core-commercial',
    lastModified: '2025-03-31',
    changeFreq: 'monthly',
    priority: 0.9,
    label: 'Emergency Roofing',
  },
  // /flat-roofing is a redirect to /services/flat-roofing — not listed here
];

// ---------- SERVICE SUBPAGES ----------
const serviceSubpages: RouteEntry[] = [
  {
    path: '/services',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'All Services',
  },
  {
    path: '/services/tile-slate-roofing',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'Tile & Slate Roofing',
  },
  {
    path: '/services/flat-roofing',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'Flat Roofing Services',
  },
  {
    path: '/services/chimney-repairs',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'Chimney Repairs',
  },
  {
    path: '/services/gutters-fascias',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'Gutters & Fascias',
  },
  {
    path: '/services/skylights-roof-windows',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'Skylights & Roof Windows',
  },
  {
    path: '/services/cladding',
    pageType: 'service-subpage',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.8,
    label: 'Cladding',
  },
];

// ---------- LOCAL / TOWN PAGES ----------
const localCommercial: RouteEntry[] = [
  {
    path: '/roofers-sandbach',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.95,
    label: 'Roofers Sandbach',
  },
  {
    path: '/roofers-crewe',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Crewe',
  },
  {
    path: '/roofers-middlewich',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Middlewich',
  },
  {
    path: '/roofers-congleton',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Congleton',
  },
  {
    path: '/roofers-nantwich',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Nantwich',
  },
  {
    path: '/roofers-alsager',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Alsager',
  },
  {
    path: '/roofers-holmes-chapel',
    pageType: 'local-commercial',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Holmes Chapel',
  },
  {
    path: '/roofers-winsford',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Winsford',
  },
  {
    path: '/roofers-northwich',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Northwich',
  },
  {
    path: '/roofers-macclesfield',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Macclesfield',
  },
  {
    path: '/roofers-knutsford',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Knutsford',
  },
  {
    path: '/roofers-tarporley',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Tarporley',
  },
  {
    path: '/roofers-biddulph',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Biddulph',
  },
  {
    path: '/roofers-newcastle-under-lyme',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Newcastle-under-Lyme',
  },
  {
    path: '/roofers-wilmslow',
    pageType: 'local-commercial',
    lastModified: '2026-06-11',
    changeFreq: 'monthly',
    priority: 0.85,
    label: 'Roofers Wilmslow',
  },
  {
    path: '/service-areas',
    pageType: 'local-commercial',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.7,
    label: 'Service Areas',
  },
];

// ---------- TRUST / AUTHORITY PAGES ----------
const trustPages: RouteEntry[] = [
  {
    path: '/about',
    pageType: 'trust',
    lastModified: '2025-03-19',
    changeFreq: 'monthly',
    priority: 0.7,
    label: 'About Us',
  },
  {
    path: '/reviews',
    pageType: 'trust',
    lastModified: '2025-03-01',
    changeFreq: 'monthly',
    priority: 0.7,
    label: 'Reviews',
  },
  {
    path: '/gallery',
    pageType: 'trust',
    lastModified: '2025-03-01',
    changeFreq: 'monthly',
    priority: 0.6,
    label: 'Gallery',
  },
  {
    path: '/case-studies',
    pageType: 'trust',
    lastModified: '2025-03-01',
    changeFreq: 'monthly',
    priority: 0.6,
    label: 'Case Studies',
  },
  {
    path: '/contact',
    pageType: 'trust',
    lastModified: '2025-02-15',
    changeFreq: 'monthly',
    priority: 0.7,
    label: 'Contact',
  },
];

// ---------- CONVERSION PAGES (noindex, ads-only — NOT in sitemap) ----------
// /special-offer, /offer-sandbach, /offer-cheshire, /offer-crewe, etc.
// These are kept as functional pages but excluded from the indexable route list.

// ---------- BLOG ----------
export interface BlogRouteEntry extends RouteEntry {
  publishedDate: string;
  category: string;
  readTime: string;
  excerpt: string;
}

const blogIndex: RouteEntry[] = [
  {
    path: '/blog',
    pageType: 'informational',
    lastModified: '2025-03-15',
    changeFreq: 'weekly',
    priority: 0.6,
    label: 'Roofing Blog',
  },
];

export const blogPosts: BlogRouteEntry[] = [
  {
    path: '/blog/emergency-roof-repairs',
    pageType: 'informational',
    lastModified: '2026-03-15',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Emergency Roof Repairs Guide',
    publishedDate: '2026-03-15',
    category: 'Emergency',
    readTime: '4 min',
    excerpt: 'Storm damage, sudden leaks, or fallen debris? Learn how to handle roofing emergencies and when to call professional help.',
  },
  {
    path: '/blog/roof-maintenance-checklist',
    pageType: 'informational',
    lastModified: '2026-03-10',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Roof Maintenance Checklist',
    publishedDate: '2026-03-10',
    category: 'Maintenance',
    readTime: '6 min',
    excerpt: 'Keep your roof in top condition year-round with our comprehensive seasonal maintenance guide.',
  },
  {
    path: '/blog/how-long-does-roof-last',
    pageType: 'informational',
    lastModified: '2026-03-08',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'How Long Does a Roof Last?',
    publishedDate: '2026-03-08',
    category: 'Guide',
    readTime: '7 min',
    excerpt: 'Understanding roof lifespans helps you plan for replacement. Learn how long different roofing materials last.',
  },
  {
    path: '/blog/gutter-maintenance-guide',
    pageType: 'informational',
    lastModified: '2026-03-05',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Gutter Maintenance Guide',
    publishedDate: '2026-03-05',
    category: 'Maintenance',
    readTime: '5 min',
    excerpt: 'Properly maintained gutters protect your home from water damage. Learn how to keep them flowing freely.',
  },
  {
    path: '/blog/chimney-repair-guide',
    pageType: 'informational',
    lastModified: '2026-03-01',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Chimney Repair Guide',
    publishedDate: '2026-03-01',
    category: 'Repairs',
    readTime: '6 min',
    excerpt: 'From repointing to full rebuilds, learn everything about chimney maintenance and repairs.',
  },
  {
    path: '/blog/choosing-roofing-contractor',
    pageType: 'informational',
    lastModified: '2026-02-25',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Choosing a Roofing Contractor',
    publishedDate: '2026-02-25',
    category: 'Advice',
    readTime: '8 min',
    excerpt: 'Avoid cowboy builders and rogue traders. Learn what to look for when hiring a roofing contractor.',
  },
  {
    path: '/blog/skylight-installation-guide',
    pageType: 'informational',
    lastModified: '2026-02-20',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Skylight Installation Guide',
    publishedDate: '2026-02-20',
    category: 'Installation',
    readTime: '7 min',
    excerpt: 'Everything you need to know about adding skylights to your Cheshire home.',
  },
  {
    path: '/blog/flat-roof-problems',
    pageType: 'informational',
    lastModified: '2026-02-15',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Common Flat Roof Problems',
    publishedDate: '2026-02-15',
    category: 'Repairs',
    readTime: '6 min',
    excerpt: 'Flat roofs need special attention. Learn about common issues and when repairs vs replacement makes sense.',
  },
  {
    path: '/blog/roof-damage-signs',
    pageType: 'informational',
    lastModified: '2024-11-04',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Signs of Roof Damage',
    publishedDate: '2024-11-04',
    category: 'Maintenance',
    readTime: '5 min',
    excerpt: 'Early detection of roof problems can save thousands. Learn the warning signs from our professionals.',
  },
  {
    path: '/blog/flat-vs-tile-roofs',
    pageType: 'informational',
    lastModified: '2024-10-28',
    changeFreq: 'yearly',
    priority: 0.5,
    label: 'Flat vs Tile Roofs',
    publishedDate: '2024-10-28',
    category: 'Guide',
    readTime: '6 min',
    excerpt: 'Compare roofing materials and their longevity in British weather conditions.',
  },
];

// ---------- UTILITY (low priority, still indexable) ----------
const utilityPages: RouteEntry[] = [
  {
    path: '/privacy',
    pageType: 'utility',
    lastModified: '2024-10-01',
    changeFreq: 'yearly',
    priority: 0.3,
    label: 'Privacy Policy',
  },
  {
    path: '/terms',
    pageType: 'utility',
    lastModified: '2024-10-01',
    changeFreq: 'yearly',
    priority: 0.3,
    label: 'Terms & Conditions',
  },
];

// ---------- SERVICE × LOCATION PAGES (15 towns × 6 services = 90 pages) ----------
const SERVICE_SLUGS = [
  'flat-roofing',
  'tile-slate-roofing',
  'chimney-repairs',
  'gutters-fascias',
  'skylights-roof-windows',
  'cladding',
] as const;

const TOWN_SLUGS = [
  'roofers-sandbach',
  'roofers-crewe',
  'roofers-middlewich',
  'roofers-congleton',
  'roofers-nantwich',
  'roofers-alsager',
  'roofers-holmes-chapel',
  'roofers-winsford',
  'roofers-northwich',
  'roofers-macclesfield',
  'roofers-knutsford',
  'roofers-tarporley',
  'roofers-biddulph',
  'roofers-newcastle-under-lyme',
  'roofers-wilmslow',
] as const;

const SERVICE_LABELS: Record<string, string> = {
  'flat-roofing': 'Flat Roofing',
  'tile-slate-roofing': 'Tile & Slate Roofing',
  'chimney-repairs': 'Chimney Repairs',
  'gutters-fascias': 'Gutters & Fascias',
  'skylights-roof-windows': 'Skylights & Roof Windows',
  'cladding': 'Cladding',
};

const TOWN_LABELS: Record<string, string> = {
  'roofers-sandbach': 'Sandbach',
  'roofers-crewe': 'Crewe',
  'roofers-middlewich': 'Middlewich',
  'roofers-congleton': 'Congleton',
  'roofers-nantwich': 'Nantwich',
  'roofers-alsager': 'Alsager',
  'roofers-holmes-chapel': 'Holmes Chapel',
  'roofers-winsford': 'Winsford',
  'roofers-northwich': 'Northwich',
  'roofers-macclesfield': 'Macclesfield',
  'roofers-knutsford': 'Knutsford',
  'roofers-tarporley': 'Tarporley',
  'roofers-biddulph': 'Biddulph',
  'roofers-newcastle-under-lyme': 'Newcastle-under-Lyme',
  'roofers-wilmslow': 'Wilmslow',
};

const serviceLocationPages: RouteEntry[] = TOWN_SLUGS.flatMap((townSlug) =>
  SERVICE_SLUGS.map((serviceSlug) => ({
    path: `/${townSlug}/${serviceSlug}`,
    pageType: 'local-commercial' as PageType,
    lastModified: '2026-06-11',
    changeFreq: 'monthly' as const,
    priority: 0.75,
    label: `${SERVICE_LABELS[serviceSlug]} in ${TOWN_LABELS[townSlug]}`,
  }))
);

// ---------- PUBLIC API ----------

/** All routes that should appear in the sitemap */
export const allIndexableRoutes: RouteEntry[] = [
  ...homepage,
  ...coreCommercial,
  ...serviceSubpages,
  ...localCommercial,
  ...serviceLocationPages,
  ...trustPages,
  ...blogIndex,
  ...blogPosts,
  ...utilityPages,
];

/** Convenience getters */
export const getRoutesByType = (type: PageType): RouteEntry[] =>
  allIndexableRoutes.filter((r) => r.pageType === type);

export const BASE_URL = 'https://www.upgraderoofs.co.uk';
