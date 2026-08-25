/**
 * scripts/audit-gbp-deep-history.js
 *
 * Deep historical audit of the Upgrade Roofs Google Business Profile, pulling
 * the maximum allowed window (18 months / 540 days) of daily metrics via the
 * Business Profile Performance API's `fetchMultiDailyMetricsTimeSeries` method
 * (a single batched call returning all metrics at once).
 *
 * Authenticates with the GBP OAuth *manager* credentials in .env.local
 * (GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN).
 *
 * Outputs a clean monthly breakdown table — interaction metrics, impression
 * metrics, and a combined volume timeline — to surface long-term trends and
 * inflection points.
 *
 * Run:  node scripts/audit-gbp-deep-history.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const BUSINESS_HINTS = [/upgrade\s*roofs?/i, /upgraderoof/i];
const TOWN_HINT = /sandbach/i;

const WINDOW_DAYS = 540; // max historical window (18 months)

const INTERACTION_METRICS = [
  'CALL_CLICKS',                 // phone calls
  'WEBSITE_CLICKS',              // website clicks
  'BUSINESS_DIRECTION_REQUESTS', // direction requests
  'BUSINESS_CONVERSATIONS',      // message conversations
];

const IMPRESSION_METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
];

const ALL_METRICS = [...INTERACTION_METRICS, ...IMPRESSION_METRICS];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(t) {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + t);
  console.log('='.repeat(72));
}

function dateString(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function shiftDate(day, delta) {
  const dt = new Date(Date.UTC(day.year, day.month - 1, day.day));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

function todayParts() {
  const n = new Date();
  return { year: n.getUTCFullYear(), month: n.getUTCMonth() + 1, day: n.getUTCDate() };
}

function get(host, path, accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { host, path, method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          let p;
          try { p = JSON.parse(d); } catch { p = { raw: d }; }
          resolve({ status: res.statusCode, body: p });
        });
      },
    );
    req.on('error', reject);
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
  return BUSINESS_HINTS.some((re) => re.test(hay));
}

function sumSeries(series) {
  let total = 0;
  for (const dm of series || []) {
    const v = dm && dm.value;
    if (v !== undefined && v !== null) total += Number(v);
  }
  return total;
}

/** Accumulate one metric's dated values into a Map<"YYYY-MM-DD", number>. */
function accumulate(into, series) {
  for (const dm of series || []) {
    if (!dm || !dm.date) continue;
    const key = `${dm.date.year}-${String(dm.date.month).padStart(2, '0')}-${String(dm.date.day).padStart(2, '0')}`;
    into.set(key, (into.get(key) || 0) + Number(dm.value || 0));
  }
}

