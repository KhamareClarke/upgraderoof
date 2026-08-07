/**
 * scripts/gsc-full-history.js
 *
 * Full-history Google Search Console pull for upgraderoofs.co.uk.
 *
 * Pulls the maximum available history (Google retains ~16 months of Search
 * Console performance data) grouped by:
 *   - dates        (overall click/impression/CTR/position trend over time)
 *   - page
 *   - query
 *   - country
 *
 * Writes the raw result sets to a timestamped JSON in ./gsc-export/ and prints
 * a readable terminal summary (top queries, top pages, slowest-moving pages).
 *
 * Run:  node scripts/gsc-full-history.js
 *
 * Auth: Google service account (google-service-account.json in repo root) + the
 * Search Console read scope. The service-account email must be a verified owner
 * (or at least read-level) of the property in GSC_SITE_URL.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const GSC_SITE = (process.env.GSC_SITE_URL || 'https://www.upgraderoofs.co.uk/').replace(/\/$/, '') + '/';
const SA_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'google-service-account.json');
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const START = '2025-01-01'; // as far back as we care (GSC caps ~16 mo)
const END = new Date().toISOString().slice(0, 10);

function num(n) { return Number(n ?? 0).toLocaleString('en-GB'); }
function pct(n) { return `${((n ?? 0) * 100).toFixed(2)}%`; }

async function query(auth, body) {
  const sc = google.searchconsole({ version: 'v1', auth });
  const resp = await sc.searchanalytics.query({
    siteUrl: GSC_SITE,
    requestBody: body,
  });
  return resp.data.rows || [];
}

function keyOf(row, dim) {
  return (row.keys && row.keys[0]) || '';
}

(async () => {
  console.log(`Search Console full-history pull\n  site: ${GSC_SITE}\n  range: ${START} → ${END}\n`);
  const auth = new google.auth.GoogleAuth({ keyFile: SA_FILE, scopes: [SCOPE] });

  const exportDir = path.join(__dirname, '..', 'gsc-export');
  fs.mkdirSync(exportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(exportDir, `gsc-${stamp}.json`);
  const exportData = { site: GSC_SITE, start: START, end: END, fetched: new Date().toISOString() };

  // 1. Daily totals
  console.log('Pull: daily totals …');
  const daily = await query(auth, {
    startDate: START, endDate: END, dimensions: ['date'],
  });
  exportData.daily = daily.map((r) => ({
    date: keyOf(r, 'date'),
    clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position,
  }));

  // 2. By page (most granular)
  console.log('Pull: by page …');
  const byPage = await query(auth, {
    startDate: START, endDate: END, dimensions: ['page'], rowLimit: 25000,
  });
  exportData.pages = byPage.map((r) => ({
    page: keyOf(r, 'page'),
    clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position,
  }));

  // 3. By query
  console.log('Pull: by query …');
  const byQuery = await query(auth, {
    startDate: START, endDate: END, dimensions: ['query'], rowLimit: 25000,
  });
  exportData.queries = byQuery.map((r) => ({
    query: keyOf(r, 'query'),
    clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position,
  }));

  // 4. By country
  console.log('Pull: by country …');
  const byCountry = await query(auth, {
    startDate: START, endDate: END, dimensions: ['country'],
  });
  exportData.countries = byCountry.map((r) => ({
    country: keyOf(r, 'country'),
    clicks: r.clicks, impressions: r.impressions,
  }));

  fs.writeFileSync(outFile, JSON.stringify(exportData, null, 2));
  console.log(`\nWrote: ${outFile}`);

  // ── Terminal summary ───────────────────────────────────────────────────
  const hr = '─'.repeat(64);

  console.log(`\n${hr}\n  OVERALL\n${hr}`);
  const totClicks = daily.reduce((a, r) => a + r.clicks, 0);
  const totImp = daily.reduce((a, r) => a + r.impressions, 0);
  console.log(`  Total clicks      ${num(totClicks)}`);
  console.log(`  Total impressions ${num(totImp)}`);
  console.log(`  Overall CTR       ${pct(totClicks / (totImp || 1))}`);
  console.log(`  Days of data      ${daily.length}`);

  console.log(`\n${hr}\n  TOP QUERIES BY CLICKS\n${hr}`);
  byQuery.sort((a, b) => b.clicks - a.clicks);
  for (const q of byQuery.slice(0, 25)) {
    console.log(`  ${String(q.clicks).padStart(5)} clk  ${String(q.impressions).padStart(6)} imp  pos ${q.position.toFixed(1).padStart(5)}  ${q.keys[0]}`);
  }

  console.log(`\n${hr}\n  TOP PAGES BY CLICKS\n${hr}`);
  byPage.sort((a, b) => b.clicks - a.clicks);
  for (const p of byPage.slice(0, 25)) {
    const url = p.keys[0].replace(GSC_SITE, '/');
    console.log(`  ${String(p.clicks).padStart(5)} clk  ${String(p.impressions).padStart(6)} imp  pos ${p.position.toFixed(1).padStart(5)}  ${url}`);
  }

  console.log(`\n${hr}\n  AVERAGE POSITION BY PAGE (worst keepers)\n${hr}`);
  const posByPage = byPage.filter((p) => p.position > 0 && p.position < 50).sort((a, b) => b.position - a.position);
  for (const p of posByPage.slice(0, 20)) {
    const url = p.keys[0].replace(GSC_SITE, '/');
    console.log(`  pos ${p.position.toFixed(1).padStart(5)}  ${String(p.impressions).padStart(6)} imp  ${url}`);
  }

  console.log(`\n${hr}\n  COUNTRIES\n${hr}`);
  exportData.countries.sort((a, b) => b.clicks - a.clicks);
  for (const c of exportData.countries) {
    console.log(`  ${c.country.padEnd(8)} ${String(c.clicks).padStart(5)} clk ${String(c.impressions).padStart(6)} imp`);
  }
  console.log('');
})().catch((e) => {
  console.error('FATAL:', e instanceof Error ? e.stack || e.message : e);
  process.exit(1);
});
