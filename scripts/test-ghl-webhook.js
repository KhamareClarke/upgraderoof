/**
 * scripts/test-ghl-webhook.js
 *
 * End-to-end test for /api/ghl-webhook. Verifies that an incoming GHL POST
 * containing a contact email + gclid is correctly parsed and forwarded to
 * the Google Ads conversion tracker — WITHOUT touching real Google Ads.
 *
 * How it works:
 *   1. Starts a local MOCK Google Ads server (OAuth token + searchStream +
 *      uploadClickConversions) on a random port, and records what it receives.
 *   2. Starts the Next.js dev server with GADS_API_HOST / GADS_OAUTH_TOKEN_URL
 *      pointed at the mock.
 *   3. Fires a series of GHL-shaped POSTs at /api/ghl-webhook.
 *   4. Asserts on the HTTP responses AND on the exact conversion payload the
 *      mock Ads server received (gclid, value, conversion action, dateTime).
 *
 * Run:  node scripts/test-ghl-webhook.js
 * (spins up its own servers; no manual `next dev` needed)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const MOCK_ADS_PORT = 43197;
const NEXT_PORT = 43198;
const WEBHOOK_URL = `http://127.0.0.1:${NEXT_PORT}/api/ghl-webhook`;

// --- captured state -----------------------------------------------------------
const received = {
  tokenCalls: 0,
  searchStreamQueries: [],
  uploadedConversions: [],
};

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.error(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- mock Google Ads server ----------------------------------------------------
function startMockAdsServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', c => (body += c));
      req.on('end', () => {
        const url = req.url || '';
        // OAuth token exchange
        if (url === '/token' && req.method === 'POST') {
          received.tokenCalls++;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ access_token: 'mock-access-token', token_type: 'Bearer', expires_in: 3600 }));
          return;
        }
        // GAQL searchStream (conversion action lookup)
        if (url.includes('/googleAds:searchStream')) {
          let q = '';
          try { q = JSON.parse(body).query || ''; } catch {}
          received.searchStreamQueries.push(q);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{ results: [{ conversionAction: { resourceName: 'customers/8479028400/conversionActions/123456789', name: 'Calls from ads' } }] }]));
          return;
        }
        // Offline conversion upload
        if (url.includes('/conversionUploads:uploadClickConversions')) {
          let parsed = {};
          try { parsed = JSON.parse(body); } catch {}
          received.uploadedConversions.push({ url, body: parsed, headers: req.headers });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ results: [{ gclid: parsed.conversions && parsed.conversions[0] && parsed.conversions[0].gclid }] }));
          return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'not found', url }));
      });
    });
    server.listen(MOCK_ADS_PORT, '127.0.0.1', () => resolve(server));
  });
}

// --- Next dev server -----------------------------------------------------------
function startNextDev() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(NEXT_PORT),
      GADS_API_HOST: `127.0.0.1:${MOCK_ADS_PORT}`,
      GADS_API_PROTOCOL: 'http',
      GADS_OAUTH_TOKEN_URL: `http://127.0.0.1:${MOCK_ADS_PORT}/token`,
      // Ensure required Ads env present (use existing or dummy for the test)
      GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400',
      GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'test-dev-token',
      GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID || 'test-client-id',
      GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET || 'test-secret',
      GOOGLE_ADS_REFRESH_TOKEN: process.env.GOOGLE_ADS_REFRESH_TOKEN || 'test-refresh',
      // No GHL_WEBHOOK_SECRET in test → endpoint open
      GHL_WEBHOOK_SECRET: '',
    };
    const child = spawn(`npx next dev -p ${NEXT_PORT}`, {
      cwd: path.join(__dirname, '..'),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    let ready = false;
    const onData = (buf) => {
      const s = buf.toString();
      if (!ready && /Ready in|started server|Local:.*3000|✓ Ready/i.test(s)) {
        ready = true;
        resolve(child);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    // Fallback: poll the port
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`http://127.0.0.1:${NEXT_PORT}/api/ghl-webhook`);
        if (r.ok && !ready) { ready = true; clearInterval(poll); resolve(child); }
      } catch {}
    }, 1500);
    setTimeout(() => { if (!ready) { clearInterval(poll); reject(new Error('Next dev server did not become ready in 90s')); } }, 90000);
  });
}

function cleanup(next, mockAds) {
  try { next.kill(); } catch {}
  try { mockAds.close(); } catch {}
  if (process.platform === 'win32' && next && next.pid) {
    try { require('child_process').execSync(`taskkill /PID ${next.pid} /T /F`, { stdio: 'ignore' }); } catch {}
  }
}

async function post(payload) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let json = {};
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

async function main() {
  console.log('='.repeat(70));
  console.log('  /api/ghl-webhook — END-TO-END TEST (mock Google Ads)');
  console.log('='.repeat(70));

  const mockAds = await startMockAdsServer();
  console.log(`\n[setup] Mock Google Ads server on 127.0.0.1:${MOCK_ADS_PORT}`);
  console.log('[setup] Starting Next dev server (this can take ~20-40s)...');
  const next = await startNextDev();
  console.log(`[setup] Next dev server ready on 127.0.0.1:${NEXT_PORT}`);

  // Wait until the route actually responds (dev compiles on first hit).
  console.log('[setup] Warming up /api/ghl-webhook (first hit compiles the route)...');
  let warm = false;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(WEBHOOK_URL);
      if (r.ok) { warm = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 1500));
  }
  if (!warm) { console.error('FATAL: webhook route did not respond after warm-up'); cleanup(next, mockAds); process.exit(1); }
  console.log('[setup] Route is live.\n');

  try {
    // Sanity: GET self-description
    const getRes = await fetch(WEBHOOK_URL);
    const getJson = await getRes.json();
    check('GET returns self-description', getRes.ok && getJson.ok === true);
    check('GET lists conversion stages', Array.isArray(getJson.convertsOnStages) && getJson.convertsOnStages.length === 2);

    // --- Case 1: Job Won with email + gclid + value → should upload £value ---
    console.log('\nCase 1: "Job Won" with email + gclid + explicit value');
    let r = await post({ stage: 'Job Won', gclid: 'Cj0KCQjw_testGCLID_jobwon', email: 'lead@example.com', value: 4500, contact_id: 'cnt_1' });
    check('responds 200 success', r.status === 200 && r.json.success === true, JSON.stringify(r.json));
    check('flags conversion stage = Job Won', r.json.conversion && r.json.conversion.stage === 'Job Won');

    // --- Case 2: Site Visit Booked, no value → default £50 ---
    console.log('\nCase 2: "Site Visit Booked" with gclid, no value (default £50)');
    r = await post({ stage: 'Site Visit Booked', gclid: 'Cj0KCQjw_testGCLID_visit', email: 'lead2@example.com' });
    check('responds 200 success', r.status === 200 && r.json.success === true, JSON.stringify(r.json));
    check('uses default value 50', r.json.conversion && r.json.conversion.value === 50, JSON.stringify(r.json.conversion));

    // --- Case 3: nested GHL opportunity payload shape ---
    console.log('\nCase 3: nested opportunity.stage.name + contact.customField.gclid');
    r = await post({ opportunity: { stage: { name: 'Job Won' } }, contact: { customField: { gclid: 'Cj0KCQjw_nested' }, email: 'n@example.com' }, value: 1200 });
    check('nested payload parsed + uploaded', r.status === 200 && r.json.success === true, JSON.stringify(r.json));

    // --- Case 4: conversion stage but NO gclid → ignored, no upload ---
    console.log('\nCase 4: "Job Won" WITHOUT gclid → ignored, nothing uploaded');
    const before = received.uploadedConversions.length;
    r = await post({ stage: 'Job Won', email: 'nogclid@example.com' });
    check('responds success but ignored=true', r.status === 200 && r.json.ignored === true, JSON.stringify(r.json));
    check('no new Ads upload for missing gclid', received.uploadedConversions.length === before);

    // --- Case 5: non-conversion stage → ignored ---
    console.log('\nCase 5: non-conversion stage ("New Lead") → ignored');
    r = await post({ stage: 'New Lead', gclid: 'Cj0KCQjw_newlead' });
    check('ignored=true for non-conversion stage', r.status === 200 && r.json.ignored === true);

    // --- Case 6: missing stage entirely → 422 ---
    console.log('\nCase 6: payload with no stage → 422');
    r = await post({ gclid: 'Cj0KCQjw_nostage', email: 'x@example.com' });
    check('responds 422', r.status === 422, `got ${r.status}`);

    // --- Assertions on what the MOCK Ads server actually received ---
    console.log('\nForwarding assertions (what Google Ads received):');
    check('OAuth token was exchanged', received.tokenCalls >= 1, `tokenCalls=${received.tokenCalls}`);
    check('conversion action looked up via GAQL', received.searchStreamQueries.some(q => /conversion_action/.test(q) && /Calls from ads/.test(q)));
    check('exactly 3 conversions uploaded (cases 1-3)', received.uploadedConversions.length === 3, `got ${received.uploadedConversions.length}`);

    const up1 = received.uploadedConversions[0];
    check('case1 gclid forwarded correctly', up1 && up1.body.conversions[0].gclid === 'Cj0KCQjw_testGCLID_jobwon');
    check('case1 value forwarded = 4500', up1 && up1.body.conversions[0].conversionValue === 4500);
    check('case1 currency = GBP', up1 && up1.body.conversions[0].currencyCode === 'GBP');
    check('case1 conversion action = Calls from ads resource', up1 && /conversionActions\/123456789/.test(up1.body.conversions[0].conversionAction));
    check('case1 has conversionDateTime', up1 && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+00:00$/.test(up1.body.conversions[0].conversionDateTime), up1 && up1.body.conversions[0].conversionDateTime);
    check('case1 sent developer-token header', up1 && !!up1.headers['developer-token']);
    check('case1 sent Authorization Bearer', up1 && /^Bearer mock-access-token$/.test(up1.headers.authorization || ''));

    const up2 = received.uploadedConversions[1];
    check('case2 default value 50 forwarded', up2 && up2.body.conversions[0].conversionValue === 50);

    const up3 = received.uploadedConversions[2];
    check('case3 nested gclid forwarded', up3 && up3.body.conversions[0].gclid === 'Cj0KCQjw_nested');
    check('case3 value 1200 forwarded', up3 && up3.body.conversions[0].conversionValue === 1200);
  } finally {
    cleanup(next, mockAds);
  }

  console.log('\n' + '='.repeat(70));
  console.log(`  RESULT: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
