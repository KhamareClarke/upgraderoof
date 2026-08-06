/**
 * scripts/audit-executive-report.js
 *
 * UNIFIED EXECUTIVE AUDIT — upgraderoofs.co.uk
 *
 * Combines three data sources into one executive report:
 *   1. Google Ads API (customer 8479028400) — spend, clicks, impressions,
 *      conversions for the last 10 days vs the previous 30-day baseline.
 *   2. Google Search Console — organic impressions, clicks, avg position and
 *      top landing pages for the last 10 days. (Requires the service-account
 *      JSON; degrades gracefully with a clear notice if absent.)
 *   3. GoHighLevel CRM — actual contact/opportunity records, cross-referenced
 *      against ad-reported conversions to flag lead-capture leakage.
 *
 * Output: Paid Ads + Organic SEO + CRM lead volume, plus 30- and 90-day
 * pipeline projections at the configurable CVR benchmark.
 *
 * Run:  node scripts/audit-executive-report.js
 *
 * Auth (from .env.local):
 *   Google Ads : GOOGLE_ADS_* (OAuth refresh-token flow)
 *   GSC        : GOOGLE_APPLICATION_CREDENTIALS → service-account JSON + GSC_SITE_URL
 *   GHL        : GHL_LOCATION_ID, GHL_API_KEY
 *   Tuning     : PROJ_CVR (0.055), PROJ_AVG_DEAL_VALUE (1200),
 *                PROJ_DAILY_CLICKS (optional override)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const ghl = require('../lib/ghl-client.js');

// ── Config ───────────────────────────────────────────────────────────────────

const ADS_API_VERSION = 'v22';
const ADS_HOST = (process.env.GADS_API_HOST || 'googleads.googleapis.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');

const PROJ_CVR = parseFloat(process.env.PROJ_CVR || '0.055');
const PROJ_AVG_DEAL_VALUE = parseFloat(process.env.PROJ_AVG_DEAL_VALUE || '1200');

const SA_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-service-account.json';
const GSC_SITE = process.env.GSC_SITE_URL || 'https://www.upgraderoofs.co.uk/';

// ── Formatting helpers ───────────────────────────────────────────────────────

const hr = (t) => console.log(`\n${'='.repeat(70)}\n  ${t}\n${'='.repeat(70)}`);
const sub = (t) => console.log(`\n── ${t} ${'─'.repeat(Math.max(2, 66 - t.length))}`);
const money = (n) => `£${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n) => Number(n).toLocaleString('en-GB');
const pct = (n) => `${(n * 100).toFixed(2)}%`;
const signed = (n) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;
const arrow = (n) => (n > 0 ? '↑' : n < 0 ? '↓' : '→');

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ── Google Ads ───────────────────────────────────────────────────────────────

async function getAdsAccessToken() {
  const { GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN) {
    throw new Error('Google Ads OAuth env vars not configured');
  }
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  if (!token) throw new Error('Ads token exchange returned no access token');
  return token;
}

function adsHeaders(token) {
  const h = {
    Authorization: `Bearer ${token}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    'Content-Type': 'application/json',
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }
  return h;
}

async function gaql(headers, query) {
  const res = await fetch(`https://${ADS_HOST}/${ADS_API_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GAQL ${res.status}: ${JSON.stringify(data).slice(0, 250)}`);
  return (Array.isArray(data) ? data : [data]).flatMap((b) => b.results || []);
}

async function getAdsStats(headers, startDate, endDate) {
  const rows = await gaql(headers, `
    SELECT metrics.cost_micros, metrics.clicks, metrics.impressions,
           metrics.conversions, metrics.all_conversions
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  `);
  let costMicros = 0, clicks = 0, impressions = 0, conversions = 0, allConv = 0;
  for (const r of rows) {
    const m = r.metrics || {};
    costMicros += Number(m.costMicros || 0);
    clicks += Number(m.clicks || 0);
    impressions += Number(m.impressions || 0);
    conversions += Number(m.conversions || 0);
    allConv += Number(m.allConversions || 0);
  }
  return { startDate, endDate, spend: costMicros / 1e6, clicks, impressions, conversions, allConversions: allConv };
}

// ── Google Search Console ────────────────────────────────────────────────────

async function getGscClient() {
  const resolved = path.isAbsolute(SA_PATH) ? SA_PATH : path.join(__dirname, '..', SA_PATH);
  if (!fs.existsSync(resolved)) return { error: `service-account JSON not found at ${SA_PATH}` };
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: resolved,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    return { sc: google.searchconsole({ version: 'v1', auth }) };
  } catch (e) {
    return { error: e.message };
  }
}

async function gscQuery(sc, startDate, endDate, dimensions, rowLimit = 25) {
  const res = await sc.searchanalytics.query({
    siteUrl: GSC_SITE,
    requestBody: { startDate, endDate, dimensions, rowLimit },
  });
  return res.data.rows || [];
}

async function getGscStats(startDate, endDate) {
  const { sc, error } = await getGscClient();
  if (error) return { error };

  try {
    // Totals (aggregate by date so we can sum reliably).
    const daily = await gscQuery(sc, startDate, endDate, ['date'], 500);
    let clicks = 0, impressions = 0, posSum = 0;
    for (const r of daily) {
      clicks += r.clicks || 0;
      impressions += r.impressions || 0;
      posSum += (r.position || 0); // already weighted per-row
    }
    const avgPosition = daily.length ? posSum / daily.length : 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;

    // Top landing pages.
    const pages = await gscQuery(sc, startDate, endDate, ['page'], 10);

    return { clicks, impressions, ctr, avgPosition, pages, days: daily.length };
  } catch (e) {
    return { error: e.message };
  }
}

// ── GoHighLevel CRM ──────────────────────────────────────────────────────────

/** Count contacts created in a window via the contacts search endpoint. */
async function getGhlContacts(startDate, endDate) {
  if (!ghl.isConfigured()) return { count: null, reason: 'GHL not configured' };
  const locationId = ghl.locationId();
  const startIso = new Date(startDate + 'T00:00:00Z').toISOString();
  const endIso = new Date(endDate + 'T23:59:59Z').toISOString();

  let count = 0, page = 1;
  const limit = 100, maxPages = 50;
  try {
    while (page <= maxPages) {
      const res = await ghl.post('/contacts/search', {
        locationId,
        page,
        pageLimit: limit,
        filters: [{ field: 'dateAdded', operator: 'range', value: { gte: startIso, lte: endIso } }],
      });
      if (!res.ok) return { count: null, reason: `search HTTP ${res.status}` };
      const contacts = (res.data && res.data.contacts) || [];
      count += contacts.length;
      const total = (res.data && res.data.total) || 0;
      if (contacts.length < limit || count >= total) break;
      page += 1;
    }
    return { count };
  } catch (e) {
    return { count: null, reason: e.message };
  }
}

