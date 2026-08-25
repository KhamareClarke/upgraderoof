/**
 * scripts/apply-gbp-service-areas.js
 *
 * Finalize the Upgrade Roofs Google Business Profile service area using the
 * newly provided Google Maps API key.
 *
 *   1. Authenticate with the GBP OAuth *manager* token in .env.local
 *      (GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN).
 *   2. Resolve real Google place IDs for the regional service footprint via the
 *      Geocoding API, using GOOGLE_MAPS_API_KEY from .env.local.
 *   3. Build the Business Information API `serviceArea` payload
 *      (businessType CUSTOMER_AND_BUSINESS_LOCATION + places.placeInfos).
 *   4. PATCH locations/17098915606572808840 and print the confirmation.
 *
 * Regions (Cheshire + surrounding towns around Sandbach):
 *   Cheshire, Crewe, Macclesfield, Sandbach, Congleton,
 *   Nantwich, Middlewich, Knutsford, Winsford, Northwich.
 *
 * Run:  node scripts/apply-gbp-service-areas.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const { google } = require('googleapis');
const https = require('https');

const LOCATION_ID = '17098915606572808840';
const LOCATION_NAME = `locations/${LOCATION_ID}`;

const GBP_INFO_HOST = 'mybusinessbusinessinformation.googleapis.com';
const GBP_ACCT_HOST = 'mybusinessaccountmanagement.googleapis.com';
const GEOCODE_HOST = 'maps.googleapis.com';

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

/** Geocoding API lookup of one region -> place_id (or null). */
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

function fmt(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.length ? `[${v.length} item(s)]` : '[] (empty)';
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 240);
  return String(v);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner('UPGRADE ROOFS — APPLY GBP SERVICE AREAS');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

  // 1. Authenticate
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN, GOOGLE_MAPS_API_KEY } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    console.error('Missing GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN in .env.local');
    process.exit(1);
  }
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Missing GOOGLE_MAPS_API_KEY in .env.local');
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

  // 2. Resolve region place IDs via Geocoding API
  banner('2. RESOLVE REGION PLACE IDS (GEOCODING API)');
  const placeInfos = [];
  for (const region of SERVICE_REGIONS) {
    const geo = await geocodeRegion(region, GOOGLE_MAPS_API_KEY);
    if (geo && geo.status === 'OK' && geo.results && geo.results[0]) {
      const res = geo.results[0];
      const name = res.formatted_address || region;
      const types = res.types || [];
      const kind = types.some((t) => /locality|postal_town|administrative_area|region|sublocality|county/i.test(t))
        ? 'region'
        : 'point';
      placeInfos.push({ placeName: name, placeId: res.place_id });
      console.log(`   ✓ ${region.padEnd(28)} → ${res.place_id}  (${name})  [${kind}]`);
    } else {
      const status = geo && geo.status ? geo.status : 'no response';
      const err = geo && geo.error_message ? ` — ${geo.error_message}` : '';
      console.log(`   ✖ ${region.padEnd(28)} → ${status}${err}`);
    }
  }

  if (!placeInfos.length) {
    console.log('\n   No valid place IDs resolved. Aborting (will not PATCH empty data).');
    finish('SERVICE AREA NOT UPDATED (no place IDs resolved)');
    return;
  }

  // 3. Build payload
  champion('3. BUILD serviceArea PAYLOAD');
  const patchBody = {
    serviceArea: {
      businessType: 'CUSTOMER_AND_BUSINESS_LOCATION',
      places: { placeInfos },
    },
  };
  console.log(`   businessType: CUSTOMER_AND_BUSINESS_LOCATION`);
  console.log(`   placeInfos:   ${placeInfos.length}`);

  // 4. PATCH
  banner('4. PATCH locations/' + LOCATION_ID);
  const pRes = await patch(
    GBP_INFO_HOST,
    `/v1/${LOCATION_NAME}?updateMask=serviceArea`,
    accessToken,
    patchBody,
  );

  if (pRes.status === 200) {
    console.log('   ✓ SERVICE AREA UPDATED SUCCESSFULLY (HTTP 200).');
    const rsa = pRes.body && pRes.body.serviceArea;
    if (rsa) {
      console.log(`     businessType: ${rsa.businessType || '—'}`);
      const rPlaces = (rsa.places && rsa.places.placeInfos) || (rsa.places || []);
      console.log(`     places:       ${rPlaces.length}`);
      for (const p of rPlaces) {
        console.log(`       - ${p.placeName || p.displayName || '(unnamed)'}  [${p.placeId}]`);
      }
    }
    finish('SERVICE AREA UPDATE SUCCEEDED');
  } else {
    console.log(`   ✖ PATCH failed (HTTP ${pRes.status}):`);
    console.log(`     ${JSON.stringify(pRes.body).slice(0, 800)}`);
    finish('SERVICE AREA UPDATE FAILED — see error above');
  }
}

function champion(t) { banner(t); }

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
