/**
 * scripts/fix-phone-in-ad.js
 *
 * Fixes the PHONE_NUMBER_IN_AD_TEXT policy violation for customer 8479028400.
 *
 * Violation: 3 Responsive Search Ads carried the raw phone number "01270 897606"
 * in a headline, which Google policy (PROHIBITED: PHONE_NUMBER_IN_AD_TEXT) does
 * not permit in ad text. The number must instead surface via a CALL asset
 * (extension), which Google renders separately and compliantly.
 *
 * Findings that shaped this script:
 *   1. The flagged RSAs are ALL status = REMOVED — they no longer serve.
 *      Resource names:
 *        customers/8479028400/adGroupAds/190490186058~813513134042  (search-calls-form)
 *        customers/8479028400/adGroupAds/198054175887~813442324279  (Leads-Search-calls)
 *        customers/8479028400/adGroupAds/198054175887~813444727105  (Leads-Search-calls)
 *      Headlines containing the raw number:
 *        "01270 897606"                      (813513134042, 813442324279)
 *        "Call 01270 897606"                 (813444727105)
 *   2. The ENABLED replacement RSAs in BOTH campaigns already have the number
 *      scrubbed ("Call Us Today" / "Call Us For A Free Quote") and are APPROVED.
 *   3. A CALL asset (id 312401459157, phone "01270 897606", country GB) EXISTS and
 *      is associated with BOTH campaigns via fieldType CALL:
 *        campaignAssets/23665573813~312401459157~CALL
 *        campaignAssets/23312775057~312401459157~CALL
 *
 * The Google Ads API cannot re-submit or edit a REMOVED ad (removed ads are
 * immutable and permanently out of serving). The correct remediation is therefore
 * already in effect: the number lives in the CALL asset, and the serving ads are
 * clean. This script VERIFIES that state and reports it, and (in --apply mode
 * only) is a no-op for the removed ads — it will NOT attempt to mutate them,
 * because doing so would error. If a future ENABLED/PAUSED ad ever reappears
 * with a raw number in its text, this script has the sanitizer + mutate logic
 * (scrubNumbers) wired to rewrite its headlines/descriptions.
 *
 * Usage:
 *   node scripts/fix-phone-in-ad.js           # verify + report (read-only)
 *   node scripts/fix-phone-in-ad.js --apply   # same; sanitizes any ENABLED/PAUSED offenders
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

// The known phone number embedded in ad text. Also catch common variant formats.
const PHONE_REGEX = /\b\d{4,5}\s?\d{3}\s?\d{3,4}\b/;

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

// Strip any raw phone numbers from a text field. Returns the cleaned string.
function scrubPhone(text) {
  if (!text) return text;
  const cleaned = text.replace(PHONE_REGEX, '').replace(/\s{2,}/g, ' ').replace(/(Call|call)\s+$/i, '').trim();
  // If a headline becomes empty after stripping a bare number, replace it with a
  // compliant call-to-action so the asset slot count stays valid.
  if (!cleaned) return 'Call Us For A Free Quote';
  return cleaned;
}

function stripPhoneFromAssets(headlines, descriptions) {
  const newHeadlines = (headlines || []).map((h) => ({ text: scrubPhone(h.text) }));
  const newDescriptions = (descriptions || []).map((d) => ({ text: scrubPhone(d.text) }));
  return { newHeadlines, newDescriptions };
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

  console.log(`Mode: ${APPLY ? 'APPLY' : 'VERIFY (read-only)'}`);
  console.log(`Customer: ${customerId}`);
  console.log(`PHONE_NUMBER_IN_AD_TEXT remediation report\n`);

  // 1) Confirm the call asset exists.
  const callAssets = await gaql(customerId, headers,
    `SELECT asset.resource_name, asset.id, asset.call_asset.phone_number, asset.call_asset.country_code FROM asset WHERE asset.type = CALL`);
  console.log('─ Call assets in account ─');
  if (!callAssets.length) {
    console.log('  ⚠ NO CALL ASSET FOUND — phone cannot display compliantly.');
  }
  for (const r of callAssets) {
    const ca = r.asset.callAsset;
    console.log(`  ✓ asset ${r.asset.id}  phone "${ca.phoneNumber}" (${ca.countryCode})`);
  }

  // 2) Confirm the call asset is attached to the target campaigns.
  const targetCampaigns = { '23665573813': 'Leads-Search-calls', '23312775057': 'search-calls-form' };
  const callLinks = await gaql(customerId, headers,
    `SELECT campaign.id, campaign.name, campaign.status, campaign_asset.asset, campaign_asset.field_type FROM campaign_asset WHERE campaign_asset.field_type = CALL`);
  console.log('\n─ CALL asset <-> campaign links ─');
  const linked = new Set();
  for (const r of callLinks) {
    if (targetCampaigns[String(r.campaign.id)]) {
      linked.add(String(r.campaign.id));
      console.log(`  ✓ ${r.campaign.name} (${r.campaign.status}) → CALL asset ${r.campaignAsset.asset}`);
    }
  }
  for (const [id, name] of Object.entries(targetCampaigns)) {
    if (!linked.has(id)) console.log(`  ⚠ ${name} (${id}) has NO call asset attached`);
  }

  // 3) Enumerate ALL RSAs and classify phone-number offenders by status.
  const rsaRows = await gaql(customerId, headers,
    `SELECT ad_group_ad.resource_name, ad_group_ad.status, ad_group_ad.ad.id, campaign.id, campaign.name, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.policy_topic_entries FROM ad_group_ad WHERE ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD`);

  const report = {
    customerId,
    generatedAt: new Date().toISOString(),
    call_assets: callAssets.map((r) => ({ id: r.asset.id, phone: r.asset.callAsset.phoneNumber, country: r.asset.callAsset.countryCode })),
    call_links: [...linked],
    offenders: [],
    removed_flagged: [],
    enabled_clean: [],
    actions_taken: [],
  };

  for (const row of rsaRows) {
    const a = row.adGroupAd;
    const rsa = (a.ad && a.ad.responsiveSearchAd) || {};
    const headlines = (rsa.headlines || []).map((h) => h.text);
    const descriptions = (rsa.descriptions || []).map((d) => d.text);
    const allText = [...headlines, ...descriptions].join('\n');
    const hasPhone = PHONE_REGEX.test(allText);
    const ps = a.policySummary || {};
    const isFlagged = (ps.policyTopicEntries || []).some((t) => t.topic === 'PHONE_NUMBER_IN_AD_TEXT');

    if (hasPhone || isFlagged) {
      const entry = {
        resource: a.resourceName,
        campaign: row.campaign && row.campaign.name,
        campaign_id: row.campaign && row.campaign.id,
        status: a.status,
        approval_status: ps.approvalStatus,
        matched_headlines: headlines.filter((t) => PHONE_REGEX.test(t)),
      };
      if (a.status === 'REMOVED') {
        report.removed_flagged.push(entry);
      } else {
        report.offenders.push({ ...entry, headlines, descriptions });
      }
    } else if (a.status !== 'REMOVED') {
      report.enabled_clean.push({ resource: a.resourceName, campaign: row.campaign && row.campaign.name, approval_status: ps.approvalStatus });
    }
  }

  // 4) Report the removed-but-still-flagged ads (the current violation source).
  console.log('\n─ RSAs still flagged PHONE_NUMBER_IN_AD_TEXT ─');
  if (!report.removed_flagged.length && !report.offenders.length) {
    console.log('  ✓ none — all serving ads are clean');
  }
  for (const o of report.removed_flagged) {
    console.log(`  [REMOVED — not serving] ${o.resource}`);
    console.log(`      campaign=${o.campaign}  approval=${o.approval_status}`);
    console.log(`      offending headline(s): ${JSON.stringify(o.matched_headlines)}`);
    report.actions_taken.push(`No action on ${o.resource}: status REMOVED (immutable, out of serving).`);
  }

  // 5) For any ENABLED/PAUSED offender, sanitize and mutate (APPLY only).
  console.log('\n─ ENABLED/PAUSED offenders requiring text rewrite ─');
  if (!report.offenders.length) {
    console.log('  ✓ none');
  }
  for (const o of report.offenders) {
    const { newHeadlines, newDescriptions } = stripPhoneFromAssets(o.headlines.map((t) => ({ text: t })), o.descriptions.map((t) => ({ text: t })));
    console.log(`  ✗ ${o.resource}  [${o.status}] campaign=${o.campaign}`);
    console.log('      old headlines: ' + JSON.stringify(o.headlines));
    console.log('      new headlines: ' + JSON.stringify(newHeadlines.map((h) => h.text)));
    if (!APPLY) {
      report.actions_taken.push(`[dry-run] would sanitize ${o.resource}`);
      continue;
    }
    const op = {
      update: {
        resourceName: o.resource,
        ad: {
          id: o.ad_id,
          responsiveSearchAd: { headlines: newHeadlines, descriptions: newDescriptions },
        },
      },
      updateMask: 'ad',
    };
    const res = await post(`/${API_VERSION}/customers/${customerId}/adGroupAds:mutate`, headers, { operations: [op] });
    if (res.status !== 200 || !(res.body && res.body.results && res.body.results.length)) {
      const err = explainAdsError(res.body).join(' | ');
      report.actions_taken.push(`FAILED to sanitize ${o.resource}: ${err}`);
      console.error(`      ✗ mutate failed: ${err}`);
    } else {
      report.actions_taken.push(`Sanitized + re-submitted ${o.resource} for re-review`);
      console.log('      ✓ submitted for re-review');
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('RECOMMENDATION / SUMMARY');
  console.log('════════════════════════════════════════');
  console.log(`• Call asset present & linked to both campaigns: ${report.call_links.length === 2 ? 'YES ✓' : 'NO — see ⚠ above'}`);
  console.log(`• Removed-but-flagged RSAs (non-serving): ${report.removed_flagged.length}`);
  console.log(`• ENABLED/PAUSED phone offenders requiring edit: ${report.offenders.length}`);
  console.log(`• ENABLED clean RSAs: ${report.enabled_clean.length}`);
  if (report.removed_flagged.length && !report.offenders.length) {
    console.log('\nThe PHONE_NUMBER_IN_AD_TEXT flags live ONLY on REMOVED ads that no longer');
    console.log('serve. The API cannot edit/re-submit removed ads, and no serving ad carries');
    console.log('the number in its text — the compliant CALL asset renders it instead.');
    console.log('=> NO mutation is required. Serving is already correct and compliant.');
  }

  console.log('\n----- STRUCTURED REPORT (JSON) -----');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
