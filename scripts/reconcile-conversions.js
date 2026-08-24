/**
 * scripts/reconcile-conversions.js
 *
 * One-off reconciliation of the LIVE Google Ads conversion actions for the
 * spending account (GOOGLE_ADS_CUSTOMER_ID) against the conversion IDs wired
 * into the site via .env.local (NEXT_PUBLIC_GADS_CONV_ID / _CLICK_CONV_ID) and
 * the hardcoded fallbacks in components/Analytics.tsx + lib/tracking.ts.
 *
 * Emits each conversion action's AW-<id> container so it can be compared
 * directly against the configured values. Secrets are never printed.
 *
 * Run:  node scripts/reconcile-conversions.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';

async function main() {
  const {
    GOOGLE_ADS_CUSTOMER_ID,
    GOOGLE_ADS_DEVELOPER_TOKEN,
    GOOGLE_ADS_CLIENT_ID,
    GOOGLE_ADS_CLIENT_SECRET,
    GOOGLE_ADS_REFRESH_TOKEN,
    GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  } = process.env;

  const missing = ['GOOGLE_ADS_CUSTOMER_ID', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('Missing env: ' + missing.join(', '));
    process.exit(2);
  }

  const customerId = GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '');

  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();

  const headers = { Authorization: 'Bearer ' + accessToken, 'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) headers['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');

  const body = JSON.stringify({
    query: `SELECT conversion_action.resource_name, conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.type, conversion_action.category FROM conversion_action`,
  });

  const result = await new Promise((resolve) => {
    const req = https.request({
      host: HOST,
      path: `/${API_VERSION}/customers/${customerId}/googleAds:searchStream`,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => {
        let b; try { b = JSON.parse(d); } catch { b = { raw: d }; }
        resolve({ status: res.statusCode, body: b });
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { raw: String(e.message || e) } }));
    req.write(body); req.end();
  });

  if (result.status !== 200) {
    console.error('HTTP ' + result.status);
    console.error(JSON.stringify(result.body, null, 2));
    process.exit(1);
  }

  const rows = (Array.isArray(result.body) ? result.body : [result.body])
    .flatMap((b) => b.results || [])
    .map((r) => r.conversionAction || {});

  const accountId = GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '');
  console.log('Customer (spending) account: ' + accountId);
  console.log('Login (manager/MCC) account : ' + (GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/\D/g, '') + '\n');

  console.log('LIVE conversion actions (account ' + accountId + '):');
  console.log('-'.repeat(100));
  for (const ca of rows) {
    const aw = ca.id ? 'AW-' + ca.id : '<no id>';
    console.log(
      (aw + '                    ').slice(0, 18) +
      ' | ' + (ca.status || '?') +
      ' | ' + (ca.type || '?') +
      ' | ' + (ca.category || '?') +
      ' | ' + (ca.name || '?')
    );
  }
  console.log('-'.repeat(100));

  const liveIds = new Set(rows.filter((c) => c.id).map((c) => 'AW-' + c.id));

  // Configured values (presence only — values themselves ARE the info we want,
  // these are conversion-action IDs, not secrets).
  const configured = [
    ['NEXT_PUBLIC_GADS_CONV_ID       (lead form)', process.env.NEXT_PUBLIC_GADS_CONV_ID],
    ['NEXT_PUBLIC_GADS_CLICK_CONV_ID (phone/WA tap)', process.env.NEXT_PUBLIC_GADS_CLICK_CONV_ID],
    ['NEXT_PUBLIC_GADS_ID            (remarketing)', process.env.NEXT_PUBLIC_GADS_ID],
  ];

  console.log('\nConfigured vs LIVE:');
  for (const [label, val] of configured) {
    const ok = val && liveIds.has(val);
    console.log('  ' + label + ' : ' + (val || '<unset>') + (val ? (ok ? '   ✔ LIVE' : '   ✖ NOT in account') : ''));
  }

  // Hardcoded fallbacks found in components/Analytics.tsx / lib/tracking.ts.
  const fallbacks = ['AW-7693225904', 'AW-8479028400', 'AW-17763560213'];
  console.log('\nHardcoded fallback IDs (Analytics.tsx / tracking.ts):');
  for (const f of fallbacks) {
    console.log('  ' + f + (liveIds.has(f) ? '   ✔ LIVE' : '   ✖ NOT a conversion action (or stale)'));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
