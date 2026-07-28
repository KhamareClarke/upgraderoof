/**
 * scripts/audit-recent-activity.js
 *
 * Recent-activity diagnostic for the Upgrade Roofs Google Ads account
 * (customer 8479028400), API v22.
 *
 *   1. Campaign performance — LAST_5_DAYS for "Leads-Search-calls"
 *      (impressions, clicks, spend, avg CPC, CTR, conversions)
 *   2. Search terms — last 35 days, classified against core commercial
 *      intent vs junk/negative leakage
 *   3. Conversion actions — any call / form-submit pings, LAST_5_DAYS
 *   4. Clean terminal summary: live impressions, clicks, active bids,
 *      search-term matches
 *
 * Run:  node scripts/audit-recent-activity.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const CAMPAIGN_NAME = 'Leads-Search-calls';

// Core commercial-intent phrases we WANT to match.
const CORE_INTENT = [
  /roofers?\s+sandbach/i,
  /local\s+roof\s+repairs?/i,
  /roof\s+repairs?\s+near\s+me/i,
  /roofers?\s+near\s+me/i,
  /roof\s+repairs?\s+sandbach/i,
  /roofers?\s+crewe/i,
  /roof\s+repairs?\s+crewe/i,
  /roofer/i, /roof\s+repair/i, /roofing/i, /roof\s+leak/i,
  /new\s+roof/i, /roof\s+replacement/i, /flat\s+roof/i,
  /gutter/i, /fascia/i, /soffit/i, /chimney\s+repair/i,
];

// Junk / non-commercial patterns — any spend here is leakage.
const JUNK_PATTERNS = [
  /\bdiy\b/i, /\bhow to\b/i, /\bjobs?\b/i, /\bcareers?\b/i, /\bhiring\b/i,
  /\bapprentice/i, /\bsalary\b/i, /\bwages?\b/i, /\bcourse/i, /\btraining\b/i,
  /\bqualification/i, /\bfree\b/i, /\bcheap\b/i, /\bgumtree\b/i, /\bebay\b/i,
  /\bsecond hand\b/i, /\bused\b/i, /\btool/i, /\bhire\b/i, /\brental\b/i,
  /\bscrewfix\b/i, /\bb&q\b/i, /\bwickes\b/i, /\btravis perkins\b/i,
  /\byoutube\b/i, /\bvideo\b/i, /\bpictures?\b/i, /\bphotos?\b/i, /\bimages?\b/i,
  /\binsurance claim\b/i, /\bgrant/i, /\bgovernment\b/i, /\bcouncil\b/i,
  /\bplanning permission\b/i, /\bregulations?\b/i, /\bbuilding regs\b/i,
  /\btemplate\b/i, /\bcalculator\b/i, /\bpdf\b/i, /\bforum\b/i, /\breddit\b/i,
];

function banner(t) {
  console.log('\n' + '='.repeat(74));
  console.log('  ' + t);
  console.log('='.repeat(74));
}

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      { host: 'googleads.googleapis.com', path, method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => { let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let p; try { p = JSON.parse(d); } catch { p = { raw: d }; }
        resolve({ status: res.statusCode, body: p });
      }); }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const gbp = micros => '£' + (Number(micros || 0) / 1e6).toFixed(2);
const pct = (a, b) => (b ? (a / b * 100).toFixed(2) + '%' : '—');

// GAQL has no LAST_5_DAYS / LAST_35_DAYS literal — use explicit BETWEEN dates.
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
const D5_START = daysAgo(5), D35_START = daysAgo(35), TODAY = daysAgo(0);

async function main() {
  banner('RECENT ACTIVITY AUDIT — ' + CAMPAIGN_NAME + ' (customer ' + CUSTOMER_ID + ')');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  API: ${API_VERSION}`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }

  async function gaql(query) {
    const res = await post(`/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, headers, { query });
    if (res.status !== 200) {
      const errs = (res.body && res.body.error && res.body.error.details &&
        res.body.error.details.flatMap(d => d.errors || [])) || [];
      const msg = errs.length ? errs.map(e => e.message).join(' | ')
        : (res.body && res.body.error && res.body.error.message) || JSON.stringify(res.body);
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  }

  // =========================================================================
  // 1. CAMPAIGN PERFORMANCE — LAST_5_DAYS
  // =========================================================================
  banner('1. CAMPAIGN PERFORMANCE — LAST 5 DAYS');
  const campRows = await gaql(`
    SELECT campaign.name, campaign.status,
           metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.average_cpc, metrics.ctr, metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${D5_START}' AND '${TODAY}'
      AND campaign.name = '${CAMPAIGN_NAME}'
    LIMIT 5`);

  let c5 = { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
  if (!campRows.length) {
    console.log(`No data for campaign "${CAMPAIGN_NAME}" in the last 5 days (paused or no traffic).`);
  } else {
    const h = 'Campaign'.padEnd(24) + 'Status'.padEnd(10) +
      'Impr.'.padStart(8) + 'Clicks'.padStart(8) + 'CTR'.padStart(8) +
      'Avg CPC'.padStart(10) + 'Spend'.padStart(10) + 'Conv.'.padStart(8);
    console.log(h); console.log('-'.repeat(h.length));
    for (const r of campRows) {
      const m = r.metrics, c = r.campaign;
      c5.impressions += Number(m.impressions || 0);
      c5.clicks += Number(m.clicks || 0);
      c5.costMicros += Number(m.costMicros || 0);
      c5.conversions += Number(m.conversions || 0);
      console.log(
        String(c.name).slice(0, 23).padEnd(24) +
        String(c.status).padEnd(10) +
        String(m.impressions).padStart(8) +
        String(m.clicks).padStart(8) +
        pct(m.clicks, m.impressions).padStart(8) +
        gbp(m.averageCpc).padStart(10) +
        gbp(m.costMicros).padStart(10) +
        String(Number(m.conversions || 0).toFixed(1)).padStart(8)
      );
    }
  }

  // Active bids (ad-group CPC bids + keyword bids) for context
  banner('ACTIVE BIDS — ' + CAMPAIGN_NAME);
  try {
    const bidRows = await gaql(`
      SELECT ad_group.name, ad_group.cpc_bid_micros, ad_group.status,
             ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
             ad_group_criterion.cpc_bid_micros, ad_group_criterion.status
      FROM ad_group_criterion
      WHERE campaign.name = '${CAMPAIGN_NAME}'
        AND ad_group_criterion.type = 'KEYWORD'
        AND ad_group_criterion.status = 'ENABLED'
      ORDER BY ad_group.name
      LIMIT 100`);
    if (!bidRows.length) {
      console.log('(no enabled keyword criteria returned)');
    } else {
      const h = 'Ad group'.padEnd(22) + 'Keyword'.padEnd(30) + 'Match'.padEnd(10) +
        'KW bid'.padStart(10) + 'AG bid'.padStart(10);
      console.log(h); console.log('-'.repeat(h.length));
      for (const r of bidRows) {
        const kw = r.adGroupCriterion.keyword;
        const kwBid = r.adGroupCriterion.cpcBidMicros;
        const agBid = r.adGroup.cpcBidMicros;
        console.log(
          String(r.adGroup.name).slice(0, 21).padEnd(22) +
          String(kw.text).slice(0, 29).padEnd(30) +
          String(kw.matchType).padEnd(10) +
          (kwBid ? gbp(kwBid) : '—').padStart(10) +
          (agBid ? gbp(agBid) : '—').padStart(10)
        );
      }
    }
  } catch (err) {
    console.log('(bid query failed: ' + err.message + ')');
  }

  // =========================================================================
  // 2. SEARCH TERMS — LAST 35 DAYS
  // =========================================================================
  banner('2. SEARCH TERMS — LAST 35 DAYS (live auction inspection)');
  const termRows = await gaql(`
    SELECT search_term_view.search_term,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM search_term_view
    WHERE segments.date BETWEEN '${D35_START}' AND '${TODAY}'
      AND campaign.name = '${CAMPAIGN_NAME}'
    ORDER BY metrics.cost_micros DESC
    LIMIT 500`);

  if (!termRows.length) {
    console.log('No search terms recorded impressions or clicks in the last 35 days.');
  } else {
    const byTerm = new Map();
    for (const r of termRows) {
      const t = r.searchTermView.searchTerm;
      const m = r.metrics;
      const cur = byTerm.get(t) || { term: t, impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
      cur.impressions += Number(m.impressions || 0);
      cur.clicks += Number(m.clicks || 0);
      cur.costMicros += Number(m.costMicros || 0);
      cur.conversions += Number(m.conversions || 0);
      byTerm.set(t, cur);
    }
    const terms = [...byTerm.values()].sort((a, b) => b.costMicros - a.costMicros);

    const classify = t => {
      if (JUNK_PATTERNS.some(re => re.test(t.term))) return 'JUNK';
      if (CORE_INTENT.some(re => re.test(t.term))) return 'CORE';
      return 'OTHER';
    };
    const core = terms.filter(t => classify(t) === 'CORE');
    const junk = terms.filter(t => classify(t) === 'JUNK');
    const other = terms.filter(t => classify(t) === 'OTHER');
    const sum = arr => arr.reduce((s, t) => s + t.costMicros, 0);

    const h = 'Search term'.padEnd(44) + 'Class'.padEnd(8) +
      'Impr.'.padStart(7) + 'Clicks'.padStart(7) + 'Cost'.padStart(9) + 'Conv.'.padStart(7);
    console.log(h); console.log('-'.repeat(h.length));
    for (const t of terms) {
      console.log(
        t.term.slice(0, 43).padEnd(44) +
        classify(t).padEnd(8) +
        String(t.impressions).padStart(7) +
        String(t.clicks).padStart(7) +
        gbp(t.costMicros).padStart(9) +
        String(t.conversions).padStart(7)
      );
    }

    console.log('\n-- Intent classification ----------------------------------------------');
    console.log(`  CORE commercial intent : ${core.length} terms, ${gbp(sum(core))} spend`);
    console.log(`  JUNK / negative leakage: ${junk.length} terms, ${gbp(sum(junk))} spend  <-- recoverable`);
    console.log(`  OTHER (unclassified)   : ${other.length} terms, ${gbp(sum(other))} spend`);
    if (junk.length) {
      console.log('\n  Leaked-to terms to add as negatives:');
      junk.forEach(t => console.log(`    ✗ "${t.term}" — ${gbp(t.costMicros)}, ${t.clicks} clicks`));
    }
  }

  // =========================================================================
  // 3. CONVERSION ACTIONS — LAST 5 DAYS
  // =========================================================================
  banner('3. CONVERSION ACTIONS — LAST 5 DAYS (calls / form submits)');
  try {
    // metrics.conversions is incompatible with FROM conversion_action; segment by
    // conversion_action_name from the campaign resource instead.
    const convRows = await gaql(`
      SELECT segments.conversion_action_name,
             segments.conversion_action_category,
             metrics.conversions, metrics.all_conversions
      FROM campaign
      WHERE segments.date BETWEEN '${D5_START}' AND '${TODAY}'
        AND campaign.name = '${CAMPAIGN_NAME}'
        AND metrics.conversions > 0
      ORDER BY metrics.conversions DESC
      LIMIT 50`);
    if (!convRows.length) {
      console.log('No conversion pings (calls or form submits) recorded in the last 5 days.');
    } else {
      const h = 'Conversion action'.padEnd(34) + 'Category'.padEnd(22) +
        'Conv.'.padStart(8) + 'All conv.'.padStart(10);
      console.log(h); console.log('-'.repeat(h.length));
      for (const r of convRows) {
        const s = r.segments, m = r.metrics;
        console.log(
          String(s.conversionActionName || '—').slice(0, 33).padEnd(34) +
          String(s.conversionActionCategory || '—').padEnd(22) +
          String(Number(m.conversions || 0).toFixed(1)).padStart(8) +
          String(Number(m.allConversions || 0).toFixed(1)).padStart(10)
        );
      }
      console.log(`\n  Pings in last 5 days: ${convRows.length} conversion action(s) fired.`);
    }
  } catch (err) {
    console.log('(conversion query failed: ' + err.message + ')');
    console.log('  Falling back to campaign-level conversion totals (see section 1).');
  }

  // =========================================================================
  // 4. SUMMARY
  // =========================================================================
  banner('4. SUMMARY — LAST 5 DAYS');
  const cpc = c5.clicks ? c5.costMicros / c5.clicks : 0;
  console.log(`  Live impressions:    ${c5.impressions}`);
  console.log(`  Clicks:              ${c5.clicks}`);
  console.log(`  CTR:                 ${pct(c5.clicks, c5.impressions)}`);
  console.log(`  Spend:               ${gbp(c5.costMicros)}`);
  console.log(`  Avg CPC:             ${gbp(cpc)}`);
  console.log(`  Recorded conversions:${' '}${Number(c5.conversions).toFixed(1)}`);
  console.log('');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
