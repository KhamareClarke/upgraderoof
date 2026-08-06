/**
 * scripts/apply-ads-optimizations.js
 *
 * Applies live optimizations to the Upgrade Roofs Google Ads account
 * (customer 8479028400), campaign "Leads-Search-calls", via API v22:
 *
 *   1. Adds campaign-level negative keywords (broad + phrase + competitor).
 *   2. Audits active keyword match types (lists any BROAD, recommends phrase conversions).
 *   3. Verifies location targeting criteria + presence/interest setting.
 *   4. Prints a summary of everything applied.
 *
 * Usage:
 *   node scripts/apply-ads-optimizations.js            -> DRY RUN (no writes)
 *   node scripts/apply-ads-optimizations.js --apply    -> executes mutations
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');
const CAMPAIGN_NAME = 'Leads-Search-calls';
const APPLY = process.argv.includes('--apply');

// --- Negative keyword lists --------------------------------------------------
const BROAD_NEGATIVES = [
  'how to', 'diy', 'surveyor', 'calculator', 'reviews', 'supplies',
  'damp', 'sealant', 'sealer', 'sweep', 'kit', 'thatcher',
  // Non-intent / informational classes that drain spend (search-terms audit).
  'cost', 'price', 'how much', 'average',
];
const PHRASE_NEGATIVES = [
  'flat roof leak repair kit', 'damp proof', 'roof surveyor',
  'independent roofing surveyor', 'chimney sweep', 'roofing supplies',
  // High-cost, zero-conversion queries from the search-terms audit (£249/30d).
  'roof repairs near me', 'roofers near me', 'local roofing',
  'ridge tile repairs near me', 'roofing contractors near me',
  'roof installation near me', 'roofers in sandbach',
  'roofer crewe', 'roofers congleton', 'crewe roofing',
  'cost of repointing chimney', 'chimney lining near me',
  'home seal roofing contractors', 're roofing stables',
];
const COMPETITOR_NEGATIVES = [
  'lj symonds', 'cheshire roof care', 'emerton roofing', 'just roofs',
  // Competitor / misdirected brands shown in search terms.
  'sig roofing', 'sigroofing', 'keith rowley', 'coopers roofing',
  'ultimate roofing', 'b&m roofing', 'j russell roofing', 'd l evans roofing',
  'ar roofing', 'homeseal', 'low cost roofing', 'wrexham upvc',
  // Out-of-area / wrong-geo intents.
  'stoke on trent', 'warrington', 'wrexham', 'arnold roofing',
];

// Core commercial terms that should be (or stay) phrase match
const CORE_PHRASE_TERMS = [
  'roofers sandbach', 'local roof repairs', 'roofers near me', 'roof repairs near me',
  'roofer sandbach', 'roof repair sandbach', 'sandbach roofing', 'roofers crewe',
];

function banner(t) {
  console.log('\n' + '='.repeat(78));
  console.log('  ' + t);
  console.log('='.repeat(78));
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
  banner(`ADS OPTIMIZATION — ${CAMPAIGN_NAME} (${CUSTOMER_ID})`);
  console.log(`Mode: ${APPLY ? '*** APPLY — LIVE WRITES ENABLED ***' : 'DRY RUN (pass --apply to execute)'}`);
  console.log(`Date: ${new Date().toISOString()}`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };

  // Resolve campaign resource name
  const campRows = await gaql(headers,
    `SELECT campaign.id, campaign.resource_name FROM campaign WHERE campaign.name = '${CAMPAIGN_NAME}'`, 'campaign lookup');
  if (!campRows.length) { console.error(`Campaign "${CAMPAIGN_NAME}" not found.`); process.exit(1); }
  const campaignRN = campRows[0].campaign.resourceName;
  console.log(`Campaign: ${campaignRN}`);

  // ---------------------------------------------------------------------------
  // 1. Negative keywords
  // ---------------------------------------------------------------------------
  banner('1. NEGATIVE KEYWORDS');

  // Fetch existing campaign negatives to avoid duplicates
  const existing = await gaql(headers,
    `SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
     FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}' AND campaign_criterion.negative = TRUE`, 'existing negatives');
  const existingSet = new Set(existing.map(r =>
    `${r.campaignCriterion.keyword.matchType}:${r.campaignCriterion.keyword.text.toLowerCase()}`));
  console.log(`Existing campaign negatives: ${existing.length}`);

  const toCreate = [];
  const plan = [
    ...BROAD_NEGATIVES.map(t => ({ text: t, matchType: 'BROAD', group: 'broad' })),
    ...PHRASE_NEGATIVES.map(t => ({ text: t, matchType: 'PHRASE', group: 'phrase' })),
    ...COMPETITOR_NEGATIVES.map(t => ({ text: t, matchType: 'PHRASE', group: 'competitor' })),
  ];
  const skipped = [];
  for (const n of plan) {
    const key = `${n.matchType}:${n.text.toLowerCase()}`;
    if (existingSet.has(key)) { skipped.push(n); continue; }
    toCreate.push({
      campaign: campaignRN,
      negative: true,
      keyword: { text: n.text, matchType: n.matchType },
    });
  }

  console.log(`\nPlanned additions: ${toCreate.length}   (skipped ${skipped.length} already present)`);
  for (const n of plan) {
    const dup = skipped.includes(n);
    console.log(`  ${dup ? 'SKIP' : 'ADD '}  [${n.matchType.padEnd(6)}] ${n.text}${n.group === 'competitor' ? '   (competitor)' : ''}`);
  }

  let appliedNegatives = 0;
  if (toCreate.length) {
    if (APPLY) {
      const operations = toCreate.map(criterion => ({ create: criterion }));
      const res = await request('POST',
        `/${API_VERSION}/customers/${CUSTOMER_ID}/campaignCriteria:mutate`, headers,
        { operations, partialFailure: true });
      if (res.status !== 200) {
        console.error('\nNegative keyword mutation FAILED:', JSON.stringify(res.body).slice(0, 1200));
      } else {
        const results = res.body.results || [];
        const failures = (res.body.partialFailureError
          ? [res.body.partialFailureError.message] : []);
        appliedNegatives = results.filter(r => r.resourceName).length;
        console.log(`\nApplied: ${appliedNegatives}/${toCreate.length} negatives created.`);
        if (failures.length) console.error('Partial failures:', failures.join(' | '));
      }
    } else {
      console.log('\n(dry run — no negatives written)');
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Keyword match-type audit
  // ---------------------------------------------------------------------------
  banner('2. KEYWORD MATCH-TYPE AUDIT');
  const kwRows = await gaql(headers,
    `SELECT ad_group_criterion.resource_name, ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.status, ad_group.name
     FROM ad_group_criterion
     WHERE campaign.resource_name = '${campaignRN}'
       AND ad_group_criterion.type = 'KEYWORD'
       AND ad_group_criterion.status = 'ENABLED'`, 'keywords');

  const byMatch = { BROAD: [], PHRASE: [], EXACT: [] };
  for (const r of kwRows) {
    const kw = r.adGroupCriterion.keyword;
    (byMatch[kw.matchType] = byMatch[kw.matchType] || []).push(kw.text);
  }
  console.log(`Active keywords: ${kwRows.length}`);
  console.log(`  BROAD:  ${(byMatch.BROAD || []).length}`);
  console.log(`  PHRASE: ${(byMatch.PHRASE || []).length}`);
  console.log(`  EXACT:  ${(byMatch.EXACT || []).length}`);

  if ((byMatch.BROAD || []).length) {
    console.log('\n  BROAD-match keywords to convert to PHRASE:');
    for (const t of byMatch.BROAD) console.log(`    - "${t}"  ->  "${t}" (phrase)`);
  } else {
    console.log('\n  No BROAD-match keywords found — all terms are PHRASE/EXACT.');
    console.log('  Query expansion is coming from phrase-match close variants,');
    console.log('  which the negative list above is designed to constrain.');
  }

  console.log('\n  Core commercial terms — match-type coverage check:');
  const activeTexts = new Set(kwRows.map(r => r.adGroupCriterion.keyword.text.toLowerCase()));
  for (const t of CORE_PHRASE_TERMS) {
    const present = activeTexts.has(t.toLowerCase());
    console.log(`    ${present ? 'OK     ' : 'MISSING'}  "${t}"${present ? '' : '  — consider adding as PHRASE'}`);
  }

  // Convert every BROAD keyword to PHRASE match so we stop pulling semantically
  // unrelated junk (search-terms audit). Google Ads has no "update match type";
  // we remove the broad keyword and create its phrase-match twin.
  const broadRows = kwRows.filter(r => r.adGroupCriterion.keyword.matchType === 'BROAD');
  let converted = 0;
  let mtFailed = '';
  if (broadRows.length) {
    if (APPLY) {
      const operations = [];
      for (const r of broadRows) {
        const adGroupRN = r.adGroupCriterion.resourceName.split('/').slice(0, -2).join('/');
        operations.push({
          remove: {
            resourceName: r.adGroupCriterion.resourceName,
          },
        });
        operations.push({
          create: {
            adGroup: adGroupRN,
            keyword: { text: r.adGroupCriterion.keyword.text, matchType: 'PHRASE' },
          },
        });
      }
      const res = await request('POST',
        `/${API_VERSION}/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, headers,
        { operations, partialFailure: true });
      if (res.status !== 200) {
        mtFailed = JSON.stringify(res.body).slice(0, 800);
      } else {
        const failures = (res.body.partialFailureError ? [res.body.partialFailureError.message] : []);
        if (failures.length) mtFailed = failures.join(' | ');
        // Each broad keyword produces a remove + a create; count only successes.
        const ok = (res.body.results || []).filter(x => x.resourceName && !x.operation).length;
        converted = Math.floor(ok / 2);
      }
    } else {
      console.log('\n(dry run — would convert ' + broadRows.length + ' BROAD keywords to PHRASE)');
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Location targeting verification
  // ---------------------------------------------------------------------------
  banner('3. LOCATION & TARGET SETTINGS');

  const geoRows = await gaql(headers,
    `SELECT campaign_criterion.location.geo_target_constant,
            campaign_criterion.negative, campaign_criterion.resource_name
     FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}'
       AND campaign_criterion.type = 'LOCATION'`, 'geo criteria');

  if (!geoRows.length) {
    console.log('  No location criteria found — campaign may be targeting ALL locations!');
  } else {
    // Resolve geo target constant names
    const constants = geoRows.map(r => r.campaignCriterion.location.geoTargetConstant).filter(Boolean);
    for (const rn of constants) {
      const id = rn.split('/').pop();
      const nameRows = await gaql(headers,
        `SELECT geo_target_constant.name, geo_target_constant.country_code, geo_target_constant.target_type
         FROM geo_target_constant WHERE geo_target_constant.resource_name = '${rn}'`, 'geo name');
      const neg = geoRows.find(r => r.campaignCriterion.location.geoTargetConstant === rn).campaignCriterion.negative;
      if (nameRows.length) {
        const g = nameRows[0].geoTargetConstant;
        console.log(`  ${neg ? 'EXCLUDED' : 'TARGETED'}: ${g.name} (${g.targetType}, ${g.countryCode}) [id ${id}]`);
      } else {
        console.log(`  ${neg ? 'EXCLUDED' : 'TARGETED'}: ${rn}`);
      }
    }
  }

  // Presence vs interest setting lives on the campaign's geo_target_type_setting
  const settingRows = await gaql(headers,
    `SELECT campaign.geo_target_type_setting.positive_geo_target_type,
            campaign.geo_target_type_setting.negative_geo_target_type
     FROM campaign WHERE campaign.resource_name = '${campaignRN}'`, 'geo setting');
  if (settingRows.length) {
    const s = settingRows[0].campaign.geoTargetTypeSetting;
    console.log(`\n  Positive geo target type: ${s.positiveGeoTargetType}`);
    console.log(`  Negative geo target type: ${s.negativeGeoTargetType}`);
    if (s.positiveGeoTargetType === 'PRESENCE') {
      console.log('  -> GOOD: targeting people IN/REGULARLY IN the targeted area only.');
    } else if (s.positiveGeoTargetType === 'PRESENCE_OR_INTEREST') {
      console.log('  -> WARNING: "Presence or interest" — ads can show to people');
      console.log('     merely INTERESTED in the area (e.g. someone in London searching');
      console.log('     "roofers sandbach"). Recommend switching to PRESENCE.');
      if (APPLY) {
        const res = await request('POST',
          `/${API_VERSION}/customers/${CUSTOMER_ID}/campaigns:mutate`, headers,
          { operations: [{ update: {
              resourceName: campaignRN,
              geoTargetTypeSetting: { positiveGeoTargetType: 'PRESENCE' },
            }, updateMask: 'geoTargetTypeSetting.positiveGeoTargetType' }] });
        if (res.status === 200) {
          console.log('  -> APPLIED: positive geo target type set to PRESENCE.');
        } else {
          console.error('  -> Failed to update geo setting:', JSON.stringify(res.body).slice(0, 600));
        }
      } else {
        console.log('  -> (dry run — would set positiveGeoTargetType = PRESENCE)');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Summary
  // ---------------------------------------------------------------------------
  banner('4. SUMMARY');
  console.log(`Mode:                    ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log(`Negatives planned:       ${toCreate.length} (${BROAD_NEGATIVES.length} broad, ${PHRASE_NEGATIVES.length} phrase, ${COMPETITOR_NEGATIVES.length} competitor)`);
  console.log(`Negatives already there: ${skipped.length}`);
  console.log(`Negatives applied:       ${APPLY ? appliedNegatives : 0}`);
  console.log(`Broad keywords found:    ${(byMatch.BROAD || []).length}`);
  console.log(`Broad → phrase:          ${APPLY ? `${converted} converted` : (mtFailed ? `FAILED: ${mtFailed}` : `would convert ${(byMatch.BROAD || []).length}`)}`);
  if (!APPLY && toCreate.length) {
    console.log('\nRe-run with --apply to execute the mutations:');
    console.log('  node scripts/apply-ads-optimizations.js --apply\n');
  } else {
    console.log('');
  }
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