/** Pull every opportunity in the location (all pipelines) for pipeline value. */
async function getGhlOpportunities() {
  if (!ghl.isConfigured()) return { list: [], reason: 'GHL not configured' };
  const locationId = ghl.locationId();
  try {
    const res = await ghl.get(`/opportunities/search?location_id=${encodeURIComponent(locationId)}&limit=100`);
    if (!res.ok) return { list: [], reason: `search HTTP ${res.status}` };
    return { list: (res.data && res.data.opportunities) || [] };
  } catch (e) {
    return { list: [], reason: e.message };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  hr('UPGRADEROOFS.CO.UK — UNIFIED EXECUTIVE AUDIT');
  console.log(`  Generated : ${new Date().toISOString()}`);
  console.log(`  Ads acct  : ${CUSTOMER_ID}   |   GHL loc: ${ghl.locationId() || '(n/a)'}   |   GSC: ${GSC_SITE}`);

  const last10Start = isoDaysAgo(10), today = isoDaysAgo(0);
  const prev30Start = isoDaysAgo(40), prev30End = isoDaysAgo(11);

  // ── 1. PAID ADS ────────────────────────────────────────────────────────────
  hr('1. PAID ADS — GOOGLE ADS');

  let adsToken;
  try {
    adsToken = await getAdsAccessToken();
  } catch (e) {
    console.error(`  ❌ Google Ads auth failed: ${e.message}`);
    process.exit(1);
  }
  const headers = adsHeaders(adsToken);

  const ads10 = await getAdsStats(headers, last10Start, today);
  const ads30 = await getAdsStats(headers, prev30Start, prev30End);

  sub(`Last 10 days  (${last10Start} → ${today})`);
  console.log(`  Spend        : ${money(ads10.spend)}`);
  console.log(`  Clicks       : ${num(ads10.clicks)}`);
  console.log(`  Impressions  : ${num(ads10.impressions)}`);
  console.log(`  Conversions  : ${num(ads10.conversions)}  (all: ${num(ads10.allConversions)})`);
  console.log(`  CTR          : ${ads10.impressions ? pct(ads10.clicks / ads10.impressions) : 'n/a'}`);
  console.log(`  CPC          : ${ads10.clicks ? money(ads10.spend / ads10.clicks) : 'n/a'}`);
  console.log(`  Conv. rate   : ${ads10.clicks ? pct(ads10.conversions / ads10.clicks) : 'n/a'}`);

  sub(`Previous 30-day baseline  (${prev30Start} → ${prev30End})`);
  console.log(`  Spend        : ${money(ads30.spend)}`);
  console.log(`  Clicks       : ${num(ads30.clicks)}`);
  console.log(`  Impressions  : ${num(ads30.impressions)}`);
  console.log(`  Conversions  : ${num(ads30.conversions)}`);
  console.log(`  Conv. rate   : ${ads30.clicks ? pct(ads30.conversions / ads30.clicks) : 'n/a'}`);

  // Growth (10-day pace normalised to 30 days vs 30-day baseline).
  const pace = (v) => (v / 10) * 30;
  const growth = {
    spend: ads30.spend > 0 ? (pace(ads10.spend) - ads30.spend) / ads30.spend : NaN,
    clicks: ads30.clicks > 0 ? (pace(ads10.clicks) - ads30.clicks) / ads30.clicks : NaN,
    conversions: ads30.conversions > 0 ? (pace(ads10.conversions) - ads30.conversions) / ads30.conversions : NaN,
  };
  sub('Growth (10-day pace → 30-day-normalised vs baseline)');
  console.log(`  Spend        : ${isFinite(growth.spend) ? arrow(growth.spend) + ' ' + signed(growth.spend) : '  n/a'}`);
  console.log(`  Clicks       : ${isFinite(growth.clicks) ? arrow(growth.clicks) + ' ' + signed(growth.clicks) : '  n/a'}`);
  console.log(`  Conversions  : ${isFinite(growth.conversions) ? arrow(growth.conversions) + ' ' + signed(growth.conversions) : '  n/a (baseline 0)'}`);

  // ── 2. ORGANIC SEO — SEARCH CONSOLE ────────────────────────────────────────
  hr('2. ORGANIC SEO — GOOGLE SEARCH CONSOLE');
  const gsc = await getGscStats(last10Start, today);
  if (gsc.error) {
    console.log(`  ⚠️  Search Console unavailable: ${gsc.error}`);
    console.log(`     (Organic metrics excluded. Provide the service-account JSON at`);
    console.log(`      GOOGLE_APPLICATION_CREDENTIALS to enable this section.)`);
  } else {
    sub(`Last 10 days  (${last10Start} → ${today})`);
    console.log(`  Organic clicks      : ${num(gsc.clicks)}`);
    console.log(`  Organic impressions : ${num(gsc.impressions)}`);
    console.log(`  Organic CTR         : ${pct(gsc.ctr)}`);
    console.log(`  Avg position        : ${gsc.avgPosition.toFixed(1)}`);
    if (gsc.pages && gsc.pages.length) {
      sub('Top landing pages (organic)');
      gsc.pages.slice(0, 8).forEach((p) => {
        const url = (p.keys[0] || '').replace(GSC_SITE, '/') || '/';
        console.log(`  ${url.slice(0, 44).padEnd(44)} ${String(p.clicks).padStart(4)} clicks  ${String(p.impressions).padStart(5)} impr  pos ${p.position.toFixed(1)}`);
      });
    }
  }

  // ── 3. CRM — GOHIGHLEVEL ───────────────────────────────────────────────────
  hr('3. CRM — GOHIGHLEVEL LEAD VOLUME');
  const crm10 = await getGhlContacts(last10Start, today);
  const crm30 = await getGhlContacts(prev30Start, prev30End);
  const opps = await getGhlOpportunities();

  sub(`Contacts created — last 10 days  (${last10Start} → ${today})`);
  console.log(`  ${crm10.count != null ? num(crm10.count) : `n/a (${crm10.reason})`}`);
  sub(`Contacts created — previous 30 days  (${prev30Start} → ${prev30End})`);
  console.log(`  ${crm30.count != null ? num(crm30.count) : `n/a (${crm30.reason})`}`);
  sub('Open opportunities (all pipelines)');
  console.log(`  ${opps.list.length ? num(opps.list.length) : `0${opps.reason ? ` (${opps.reason})` : ''}`}`);

  // Cross-reference Ads-reported conversions vs real CRM records.
  sub('⚖️  LEAD-CAPTURE CROSS-REFERENCE (Ads vs CRM)');
  const adsConv = Math.round(ads10.conversions);
  const crmCount = crm10.count;
  if (crmCount != null) {
    console.log(`  Ads conversions (10d) : ${adsConv}`);
    console.log(`  GHL contacts   (10d) : ${crmCount}`);
    if (adsConv !== crmCount) {
      const gap = adsConv - crmCount;
      console.log(`  ⚠️  DISCREPANCY: ${gap > 0 ? gap : -gap} ${gap > 0 ? 'more in Ads than CRM' : 'more in CRM than Ads'}.`);
      if (gap > 0) {
        console.log(`     Ad-reported leads are NOT landing in the CRM. Check the`);
        console.log(`     pushLeadToGhl upsert (server logs: "[ghl] upsert ...") and`);
        console.log(`     whether offline-conversion import is inflating Ads.`);
      }
    } else {
      console.log(`  ✓ Ads and CRM agree — no lead-capture leak detected.`);
    }
  } else {
    console.log(`  (CRM unavailable — cannot cross-reference. Ads reported ${adsConv} conversions.)`);
  }

  // ── 4. UNIFIED SUMMARY + PROJECTIONS ───────────────────────────────────────
  hr('4. UNIFIED SUMMARY & PIPELINE PROJECTIONS');

  const totalLeads10 = (crmCount != null ? crmCount : adsConv);
  const organicClicks = gsc.error ? 0 : gsc.clicks;
  sub('Last 10 days — combined funnel');
  console.log(`  Paid clicks      : ${num(ads10.clicks)}`);
  console.log(`  Organic clicks   : ${gsc.error ? 'n/a' : num(organicClicks)}`);
  console.log(`  Total leads      : ${num(totalLeads10)} ${crmCount != null ? '(CRM-verified)' : '(Ads-attributed)'}`);
  console.log(`  Blended CVR      : ${ads10.clicks ? pct(totalLeads10 / ads10.clicks) : 'n/a'} (leads / paid clicks)`);

  // Projections at the CVR benchmark.
  const dailyClicks = process.env.PROJ_DAILY_CLICKS ? parseFloat(process.env.PROJ_DAILY_CLICKS) : ads10.clicks / 10;
  const dailySpend = ads10.spend / 10;
  const cpc = ads10.clicks > 0 ? ads10.spend / ads10.clicks : 0;

  sub(`Pipeline projections @ ${pct(PROJ_CVR)} CVR benchmark`);
  console.log(`  Assumptions: ${dailyClicks.toFixed(1)} paid clicks/day (pace), CPC ${money(cpc)}, avg job ${money(PROJ_AVG_DEAL_VALUE)}`);
  console.log('');
  console.log('  ┌────────────┬──────────┬──────────┬────────────┬──────────────┬─────────────────┐');
  console.log('  │  Horizon   │  Clicks  │  Leads   │  Ad Spend  │  Cost/Lead   │  Pipeline Value  │');
  console.log('  ├────────────┼──────────┼──────────┼────────────┼──────────────┼─────────────────┤');
  for (const days of [30, 90]) {
    const clicks = dailyClicks * days;
    const leads = clicks * PROJ_CVR;
    const spend = dailySpend * days;
    const cpl = leads > 0 ? spend / leads : 0;
    const pipeline = leads * PROJ_AVG_DEAL_VALUE;
    console.log(
      `  │  ${String(days + ' days').padEnd(9)} │ ${String(Math.round(clicks)).padStart(8)} │ ${leads.toFixed(1).padStart(8)} │ ${money(spend).padStart(10)} │ ${money(cpl).padStart(12)} │ ${money(pipeline).padStart(15)} │`
    );
  }
  console.log('  └────────────┴──────────┴──────────┴────────────┴──────────────┴─────────────────┘');
  console.log('\n  Leads = clicks × CVR benchmark;  pipeline = leads × avg job value.');
  console.log('  Spend assumes the current daily budget pace holds.');

  hr('EXECUTIVE AUDIT COMPLETE');
}

run().catch((e) => {
  console.error('\nFATAL:', e.message || e);
  process.exit(1);
});
