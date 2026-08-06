/**
 * scripts/audit-gbp.js
 *
 * Google Business Profile (GBP) diagnostic audit for Upgrade Roofs.
 *
 * Uses the local google-service-account.json key to query:
 *   - My Business Account Management API  (list accounts)
 *   - My Business Business Information API (list locations per account)
 *   - Business Profile Performance API     (monthly search metrics)
 *
 * Compares March 2026 ("the boom") against the most recent complete months
 * to diagnose local search visibility changes.
 *
 * Run:  node scripts/audit-gbp.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, '..', 'google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

// Business identity we are hunting for
const BUSINESS_NAME_HINTS = ['upgrade roof', 'upgraderoof'];
const BUSINESS_DOMAIN_HINTS = ['upgraderoof'];

// Metrics to pull from the Performance API (monthly granularity)
const METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
  'BUSINESS_CONVERSATIONS',
  'BUSINESS_DIRECTION_REQUESTS',
  'CALL_CLICKS',
  'WEBSITE_CLICKS',
  'BUSINESS_BOOKINGS',
  'BUSINESS_FOOD_ORDERS',
  'BUSINESS_FOOD_MENU_CLICKS',
];

// Date ranges: March 2026 vs the most recent complete months.
// GBP Performance API requires whole months; today is 2026-07-22, so the
// most recent complete month is June 2026.
const RANGE_MARCH = { start: { year: 2026, month: 3, day: 1 }, end: { year: 2026, month: 3, day: 31 } };
const RANGE_RECENT = { start: { year: 2026, month: 4, day: 1 }, end: { year: 2026, month: 6, day: 30 } };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(title) {
  console.log('\n' + '='.repeat(64));
  console.log('  ' + title);
  console.log('='.repeat(64));
}

function fatalSetupInstructions(reason) {
  console.error('\n' + '!'.repeat(64));
  console.error('  GBP ACCESS NOT AVAILABLE — ACTION REQUIRED');
  console.error('!'.repeat(64));
  console.error(`\nReason: ${reason}\n`);
  console.error('The service account below does NOT have access to any Google');
  console.error('Business Profile location for "Upgrade Roofs":\n');
  try {
    const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
    console.error(`  Service account email: ${key.client_email}`);
    console.error(`  GCP project:           ${key.project_id}`);
  } catch (_) { /* ignore */ }
  console.error('\nTo fix this, a GBP owner/manager must do ALL of the following:\n');
  console.error('  1. In Google Cloud Console (project above), enable these APIs:');
  console.error('       - My Business Account Management API');
  console.error('       - My Business Business Information API');
  console.error('       - Business Profile Performance API');
  console.error('  2. Go to https://business.google.com → pick the "Upgrade Roofs"');
  console.error('     profile → Settings → Managers → Add, and invite the service');
  console.error('     account email above as a MANAGER.');
  console.error('  3. Re-run:  node scripts/audit-gbp.js\n');
  console.error('If the profile is managed via a Location Group / Organization account,');
  console.error('invite the service account at that group level instead.\n');
}

function matchesBusiness(location) {
  const hay = [
    location.title,
    location.storefrontAddress && location.storefrontAddress.locality,
    location.websiteUri,
    location.profile && location.profile.description,
  ].filter(Boolean).join(' ').toLowerCase();
  return (
    BUSINESS_NAME_HINTS.some(h => hay.includes(h)) ||
    BUSINESS_DOMAIN_HINTS.some(h => hay.includes(h))
  );
}

function sumMetric(dailyMetrics) {
  // dailyMetrics: array of { datedMetric values } — we aggregate to a total.
  let total = 0;
  for (const dm of dailyMetrics || []) {
    const v = dm.datedMetric && dm.datedMetric.value;
    if (v !== undefined && v !== null) total += Number(v);
  }
  return total;
}

