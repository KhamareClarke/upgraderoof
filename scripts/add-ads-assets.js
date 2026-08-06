/**
 * scripts/add-ads-assets.js
 *
 * Attaches Callout Assets to campaign "Leads-Search-calls" (Customer ID: 8479028400)
 * via Google Ads API v22 REST interface.
 *
 * Run: node scripts/add-ads-assets.js
 */

const { google } = require('googleapis');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

const CALLOUTS = [
  'CORC Certified',
  '10-Yr Guarantee',
  '£10M Insured',
  'Free Written Quotes',
  'Local Cheshire Team',
];

async function getAccessToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ADS_CLIENT_ID,
    process.env.GOOGLE_ADS_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const res = await oauth2Client.getAccessToken();
  return res.token;
}

async function request(endpoint, body) {
  const token = await getAccessToken();
  const url = `https://${HOST}/${API_VERSION}/customers/${CUSTOMER_ID}/${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'developer-token': DEVELOPER_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`API Error [${response.status}]: ${JSON.stringify(json)}`);
  }
  return json;
}

async function run() {
  console.log('Attaching Callout Assets to campaign "Leads-Search-calls"...\n');

  // 1. Resolve campaign resource name
  const searchRes = await request('googleAds:searchStream', {
    query: `SELECT campaign.id, campaign.name FROM campaign WHERE campaign.name = 'Leads-Search-calls' AND campaign.status != 'REMOVED'`,
  });
  const campaign = searchRes && searchRes[0] && searchRes[0].results && searchRes[0].results[0];
  if (!campaign) throw new Error('Campaign "Leads-Search-calls" not found.');
  const campaignRN = campaign.campaign.resourceName;
  console.log(`Found campaign: ${campaign.campaign.name} (${campaignRN})\n`);

  // 2. Create the callout assets
  const assetOps = CALLOUTS.map(text => ({
    create: { calloutAsset: { calloutText: text } },
  }));
  console.log(`Creating ${CALLOUTS.length} callout assets...`);
  const assetRes = await request('assets:mutate', { operations: assetOps, partialFailure: true });
  const assetRNs = (assetRes.results || []).map(r => r.resourceName).filter(Boolean);
  assetRNs.forEach((rn, i) => console.log(`  created "${CALLOUTS[i]}": ${rn}`));
  if (assetRes.partialFailureError) {
    console.error(`  partial failure: ${assetRes.partialFailureError.message}`);
  }
  if (!assetRNs.length) throw new Error('No assets were created.');

  // 3. Link assets to the campaign as CALLOUT field type
  const linkOps = assetRNs.map(asset => ({
    create: { campaign: campaignRN, asset, fieldType: 'CALLOUT' },
  }));
  console.log(`\nLinking ${assetRNs.length} assets to campaign...`);
  const linkRes = await request('campaignAssets:mutate', { operations: linkOps, partialFailure: true });
  (linkRes.results || []).forEach(r => console.log(`  linked: ${r.resourceName}`));
  if (linkRes.partialFailureError) {
    console.error(`  partial failure: ${linkRes.partialFailureError.message}`);
  }

  console.log('\nDone: callout assets attached.');
}

run().catch(err => {
  console.error('\nScript failed:', err.message);
  process.exit(1);
});
