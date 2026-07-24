/**
 * scripts/audit-search-terms.js
 *
 * Pulls live search_term_view data for the Upgrade Roofs Google Ads account
 * (customer 8479028400) over the last 30 days, classifies each query as
 * converting vs money-wasting, and emits a recommended negative keyword list.
 *
 * Run:  node scripts/audit-search-terms.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');

// Non-intent patterns: anything matching these with 0 conversions is a
// money-waster even if it has clicks. Extend as needed.
const JUNK_PATTERNS = [
  /\bdiy\b/i, /\bhow to\b/i, /\bhow much does it cost to do it yourself\b/i,
  /\bjobs?\b/i, /\bcareers?\b/i, /\bhiring\b/i, /\bapprentice/i, /\bsalary\b/i,
  /\bwages?\b/i, /\bpay\b/i, /\bcourse/i, /\btraining\b/i, /\bqualification/i,
  /\bfree\b/i, /\bcheap\b/i, /\bgumtree\b/i, /\bebay\b/i, /\bsecond hand\b/i,
  /\bused\b/i, /\bmaterials?\b(?!.*(suppl|install))/i, /\btool/i, /\bhire\b/i,
  /\brental\b/i, /\bscrewfix\b/i, /\bb&q\b/i, /\bwickes\b/i, /\btravis perkins\b/i,
  /\byoutube\b/i, /\bvideo\b/i, /\bpictures?\b/i, /\bphotos?\b/i, /\bimages?\b/i,
  /\binsurance claim\b/i, /\bgrant/i, /\bgovernment\b/i, /\bcouncil\b/i,
  /\bplanning permission\b/i, /\bregulations?\b/i, /\bbuilding regs\b/i,
  /\btemplate\b/i, /\bcalculator\b/i, /\bpdf\b/i, /\bforum\b/i, /\breddit\b/i,
];

function banner(t) {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + t);
  console.log('='.repeat(72));
}

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      { host: 'googleads.googleapis.com', path, method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => { let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let p; try { p = JSON.parse(d); } catch { p = { raw: d }; }
        resolve({ status: res.statusCode, body: p });
      }); }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function isJunk(term) {
  return JUNK_PATTERNS.some(re => re.test(term));
}

// Extract candidate negative keywords from a wasteful query:
// the junk words themselves, plus the full phrase if it's short enough to
// be worth adding as a phrase/exact negative.
function negativeCandidates(term) {
  const words = term.toLowerCase().replace(/[^a-z0-9\s&']/g, ' ').split(/\s+/).filter(Boolean);
  const junkWords = words.filter(w =>
    JUNK_PATTERNS.some(re => re.test(w)) ||
    ['diy','job','jobs','career','careers','salary','wage','wages','free','cheap','course','training','hire','rental','used','video','youtube','images','pictures','photos','grant','council','template','calculator','pdf','forum','reddit','hiring','apprenticeship','apprentice','qualification','regulations','planning'].includes(w)
  );
  return { junkWords: [...new Set(junkWords)], phrase: words.length <= 6 ? term : null };
}

async function main() {
  banner('SEARCH TERMS AUDIT — Leads-Search-calls (customer ' + CUSTOMER_ID + ')');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  Window: LAST_30_DAYS  |  API: ${API_VERSION}`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };

  const query = `
    SELECT
      search_term_view.search_term,
      campaign.name,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.cost_micros,
      metrics.conversions
    FROM search_term_view
    WHERE segments.date DURING LAST_30_DAYS
      AND campaign.name = 'Leads-Search-calls'
    ORDER BY metrics.cost_micros DESC
    LIMIT 500`;

  const res = await post(`/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    console.error('Query failed:', JSON.stringify(res.body, null, 2));
    process.exit(1);
  }
  const rows = (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);

  if (!rows.length) {
    console.log('\nNo search term rows returned for campaign "Leads-Search-calls" in the last 30 days.');
    process.exit(0);
  }

  // Aggregate by search term (a term can appear in multiple ad groups)
  const byTerm = new Map();
  for (const r of rows) {
    const term = r.searchTermView.searchTerm;
    const m = r.metrics;
    const cur = byTerm.get(term) || { term, impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
    cur.impressions += Number(m.impressions || 0);
    cur.clicks += Number(m.clicks || 0);
    cur.costMicros += Number(m.costMicros || 0);
    cur.conversions += Number(m.conversions || 0);
    byTerm.set(term, cur);
  }
  const terms = [...byTerm.values()].sort((a, b) => b.costMicros - a.costMicros);

  const converting = terms.filter(t => t.conversions > 0);
  const wasting = terms.filter(t => t.conversions === 0 && (t.clicks > 0 || t.costMicros > 0));
  const wastingJunk = wasting.filter(t => isJunk(t.term));
  const wastingOther = wasting.filter(t => !isJunk(t.term));

  const gbp = micros => '£' + (micros / 1e6).toFixed(2);
  const pct = (a, b) => (b ? (a / b * 100).toFixed(1) + '%' : '—');

  // ---- Table 1: all terms ---------------------------------------------------
  banner(`ALL SEARCH TERMS (${terms.length} unique)`);
  const h = 'Search term'.padEnd(46) + 'Impr.'.padStart(7) + 'Clicks'.padStart(7) + 'CTR'.padStart(7) + 'Cost'.padStart(10) + 'Conv.'.padStart(7);
  console.log(h); console.log('-'.repeat(h.length));
  for (const t of terms) {
    console.log(
      t.term.slice(0, 45).padEnd(46) +
      String(t.impressions).padStart(7) +
      String(t.clicks).padStart(7) +
      pct(t.clicks, t.impressions).padStart(7) +
      gbp(t.costMicros).padStart(10) +
      String(t.conversions).padStart(7)
    );
  }

  // ---- Category A: converters -------------------------------------------------
  banner(`A. HIGH-INTENT CONVERTING KEYWORDS (${converting.length})`);
  if (!converting.length) console.log('(none — no search term recorded a conversion in this window)');
  let convCost = 0, convTotal = 0;
  for (const t of converting) {
    convCost += t.costMicros; convTotal += t.conversions;
    console.log(`  ✓ "${t.term}"  — ${t.conversions} conv, ${t.clicks} clicks, ${gbp(t.costMicros)}, CPA ${gbp(t.costMicros / t.conversions)}`);
  }
  if (converting.length) {
    console.log(`  Subtotal: ${convTotal} conversions on ${gbp(convCost)} spend (blended CPA ${gbp(convCost / convTotal)})`);
  }

  // ---- Category B: money-wasters ----------------------------------------------
  banner(`B. MONEY-WASTING QUERIES (${wasting.length} terms, 0 conversions)`);
  const wasteCost = wasting.reduce((s, t) => s + t.costMicros, 0);
  const wasteClicks = wasting.reduce((s, t) => s + t.clicks, 0);

  console.log(`\nB1. Clear non-intent / junk pattern matches (${wastingJunk.length}):`);
  for (const t of wastingJunk) {
    console.log(`  ✗ "${t.term}"  — ${t.clicks} clicks, ${gbp(t.costMicros)} wasted`);
  }
  console.log(`\nB2. Zero-conversion queries (no junk pattern, but spent money) (${wastingOther.length}):`);
  for (const t of wastingOther) {
    console.log(`  ✗ "${t.term}"  — ${t.clicks} clicks, ${gbp(t.costMicros)} spent, 0 conv`);
  }
  console.log(`\n  Total wasted spend: ${gbp(wasteCost)} across ${wasteClicks} clicks`);

  // ---- Negatives ---------------------------------------------------------------
  banner('RECOMMENDED NEGATIVE KEYWORDS');
  const broadNegatives = new Set();
  const phraseNegatives = new Set();
  for (const t of wasting) {
    const { junkWords, phrase } = negativeCandidates(t.term);
    junkWords.forEach(w => broadNegatives.add(w));
    if (phrase && t.costMicros > 0) phraseNegatives.add(t.term.toLowerCase());
  }

  console.log('\n-- Broad-match negatives (single words blocking whole intent classes) --');
  [...broadNegatives].sort().forEach(w => console.log(`  ${w}`));

  console.log('\n-- Phrase-match negatives (add in "quotes" — specific wasteful queries) --');
  [...phraseNegatives].sort().forEach(p => console.log(`  "${p}"`));

  // ---- Summary ------------------------------------------------------------------
  banner('SUMMARY');
  const totalCost = terms.reduce((s, t) => s + t.costMicros, 0);
  console.log(`Total 30-day spend:        ${gbp(totalCost)}`);
  console.log(`Spend on converting terms: ${gbp(convCost)} (${pct(convCost, totalCost)})`);
  console.log(`Spend on 0-conv terms:     ${gbp(wasteCost)} (${pct(wasteCost, totalCost)})  <-- recoverable`);
  console.log(`\nApplying the negatives above should reclaim most of the ${gbp(wasteCost)}`);
  console.log('currently leaking to non-converting queries each month.\n');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
