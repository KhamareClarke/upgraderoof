/**
 * lib/ghl/blogs.js
 *
 * Blog source for upgraderoofs.co.uk. Tries to fetch published posts from
 * GHL's blog/CMS surface first; if the token lacks that scope (common for
 * Private Integration tokens) or the endpoint isn't available, falls back
 * to the site's static post list so the frontend never breaks.
 *
 * Returns a normalized post shape:
 *   { slug, title, excerpt, category, image, date, readTime, source }
 */

const client = require('../ghl-client');

// Static fallback — mirrors app/blog/page.tsx. Kept in sync; GHL posts
// (when available) are merged ahead of these.
const STATIC_POSTS = [
  { slug: 'emergency-roof-repairs', title: 'Emergency Roof Repairs in Cheshire: What to Do When Disaster Strikes', excerpt: 'Storm damage, sudden leaks, or fallen debris? Learn how to handle roofing emergencies and when to call professional help.', category: 'Emergency', image: '/images/1.jpeg', date: 'March 15, 2026', readTime: '4 min' },
  { slug: 'roof-maintenance-checklist', title: 'Complete Roof Maintenance Checklist for Cheshire Homeowners', excerpt: 'Keep your roof in top condition year-round with our comprehensive seasonal maintenance guide.', category: 'Maintenance', image: '/images/6.jpeg', date: 'March 10, 2026', readTime: '6 min' },
  { slug: 'how-long-does-roof-last', title: 'How Long Does a Roof Last? Complete UK Guide', excerpt: 'Understanding roof lifespans helps you plan for replacement. Learn how long different roofing materials last.', category: 'Guide', image: '/images/7.jpeg', date: 'March 8, 2026', readTime: '7 min' },
  { slug: 'gutter-maintenance-guide', title: 'Complete Guide to Gutter Maintenance in Cheshire', excerpt: 'Properly maintained gutters protect your home from water damage. Learn how to keep them flowing freely.', category: 'Maintenance', image: '/images/2.jpeg', date: 'March 5, 2026', readTime: '5 min' },
  { slug: 'chimney-repair-guide', title: "Chimney Repairs in Cheshire: Complete Homeowner's Guide", excerpt: 'From repointing to full rebuilds, learn everything about chimney maintenance and repairs.', category: 'Repairs', image: '/images/1.jpeg', date: 'March 1, 2026', readTime: '6 min' },
  { slug: 'choosing-roofing-contractor', title: 'How to Choose a Reliable Roofing Contractor in Cheshire', excerpt: 'Avoid cowboy builders and rogue traders. Learn what to look for when hiring a roofing contractor.', category: 'Advice', image: '/images/6.jpeg', date: 'February 25, 2026', readTime: '8 min' },
  { slug: 'skylight-installation-guide', title: 'Skylight Installation Guide: Transform Your Home with Natural Light', excerpt: 'Everything you need to know about adding skylights to your Cheshire home.', category: 'Installation', image: '/images/10.jpeg', date: 'February 20, 2026', readTime: '7 min' },
  { slug: 'flat-roof-problems', title: 'Common Flat Roof Problems and How to Fix Them', excerpt: 'Flat roofs need special attention. Learn about common issues and when repairs vs replacement makes sense.', category: 'Repairs', image: '/images/3.jpeg', date: 'February 15, 2026', readTime: '6 min' },
  { slug: 'roof-damage-signs', title: 'How to Spot Roof Damage Before It Gets Expensive', excerpt: 'Early detection of roof problems can save thousands. Learn the warning signs from our professionals.', category: 'Maintenance', image: '/images/6.jpeg', date: 'November 4, 2024', readTime: '5 min' },
  { slug: 'flat-vs-tile-roofs', title: 'Flat vs. Tile Roofs – Which Lasts Longer in the UK?', excerpt: 'Compare roofing materials and their longevity in British weather conditions.', category: 'Guide', image: '/images/3.jpeg', date: 'October 28, 2024', readTime: '6 min' },
];

function estimateReadTime(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)) + ' min';
}

/** Normalize a GHL blog post into our shape. */
function normalizeGhlPost(p) {
  const content = p.content || p.body || p.description || '';
  return {
    slug: p.slug || p.urlSlug || (p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title: p.title || 'Untitled',
    excerpt: p.excerpt || p.metaDescription || String(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
    category: (p.categories && p.categories[0] && (p.categories[0].name || p.categories[0])) || p.category || 'Blog',
    image: p.featuredImage || p.image || p.thumbnail || '/images/6.jpeg',
    date: p.publishedAt || p.createdAt || p.updatedAt || new Date().toISOString(),
    readTime: estimateReadTime(content),
    source: 'ghl',
  };
}

/**
 * Fetch published posts. Tries GHL first, falls back to static.
 * @param {object} [opts]
 * @param {number} [opts.limit]  max posts to return
 * @param {boolean}[opts.preferGhl]  if false, skip GHL and return static (default true)
 * @returns {Promise<{posts:Array, source:'ghl'|'static'|'mixed', ghlAvailable:boolean}>}
 */
async function getPosts(opts = {}) {
  const limit = opts.limit || 50;
  const preferGhl = opts.preferGhl !== false;

  if (preferGhl && client.isConfigured()) {
    const locationId = client.locationId();
    // GHL blog/posts endpoint (Blogs scope). Not available on all tokens.
    const res = await client.get(`/blogs/posts?locationId=${encodeURIComponent(locationId)}&limit=${limit}&status=published`);
    if (res.ok && res.data) {
      const raw = res.data.posts || res.data.blogs || res.data.data || [];
      if (Array.isArray(raw) && raw.length) {
        const ghlPosts = raw.map(normalizeGhlPost).filter(p => p.slug);
        // Merge: GHL posts first, then any static posts not shadowed by a GHL slug.
        const ghlSlugs = new Set(ghlPosts.map(p => p.slug));
        const merged = [...ghlPosts, ...STATIC_POSTS.filter(s => !ghlSlugs.has(s.slug)).map(s => ({ ...s, source: 'static' }))];
        return { posts: merged.slice(0, limit), source: 'mixed', ghlAvailable: true };
      }
      // GHL reachable but no posts — fall through to static.
      return { posts: STATIC_POSTS.slice(0, limit).map(s => ({ ...s, source: 'static' })), source: 'static', ghlAvailable: true };
    }
    // GHL endpoint unavailable / scope missing — fall back.
    return { posts: STATIC_POSTS.slice(0, limit).map(s => ({ ...s, source: 'static' })), source: 'static', ghlAvailable: false };
  }

  return { posts: STATIC_POSTS.slice(0, limit).map(s => ({ ...s, source: 'static' })), source: 'static', ghlAvailable: false };
}

/** Fetch a single post by slug (GHL first, then static). */
async function getPostBySlug(slug) {
  const { posts } = await getPosts({ limit: 100 });
  return posts.find(p => p.slug === slug) || null;
}

module.exports = { getPosts, getPostBySlug, STATIC_POSTS };
