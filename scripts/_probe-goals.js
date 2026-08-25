/* Read-only probe: enumerate goal-related entities in customer 8479028400. */
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
    const req = https.request({
      host: HOST, path, method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        let parsed; try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function adsHeaders(token) {
  const h = { Authorization: `Bearer ${token}`, 'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  return h;
}

function explain(errBody) {
  const errs = (errBody && errBody.error && errBody.error.details && errBody.error.details.flatMap(d => d.errors || [])) || [];
  if (!errs.length && errBody && errBody.error) return [`${errBody.error.status || errBody.error.code}: ${errBody.error.message}`];
  return errs.map(e => {
    const code = e.errorCode ? Object.entries(e.errorCode).map(([k, v]) => `${k}=${v}`).join(',') : '';
    return `${e.message}${code ? `  [${code}]` : ''}`;
  });
}

async function gaql(customerId, headers, query) {
  const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${explain(res.body).join(' | ')}`);
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  const customerId = String(GOOGLE_ADS_CUSTOMER_ID).replace(/\D/g, '');
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = adsHeaders(token);

  const queries = {
    customer_conversion_goal: `SELECT customer_conversion_goal.resource_name, customer_conversion_goal.category, customer_conversion_goal.origin, customer_conversion_goal.biddable FROM customer_conversion_goal`,
    custom_conversion_goal: `SELECT custom_conversion_goal.resource_name, custom_conversion_goal.id, custom_conversion_goal.name, custom_conversion_goal.status, custom_conversion_goal.conversion_actions FROM custom_conversion_goal`,
    conversion_action_status: `SELECT conversion_action.resource_name, conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.type, conversion_action.category FROM conversion_action ORDER BY conversion_action.id`,
    campaign_conversion_goal: `SELECT campaign_conversion_goal.resource_name, campaign_conversion_goal.category, campaign_conversion_goal.origin, campaign_conversion_goal.biddable FROM campaign_conversion_goal`,
  };

  for (const [name, q] of Object.entries(queries)) {
    console.log('\n===== ' + name + ' =====');
    try {
      const rows = await gaql(customerId, headers, q);
      if (!rows.length) { console.log('  (no rows)'); continue; }
      for (const r of rows) {
        console.log('  ' + JSON.stringify(r));
      }
    } catch (err) {
      console.log('  ERROR: ' + err.message);
    }
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
