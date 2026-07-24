/**
 * scripts/audit-historical-performance.js
 *
 * Historical month-by-month audit of the Upgrade Roofs Google Ads account
 * (customer 8479028400), Feb 2026 → Jul 2026, via Google Ads API v22.
 *
 * Pulls:
 *   1. Account-level monthly metrics (impr / clicks / CTR / CPC / cost / conv / CPA)
 *   2. Monthly conversion-action breakdown (call leads vs form requests etc.)
 *   3. Campaign-level monthly metrics
 *   4. Search-term-level monthly metrics (March vs recent — broad-match drift)
 *
 * Run:  node scripts/audit-historical-performance.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const API_VERSION = 'v22';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');

const START = '2026-02-01';
const END = '2026-07-31'; // July is partial (today is 2026-07-24) — flagged in output
const MONTHS = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
const MONTH_LABELS = {
  '2026-02': 'Feb 2026', '2026-03': 'Mar 2026', '2026-04': 'Apr 2026',
  '2026-05': 'May 2026', '2026-06': 'Jun 2026', '2026-07': 'Jul 2026*',
};

function banner(t) {
  console.log('\n' + '='.repeat(86));
  console.log('  ' + t);
  console.log('='.repeat(86));
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
const num = v => Number(v || 0);
// segments.month comes back as a full date string ("2026-03-01") — take "YYYY-MM".
const monthKey = seg => String(seg.month).slice(0, 7);

async function gaql(postFn, headers, query, label) {
  const res = await postFn(`/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    console.error(`\n[${label}] query failed (HTTP ${res.status}):`, JSON.stringify(res.body).slice(0, 500));
    return [];
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  banner('HISTORICAL PERFORMANCE AUDIT — Upgrade Roofs (customer ' + CUSTOMER_ID + ')');
  console.log(`Window: ${START} → ${END}   (* Jul 2026 is partial — today is ${new Date().toISOString().slice(0, 10)})`);

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN };

  // -------------------------------------------------------------------------
  // 1. Account-level monthly metrics
  // -------------------------------------------------------------------------
  const monthlyRows = await gaql(post, headers, `
    SELECT segments.month, segments.year,
           metrics.impressions, metrics.clicks, metrics.ctr,
           metrics.average_cpc, metrics.cost_micros, metrics.conversions
    FROM customer
    WHERE segments.date BETWEEN '${START}' AND '${END}'
    ORDER BY segments.year, segments.month`, 'monthly account');

  const byMonth = {};
  for (const r of monthlyRows) {
    const key = monthKey(r.segments);
    const m = r.metrics;
    byMonth[key] = {
      impressions: num(m.impressions), clicks: num(m.clicks), ctr: num(m.ctr),
      avgCpcMicros: num(m.averageCpc), costMicros: num(m.costMicros), conversions: num(m.conversions),
    };
  }

  banner('1. MONTH-BY-MONTH ACCOUNT PERFORMANCE');
  const h1 = 'Month'.padEnd(10) + 'Impr.'.padStart(8) + 'Clicks'.padStart(7) + 'CTR'.padStart(7)
    + 'Avg CPC'.padStart(9) + 'Spend'.padStart(10) + 'Conv.'.padStart(7) + 'CPA'.padStart(10);
  console.log(h1); console.log('-'.repeat(h1.length));
  for (const k of MONTHS) {
    const d = byMonth[k];
    if (!d) { console.log(MONTH_LABELS[k].padEnd(10) + '(no data)'); continue; }
    const cpa = d.conversions > 0 ? gbp(d.costMicros / d.conversions) : '—';
    console.log(
      MONTH_LABELS[k].padEnd(10) +
      String(d.impressions).padStart(8) +
      String(d.clicks).padStart(7) +
      (d.ctr * 100).toFixed(1).padStart(6) + '%' +
      gbp(d.avgCpcMicros).padStart(9) +
      gbp(d.costMicros).padStart(10) +
      String(d.conversions).padStart(7) +
      cpa.padStart(10)
    );
  }

  // -------------------------------------------------------------------------
  // 2. Monthly conversion-action breakdown
  // -------------------------------------------------------------------------
  const convRows = await gaql(post, headers, `
    SELECT segments.month, segments.year, segments.conversion_action_name,
           metrics.conversions, metrics.all_conversions
    FROM customer
    WHERE segments.date BETWEEN '${START}' AND '${END}'
    ORDER BY segments.year, segments.month, metrics.conversions DESC`, 'conversion actions');

  const convByMonth = {};
  for (const r of convRows) {
    const key = monthKey(r.segments);
    (convByMonth[key] = convByMonth[key] || []).push({
      action: r.segments.conversionActionName || '(unknown)',
      conversions: num(r.metrics.conversions),
      allConversions: num(r.metrics.allConversions),
    });
  }

  banner('2. CONVERSION ACTIONS BY MONTH (which signals fired)');
  for (const k of MONTHS) {
    const rows = convByMonth[k] || [];
    console.log(`\n  ${MONTH_LABELS[k]}`);
    if (!rows.length) { console.log('    (no conversion pings recorded)'); continue; }
    for (const r of rows) {
      console.log(`    ${r.action.padEnd(46)} conv: ${String(r.conversions).padStart(5)}  all-conv: ${r.allConversions}`);
    }
  }

  // -------------------------------------------------------------------------
  // 3. Campaign-level monthly metrics
  // -------------------------------------------------------------------------
  const campRows = await gaql(post, headers, `
    SELECT segments.month, segments.year, campaign.name, campaign.status,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${START}' AND '${END}'
    ORDER BY segments.year, segments.month, metrics.cost_micros DESC`, 'campaign monthly');

  const campByMonth = {};
  for (const r of campRows) {
    const key = monthKey(r.segments);
    (campByMonth[key] = campByMonth[key] || []).push({
      campaign: r.campaign.name, status: r.campaign.status,
      impressions: num(r.metrics.impressions), clicks: num(r.metrics.clicks),
      costMicros: num(r.metrics.costMicros), conversions: num(r.metrics.conversions),
    });
  }

  banner('3. CAMPAIGN-LEVEL MONTHLY METRICS');
  for (const k of MONTHS) {
    const rows = campByMonth[k] || [];
    console.log(`\n  ${MONTH_LABELS[k]}`);
    if (!rows.length) { console.log('    (no campaign activity)'); continue; }
    const hc = '    Campaign'.padEnd(34) + 'Status'.padEnd(9) + 'Impr.'.padStart(7) + 'Clicks'.padStart(7) + 'Spend'.padStart(10) + 'Conv.'.padStart(6);
    console.log(hc);
    for (const r of rows) {
      console.log(
        ('    ' + r.campaign).slice(0, 33).padEnd(34) +
        String(r.status).padEnd(9) +
        String(r.impressions).padStart(7) +
        String(r.clicks).padStart(7) +
        gbp(r.costMicros).padStart(10) +
        String(r.conversions).padStart(6)
      );
    }
  }

  // -------------------------------------------------------------------------
  // 4. Search-term monthly metrics (March vs recent — query drift)
  // -------------------------------------------------------------------------
  const stRows = await gaql(post, headers, `
    SELECT segments.month, segments.year, search_term_view.search_term,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM search_term_view
    WHERE segments.date BETWEEN '${START}' AND '${END}'
    ORDER BY segments.year, segments.month, metrics.cost_micros DESC
    LIMIT 2000`, 'search terms monthly');

  const stByMonth = {};
  for (const r of stRows) {
    const key = monthKey(r.segments);
    const term = r.searchTermView.searchTerm;
    const bucket = (stByMonth[key] = stByMonth[key] || {});
    const cur = bucket[term] || { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
    cur.impressions += num(r.metrics.impressions);
    cur.clicks += num(r.metrics.clicks);
    cur.costMicros += num(r.metrics.costMicros);
    cur.conversions += num(r.metrics.conversions);
    bucket[term] = cur;
  }

  banner('4. SEARCH TERMS BY MONTH — TOP SPENDERS');
  for (const k of MONTHS) {
    const bucket = stByMonth[k] || {};
    const terms = Object.entries(bucket).sort((a, b) => b[1].costMicros - a[1].costMicros);
    const totCost = terms.reduce((s, [, v]) => s + v.costMicros, 0);
    const totConv = terms.reduce((s, [, v]) => s + v.conversions, 0);
    console.log(`\n  ${MONTH_LABELS[k]} — ${terms.length} unique terms, disclosed spend ${gbp(totCost)}, ${totConv} conv`);
    const hs = '    Term'.padEnd(46) + 'Impr.'.padStart(6) + 'Clicks'.padStart(7) + 'Spend'.padStart(9) + 'Conv.'.padStart(6);
    console.log(hs);
    for (const [term, v] of terms.slice(0, 15)) {
      console.log(
        ('    ' + term).slice(0, 45).padEnd(46) +
        String(v.impressions).padStart(6) +
        String(v.clicks).padStart(7) +
        gbp(v.costMicros).padStart(9) +
        String(v.conversions).padStart(6)
      );
    }
    if (terms.length > 15) console.log(`    ... +${terms.length - 15} more terms`);
  }

  // -------------------------------------------------------------------------
  // 5. March vs recent — drift analysis
  // -------------------------------------------------------------------------
  banner('5. MARCH vs RECENT — WHAT CHANGED');

  const marchTerms = stByMonth['2026-03'] || {};
  const recentKeys = ['2026-05', '2026-06', '2026-07'];
  const recentTerms = {};
  for (const k of recentKeys) {
    for (const [term, v] of Object.entries(stByMonth[k] || {})) {
      const cur = recentTerms[term] || { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
      cur.impressions += v.impressions; cur.clicks += v.clicks;
      cur.costMicros += v.costMicros; cur.conversions += v.conversions;
      recentTerms[term] = cur;
    }
  }

  const marchSet = new Set(Object.keys(marchTerms));
  const recentSet = new Set(Object.keys(recentTerms));
  const newInRecent = [...recentSet].filter(t => !marchSet.has(t));
  const goneFromMarch = [...marchSet].filter(t => !recentSet.has(t));

  console.log(`\n  Query footprint:`);
  console.log(`    March 2026 unique terms:              ${marchSet.size}`);
  console.log(`    Recent (May–Jul) unique terms:        ${recentSet.size}`);
  console.log(`    NEW terms appearing after March:      ${newInRecent.length}  (broad-match expansion signal)`);
  console.log(`    March terms no longer appearing:      ${goneFromMarch.length}`);

  if (newInRecent.length) {
    const ranked = newInRecent
      .map(t => [t, recentTerms[t]])
      .sort((a, b) => b[1].costMicros - a[1].costMicros);
    console.log(`\n  Top NEW queries (post-March) by spend:`);
    for (const [t, v] of ranked.slice(0, 15)) {
      console.log(`    + "${t}"  — ${v.clicks} clicks, ${gbp(v.costMicros)}, ${v.conversions} conv`);
    }
  }

  // Conversion signal timeline
  console.log(`\n  Conversion signal timeline (total conv per month):`);
  for (const k of MONTHS) {
    const d = byMonth[k];
    const conv = d ? d.conversions : 0;
    const bar = '█'.repeat(Math.round(conv)) || '·';
    console.log(`    ${MONTH_LABELS[k].padEnd(10)} ${String(conv).padStart(4)}  ${bar}`);
  }

  // Headline deltas March vs June (last complete month)
  const mar = byMonth['2026-03'], jun = byMonth['2026-06'];
  if (mar && jun) {
    console.log(`\n  March → June (last complete month) deltas:`);
    const delta = (label, a, b, fmt) => {
      const pctChg = a > 0 ? ((b - a) / a * 100).toFixed(1) + '%' : '—';
      console.log(`    ${label.padEnd(16)} Mar: ${fmt(a).padStart(10)}   Jun: ${fmt(b).padStart(10)}   change: ${pctChg}`);
    };
    delta('Impressions', mar.impressions, jun.impressions, v => String(v));
    delta('Clicks', mar.clicks, jun.clicks, v => String(v));
    delta('Spend', mar.costMicros, jun.costMicros, gbp);
    delta('Conversions', mar.conversions, jun.conversions, v => String(v));
  }

  console.log('\nAudit complete.\n');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
