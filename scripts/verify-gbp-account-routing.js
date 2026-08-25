/**
 * scripts/verify-gbp-account-routing.js
 *
 * Diagnostic — verifies GBP account → location routing so the other scripts
 * target the correct account with zero ambiguity / cross-wiring.
 *
 *   1. Authenticate with the manager OAuth credentials in .env.local
 *      (GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN).
 *   2. Account Management API `accounts.list` → log each accessible account's
 *      name, type, role, and ID.
 *   3. For each account, list its locations and classify every listing against
 *      the "Upgrade Roofs" brand (title / website / town hints).
 *   4. Print a clear routing verdict: which account index the scripts should
 *      target, and flag any personal / other-brand profiles to avoid.
 *
 * Run:  node scripts/verify-gbp-account-routing.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

// Brand signal used to identify the real business (kept separate from personal
// Google accounts / unrelated profiles the manager token may also be able to see).
const BRAND = {
  nameHints: [/upgrade\s*roofs?/i, /upgraderoof/i],
  townHint: /sandbach/i,
};

const GBP_ACCT_HOST = 'mybusinessaccountmanagement.googleapis.com';
const GBP_INFO_HOST = 'mybusinessbusinessinformation.googleapis.com';

// readMask that returns enough to classify without tripping INVALID_ARGUMENT.
const LOC_READ_MASK = [
  'name', 'title', 'websiteUri', 'storefrontAddress',
  'categories', 'phoneNumbers', 'metadata',
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
          let b; try { b = JSON.parse(d); } catch { b = { raw: d }; }
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
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 160);
  return String(v);
}

// "upgrade roofs" name match OR a Sandbach roofing contractor with matching site.
function classify(loc) {
  const title = loc.title || '';
  const site = loc.websiteUri || '';
  const locality = (loc.storefrontAddress && loc.storefrontAddress.locality) || '';
  const nameHit = BRAND.nameHints.some((re) => re.test(title) || re.test(site));
  const townHit = BRAND.townHint.test(locality) || BRAND.townHint.test(title);
  if (nameHit) return 'BUSINESS (Upgrade Roofs)';
  if (townHit && (/roof/i.test(title) || /roof/i.test(site))) return 'BUSINESS (Upgrade Roofs)';
  return 'other';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — GBP ACCOUNT ROUTING VERIFICATION');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

  // 1. Authenticate -----------------------------------------------------------
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    console.error('Missing GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN in .env.local');
    process.exit(1);
  }
  const oauth2 = new google.auth.OAuth2(GBP_CLIENT_ID, GBP_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GBP_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();
  if (!accessToken) {
    console.error('GBP OAuth access token exchange failed. Re-mint: node scripts/generate-gbp-token.js');
    process.exit(1);
  }
  console.log('[1/3] Authenticated via GBP OAuth refresh token (manager).');

  // 2. List accounts ----------------------------------------------------------
  banner('2. ACCOUNT MANAGEMENT API — ACCESSIBLE ACCOUNTS');
  const acctRes = await get(GBP_ACCT_HOST, '/v1/accounts', accessToken);
  if (acctRes.status !== 200) {
    console.error(`\naccounts.list failed (HTTP ${acctRes.status}): ${JSON.stringify(acctRes.body).slice(0, 500)}`);
    process.exit(1);
  }
  const accounts = acctRes.body.accounts || [];
  console.log(`   Total accessible accounts: ${accounts.length}\n`);

  accounts.forEach((acct, i) => {
    console.log(`   [index ${i}]  name: ${acct.name}`);
    console.log(`               type: ${acct.type || '—'}`);
    console.log(`               role: ${acct.role || '—'}`);
    console.log(`               state: ${acct.state && acct.state.status ? acct.state.status : '—'}`);
    const an = acct.accountName || '';
    const anid = acct.accountNumber || '';
    if (an) console.log(`               accountName: ${an}`);
    if (anid) console.log(`               accountNumber: ${anid}`);
    console.log('');
  });

  // 3. List locations per account, classify -----------------------------------
  banner('3. LOCATIONS PER ACCOUNT — BRAND CLASSIFICATION');
  const report = [];
  for (let i = 0; i < accounts.length; i++) {
    const acct = accounts[i];
    const acctName = acct.name;
    console.log(`\n   Account [index ${i}]  ${acctName}`);

    const locRes = await get(
      GBP_INFO_HOST,
      `/v1/${acctName}/locations?readMask=${LOC_READ_MASK}&pageSize=100`,
      accessToken,
    );
    if (locRes.status !== 200) {
      console.log(`      (locations.list failed: HTTP ${locRes.status})`);
      report.push({ index: i, acctName, match: false, error: `HTTP ${locRes.status}` });
      continue;
    }
    const locs = locRes.body.locations || [];
    console.log(`      locations: ${locs.length}`);
    let matched = null;
    for (const loc of locs) {
      const cls = classify(loc);
      const title = loc.title || '(untitled)';
      const locality = (loc.storefrontAddress && loc.storefrontAddress.locality) || '';
      const site = loc.websiteUri || '';
      const marker = cls === 'BUSINESS (Upgrade Roofs)' ? ' [★ TARGET]' : '';
      console.log(`        - ${title}${locality ? ' (' + locality + ')' : ''}  ${loc.name}`);
      console.log(`            site: ${site || '—'}   ${cls}${marker}`);
      if (cls === 'BUSINESS (Upgrade Roofs)' && !matched) matched = loc;
    }
    if (!locs.length) console.log('        (no locations returned)');
    report.push({ index: i, acctName, match: !!matched, location: matched, locationCount: locs.length });
  }

  // 4. Routing verdict --------------------------------------------------------
  banner('4. ROUTING VERDICT');
  const hits = report.filter((r) => r.match);
  if (hits.length === 0) {
    console.log('   ✖ No "Upgrade Roofs" location found in ANY accessible account.');
    console.log('   The manager token likely does NOT belong to the owning account.');
    console.log('   Re-mint with the business account:  node scripts/generate-gbp-token.js');
  } else if (hits.length === 1) {
    const h = hits[0];
    console.log(`   ✔ Exactly ONE business listing found — routing is unambiguous.`);
    console.log(`     Target account index:   ${h.index}`);
    console.log(`     Target account name:    ${h.acctName}`);
    console.log(`     Target location name:   ${h.location && h.location.name}`);
    console.log(`     Scripts should use:     LOCATION_NAME = '${h.location && h.location.name}'`);
  } else {
    console.log(`   ⚠ Multiple candidates matched. Manual review required:`);
    for (const h of hits) {
      console.log(`     - index ${h.index}: ${h.acctName}  →  ${h.location && h.location.title}  (${h.location && h.location.name})`);
    }
  }

  // Always list the other-brand / personal profiles so nothing is cross-wired.
  console.log('\n   Full cross-wiring guard:');
  for (const r of report) {
    const tag = r.match ? 'BUSINESS (Target)' : 'OTHER / personal (do NOT target)';
    const loc = r.location ? `${r.location.title}  (${r.location.name})` : `(${r.locationCount} location(s), none matching)`;
    console.log(`     [index ${r.index}] ${r.acctName}  →  ${tag}${r.error ? '  [' + r.error + ']' : ''}`);
    if (r.location) console.log(`         ${loc}`);
  }

  finish(`ROUTING VERIFICATION COMPLETE — ${hits.length ? (hits.length === 1 ? 'TARGET CONFIRMED (index ' + hits[0].index + ')' : 'MULTIPLE CANDIDATES — REVIEW') : 'NO TARGET FOUND'}`);
}

function finish(note) {
  console.log('\n' + '='.repeat(84));
  console.log(`  ${note}`);
  console.log('='.repeat(84) + '\n');
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) {
    console.error('GBP refresh token invalid. Re-mint: node scripts/generate-gbp-token.js');
  }
  process.exit(1);
});
