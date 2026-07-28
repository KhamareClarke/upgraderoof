/**
 * scripts/audit-gbp-live.js
 *
 * Live Google Business Profile check for Upgrade Roofs (Sandbach), using
 * the dedicated GBP OAuth credentials in .env.local:
 *   GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN
 * (a separate OAuth client from the Ads one, minted with the
 *  business.manage scope).
 *
 *   1. Authenticate with the GBP APIs
 *   2. Find the Upgrade Roofs (Sandbach) location
 *   3. Output verification status, average star rating, and the
 *      3 most recent reviews
 *
 * Run:  node scripts/audit-gbp-live.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const BUSINESS_HINTS = [/upgrade\s*roofs?/i, /upgraderoof/i];
const TOWN_HINT = /sandbach/i;

function banner(t) {
  console.log('\n' + '='.repeat(68));
  console.log('  ' + t);
  console.log('='.repeat(68));
}

function get(host, path, accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { host, path, method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
      res => { let d = ''; res.on('data', c => (d += c)); res.on('end', () => {
        let p; try { p = JSON.parse(d); } catch { p = { raw: d }; }
        resolve({ status: res.statusCode, body: p });
      }); }
    );
    req.on('error', reject);
    req.end();
  });
}

function matchesBusiness(loc) {
  const hay = [
    loc.title,
    loc.storefrontAddress && loc.storefrontAddress.locality,
    loc.websiteUri,
  ].filter(Boolean).join(' ');
  return BUSINESS_HINTS.some(re => re.test(hay));
}

const STAR = n => '★'.repeat(n) + '☆'.repeat(5 - n);

async function main() {
  banner('GBP LIVE AUDIT — Upgrade Roofs (Sandbach)');
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
  if (!accessToken) { console.error('GBP OAuth access token exchange failed.'); process.exit(1); }
  console.log('[1/3] Authenticated via GBP OAuth refresh token.');

  // 2. Accounts → locations → find Upgrade Roofs ------------------------------
  const acctRes = await get('mybusinessaccountmanagement.googleapis.com', '/v1/accounts', accessToken);
  if (acctRes.status !== 200) {
    console.error(`\naccounts.list failed (HTTP ${acctRes.status}):`, JSON.stringify(acctRes.body).slice(0, 400));
    const raw = JSON.stringify(acctRes.body);
    console.error('\n' + '!'.repeat(68));
    console.error('  GBP API BLOCKED AT GCP PROJECT LEVEL — ONE-TIME FIX REQUIRED');
    console.error('!'.repeat(68));
    if (/quota_limit_value\\?":\\?"0|RATE_LIMIT_EXCEEDED|Quota exceeded/i.test(raw)) {
      console.error('\nCAUSE: My Business Account Management API quota is 0 req/min for');
      console.error('GCP project 379663985013 (upgraderoofs-api). This is a project-level');
      console.error('cap — no credential can bypass it.');
      console.error('\nFIX: GCP Console → APIs & Services → Enabled APIs → "My Business');
      console.error('Account Management API" → Quotas → request an increase (60/min is');
      console.error('ample). New GCP projects get 0 until a quota increase is approved.');
    }
    console.error('\nALSO REQUIRED (separate API, also blocked):');
    console.error('  Enable "My Business Business Information API":');
    console.error('  https://console.developers.google.com/apis/api/mybusinessbusinessinformation.googleapis.com/overview?project=379663985013');
    console.error('\nBoth fixes are in GCP Console project 379663985013, then re-run:');
    console.error('  node scripts/audit-gbp-live.js\n');
    process.exit(1);
  }
  const accounts = acctRes.body.accounts || [];
  console.log(`[2/3] Accessible GBP accounts: ${accounts.length}`);

  let target = null;
  for (const acct of accounts) {
    const locRes = await get(
      'mybusinessbusinessinformation.googleapis.com',
      `/v1/${acct.name}/locations?readMask=name,title,websiteUri,storefrontAddress,metadata&pageSize=100`,
      accessToken);
    if (locRes.status !== 200) {
      console.log(`      (locations.list failed for ${acct.name}: HTTP ${locRes.status} — ${JSON.stringify(locRes.body).slice(0, 200)})`);
      continue;
    }
    const locations = locRes.body.locations || [];
    console.log(`      - ${acct.accountName || acct.name}: ${locations.length} location(s)`);
    for (const loc of locations) {
      const isMatch = matchesBusiness(loc);
      console.log(`          ${loc.title}  [${loc.name}]${isMatch ? '  <-- MATCH' : ''}`);
      if (!target && isMatch) target = { account: acct, location: loc };
      if (isMatch && target && TOWN_HINT.test((loc.storefrontAddress && loc.storefrontAddress.locality) || loc.title || '')) {
        target = { account: acct, location: loc };
      }
    }
  }

  if (!target) {
    console.error('\nNo location matching "Upgrade Roofs" found in any accessible account.');
    process.exit(1);
  }

  const loc = target.location;
  const locName = loc.name; // accounts/{acct}/locations/{id}
  console.log(`\n      Target: ${loc.title}`);
  console.log(`      Resource: ${locName}`);
  if (loc.storefrontAddress) {
    const a = loc.storefrontAddress;
    console.log(`      Address: ${(a.addressLines || []).join(', ')}, ${a.locality || ''} ${a.postalCode || ''}`.trim());
  }
  if (loc.websiteUri) console.log(`      Website: ${loc.websiteUri}`);

  // 3. Verification status + rating + reviews ---------------------------------
  banner('3. VERIFICATION, RATING & REVIEWS');

  // Verification status + profile details (Business Information API v1)
  const detail = await get(
    'mybusinessbusinessinformation.googleapis.com',
    `/v1/${locName}?readMask=name,title,metadata,profile,phoneNumbers,categories`,
    accessToken);
  if (detail.status === 200) {
    const d = detail.body;
    const md = d.metadata || {};
    console.log(`\nVerification status:`);
    console.log(`  Voice of merchant:      ${md.hasVoiceOfMerchant != null ? md.hasVoiceOfMerchant : '—'}`);
    console.log(`  Pending edits:          ${md.hasPendingEdits != null ? md.hasPendingEdits : '—'}`);
    console.log(`  Place ID:               ${md.placeId || '—'}`);
    console.log(`  Maps URL:               ${md.mapsUri || '—'}`);
    console.log(`  New review URL:         ${md.newReviewUri || '—'}`);
    if (d.categories && d.categories.primaryCategory) {
      console.log(`  Primary category:       ${d.categories.primaryCategory.displayName || '—'}`);
    }
    if (d.phoneNumbers) {
      console.log(`  Phone:                  ${d.phoneNumbers.primaryPhone || '—'}`);
    }
  } else {
    console.log(`(location detail fetch failed: HTTP ${detail.status} — ${JSON.stringify(detail.body).slice(0, 300)})`);
  }

  // Reviews + average rating: only available via the legacy My Business v4 API
  const acctId = target.account.name.split('/').pop();
  const locId = locName.split('/').pop();
  const revRes = await get(
    'mybusiness.googleapis.com',
    `/v4/accounts/${acctId}/locations/${locId}/reviews?pageSize=3&orderBy=updateTime%20desc`,
    accessToken);

  if (revRes.status !== 200) {
    console.log(`\n(reviews fetch failed: HTTP ${revRes.status} — ${JSON.stringify(revRes.body).slice(0, 300)})`);
    console.log('The legacy My Business v4 reviews endpoint may not be enabled for this project.');
    process.exit(0);
  }

  const avg = revRes.body.averageRating;
  const total = revRes.body.totalReviewCount;
  console.log(`\nAverage rating:  ${avg != null ? Number(avg).toFixed(1) + ' / 5  ' + STAR(Math.round(avg)) : '—'}`);
  console.log(`Total reviews:   ${total != null ? total : '—'}`);

  const reviews = revRes.body.reviews || [];
  banner(`3 MOST RECENT REVIEWS (${reviews.length} returned)`);
  if (!reviews.length) {
    console.log('No reviews returned.');
  }
  const ratingNum = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  for (const r of reviews) {
    const n = ratingNum[r.starRating] || 0;
    const date = r.updateTime ? r.updateTime.slice(0, 10) : (r.createTime || '').slice(0, 10);
    console.log(`\n  ${STAR(n)}  ${r.starRating || ''} — ${r.reviewer && r.reviewer.displayName || 'Anonymous'}  (${date})`);
    if (r.comment) {
      const wrapped = r.comment.replace(/\s+/g, ' ').trim();
      console.log(`  "${wrapped.length > 220 ? wrapped.slice(0, 220) + '…' : wrapped}"`);
    }
    if (r.reviewReply && r.reviewReply.comment) {
      console.log(`  ↳ Owner reply: "${r.reviewReply.comment.slice(0, 160)}${r.reviewReply.comment.length > 160 ? '…' : ''}"`);
    }
  }
  console.log('');
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
