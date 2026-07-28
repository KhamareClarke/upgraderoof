/**
 * scripts/add-secondary-negatives.js
 *
 * Adds four phrase-match negative keywords to the "Leads-Search-calls"
 * campaign (customer 8479028400) via Google Ads API v22, then re-reads
 * the campaign negative list to confirm they are live.
 *
 *   "chimney sweep"
 *   "chimney repointing"
 *   "cost of new roof"
 *   "how much is a new roof"
 *
 * Run:  node scripts/add-secondary-negatives.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const CAMPAIGN_NAME = 'Leads-Search-calls';

const NEGATIVES = [
  'chimney sweep',
  'chimney repointing',
  'cost of new roof',
  'how much is a new roof',
];

function banner(t) {
  console.log('\n' + '='.repeat(64));
  console.log('  ' + t);
  console.log('='.repeat(64));
}

function request(method, path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = bodyObj ? JSON.stringify(bodyObj) : null;
    const req = https.request(
      { host: 'googleads.googleapis.com', path, method,
        headers: { ...headers, ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}) } },
      res => { let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let p; try { p = JSON.parse(d); } catch { p = { raw: d }; }
        resolve({ status: res.statusCode, body: p });
      }); }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function gaql(headers, query, label) {
  const res = await request('POST', `/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    console.error(`\n[${label}] query failed (HTTP ${res.status}):`, JSON.stringify(res.body).slice(0, 800));
    process.exit(1);
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  banner(`ADD SECONDARY NEGATIVES — ${CAMPAIGN_NAME} (${CUSTOMER_ID})`);
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  API: ${API_VERSION}`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }

  // Resolve campaign resource name
  const campRows = await gaql(headers,
    `SELECT campaign.id, campaign.resource_name FROM campaign WHERE campaign.name = '${CAMPAIGN_NAME}'`, 'campaign lookup');
  if (!campRows.length) { console.error(`Campaign "${CAMPAIGN_NAME}" not found.`); process.exit(1); }
  const campaignRN = campRows[0].campaign.resourceName;
  console.log(`Campaign: ${campaignRN}`);

  // Existing campaign negatives — skip duplicates
  const existing = await gaql(headers,
    `SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
     FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.negative = TRUE`, 'existing negatives');
  const existingSet = new Set(existing.map(r =>
    `${r.campaignCriterion.keyword.matchType}:${r.campaignCriterion.keyword.text.toLowerCase()}`));
  console.log(`Existing campaign negatives: ${existing.length}`);

  const toCreate = [];
  for (const text of NEGATIVES) {
    const key = `PHRASE:${text.toLowerCase()}`;
    if (existingSet.has(key)) {
      console.log(`  SKIP  [PHRASE] "${text}"  (already present)`);
      continue;
    }
    console.log(`  ADD   [PHRASE] "${text}"`);
    toCreate.push({ campaign: campaignRN, negative: true, keyword: { text, matchType: 'PHRASE' } });
  }

  if (!toCreate.length) {
    console.log('\nNothing to add — all four negatives already on the campaign.');
  } else {
    const res = await request('POST',
      `/${API_VERSION}/customers/${CUSTOMER_ID}/campaignCriteria:mutate`, headers,
      { operations: toCreate.map(criterion => ({ create: criterion })), partialFailure: true });
    if (res.status !== 200) {
      console.error('\nMutation FAILED:', JSON.stringify(res.body).slice(0, 1200));
      process.exit(1);
    }
    const created = (res.body.results || []).filter(r => r.resourceName);
    console.log(`\nApplied: ${created.length}/${toCreate.length} negatives created.`);
    if (res.body.partialFailureError) {
      console.error('Partial failure:', res.body.partialFailureError.message);
    }
    created.forEach(r => console.log(`  ${r.resourceName}`));
  }

  // Verify — re-read the campaign negative list
  banner('VERIFICATION — campaign negative list now contains');
  const after = await gaql(headers,
    `SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
     FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.negative = TRUE`, 'verify negatives');
  const afterSet = new Set(after.map(r =>
    `${r.campaignCriterion.keyword.matchType}:${r.campaignCriterion.keyword.text.toLowerCase()}`));

  let allPresent = true;
  for (const text of NEGATIVES) {
    const present = afterSet.has(`PHRASE:${text.toLowerCase()}`);
    if (!present) allPresent = false;
    console.log(`  ${present ? 'OK ' : 'MISSING'}  [PHRASE] "${text}"`);
  }
  console.log(`\nTotal campaign negatives now: ${after.length}`);
  console.log(allPresent
    ? '\nCONFIRMED: all four phrase-match negatives are live on the campaign.'
    : '\nWARNING: one or more negatives did not appear — check output above.');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
