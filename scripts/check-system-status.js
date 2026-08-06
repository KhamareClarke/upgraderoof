/**
 * scripts/check-system-status.js
 *
 * Read-only connectivity checklist for the upgraderoofs.co.uk marketing stack.
 * Pings each core system and prints a green/red report:
 *
 *   1. Google Ads API (v22)   — OAuth refresh-token exchange + customers:list
 *   2. Google Search Console  — service-account auth + siteUrl lookup
 *   3. GA4                    — service-account auth + tiny runReport
 *   4. GoHighLevel (GHL)      — contacts GET with location auth
 *
 * This script performs ONLY reads — it creates no leads, no contacts and no
 * conversions. Safe to run against production at any time.
 *
 * Env is read from .env.local (same vars the app uses). Credentials file
 * google-service-account.json is expected in the repo root and is never printed.
 *
 * Run:  node scripts/check-system-status.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ADS_API_VERSION = 'v22';
const ADS_HOST = 'googleads.googleapis.com';
const GHL_HOST = 'services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const SA_FILE = path.join(__dirname, '..', 'google-service-account.json');

// ---------------------------------------------------------------------------
// Minimal reporting helpers
// ---------------------------------------------------------------------------
const rows = [];
function ok(label, detail) { rows.push({ label, pass: true, detail: detail || '' }); }
function bad(label, detail) { rows.push({ label, pass: false, detail: detail || '' }); }

function getSecure(host, pathname, headers) {
  return new Promise((resolve) => {
    const req = https.request({ host, path: pathname, method: 'GET', headers }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let j; try { j = JSON.parse(d); } catch { j = { raw: d }; }
        resolve({ status: res.statusCode, body: j });
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    req.end();
  });
}

function postSecure(host, pathname, headers, bodyObj) {
  return new Promise((resolve) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request({ host, path: pathname, method: 'POST', headers }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let j; try { j = JSON.parse(d); } catch { j = { raw: d }; }
        resolve({ status: res.statusCode, body: j });
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// 1. Google Ads API (v22)
// ---------------------------------------------------------------------------
async function checkGoogleAds() {
  const need = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID'];
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length) {
    bad('Google Ads API v22', `missing env: ${missing.join(', ')}`);
    return;
  }
  try {
    const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
    const { token } = await oauth2.getAccessToken();
    ok('Google Ads API v22 (auth)', 'OAuth refresh-token exchange OK');

    const headers = {
      Authorization: `Bearer ${token}`,
      'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      'Content-Type': 'application/json',
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '',
    };
    // customers:listAccessibleCustomers is a lightweight, read-only probe that
    // returns HTTP 200 + resourceNames when the developer token is approved and
    // the OAuth user can reach the account. Cleaner than a GAQL searchStream hit.
    const res = await getSecure(ADS_HOST, `/v22/customers:listAccessibleCustomers`, headers);
    if (res.status === 200) {
      const accessible = (res.body.resourceNames || [])
        .map((r) => String(r).replace('customers/', ''))
        .filter((c) => c === process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, ''));
      if (accessible.length) ok('Google Ads API v22 (API)', `HTTP 200 — customer ${process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '')} reachable`);
      else bad('Google Ads API v22 (API)', `HTTP 200 but customer ${process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '')} not in accessible list`);
    } else {
      bad('Google Ads API v22 (API)', `HTTP ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);
    }
  } catch (err) {
    bad('Google Ads API v22', err instanceof Error ? err.message : String(err));
  }
}

// ---------------------------------------------------------------------------
// 2 & 3. Google Search Console + GA4 (service account)
// ---------------------------------------------------------------------------
async function checkScAndGa4() {
  if (!fs.existsSync(SA_FILE)) {
    bad('Google Search Console', 'google-service-account.json missing in root');
    bad('GA4', 'google-service-account.json missing in root');
    return;
  }
  try {
    const auth = new google.auth.GoogleAuth({ keyFile: SA_FILE, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });

    if (!process.env.GSC_SITE_URL) {
      bad('Google Search Console', 'GSC_SITE_URL unset');
    } else {
      try {
        const sc = google.searchconsole({ version: 'v1', auth });
        const r = await sc.searchanalytics.query({
          siteUrl: process.env.GSC_SITE_URL,
          requestBody: { startDate: '2026-07-01', endDate: '2026-07-31', dimensions: ['date'], rowLimit: 1 },
        });
        ok('Google Search Console', `HTTP 200 — ${r.data.rows ? 'data returned' : 'verified (no rows)'}`);
      } catch (err) {
        bad('Google Search Console', err instanceof Error ? err.message : String(err));
      }
    }

    const prop = (process.env.GA4_PROPERTY_ID || process.env.NEXT_PUBLIC_GA4_ID || '').replace(/[^0-9]/g, '');
    if (!prop) {
      bad('GA4', 'GA4_PROPERTY_ID unset');
    } else {
      try {
        const ga = new BetaAnalyticsDataClient({ keyFile: SA_FILE });
        const [resp] = await ga.runReport({
          property: `properties/${prop}`,
          dateRanges: [{ startDate: '2026-07-01', endDate: '2026-07-31' }],
          metrics: [{ name: 'sessions' }],
          limit: 1,
        });
        const sessions = resp.rows && resp.rows[0] ? resp.rows[0].metricValues[0].value : '0';
        ok('GA4', `HTTP 200 — queryable (sessions latest window: ${sessions})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // PERMISSION_DENIED is almost always the service-account email lacking
        // access — guide the operator to the fix rather than just echoing the error.
        const hint = /PERMISSION_DENIED/i.test(msg)
          ? 'grant the service-account email Viewer access in GA4 → Property access management'
          : '';
        bad('GA4', hint ? msg.split(':')[0] + ' — ' + hint : msg);
      }
    }
  } catch (err) {
    bad('Google Search Console', `service-account auth failed: ${err instanceof Error ? err.message : String(err)}`);
    bad('GA4', `service-account auth failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ---------------------------------------------------------------------------
// 4. GoHighLevel (GHL)
// ---------------------------------------------------------------------------
async function checkGhl() {
  const missing = ['GHL_LOCATION_ID', 'GHL_API_KEY'].filter((k) => !process.env[k]);
  if (missing.length) {
    bad('GoHighLevel', `missing env: ${missing.join(', ')}`);
    return;
  }
  const headers = {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    Accept: 'application/json',
  };
  try {
    const res = await getSecure(GHL_HOST, `/contacts/?locationId=${encodeURIComponent(process.env.GHL_LOCATION_ID)}&limit=1`, headers);
    if (res.status === 200) {
      const count = (res.body.contacts || []).length;
      ok('GoHighLevel', `HTTP 200 — contacts API reachable (returned ${count})`);
    } else {
      bad('GoHighLevel', `HTTP ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);
    }
  } catch (err) {
    bad('GoHighLevel', err instanceof Error ? err.message : String(err));
  }
}

// ---------------------------------------------------------------------------
async function main() {
  console.log('\n' + '='.repeat(64));
  console.log('  UPGRADEROOF.S.CO.UK — SYSTEM STATUS CHECK');
  console.log('  ' + new Date().toISOString());
  console.log('  Read-only: no leads/contacts/conversions will be created.');
  console.log('='.repeat(64) + '\n');

  // These run sequentially so the report reads top-to-bottom without interleaving.
  await checkGoogleAds();
  await checkScAndGa4();
  await checkGhl();

  console.log('-'.repeat(64));
  let pass = 0;
  for (const r of rows) {
    if (r.pass) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${r.label}${r.detail ? '  — ' + r.detail : ''}`); }
    else console.log(`  \x1b[31m✗\x1b[0m ${r.label}${r.detail ? '  — ' + r.detail : ''}`);
  }
  console.log('-'.repeat(64));
  const total = rows.length;
  console.log(`  ${pass}/${total} systems connected\n`);
  process.exit(pass === total ? 0 : 1);
}

main().catch((err) => { console.error('FATAL:', err instanceof Error ? err.stack || err.message : err); process.exit(1); });
