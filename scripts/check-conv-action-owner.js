/**
 * scripts/check-conv-action-owner.js
 *
 * One-off: list conversion actions visible in Google Ads customer 8479028400
 * using the existing GOOGLE_ADS_* (adwords-scope) creds, to confirm whether
 * the Data Manager productDestinationId 7700922852 / 7700922855 are owned by
 * THIS customer. If they aren't listed here, the destination operatingAccount
 * is wrong (owner mismatch would produce Data Manager 403 at destinations[0]).
 *
 * Run:  node scripts/check-conv-action-owner.js
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
  GOOGLE_ADS_LOGIN_CUSTOMER_ID,
} = process.env;

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      { host: HOST, path, method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => {
        let data = ''; res.on('data', c => (data += c));
        res.on('end', () => { let p; try { p = JSON.parse(data); } catch { p = { raw: data }; } resolve({ status: res.statusCode, body: p }); });
      }
    );
    req.on('error', reject); req.write(body); req.end();
  });
}

function adsHeaders(t) {
  const h = { Authorization: `Bearer ${t}`, 'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  return h;
}

async function main() {
  const customerId = GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '');
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = adsHeaders(token);

  // List enabled conversion actions with their IDs and types visible in this customer.
  const query = `
    SELECT conversion_action.id, conversion_action.name, conversion_action.type
    FROM conversion_action
    WHERE conversion_action.status = 'ENABLED'
    ORDER BY conversion_action.id`;
  const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });

  if (res.status !== 200) {
    const msg = (res.body && res.body.error && res.body.error.message) || JSON.stringify(res.body);
    console.log('HTTP', res.status, '- list failed:', msg);
    process.exit(1);
  }
  const rows = (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  console.log(`Customer ${customerId} — ENABLED conversion actions:\n`);
  console.log('  ID           TYPE        NAME');
  rows.forEach(r => {
    const ca = r.conversionAction;
    console.log(`  ${ca.id}  ${(ca.type || '').padEnd(10)}  ${ca.name}`);
  });

  const targets = ['7700922852', '7700922855'];
  console.log('\nTarget Data Manager productDestinationIds:');
  targets.forEach(id => {
    const found = rows.find(r => String(r.conversionAction.id) === id);
    console.log(`  ${id} -> ${found ? 'OWNED HERE: "' + found.conversionAction.name + '"' : 'NOT VISIBLE in this customer'}`);
  });
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
