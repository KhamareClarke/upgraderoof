const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function runAudit() {
  console.log('==================================================');
  console.log('  UPGRADEROOFS.CO.UK — SYSTEM AUDIT ENGINE');
  console.log('==================================================\n');

  // 1. Verify Credentials File
  if (!fs.existsSync('./google-service-account.json')) {
    console.error('❌ ERROR: google-service-account.json not found in root directory.');
    process.exit(1);
  }
  console.log('✅ Service Account JSON found.');

  // 2. Query GA4 (March 2026 vs Recent 30 Days)
  try {
    const analyticsDataClient = new BetaAnalyticsDataClient();
    const [gaResponse] = await analyticsDataClient.runReport({
      // NOTE: GA4 Data API requires the NUMERIC property ID (e.g. properties/123456789),
      // NOT the G-XXXXXXX measurement ID. Set GA4_PROPERTY_ID to the numeric ID from
      // GA4 → Admin → Property Settings → Property ID.
      property: `properties/${process.env.GA4_PROPERTY_ID.replace('G-', '')}`,
      dateRanges: [
        { startDate: '2026-03-01', endDate: '2026-03-31' }, // March Boom
        { startDate: '2026-06-20', endDate: '2026-07-21' }  // Present
      ],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }, { name: 'conversions' }],
    });

    console.log('\n--- GA4 TRAFFIC COMPARISON ---');
    (gaResponse.rows || []).forEach(row => {
      console.log(`Source: ${row.dimensionValues[0].value.padEnd(20)} | Sessions: ${row.metricValues[0].value.padEnd(6)} | Conversions: ${row.metricValues[1].value}`);
    });
  } catch (err) {
    console.error('❌ GA4 Audit Failed:', err.message);
  }

  // 3. Query Google Search Console
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    const scResponse = await searchconsole.searchanalytics.query({
      siteUrl: process.env.GSC_SITE_URL,
      requestBody: {
        startDate: '2026-03-01',
        endDate: '2026-07-21',
        dimensions: ['date'],
      },
    });

    console.log('\n--- SEARCH CONSOLE PERFORMANCE TREND ---');
    console.log(`Total Days Tracked: ${scResponse.data.rows ? scResponse.data.rows.length : 0}`);
  } catch (err) {
    console.error('❌ Search Console Audit Failed:', err.message);
  }
}

runAudit();
