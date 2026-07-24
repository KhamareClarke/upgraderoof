/**
 * scripts/add-price-assets-and-tune.js
 *
 * Google Ads API v22 tuning for campaign "Leads-Search-calls" (Customer 8479028400):
 *   1. Create + attach Price Assets (roofing service price points).
 *   2. Add phrase negatives to block low-ticket gutter-only spend.
 *   3. Ensure Congleton (CW12) location bid modifier is neutral (1.0 = 100% impression share).
 *   4. Verify + print execution report.
 *
 * Run:  node scripts/add-price-assets-and-tune.js           -> dry run
 *       node scripts/add-price-assets-and-tune.js --apply   -> execute
 */

const { google } = require('googleapis');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const CAMPAIGN_NAME = 'Leads-Search-calls';
const APPLY = process.argv.includes('--apply');

const CONGLETON_GEO_ID = '1006648'; // Congleton (City, GB)

// Price offerings. priceMicros is in GBP micros; "Free Estimate" uses a 0 price.
// Descriptions must be <=25 chars. Each offering requires its own finalUrls.
const PRICE_OFFERINGS = [
  { header: 'Roof Leak Repair', description: 'Fast make-safe & repair', priceMicros: 150000000, url: 'https://www.upgraderoofs.co.uk/roof-repairs' },
  { header: 'Tile & Slate Repair', description: 'Matching tiles & slate', priceMicros: 195000000, url: 'https://www.upgraderoofs.co.uk/services/tile-slate-roofing' },
  { header: 'EPDM Flat Roof', description: '20-yr waterproof guar.', priceMicros: 450000000, url: 'https://www.upgraderoofs.co.uk/services/flat-roofing' },
  { header: 'Full Roof Replacement', description: 'Free written estimate', priceMicros: 0, url: 'https://www.upgraderoofs.co.uk/new-roofs' },
];

const GUTTER_NEGATIVES = ['gutter repair', 'gutter cleaning', 'unblock gutters'];

function banner(t) {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + t);
  console.log('='.repeat(72));
}

async function getAccessToken() {
  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const res = await oauth2.getAccessToken();
  return res.token;
}