function groupByMonth(dailyMetrics) {
  const byMonth = {};
  for (const dm of dailyMetrics || []) {
    const d = dm.datedMetric && dm.datedMetric.date;
    if (!d) continue;
    const key = `${d.year}-${String(d.month).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + Number(dm.datedMetric.value || 0);
  }
  return byMonth;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — GOOGLE BUSINESS PROFILE AUDIT');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

  // 1. Authenticate ----------------------------------------------------------
  if (!fs.existsSync(KEY_FILE)) {
    console.error(`\nERROR: key file not found at ${KEY_FILE}`);
    process.exit(1);
  }
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: SCOPES });
  const authClient = await auth.getClient();
  console.log('\n[1/4] Authenticated with service account.');

  // 2. List accounts ---------------------------------------------------------
  const acctMgmt = google.mybusinessaccountmanagement({ version: 'v1', auth: authClient });
  let accounts = [];
  try {
    const res = await acctMgmt.accounts.list();
    accounts = res.data.accounts || [];
  } catch (err) {
    const msg = (err && err.message) || String(err);
    if (/PERMISSION_DENIED|403|has not been used|disabled|not enabled/i.test(msg)) {
      fatalSetupInstructions(`Account Management API call failed: ${msg}`);
      process.exit(2);
    }
    throw err;
  }

  console.log(`\n[2/4] Accessible GBP accounts: ${accounts.length}`);
  if (accounts.length === 0) {
    fatalSetupInstructions('accounts.list returned zero accounts.');
    process.exit(2);
  }
  accounts.forEach(a => {
    console.log(`      - ${a.accountName || '(unnamed)'}  [${a.name}]  type=${a.type}  role=${a.role || 'n/a'}  state=${(a.verificationState || '')}/${(a.vettedState || '')}`);
  });

  // 3. Find the Upgrade Roofs location --------------------------------------
  const bizInfo = google.mybusinessbusinessinformation({ version: 'v1', auth: authClient });
  let target = null;

  for (const acct of accounts) {
    let locations = [];
    try {
      const res = await bizInfo.accounts.locations.list({
        parent: acct.name,
        readMask: 'name,title,websiteUri,storefrontAddress,profile,metadata',
        pageSize: 100,
      });
      locations = res.data.locations || [];
    } catch (err) {
      console.log(`      (could not list locations for ${acct.name}: ${err.message})`);
      continue;
    }
    console.log(`\n[3/4] ${acct.accountName || acct.name}: ${locations.length} location(s)`);
    for (const loc of locations) {
      const marker = matchesBusiness(loc) ? '  <-- MATCH' : '';
      console.log(`      - ${loc.title}  [${loc.name}]  ${loc.websiteUri || ''}${marker}`);
      if (!target && matchesBusiness(loc)) {
        target = { account: acct, location: loc };
      }
    }
  }

  if (!target) {
    fatalSetupInstructions(
      'No location matching "Upgrade Roofs" / upgraderoofs.co.uk was found in any accessible account.'
    );
    process.exit(2);
  }

  const locName = target.location.name; // e.g. "accounts/123/locations/456"
  const locationId = locName.split('/').pop();
  console.log(`\n      Target location: ${target.location.title}`);
  console.log(`      Resource:        ${locName}`);
  console.log(`      Location ID:     ${locationId}`);

  // 4. Fetch performance metrics --------------------------------------------
  const perf = google.businessprofileperformance({ version: 'v1', auth: authClient });

  async function fetchRange(range, label) {
    const out = {};
    for (const metric of METRICS) {
      try {
        const res = await perf.locations.getDailyMetricsTimeSeries({
          name: `${locName}`,
          dailyMetric: metric,
          'dailyRange.startDate.year': range.start.year,
          'dailyRange.startDate.month': range.start.month,
          'dailyRange.startDate.day': range.start.day,
          'dailyRange.endDate.year': range.end.year,
          'dailyRange.endDate.month': range.end.month,
          'dailyRange.endDate.day': range.end.day,
        });
        out[metric] = res.data.timeSeries ? (res.data.timeSeries.datedValues || []) : [];
      } catch (err) {
        // Some metrics legitimately return no data (e.g. food orders for a roofer)
        out[metric] = { error: err.message };
      }
    }
    return out;
  }

  console.log('\n[4/4] Fetching performance metrics (this makes several API calls)...');
  const march = await fetchRange(RANGE_MARCH, 'March 2026');
  const recent = await fetchRange(RANGE_RECENT, 'Apr–Jun 2026');

  // Build month-by-month table for impressions (the core visibility metric)
  const impressionMetrics = [
    'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
    'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
    'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  ];

  const monthKeys = ['2026-03', '2026-04', '2026-05', '2026-06'];
  const monthLabels = { '2026-03': 'Mar 2026', '2026-04': 'Apr 2026', '2026-05': 'May 2026', '2026-06': 'Jun 2026' };

  function monthlyTotal(data, metric) {
    if (!data[metric] || data[metric].error) return null;
    return groupByMonth(data[metric]);
  }

  // Merge march + recent monthly buckets
  function mergedMonthly(metric) {
    const m = monthlyTotal(march, metric) || {};
    const r = monthlyTotal(recent, metric) || {};
    return { ...m, ...r };
  }

  banner('MONTH-BY-MONTH: PROFILE IMPRESSIONS (Search + Maps)');
  const header = ['Metric'.padEnd(38), ...monthKeys.map(k => monthLabels[k].padStart(10))].join('');
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const metric of impressionMetrics) {
    const merged = mergedMonthly(metric);
    const row = metric.replace('BUSINESS_IMPRESSIONS_', '').padEnd(38);
    const cells = monthKeys.map(k => {
      const v = merged[k];
      return (v === undefined || v === null ? '—' : String(v)).padStart(10);
    }).join('');
    console.log(row + cells);
  }
  // Total impressions row
  const totals = monthKeys.map(k =>
    impressionMetrics.reduce((sum, m) => sum + (mergedMonthly(m)[k] || 0), 0)
  );
  console.log('-'.repeat(header.length));
  console.log('TOTAL IMPRESSIONS'.padEnd(38) + totals.map(t => String(t).padStart(10)).join(''));

  // Engagement metrics: March total vs recent monthly average
  banner('ENGAGEMENT: MARCH 2026 vs RECENT (Apr–Jun monthly avg)');
  const engMetrics = ['WEBSITE_CLICKS', 'CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'BUSINESS_CONVERSATIONS'];
  const engHeader = ['Metric'.padEnd(30), 'Mar 2026'.padStart(12), 'Apr–Jun avg'.padStart(14), 'Change'.padStart(10)].join('');
  console.log(engHeader);
  console.log('-'.repeat(engHeader.length));

  for (const metric of engMetrics) {
    const marchTotal = (march[metric] && !march[metric].error) ? sumMetric(march[metric]) : null;
    const recentByMonth = monthlyTotal(recent, metric);
    let recentAvg = null;
    if (recentByMonth) {
      const vals = monthKeys.filter(k => k !== '2026-03').map(k => recentByMonth[k]).filter(v => v !== undefined);
      if (vals.length) recentAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    let change = '—';
    if (marchTotal !== null && recentAvg !== null && marchTotal > 0) {
      const pct = ((recentAvg - marchTotal) / marchTotal) * 100;
      change = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
    }
    console.log(
      metric.padEnd(30) +
      String(marchTotal === null ? '—' : marchTotal).padStart(12) +
      String(recentAvg === null ? '—' : recentAvg.toFixed(1)).padStart(14) +
      change.padStart(10)
    );
  }

  // Verdict
  banner('DIAGNOSIS');
  const marTotal = totals[0];
  const recentAvgImpr = (totals[1] + totals[2] + totals[3]) / 3;
  if (marTotal > 0) {
    const pct = ((recentAvgImpr - marTotal) / marTotal) * 100;
    console.log(`March 2026 total impressions:        ${marTotal}`);
    console.log(`Recent monthly avg (Apr–Jun):        ${recentAvgImpr.toFixed(0)}`);
    console.log(`Visibility change vs March:          ${(pct >= 0 ? '+' : '') + pct.toFixed(1)}%`);
    if (pct < -20) {
      console.log('\n>> Significant DROP in local search visibility since March.');
      console.log('   Likely causes to investigate: GBP category/service changes,');
      console.log('   review velocity, listing suspension/soft-suspension, new');
      console.log('   competitors, or a Google local algorithm update.');
    } else if (pct > 20) {
      console.log('\n>> Visibility has GROWN since March. Local SEO is trending up.');
    } else {
      console.log('\n>> Visibility is roughly FLAT vs March (within ±20%).');
    }
  } else {
    console.log('No impression data returned for March 2026 — the Performance API');
    console.log('only retains ~18 months of data and requires the location to have');
    console.log('been live in that window.');
  }

  console.log('\nAudit complete.\n');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant|invalid_key|unauthorized/i.test(String(err.message))) {
    console.error('The service account key itself failed to authenticate — check the key file.');
  }
  process.exit(1);
});
