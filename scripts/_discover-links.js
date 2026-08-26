/* Read-only: campaign_asset sitelink links + confirm the 4 negative criteria exist. */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');
const https = require('https');
const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';
const { GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_LOGIN_CUSTOMER_ID } = process.env;
function post(path, headers, bodyObj) { return new Promise((resolve, reject) => { const body = JSON.stringify(bodyObj); const req = https.request({ host: HOST, path, method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => { let data = ''; res.on('data', c => (data += c)); res.on('end', () => { let p; try { p = JSON.parse(data); } catch { p = { raw: data }; } resolve({ status: res.statusCode, body: p }); }); }); req.on('error', reject); req.write(body); req.end(); }); }
function adsHeaders(t) { const h = { Authorization: `Bearer ${t}`, 'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN }; if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, ''); return h; }
function explain(b) { const errs = (b && b.error && b.error.details && b.error.details.flatMap(d => d.errors || [])) || []; if (!errs.length && b && b.error) return [`${b.error.status || b.error.code}: ${b.error.message}`]; return errs.map(e => { const c = e.errorCode ? Object.entries(e.errorCode).map(([k,v]) => `${k}=${v}`).join(',') : ''; return `${e.message}${c ? ` [${c}]` : ''}`; }); }
async function gaql(cid, h, q) { const res = await post(`/${API_VERSION}/customers/${cid}/googleAds:searchStream`, h, { query: q }); if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${explain(res.body).join(' | ')}`); return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []); }
async function tryQ(cid, h, label, q) { console.log('\n===== ' + label + ' ====='); try { const rows = await gaql(cid, h, q); if (!rows.length) { console.log('  (no rows)'); return []; } for (const r of rows) console.log('  ' + JSON.stringify(r)); return rows; } catch (e) { console.log('  ERROR: ' + e.message); return []; } }
async function main() {
  const cid = String(GOOGLE_ADS_CUSTOMER_ID).replace(/\D/g, '');
  const o = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET); o.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await o.getAccessToken(); const h = adsHeaders(token);

  // campaign_asset sitelink links (no policy_summary subfield)
  await tryQ(cid, h, 'sitelink campaign_asset links', `SELECT campaign.id, campaign.name, campaign.status, campaign_asset.asset, campaign_asset.field_type, campaign_asset.status FROM campaign_asset WHERE campaign_asset.field_type = SITELINK`);

  // confirm the 4 negative criteria
  await tryQ(cid, h, '4 target negative criteria (campaign_criterion)', `SELECT campaign_criterion.resource_name, campaign_criterion.negative, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type, campaign.id, campaign.name, campaign_criterion.status FROM campaign_criterion WHERE campaign.id = 23665573813 AND campaign_criterion.negative = TRUE`);

  // all ads' policy topic entries for PHONE/DESTINATION to verify what still blocks
  await tryQ(cid, h, 'ad_group_ad policy topics (non-approved)', `SELECT ad_group_ad.resource_name, ad_group_ad.status, campaign.id, campaign.name, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.policy_topic_entries FROM ad_group_ad WHERE ad_group_ad.policy_summary.approval_status != 'APPROVED'`);
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
