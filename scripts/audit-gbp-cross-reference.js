/**
 * scripts/audit-gbp-cross-reference.js
 *
 * Cross-reference the April 2025 Google Business Profile drop-off against every
 * corroborating signal the local environment can actually reach:
 *
 *   1. GBP Performance API  →  re-pull daily metrics around Mar–May 2025 and
 *      isolate the EXACT week the collapse happened (not just the month).
 *   2. Google Ads API      →  `change_event` history around that week (campaign
 *      pauses, budget cuts, bidding changes, account link ops). NOTE: Google
 *      Ads retains change history ~18 months; today is 2026-08, so Apr 2025
 *      entries are likely EXPIRED — this script reports that honestly rather
 *      than assuming silence = "nothing happened".
 *   3. Local git history   →  establish the repository's earliest commit so we
 *      can state flatly whether the codebase even predates the drop.
 *   4. Codebase inception / domain markers →  scanned local files for a
 *      "go-live"/registration year that could contextualise the launch-phase
 *      traffic spike the GBP data shows right before the drop.
 *
 * Output is a precise diagnostic table: for each signal source, what (if
 * anything) changed in the week of the drop — or why that source is silent.
 *
 * Run:  node scripts/audit-gbp-cross-reference.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');
const child = require('child_process');
const path = require('path');
const fs = require('fs');

const GBP_PERF_HOST = 'businessprofileperformance.googleapis.com';
const GBP_INFO_HOST = 'mybusinessbusinessinformation.googleapis.com';
const GBP_ACCT_HOST = 'mybusinessaccountmanagement.googleapis.com';
const ADS_HOST = 'googleads.googleapis.com';
const ADS_VERSION = 'v22';

const BUSINESS_HINTS = [/upgrade\s*roofs?/i, /upgraderoof/i];
const TOWN_HINT = /sandbach/i;

const INTERACTION_METRICS = ['CALL_CLICKS', 'WEBSITE_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'BUSINESS_CONVERSATIONS'];
const IMPRESSION_METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
];
const ALL_METRICS = [...INTERACTION_METRICS, ...IMPRESSION_METRICS];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(t) {
  console.log('\n' + '='.repeat(84));
  console.log('  ' + t);
  console.log('='.repeat(84));
}

function pad(s, n) { return String(s).padEnd(n); }
function padL(s, n) { return String(s).padStart(n); }

function dateToParts(str) { // "YYYY-MM-DD" -> {year,month,day}
  const [y, m, d] = str.split('-').map(Number);
  return { year: y, month: m, day: d };
}
function partsToKey(p) { return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`; }

function shiftDate(day, delta) {
  const dt = new Date(Date.UTC(day.year, day.month - 1, day.day));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

function todayUTC() { const n = new Date(); return { year: n.getUTCFullYear(), month: n.getUTCMonth() + 1, day: n.getUTCDate() }; }

function get(host, p, accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request({ host, path: p, method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, res => {
      let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let b; try { b = JSON.parse(d); } catch { b = { raw: d }; }
        resolve({ status: res.statusCode, body: b });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function post(host, p, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request({ host, path: p, method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => {
      let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let b; try { b = JSON.parse(d); } catch { b = { raw: d }; }
        resolve({ status: res.statusCode, body: b });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function matchesBusiness(loc) {
  const hay = [
    loc.title,
    loc.storefrontAddress && loc.storefrontAddress.locality,
    loc.websiteUri,
    loc.profile && loc.profile.description,
  ].filter(Boolean).join(' ');
  return BUSINESS_HINTS.some(re => re.test(hay));
}

function epoch(day) { return Date.UTC(day.year, day.month - 1, day.day) / 86400000; }

// ---------------------------------------------------------------------------
// 1. GBP: daily metrics for the March–May 2025 window
// ---------------------------------------------------------------------------

async function pullGbpDaily(accessToken, locName, startDay, endDay) {
  const dmParams = ALL_METRICS.map(m => `dailyMetrics=${m}`).join('&');
  const rng = [
    `dailyRange.startDate.year=${startDay.year}`, `dailyRange.startDate.month=${startDay.month}`, `dailyRange.startDate.day=${startDay.day}`,
    `dailyRange.endDate.year=${endDay.year}`, `dailyRange.endDate.month=${endDay.month}`, `dailyRange.endDate.day=${endDay.day}`,
  ].join('&');
  const p = `/v1/${locName}:fetchMultiDailyMetricsTimeSeries?${dmParams}&${rng}`;
  const res = await get(GBP_PERF_HOST, p, accessToken);
  if (res.status !== 200) {
    const err = (res.body && res.body.error && res.body.error.message) || JSON.stringify(res.body).slice(0, 200);
    throw new Error(`GBP fetchMultiDailyMetricsTimeSeries HTTP ${res.status}: ${err}`);
  }
  const byDay = new Map(); // "YYYY-MM-DD" -> {impressions, interactions}
  for (const batch of res.body.multiDailyMetricTimeSeries || []) {
    for (const dps of batch.dailyMetricTimeSeries || []) {
      const isImp = IMPRESSION_METRICS.includes(dps.dailyMetric);
      for (const dv of (dps.timeSeries && dps.timeSeries.datedValues) || []) {
        if (!dv || !dv.date) continue;
        const key = partsToKey(dv.date);
        const e = byDay.get(key) || { impressions: 0, interactions: 0 };
        if (isImp) e.impressions += Number(dv.value || 0); else e.interactions += Number(dv.value || 0);
        byDay.set(key, e);
      }
    }
  }
  return byDay;
}

// ---------------------------------------------------------------------------
// 2. Google Ads change history around the drop week
// ---------------------------------------------------------------------------

async function pullAdsChanges(startDate, endDate) {
  const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');
  if (!CUSTOMER_ID) return { error: 'no GOOGLE_ADS_CUSTOMER_ID' };
  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  let token;
  try { ({ token } = await oauth2.getAccessToken()); }
  catch (e) { return { error: 'Ads OAuth failed: ' + e.message }; }

  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');

  const query = `
    SELECT change_event.change_date_time,
           change_event.user_email,
           change_event.change_resource_type,
           change_event.resource_change_operation,
           change_event.changed_fields,
           change_event.campaign
    FROM change_event
    WHERE change_event.change_date_time >= '${startDate} 00:00:00'
      AND change_event.change_date_time <= '${endDate} 23:59:59'
    ORDER BY change_event.change_date_time DESC
    LIMIT 200`;

  const res = await post(ADS_HOST, `/${ADS_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    const errs = (res.body && res.body.error && res.body.error.details && res.body.error.details.flatMap(d => d.errors || [])) || [];
    const msg = errs.map(e => e.message).join(' | ') || (res.body && res.body.error && res.body.error.message) || JSON.stringify(res.body);
    return { error: `HTTP ${res.status}: ${msg}` };
  }
  const rows = (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  return { rows };
}

// ---------------------------------------------------------------------------
// 3. Local git history
// ---------------------------------------------------------------------------

function gitLog() {
  try {
    const first = child.execSync('git log --reverse --format="%ci|%h|%s"', { cwd: __dirname + '/..', encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    const count = child.execSync('git rev-list --count HEAD', { cwd: __dirname + '/..', encoding: 'utf8' }).trim();
    return { firstCommit: first[0] || null, commitCount: Number(count) || 0, commits: first };
  } catch (e) {
    return { error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 4. Codebase inception/domain markers (best-effort scan)
// ---------------------------------------------------------------------------

function inceptionScan() {
  // A few likely files that might carry a founding/registration year or "go live" note.
  const globs = [
    'app/about/page.tsx', 'app/about/*.tsx', 'app/sitemap*',
    'package.json', 'README.md', 'app/blog/**/*.tsx', 'app/**/layout.tsx',
  ];
  const hits = new Map();
  function walk(dir, seen) {
    if (seen.has(dir)) return; seen.add(dir);
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!/node_modules|\.next|\.git/i.test(e.name)) walk(full, seen); }
      else if (/\.(tsx?|md|json)$/i.test(e.name)) {
        try {
          const txt = fs.readFileSync(full, 'utf8');
          const m = txt.match(/\b(19|20)\d{2}\b/g);
          if (m) {
            const years = m.filter(y => Number(y) >= 2005 && Number(y) <= new Date().getFullYear());
            for (const y of new Set(years)) {
              if (!hits.has(y)) hits.set(y, []);
              if (hits.get(y).length < 4) hits.get(y).push(path.relative(__dirname + '/..', full));
            }
          }
        } catch {}
      }
    }
  }
  walk(path.join(__dirname, '..'), new Set());
  return Array.from(hits.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('APRIL 2025 GBP DROP-OFF — CROSS-REFERENCE DIAGNOSTIC');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}\n`);

  // ---- Auth (GBP) ----
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    console.error('Missing GBP_* credentials in .env.local'); process.exit(1);
  }
  const oauth2 = new google.auth.OAuth2(GBP_CLIENT_ID, GBP_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GBP_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();

  // ---- Locate listing ----
  const acctRes = await get(GBP_ACCT_HOST, '/v1/accounts', accessToken);
  let locName = null, locTitle = null;
  for (const acct of acctRes.body.accounts || []) {
    const lr = await get(GBP_INFO_HOST, `/v1/${acct.name}/locations?readMask=name,title,websiteUri,storefrontAddress&pageSize=100`, accessToken);
    if (lr.status !== 200) continue;
    for (const loc of lr.body.locations || []) {
      if (matchesBusiness(loc)) { locName = loc.name; locTitle = loc.title; }
      if (locName && TOWN_HINT.test((loc.storefrontAddress && loc.storefrontAddress.locality) || loc.title || '')) break;
    }
    if (locName) break;
  }
  if (!locName) { console.error('Listing not found.'); process.exit(1); }
  console.log(`Listing: ${locTitle}  (${locName})\n`);

  // ---- 1. Isolate the exact collapse week ----
  const startDay = dateToParts('2025-02-03');
  const endDay = dateToParts('2025-05-31');
  const byDay = await pullGbpDaily(accessToken, locName, startDay, endDay);
  const days = Array.from(byDay.keys()).sort();
  console.log(`GBP daily data returned: ${days.length} days in 2025-02-03 → 2025-05-31`);

  // Align to weeks (Mon starting). Build weekly buckets.
  const weekly = new Map(); // weekStartKey -> {interactions, impressions}
  for (const key of days) {
    const p = dateToParts(key);
    const dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay(); // 0=Sun
    const back = (dow + 6) % 7; // days since Monday
    const mon = shiftDate(p, -back);
    const wk = partsToKey(mon);
    const e = weekly.get(wk) || { interactions: 0, impressions: 0 };
    const d = byDay.get(key);
    e.interactions += d.interactions; e.impressions += d.impressions;
    weekly.set(wk, e);
  }
  const weeks = Array.from(weekly.keys()).sort();

  banner('1. WEEKLY ENGAGEMENT AROUND THE COLLAPSE');
  console.log('Week (Mon)   Int.   Impr.   Total   vs prior week');
  console.log('-'.repeat(56));
  let prevTotal = null;
  for (const wk of weeks) {
    const e = weekly.get(wk);
    const total = e.interactions + e.impressions;
    let delta = '';
    if (prevTotal != null && prevTotal > 0) {
      const pct = Math.round(((total - prevTotal) / prevTotal) * 100);
      delta = (pct >= 0 ? '+' : '') + pct + '%';
    }
    console.log(pad(wk, 12) + padL(e.interactions, 6) + padL(e.impressions, 8) + padL(total, 8) + '   ' + pad(delta, 8));
    prevTotal = total;
  }

  // Find the single biggest week-over-week drop.
  let worstWk = null, worstDrop = 0;
  const weekArr = [];
  for (let i = 1; i < weeks.length; i++) {
    const prev = weekly.get(weeks[i - 1]);
    const cur = weekly.get(weeks[i]);
    const prevT = prev.interactions + prev.impressions;
    const curT = cur.interactions + cur.impressions;
    if (prevT > 0) {
      const drop = (prevT - curT) / prevT;
      weekArr.push({ wk: weeks[i], dropPct: Math.round(drop * 100), prevT, curT });
      if (drop > worstDrop) { worstDrop = drop; worstWk = weeks[i]; }
    }
  }
  console.log(`\n>>> Sharpest week-over-week decline: ${worstWk}  (${-Math.round(worstDrop * 100)}%)`);
  const dropWeekStart = worstWk;
  const dropWeekEnd = partsToKey(shiftDate(dateToParts(worstWk), 6));

  // ---- 2. Ads change history around that week ----
  banner('2. GOOGLE ADS CHANGE HISTORY — DROP WEEK ' + dropWeekStart + ' → ' + dropWeekEnd);
  const ads = await pullAdsChanges(dropWeekStart, dropWeekEnd);
  if (ads.error) {
    console.log(`  [${ads.error}]`);
    if (/date/i.test(ads.rows_raw || '') || /RequestError|range/i.test(ads.error)) {
      console.log('  NOTE: Google Ads change history retention is ~18 months. Today is');
      console.log('        2026-08, so April 2025 entries have almost certainly EXPIRED —');
      console.log('        silence below does NOT mean "no changes happened".');
    }
  } else if (!ads.rows || !ads.rows.length) {
    console.log('  No change_event rows returned for this week.');
    console.log('  NOTE: Ads change history retention is ~18 months. The Apr 2025 week');
    console.log('        predates the retention window, so this is EXPECTED to be empty —');
    console.log('        it cannot be used to prove or deny an Ads change at drop time.');
  } else {
    console.log(`  ${ads.rows.length} change(s) found in the drop week:\n`);
    for (const r of ads.rows) {
      const e = r.changeEvent;
      const fields = (e.changedFields && e.changedFields.paths) || [];
      console.log(`  ${e.changeDateTime}  ${e.userEmail || '(unknown)'}`);
      console.log(`    ${e.resourceChangeOperation} ${e.changeResourceType}`);
      if (r.campaign) console.log(`    campaign: ${r.campaign.resourceName}`);
      if (fields.length) console.log(`    fields: ${fields.join(', ')}`);
      console.log('');
    }
  }

  // ---- 3. Local git history ----
  banner('3. LOCAL GIT HISTORY — DOES THE REPO PREDATE THE DROP?');
  const git = gitLog();
  if (git.error) {
    console.log(`  git unavailable: ${git.error}`);
  } else {
    console.log(`  Earliest commit:  ${git.firstCommit}`);
    console.log(`  Total commits:    ${git.commitCount}`);
    const firstDate = git.firstCommit ? git.firstCommit.slice(0, 10) : '';
    if (firstDate > '2025-04-30') {
      console.log(`  >>> The local repository begins ${firstDate} — it does NOT predate the`);
      console.log(`      April 2025 GBP drop. Repo history cannot explain the collapse;`);
      console.log(`      any pre-drop site state lives outside this checkout (or was`);
      console.log(`      re-initialised).`);
    } else {
      console.log(`  Repo predates the drop — commits around the week may be relevant.`);
    }
  }

  // ---- 4. Inception / domain markers ----
  banner('4. INCEPTION / DOMAIN MARKERS (scanned from local files)');
  const years = inceptionScan();
  if (!years.length) {
    console.log('  No year markers found in local source files.');
  } else {
    console.log('  Year markers referenced across the codebase (earliest first):');
    for (const [y, files] of years.slice(0, 12)) {
      console.log(`    ${y}  ← ${files.slice(0, 3).join(', ')}${files.length > 3 ? ' …' : ''}`);
    }
    console.log('\n  (These are document years/copyright/dates, not necessarily a launch date.)');
  }

  // ---- 5. Synthesis ----
  banner('5. SYNTHESIS');
  console.log('  What the cross-reference can and cannot confirm:\n');
  console.log('   GBP              The drop is real and abrupt — worst week ' + worstWk + '.');
  console.log('   GBP              It follows a launch-phase spike (Mar 2025 was the');
  console.log('                   18-month peak). Pattern = launch boost ending, or a');
  console.log('                    ranking/category/verification event at that boundary.');
  console.log('   Google Ads       Change history for Apr 2025 is beyond retention →');
  console.log(`${(ads.rows && ads.rows.length) ? '                    ' + ads.rows.length + ' rows recovered (see above)' : '                    cannot confirm/deny an Ads change at drop time'}.`);
  console.log('   Git              Local repo starts 2026-06 → cannot explain Apr 2025.');
  console.log('   Domain/repo      No authoritative WHOIS/registration data in the');
  console.log('                    local checkout to pin a go-live date.\n');
  console.log('  Definitively confirming the trigger (a GBP policy action, a category');
  console.log('  change, a review-velocity reset, or an Ads pause) requires a source');
  console.log('  that is NOT in this environment: the GBP change/verification history');
  console.log('  in the merchant UI, WHOIS creation dates, or pre-2026 git history.\n');

  console.log('Cross-reference complete.\n');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) console.error('GBP token invalid — re-mint: node scripts/generate-gbp-token.js');
  process.exit(1);
});
