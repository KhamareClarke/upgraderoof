/* Read-only discovery: sitelink assets + structured snippet assets for customer 8479028400. */
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

async function tryQ(customerId, headers, label, query) {
  console.log('\n===== ' + label + ' =====');
  try {
    const rows = await gaql(customerId, headers, query);
    if (!rows.length) { console.log('  (no rows)'); return []; }
    for (const r of rows) console.log('  ' + JSON.stringify(r));
    return rows;
  } catch (err) {
    console.log('  ERROR: ' + err.message);
    return [];
  }
}

async function main() {
  const customerId = String(GOOGLE_ADS_CUSTOMER_ID).replace(/\D/g, '');
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = adsHeaders(token);

  // 1) Sitelink assets (corrected field: asset.final_urls, not asset.sitelink_asset.final_urls).
  await tryQ(customerId, headers, 'sitelink assets + policy',
    `SELECT asset.resource_name, asset.id, asset.name, asset.type, asset.final_urls, asset.sitelink_asset.link_text, asset.sitelink_asset.description1, asset.sitelink_asset.description2, asset.policy_summary.approval_status, asset.policy_summary.review_status, asset.policy_summary.policy_topic_entries FROM asset WHERE asset.type = SITELINK`);

  // 2) Sitelink asset <-> campaign links.
  await tryQ(customerId, headers, 'sitelink campaign asset links',
    `SELECT campaign.id, campaign.name, campaign.status, campaign_asset.asset, campaign_asset.field_type, campaign_asset.status, campaign_asset.policy_summary.approval_status, campaign_asset.policy_summary.policy_topic_entries FROM campaign_asset WHERE campaign_asset.field_type = SITELINK`);

  // 3) Structured snippet assets (header + values + policy).
  await tryQ(customerId, headers, 'structured snippet assets',
    `SELECT asset.resource_name, asset.id, asset.name, asset.type, asset.structured_snippet_asset.header, asset.structured_snippet_asset.values, asset.policy_summary.approval_status, asset.policy_summary.policy_topic_entries FROM asset WHERE asset.type = STRUCTURED_SNIPPET`);

  // 4) Structured snippet <-> campaign links.
  await tryQ(customerId, headers, 'structured snippet campaign asset links',
    `SELECT campaign.id, campaign.name, campaign.status, campaign_asset.asset, campaign_asset.field_type, campaign_asset.status FROM campaign_asset WHERE campaign_asset.field_type = STRUCTURED_SNIPPET`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
