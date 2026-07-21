const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const PROPERTY = `properties/${process.env.GA4_PROPERTY_ID}`;
const SITE = process.env.GSC_SITE_URL;

// Two windows: the March "boom" and the most recent 30 days
const WINDOWS = {
  march:  { startDate: '2026-03-01', endDate: '2026-03-31' },
  recent: { startDate: '2026-06-21', endDate: '2026-07-21' },
};

const ga = new BetaAnalyticsDataClient();
const auth = new google.auth.GoogleAuth({
  keyFile: './google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const sc = google.searchconsole({ version: 'v1', auth });

const hr = (t) => console.log(`\n${'='.repeat(60)}\n  ${t}\n${'='.repeat(60)}`);

async function gaReport(name, dateRange, dimensions, metrics, limit = 15) {
  try {
    const [res] = await ga.runReport({
      property: PROPERTY,
      dateRanges: [dateRange],
      dimensions: dimensions.map(d => ({ name: d })),
      metrics: metrics.map(m => ({ name: m })),
      limit,
    });
    return res.rows || [];
  } catch (e) {
    console.log(`  ⚠️ GA4 ${name} failed: ${e.message}`);
    return [];
  }
}

async function scReport(name, dateRange, dimensions, limit = 25) {
  try {
    const res = await sc.searchanalytics.query({
      siteUrl: SITE,
      requestBody: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions,
        rowLimit: limit,
      },
    });
    return res.data.rows || [];
  } catch (e) {
    console.log(`  ⚠️ GSC ${name} failed: ${e.message}`);
    return [];
  }
}

function printGA(rows, dims, mets) {
  if (!rows.length) { console.log('  (no data)'); return; }
  rows.forEach(r => {
    const d = r.dimensionValues.map(v => v.value).join(' | ');
    const m = r.metricValues.map(v => v.value).join(' | ');
    console.log(`  ${d.padEnd(45)} ${m}`);
  });
}

function printSC(rows) {
  if (!rows.length) { console.log('  (no data)'); return; }
  console.log('  ' + 'QUERY/PAGE'.padEnd(45) + 'CLICKS  IMPR   CTR    POS');
  rows.forEach(r => {
    const key = r.keys.join(' | ');
    const ctr = (r.ctr * 100).toFixed(1) + '%';
    console.log(`  ${key.slice(0, 44).padEnd(45)} ${String(r.clicks).padEnd(7)} ${String(r.impressions).padEnd(6)} ${ctr.padEnd(6)} ${r.position.toFixed(1)}`);
  });
}

async function run() {
  hr('UPGRADEROOFS — FULL INTELLIGENCE AUDIT');
  console.log(`GA4 property: ${PROPERTY}`);
  console.log(`GSC site:     ${SITE}`);

  for (const [label, win] of Object.entries(WINDOWS)) {
    hr(`WINDOW: ${label.toUpperCase()}  (${win.startDate} → ${win.endDate})`);

    console.log('\n── GA4: Sessions & Conversions by Source ──');
    printGA(
      await gaReport('source', win, ['sessionSource'], ['sessions', 'conversions', 'engagedSessions', 'bounceRate']),
      ['sessionSource'], []
    );

    console.log('\n── GA4: Top Landing Pages ──');
    printGA(
      await gaReport('landing', win, ['landingPage'], ['sessions', 'conversions', 'engagementRate'], 12),
      ['landingPage'], []
    );

    console.log('\n── GA4: Totals ──');
    const totals = await gaReport('totals', win, [], ['sessions', 'totalUsers', 'conversions', 'engagedSessions', 'userEngagementDuration']);
    if (totals.length) {
      const t = totals[0].metricValues;
      console.log(`  Sessions: ${t[0].value}  Users: ${t[1].value}  Conversions: ${t[2].value}  Engaged: ${t[3].value}  EngTime(s): ${t[4].value}`);
    } else console.log('  (no data)');

    console.log('\n── GSC: Top Search Queries ──');
    printSC(await scReport('queries', win, ['query'], 25));

    console.log('\n── GSC: Top Pages ──');
    printSC(await scReport('pages', win, ['page'], 15));

    console.log('\n── GSC: Daily Trend (clicks) ──');
    const daily = await scReport('daily', win, ['date'], 40);
    if (daily.length) {
      const totalClicks = daily.reduce((s, r) => s + r.clicks, 0);
      const totalImpr = daily.reduce((s, r) => s + r.impressions, 0);
      console.log(`  Days: ${daily.length}  Total clicks: ${totalClicks}  Total impressions: ${totalImpr}`);
      daily.slice(-10).forEach(r => {
        console.log(`  ${r.keys[0]}  clicks:${String(r.clicks).padEnd(4)} impr:${r.impressions}`);
      });
    } else console.log('  (no data)');
  }

  hr('AUDIT COMPLETE');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
