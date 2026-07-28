/**
 * scripts/audit-geo-performance.js
 *
 * Geographic audit for the "Leads-Search-calls" campaign
 * (customer 8479028400), Google Ads API v22.
 *
 *   1. campaign_criterion — confirm active location targets
 *   2. geographic_view segmented by geo_target_city — last 7 days
 *      (impressions, clicks, spend, conversions per town)
 *   3. Clean terminal table of towns and their metrics
 *
 * Run:  node scripts/audit-geo-performance.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const CAMPAIGN_NAME = 'Leads-Search-calls';

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

const gbp = micros => '£' + (Number(micros || 0) / 1e6).toFixed(2);
const pct = (a, b) => (b ? (a / b * 100).toFixed(1) + '%' : '—');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  banner(`GEO PERFORMANCE AUDIT — ${CAMPAIGN_NAME} (${CUSTOMER_ID})`);
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  API: ${API_VERSION}  |  Window: last 7 days`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }

  async function gaql(query, label) {
    const res = await request('POST', `/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, headers, { query });
    if (res.status !== 200) {
      console.error(`\n[${label}] query failed (HTTP ${res.status}):`, JSON.stringify(res.body).slice(0, 900));
      return null;
    }
    return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  }

  // Resolve campaign
  const campRows = await gaql(
    `SELECT campaign.id, campaign.resource_name FROM campaign WHERE campaign.name = '${CAMPAIGN_NAME}'`, 'campaign lookup');
  if (!campRows || !campRows.length) { console.error(`Campaign "${CAMPAIGN_NAME}" not found.`); process.exit(1); }
  const campaignRN = campRows[0].campaign.resourceName;
  console.log(`Campaign: ${campaignRN}`);

  // =========================================================================
  // 1. Active location targets (campaign_criterion)
  // =========================================================================
  banner('1. ACTIVE LOCATION TARGETS (campaign_criterion)');
  const locRows = await gaql(
    `SELECT campaign_criterion.location.geo_target_constant,
            campaign_criterion.negative,
            campaign_criterion.bid_modifier
     FROM campaign_criterion
     WHERE campaign.resource_name = '${campaignRN}'
       AND campaign_criterion.type = 'LOCATION'`, 'location targets');

  if (!locRows || !locRows.length) {
    console.log('No location criteria found on the campaign.');
  } else {
    // Resolve geo_target_constant resource names to readable names
    const constants = [...new Set(locRows.map(r => r.campaignCriterion.location.geoTargetConstant).filter(Boolean))];
    const nameMap = new Map();
    if (constants.length) {
      const geoRows = await gaql(
        `SELECT geo_target_constant.resource_name, geo_target_constant.name,
                geo_target_constant.country_code, geo_target_constant.target_type
         FROM geo_target_constant
         WHERE geo_target_constant.resource_name IN (${constants.map(c => `'${c}'`).join(',')})`, 'geo constant lookup');
      (geoRows || []).forEach(r => nameMap.set(r.geoTargetConstant.resourceName, r.geoTargetConstant));
    }

    const h = 'Location'.padEnd(28) + 'Type'.padEnd(18) + 'Negative'.padEnd(10) + 'Bid mod.'.padStart(9);
    console.log(h); console.log('-'.repeat(h.length));
    for (const r of locRows) {
      const c = r.campaignCriterion;
      const rn = c.location.geoTargetConstant;
      const g = nameMap.get(rn);
      console.log(
        String(g ? g.name : rn).slice(0, 27).padEnd(28) +
        String(g ? g.targetType : '—').padEnd(18) +
        String(c.negative ? 'YES' : 'no').padEnd(10) +
        String(c.bidModifier != null ? Number(c.bidModifier).toFixed(2) : '—').padStart(9)
      );
    }
  }

  // =========================================================================
  // 2. geographic_view by city — last 7 days
  // =========================================================================
  banner('2. PERFORMANCE BY TOWN — LAST 7 DAYS (geographic_view)');
  const start = daysAgo(7), end = daysAgo(0);
  const geoPerf = await gaql(
    `SELECT campaign.name, segments.geo_target_city,
            metrics.impressions, metrics.clicks, metrics.cost_micros,
            metrics.conversions, metrics.ctr
     FROM geographic_view
     WHERE segments.date BETWEEN '${start}' AND '${end}'
       AND campaign.name = '${CAMPAIGN_NAME}'
     ORDER BY metrics.cost_micros DESC
     LIMIT 100`, 'geographic_view');

  if (geoPerf === null) {
    console.log('geographic_view query failed — see error above.');
    process.exit(1);
  }
  if (!geoPerf.length) {
    console.log('No geographic impressions recorded in the last 7 days.');
  } else {
    // Resolve city constant resource names to readable names
    const cityConstants = [...new Set(geoPerf.map(r => r.segments.geoTargetCity).filter(Boolean))];
    const cityNames = new Map();
    if (cityConstants.length) {
      const cityRows = await gaql(
        `SELECT geo_target_constant.resource_name, geo_target_constant.name,
                geo_target_constant.country_code
         FROM geo_target_constant
         WHERE geo_target_constant.resource_name IN (${cityConstants.map(c => `'${c}'`).join(',')})`, 'city lookup');
      (cityRows || []).forEach(r => cityNames.set(r.geoTargetConstant.resourceName, r.geoTargetConstant.name));
    }

    const h = 'Town / city'.padEnd(26) + 'Impr.'.padStart(7) + 'Clicks'.padStart(7) +
      'CTR'.padStart(8) + 'Spend'.padStart(10) + 'Conv.'.padStart(7);
    console.log(h); console.log('-'.repeat(h.length));

    let tImpr = 0, tClicks = 0, tCost = 0, tConv = 0;
    for (const r of geoPerf) {
      const m = r.metrics;
      const cityRN = r.segments.geoTargetCity;
      const name = cityNames.get(cityRN) || cityRN || '(unknown)';
      const impr = Number(m.impressions || 0);
      const clicks = Number(m.clicks || 0);
      const cost = Number(m.costMicros || 0);
      const conv = Number(m.conversions || 0);
      tImpr += impr; tClicks += clicks; tCost += cost; tConv += conv;
      console.log(
        String(name).slice(0, 25).padEnd(26) +
        String(impr).padStart(7) +
        String(clicks).padStart(7) +
        pct(clicks, impr).padStart(8) +
        gbp(cost).padStart(10) +
        String(conv.toFixed(1)).padStart(7)
      );
    }
    console.log('-'.repeat(h.length));
    console.log(
      'TOTAL'.padEnd(26) +
      String(tImpr).padStart(7) +
      String(tClicks).padStart(7) +
      pct(tClicks, tImpr).padStart(8) +
      gbp(tCost).padStart(10) +
      String(tConv.toFixed(1)).padStart(7)
    );

    // =========================================================================
    // 3. Summary
    // =========================================================================
    banner('3. SUMMARY');
    const top = geoPerf[0];
    const topName = cityNames.get(top.segments.geoTargetCity) || top.segments.geoTargetCity;
    console.log(`  Towns generating traffic: ${geoPerf.length}`);
    console.log(`  Top town by spend:        ${topName} (${gbp(top.metrics.costMicros)}, ${top.metrics.clicks} clicks)`);
    const convTowns = geoPerf.filter(r => Number(r.metrics.conversions || 0) > 0);
    console.log(`  Towns with conversions:   ${convTowns.length}${convTowns.length ? ' — ' + convTowns.map(r => cityNames.get(r.segments.geoTargetCity) || r.segments.geoTargetCity).join(', ') : ''}`);
    console.log('');
  }
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
