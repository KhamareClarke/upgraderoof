/**
 * Probe each GBP-related API once to see which have usable quota.
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, '..', 'google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

async function probe(name, fn) {
  try {
    await fn();
    console.log(`  [OK]    ${name}`);
  } catch (err) {
    const msg = err.message || String(err);
    const short = /quota/i.test(msg) ? 'QUOTA EXCEEDED'
      : /PERMISSION_DENIED|has not been used|disabled/i.test(msg) ? 'API NOT ENABLED / PERMISSION DENIED'
      : /404|not found/i.test(msg) ? 'NOT FOUND (API reachable)'
      : msg.slice(0, 120);
    console.log(`  [FAIL]  ${name}: ${short}`);
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: SCOPES });
  const authClient = await auth.getClient();

  console.log('\nProbing GBP APIs (one call each, sequential):\n');

  await probe('mybusinessaccountmanagement.accounts.list', async () => {
    const api = google.mybusinessaccountmanagement({ version: 'v1', auth: authClient });
    await api.accounts.list();
  });

  await new Promise(r => setTimeout(r, 2000));

  await probe('mybusinessbusinessinformation.accounts.locations.list', async () => {
    const api = google.mybusinessbusinessinformation({ version: 'v1', auth: authClient });
    // Will 404 if no accounts, but proves the API endpoint is reachable + quota exists
    await api.accounts.locations.list({ parent: 'accounts/-', readMask: 'name', pageSize: 1 });
  });

  await new Promise(r => setTimeout(r, 2000));

  await probe('businessprofileperformance.locations.getDailyMetricsTimeSeries', async () => {
    const api = google.businessprofileperformance({ version: 'v1', auth: authClient });
    await api.locations.getDailyMetricsTimeSeries({
      name: 'accounts/-/locations/-',
      dailyMetric: 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'dailyRange.startDate.year': 2026, 'dailyRange.startDate.month': 6, 'dailyRange.startDate.day': 1,
      'dailyRange.endDate.year': 2026, 'dailyRange.endDate.month': 6, 'dailyRange.endDate.day': 30,
    });
  });

  await new Promise(r => setTimeout(r, 2000));

  await probe('mybusinessverifications (legacy v4) locations.list', async () => {
    const api = google.mybusinessverifications ? google.mybusinessverifications({ version: 'v1', auth: authClient }) : null;
    if (!api) throw new Error('client not in googleapis');
  });

  console.log('');
}

main().catch(err => { console.error('FATAL:', err.message || err); process.exit(1); });