async function request(endpoint, body) {
  const token = await getAccessToken();
  const res = await fetch(`https://${HOST}/${API_VERSION}/customers/${CUSTOMER_ID}/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'developer-token': DEVELOPER_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`API Error [${res.status}] ${endpoint}: ${JSON.stringify(json)}`);
  return json;
}

async function gaql(query) {
  const res = await request('googleAds:searchStream', { query });
  return (Array.isArray(res) ? res : [res]).flatMap(b => b.results || []);
}

async function main() {
  banner(`PRICE ASSETS & CAMPAIGN TUNE — ${CAMPAIGN_NAME}`);
  console.log(`Mode: ${APPLY ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);

  // Resolve campaign
  const campRows = await gaql(`SELECT campaign.id, campaign.resource_name FROM campaign WHERE campaign.name = '${CAMPAIGN_NAME}' AND campaign.status != 'REMOVED'`);
  if (!campRows.length) throw new Error(`Campaign "${CAMPAIGN_NAME}" not found.`);
  const campaignRN = campRows[0].campaign.resourceName;
  console.log(`Campaign: ${campaignRN}`);

  // -------------------------------------------------------------------------
  banner('1. PRICE ASSET');
  const priceAsset = {
    type: 'SERVICES',
    priceQualifier: 'FROM',
    languageCode: 'en',
    priceOfferings: PRICE_OFFERINGS.map(o => ({
      header: o.header,
      description: o.description,
      price: { amountMicros: String(o.priceMicros), currencyCode: 'GBP' },
      finalUrl: o.url,
    })),
  };
  const assetCreate = { priceAsset };
  console.log('Offerings:');
  PRICE_OFFERINGS.forEach(o => console.log(`  - ${o.header}: ${o.description}`));

  let priceAssetRN = null;
  if (APPLY) {
    const res = await request('assets:mutate', { operations: [{ create: assetCreate }], partialFailure: true });
    priceAssetRN = res.results && res.results[0] && res.results[0].resourceName;
    if (!priceAssetRN) throw new Error('Price asset creation failed: ' + JSON.stringify(res));
    console.log(`\nCreated price asset: ${priceAssetRN}`);

    const linkRes = await request('campaignAssets:mutate', {
      operations: [{ create: { campaign: campaignRN, asset: priceAssetRN, fieldType: 'PRICE' } }],
      partialFailure: true,
    });
    console.log(`Linked to campaign: ${linkRes.results && linkRes.results[0] && linkRes.results[0].resourceName}`);
    if (linkRes.partialFailureError) console.error(`  link partial failure: ${linkRes.partialFailureError.message}`);
  } else {
    console.log('\n(dry run — price asset not created)');
  }

  // -------------------------------------------------------------------------
  banner('2. GUTTER PHRASE NEGATIVES');
  const existing = await gaql(
    `SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.negative = TRUE`);
  const existingSet = new Set(existing.map(r => `${r.campaignCriterion.keyword.matchType}:${r.campaignCriterion.keyword.text.toLowerCase()}`));

  const toAdd = GUTTER_NEGATIVES.filter(t => !existingSet.has(`PHRASE:${t.toLowerCase()}`));
  const skipped = GUTTER_NEGATIVES.filter(t => existingSet.has(`PHRASE:${t.toLowerCase()}`));
  GUTTER_NEGATIVES.forEach(t => console.log(`  ${skipped.includes(t) ? 'SKIP (exists)' : 'ADD'}  "${t}" [PHRASE]`));

  if (toAdd.length && APPLY) {
    const ops = toAdd.map(text => ({ create: { campaign: campaignRN, negative: true, keyword: { text, matchType: 'PHRASE' } } }));
    const res = await request('campaignCriteria:mutate', { operations: ops, partialFailure: true });
    const created = (res.results || []).filter(r => r.resourceName).length;
    console.log(`\nApplied: ${created}/${toAdd.length} negatives created.`);
    if (res.partialFailureError) console.error(`  partial failure: ${res.partialFailureError.message}`);
  } else if (toAdd.length) {
    console.log('\n(dry run — negatives not written)');
  }

  // -------------------------------------------------------------------------
  banner('3. CONGLETON (CW12) LOCATION BID MODIFIER');
  const locRows = await gaql(
    `SELECT campaign_criterion.resource_name, campaign_criterion.location.geo_target_constant, campaign_criterion.bid_modifier
     FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.type = 'LOCATION'`);
  const congleton = locRows.find(r => r.campaignCriterion.location.geoTargetConstant === `geoTargetConstants/${CONGLETON_GEO_ID}`);
  if (!congleton) {
    console.log('  WARNING: Congleton location criterion not found on campaign.');
  } else {
    const current = congleton.campaignCriterion.bidModifier;
    console.log(`  Congleton criterion: ${congleton.campaignCriterion.resourceName}`);
    console.log(`  Current bid modifier: ${current === undefined ? '(unset — defaults to 1.0 / 100%)' : current}`);
    if (current === undefined || Number(current) === 1) {
      console.log('  -> Already neutral (100% impression share). No negative adjustment present.');
    } else if (Number(current) < 1) {
      console.log(`  -> NEGATIVE adjustment detected (${current}). Resetting to 1.0...`);
      if (APPLY) {
        const res = await request('campaignCriteria:mutate', {
          operations: [{
            update: { resourceName: congleton.campaignCriterion.resourceName, bidModifier: 1 },
            updateMask: 'bidModifier',
          }],
          partialFailure: true,
        });
        if (res.partialFailureError) console.error(`  reset failed: ${res.partialFailureError.message}`);
        else console.log('  -> Reset to 1.0 (100% impression share).');
      } else {
        console.log('  -> (dry run — would reset to 1.0)');
      }
    } else {
      console.log(`  -> Positive adjustment (${current}) already in place — above 100%. Leaving as-is.`);
    }
  }

  // -------------------------------------------------------------------------
  banner('4. VERIFICATION');
  if (APPLY) {
    const assets = await gaql(
      `SELECT campaign.resource_name, campaign_asset.asset, campaign_asset.field_type, campaign_asset.status FROM campaign_asset
       WHERE campaign.resource_name = '${campaignRN}' AND campaign_asset.field_type = 'PRICE'`);
    console.log(`PRICE assets on campaign: ${assets.length}`);
    assets.forEach(a => console.log(`  - ${a.campaignAsset.asset}  [${a.campaignAsset.status}]`));

    const gutterCheck = await gaql(
      `SELECT campaign.resource_name, campaign_criterion.keyword.text FROM campaign_criterion
       WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.negative = TRUE
         AND campaign_criterion.keyword.text IN ('gutter repair','gutter cleaning','unblock gutters')`);
    console.log(`Gutter negatives present: ${gutterCheck.length}/3`);
    gutterCheck.forEach(g => console.log(`  - "${g.campaignCriterion.keyword.text}"`));
  } else {
    console.log('(dry run — run with --apply to create assets, add negatives, and verify)');
  }

  console.log('\nDone.\n');
}

main().catch(err => { console.error('\nScript failed:', err.message); process.exit(1); });
