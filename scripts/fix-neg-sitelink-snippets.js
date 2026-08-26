/**
 * scripts/fix-neg-sitelink-snippets.js
 *
 * Executes the four-part remediation for customer 8479028400:
 *
 *   1. REMOVE 4 conflicting campaign-level NEGATIVE keywords on Leads-Search-calls
 *      (23665573813) that block the core high-intent search terms:
 *         "local roofing"       -> campaignCriteria/23665573813~2917538205
 *         "roofers near me"     -> campaignCriteria/23665573813~45602160659
 *         "roof repairs near me"-> campaignCriteria/23665573813~298832605155
 *         "roofers congleton"   -> campaignCriteria/23665573813~337921324453
 *      Removal = `remove` op on campaignCriteria:mutate.
 *
 *   2. FIX the 2 DISAPPROVED sitelinks linked to the ACTIVE campaign
 *      Leads-Search-calls (23665573813):
 *         asset 340451686335  "Book Now" — DISAPPROVED (CAPITALIZATION:
 *           description1 "FREE Roof Inspection!" is all-caps). Fix = lowercase
 *           to title case and re-submit.
 *         asset 374999304909  "SL Emergency Repairs" — DISAPPROVED
 *           (DESTINATION_NOT_WORKING: final_url .../services/roof-repairs is a
 *           404; the correct path is /roof-repairs). Fix = correct the URL.
 *      Both via `update` op on assets:mutate with updateMask = sitelink_asset.

 *   3. UPDATE structured snippet 321142153330 (linked ENABLED to both search
 *      campaigns, incl. Leads-Search-calls) so its "Services" header covers
 *      the five core services: Roof Repairs, Flat Roofing, Chimney Work,
 *      Guttering, Slate Roofing. Current values are only 3 (Flat Roofing /
 *      Chimney Repair / Gutter & Fascia). `update` on assets:mutate with
 *      updateMask = structured_snippet_asset.

 *   4. VERIFICATION report — re-query the campaign_criterion negatives for the
 *      four terms to confirm they are gone, and re-query the two sitelinks to
 *      confirm they are no longer DISAPPROVED.
 *
 * Safe by default: without --apply, prints the planned operations and the
 * current state without mutating anything.
 *
 * Usage:
 *   node scripts/fix-neg-sitelink-snippets.js           # dry-run
 *   node scripts/fix-neg-sitelink-snippets.js --apply   # execute mutations
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';
const APPLY = process.argv.includes('--apply');

const {
  GOOGLE_ADS_CUSTOMER_ID,
  GOOGLE_ADS_DEVELOPER_TOKEN,
  GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID,
} = process.env;

const CAMPAIGN_ID = '23665573813'; // Leads-Search-calls (active)

// Task 1: the 4 blocking negative keywords (campaign-level PHRASE negatives).
const NEGATIVE_CRITERIA = [
  { resource: `customers/8479028400/campaignCriteria/${CAMPAIGN_ID}~2917538205`, term: 'local roofing' },
  { resource: `customers/8479028400/campaignCriteria/${CAMPAIGN_ID}~45602160659`, term: 'roofers near me' },
  { resource: `customers/8479028400/campaignCriteria/${CAMPAIGN_ID}~298832605155`, term: 'roof repairs near me' },
  { resource: `customers/8479028400/campaignCriteria/${CAMPAIGN_ID}~337921324453`, term: 'roofers congleton' },
];

// Task 2: the 2 disapproved sitelinks on the active campaign.
const SITELINK_FIXES = [
  {
    assetId: '340451686335',
    resource: 'customers/8479028400/assets/340451686335',
    action: 'FIX_CAPITALIZATION',
    linkText: 'Book Now',
    description1: 'Free Roof Inspection!',
    description2: 'Emergency Roof Repairs',
  },
  {
    assetId: '374999304909',
    resource: 'customers/8479028400/assets/374999304909',
    action: 'FIX_DESTINATION',
    linkText: 'Emergency Roof Repairs',
    description1: 'Same-day emergency response',
    description2: 'Leaks fixed fast across Cheshire',
    finalUrl: 'https://www.upgraderoofs.co.uk/roof-repairs',
  },
];

// Task 3: structured snippet asset to update (already linked ENABLED to 23665573813).
const SNIPPET_ASSET = {
  resource: 'customers/8479028400/assets/321142153330',
  id: '321142153330',
  header: 'Services',
  values: ['Roof Repairs', 'Flat Roofing', 'Chimney Work', 'Guttering', 'Slate Roofing'],
};

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      {
        host: HOST,
        path,
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
          resolve({ status: res.statusCode, body: parsed, raw: data });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function adsHeaders(accessToken) {
  const h = { Authorization: `Bearer ${accessToken}`, 'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  return h;
}

function explainAdsError(body) {
  const errs = (body && body.error && body.error.details && body.error.details.flatMap((d) => d.errors || [])) || [];
  if (!errs.length && body && body.error) return [`${body.error.status || body.error.code}: ${body.error.message}`];
  return errs.map((e) => {
    const code = e.errorCode ? Object.entries(e.errorCode).map(([k, v]) => `${k}=${v}`).join(',') : '';
    return `${e.message}${code ? `  [${code}]` : ''}`;
  });
}

async function gaql(customerId, headers, query) {
  const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${explainAdsError(res.body).join(' | ')}`);
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap((b) => b.results || []);
}

async function mutate(customerId, headers, entityName, operations) {
  const res = await post(`/${API_VERSION}/customers/${customerId}/${entityName}:mutate`, headers, { operations });
  return res;
}

async function main() {
  const customerId = String(GOOGLE_ADS_CUSTOMER_ID).replace(/\D/g, '');
  if (!/^\d{10}$/.test(customerId)) {
    console.error(`GOOGLE_ADS_CUSTOMER_ID "${GOOGLE_ADS_CUSTOMER_ID}" is not a 10-digit customer id.`);
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();
  const headers = adsHeaders(accessToken);

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (no mutations)'}`);
  console.log(`Customer: ${customerId}`);
  console.log(`Target campaign: ${CAMPAIGN_ID} (Leads-Search-calls)\n`);

  const report = {
    customerId,
    generatedAt: new Date().toISOString(),
    negatives_removed: [],
    sitelinks_fixed: [],
    snippet: null,
    verification: {},
  };

  // ── Task 1: remove the 4 negative keywords ────────────────────────────────
  console.log('══ Task 1: remove conflicting negative keywords ══');
  if (!APPLY) {
    for (const n of NEGATIVE_CRITERIA) {
      console.log(`  [dry-run] would REMOVE ${n.term}  (${n.resource})`);
      report.negatives_removed.push({ term: n.term, resource: n.resource, applied: false });
    }
  } else {
    for (const n of NEGATIVE_CRITERIA) {
      console.log(`  removing "${n.term}" ...`);
      const res = await mutate(customerId, headers, 'campaignCriteria', [{ remove: n.resource }]);
      if (res.status !== 200 || !(res.body && res.body.results && res.body.results.length)) {
        const err = explainAdsError(res.body).join(' | ');
        console.error(`    ✗ FAILED: ${err}`);
        report.negatives_removed.push({ term: n.term, resource: n.resource, applied: false, error: err });
      } else {
        const rn = (res.body.results[0].resourceName || n.resource);
        console.log(`    ✓ removed -> ${rn}`);
        report.negatives_removed.push({ term: n.term, resource: n.resource, applied: true, result: rn });
      }
    }
  }

  // ── Task 2: fix the 2 disapproved sitelinks ───────────────────────────────
  console.log('\n══ Task 2: fix disapproved sitelinks ══');
  for (const s of SITELINK_FIXES) {
    if (s.action === 'FIX_CAPITALIZATION') {
      const op = {
        update: { resourceName: s.resource, sitelinkAsset: { linkText: s.linkText, description1: s.description1, description2: s.description2 } },
        updateMask: 'sitelink_asset.link_text,sitelink_asset.description1,sitelink_asset.description2',
      };
      console.log(`  [${APPLY ? 'apply' : 'dry-run'}] asset ${s.assetId} "Book Now": lower-case desciption ("Free Roof Inspection!") and re-submit`);
      if (APPLY) {
        const res = await mutate(customerId, headers, 'assets', [op]);
        const ok = res.status === 200 && res.body && res.body.results && res.body.results.length;
        report.sitelinks_fixed.push({ assetId: s.assetId, action: s.action, applied: ok, error: ok ? null : explainAdsError(res.body).join(' | ') });
        console.log(ok ? `    ✓ submitted for re-review` : `    ✗ FAILED: ${explainAdsError(res.body).join(' | ')}`);
      } else {
        report.sitelinks_fixed.push({ assetId: s.assetId, action: s.action, applied: false });
      }
    } else if (s.action === 'FIX_DESTINATION') {
      const op = {
        update: { resourceName: s.resource, finalUrls: [s.finalUrl] },
        updateMask: 'final_urls',
      };
      console.log(`  [${APPLY ? 'apply' : 'dry-run'}] asset ${s.assetId} "Emergency Roof Repairs": correct final_url -> ${s.finalUrl}`);
      if (APPLY) {
        const res = await mutate(customerId, headers, 'assets', [op]);
        const ok = res.status === 200 && res.body && res.body.results && res.body.results.length;
        report.sitelinks_fixed.push({ assetId: s.assetId, action: s.action, applied: ok, error: ok ? null : explainAdsError(res.body).join(' | ') });
        console.log(ok ? `    ✓ submitted for re-review` : `    ✗ FAILED: ${explainAdsError(res.body).join(' | ')}`);
      } else {
        report.sitelinks_fixed.push({ assetId: s.assetId, action: s.action, applied: false });
      }
    }
  }

  // ── Task 3: update structured snippet values ──────────────────────────────
  console.log('\n══ Task 3: structured snippet (Roof Repairs / Flat Roofing / Chimney / Guttering / Slate) ══');
  const snippetOp = {
    update: { resourceName: SNIPPET_ASSET.resource, structuredSnippetAsset: { header: SNIPPET_ASSET.header, values: SNIPPET_ASSET.values } },
    updateMask: 'structured_snippet_asset.header,structured_snippet_asset.values',
  };
  console.log(`  header: "${SNIPPET_ASSET.header}"`);
  console.log(`  values: ${JSON.stringify(SNIPPET_ASSET.values)}`);
  if (APPLY) {
    const res = await mutate(customerId, headers, 'assets', [snippetOp]);
    const ok = res.status === 200 && res.body && res.body.results && res.body.results.length;
    report.snippet = { id: SNIPPET_ASSET.id, applied: ok, error: ok ? null : explainAdsError(res.body).join(' | ') };
    console.log(ok ? `    ✓ updated` : `    ✗ FAILED: ${explainAdsError(res.body).join(' | ')}`);
  } else {
    report.snippet = { id: SNIPPET_ASSET.id, applied: false };
  }

  // ── Task 4: verification ──────────────────────────────────────────────────
  console.log('\n══ Task 4: verification report ══');

  // 4a) Confirm the 4 terms no longer appear as negatives on the campaign.
  const remainingNegs = await gaql(customerId, headers,
    `SELECT campaign_criterion.resource_name, campaign_criterion.negative, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion WHERE campaign.id = ${CAMPAIGN_ID} AND campaign_criterion.negative = TRUE`);
  const keywordTexts = new Set(remainingNegs.map((r) => r.campaignCriterion.keyword && r.campaignCriterion.keyword.text));
  const negStatus = {};
  for (const n of NEGATIVE_CRITERIA) {
    negStatus[n.term] = keywordTexts.has(n.term) ? 'STILL_BLOCKED' : 'RESOLVED';
  }
  report.verification.negative_keywords = negStatus;
  console.log('  negative keywords:');
  for (const [term, st] of Object.entries(negStatus)) {
    console.log(`    ${st === 'RESOLVED' ? '✓' : '✗'} "${term}" -> ${st}`);
  }

  // 4b) Confirm the two sitelinks' approval status.
  const sitelinksNow = await gaql(customerId, headers,
    `SELECT asset.id, asset.sitelink_asset.link_text, asset.policy_summary.approval_status, asset.policy_summary.review_status, asset.final_urls FROM asset WHERE asset.type = SITELINK AND asset.id IN (340451686335, 374999304909)`);
  report.verification.sitelinks = sitelinksNow.map((r) => ({
    id: r.asset.id,
    linkText: r.asset.sitelinkAsset && r.asset.sitelinkAsset.linkText,
    approvalStatus: r.asset.policySummary && r.asset.policySummary.approvalStatus,
    reviewStatus: r.asset.policySummary && r.asset.policySummary.reviewStatus,
    finalUrls: r.asset.finalUrls,
  }));
  console.log('  sitelinks (post-fix):');
  for (const s of report.verification.sitelinks) {
    console.log(`    asset ${s.id} "${s.linkText}" -> ${s.approvalStatus} (review ${s.reviewStatus})`);
  }

  // 4c) Confirm structured snippet values.
  const snippetNow = await gaql(customerId, headers,
    `SELECT asset.id, asset.structured_snippet_asset.header, asset.structured_snippet_asset.values FROM asset WHERE asset.id = 321142153330`);
  if (snippetNow.length) {
    const a = snippetNow[0].asset;
    report.verification.snippet = { header: a.structuredSnippetAsset.header, values: a.structuredSnippetAsset.values };
    console.log(`  structured snippet: header="${a.structuredSnippetAsset.header}" values=${JSON.stringify(a.structuredSnippetAsset.values)}`);
  }

  console.log('\n----- STRUCTURED REPORT (JSON) -----');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
