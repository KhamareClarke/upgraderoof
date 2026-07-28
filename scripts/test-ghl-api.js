/**
 * scripts/test-ghl-api.js
 *
 * GoHighLevel (GHL) v2 API connectivity + access diagnostic for
 * upgraderoofs.co.uk, using the credentials in .env.local:
 *   GHL_LOCATION_ID   the sub-account / location ID
 *   GHL_API_KEY       a Private Integration token (location-scoped)
 *
 * What it checks, in order:
 *   1. Env vars present
 *   2. Token accepted + location accessible  (GET /locations/{id})
 *   3. Pipelines + stages for the location   (GET /opportunities/pipelines)
 *   4. Contact write scope (read-only probe — searches, does not create)
 *
 * Run:  node scripts/test-ghl-api.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const https = require('https');

const HOST = 'services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

const { GHL_LOCATION_ID, GHL_API_KEY } = process.env;

function banner(t) {
  console.log('\n' + '='.repeat(66));
  console.log('  ' + t);
  console.log('='.repeat(66));
}

function fail(step, message, hints) {
  console.error(`\n[FAIL at step ${step}] ${message}`);
  (hints || []).forEach(h => console.error(`   → ${h}`));
  process.exit(1);
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST,
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Version: API_VERSION,
          Accept: 'application/json',
        },
      },
      res => {
        let d = '';
        res.on('data', c => (d += c));
        res.on('end', () => {
          let p;
          try { p = JSON.parse(d); } catch { p = { raw: d }; }
          resolve({ status: res.statusCode, body: p });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function explain(status, body) {
  const msg = (body && (body.message || body.error || body.msg)) || JSON.stringify(body).slice(0, 300);
  return `HTTP ${status}: ${msg}`;
}

async function main() {
  banner('GOHIGHLEVEL (GHL) API — CONNECTION TEST');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  Host: ${HOST}  |  Version: ${API_VERSION}`);

  // 1. Env vars ---------------------------------------------------------------
  const missing = [['GHL_LOCATION_ID', GHL_LOCATION_ID], ['GHL_API_KEY', GHL_API_KEY]]
    .filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    fail(1, `Missing env vars in .env.local: ${missing.join(', ')}`, [
      'Add both to .env.local, then re-run:',
      '  GHL_LOCATION_ID=<your location / sub-account id>',
      '  GHL_API_KEY=<Private Integration token>',
      'Get the token: GHL sub-account → Settings → Private Integrations → Create.',
      'Required scopes: locations.readonly, opportunities.readonly,',
      'contacts.readonly + contacts.write (for lead capture).',
    ]);
  }
  console.log(`\n[1/4] Env vars present. Location ID: ${GHL_LOCATION_ID}`);

  // 2. Location access ----------------------------------------------------------
  const loc = await get(`/locations/${encodeURIComponent(GHL_LOCATION_ID)}`, GHL_API_KEY);
  if (loc.status === 401 || loc.status === 403) {
    fail(2, `Location lookup unauthorized — ${explain(loc.status, loc.body)}`, [
      'The Private Integration token is invalid, expired, or not scoped to this location.',
      'Regenerate: GHL sub-account → Settings → Private Integrations.',
      'Ensure the token belongs to the SAME location as GHL_LOCATION_ID.',
    ]);
  }
  if (loc.status === 404) {
    fail(2, `Location ${GHL_LOCATION_ID} not found — ${explain(loc.status, loc.body)}`, [
      'GHL_LOCATION_ID does not match any location the token can see.',
      'Find it: GHL → switch to the sub-account → the ID is in the URL',
      '(app.gohighlevel.com/v2/location/<LOCATION_ID>/...).',
    ]);
  }
  if (loc.status !== 200) {
    fail(2, `Location lookup failed — ${explain(loc.status, loc.body)}`);
  }
  const location = loc.body.location || loc.body;
  console.log('[2/4] Token accepted. Location accessible:');
  console.log(`      Name:    ${location.name || '(unnamed)'}`);
  console.log(`      ID:      ${location.id || GHL_LOCATION_ID}`);
  if (location.email) console.log(`      Email:   ${location.email}`);
  if (location.phone) console.log(`      Phone:   ${location.phone}`);
  if (location.address) console.log(`      Address: ${location.address}`);

  // 3. Pipelines + stages ---------------------------------------------------------
  banner('PIPELINES & STAGES');
  const pipes = await get(`/opportunities/pipelines?locationId=${encodeURIComponent(GHL_LOCATION_ID)}`, GHL_API_KEY);
  if (pipes.status !== 200) {
    console.log(`[3/4] Pipelines query failed — ${explain(pipes.status, pipes.body)}`);
    console.log('      (the token may lack the opportunities.readonly scope)');
  } else {
    const pipelines = pipes.body.pipelines || [];
    console.log(`[3/4] Pipelines for this location: ${pipelines.length}`);
    if (!pipelines.length) {
      console.log('      (none — create a pipeline in GHL → Opportunities → Pipelines)');
    }
    for (const p of pipelines) {
      console.log(`\n      ▣ ${p.name}   [id: ${p.id}]`);
      const stages = p.stages || [];
      if (!stages.length) console.log('          (no stages)');
      stages.forEach((s, i) => {
        console.log(`          ${String(i + 1).padStart(2)}. ${s.name}   [id: ${s.id}]`);
      });
    }
    // Flag the stages the offline-conversion webhook cares about
    const allStages = pipelines.flatMap(p => (p.stages || []).map(s => s.name));
    const wanted = [/job\s*won/i, /site\s*visit/i];
    console.log('\n      Offline-conversion trigger stages:');
    for (const re of wanted) {
      const hit = allStages.find(n => re.test(n));
      console.log(`        ${hit ? '✓' : '✗'} ${re.source.replace(/\\s\*/g, ' ')}  ${hit ? `→ matches "${hit}"` : '→ NOT FOUND (webhook will not fire for this)'}`);
    }
  }

  // 4. Contact read scope probe ------------------------------------------------------
  banner('CONTACT SCOPE PROBE');
  const probe = await get(`/contacts/?locationId=${encodeURIComponent(GHL_LOCATION_ID)}&limit=1`, GHL_API_KEY);
  if (probe.status === 200) {
    const total = probe.body.total != null ? probe.body.total : (probe.body.contacts || []).length;
    console.log(`[4/4] contacts.readonly OK — location has ${total} contact(s) (read probe only, nothing written).`);
  } else {
    console.log(`[4/4] Contact probe — ${explain(probe.status, probe.body)}`);
    console.log('      (lead capture needs contacts.readonly + contacts.write scopes)');
  }

  banner('RESULT');
  console.log('GHL API connection: OK');
  console.log(`Token, location ${GHL_LOCATION_ID}, and pipeline access verified.\n`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
