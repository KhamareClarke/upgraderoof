/**
 * scripts/test-gbp-api.js
 *
 * Minimal connectivity test for the Google Business Profile (GBP) APIs
 * used by Upgrade Roofs. Makes ONE call per API and reports status.
 *
 * Run:  node scripts/test-gbp-api.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, '..', 'google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

function banner(t) {
  console.log('\n' + '='.repeat(64));
  console.log('  ' + t);
  console.log('='.repeat(64));
}

async function main() {
  banner('GBP API — MINIMAL CONNECTIVITY TEST');
  console.log(`Date: ${new Date().toISOString()}`);

  if (!fs.existsSync(KEY_FILE)) {
    console.error(`\nERROR: key file not found at ${KEY_FILE}`);
    process.exit(1);
  }
  const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
  console.log(`\nService account: ${key.client_email}`);
  console.log(`GCP project:     ${key.project_id}`);

  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: SCOPES });
  const authClient = await auth.getClient();
  const token = await authClient.getAccessToken();
  console.log(`\n[OK] Auth: access token issued (${token.token ? token.token.slice(0, 20) + '…' : 'none'})`);

  // Single call: list accounts
  const acctMgmt = google.mybusinessaccountmanagement({ version: 'v1', auth: authClient });
  try {
    const res = await acctMgmt.accounts.list();
    const accounts = res.data.accounts || [];
    console.log(`[OK] My Business Account Management API: ${accounts.length} account(s) accessible`);
    accounts.forEach(a => console.log(`     - ${a.accountName || '(unnamed)'}  [${a.name}]  type=${a.type}`));
    if (accounts.length === 0) {
      console.log('\n[WARN] Auth works, but no GBP accounts are shared with this service account.');
      console.log('       Invite the service account email as a Manager on the Upgrade Roofs');
      console.log('       profile in https://business.google.com → Settings → Managers.');
    }
  } catch (err) {
    console.error(`\n[FAIL] accounts.list: ${err.message}`);
    if (/quota/i.test(err.message)) {
      console.error('       Per-minute quota exhausted. Wait 60s+ and retry, or request a');
      console.error('       quota increase in GCP Console → APIs & Services → Quotas.');
    } else if (/PERMISSION_DENIED|has not been used|disabled/i.test(err.message)) {
      console.error('       Enable "My Business Account Management API" in GCP Console.');
    }
    process.exit(1);
  }
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
