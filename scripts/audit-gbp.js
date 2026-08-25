/**
 * scripts/audit-gbp.js
 *
 * Google Business Profile (GBP) diagnostic for Upgrade Roofs, authenticated
 * with the dedicated GBP OAuth *manager* credentials in .env.local
 * (GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN), NOT the service
 * account. A manager token is what exercises the user's own ownership on the
 * listing, so verification/suspension/service-area fields surface correctly.
 *
 *   1. Authenticate with the GBP APIs via the OAuth refresh token.
 *   2. Pull the trailing 90 days of daily interaction + impression metrics
 *      (map views, search views, phone calls, website clicks, direction
 *      requests) from the Business Profile Performance API.
 *   3. Map the spike / drop timeline across those 90 days.
 *   4. Report verification status, suspension flags, and service-area config.
 *
 * Run:  node scripts/audit-gbp.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const BUSINESS_HINTS = [/upgrade\s*roofs?/i, /upgraderoof/i];
const TOWN_HINT = /sandbach/i;

const DAYS = 90;

// Interaction/impression metrics (daily granularity). Grouped for readability.
const IMPRESSION_METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',   // "map views" (desktop)
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',    // "map views" (mobile)
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', // "search views" (desktop)
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',  // "search views" (mobile)
];
const INTERACTION_METRICS = [
  'CALL_CLICKS',                  // phone calls
  'WEBSITE_CLICKS',               // website clicks
  'BUSINESS_DIRECTION_REQUESTS',  // direction requests
  'BUSINESS_CONVERSATIONS',       // message conversations
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(t) {
  console.log('\n' + '='.repeat(70));
  console.log('  ' + t);
  console.log('='.repeat(70));
}

function dateString(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Shift a {year,month,day} by N days (handles month/year boundaries). */
function shiftDate(day, delta) {
  const dt = new Date(Date.UTC(day.year, day.month - 1, day.day));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

/** Local "today" in UTC parts (avoids Date.now() in workflow context; here it's fine, plain Node). */
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

/** Sum a daily time series (array of { date, value } — value is a string). */
function sumSeries(series) {
  let total = 0;
  for (const dm of series || []) {
    const v = dm && dm.value;
    if (v !== undefined && v !== null) total += Number(v);
  }
  return total;
}

/** Merge multiple daily series (by date) into one summed series. */
function mergeSeries(seriesList) {
  const byDate = new Map();
  for (const series of seriesList) {
    for (const dm of series || []) {
      if (!dm || !dm.date) continue;
      const key = `${dm.date.year}-${String(dm.date.month).padStart(2, '0')}-${String(dm.date.day).padStart(2, '0')}`;
      byDate.set(key, (byDate.get(key) || 0) + Number(dm.value || 0));
    }
  }
  return Array.from(byDate.entries()).map(([k, v]) => ({ key: k, value: v }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — GBP DIAGNOSTIC (90-DAY, OAUTH MANAGER TOKEN)');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

  // 1. Authenticate -----------------------------------------------------------
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN, GBP_ACCOUNT_ID } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    console.error('Missing GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN in .env.local');
    process.exit(1);
  }
  const oauth2 = new google.auth.OAuth2(GBP_CLIENT_ID, GBP_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GBP_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();
  if (!accessToken) {
    console.error('GBP OAuth access token exchange failed (stale/rotated refresh token?).');
    console.error('Re-mint with:  node scripts/generate-gbp-token.js');
    process.exit(1);
  }
  console.log('[1/4] Authenticated via GBP OAuth refresh token (manager).');

  // 2. Accounts → locations → find Upgrade Roofs ------------------------------
  const acctRes = await get('mybusinessaccountmanagement.googleapis.com', '/v1/accounts', accessToken);
  if (acctRes.status !== 200) {
    console.error(`accounts.list failed (HTTP ${acctRes.status}): ${JSON.stringify(acctRes.body).slice(0, 400)}`);
    const raw = JSON.stringify(acctRes.body);
    if (/quota|RATE_LIMIT|has not been used|disabled|PERMISSION_DENIED/i.test(raw)) {
      console.error('\nGBP API blocked at GCP project level or permissions missing. Enable');
      console.error('"My Business Account Management API" in GCP Console and confirm this');
      console.error('OAuth token belongs to an account that owns/verifies the listing.');
    }
    process.exit(1);
  }
  const accounts = acctRes.body.accounts || [];
  console.log(`[2/4] Accessible GBP accounts: ${accounts.length}`);

  let target = null;
  for (const acct of accounts) {
    const locRes = await get(
      'mybusinessbusinessinformation.googleapis.com',
      `/v1/${acct.name}/locations?readMask=name,title,websiteUri,storefrontAddress,profile,metadata&pageSize=100`,
      accessToken,
    );
    if (locRes.status !== 200) {
      console.log(`      (locations.list failed for ${acct.name}: HTTP ${locRes.status})`);
      continue;
    }
    const locations = locRes.body.locations || [];
    for (const loc of locations) {
      const isMatch = matchesBusiness(loc);
      if (isMatch && (!target || TOWN_HINT.test((loc.storefrontAddress && loc.storefrontAddress.locality) || loc.title || ''))) {
        target = { account: acct, location: loc };
      }
    }
  }

  if (!target) {
    console.error('\nNo location matching "Upgrade Roofs" found in any accessible account.');
    console.error('The OAuth token may belong to an account that cannot see the listing.');
    console.error('Re-mint with the OWNING account:  node scripts/generate-gbp-token.js');
    process.exit(1);
  }

  const loc = target.location;
  const acctId = target.account.name.split('/').pop();
  const locName = loc.name; // bare "locations/{id}" (Business Information/Performance APIs name form)
  const locId = loc.name.split('/').pop();

  console.log(`      Target: ${loc.title}`);
  console.log(`      Resource: ${locName}`);
  if (loc.storefrontAddress) {
    const a = loc.storefrontAddress;
    console.log(`      Address: ${(a.addressLines || []).join(', ')}, ${a.locality || ''} ${a.postalCode || ''}`.trim());
  }
  if (loc.websiteUri) console.log(`      Website: ${loc.websiteUri}`);

  // 3. 90-day daily metrics via Performance API -------------------------------
  banner(`3. ${DAYS}-DAY METRICS (interaction + impressions, daily)`);

  const today = todayParts();
  const startDay = shiftDate(today, -(DAYS - 1));

  const allMetrics = [...INTERACTION_METRICS, ...IMPRESSION_METRICS];
  const seriesByMetric = {};

  async function fetchMetric(metric) {
    // Daily range: start .. today. The Performance API caps ranges; 90 days is allowed.
    const params = [
      `dailyRange.startDate.year=${startDay.year}`,
      `dailyRange.startDate.month=${startDay.month}`,
      `dailyRange.startDate.day=${startDay.day}`,
      `dailyRange.endDate.year=${today.year}`,
      `dailyRange.endDate.month=${today.month}`,
      `dailyRange.endDate.day=${today.day}`,
    ].join('&');
    const p = `/v1/${locName}:getDailyMetricsTimeSeries?dailyMetric=${metric}&${params}`;
    const res = await get('businessprofileperformance.googleapis.com', p, accessToken);
    if (res.status !== 200) {
      return { metric, error: `HTTP ${res.status}: ${JSON.stringify(res.body).slice(0, 200)}` };
    }
    const dated = res.body.timeSeries && res.body.timeSeries.datedValues ? res.body.timeSeries.datedValues : [];
    return { metric, series: dated };
  }

  console.log(`   Range: ${dateString(startDay.year, startDay.month, startDay.day)} → ${dateString(today.year, today.month, today.day)}`);
  for (const metric of allMetrics) {
    const r = await fetchMetric(metric);
    if (r.error) {
      console.log(`   [warn] ${metric}: ${r.error}`);
      seriesByMetric[metric] = [];
    } else {
      seriesByMetric[metric] = r.series;
    }
  }

  // Build the interaction table (each metric, 90-day total).
  banner('INTERACTION METRICS (90-day totals)');
  const intHeader = ['Metric'.padEnd(34), 'Total'.padStart(10)].join('');
  console.log(intHeader);
  console.log('-'.repeat(intHeader.length));
  for (const metric of INTERACTION_METRICS) {
    const total = sumSeries(seriesByMetric[metric]);
    console.log(metric.padEnd(34) + String(total).padStart(10));
  }

  // Impressions table: map views vs search views (merge desktop+mobile).
  banner('IMPRESSIONS (90-day totals)');
  const mapSeries = mergeSeries([
    seriesByMetric['BUSINESS_IMPRESSIONS_DESKTOP_MAPS'],
    seriesByMetric['BUSINESS_IMPRESSIONS_MOBILE_MAPS'],
  ]);
  const searchSeries = mergeSeries([
    seriesByMetric['BUSINESS_IMPRESSIONS_DESKTOP_SEARCH'],
    seriesByMetric['BUSINESS_IMPRESSIONS_MOBILE_SEARCH'],
  ]);
  console.log(`Map views (desktop+mobile):       ${sumSeries(mapSeries)}`);
  console.log(`Search views (desktop+mobile):    ${sumSeries(searchSeries)}`);

  // 4. Timeline: monthly buckets over the trailing 90 days --------------------
  banner(`TIMELINE — MONTHLY BUCKETS (last ${DAYS} days)`);

  const allSeriesForAll = mergeSeries(allMetrics.map((m) => seriesByMetric[m]));
  const byMonth = new Map();
  for (const pt of allSeriesForAll) {
    const month = pt.key.slice(0, 7); // "YYYY-MM"
    byMonth.set(month, (byMonth.get(month) || 0) + pt.value);
  }
  const months = Array.from(byMonth.keys()).sort();
  if (months.length === 0) {
    console.log('No daily data returned for the trailing 90 days (Performance API may');
    console.log('not have data for this window, or the listing is too new/suspended).');
  } else {
    const vals = months.map((m) => byMonth.get(m));
    const max = Math.max(...vals, 1);
    const monthLabels = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };
    console.log('   Month        Volume   Bar');
    for (const m of months) {
      const [y, mm] = m.split('-');
      const label = `${monthLabels[mm] || mm} ${y}`;
      const v = byMonth.get(m);
      const bar = '#'.repeat(Math.round((v / max) * 40));
      console.log(`   ${label.padEnd(12)} ${String(v).padStart(6)}   ${bar}`);
    }
  }

  console.log('\n   (A sharp drop-off month-over-month → look for suspension,');
  console.log('   category/service-area change, or review-velocity collapse.)');

  // 5. Verification, suspension, service area ---------------------------------
  banner('5. VERIFICATION, SUSPENSION & SERVICE AREA');

  const detail = await get(
    'mybusinessbusinessinformation.googleapis.com',
    `/v1/${locName}?readMask=name,title,metadata,profile,phoneNumbers,categories,serviceArea`,
    accessToken,
  );

  if (detail.status !== 200) {
    console.log(`(location detail fetch failed: HTTP ${detail.status} — ${JSON.stringify(detail.body).slice(0, 300)})`);
  } else {
    const d = detail.body;
    const md = d.metadata || {};

    console.log('\nVerification / listing state:');
    console.log(`   Voice of merchant:   ${md.hasVoiceOfMerchant != null ? md.hasVoiceOfMerchant : '—'}`);
    console.log(`   Pending edits:       ${md.hasPendingEdits != null ? md.hasPendingEdits : '—'}`);
    console.log(`   Duplicate location:  ${md.isDuplicate != null ? md.isDuplicate : '—'}`);
    console.log(`   Place ID:            ${md.placeId || '—'}`);
    console.log(`   Maps URL:            ${md.mapsUri || '—'}`);

    console.log('\nSuspension / visibility flags:');
    // Any explicit suspended/disabled flag, if present, appears here.
    console.log(`   Suspended:           ${d.suspended != null ? d.suspended : '— (no explicit flag returned)'}`);
    console.log(`   Disabled:            ${d.disabled != null ? d.disabled : '— (no explicit flag returned)'}`);
    const profileState = d.profile ? d.profile.verificationState : undefined;
    if (profileState) {
      console.log(`   Verification state:  ${profileState}`);
    }
    if (d.categories && d.categories.primaryCategory) {
      console.log(`   Primary category:    ${d.categories.primaryCategory.displayName || '—'}`);
    }

    console.log('\nService area:');
    const sa = d.serviceArea;
    if (!sa || (!sa.places || !sa.places.length)) {
      console.log('   No service-area places configured (may serve only the physical');
      console.log('   address — check if a service-area should be set for local reach).');
    } else {
      console.log(`   Service-area places: ${sa.places.length}`);
      for (const p of sa.places.slice(0, 40)) {
        console.log(`     - ${p.displayName || p.name || p.placeId || '(unnamed)'}`);
      }
      if (sa.places.length > 40) console.log(`     … (${sa.places.length - 40} more)`);
      if (sa.sourceType) console.log(`   Source type:         ${sa.sourceType}`);
    }
  }

  // Ratings/reviews (legacy v4 — signals ownership is intact) -----------------
  const revRes = await get(
    'mybusiness.googleapis.com',
    `/v4/accounts/${acctId}/locations/${locId}/reviews?pageSize=3&orderBy=updateTime%20desc`,
    accessToken,
  );
  console.log('\nRating / review signal (ownership check):');
  if (revRes.status !== 200) {
    console.log(`   (reviews fetch HTTP ${revRes.status} — the owning account may not be`);
    console.log(`    the one authorizing this token; re-mint with the owner.)`);
  } else {
    const avg = revRes.body.averageRating;
    const total = revRes.body.totalReviewCount;
    console.log(`   Average rating:      ${avg != null ? Number(avg).toFixed(1) + ' / 5' : '—'}`);
    console.log(`   Total reviews:       ${total != null ? total : '—'}`);
  }

  console.log('\nAudit complete.\n');
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) {
    console.error('The GBP refresh token is no longer valid. Re-mint: node scripts/generate-gbp-token.js');
  }
  process.exit(1);
});
