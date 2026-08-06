/**
 * scripts/convert-broad-to-phrase-fix.js
 *
 * Corrects the broad→phrase conversion for campaign Leads-Search-calls.
 *
 * The earlier apply run (apply-ads-optimizations.js) left duplicate
 * broad+phrase keyword pairs because its `remove` operations used an object
 * instead of a scalar resource-name string (Google Ads API v22 `remove`
 * requires a scalar). This script:
 *
 *   1. Reads every active keyword in the campaign.
 *   2. For each BROAD keyword:
 *        - if a PHRASE/EXACT twin with the same text already exists in that
 *          ad group  -> remove the BROAD one only (no create, avoids dup).
 *        - if no twin exists -> remove the BROAD one AND create a PHRASE twin.
 *   3. Uses string resource names for removes.
 *
 * Usage:
 *   node scripts/convert-broad-to-phrase-fix.js            -> DRY RUN
 *   node scripts/convert-broad-to-phrase-fix.js --apply    -> executes
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');
const CAMPAIGN_RESOURCE = `customers/${CUSTOMER_ID}/campaigns/23665573813`;
const APPLY = process.argv.includes('--apply');
const AD_GROUP_ID = '198054175887';

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
    console.error(`\n[${label}] query failed (HTTP ${res.status}):`, JSON.stringify(res.body).slice(0, 600));
    return [];
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  console.log('='.repeat(78));
  console.log('  BROAD → PHRASE FIX  | ' + CAMPAIGN_RESOURCE);
  console.log('  Mode: ' + (APPLY ? '*** APPLY — LIVE WRITES ***' : 'DRY RUN (--apply to execute)'));
  console.log('='.repeat(78));

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };

  // Fetch all active keywords across the campaign.
  const rows = await gaql(headers,
    `SELECT ad_group_criterion.resource_name, ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type, ad_group_criterion.status, ad_group.name
     FROM ad_group_criterion
     WHERE campaign.resource_name = '${CAMPAIGN_RESOURCE}'
       AND ad_group_criterion.type = 'KEYWORD'`, 'keywords');

  const broad = rows.filter(r => r.adGroupCriterion.keyword.matchType === 'BROAD');
  // Map lowercased text -> set of non-BROAD match types present in each ad group.
  const twinTexts = new Set();
  for (const r of rows) {
    if (r.adGroupCriterion.keyword.matchType !== 'BROAD') {
      twinTexts.add(`${r.adGroup.name}|${r.adGroupCriterion.keyword.text.toLowerCase()}`);
    }
  }

  console.log(`\nActive keywords: ${rows.length}  |  BROAD: ${broad.length}`);

  const operations = [];
  const plan = [];
  for (const r of broad) {
    const text = r.adGroupCriterion.keyword.text;
    const adGroup = r.adGroup.name || 'adGroup ' + AD_GROUP_ID;
    const rn = r.adGroupCriterion.resourceName;
    const hasTwin = twinTexts.has(`${adGroup}|${text.toLowerCase()}`);
    plan.push({ text, adGroup, rn, hasTwin });

    operations.push({ remove: rn });   // scalar string — required by API
    if (!hasTwin) {
      operations.push({
        create: {
          adGroup: `customers/${CUSTOMER_ID}/adGroups/${AD_GROUP_ID}`,
          keyword: { text, matchType: 'PHRASE' },
        },
      });
    }
  }

  let removesPlanned = broad.length;
  let createsPlanned = broad.filter(b => !twinTexts.has(`${b.adGroup.name || 'adGroup ' + AD_GROUP_ID}|${b.adGroupCriterion.keyword.text.toLowerCase()}`)).length;
  console.log(`\nPlan: remove ${removesPlanned} BROAD keywords, create ${createsPlanned} PHRASE twins (rest already have twins).`);
  plan.forEach(p => console.log(`  ${p.hasTwin ? 'REMOVE-only' : 'REMOVE+CREATE'}  ${p.text.padEnd(28)} (${p.adGroup})`));

  if (!operations.length) { console.log('\nNo BROAD keywords to convert.'); return; }

  if (!APPLY) { console.log('\n(dry run — nothing written)'); return; }

  const res = await request('POST',
    `/${API_VERSION}/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, headers,
    { operations, partialFailure: true });

  if (res.status !== 200) {
    console.error('\nMutation HTTP ' + res.status + ':', JSON.stringify(res.body).slice(0, 1500));
    return;
  }
  const results = res.body.results || [];
  const failures = (res.body.partialFailureError ? [res.body.partialFailureError.message] : []);
  // Each success returns a created/removed resource name.
  const ok = results.filter(x => x.resourceName && !x.errorIndex).length;
  console.log(`\nResults: ${ok}/${operations.length} operations succeeded.`);
  if (failures.length) console.error('Partial failures:', failures.join(' | '));
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
