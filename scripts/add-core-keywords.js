/**
 * scripts/add-core-keywords.js
 *
 * Adds the 3 core commercial PHRASE-match keywords to the primary ad group
 * of campaign "Leads-Search-calls" (customer 8479028400), with a dedicated
 * phrase-level CPC bid so they get direct Quality Score priority instead of
 * riding close-variant expansion.
 *
 * Usage:
 *   node scripts/add-core-keywords.js           -> dry run
 *   node scripts/add-core-keywords.js --apply   -> execute
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');
const CAMPAIGN_NAME = 'Leads-Search-calls';
const APPLY = process.argv.includes('--apply');

// Dedicated phrase-level CPC bid: £9.00 (in micros) — above the current
// £7–£13 average CPC band so these win auctions outright.
const KEYWORDS = [
  { text: 'roofers sandbach', bidMicros: 9000000 },
  { text: 'local roof repairs', bidMicros: 9000000 },
  { text: 'roof repairs near me', bidMicros: 9000000 },
];

function banner(t) {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + t);
  console.log('='.repeat(72));
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
    console.error(`\n[${label}] query failed (HTTP ${res.status}):`, JSON.stringify(res.body).slice(0, 600));
    return [];
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  banner(`ADD CORE PHRASE KEYWORDS — ${CAMPAIGN_NAME}`);
  console.log(`Mode: ${APPLY ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };

  // Resolve primary ad group
  const agRows = await gaql(headers,
    `SELECT ad_group.id, ad_group.name, ad_group.resource_name, ad_group.status
     FROM ad_group WHERE campaign.name = '${CAMPAIGN_NAME}' AND ad_group.status = 'ENABLED'`, 'ad group');
  if (!agRows.length) { console.error('No enabled ad group found.'); process.exit(1); }
  const adGroup = agRows[0].adGroup;
  console.log(`Ad group: ${adGroup.name}  [${adGroup.resourceName}]`);

  // Check which of the 3 already exist (any match type) in this ad group
  const existing = await gaql(headers,
    `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type
     FROM ad_group_criterion
     WHERE ad_group.resource_name = '${adGroup.resourceName}'
       AND ad_group_criterion.type = 'KEYWORD'`, 'existing keywords');
  const existingSet = new Set(existing.map(r => r.adGroupCriterion.keyword.text.toLowerCase()));

  const toCreate = KEYWORDS.filter(k => !existingSet.has(k.text.toLowerCase()));
  const skipped = KEYWORDS.filter(k => existingSet.has(k.text.toLowerCase()));

  console.log(`\nPlanned: ${toCreate.length} to add, ${skipped.length} already present`);
  for (const k of KEYWORDS) {
    const dup = existingSet.has(k.text.toLowerCase());
    console.log(`  ${dup ? 'SKIP' : 'ADD '}  "${k.text}"  [PHRASE]  bid £${(k.bidMicros / 1e6).toFixed(2)}`);
  }

  if (toCreate.length && APPLY) {
    const operations = toCreate.map(k => ({
      create: {
        adGroup: adGroup.resourceName,
        status: 'ENABLED',
        keyword: { text: k.text, matchType: 'PHRASE' },
        cpcBidMicros: String(k.bidMicros),
      },
    }));
    const res = await request('POST',
      `/${API_VERSION}/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, headers,
      { operations, partialFailure: true });
    if (res.status !== 200) {
      console.error('\nMutation FAILED:', JSON.stringify(res.body).slice(0, 1200));
      process.exit(1);
    }
    const created = (res.body.results || []).filter(r => r.resourceName);
    console.log(`\nApplied: ${created.length}/${toCreate.length} keywords created.`);
    created.forEach(r => console.log(`  ${r.resourceName}`));
    if (res.body.partialFailureError) {
      console.error('Partial failure:', res.body.partialFailureError.message);
    }
  } else if (toCreate.length) {
    console.log('\n(dry run — nothing written)');
  }

  // Verify final state
  banner('VERIFICATION — keywords now in ad group');
  const final = await gaql(headers,
    `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
            ad_group_criterion.cpc_bid_micros, ad_group_criterion.status
     FROM ad_group_criterion
     WHERE ad_group.resource_name = '${adGroup.resourceName}'
       AND ad_group_criterion.type = 'KEYWORD'
       AND ad_group_criterion.keyword.text IN
         ('roofers sandbach', 'local roof repairs', 'roof repairs near me')`, 'verify');
  if (!final.length) {
    console.log('  (none of the 3 target keywords found)');
  }
  for (const r of final) {
    const c = r.adGroupCriterion;
    console.log(`  "${c.keyword.text}"  [${c.keyword.matchType}]  status=${c.status}  bid=£${(Number(c.cpcBidMicros || 0) / 1e6).toFixed(2)}`);
  }

  console.log('\nDone.\n');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