const MONTH_LABELS = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — GBP DEEP HISTORY (18-MONTH MULTI-METRIC AUDIT)');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

  // 1. Authenticate -----------------------------------------------------------
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    console.error('Missing GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN in .env.local');
    process.exit(1);
  }
  const oauth2 = new google.auth.OAuth2(GBP_CLIENT_ID, GBP_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GBP_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();
  if (!accessToken) {
    console.error('GBP OAuth access token exchange failed. Re-mint: node scripts/generate-gbp-token.js');
    process.exit(1);
  }
  console.log('[1/4] Authenticated via GBP OAuth refresh token (manager).');

  // 2. Locate the Sandbach "Upgrade Roofs" location ---------------------------
  const acctRes = await get('mybusinessaccountmanagement.googleapis.com', '/v1/accounts', accessToken);
  if (acctRes.status !== 200) {
    console.error(`accounts.list failed (HTTP ${acctRes.status}): ${JSON.stringify(acctRes.body).slice(0, 400)}`);
    process.exit(1);
  }
  const accounts = acctRes.body.accounts || [];

  let target = null;
  for (const acct of accounts) {
    const locRes = await get(
      'mybusinessbusinessinformation.googleapis.com',
      `/v1/${acct.name}/locations?readMask=name,title,websiteUri,storefrontAddress,profile,metadata&pageSize=100`,
      accessToken,
    );
    if (locRes.status !== 200) continue;
    for (const loc of locRes.body.locations || []) {
      if (matchesBusiness(loc) && (!target || TOWN_HINT.test((loc.storefrontAddress && loc.storefrontAddress.locality) || loc.title || ''))) {
        target = { account: acct, location: loc };
      }
    }
  }
  if (!target) {
    console.error('\nNo Sandbach "Upgrade Roofs" location found. Re-mint with the owning account.');
    process.exit(1);
  }

  const loc = target.location;
  const locName = loc.name; // bare "locations/{id}"
  console.log(`[2/4] Target: ${loc.title}`);
  console.log(`      Resource: ${locName}`);
  if (loc.storefrontAddress) {
    const a = loc.storefrontAddress;
    console.log(`      Address: ${(a.addressLines || []).join(', ')}, ${a.locality || ''} ${a.postalCode || ''}`.trim());
  }
  if (loc.websiteUri) console.log(`      Website: ${loc.websiteUri}`);

  // 3. Fetch 540 days of daily metrics in one batched call --------------------
  const today = todayParts();
  const startDay = shiftDate(today, -(WINDOW_DAYS - 1));
  const endDay = today;

  const dmParams = ALL_METRICS.map((m) => `dailyMetrics=${m}`).join('&');
  const rangeParams = [
    `dailyRange.startDate.year=${startDay.year}`,
    `dailyRange.startDate.month=${startDay.month}`,
    `dailyRange.startDate.day=${startDay.day}`,
    `dailyRange.endDate.year=${endDay.year}`,
    `dailyRange.endDate.month=${endDay.month}`,
    `dailyRange.endDate.day=${endDay.day}`,
  ].join('&');

  const path = `/v1/${locName}:fetchMultiDailyMetricsTimeSeries?${dmParams}&${rangeParams}`;
  const res = await get('businessprofileperformance.googleapis.com', path, accessToken);

  console.log(`[3/4] ${WINDOW_DAYS}-day window: ${dateString(startDay.year, startDay.month, startDay.day)} → ${dateString(endDay.year, endDay.month, endDay.day)}`);
  console.log(`      Metrics requested: ${ALL_METRICS.length}`);

  if (res.status !== 200) {
    console.error(`\nfetchMultiDailyMetricsTimeSeries failed (HTTP ${res.status}):`);
    console.error(JSON.stringify(res.body, null, 2).slice(0, 1200));
    console.error('\nRe-mint with the owning account if PERMISSION_DENIED:  node scripts/generate-gbp-token.js');
    process.exit(1);
  }

  const batches = res.body.multiDailyMetricTimeSeries || [];
  console.log(`      Metric series returned: ${batches.length}`);

  // Normalise into per-metric series + a combined monthly accumulator.
  const seriesByMetric = {};
  for (const batch of batches) {
    for (const dps of batch.dailyMetricTimeSeries || []) {
      const m = dps.dailyMetric;
      const dated = dps.timeSeries && dps.timeSeries.datedValues ? dps.timeSeries.datedValues : [];
      seriesByMetric[m] = (seriesByMetric[m] || []).concat(dated);
    }
  }

  // 4. Monthly breakdown tables ------------------------------------------------
  banner('4. MONTHLY BREAKDOWN');

  const monthly = new Map(); // "YYYY-MM" -> {total, interactions, impressions}
  function monthKey(key) { return key.slice(0, 7); }
  function bump(key, v) {
    const mk = monthKey(key);
    const e = monthly.get(mk) || { total: 0, interactions: 0, impressions: 0 };
    e.total += v;
    monthly.set(mk, e);
  }

  // Site must display monthly totals per metric group. Build a per-month,
  // per-metric-group map (interactions vs impressions) by iterating metrics.
  const interactionMonthly = new Map();
  const impressionMonthly = new Map();

  for (const m of INTERACTION_METRICS) {
    accumulateByMonth(interactionMonthly, seriesByMetric[m]);
  }
  for (const m of IMPRESSION_METRICS) {
    accumulateByMonth(impressionMonthly, seriesByMetric[m]);
  }
  // combined total
  const allMonths = new Set([
    ...interactionMonthly.keys(),
    ...impressionMonthly.keys(),
  ]);
  const sortedMonths = Array.from(allMonths).sort();
  const combined = new Map();
  for (const mk of sortedMonths) {
    combined.set(mk, (interactionMonthly.get(mk) || 0) + (impressionMonthly.get(mk) || 0));
  }

  function accumulateByMonth(map, series) {
    for (const dm of series || []) {
      if (!dm || !dm.date) continue;
      const key = `${dm.date.year}-${String(dm.date.month).padStart(2, '0')}-${String(dm.date.day).padStart(2, '0')}`;
      const mk = key.slice(0, 7);
      map.set(mk, (map.get(mk) || 0) + Number(dm.value || 0));
    }
  }

  // Header
  const HDR = ['Month'.padEnd(11), 'Int.'.padStart(6), 'Impr.'.padStart(7), 'Total'.padStart(7), '  Trend'].join('');
  console.log(HDR);
  console.log('-'.repeat(HDR.length));

  const maxTotal = Math.max(...Array.from(combined.values()), 1);
  for (const mk of sortedMonths) {
    const [y, mm] = mk.split('-');
    const label = `${MONTH_LABELS[mm] || mm} ${y}`;
    const inter = interactionMonthly.get(mk) || 0;
    const impr = impressionMonthly.get(mk) || 0;
    const tot = combined.get(mk);
    const bar = '#'.repeat(Math.max(1, Math.round((tot / maxTotal) * 30)));
    console.log(
      `${label.padEnd(11)}` +
      `${String(inter).padStart(6)}` +
      `${String(impr).padStart(7)}` +
      `${String(tot).padStart(7)}` +
      `  ${bar}`,
    );
  }

  // Per-metric 18-month totals
  banner('18-MONTH TOTALS (per metric)');
  const rowHeader = ['Metric'.padEnd(34), 'Total'.padStart(10)].join('');
  console.log(rowHeader);
  console.log('-'.repeat(rowHeader.length));
  for (const m of ALL_METRICS) {
    console.log(m.padEnd(34) + String(sumSeries(seriesByMetric[m])).padStart(10));
  }
  console.log('\nMap views (desktop+mobile):       ' + sumSeries(seriesByMetric['BUSINESS_IMPRESSIONS_DESKTOP_MAPS'].concat(seriesByMetric['BUSINESS_IMPRESSIONS_MOBILE_MAPS'])));
  console.log('Search views (desktop+mobile):    ' + sumSeries(seriesByMetric['BUSINESS_IMPRESSIONS_DESKTOP_SEARCH'].concat(seriesByMetric['BUSINESS_IMPRESSIONS_MOBILE_SEARCH'])));

  // Inflection-point heuristics
  banner('INFLECTION / TREND NOTES');
  const values = sortedMonths.map((mk) => combined.get(mk) || 0);
  if (values.length < 2) {
    console.log('Not enough monthly data to detect trends.');
  } else {
    const peak = Math.max(...values);
    const peakMonth = sortedMonths[values.indexOf(peak)];
    const recent = values[values.length - 1];
    const prior = values[values.length - 2] || 0;
    const pctChange = prior ? Math.round(((recent - prior) / prior) * 100) : 0;

    console.log(`   Peak month:        ${peakMonth} (${peak})`);
    console.log(`   Latest month:      ${sortedMonths[sortedMonths.length - 1]} (${recent})`);
    console.log(`   MoM change (last): ${pctChange >= 0 ? '+' : ''}${pctChange}%`);

    // Flag sharp month-over-month swings (>= 40% up or down) as inflection points.
    const inflections = [];
    for (let i = 1; i < values.length; i++) {
      const prev = values[i - 1];
      if (prev === 0) continue;
      const chg = Math.round(((values[i] - prev) / prev) * 100);
      if (Math.abs(chg) >= 40) inflections.push(`${sortedMonths[i]} (${chg >= 0 ? '+' : ''}${chg}% vs ${sortedMonths[i - 1]})`);
    }
    if (inflections.length) {
      console.log('\n   Detected inflection points (>=40% MoM swing):');
      for (const inf of inflections) console.log(`     • ${inf}`);
    } else {
      console.log('\n   No sharp month-over-month swings (>=40%) detected.');
    }
  }

  console.log('\nDeep-history audit complete.\n');
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) {
    console.error('GBP refresh token invalid. Re-mint: node scripts/generate-gbp-token.js');
  }
  process.exit(1);
});
