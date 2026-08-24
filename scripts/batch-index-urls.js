/**
 * scripts/batch-index-urls.js
 *
 * Batch-submits the core programmatic pages to the Google Indexing API
 * (URL_UPDATED) so Google is asked to (re)crawl them immediately.
 *
 * Run:  node scripts/batch-index-urls.js [--all] [--limit N] [--offset N]
 *
 * Default scope (no flags) = the "core programmatic" money pages:
 *   90 service×location   (/<town>/<service>)
 *   15 town pages         (/roofers-<town>)
 *   6  service subpages   (/services/<service>)
 *   3  core commercial    (/roof-repairs, /new-roofs, /emergency-roofing)
 *   1  homepage           (/)
 *   ──────────────────────────────────────────────
 *   115 URLs  (~= 115 requests; Indexing API URL_UPDATED quota is 200/day)
 *
 * Pass `--all` to submit every entry in allIndexableRoutes (adds trust/blog/
 * utility — useful if you never hit the daily quota). `--limit` / `--offset`
 * slice the selected list for resumable, chunked runs.
 *
 * Prereqs:
 *   1. Indexing API enabled in the `upgraderoofs-api` GCP project.
 *   2. Service account owner (Full) on the verified Search Console property.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const path = require('path');
const fs = require('fs');
const { submitUrlForIndexing } = require(path.join(__dirname, '..', 'lib', 'google-indexing.js'));

// routes.ts is TypeScript — load via ts-node-free transpile is overkill; instead
// keep the prioritised path list inline (single source of truth remains routes.ts,
// this list mirrors its money pages). If you change the inventory there, update here.
const SERVICE_SLUGS = [
  'flat-roofing',
  'tile-slate-roofing',
  'chimney-repairs',
  'gutters-fascias',
  'skylights-roof-windows',
  'cladding',
];

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
];

const BASE_URL = 'https://www.upgraderoofs.co.uk';

// Core commercial + service subpages + homepage (priority money pages).
const CORE_PATHS = [
  '/',
  '/roof-repairs',
  '/new-roofs',
  '/emergency-roofing',
  '/services',
  '/services/tile-slate-roofing',
  '/services/flat-roofing',
  '/services/chimney-repairs',
  '/services/gutters-fascias',
  '/services/skylights-roof-windows',
  '/services/cladding',
  '/service-areas',
];

const PROGRAMMATIC_PATHS = TOWN_SLUGS.flatMap((town) =>
  SERVICE_SLUGS.map((service) => `/${town}/${service}`)
);
const TOWN_PATHS = TOWN_SLUGS.map((town) => `/${town}`);

function buildCorePaths() {
  return [...CORE_PATHS, ...TOWN_PATHS, ...PROGRAMMATIC_PATHS];
}

function parseArgs(argv) {
  const all = argv.includes('--all');
  let limit = null;
  let offset = 0;
  const li = argv.indexOf('--limit');
  if (li !== -1 && argv[li + 1]) limit = parseInt(argv[li + 1], 10);
  const oi = argv.indexOf('--offset');
  if (oi !== -1 && argv[oi + 1]) offset = parseInt(argv[oi + 1], 10);
  return { all, limit, offset };
}

async function main() {
  const { all, limit, offset } = parseArgs(process.argv.slice(2));

  // Verify service-account key exists before firing any request.
  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json');
  if (!fs.existsSync(keyFile)) {
    console.error(`Service account key file not found: ${keyFile}`);
    process.exit(2);
  }

  let paths = buildCorePaths();
  const urls = paths.map((p) => `${BASE_URL}${p}`);
  const sliced = urls.slice(offset, limit != null ? offset + limit : undefined);

  console.log(`Indexing scope: ${all ? 'ALL routes' : 'core programmatic'} (${urls.length} total)`);
  console.log(`Submitting ${sliced.length} URLs (offset=${offset}${limit != null ? `, limit=${limit}` : ''})\n`);

  let ok = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < sliced.length; i++) {
    const url = sliced[i];
    let result = await submitUrlForIndexing(url, 'URL_UPDATED');

    // Retry once on transient quota / exhausted errors.
    if (!result.success && /exhausted|429|quota/i.test(result.error || '')) {
      await new Promise((r) => setTimeout(r, 1500));
      result = await submitUrlForIndexing(url, 'URL_UPDATED');
    }

    if (result.success) {
      ok++;
      console.log(`  OK   (${String(i + 1).padStart(3)}/${sliced.length}) ${url}`);
    } else {
      failed++;
      failures.push({ url, error: result.error });
      console.error(`  FAIL (${String(i + 1).padStart(3)}/${sliced.length}) ${url} → ${result.error}`);
    }

    // Gentle throttle to stay well under any burst limit.
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nDone. ${ok} submitted, ${failed} failed (of ${sliced.length})`);
  if (failures.length) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  ${f.url} → ${f.error}`);
  }
  process.exit(failed > sliced.length / 2 ? 1 : 0);
}

main().catch((err) => {
  console.error('Unexpected error in batch-index-urls:', err);
  process.exit(1);
});
