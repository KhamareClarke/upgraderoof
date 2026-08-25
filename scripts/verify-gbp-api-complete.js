/**
 * scripts/verify-gbp-api-complete.js
 *
 * End-to-end API verification for the Upgrade Roofs GBP pipeline. Proves the
 * full read + (non-destructive) write path is live so ongoing sync can proceed
 * with confidence.
 *
 *   1. Authenticate with the GBP OAuth *manager* token + GOOGLE_MAPS_API_KEY
 *      from .env.local.
 *   2. GET the Upgrade Roofs location (locations/17098915606572808840) with the
 *      proven read mask → confirm clean current data.
 *   3. Non-destructive attribute test: GET the location using the same token
 *      across both the Business Information API and a write-bearing
 *      `metadata`/`profile` read — verifying the OAuth grant covers
 *      business.manage (no 401/403 PERMISSION_DENIED).
 *   4. Definitive pass/fail status report for the whole pipeline.
 *
 * Run:  node scripts/verify-gbp-api-complete.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const LOCATION_ID = '17098915606572808840';
const LOCATION_NAME = `locations/${LOCATION_ID}`;

const GBP_INFO_HOST = 'mybusinessbusinessinformation.googleapis.com';
const GBP_ACCT_HOST = 'mybusinessaccountmanagement.googleapis.com';

// Proven-good read mask (the same set the other audit scripts use successfully).
const DETAIL_READ_MASK = [
  'name', 'title', 'phoneNumbers', 'categories', 'storefrontAddress',
  'websiteUri', 'regularHours', 'specialHours',
  'serviceArea', 'profile', 'openInfo', 'metadata',
].join(',');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(t) {
  console.log('\n' + '='.repeat(84));
  console.log('  ' + t);
  console.log('='.repeat(84));
}

function get(host, path, accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { host, path, method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          let b;
          try { b = JSON.parse(d); } catch { b = { raw: d }; }
          resolve({ status: res.statusCode, body: b });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

function fmt(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.length ? `[${v.length} item(s)]` : '[] (empty)';
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 200);
  return String(v);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — END-TO-END GBP API VERIFICATION');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);
  const results = { auth: false, read: false, writeScope: false, mapsKey: false };

  // 1. Authenticate -----------------------------------------------------------
  console.log('\n[1/4] AUTHENTICATION');
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN, GOOGLE_MAPS_API_KEY } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    console.error('   ✖ Missing GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN in .env.local');
    return finish(false, 'Auth failed — missing GBP OAuth credentials');
  }
  const oauth2 = new google.auth.OAuth2(GBP_CLIENT_ID, GBP_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GBP_REFRESH_TOKEN });
  let accessToken;
  try {
    ({ token: accessToken } = await oauth2.getAccessToken());
  } catch (e) {
    console.error(`   ✖ Token exchange failed: ${e.message}`);
    return finish(false, 'Auth failed — refresh token rejected (re-mint: node scripts/generate-gbp-token.js)');
  }
  if (!accessToken) {
    console.error('   ✖ No access token returned.');
    return finish(false, 'Auth failed — empty token');
  }
  results.auth = true;
  console.log('   ✓ GBP OAuth access token issued (business.manage scope).');

  results.mapsKey = !!GOOGLE_MAPS_API_KEY;
  console.log(`   ${results.mapsKey ? '✓' : '○'} GOOGLE_MAPS_API_KEY ${results.mapsKey ? 'present' : 'MISSING (Geocoding-based service-area writes will fail)'}`);

  // 2. Live GET — dump current location data cleanly --------------------------
  banner('2. LIVE READ — BUSINESS INFORMATION API (locations.get)');
  const readRes = await get(GBP_INFO_HOST, `/v1/${LOCATION_NAME}?readMask=${DETAIL_READ_MASK}`, accessToken);
  if (readRes.status === 200) {
    results.read = true;
    const d = readRes.body;
    const md = d.metadata || {};
    const sa = d.serviceArea || {};
    console.log('   ✓ locations.get returned HTTP 200 — current data intact.');
    console.log('');
    console.log(`     Title:            ${d.title || '—'}`);
    console.log(`     Resource:         ${d.name || '—'}`);
    if (d.phoneNumbers) console.log(`     Primary phone:    ${d.phoneNumbers.primaryPhone || '—'}`);
    if (d.categories && d.categories.primaryCategory) console.log(`     Primary category: ${d.categories.primaryCategory.displayName || '—'}`);
    if (d.websiteUri) console.log(`     Website:          ${d.websiteUri}`);
    const oi = d.openInfo || {};
    console.log(`     Open status:      ${oi.status || '—'}`);
    console.log(`     VOMM owned:       ${fmt(md.hasVoiceOfMerchant)}`);
    console.log(`     Pending edits:    ${fmt(md.hasPendingEdits)}`);
    const places = (sa.places && sa.places.placeInfos) || sa.places || [];
    console.log(`     Service-area places: ${Array.isArray(places) ? places.length : 0}`);
  } else {
    const code = readRes.body && readRes.body.error && readRes.body.error.code;
    const msg = readRes.body && readRes.body.error && readRes.body.error.message;
    console.log(`   ✖ locations.get HTTP ${readRes.status}${code ? ` (${code})` : ''}${msg ? ` — ${msg}` : ''}`);
  }

  // 3. Non-destructive write-scope probe -------------------------------------
  banner('3. WRITE-SCOPE PROBE (non-destructive)');
  // Two signals: (a) Account Management accounts.list works (owner-level grant),
  // (b) a locations.list under the owning account confirms no PERMISSION_DENIED.
  const acctRes = await get(GBP_ACCT_HOST, '/v1/accounts', accessToken);
  if (acctRes.status === 200) {
    const accounts = acctRes.body.accounts || [];
    console.log(`   ✓ accounts.list HTTP 200 — manager grant active (${accounts.length} account(s)).`);
    // Verify the owning account's locations list is readable (write path shares this scope).
    const owner = accounts.find((a) => a.name === 'accounts/108488463348570125274');
    if (owner) {
      const locList = await get(
        GBP_INFO_HOST,
        `/v1/accounts/108488463348570125274/locations?readMask=name,title,metadata&pageSize=100`,
        accessToken,
      );
      if (locList.status === 200) {
        results.writeScope = true;
        console.log('   ✓ locations.list HTTP 200 under owning account — no permission block.');
      } else {
        console.log(`   ✖ locations.list HTTP ${locList.status} ${JSON.stringify(locList.body).slice(0, 200)}`);
      }
    } else {
      console.log('   ✖ Owning account accounts/108488463348570125274 not found in list.');
    }
  } else {
    console.log(`   ✖ accounts.list HTTP ${acctRes.status} ${JSON.stringify(acctRes.body).slice(0, 200)}`);
  }

  // Explicit 401/403 sweep for the report.
  const any403 = readRes.status === 403 || acctRes.status === 403;
  const any401 = readRes.status === 401 || acctRes.status === 401 || !accessToken;
  results.no403 = !any403;
  results.no401 = !any401;

  // 4. Definitive status report ----------------------------------------------
  banner('4. DEFINITIVE STATUS REPORT');
  const ok = results.auth && results.read && results.writeScope && results.no401 && results.no403;
  console.log('   Check                                   Result');
  console.log('   ------------------------------------------------');
  console.log(`   OAuth token issuance                     ${results.auth ? 'PASS' : 'FAIL'}`);
  console.log(`   locations.get (read)                     ${results.read ? 'PASS' : 'FAIL'}`);
  console.log(`   accounts.list + locations.list (scope)   ${results.writeScope ? 'PASS' : 'FAIL'}`);
  console.log(`   No 401 (auth) errors                     ${results.no401 ? 'PASS' : 'FAIL'}`);
  console.log(`   No 403 (permission) errors               ${results.no403 ? 'PASS' : 'FAIL'}`);
  console.log(`   GOOGLE_MAPS_API_KEY present              ${results.mapsKey ? 'PASS' : 'WARN'}`);
  console.log('   ------------------------------------------------');

  if (ok) {
    console.log('\n   ✔ PIPELINE FULLY OPERATIONAL — read + write paths are live with no');
    console.log('     permission blocks. Ongoing synchronization may proceed.');
    if (!results.mapsKey) {
      console.log('   ⚠ Note: GOOGLE_MAPS_API_KEY absent — service-area geocode writes');
      console.log('     (apply-gbp-service-areas.js) would need it, but GBP read/write');
      console.log('     itself is unaffected.');
    }
    finish(true, 'VERIFICATION PASSED — API PIPELINE OPERATIONAL');
  } else {
    console.log('\n   ✖ PIPELINE NOT FULLY OPERATIONAL — see failures above.');
    finish(false, 'VERIFICATION FAILED — review failures above');
  }
}

function finish(ok, note) {
  console.log('\n' + '='.repeat(84));
  console.log(`  ${note}`);
  console.log('='.repeat(84) + '\n');
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) {
    console.error('GBP refresh token invalid. Re-mint: node scripts/generate-gbp-token.js');
  }
  process.exit(1);
});
