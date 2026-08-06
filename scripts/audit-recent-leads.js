/**
 * scripts/audit-recent-leads.js
 *
 * Google Ads API v22 — Recent Leads & Performance Audit
 *
 * Queries live data for Customer ID 8479028400 and outputs:
 *   1. Exact number of leads (conversions) in the last 7 days
 *   2. Performance comparison: Last 30 Days vs Previous 30 Days (31-60 days ago)
 *   3. Clean table with Impressions, Clicks, Spend, Conversions, CPA
 *   4. Percentage rate of change for each metric
 *
 * Requires .env.local with:
 *   GOOGLE_ADS_CUSTOMER_ID=8479028400
 *   GOOGLE_ADS_DEVELOPER_TOKEN=...
 *   GOOGLE_ADS_CLIENT_ID=...
 *   GOOGLE_ADS_CLIENT_SECRET=...
 *   GOOGLE_ADS_REFRESH_TOKEN=...
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID=... (optional, for MCC)
 *
 * Run:  node scripts/audit-recent-leads.js
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
  console.log('\n' + '='.repeat(70));
  console.log('  ' + title);
  console.log('='.repeat(70));
}

function subBanner(title) {
  console.log('\n' + '-'.repeat(70));
  console.log('  ' + title);
  console.log('-'.repeat(70));
}

function fail(step, message, hints) {
  console.error(`\n[FAIL at step ${step}] ${message}`);
  (hints || []).forEach(h => console.error(`   -> ${h}`));
  process.exit(1);
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
  return errs.map(e => {
    const code = e.errorCode ? Object.entries(e.errorCode).map(([k, v]) => `${k}=${v}`).join(',') : '';
    return `${e.message}${code ? `  [${code}]` : ''}`;
  });
}

function formatCurrency(amount) {
  return '£' + Number(amount).toFixed(2);
}

function formatNumber(num) {
  return Number(num).toLocaleString('en-GB');
}

function formatPercent(change) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

function formatChangeIndicator(change) {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '→';
}

// ── Date Range Helpers ───────────────────────────────────────────────────────

function getDateRanges() {
  const today = new Date();
  const formatDate = (d) => d.toISOString().slice(0, 10);

  // Last 7 days
  const last7End = new Date(today);
  last7End.setDate(last7End.getDate() - 1);
  const last7Start = new Date(last7End);
  last7Start.setDate(last7Start.getDate() - 6);

  // Last 30 days
  const last30End = new Date(today);
  last30End.setDate(last30End.getDate() - 1);
  const last30Start = new Date(last30End);
  last30Start.setDate(last30Start.getDate() - 29);

  // Previous 30 days (31-60 days ago)
  const prev30End = new Date(last30Start);
  prev30End.setDate(prev30End.getDate() - 1);
  const prev30Start = new Date(prev30End);
  prev30Start.setDate(prev30Start.getDate() - 29);

  return {
    last7: { start: formatDate(last7Start), end: formatDate(last7End) },
    last30: { start: formatDate(last30Start), end: formatDate(last30End) },
    prev30: { start: formatDate(prev30Start), end: formatDate(prev30End) },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('GOOGLE ADS — RECENT LEADS & PERFORMANCE AUDIT');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  API version: ${API_VERSION}`);

  // 1. Validate env vars
  const missing = [
    ['GOOGLE_ADS_CUSTOMER_ID', GOOGLE_ADS_CUSTOMER_ID],
    ['GOOGLE_ADS_DEVELOPER_TOKEN', GOOGLE_ADS_DEVELOPER_TOKEN],
    ['GOOGLE_ADS_CLIENT_ID', GOOGLE_ADS_CLIENT_ID],
    ['GOOGLE_ADS_CLIENT_SECRET', GOOGLE_ADS_CLIENT_SECRET],
    ['GOOGLE_ADS_REFRESH_TOKEN', GOOGLE_ADS_REFRESH_TOKEN],
  ].filter(([, v]) => !v).map(([k]) => k);

  if (missing.length) {
    fail(1, `Missing env vars in .env.local: ${missing.join(', ')}`, [
      'Create .env.local in the project root with: ',
      '  GOOGLE_ADS_CUSTOMER_ID=8479028400',
      '  GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token',
      '  GOOGLE_ADS_CLIENT_ID=your_oauth_client_id',
      '  GOOGLE_ADS_CLIENT_SECRET=your_oauth_client_secret',
      '  GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token',
    ]);
  }

  const customerId = GOOGLE_ADS_CUSTOMER_ID.replace(/\D/g, '');
  if (!/^\d{10}$/.test(customerId)) {
    fail(1, `GOOGLE_ADS_CUSTOMER_ID "${GOOGLE_ADS_CUSTOMER_ID}" is not a 10-digit customer ID.`);
  }
  console.log(`\n[1/5] Env vars present. Customer ID: ${customerId}`);

  // 2. OAuth token exchange
  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  let accessToken;
  try {
    const { token } = await oauth2.getAccessToken();
    accessToken = token;
  } catch (err) {
    fail(2, `Refresh token exchange failed: ${err.message}`, [
      'The refresh token may be revoked or expired.',
      'Regenerate with the Google Ads OAuth playground.',
    ]);
  }
  if (!accessToken) fail(2, 'Refresh token exchange returned no access token.');
  console.log('[2/5] OAuth access token obtained.');

  const headers = adsHeaders(accessToken);

  // 3. Verify customer access
  async function gaql(query) {
    const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
    if (res.status !== 200) {
      const lines = explainAdsError(res.body);
      throw new Error(`HTTP ${res.status}: ${lines.join(' | ')}`);
    }
    return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  }

  let accountRows;
  try {
    accountRows = await gaql(
      `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone
       FROM customer LIMIT 1`
    );
  } catch (err) {
    fail(3, `Account query failed: ${err.message}`);
  }
  const cust = accountRows[0] && accountRows[0].customer;
  console.log(`[3/5] Connected to account: ${cust?.descriptiveName || '(unnamed)'} (${cust?.currencyCode || 'GBP'})`);

  // 4. Calculate date ranges
  const ranges = getDateRanges();
  console.log(`[4/5] Date ranges calculated:`);
  console.log(`      Last 7 days:    ${ranges.last7.start} to ${ranges.last7.end}`);
  console.log(`      Last 30 days:   ${ranges.last30.start} to ${ranges.last30.end}`);
  console.log(`      Previous 30:    ${ranges.prev30.start} to ${ranges.prev30.end}`);

  // 5. Query metrics
  console.log('[5/5] Querying Google Ads API...\n');

  // Query 1: Last 7 days conversions
  let last7Rows = [];
  try {
    last7Rows = await gaql(
      `SELECT metrics.conversions, metrics.cost_micros, metrics.clicks, metrics.impressions
       FROM campaign
       WHERE segments.date BETWEEN '${ranges.last7.start}' AND '${ranges.last7.end}'`
    );
  } catch (err) {
    console.log(`(Last 7 days query failed: ${err.message})`);
  }

  const last7Metrics = last7Rows.reduce((acc, r) => ({
    conversions: acc.conversions + Number(r.metrics?.conversions || 0),
    costMicros: acc.costMicros + Number(r.metrics?.costMicros || 0),
    clicks: acc.clicks + Number(r.metrics?.clicks || 0),
    impressions: acc.impressions + Number(r.metrics?.impressions || 0),
  }), { conversions: 0, costMicros: 0, clicks: 0, impressions: 0 });

  // Query 2: Last 30 days
  let last30Rows = [];
  try {
    last30Rows = await gaql(
      `SELECT metrics.conversions, metrics.cost_micros, metrics.clicks, metrics.impressions
       FROM campaign
       WHERE segments.date BETWEEN '${ranges.last30.start}' AND '${ranges.last30.end}'`
    );
  } catch (err) {
    console.log(`(Last 30 days query failed: ${err.message})`);
  }

  const last30Metrics = last30Rows.reduce((acc, r) => ({
    conversions: acc.conversions + Number(r.metrics?.conversions || 0),
    costMicros: acc.costMicros + Number(r.metrics?.costMicros || 0),
    clicks: acc.clicks + Number(r.metrics?.clicks || 0),
    impressions: acc.impressions + Number(r.metrics?.impressions || 0),
  }), { conversions: 0, costMicros: 0, clicks: 0, impressions: 0 });

  // Query 3: Previous 30 days
  let prev30Rows = [];
  try {
    prev30Rows = await gaql(
      `SELECT metrics.conversions, metrics.cost_micros, metrics.clicks, metrics.impressions
       FROM campaign
       WHERE segments.date BETWEEN '${ranges.prev30.start}' AND '${ranges.prev30.end}'`
    );
  } catch (err) {
    console.log(`(Previous 30 days query failed: ${err.message})`);
  }

  const prev30Metrics = prev30Rows.reduce((acc, r) => ({
    conversions: acc.conversions + Number(r.metrics?.conversions || 0),
    costMicros: acc.costMicros + Number(r.metrics?.costMicros || 0),
    clicks: acc.clicks + Number(r.metrics?.clicks || 0),
    impressions: acc.impressions + Number(r.metrics?.impressions || 0),
  }), { conversions: 0, costMicros: 0, clicks: 0, impressions: 0 });

  // ── Output Results ─────────────────────────────────────────────────────────

  // Section 1: Last 7 Days Leads
  banner('LEADS — LAST 7 DAYS');
  console.log(`\n  Period: ${ranges.last7.start} to ${ranges.last7.end}`);
  console.log(`\n  ┌─────────────────────────────────────────┐`);
  console.log(`  │                                         │`);
  console.log(`  │   TOTAL LEADS (Conversions): ${String(Math.round(last7Metrics.conversions)).padStart(6)}   │`);
  console.log(`  │                                         │`);
  console.log(`  └─────────────────────────────────────────┘`);
  console.log(`\n  Supporting metrics:`);
  console.log(`    Impressions: ${formatNumber(last7Metrics.impressions)}`);
  console.log(`    Clicks:      ${formatNumber(last7Metrics.clicks)}`);
  console.log(`    Spend:       ${formatCurrency(last7Metrics.costMicros / 1e6)}`);
  console.log(`    CPA:         ${last7Metrics.conversions > 0 ? formatCurrency((last7Metrics.costMicros / 1e6) / last7Metrics.conversions) : 'N/A'}`);

  // Section 2: 30-Day Comparison Table
  banner('PERFORMANCE COMPARISON — LAST 30 DAYS vs PREVIOUS 30 DAYS');

  const last30 = {
    impressions: last30Metrics.impressions,
    clicks: last30Metrics.clicks,
    spend: last30Metrics.costMicros / 1e6,
    conversions: last30Metrics.conversions,
    cpa: last30Metrics.conversions > 0 ? (last30Metrics.costMicros / 1e6) / last30Metrics.conversions : 0,
  };

  const prev30 = {
    impressions: prev30Metrics.impressions,
    clicks: prev30Metrics.clicks,
    spend: prev30Metrics.costMicros / 1e6,
    conversions: prev30Metrics.conversions,
    cpa: prev30Metrics.conversions > 0 ? (prev30Metrics.costMicros / 1e6) / prev30Metrics.conversions : 0,
  };

  // Calculate percentage changes
  const changes = {
    impressions: prev30.impressions > 0 ? ((last30.impressions - prev30.impressions) / prev30.impressions) * 100 : 0,
    clicks: prev30.clicks > 0 ? ((last30.clicks - prev30.clicks) / prev30.clicks) * 100 : 0,
    spend: prev30.spend > 0 ? ((last30.spend - prev30.spend) / prev30.spend) * 100 : 0,
    conversions: prev30.conversions > 0 ? ((last30.conversions - prev30.conversions) / prev30.conversions) * 100 : 0,
    cpa: prev30.cpa > 0 ? ((last30.cpa - prev30.cpa) / prev30.cpa) * 100 : 0,
  };

  subBanner('METRICS TABLE');

  const colWidths = { metric: 18, last30: 18, prev30: 18, change: 16 };
  const headerRow =
    'Metric'.padEnd(colWidths.metric) +
    'Last 30 Days'.padStart(colWidths.last30) +
    'Previous 30'.padStart(colWidths.prev30) +
    'Change'.padStart(colWidths.change);
  console.log('\n' + headerRow);
  console.log('-'.repeat(headerRow.length));

  const rows = [
    {
      metric: 'Impressions',
      last: formatNumber(last30.impressions),
      prev: formatNumber(prev30.impressions),
      change: changes.impressions,
    },
    {
      metric: 'Clicks',
      last: formatNumber(last30.clicks),
      prev: formatNumber(prev30.clicks),
      change: changes.clicks,
    },
    {
      metric: 'Spend',
      last: formatCurrency(last30.spend),
      prev: formatCurrency(prev30.spend),
      change: changes.spend,
    },
    {
      metric: 'Conversions',
      last: formatNumber(last30.conversions),
      prev: formatNumber(prev30.conversions),
      change: changes.conversions,
    },
    {
      metric: 'CPA',
      last: last30.conversions > 0 ? formatCurrency(last30.cpa) : 'N/A',
      prev: prev30.conversions > 0 ? formatCurrency(prev30.cpa) : 'N/A',
      change: changes.cpa,
    },
  ];

  for (const row of rows) {
    const changeStr = formatPercent(row.change);
    const indicator = formatChangeIndicator(row.change);
    console.log(
      row.metric.padEnd(colWidths.metric) +
      row.last.padStart(colWidths.last30) +
      row.prev.padStart(colWidths.prev30) +
      `${indicator} ${changeStr}`.padStart(colWidths.change)
    );
  }
  console.log('-'.repeat(headerRow.length));

  // Section 3: Summary
  subBanner('SUMMARY');

  const convChange = changes.conversions;
  const cpaChange = changes.cpa;

  console.log('\n  Key Insights:');

  if (convChange > 0) {
    console.log(`    ✓ Conversions INCREASED by ${Math.abs(convChange).toFixed(1)}% (${formatNumber(prev30.conversions)} → ${formatNumber(last30.conversions)})`);
  } else if (convChange < 0) {
    console.log(`    ✗ Conversions DECREASED by ${Math.abs(convChange).toFixed(1)}% (${formatNumber(prev30.conversions)} → ${formatNumber(last30.conversions)})`);
  } else {
    console.log(`    → Conversions remained FLAT (${formatNumber(last30.conversions)})`);
  }

  if (cpaChange < 0 && last30.conversions > 0 && prev30.conversions > 0) {
    console.log(`    ✓ CPA IMPROVED (decreased) by ${Math.abs(cpaChange).toFixed(1)}% (${formatCurrency(prev30.cpa)} → ${formatCurrency(last30.cpa)})`);
  } else if (cpaChange > 0 && last30.conversions > 0 && prev30.conversions > 0) {
    console.log(`    ✗ CPA WORSENED (increased) by ${cpaChange.toFixed(1)}% (${formatCurrency(prev30.cpa)} → ${formatCurrency(last30.cpa)})`);
  }

  const ctrLast = last30.impressions > 0 ? (last30.clicks / last30.impressions) * 100 : 0;
  const ctrPrev = prev30.impressions > 0 ? (prev30.clicks / prev30.impressions) * 100 : 0;
  const ctrChange = ctrPrev > 0 ? ((ctrLast - ctrPrev) / ctrPrev) * 100 : 0;

  if (ctrChange > 0) {
    console.log(`    ✓ CTR improved by ${ctrChange.toFixed(1)}% (${ctrPrev.toFixed(2)}% → ${ctrLast.toFixed(2)}%)`);
  } else if (ctrChange < 0) {
    console.log(`    ✗ CTR declined by ${Math.abs(ctrChange).toFixed(1)}% (${ctrPrev.toFixed(2)}% → ${ctrLast.toFixed(2)}%)`);
  }

  console.log('\n  Periods compared:');
  console.log(`    Last 30 Days:    ${ranges.last30.start} to ${ranges.last30.end}`);
  console.log(`    Previous 30:     ${ranges.prev30.start} to ${ranges.prev30.end}`);

  banner('AUDIT COMPLETE');
  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
