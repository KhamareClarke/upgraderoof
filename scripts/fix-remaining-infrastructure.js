/**
 * scripts/fix-remaining-infrastructure.js
 *
 * Resumable Indexing API batch runner for the outstanding (quota-failed) URLs.
 *
 * WHY THIS EXISTS:
 *   A full `node scripts/batch-index-urls.js --all` run submits ~117 URLs in one
 *   go. The Indexing API caps URL_UPDATED/Publish to 200 requests/day per
 *   project. When a run over-shoots the window mid-flight, the tail-end URLs
 *   fail with a quota-exhaustion error ("The request was rejected because the
 *   daily quota has been exceeded") and are NOT queued anywhere — they just
 *   drop. Those are exactly the money pages we most need indexed:
 *       roofers-{macclesfield,knutsford,tarporley,biddulph,newcastle-under-lyme,wilmslow}
 *       × {6 services}  (~34 URLs)
 *
 *   This script makes the tail-end recoverable:
 *     - Every successful submit is recorded in a local state file, keyed by URL.
 *     - A `--resume` run rebuilds the full catalog, subtracts already-done URLs,
 *       and submits only the remaining ones — throttled, and stopping the
 *       instant the quota is hit again.
 *     - `--wait-for-window` lets you park the script so it retries the leftover
 *       batch only after the next quota window opens (safe throttled intervals),
 *       instead of hammering a still-exhausted quota.
 *
 * Run:
 *   node scripts/fix-remaining-infrastructure.js                 # resume, no wait
 *   node scripts/fix-remaining-infrastructure.js --resume        # same as above
 *   node scripts/fix-remaining-infrastructure.js --wait-for-window
 *   node scripts/fix-remaining-infrastructure.js --limit 10 --offset 0
 *   node scripts/fix-remaining-infrastructure.js --reset         # forget state
 *
 * State file: scripts/.indexing-state.json  (gitignored — do not commit)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const path = require('path');
const fs = require('fs');
const { submitUrlForIndexing } = require(path.join(__dirname, '..', 'lib', 'google-indexing.js'));

// Mirror of the prioritised money-page inventory (single source of truth = lib/routes.ts,
// this inline list mirrors it; if you change routes.ts, update here too).
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

const STATE_PATH = path.join(__dirname, '.indexing-state.json');

// Throttle (ms) between each request. Keep gentle to stay well under burst limits.
const THROTTLE_MS = 400;
// Between quota-window retry attempts (default 2h). Override with WAIT_INTERVAL_MINUTES.
const WAIT_INTERVAL_MINUTES = Number(process.env.WAIT_INTERVAL_MINUTES || 120);

function buildCatalogPaths() {
  return [...CORE_PATHS, ...TOWN_PATHS, ...PROGRAMMATIC_PATHS];
}

function buildCatalogUrls() {
  return buildCatalogPaths().map((p) => `${BASE_URL}${p}`);
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

function isQuotaError(msg) {
  return /exhausted|429|quota|daily|rate/i.test(msg || '');
}

function parseArgs(argv) {
  const flags = {
    resume: argv.includes('--resume'),
    wait: argv.includes('--wait-for-window'),
    reset: argv.includes('--reset'),
    limit: null,
    offset: 0,
  };
  const li = argv.indexOf('--limit');
  if (li !== -1 && argv[li + 1]) flags.limit = parseInt(argv[li + 1], 10);
  const oi = argv.indexOf('--offset');
  if (oi !== -1 && argv[oi + 1]) flags.offset = parseInt(argv[oi + 1], 10);
  return flags;
}

async function submitUntilQuota(urls, state) {
  let ok = 0;
  let quotaHit = false;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (state[url]) {
      console.log(`  skip (${String(i + 1).padStart(3)}/${urls.length}) ${url} — already done`);
      continue;
    }

    let result = await submitUrlForIndexing(url, 'URL_UPDATED');

    // One retry on transient quota/rate, then give up on this URL for this run.
    if (!result.success && isQuotaError(result.error)) {
      await new Promise((r) => setTimeout(r, 2000));
      result = await submitUrlForIndexing(url, 'URL_UPDATED');
    }

    if (result.success) {
      ok++;
      state[url] = { okAt: new Date().toISOString() };
      saveState(state);
      console.log(`  OK   (${String(i + 1).padStart(3)}/${urls.length}) ${url}`);
    } else if (isQuotaError(result.error)) {
      // Hit the daily wall — stop now, leave the rest for the next window.
      quotaHit = true;
      console.error(`  QUOTA (${String(i + 1).padStart(3)}/${urls.length}) ${url} → ${result.error}`);
      console.error('  Daily quota reached. Stopping to avoid wasting the remaining requests.');
      break;
    } else {
      console.error(`  FAIL (${String(i + 1).padStart(3)}/${urls.length}) ${url} → ${result.error}`);
    }

    await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  return { ok, quotaHit };
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.reset) {
    if (fs.existsSync(STATE_PATH)) fs.unlinkSync(STATE_PATH);
    console.log('Reset indexing state — next run resubmits everything.');
    return;
  }

  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'google-service-account.json');
  if (!fs.existsSync(keyFile)) {
    console.error(`Service account key file not found: ${keyFile}`);
    process.exit(2);
  }

  const allUrls = buildCatalogUrls();
  const state = loadState();

  // Figure out what's still outstanding.
  const outstanding = allUrls.filter((u) => !state[u]);
  const target =
    flags.limit != null
      ? outstanding.slice(flags.offset, flags.offset + flags.limit)
      : outstanding;

  console.log(`Catalog: ${allUrls.length} total, ${allUrls.length - outstanding.length} done, ${outstanding.length} outstanding.`);
  if (flags.limit != null) {
    console.log(`Slice: offset=${flags.offset}, limit=${flags.limit} → ${target.length} URLs this run.`);
  }
  console.log(`Submitting ${target.length} outstanding URLs (resume mode)\n`);

  let result = await submitUntilQuota(target, state);

  const stillOutstanding = allUrls.filter((u) => !state[u]).length;
  console.log(`\nDone. This run: ${result.ok} submitted. ${stillOutstanding} URLs still outstanding.`);

  if (flags.wait && result.quotaHit && stillOutstanding > 0) {
    const waitMs = WAIT_INTERVAL_MINUTES * 60 * 1000;
    console.log(
      `\n--wait-for-window: sleeping ${WAIT_INTERVAL_MINUTES} min before retrying the remaining ${stillOutstanding}. ` +
        'Safe to ^C — state is persisted; resume later with --resume.'
    );
    await new Promise((r) => setTimeout(r, waitMs));
    // Re-run the resume logic once after the wait (single retry; re-invoke for more).
    const state2 = loadState();
    const outstanding2 = allUrls.filter((u) => !state2[u]);
    return submitUntilQuota(outstanding2, state2).then((res) => {
      const still = allUrls.filter((u) => !loadState()[u]).length;
      console.log(`\nPost-wait run: ${res.ok} submitted. ${still} still outstanding.`);
    });
  }

  if (stillOutstanding === 0) {
    console.log('All catalog URLs submitted. Nothing left to index.');
  } else if (!result.quotaHit) {
    console.log('Remaining URLs failed for non-quota reasons — review the FAIL lines above.');
  }
}

main().catch((err) => {
  console.error('Unexpected error in fix-remaining-infrastructure:', err);
  process.exit(1);
});
