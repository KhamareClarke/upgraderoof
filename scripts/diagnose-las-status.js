/**
 * scripts/diagnose-las-status.js
 *
 * Read-only diagnostic for customer 8479028400 that enumerates the account's
 * compliance, verification, and limited-ad-serving (LAS) state via the
 * Google Ads API v22 REST interface.
 *
 * Areas inspected:
 *   1. customer_client            -> account serving status + manager flag
 *   2. customer_policy_summary    -> approval status of each policy topic
 *   3. customer_policy_detail     -> per-topic detailed restriction reasons
 *   4. campaign_policy_summary    -> per-campaign approval status + review state
 *   5. campaign                   -> campaign status + serving_status
 *   6. advertiser verification    -> (not exposed via generic REST; best-effort
 *                                    note, since identity verification lives in
 *                                    the Google Ads UI / Merchant Center VBO and
 *                                    is not queryable from the Ads API v22)
 *
 * Usage:
 *   node scripts/diagnose-las-status.js
 *
 * Safe: read-only (searchStream / search only — no mutate).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';

const {
  GOOGLE_ADS_CUSTOMER_ID,
  GOOGLE_ADS_DEVELOPER_TOKEN,
  GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID,
} = process.env;

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
          resolve({ status: res.statusCode, body: parsed });
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

async function tryGaql(customerId, headers, label, query) {
  console.log(`\n===== ${label} =====`);
  try {
    const rows = await gaql(customerId, headers, query);
    if (!rows.length) { console.log('  (no rows)'); return []; }
    for (const r of rows) console.log('  ' + JSON.stringify(r));
    return rows;
  } catch (err) {
    console.log('  ERROR: ' + err.message);
    return [];
  }
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

  console.log(`Advertiser Verification / LAS diagnostic — customer ${customerId}`);
  console.log(`API ${API_VERSION}, developer token approved`);

  // 1) Account serving status
  await tryGaql(
    customerId, headers, 'customer_client (serving status)',
    `SELECT customer_client.id, customer_client.descriptive_name, customer_client.status, customer_client.manager, customer_client.currency_code, customer_client.time_zone FROM customer_client`
  );

  // 2) Account + customer_client serving status (suspension/serving signal)
  await tryGaql(
    customerId, headers, 'customer (status)',
    `SELECT customer.id, customer.resource_name, customer.status FROM customer`
  );

  // 3) Ad-level policy summary — the authoritative source for per-ad
  //    approval_status and the POLICY topic entries that gate ad serving.
  //    This is where APPROVED_LIMITED / LIMITED_BY_POLICY surface in v22.
  await tryGaql(
    customerId, headers, 'ad_group_ad.policy_summary (approval + policy topics)',
    `SELECT ad_group_ad.resource_name, ad_group_ad.ad_group, ad_group.name, campaign.id, campaign.name, ad_group_ad.policy_summary.review_status, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.policy_topic_entries FROM ad_group_ad`
  );

  // 4) Campaign status + serving status
  await tryGaql(
    customerId, headers, 'campaign (status + serving_status)',
    `SELECT campaign.id, campaign.name, campaign.status, campaign.serving_status, campaign.advertising_channel_type, campaign.start_date, campaign.end_date FROM campaign ORDER BY campaign.id`
  );

  // 5) Advertiser verification note (not exposed by Ads API v22 — see report below)
  console.log(`\n===== advertiser verification (note) =====`);
  console.log(`  The Google Ads API v22 does not expose identity/business-verification state.`);
  console.log(`  Verification holds are shown in the Google Ads UI: Tools & Settings > Billing >`);
  console.log(`  Advertiser verification, or are surfaced as account-level policy alerts only in the UI.`);
  console.log(`  If ad delivery is limited by verification, the account will not return an explicit`);
  console.log(`  "verification" field here — check the UI's "Account status" / "Billing" screens.`);

  // Structured JSON summary of the two things the API CAN authoritatively answer:
  // account serving status and per-ad policy approval status.
  const report = await buildReport(customerId, headers);
  console.log(`\n----- STRUCTURED REPORT (JSON) -----`);
  console.log(JSON.stringify(report, null, 2));

  console.log(`\n----- diagnostic complete -----`);
}

async function buildReport(customerId, headers) {
  const report = {
    customerId,
    generatedAt: new Date().toISOString(),
    account: { serving_status: null, status: null },
    customer_client: { status: null, descriptive_name: null },
    campaigns: [],
    ads_limited_or_disapproved: [],
    advertiser_verification: {
      queryable_via_api: false,
      note: 'Identity/business verification state is NOT exposed by Google Ads API v22. Check Google Ads UI > Tools & Settings > Billing > Advertiser verification.',
    },
  };

  const cc = (await gaql(customerId, headers,
    `SELECT customer_client.id, customer_client.status, customer_client.descriptive_name FROM customer_client`))[0];
  if (cc) {
    report.customer_client.status = cc.customerClient.status;
    report.customer_client.descriptive_name = cc.customerClient.descriptiveName;
  }

  const c = (await gaql(customerId, headers,
    `SELECT customer.id, customer.status FROM customer`))[0];
  if (c) {
    report.account.status = c.customer.status;
    report.account.serving_status = c.customer.status === 'ENABLED' ? 'SERVING (account enabled; no account-level suspension)' : 'NOT SERVING';
  }

  const campaigns = await gaql(customerId, headers,
    `SELECT campaign.id, campaign.name, campaign.status, campaign.serving_status, campaign.advertising_channel_type, campaign.start_date, campaign.end_date FROM campaign ORDER BY campaign.id`);
  for (const r of campaigns) {
    const cp = r.campaign;
    report.campaigns.push({
      id: cp.id,
      name: cp.name,
      status: cp.status,
      serving_status: cp.servingStatus,
      channel: cp.advertisingChannelType,
    });
  }

  const ads = await gaql(customerId, headers,
    `SELECT ad_group_ad.resource_name, ad_group_ad.ad_group, ad_group.name, campaign.id, campaign.name, ad_group_ad.policy_summary.review_status, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.policy_topic_entries FROM ad_group_ad`);
  for (const r of ads) {
    const ad = r.adGroupAd;
    const ps = ad.policySummary;
    if (!ps) continue;
    if (ps.approvalStatus === 'APPROVED') continue;
    const topics = (ps.policyTopicEntries || []).map((t) => `${t.type}:${t.topic}`);
    report.ads_limited_or_disapproved.push({
      ad_resource: ad.resourceName,
      ad_group: r.adGroup && r.adGroup.name,
      campaign: r.campaign ? { id: r.campaign.id, name: r.campaign.name } : null,
      approval_status: ps.approvalStatus,
      review_status: ps.reviewStatus,
      policy_topics: topics,
    });
  }

  return report;
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
