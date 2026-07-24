/**
 * scripts/test-google-ads-api.js
 *
 * Connectivity + access diagnostic for the Google Ads API, using the
 * credentials in .env.local:
 *   GOOGLE_ADS_CUSTOMER_ID       e.g. 8479028400 (10 digits, dashes optional)
 *   GOOGLE_ADS_DEVELOPER_TOKEN   from Google Ads → Tools → API Center
 *   GOOGLE_ADS_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN  (OAuth web client)
 *
 * What it checks, in order:
 *   1. All env vars present
 *   2. OAuth refresh token exchanges for an access token
 *   3. Developer token accepted + customer accessible (customers:listAccessibleCustomers)
 *   4. GAQL query runs — account info + last-30-day campaign performance
 *
 * No new dependencies: uses `googleapis` (already installed) for OAuth only,
 * and plain HTTPS for the Ads REST endpoints.
 *
 * Run:  node scripts/test-google-ads-api.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';

const {
  GOOGLE_ADS_CUSTOMER_ID,
  GOOGLE_ADS_DEVELOPER_TOKEN,
  GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID, // optional — MCC manager account
} = process.env;

function banner(t) {
  console.log('\n' + '='.repeat(64));
  console.log('  ' + t);
  console.log('='.repeat(64));
}

function fail(step, message, hints) {
  console.error(`\n[FAIL at step ${step}] ${message}`);
  (hints || []).forEach(h => console.error(`   → ${h}`));
  process.exit(1);
}

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      {
        host: HOST,
        path,
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({ host: HOST, path, method: 'GET', headers }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function adsHeaders(accessToken) {
  const h = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }
  return h;
}

function explainAdsError(body) {
  const errs = (body && body.error && body.error.details &&
    body.error.details.flatMap(d => d.errors || [])) || [];
  if (!errs.length && body && body.error) {
    return [`${body.error.status || body.error.code}: ${body.error.message}`];
  }
  return errs.map(e => {
    const code = e.errorCode ? Object.entries(e.errorCode).map(([k, v]) => `${k}=${v}`).join(',') : '';
    return `${e.message}${code ? `  [${code}]` : ''}`;
  });
}

async function main() {
  banner('GOOGLE ADS API — CONNECTION TEST');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  API version: ${API_VERSION}`);

  // 1. Env vars ---------------------------------------------------------------
  const missing = [
    ['GOOGLE_ADS_CUSTOMER_ID', GOOGLE_ADS_CUSTOMER_ID],
    ['GOOGLE_ADS_DEVELOPER_TOKEN', GOOGLE_ADS_DEVELOPER_TOKEN],
    ['GOOGLE_ADS_CLIENT_ID', GOOGLE_ADS_CLIENT_ID],
    ['GOOGLE_ADS_CLIENT_SECRET', GOOGLE_ADS_CLIENT_SECRET],
    ['GOOGLE_ADS_REFRESH_TOKEN', GOOGLE_ADS_REFRESH_TOKEN],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    fail(1, `Missing env vars in .env.local: ${missing.join(', ')}`);
  }
  const customerId = GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '');
  if (!/^\d{10}$/.test(customerId)) {
    fail(1, `GOOGLE_ADS_CUSTOMER_ID "${GOOGLE_ADS_CUSTOMER_ID}" is not a 10-digit customer ID.`);
  }
  console.log(`\n[1/4] Env vars present. Customer ID: ${customerId}`);
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    console.log(`      Login (MCC) customer ID: ${GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '')}`);
  }

  // 2. OAuth token exchange ---------------------------------------------------
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  let accessToken;
  try {
    const { token } = await oauth2.getAccessToken();
    accessToken = token;
  } catch (err) {
    fail(2, `Refresh token exchange failed: ${err.message}`, [
      'The refresh token may be revoked or the OAuth client may have been rotated.',
      'Regenerate with the Google Ads OAuth playground or `googleapis` auth flow,',
      'scope: https://www.googleapis.com/auth/adwords',
    ]);
  }
  if (!accessToken) fail(2, 'Refresh token exchange returned no access token.');
  console.log('[2/4] OAuth access token obtained (refresh token is valid).');

  const headers = adsHeaders(accessToken);

  // 3. Accessible customers ----------------------------------------------------
  const acc = await get(`/${API_VERSION}/customers:listAccessibleCustomers`, headers);
  if (acc.status !== 200) {
    const lines = explainAdsError(acc.body);
    fail(3, `listAccessibleCustomers returned HTTP ${acc.status}`, [
      ...lines,
      'If error is USER_PERMISSION_DENIED / CUSTOMER_NOT_FOUND: the developer token',
      'is not approved, or the OAuth user has no access to any Ads account.',
      'Check API Center in Google Ads (Tools → Setup → API Center) for token status:',
      '"Pending" tokens only work against test accounts.',
    ]);
  }
  const accessible = (acc.body.resourceNames || []).map(r => r.replace('customers/', ''));
  console.log(`[3/4] Developer token accepted. Accessible customers: ${accessible.length}`);
  accessible.forEach(c => console.log(`      - ${c}${c === customerId ? '  <-- target' : ''}`));

  if (!accessible.includes(customerId)) {
    fail(3, `Target customer ${customerId} is NOT in the accessible list.`, [
      'The Google account behind the refresh token cannot see this Ads account.',
      'Fix: in Google Ads, invite that Google account as a user on customer',
      `${customerId} (or on an MCC above it), or set GOOGLE_ADS_LOGIN_CUSTOMER_ID`,
      'to the MCC ID if access flows through a manager account.',
    ]);
  }

  // 4. GAQL queries -------------------------------------------------------------
  async function gaql(query) {
    const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
    if (res.status !== 200) {
      const lines = explainAdsError(res.body);
      throw new Error(`HTTP ${res.status}: ${lines.join(' | ')}`);
    }
    // searchStream returns an array of batches, each with results[]
    return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  }

  // 4a. Account identity
  let accountRows;
  try {
    accountRows = await gaql(
      `SELECT customer.id, customer.descriptive_name, customer.currency_code,
              customer.time_zone, customer.status, customer.manager
       FROM customer LIMIT 1`
    );
  } catch (err) {
    fail(4, `Account query failed: ${err.message}`);
  }
  const cust = accountRows[0] && accountRows[0].customer;
  console.log('[4/4] GAQL query OK. Account:');
  if (cust) {
    console.log(`      Name:     ${cust.descriptiveName || '(unnamed)'}`);
    console.log(`      ID:       ${cust.id}   Status: ${cust.status}   Manager account: ${cust.manager ? 'yes (MCC)' : 'no'}`);
    console.log(`      Currency: ${cust.currencyCode}   Timezone: ${cust.timeZone}`);
  }

  // 4b. Campaign performance, last 30 days
  banner('CAMPAIGN PERFORMANCE — LAST 30 DAYS');
  let campRows = [];
  try {
    campRows = await gaql(
      `SELECT campaign.name, campaign.status,
              metrics.impressions, metrics.clicks, metrics.cost_micros,
              metrics.conversions, metrics.ctr
       FROM campaign
       WHERE segments.date DURING LAST_30_DAYS
       ORDER BY metrics.cost_micros DESC
       LIMIT 20`
    );
  } catch (err) {
    console.log(`(campaign query failed: ${err.message})`);
  }

  if (!campRows.length) {
    console.log('No campaign data in the last 30 days (account may be paused or new).');
  } else {
    const header =
      'Campaign'.padEnd(34) + 'Status'.padEnd(10) +
      'Impr.'.padStart(9) + 'Clicks'.padStart(8) + 'CTR'.padStart(7) +
      'Cost'.padStart(10) + 'Conv.'.padStart(8);
    console.log(header);
    console.log('-'.repeat(header.length));
    let totCost = 0, totClicks = 0, totImpr = 0, totConv = 0;
    for (const r of campRows) {
      const m = r.metrics, c = r.campaign;
      const cost = Number(m.costMicros || 0) / 1e6;
      totCost += cost; totClicks += Number(m.clicks || 0);
      totImpr += Number(m.impressions || 0); totConv += Number(m.conversions || 0);
      console.log(
        String(c.name).slice(0, 33).padEnd(34) +
        String(c.status).padEnd(10) +
        String(m.impressions).padStart(9) +
        String(m.clicks).padStart(8) +
        (Number(m.ctr || 0) * 100).toFixed(1).padStart(6) + '%' +
        ('£' + cost.toFixed(2)).padStart(10) +
        String(Number(m.conversions || 0).toFixed(1)).padStart(8)
      );
    }
    console.log('-'.repeat(header.length));
    console.log(
      'TOTAL'.padEnd(44) +
      String(totImpr).padStart(9) + String(totClicks).padStart(8) +
      (totImpr ? (totClicks / totImpr * 100).toFixed(1) : '0.0').padStart(6) + '%' +
      ('£' + totCost.toFixed(2)).padStart(10) + totConv.toFixed(1).padStart(8)
    );
  }

  banner('RESULT');
  console.log('Google Ads API connection: OK');
  console.log(`Auth, developer token, and customer ${customerId} access all verified.\n`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
