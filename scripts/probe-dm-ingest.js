/**
 * scripts/probe-dm-ingest.js
 *
 * Minimal LIVE probe of the Data Manager API events:ingest endpoint using the
 * NEW GOOGLE_DM_* credentials (scope datamanager). Sends a fabricated (golden)
 * gclid so nothing real is ever credited — a fake gclid either never matches a
 * real click (ingest-async, no record) or returns a clear error, but it CANNOT
 * record a real conversion.
 *
 * Run:  node scripts/probe-dm-ingest.js
 *
 * Expected outcomes to interpret:
 *   200 + request_id           -> auth + schema fully valid end-to-end. Golden
 *                                 gclid accepted (queued async, will no-op on
 *                                 match) — exactly what we want.
 *   400 error (clear_invalid_gclid or similar in body)  -> auth + schema VALID;
 *                                 Google rejected the fake gclid. Data Manager
 *                                 is fast-fail, so a synthetic gclid often 400s
 *                                 the whole request. That still PROVES wiring.
 *   401/403 (UNAUTHENTICATED/PERMISSION_DENIED) -> DO NOT proceed to the route;
 *                                 credential/scope problem. Stop and fix.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');

const DM_HOST = 'datamanager.googleapis.com';
const DM_PATH = '/v1/events:ingest';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const CONV_ACTION_SITE_VISIT = '7700922852'; // Site Visit Booked £50

const {
  GOOGLE_DM_CLIENT_ID,
  GOOGLE_DM_CLIENT_SECRET,
  GOOGLE_DM_REFRESH_TOKEN,
} = process.env;

function post(host, path, bodyObj, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      { host, path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed; try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const goldenGclid = 'Cj0KCQjw_testgoldengclid_' + 'x'.repeat(64);

async function main() {
  if (!GOOGLE_DM_CLIENT_ID || !GOOGLE_DM_CLIENT_SECRET || !GOOGLE_DM_REFRESH_TOKEN) {
    console.error('Missing GOOGLE_DM_CLIENT_ID/SECRET/REFRESH_TOKEN in .env.local');
    process.exit(1);
  }

  // 1. Refresh token -> access token (scope datamanager)
  const form = new URLSearchParams({
    client_id: GOOGLE_DM_CLIENT_ID,
    client_secret: GOOGLE_DM_CLIENT_SECRET,
    refresh_token: GOOGLE_DM_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }).toString();

  const tokenRes = await new Promise((resolve, reject) => {
    const req = https.request(
      { host: 'oauth2.googleapis.com', path: '/token', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(form) } },
      (res) => {
        let data = ''; res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed; try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(form);
    req.end();
  });

  if (!tokenRes.body.access_token) {
    console.error('TOKEN FAIL:', tokenRes.status, JSON.stringify(tokenRes.body));
    process.exit(1);
  }
  const accessToken = tokenRes.body.access_token;
  const scope = tokenRes.body.scope || '';
  console.log('Access token minted. scope =', scope);
  if (!scope.includes('datamanager')) {
    console.error('SCOPE MISMATCH — got', scope, 'need datamanager. Fix the refresh token.');
    process.exit(1);
  }

  // 2. events:ingest with a golden gclid + required transactionId
  const ingest = {
    destinations: [{
      operatingAccount: { accountId: CUSTOMER_ID, accountType: 'GOOGLE_ADS' },
      productDestinationId: CONV_ACTION_SITE_VISIT,
    }],
    events: [{
      adIdentifiers: { gclid: goldenGclid },
      transactionId: 'probe-' + new Date().getTime(),
      eventTimestamp: new Date().toISOString(),
      conversionValue: 50.0,
      currency: 'GBP',
    }],
  };

  console.log('\nPOST https://' + DM_HOST + DM_PATH);
  console.log('  operatingAccount (cust)    :', CUSTOMER_ID, '(8479028400)');
  console.log('  productDestinationId       :', CONV_ACTION_SITE_VISIT, '(Site Visit Booked £50)');
  console.log('  events (golden gclid)      : 1, value 50.0 GBP\n');

  const r = await post(DM_HOST, DM_PATH, ingest, { Authorization: `Bearer ${accessToken}` });
  console.log('HTTP', r.status);
  console.log(JSON.stringify(r.body, null, 2));
  console.log('\n---INTERPRETATION---');
  if (r.status === 200) {
    console.log('OK: auth + schema valid end-to-end. Golden gclid accepted async (no real conversion).');
    process.exit(0);
  } else if (r.status === 400) {
    console.log('400 = schema/semantic invalid. auth likely OK. Inspect body above.');
    process.exit(2);
  } else if (r.status === 401 || r.status === 403) {
    console.log('AUTH/PERMISSION FAIL — DO NOT proceed to route rewrite. Fix credentials first.');
    process.exit(3);
  } else {
    console.log('Unexpected. Inspect body above.');
    process.exit(9);
  }
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
