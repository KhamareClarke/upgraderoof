/**
 * scripts/add-missing-geo-targets.js
 *
 * Adds the missing Cheshire post towns (per the SEO/GEO/Ads strategy PDF) as
 * POSITIVE location targets on the Leads-Search-calls campaign
 * (customer 8479028400), via Google Ads API v22.
 *
 * Strategy primary service patch:
 *   Sandbach, Crewe, Congleton, Nantwich, Macclesfield, Wilmslow,
 *   Middlewich, Alsager, Holmes Chapel, Winsford, Northwich
 *
 * The script is idempotent: it reads current targets first and only adds
 * towns that are missing. Run:  node scripts/add-missing-geo-targets.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const CID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const CAMPAIGN = 'Leads-Search-calls';
const REQUIRED_TOWNS = [
  'Sandbach', 'Crewe', 'Congleton', 'Nantwich', 'Macclesfield', 'Wilmslow',
  'Middlewich', 'Alsager', 'Holmes Chapel', 'Winsford', 'Northwich',
];

function banner(t) {
  console.log('\n' + '='.repeat(68));
  console.log('  ' + t);
  console.log('='.repeat(68));
}

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request({ host: 'googleads.googleapis.com', path, method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => { let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let p; try { p = JSON.parse(d); } catch { p = { raw: d }; }
        resolve({ status: res.statusCode, body: p }); }); });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function gaql(headers, query, label) {
  const res = await post(`/v22/customers/${CID}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    console.error(`[${label}] HTTP ${res.status}:`, JSON.stringify(res.body).slice(0, 600));
    return [];
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  banner(`ADD MISSING GEO-TARGETS — ${CAMPAIGN} (${CID})`);

  const o = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  o.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await o.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN, 'Content-Type': 'application/json' };

  // Campaign resource name
  const campRows = await gaql(headers, `SELECT campaign.resource_name FROM campaign WHERE campaign.name = '${CAMPAIGN}'`, 'campaign');
  const campaignRN = campRows[0] && campRows[0].campaign.resourceName;
  if (!campaignRN) { console.error(`Campaign "${CAMPAIGN}" not found.`); process.exit(1); }
  console.log(`Campaign: ${campaignRN}`);

  // Current location targets → readable names
  const locRows = await gaql(headers,
    `SELECT campaign_criterion.location.geo_target_constant FROM campaign_criterion WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.type = 'LOCATION' AND campaign_criterion.negative = FALSE`, 'current targets');
  const consts = [...new Set(locRows.map(r => r.campaignCriterion.location.geoTargetConstant).filter(Boolean))];
  const currentNames = new Set();
  if (consts.length) {
    const gr = await gaql(headers,
      `SELECT geo_target_constant.resource_name, geo_target_constant.name FROM geo_target_constant WHERE geo_target_constant.resource_name IN (${consts.map(c => `'${c}'`).join(',')})`, 'geo names');
    gr.forEach(r => currentNames.add(r.geoTargetConstant.name));
  }
  console.log(`Current targets (${currentNames.size}): ${[...currentNames].join(', ') || '(none)'}`);

  const missing = REQUIRED_TOWNS.filter(t => !currentNames.has(t));
  if (!missing.length) {
    console.log('\nAll strategy towns already targeted. Nothing to do.');
    return;
  }
  console.log(`Missing (${missing.length}): ${missing.join(', ')}`);

  // Resolve each missing town's geo_target_constant (City, GB)
  banner('RESOLVING GEO TARGET CONSTANTS');
  const toAdd = [];
  for (const town of missing) {
    const rows = await gaql(headers,
      `SELECT geo_target_constant.resource_name, geo_target_constant.name, geo_target_constant.target_type, geo_target_constant.country_code FROM geo_target_constant WHERE geo_target_constant.name = '${town}' AND geo_target_constant.country_code = 'GB'`, `lookup ${town}`);
    // Prefer a City target; fall back to first GB match
    const city = rows.find(r => r.geoTargetConstant.targetType === 'City') || rows[0];
    if (!city) { console.log(`  ✗ ${town}: no GB geo_target_constant found — SKIPPED`); continue; }
    const g = city.geoTargetConstant;
    console.log(`  ✓ ${town} → ${g.resourceName} (${g.targetType})`);
    toAdd.push({ town, resourceName: g.resourceName });
  }

  if (!toAdd.length) { console.error('\nNo towns could be resolved. Aborting.'); process.exit(1); }

  // Add as positive location targets
  banner(`ADDING ${toAdd.length} POSITIVE LOCATION TARGETS`);
  const operations = toAdd.map(t => ({ create: { campaign: campaignRN, negative: false, location: { geoTargetConstant: t.resourceName } } }));
  const res = await post(`/v22/customers/${CID}/campaignCriteria:mutate`, headers, { operations, partialFailure: true });
  if (res.status !== 200) {
    console.error('Mutation FAILED:', JSON.stringify(res.body).slice(0, 1000));
    process.exit(1);
  }
  const created = (res.body.results || []).filter(r => r.resourceName);
  console.log(`Applied: ${created.length}/${toAdd.length} targets created.`);
  created.forEach((r, i) => console.log(`  ✓ ${toAdd[i] ? toAdd[i].town : ''}  ${r.resourceName}`));
  if (res.body.partialFailureError) {
    console.error('Partial failure:', JSON.stringify(res.body.partialFailureError).slice(0, 600));
  }

  // Verify
  banner('VERIFICATION — final target list');
  const after = await gaql(headers,
    `SELECT campaign_criterion.location.geo_target_constant FROM campaign_criterion WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.type = 'LOCATION' AND campaign_criterion.negative = FALSE`, 'verify');
  const afterConsts = [...new Set(after.map(r => r.campaignCriterion.location.geoTargetConstant).filter(Boolean))];
  const afterNames = new Set();
  if (afterConsts.length) {
    const gr = await gaql(headers,
      `SELECT geo_target_constant.resource_name, geo_target_constant.name FROM geo_target_constant WHERE geo_target_constant.resource_name IN (${afterConsts.map(c => `'${c}'`).join(',')})`, 'verify names');
    gr.forEach(r => afterNames.add(r.geoTargetConstant.name));
  }
  const stillMissing = REQUIRED_TOWNS.filter(t => !afterNames.has(t));
  console.log(`Total targets now: ${afterNames.size}`);
  console.log(`Towns: ${[...afterNames].sort().join(', ')}`);
  console.log(stillMissing.length
    ? `\nWARNING — still missing: ${stillMissing.join(', ')}`
    : '\nCONFIRMED: all 11 strategy towns are now targeted.');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
