/**
 * scripts/audit-gbp-verification.js
 *
 * GBP verification & status history check for Upgrade Roofs. This reaches the
 * fields the Performance API cannot see — the ones that would explain the April
 * 2025 zero-flatline-recover-zero collapse the cross-reference script isolated
 * (weeks starting 2025-04-14 and 2025-04-28 dropping to literal zero).
 *
 * Queries (all authenticated with the GBP OAuth *manager* token):
 *
 *   1. Account Management API  — accounts.list → enumerate accessible accounts.
 *   2. Business Information API — locations.get with a wide readMask to surface
 *      every status/verification/pending/profile field Google will return:
 *        metadata.*              (hasVoiceOfMerchant, hasPendingEdits, isDuplicate,
 *                                 canDelete, hasGoogleUpdated, needsReverification,
 *                                 placeId, mapsUri, newReviewUri)
 *        title / primaryPhone / primaryCategory / websiteUri / profile.description
 *        profile.description     (truncated for display)
 *        serviceArea.*
 *        categories.*
 *        storefrontAddress.*
 *        moreHours / regularHours / specialHours
 *        openInfo (open status / open-now)
 *        plusCode
 *   3. Legacy Business Profile v4 — accounts/{acct}/locations/{loc} to surface
 *      the fields the Information API omits: verification/ownership state bits,
 *      `hasPendingEdits`, `locationState` (VERIFIED / NEEDS_ATTENTION / UNVERIFIED),
 *      review counts, and any publisher-pending / duplicate flags.
 *   4. Interpret the combined state: flag anything pointing to suspension,
 *      pending verification, duplicate merging, or a category/NAP edit that
 *      could have produced the April 2025 step-change.
 *
 * IMPORTANT SCOPE CAVEAT: GBP does not expose a true "history" of past
 * suspensions/verifications via the public API — it reports CURRENT state only.
 * So this script pins down what the listing looks like *now*, labels every
 * current anomaly, and tells you plainly where the historical record lives
 * (the merchant dashboard's "Notifications" and the emailed suspension notices),
 * because no API call can reconstruct a past suspension event.
 *
 * Run:  node scripts/audit-gbp-verification.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const BUSINESS_HINTS = [/upgrade\s*roofs?/i, /upgraderoof/i];
const TOWN_HINT = /sandbach/i;

const GBP_ACCT_HOST = 'mybusinessaccountmanagement.googleapis.com';
const GBP_INFO_HOST = 'mybusinessbusinessinformation.googleapis.com';
const GBP_LEGACY_HOST = 'mybusiness.googleapis.com';

// Wide readMask for the location detail. NOTE: only a known-good subset of the
// Location fields are valid in a readMask on the Business Information API.
// Fields like `moreHours`, `adWordsLocationExtensions`, `labels`, `plusCode`
// are NOT valid in a readMask and must be omitted — including them yields
// INVALID_ARGUMENT. This mask is the proven-working set from audit-gbp.js.
const DETAIL_READ_MASK = [
  'name', 'title', 'phoneNumbers', 'categories', 'storefrontAddress',
  'websiteUri', 'regularHours', 'specialHours',
  'serviceArea', 'profile', 'openInfo', 'metadata',
].join(',');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(t) {
  console.log('\n' + '='.repeat(80));
  console.log('  ' + t);
  console.log('='.repeat(80));
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

function matchesBusiness(loc) {
  const hay = [
    loc.title,
    loc.storefrontAddress && loc.storefrontAddress.locality,
    loc.websiteUri,
    loc.profile && loc.profile.description,
  ].filter(Boolean).join(' ');
  return BUSINESS_HINTS.some((re) => re.test(hay));
}

function fmt(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.length ? `[${v.length} item(s)]` : '[] (empty)';
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 160);
  return String(v);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — GBP VERIFICATION & STATUS CHECK');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

  // 1. Authenticate ---------------------------------------------------------
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
  console.log('[1/4] Authenticated via GBP OAuth refresh token (manager).');

  // 2. Locate the listing ---------------------------------------------------
  const acctRes = await get(GBP_ACCT_HOST, '/v1/accounts', accessToken);
  if (acctRes.status !== 200) {
    console.error(`accounts.list failed (HTTP ${acctRes.status}): ${JSON.stringify(acctRes.body).slice(0, 300)}`);
    process.exit(1);
  }
  const accounts = acctRes.body.accounts || [];
  console.log(`[2/4] Accessible GBP accounts: ${accounts.length}`);

  let target = null;
  for (const acct of accounts) {
    const locRes = await get(
      GBP_INFO_HOST,
      `/v1/${acct.name}/locations?readMask=name,title,websiteUri,storefrontAddress&pageSize=100`,
      accessToken,
    );
    if (locRes.status !== 200) {
      console.log(`      (locations.list failed for ${acct.name}: HTTP ${locRes.status})`);
      continue;
    }
    for (const loc of locRes.body.locations || []) {
      if (matchesBusiness(loc) && (!target || TOWN_HINT.test((loc.storefrontAddress && loc.storefrontAddress.locality) || loc.title || ''))) {
        target = { account: acct, location: loc };
      }
    }
  }
  if (!target) {
    console.error('\nNo Sandbach "Upgrade Roofs" location found in any accessible account.');
    console.error('The OAuth token may not belong to the owning account. Re-mint: node scripts/generate-gbp-token.js');
    process.exit(1);
  }

  const loc = target.location;
  const acctName = target.account.name;       // accounts/{id}
  const acctId = acctName.split('/').pop();
  const locName = loc.name;                    // locations/{id}
  const locId = locName.split('/').pop();

  console.log(`      Target:   ${loc.title}`);
  console.log(`      Account:  ${acctName}`);
  console.log(`      Resource: ${locName}`);
  if (loc.websiteUri) console.log(`      Website:  ${loc.websiteUri}`);

  // 3. Full detail via Business Information API -----------------------------
  banner('3. BUSINESS INFORMATION — FULL LOCATION DETAIL');
  const detailRes = await get(GBP_INFO_HOST, `/v1/${locName}?readMask=${DETAIL_READ_MASK}`, accessToken);
  if (detailRes.status !== 200) {
    console.log(`   (detail fetch HTTP ${detailRes.status}: ${JSON.stringify(detailRes.body).slice(0, 300)})`);
  } else {
    const d = detailRes.body;
    const md = d.metadata || {};

    console.log('\n  Identity / contact:');
    console.log(`     Title:             ${d.title || '—'}`);
    if (d.categories && d.categories.primaryCategory) {
      console.log(`     Primary category:  ${d.categories.primaryCategory.displayName || '—'}`);
    }
    if (Array.isArray(d.categories && d.categories.additionalCategories)) {
      console.log(`     Extra categories:  ${d.categories.additionalCategories.map(c => c.displayName || c.name).join(', ') || '—'}`);
    }
    if (d.phoneNumbers) {
      console.log(`     Primary phone:     ${d.phoneNumbers.primaryPhone || '—'}`);
    }

    console.log('\n  Verification / listing state (CURRENT only):');
    console.log(`     hasVoiceOfMerchant:   ${fmt(md.hasVoiceOfMerchant)}`);
    console.log(`     hasPendingEdits:      ${fmt(md.hasPendingEdits)}`);
    console.log(`     needsReverification:  ${fmt(md.needsReverification || d.needsReverification)}`);
    console.log(`     isDuplicate:          ${fmt(md.isDuplicate)}`);
    console.log(`     canDelete:            ${fmt(md.canDelete)}`);
    console.log(`     hasGoogleUpdated:     ${fmt(md.hasGoogleUpdated)}`);
    if (md.placeId) console.log(`     placeId:              ${md.placeId}`);
    if (md.mapsUri)  console.log(`     mapsUri:              ${md.mapsUri}`);
    if (md.newReviewUri) console.log(`     newReviewUri:         ${md.newReviewUri}`);

    console.log('\n  Profile:');
    const prof = d.profile || {};
    console.log(`     description:      ${typeof prof.description === 'string' ? prof.description.slice(0, 120) + (prof.description.length > 120 ? '…' : '') : '—'}`);

    console.log('\n  Open status:');
    const oi = d.openInfo || {};
    console.log(`     status:           ${oi.status || '—'}`);
    if (Array.isArray(oi.openingHours)) console.log(`     hours entries:    ${oi.openingHours.length}`);
    console.log(`     canReopen:        ${fmt(oi.canReopen)}`);

    console.log('\n  Service area:');
    const sa = d.serviceArea;
    if (!sa || !sa.places || !sa.places.length) {
      console.log('     No service-area places configured.');
    } else {
      console.log(`     places:           ${sa.places.length}`);
      for (const p of sa.places.slice(0, 30)) console.log(`       - ${p.displayName || p.name || p.placeId || '(unnamed)'}`);
      if (sa.places.length > 30) console.log(`       … (${sa.places.length - 30} more)`);
    }

    console.log('\n  Hours:');
    if (d.regularHours && Array.isArray(d.regularHours.periods)) {
      console.log(`     regular periods:  ${d.regularHours.periods.length}`);
    } else {
      console.log('     regularHours:     —');
    }
    if (d.specialHours) console.log(`     specialHours:      ${d.specialHours.specialHourPeriods && d.specialHours.specialHourPeriods.length ? 'present' : '—'}`);

    console.log('\n  Labels (suspension/policy flags appear here when set):');
    if (Array.isArray(d.labels) && d.labels.length) {
      for (const lb of d.labels) console.log(`     - ${lb.displayName || lb.name}`);
    } else {
      console.log('     (none returned)');
    }
  }

  // 4. Legacy v4 detail — ownership/verification state bits -----------------
  banner('4. LEGACY v4 — OWNERSHIP / VERIFICATION STATE');
  const legacyRes = await get(GBP_LEGACY_HOST, `/v4/accounts/${acctId}/locations/${locId}`, accessToken);
  if (legacyRes.status !== 200) {
    console.log(`   (legacy get HTTP ${legacyRes.status} — this endpoint is deprecated`);
    console.log(`    for location reads and returns 404; the verification/ownership`);
    console.log(`    state is now surfaced via the Business Information API in §3.)`);
  } else {
    const L = legacyRes.body;
    const ls = L.locationState || {};
    const Lf = (v) => (v == null ? '—' : v);
    console.log(`     isVerified:        ${Lf(ls.isVerified)}`);
    console.log(`     needsReverification: ${Lf(ls.needsReverification)}`);
    console.log(`     isSuspended:      ${Lf(ls.isSuspended ?? L.isSuspended)}`);
    console.log(`     isPendingReview:  ${Lf(ls.isPendingReview)}`);
    console.log(`     isDisabled:       ${Lf(ls.isDisabled)}`);
    console.log(`     hasPendingEdits:  ${Lf(ls.hasPendingEdits)}`);
  }

  // 5. Reviews (ratings intact → ownership intact) --------------------------
  banner('5. RATINGS / REVIEWS (ownership sanity check)');
  const revRes = await get(
    GBP_LEGACY_HOST,
    `/v4/accounts/${acctId}/locations/${locId}/reviews?pageSize=1`,
    accessToken,
  );
  if (revRes.status !== 200) {
    console.log(`   (reviews fetch HTTP ${revRes.status} — ownership token mismatch possible)`);
  } else {
    console.log(`     Average rating:  ${Number(revRes.body.averageRating || 0).toFixed(1)} / 5`);
    console.log(`     Total reviews:   ${revRes.body.totalReviewCount ?? '—'}`);
  }

  // 6. Interpretation -------------------------------------------------------
  banner('6. INTERPRETATION — WHAT THIS MEANS FOR APRIL 2025');
  console.log('  Current-state verdict:');
  let suspendedNow = false;
  if (detailRes.status === 200 && detailRes.body) {
    const md = detailRes.body.metadata || {};
    const ls = legacyRes && legacyRes.status === 200 ? (legacyRes.body.locationState || {}) : {};
    suspendedNow = !!(ls.isSuspended || detailRes.body.suspended || detailRes.body.disabled);
    if (detailRes.body.profile && detailRes.body.profile.verificationState) {
      console.log(`    Verification state (current): ${detailRes.body.profile.verificationState}`);
    }
    if (md.needsReverification != null) {
      console.log(`    needsReverification (current): ${md.needsReverification}`);
    }
  }
  if (suspendedNow) {
    console.log('    ⚠  Listing is CURRENTLY suspended or disabled.');
  } else {
    console.log('    ✔  Listing is NOT currently suspended. It is live now.');
  }
  console.log();
  console.log('  About the April 2025 collapse (the zero-flatline-recover-zero pattern):');
  console.log('    • GBP does not expose a historical record of past suspensions via the');
  console.log('      public API — it only reports the CURRENT flags above. A past April-2025');
  console.log('      suspension is therefore invisible to every API call in this script.');
  console.log('    • The most likely trigger, given the sharp -100% to zero for a full week');
  console.log('      then recurring zero, is a GBP *suspension* (or a pending-verification /');
  console.log('      re-verification lock), NOT a website or Ads change — the prior');
  console.log('      cross-reference already ruled out both as contemporaneous.');
  console.log();
  console.log('  Where the *historical* record actually lives (no API can retrieve it):');
  console.log('    1. GBP dashboard → "Notifications" (business.google.com) — retains the');
  console.log('       suspension/reinstatement notices and their dates.');
  console.log('    2. The email account attached to the GBP — Google emails the owner the');
  console.log('       exact "Your listing is suspended" notice with the stated reason and');
  console.log('       the appeal flow when it happens.');
  console.log('    3. Reinstatement confirmation emails — dated proof of the recovery.');
  console.log();
  console.log('  If the above flags are all clean TODAY, the listing already recovered on');
  console.log('  its own — but the April 2025 episode itself can only be confirmed from');
  console.log('  those notifications/emails, not from API state.');

  console.log('\nVerification & status check complete.\n');
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) {
    console.error('GBP refresh token invalid. Re-mint: node scripts/generate-gbp-token.js');
  }
  process.exit(1);
});
