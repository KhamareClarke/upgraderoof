/**
 * scripts/update-gbp-profile.js
 *
 * Programmatic profile update for the Upgrade Roofs Google Business Profile.
 * Two requested changes:
 *
 *   1. REGIONAL SERVICE AREAS — expand geographic reach beyond the base
 *      Sandbach address by setting `serviceArea` to a set of surrounding
 *      region places (Cheshire, Crewe, Macclesfield, and neighbours).
 *   2. MESSAGING / CHAT — enable customer messaging on the listing.
 *
 * Authentication: GBP OAuth *manager* token from .env.local
 *   (GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN).
 *
 * Write path: Business Information API `PATCH /v1/{location}` with an
 * `updateMask`. The location name is the BARE form `locations/{id}`
 * (NOT `accounts/{acct}/locations/{id}`), the same form this project's
 * other GBP scripts use for reads.
 *
 * ── IMPORTANT / HONEST CONSTRAINTS ──────────────────────────────────────────
 * This script is written to be *honest about what the API will actually
 * accept*, rather than to emit a plausible-looking but non-functional call:
 *
 *  A. `serviceArea.places[].placeId` MUST be a real Google region place ID
 *     (e.g. "ChIJ…). These are only obtainable from the Google Places API
 *     (Text Search / Find Place) or the Geocoding API. This repo does NOT have
 *     a Places/Geocoding API key in .env.local, so region IDs cannot be
 *     resolved at runtime. The script therefore:
 *       - tries to resolve region IDs via the Geocoding API only if a
 *         GOOGLE_MAPS_API_KEY / GOOGLE_PLACES_API_KEY is present;
 *       - otherwise reports EXACTLY what is needed, with ready-to-run curl
 *         snippets, and does NOT write a guessed/garbage placeId.
 *
 *  B. MESSAGING / CHAT has NO writable field on the Business Information API.
 *     The `Profile` object only exposes `description`; messaging/chat toggles
 *     (legacy v4 `note`/chat) are NOT writable here — they are controlled in
 *     the merchant dashboard (business.google.com → "Chat"/"Messaging").
 *     The script surfaces this plainly and points to the dashboard toggle.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Run:  node scripts/update-gbp-profile.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const LOCATION_ID = '17098915606572808840';
const LOCATION_NAME = `locations/${LOCATION_ID}`;

const GBP_INFO_HOST = 'mybusinessbusinessinformation.googleapis.com';
const GBP_ACCT_HOST = 'mybusinessaccountmanagement.googleapis.com';
const GEOCODE_HOST = 'maps.googleapis.com';

/** Region place names we intend to add (GBP caps service-area places at 20). */
const SERVICE_REGIONS = [
  'Cheshire, England',
  'Crewe, Cheshire, England',
  'Macclesfield, Cheshire, England',
  'Sandbach, Cheshire, England',
  'Congleton, Cheshire, England',
  'Nantwich, Cheshire, England',
  'Middlewich, Cheshire, England',
  'Knutsford, Cheshire, England',
  'Winsford, Cheshire, England',
  'Northwich, Cheshire, England',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(t) {
  console.log('\n' + '='.repeat(80));
  console.log('  ' + t);
  console.log('='.repeat(80));
}

function req(method, host, path, accessToken, bodyObj) {
  return new Promise((resolve, reject) => {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = bodyObj ? JSON.stringify(bodyObj) : null;
    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    const r = https.request({ host, path, method, headers }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let b;
        try { b = JSON.parse(d); } catch { b = { raw: d }; }
        resolve({ status: res.statusCode, body: b });
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

const get = (host, path, t) => req('GET', host, path, t);
const patch = (host, path, t, body) => req('PATCH', host, path, t, body);

function fmt(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.length ? `[${v.length} item(s)]` : '[] (empty)';
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 240);
  return String(v);
}

/** Geocoding API region lookup (only works if a Maps/Geocoding key is present). */
function geocodeRegion(region, key) {
  const q = encodeURIComponent(region);
  const path = `/maps/api/geocode/json?address=${q}&region=gb&key=${encodeURIComponent(key)}`;
  return new Promise((resolve, reject) => {
    https.get({ host: GEOCODE_HOST, path }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let b;
        try { b = JSON.parse(d); } catch { b = { raw: d }; }
        resolve(b);
      });
    }).on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// 1. Authenticate
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — GBP PROFILE UPDATE (SERVICE AREA + MESSAGING)');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

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
  console.log('[auth] Authenticated via GBP OAuth refresh token (manager).');

  // ---------------------------------------------------------------------------
  // 2. Verify ownership & read current state
  // ---------------------------------------------------------------------------
  banner('2. CURRENT STATE (pre-update read)');
  const acctRes = await get(GBP_ACCT_HOST, '/v1/accounts', accessToken);
  let accessible = 0;
  if (acctRes.status === 200) accessible = (acctRes.body.accounts || []).length;
  console.log(`   Accessible GBP accounts: ${accessible}`);

  const readMask = 'name,title,serviceArea,profile,metadata,categories';
  const cur = await get(GBP_INFO_HOST, `/v1/${LOCATION_NAME}?readMask=${readMask}`, accessToken);
  if (cur.status !== 200) {
    console.error(`   Pre-read failed (HTTP ${cur.status}): ${JSON.stringify(cur.body).slice(0, 400)}`);
    console.error('   The token likely cannot see this location. Re-mint with the OWNING account:');
    console.error('     node scripts/generate-gbp-token.js');
    process.exit(1);
  }
  const d = cur.body;
  console.log(`   Title:             ${d.title || '—'}`);
  console.log(`   Resource:          ${d.name}`);
  const md = d.metadata || {};
  console.log(`   hasVoiceOfMerchant: ${fmt(md.hasVoiceOfMerchant)}`);
  console.log(`   hasPendingEdits:    ${fmt(md.hasPendingEdits)}`);

  const sa = d.serviceArea;
  console.log('\n   Current service area:');
  if (!sa || !sa.places || !sa.places.length) {
    console.log('     (none configured — this is an ADDITIVE change)');
  } else {
    console.log(`     businessType: ${sa.businessType || '—'}`);
    console.log(`     places:       ${sa.places.length}`);
    for (const p of sa.places.slice(0, 20)) {
      console.log(`       - ${p.placeName || p.displayName || '(unnamed)'}  [${p.placeId}]`);
    }
  }

  const prof = d.profile || {};
  console.log('\n   Current profile / messaging:');
  console.log(`     description (length): ${typeof prof.description === 'string' ? prof.description.length : '—'}`);
  console.log(`     hasTextMessaging:     ${fmt(d.hasTextMessaging)}`);
  console.log(`     hasVoiceMessaging:    ${fmt(d.hasVoiceMessaging)}`);

  // ---------------------------------------------------------------------------
  // 3. Service-area resolution → PATCH
  // ---------------------------------------------------------------------------
  banner('3. SERVICE AREA — ADD REGIONAL PLACES');

  const mapsKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_GEOCODE_API_KEY;

  if (!mapsKey) {
    console.log('   BLOCKED — no Google Maps / Places / Geocoding API key in .env.local.');
    console.log('   The Business Information API requires each service-area place to carry a');
    console.log('   real Google region placeId (e.g. "ChIJ…"). Region placeIds are only');
    console.log('   resolvable via the Places API or Geocoding API, which need an API key.');
    console.log('   This repo has none configured, so region IDs cannot be resolved at runtime.');
    console.log();
    console.log('   To complete this update, do ONE of the following:');
    console.log('   1. Add a key to .env.local as GOOGLE_MAPS_API_KEY=<key> with Geocoding API');
    console.log('      enabled, then re-run this script — it will resolve the regions below');
    console.log('      and issue the PATCH automatically.');
    console.log('   2. Look up the region placeIds yourself and run this PATCH manually:');
    console.log();
    console.log('     curl -X PATCH \\');
    console.log('       "https://mybusinessbusinessinformation.googleapis.com/v1/' + LOCATION_NAME + '?updateMask=serviceArea" \\');
    console.log('       -H "Authorization: Bearer <GBP_ACCESS_TOKEN>" \\');
    console.log('       -H "Content-Type: application/json" \\');
    console.log('       -d \'{ "serviceArea": { "businessType": "CUSTOMER_AND_BUSINESS_LOCATION", "places": { "placeInfos": [');
    console.log('             { "placeName": "Cheshire, UK", "placeId": "<REGION_PLACE_ID>" },');
    console.log('             { "placeName": "Crewe, Cheshire, UK", "placeId": "<REGION_PLACE_ID>" },');
    console.log('             { "placeName": "Macclesfield, Cheshire, UK", "placeId": "<REGION_PLACE_ID>" }');
    console.log('           ] } } }\'');
    console.log();
    console.log('   (Region placeIds can be found cheaply:');
    console.log('     curl "https://maps.googleapis.com/maps/api/geocode/json?address=Cheshire,UK&key=<KEY>"');
    console.log('    → results[0].place_id   — then repeat for Crewe, Macclesfield, etc.)');
    console.log();
    console.log('   ⚠ Not writing a guessed placeId — a fabricated ID would fail the API call');
    console.log('   (INVALID_ARGUMENT) or, worse, associate the wrong region.');
    console.log('\n   The intended regions to add (businessType CUSTOMER_AND_BUSINESS_LOCATION):');
    for (const r of SERVICE_REGIONS) console.log(`     • ${r}`);
    return finish('SERVICE AREA NOT UPDATED (missing Maps/Geocoding API key — see above).');
  }

  // A key is present → resolve region placeIds via Geocoding, then PATCH.
  console.log(`   Using Geocoding API key (region resolution) for ${SERVICE_REGIONS.length} regions …`);
  const placeInfos = [];
  for (const region of SERVICE_REGIONS) {
    const geo = await geocodeRegion(region, mapsKey);
    if (geo && geo.status === 'OK' && geo.results && geo.results[0]) {
      const pl = geo.results[0].place_id;
      // Confirm the result is region-level (not a point), best-effort via types.
      const types = geo.results[0].types || [];
      const name = geo.results[0].formatted_address || region;
      const kind = types.some((t) => /locality|postal_town|administrative_area|region|sublocality/i.test(t))
        ? 'region'
        : 'point';
      placeInfos.push({ placeName: name, placeId: pl });
      console.log(`     ✓ ${region}  →  ${pl}  (${name})  [${kind}]`);
    } else {
      console.log(`     ✖ ${region}  →  ${geo && geo.status ? geo.status : 'no result'}`);
    }
  }

  if (!placeInfos.length) {
    console.log('   No region placeIds resolved. Aborting the PATCH rather than writing empty data.');
    return finish('SERVICE AREA NOT UPDATED (geocode resolution returned nothing usable).');
  }

  console.log(`\n   PATCHing serviceArea with ${placeInfos.length} region place(s) …`);
  const patchBody = {
    serviceArea: {
      businessType: 'CUSTOMER_AND_BUSINESS_LOCATION',
      places: { placeInfos },
    },
  };
  const pRes = await patch(
    GBP_INFO_HOST,
    `/v1/${LOCATION_NAME}?updateMask=serviceArea`,
    accessToken,
    patchBody,
  );
  if (pRes.status === 200) {
    console.log('   ✓ SERVICE AREA UPDATED successfully. Result:');
    const rsa = pRes.body.serviceArea;
    if (rsa) {
      console.log(`     businessType: ${rsa.businessType || '—'}`);
      console.log(`     places:       ${(rsa.places && rsa.places.placeInfos || rsa.places || []).length}`);
      for (const p of (rsa.places && rsa.places.placeInfos) || (rsa.places || [])) {
        console.log(`       - ${p.placeName || p.displayName || '(unnamed)'}  [${p.placeId}]`);
      }
    }
  } else {
    console.log(`   ✖ SERVICE AREA PATCH failed (HTTP ${pRes.status}):`);
    console.log(`     ${JSON.stringify(pRes.body).slice(0, 600)}`);
  }

  // ---------------------------------------------------------------------------
  // 4. Messaging / chat
  // ---------------------------------------------------------------------------
  banner('4. MESSAGING / CHAT — ENABLE');

  console.log('   NOT WRITABLE via the Business Information API.');
  console.log('   The Location + Profile objects expose NO messaging/chat field — the Profile');
  console.log('   object only carries `description`. Legacy v4 `note`/chat fields are not');
  console.log('   writable on the modern Business Information API.');
  console.log();
  console.log('   To enable customer messaging/chat, use the merchant dashboard:');
  console.log('     business.google.com → select "Upgrade Roofs" → "Chat" (or "Messaging")');
  console.log('   and turn on messages. There is no equivalence for this toggle in the public API.');
  console.log();
  console.log('   (For reference, the pre-read showed:');
  console.log(`     hasTextMessaging:  ${fmt(d.hasTextMessaging)}`);
  console.log(`     hasVoiceMessaging: ${fmt(d.hasVoiceMessaging)}`);
  console.log('   — these are read-only signals, not writable switches.)');

  finish('COMPLETE');
}

function finish(note) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${note}`);
  console.log('='.repeat(80) + '\n');
}

main().catch((err) => {
  console.error('\nFATAL:', err.message || err);
  if (/invalid_grant/.test(String(err))) {
    console.error('GBP refresh token invalid. Re-mint: node scripts/generate-gbp-token.js');
  }
  process.exit(1);
});
