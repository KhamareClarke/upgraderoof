/**
 * scripts/audit-ads-marketing.js
 *
 * Google Ads API v22 — Marketing Audit (March 1st to Today)
 *
 * Pulls performance data from March 1st to present and provides
 * direct-response copy chief analysis using Corey Haines marketing principles.
 *
 * Run:  node scripts/audit-ads-marketing.js
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function banner(title) {
  console.log('\n' + '='.repeat(74));
  console.log('  ' + title);
  console.log('='.repeat(74));
}

function subBanner(title) {
  console.log('\n' + '-'.repeat(74));
  console.log('  ' + title);
  console.log('-'.repeat(74));
}

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
      res => {
        let data = '';
        res.on('data', c => (data += c));
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
  const h = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }
  return h;
}

function explainAdsError(body) {
  const errs = (body && body.error && body.error.details &&
    body.error.details.flatMap(d => d.errors || [])) || [];
  if (!errs.length && body && body.error) {
    return [`${body.error.status || body.error.code}: ${body.error.message}`];
  }
  return errs.map(e => e.message);
}

function formatCurrency(amount) {
  return '£' + Number(amount).toFixed(2);
}

function formatNumber(num) {
  return Number(num).toLocaleString('en-GB');
}

function formatPercent(value) {
  return Number(value).toFixed(2) + '%';
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('GOOGLE ADS — MARKETING AUDIT (March 1st to Today)');
  console.log(`Audit Date: ${formatDate(new Date())}  |  API version: ${API_VERSION}`);

  const customerId = GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '');
  console.log(`Customer ID: ${customerId}\n`);

  // OAuth
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();
  const headers = adsHeaders(accessToken);

  async function gaql(query) {
    const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
    if (res.status !== 200) {
      throw new Error(`HTTP ${res.status}: ${explainAdsError(res.body).join(' | ')}`);
    }
    return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  }

  // Date range: March 1st to today
  const today = new Date();
  const marchFirst = new Date(today.getFullYear(), 2, 1); // March is month 2 (0-indexed)
  const startDate = formatDate(marchFirst);
  const endDate = formatDate(today);

  console.log(`Date Range: ${startDate} to ${endDate}\n`);

  // ── Query 1: Overall Performance Since March ──────────────────────────────

  banner('OVERALL PERFORMANCE — March 1st to Today');

  let overallRows = [];
  try {
    overallRows = await gaql(
      `SELECT metrics.impressions, metrics.clicks, metrics.cost_micros,
              metrics.conversions, metrics.ctr, metrics.average_cpc
       FROM campaign
       WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'`
    );
  } catch (err) {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  }

  const totals = overallRows.reduce((acc, r) => ({
    impressions: acc.impressions + Number(r.metrics?.impressions || 0),
    clicks: acc.clicks + Number(r.metrics?.clicks || 0),
    costMicros: acc.costMicros + Number(r.metrics?.costMicros || 0),
    conversions: acc.conversions + Number(r.metrics?.conversions || 0),
  }), { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 });

  const spend = totals.costMicros / 1e6;
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpa = totals.conversions > 0 ? spend / totals.conversions : 0;
  const avgCpc = totals.clicks > 0 ? spend / totals.clicks : 0;
  const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  console.log('\n  ┌─────────────────────────────────────────────────────────────┐');
  console.log('  │                    KEY METRICS SINCE MARCH                   │');
  console.log('  ├─────────────────────────────────────────────────────────────┤');
  console.log(`  │  Impressions:        ${formatNumber(totals.impressions).padStart(12)}                      │`);
  console.log(`  │  Clicks:             ${formatNumber(totals.clicks).padStart(12)}                      │`);
  console.log(`  │  Spend:              ${formatCurrency(spend).padStart(12)}                      │`);
  console.log(`  │  Conversions:        ${formatNumber(totals.conversions).padStart(12)}                      │`);
  console.log(`  │  CTR:                ${formatPercent(ctr).padStart(12)}                      │`);
  console.log(`  │  Avg CPC:            ${formatCurrency(avgCpc).padStart(12)}                      │`);
  console.log(`  │  CPA:                ${formatCurrency(cpa).padStart(12)}                      │`);
  console.log(`  │  Conversion Rate:    ${formatPercent(conversionRate).padStart(12)}                      │`);
  console.log('  └─────────────────────────────────────────────────────────────┘');

  // ── Query 2: Monthly Breakdown ────────────────────────────────────────────

  subBanner('MONTHLY BREAKDOWN');

  let monthlyRows = [];
  try {
    monthlyRows = await gaql(
      `SELECT segments.month, metrics.impressions, metrics.clicks,
              metrics.cost_micros, metrics.conversions
       FROM campaign
       WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
       ORDER BY segments.month`
    );
  } catch (err) {
    console.log(`Monthly query error: ${err.message}`);
  }

  const byMonth = {};
  for (const r of monthlyRows) {
    const month = r.segments?.month || 'unknown';
    if (!byMonth[month]) {
      byMonth[month] = { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
    }
    byMonth[month].impressions += Number(r.metrics?.impressions || 0);
    byMonth[month].clicks += Number(r.metrics?.clicks || 0);
    byMonth[month].costMicros += Number(r.metrics?.costMicros || 0);
    byMonth[month].conversions += Number(r.metrics?.conversions || 0);
  }

  console.log('\n  Month        Impressions   Clicks   Spend      Conv.   CTR      CPA');
  console.log('  ' + '-'.repeat(72));
  for (const [month, data] of Object.entries(byMonth).sort()) {
    const mSpend = data.costMicros / 1e6;
    const mCtr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const mCpa = data.conversions > 0 ? mSpend / data.conversions : 0;
    console.log(
      `  ${month.padEnd(12)} ${formatNumber(data.impressions).padStart(10)} ${formatNumber(data.clicks).padStart(8)} ` +
      `${formatCurrency(mSpend).padStart(10)} ${String(data.conversions).padStart(6)} ` +
      `${formatPercent(mCtr).padStart(8)} ${formatCurrency(mCpa).padStart(8)}`
    );
  }

  // ── Query 3: Campaign-Level Performance ───────────────────────────────────

  subBanner('CAMPAIGN PERFORMANCE');

  let campaignRows = [];
  try {
    campaignRows = await gaql(
      `SELECT campaign.name, campaign.status,
              metrics.impressions, metrics.clicks, metrics.cost_micros,
              metrics.conversions, metrics.ctr
       FROM campaign
       WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
       ORDER BY metrics.cost_micros DESC`
    );
  } catch (err) {
    console.log(`Campaign query error: ${err.message}`);
  }

  console.log('\n  Campaign'.padEnd(40) + 'Impr.'.padStart(10) + 'Clicks'.padStart(8) + 'Spend'.padStart(12) + 'Conv.'.padStart(7) + 'CTR'.padStart(8) + 'CPA'.padStart(10));
  console.log('  ' + '-'.repeat(95));
  for (const r of campaignRows) {
    const c = r.campaign;
    const m = r.metrics;
    const cSpend = Number(m?.costMicros || 0) / 1e6;
    const cCtr = Number(m?.ctr || 0) * 100;
    const cCpa = Number(m?.conversions || 0) > 0 ? cSpend / Number(m.conversions) : 0;
    console.log(
      `  ${String(c?.name || '').slice(0, 38).padEnd(40)}${formatNumber(m?.impressions || 0).padStart(10)}${formatNumber(m?.clicks || 0).padStart(8)}${formatCurrency(cSpend).padStart(12)}${String(m?.conversions || 0).padStart(7)}${formatPercent(cCtr).padStart(8)}${formatCurrency(cCpa).padStart(10)}`
    );
  }

  // ── Query 4: Weekly Trend (Last 8 Weeks) ──────────────────────────────────

  subBanner('WEEKLY TREND — Last 8 Weeks');

  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const weekStartDate = formatDate(eightWeeksAgo);

  let weeklyRows = [];
  try {
    weeklyRows = await gaql(
      `SELECT segments.week, metrics.impressions, metrics.clicks,
              metrics.cost_micros, metrics.conversions
       FROM campaign
       WHERE segments.date BETWEEN '${weekStartDate}' AND '${endDate}'
       ORDER BY segments.week`
    );
  } catch (err) {
    console.log(`Weekly query error: ${err.message}`);
  }

  const byWeek = {};
  for (const r of weeklyRows) {
    const week = r.segments?.week || 'unknown';
    if (!byWeek[week]) {
      byWeek[week] = { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
    }
    byWeek[week].impressions += Number(r.metrics?.impressions || 0);
    byWeek[week].clicks += Number(r.metrics?.clicks || 0);
    byWeek[week].costMicros += Number(r.metrics?.costMicros || 0);
    byWeek[week].conversions += Number(r.metrics?.conversions || 0);
  }

  console.log('\n  Week Starting  Impressions   Clicks   Spend      Conv.   CTR      CPA');
  console.log('  ' + '-'.repeat(72));
  for (const [week, data] of Object.entries(byWeek).sort()) {
    const wSpend = data.costMicros / 1e6;
    const wCtr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const wCpa = data.conversions > 0 ? wSpend / data.conversions : 0;
    console.log(
      `  ${week.padEnd(14)} ${formatNumber(data.impressions).padStart(10)} ${formatNumber(data.clicks).padStart(8)} ` +
      `${formatCurrency(wSpend).padStart(10)} ${String(data.conversions).padStart(6)} ` +
      `${formatPercent(wCtr).padStart(8)} ${formatCurrency(wCpa).padStart(8)}`
    );
  }

  // ── Marketing Analysis ────────────────────────────────────────────────────

  banner('DIRECT-RESPONSE MARKETING ANALYSIS');

  // Calculate trends
  const months = Object.entries(byMonth).sort();
  const firstMonth = months[0]?.[1] || { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };
  const lastMonth = months[months.length - 1]?.[1] || { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 };

  const firstMonthCtr = firstMonth.impressions > 0 ? (firstMonth.clicks / firstMonth.impressions) * 100 : 0;
  const lastMonthCtr = lastMonth.impressions > 0 ? (lastMonth.clicks / lastMonth.impressions) * 100 : 0;
  const firstMonthCpa = firstMonth.conversions > 0 ? (firstMonth.costMicros / 1e6) / firstMonth.conversions : 0;
  const lastMonthCpa = lastMonth.conversions > 0 ? (lastMonth.costMicros / 1e6) / lastMonth.conversions : 0;

  console.log('\n  TREND ANALYSIS:');
  console.log(`  • CTR Trend: ${formatPercent(firstMonthCtr)} → ${formatPercent(lastMonthCtr)} (${lastMonthCtr >= firstMonthCtr ? '↑ IMPROVING' : '↓ DECLINING'})`);
  console.log(`  • CPA Trend: ${formatCurrency(firstMonthCpa)} → ${formatCurrency(lastMonthCpa)} (${lastMonthCpa <= firstMonthCpa ? '↓ IMPROVING' : '↑ WORSENING'})`);

  // Industry benchmarks for roofing/home services
  const industryBenchmarks = {
    ctr: { low: 2, average: 4, good: 6, excellent: 8 },
    cpa: { low: 50, average: 150, good: 100, excellent: 50 },
    conversionRate: { low: 2, average: 5, good: 8, excellent: 12 },
  };

  console.log('\n  BENCHMARK COMPARISON (Home Services / Roofing):');
  console.log(`  • Your CTR: ${formatPercent(ctr)} | Industry Avg: ${industryBenchmarks.ctr.average}% | ${ctr >= industryBenchmarks.ctr.good ? '✓ ABOVE AVERAGE' : ctr >= industryBenchmarks.ctr.average ? '→ AVERAGE' : '✗ BELOW AVERAGE'}`);
  console.log(`  • Your CPA: ${formatCurrency(cpa)} | Industry Avg: ${formatCurrency(industryBenchmarks.cpa.average)} | ${cpa <= industryBenchmarks.cpa.good ? '✓ GOOD' : cpa <= industryBenchmarks.cpa.average ? '→ AVERAGE' : '✗ HIGH'}`);
  console.log(`  • Your Conv Rate: ${formatPercent(conversionRate)} | Industry Avg: ${industryBenchmarks.conversionRate.average}% | ${conversionRate >= industryBenchmarks.conversionRate.good ? '✓ ABOVE AVERAGE' : conversionRate >= industryBenchmarks.conversionRate.average ? '→ AVERAGE' : '✗ BELOW AVERAGE'}`);

  // Direct-Response Assessment
  subBanner('COPY CHIEF ASSESSMENT — Are Your Ads Compelling?');

  console.log('\n  Based on the data, here\'s my direct-response analysis:\n');

  // CTR Analysis
  if (ctr < 3) {
    console.log('  ⚠️  CTR ANALYSIS: Your ads are BLENDING IN.');
    console.log('     A CTR below 3% means your headlines aren\'t stopping the scroll.');
    console.log('     You\'re likely using generic messaging like "Quality Roofing Services"');
    console.log('     instead of specific, benefit-driven hooks.\n');
  } else if (ctr < 5) {
    console.log('  → CTR ANALYSIS: Your ads are AVERAGE but not compelling.');
    console.log('     You\'re getting clicks, but you\'re not standing out from competitors.');
    console.log('     There\'s room to improve with more specific, urgent messaging.\n');
  } else {
    console.log('  ✓ CTR ANALYSIS: Your ads are COMPELLING.');
    console.log('     A CTR above 5% means your headlines are stopping the scroll');
    console.log('     and resonating with searchers.\n');
  }

  // CPA Analysis
  if (cpa > 200) {
    console.log('  ⚠️  CPA ANALYSIS: Your cost per lead is TOO HIGH.');
    console.log('     You\'re paying premium prices for leads. This suggests either:');
    console.log('     • Poor ad-to-landing-page message match');
    console.log('     • Weak offer presentation on the landing page');
    console.log('     • Targeting too broad an audience\n');
  } else if (cpa > 100) {
    console.log('  → CPA ANALYSIS: Your cost per lead is ACCEPTABLE but improvable.');
    console.log('     You\'re in the typical range for home services, but there\'s');
    console.log('     opportunity to improve conversion rates with better offers.\n');
  } else {
    console.log('  ✓ CPA ANALYSIS: Your cost per lead is EFFICIENT.');
    console.log('     You\'re acquiring leads at a good rate. Focus on scaling.\n');
  }

  // Conversion Rate Analysis
  if (conversionRate < 3) {
    console.log('  ⚠️  CONVERSION RATE: Your landing page is UNDERPERFORMING.');
    console.log('     Less than 3% of clicks convert. This is a landing page problem,');
    console.log('     not an ad problem. Your offer or page flow needs work.\n');
  } else if (conversionRate < 6) {
    console.log('  → CONVERSION RATE: Your landing page is AVERAGE.');
    console.log('     You\'re converting, but there\'s friction in the process.');
    console.log('     Consider simplifying forms or strengthening the offer.\n');
  } else {
    console.log('  ✓ CONVERSION RATE: Your landing page is CONVERTING WELL.');
    console.log('     Your offer and page flow are working. Focus on driving more traffic.\n');
  }

  // ── Recommendations ───────────────────────────────────────────────────────

  banner('3 ACTIONABLE RECOMMENDATIONS');

  console.log('\n  Based on Corey Haines direct-response principles:\n');

  // Recommendation 1: Based on CTR
  if (ctr < 4) {
    console.log('  1. REWRITE YOUR HEADLINES — Stop Being Generic');
    console.log('     Problem: Your CTR suggests your ads sound like every other roofer.');
    console.log('     Solution: Use specific, urgent, benefit-driven headlines.');
    console.log('     Examples:');
    console.log('       ❌ "Professional Roofing Services"');
    console.log('       ✅ "Roof Leaking? We Fix It Today"');
    console.log('       ✅ "Storm Damage? Free Inspection in 2 Hours"');
    console.log('     Principle: Specificity + Urgency = Clicks (Copywriting: Specificity Over Vagueness)\n');
  } else {
    console.log('  1. SCALE YOUR WINNING AD ANGLES');
    console.log('     Your CTR is solid. Double down on what\'s working.');
    console.log('     Action: Identify your top 3 performing headlines and create');
    console.log('     5 variations of each. Test them against new angles.\n');
  }

  // Recommendation 2: Based on CPA and Conversion Rate
  if (conversionRate < 5) {
    console.log('  2. FIX YOUR LANDING PAGE OFFER — Reduce Friction');
    console.log('     Problem: Traffic isn\'t converting. Your offer isn\'t compelling enough.');
    console.log('     Solution: Apply the "So What" test to every element.');
    console.log('     Changes to make:');
    console.log('       • Headline: Match your ad promise exactly');
    console.log('       • Form: Reduce to 3 fields max (name, phone, postcode)');
    console.log('       • Add: "Get Your Free Quote in 24 Hours" as the CTA');
    console.log('       • Add: Trust badges (CORC, £10M insured) near the form');
    console.log('     Principle: Zero Risk + Clarity = Conversions (Copy-Editing: Sweep 7)\n');
  } else {
    console.log('  2. OPTIMIZE FOR HIGHER-VALUE LEADS');
    console.log('     Your conversion rate is good. Now focus on lead quality.');
    console.log('     Action: Add qualifying questions to filter for serious buyers.');
    console.log('     Example: "What\'s your approximate budget?" or "When do you need work done?"\n');
  }

  // Recommendation 3: Based on overall performance
  if (cpa > 150) {
    console.log('  3. IMPLEMENT DAYPARTING — Stop Wasting Spend');
    console.log('     Problem: You\'re likely paying for clicks at times when');
    console.log('     your team can\'t respond, reducing conversion rates.');
    console.log('     Solution: Review your hourly conversion data and pause ads');
    console.log('     during low-converting hours (typically 10pm-6am).');
    console.log('     Expected impact: 20-30% CPA reduction.\n');
  } else {
    console.log('  3. LAUNCH A RETARGETING CAMPAIGN');
    console.log('     Your direct response is working. Now capture the 95%+ who');
    console.log('     didn\'t convert on first visit.');
    console.log('     Action: Set up a 30-day retargeting audience with a');
    console.log('     "Still thinking about it?" message + limited-time incentive.\n');
  }

  // Summary
  subBanner('EXECUTIVE SUMMARY');

  const totalLeads = totals.conversions;
  const totalSpend = spend;
  const daysRunning = Math.ceil((today - marchFirst) / (1000 * 60 * 60 * 24));
  const leadsPerWeek = (totalLeads / daysRunning) * 7;

  console.log(`\n  Since March 1st (${daysRunning} days):`);
  console.log(`  • Total Leads: ${formatNumber(totalLeads)}`);
  console.log(`  • Total Spend: ${formatCurrency(totalSpend)}`);
  console.log(`  • Average CPA: ${formatCurrency(cpa)}`);
  console.log(`  • Leads per Week: ${leadsPerWeek.toFixed(1)}`);
  console.log(`  • Overall CTR: ${formatPercent(ctr)}`);
  console.log(`  • Conversion Rate: ${formatPercent(conversionRate)}`);

  console.log('\n  VERDICT:');
  if (ctr >= 4 && cpa <= 150 && conversionRate >= 5) {
    console.log('  Your campaigns are PERFORMING WELL. Focus on scaling and');
    console.log('  expanding to new keywords or locations.');
  } else if (ctr >= 3 && cpa <= 200) {
    console.log('  Your campaigns are AVERAGE. There\'s significant room for');
    console.log('  improvement in ad copy and landing page optimization.');
  } else {
    console.log('  Your campaigns are UNDERPERFORMING. Immediate action needed');
    console.log('  on ad creative and landing page conversion optimization.');
  }

  banner('AUDIT COMPLETE');
  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
