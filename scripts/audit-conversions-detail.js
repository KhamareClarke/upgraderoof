/**
 * scripts/audit-conversions-detail.js
 *
 * Detailed breakdown of conversions by date and conversion action
 * to help identify discrepancies in reported numbers.
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

function banner(title) {
  console.log('\n' + '='.repeat(70));
  console.log('  ' + title);
  console.log('='.repeat(70));
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

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  banner('GOOGLE ADS — DETAILED CONVERSIONS BREAKDOWN');
  console.log(`Date: ${formatDate(new Date())}  |  API version: ${API_VERSION}`);

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

  // Date ranges
  const today = new Date();
  const last30End = new Date(today);
  last30End.setDate(last30End.getDate() - 1);
  const last30Start = new Date(last30End);
  last30Start.setDate(last30Start.getDate() - 29);

  const last7End = new Date(today);
  last7End.setDate(last7End.getDate() - 1);
  const last7Start = new Date(last7End);
  last7Start.setDate(last7Start.getDate() - 6);

  // 1. Conversions by day (last 30 days)
  banner('CONVERSIONS BY DAY — LAST 30 DAYS');
  console.log(`Period: ${formatDate(last30Start)} to ${formatDate(last30End)}\n`);

  try {
    const dailyRows = await gaql(
      `SELECT segments.date, metrics.conversions, metrics.cost_micros, metrics.clicks
       FROM campaign
       WHERE segments.date BETWEEN '${formatDate(last30Start)}' AND '${formatDate(last30End)}'
       ORDER BY segments.date DESC`
    );

    // Group by date
    const byDate = {};
    for (const r of dailyRows) {
      const date = r.segments?.date;
      if (!byDate[date]) {
        byDate[date] = { conversions: 0, cost: 0, clicks: 0 };
      }
      byDate[date].conversions += Number(r.metrics?.conversions || 0);
      byDate[date].cost += Number(r.metrics?.costMicros || 0) / 1e6;
      byDate[date].clicks += Number(r.metrics?.clicks || 0);
    }

    const dates = Object.keys(byDate).sort().reverse();
    let totalConv = 0;
    let totalCost = 0;

    console.log('Date        Conversions   Clicks   Spend');
    console.log('-'.repeat(45));
    for (const date of dates) {
      const d = byDate[date];
      totalConv += d.conversions;
      totalCost += d.cost;
      console.log(
        `${date}   ${String(d.conversions).padStart(6)}   ${String(d.clicks).padStart(6)}   £${d.cost.toFixed(2)}`
      );
    }
    console.log('-'.repeat(45));
    console.log(`TOTAL       ${String(totalConv).padStart(6)}            £${totalCost.toFixed(2)}`);
    console.log(`\nTotal conversions in last 30 days: ${totalConv}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  // 2. Conversions by conversion action
  banner('CONVERSIONS BY ACTION — LAST 30 DAYS');

  try {
    const actionRows = await gaql(
      `SELECT segments.conversion_action_name, metrics.conversions, metrics.cost_micros
       FROM campaign
       WHERE segments.date BETWEEN '${formatDate(last30Start)}' AND '${formatDate(last30End)}'
       ORDER BY metrics.conversions DESC`
    );

    const byAction = {};
    for (const r of actionRows) {
      const action = r.segments?.conversionActionName || '(unknown)';
      if (!byAction[action]) {
        byAction[action] = { conversions: 0, cost: 0 };
      }
      byAction[action].conversions += Number(r.metrics?.conversions || 0);
      byAction[action].cost += Number(r.metrics?.costMicros || 0) / 1e6;
    }

    console.log('\nConversion Action                    Conversions   Spend');
    console.log('-'.repeat(60));
    for (const [action, data] of Object.entries(byAction).sort((a, b) => b[1].conversions - a[1].conversions)) {
      console.log(
        `${action.slice(0, 35).padEnd(35)} ${String(data.conversions).padStart(10)}   £${data.cost.toFixed(2)}`
      );
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  // 3. Last 7 days detail
  banner('CONVERSIONS BY DAY — LAST 7 DAYS');
  console.log(`Period: ${formatDate(last7Start)} to ${formatDate(last7End)}\n`);

  try {
    const last7Rows = await gaql(
      `SELECT segments.date, segments.conversion_action_name, metrics.conversions, metrics.cost_micros
       FROM campaign
       WHERE segments.date BETWEEN '${formatDate(last7Start)}' AND '${formatDate(last7End)}'
       ORDER BY segments.date DESC`
    );

    if (last7Rows.length === 0) {
      console.log('No conversion data in the last 7 days.');
    } else {
      console.log('Date        Action                           Conversions   Spend');
      console.log('-'.repeat(70));
      for (const r of last7Rows) {
        const date = r.segments?.date || 'unknown';
        const action = (r.segments?.conversionActionName || '(all)').slice(0, 30);
        const conv = Number(r.metrics?.conversions || 0);
        const cost = Number(r.metrics?.costMicros || 0) / 1e6;
        console.log(`${date}   ${action.padEnd(30)} ${String(conv).padStart(10)}   £${cost.toFixed(2)}`);
      }
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  // 4. All conversion actions defined in account
  banner('CONVERSION ACTIONS DEFINED IN ACCOUNT');

  try {
    const actionDefs = await gaql(
      `SELECT conversion_action.name, conversion_action.status, conversion_action.category,
              conversion_action.counting_type, conversion_action.include_in_conversions_metric
       FROM conversion_action`
    );

    console.log('\nName                              Status    Category      Counting   In "Conversions"');
    console.log('-'.repeat(85));
    for (const r of actionDefs) {
      const ca = r.conversionAction;
      console.log(
        `${(ca.name || '').slice(0, 33).padEnd(33)} ${(ca.status || '').padEnd(9)} ${(ca.category || '').padEnd(13)} ${(ca.countingType || '').padEnd(10)} ${ca.includeInConversionsMetric ? 'Yes' : 'No'}`
      );
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  banner('DONE');
  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
