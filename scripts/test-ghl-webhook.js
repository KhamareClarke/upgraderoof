/**
 * scripts/test-ghl-webhook.js
 *
 * End-to-end test for /api/ghl-webhook. Verifies that an incoming GHL POST
 * containing a contact email + gclid is correctly parsed and forwarded to
 * the Google Ads Data Manager API (events:ingest) — WITHOUT touching the real
 * Google Ads / Data Manager API.
 *
 * How it works:
 *   1. Starts a local MOCK Data Manager server (OAuth token + /v1/events:ingest)
 *      on a random port, and records what it receives.
 *   2. Starts the Next.js dev server with DM_API_HOST / DM_API_PROTOCOL /
 *      GADS_OAUTH_TOKEN_URL pointed at the mock.
 *   3. Fires a series of GHL-shaped POSTs at /api/ghl-webhook.
 *   4. Asserts on the HTTP responses (202 acknowledged) AND on the exact Data
 *      Manager ingest payload the mock received (gclid, value, conversion
 *      action productDestinationId, eventTimestamp).
 *
 * Run:  node scripts/test-ghl-webhook.js
 * (spins up its own servers; no manual `next dev` needed)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const MOCK_DM_PORT = 43197;
const NEXT_PORT = 43198;
const WEBHOOK_URL = `http://127.0.0.1:${NEXT_PORT}/api/ghl-webhook`;

// --- captured state -----------------------------------------------------------
const received = {
  tokenCalls: 0,
  ingests: [], // { url, body, headers }
};

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.error(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- mock Data Manager server --------------------------------------------------
function startMockDmServer() {
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
          res.end(JSON.stringify({ access_token: 'mock-access-token', token_type: 'Bearer', expires_in: 3600, scope: 'openid https://www.googleapis.com/auth/datamanager' }));
          return;
        }
        // Data Manager events:ingest (async fast-fail — 200 means accepted)
        if (url === '/v1/events:ingest' && req.method === 'POST') {
          let parsed = {};
          try { parsed = JSON.parse(body); } catch {}
          received.ingests.push({ url, body: parsed, headers: req.headers });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ requestId: 'mock-request-id-001' }));
          return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'not found', url }));
      });
    });
    server.listen(MOCK_DM_PORT, '127.0.0.1', () => resolve(server));
  });
}

// --- Next dev server -----------------------------------------------------------
function startNextDev() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(NEXT_PORT),
      DM_API_HOST: `127.0.0.1:${MOCK_DM_PORT}`,
      DM_API_PROTOCOL: 'http',
      GADS_OAUTH_TOKEN_URL: `http://127.0.0.1:${MOCK_DM_PORT}/token`,
      // Ensure required Data Manager env present (use existing or dummy for the test)
      GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400',
      GOOGLE_DM_CLIENT_ID: process.env.GOOGLE_DM_CLIENT_ID || 'test-dm-client-id',
      GOOGLE_DM_CLIENT_SECRET: process.env.GOOGLE_DM_CLIENT_SECRET || 'test-dm-secret',
      GOOGLE_DM_REFRESH_TOKEN: process.env.GOOGLE_DM_REFRESH_TOKEN || 'test-dm-refresh',
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

function cleanup(next, mockDm) {
  try { next.kill(); } catch {}
  try { mockDm.close(); } catch {}
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

// Small helper to let fire-and-forget ingests land in the mock before asserting.
const settle = () => new Promise(r => setTimeout(r, 1200));

async function main() {
  console.log('='.repeat(70));
  console.log('  /api/ghl-webhook — END-TO-END TEST (mock Data Manager)');
  console.log('='.repeat(70));

  const mockDm = await startMockDmServer();
  console.log(`\n[setup] Mock Data Manager server on 127.0.0.1:${MOCK_DM_PORT}`);
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
  if (!warm) { console.error('FATAL: webhook route did not respond after warm-up'); cleanup(next, mockDm); process.exit(1); }
  console.log('[setup] Route is live.\n');

  try {
    // Sanity: GET self-description
    const getRes = await fetch(WEBHOOK_URL);
    const getJson = await getRes.json();
    check('GET returns self-description', getRes.ok && getJson.ok === true);
    check('GET lists conversion stages', Array.isArray(getJson.convertsOnStages) && getJson.convertsOnStages.length === 2);

    // --- Case 1: Job Won with email + gclid + value → should ingest £value ---
    console.log('\nCase 1: "Job Won" with email + gclid + explicit value');
    let r = await post({ stage: 'Job Won', gclid: 'Cj0KCQjw_testGCLID_jobwon', email: 'lead@example.com', value: 4500, contact_id: 'cnt_1' });
    check('responds 202 acknowledged', r.status === 202 && r.json.success === true && r.json.acknowledged === true, JSON.stringify(r.json));
    check('flags async fire-and-forget', r.json.async === true, JSON.stringify(r.json));
    check('flags conversion stage = Job Won', r.json.conversion && r.json.conversion.stage === 'Job Won');

    // --- Case 2: Site Visit Booked, no value → default £50 ---
    console.log('\nCase 2: "Site Visit Booked" with gclid, no value (default £50)');
    r = await post({ stage: 'Site Visit Booked', gclid: 'Cj0KCQjw_testGCLID_visit', email: 'lead2@example.com' });
    check('responds 202 acknowledged', r.status === 202 && r.json.success === true && r.json.acknowledged === true, JSON.stringify(r.json));
    check('uses default value 50', r.json.conversion && r.json.conversion.value === 50, JSON.stringify(r.json.conversion));

    // --- Case 3: nested GHL opportunity payload shape ---
    console.log('\nCase 3: nested opportunity.stage.name + contact.customField.gclid');
    r = await post({ opportunity: { stage: { name: 'Job Won' } }, contact: { customField: { gclid: 'Cj0KCQjw_nested' }, email: 'n@example.com' }, value: 1200 });
    check('nested payload parsed + acknowledged', r.status === 202 && r.json.success === true && r.json.acknowledged === true, JSON.stringify(r.json));

    // --- Case 4: conversion stage but NO gclid → ignored, no ingest ---
    console.log('\nCase 4: "Job Won" WITHOUT gclid → ignored, nothing ingested');
    // First let any in-flight fire-and-forget from cases 1-3 fully land so the
    // "before" baseline is stable, then assert NO additional ingest is produced.
    await settle();
    const before = received.ingests.length;
    const beforeIds = new Set(received.ingests.map(i => i.body.events[0].adIdentifiers.gclid));
    r = await post({ stage: 'Job Won', email: 'nogclid@example.com' });
    await settle();
    const newIngests = received.ingests.filter(i => !beforeIds.has(i.body.events[0].adIdentifiers.gclid));
    check('responds success but ignored=true', r.status === 200 && r.json.ignored === true, JSON.stringify(r.json));
    check('no new ingest for missing gclid', newIngests.length === 0 && received.ingests.length === before, `before=${before} now=${received.ingests.length}`);

    // --- Case 5: non-conversion stage → ignored ---
    console.log('\nCase 5: non-conversion stage ("New Lead") → ignored');
    r = await post({ stage: 'New Lead', gclid: 'Cj0KCQjw_newlead' });
    await settle();
    check('ignored=true for non-conversion stage', r.status === 200 && r.json.ignored === true);

    // --- Case 6: missing stage entirely → 422 ---
    console.log('\nCase 6: payload with no stage → 422');
    r = await post({ gclid: 'Cj0KCQjw_nostage', email: 'x@example.com' });
    check('responds 422', r.status === 422, `got ${r.status}`);

    // Let the async fire-and-forget ingests from cases 1-3 land before asserting.
    await settle();

    // --- Assertions on what the MOCK Data Manager server actually received ---
    console.log('\nForwarding assertions (what Data Manager received):');
    check('OAuth token was exchanged', received.tokenCalls >= 1, `tokenCalls=${received.tokenCalls}`);
    check('exactly 3 ingests received (cases 1-3)', received.ingests.length === 3, `got ${received.ingests.length}`);

    // Fire-and-forget means ingests may ARRIVE out of order — find each case by
    // its gclid rather than assuming array index order.
    const find = (gclid) => received.ingests.find(i => i.body.events[0].adIdentifiers.gclid === gclid);
    const ev = (i) => i && i.body.events[0];
    const dst = (i) => i && i.body.destinations[0];

    const case1 = find('Cj0KCQjw_testGCLID_jobwon');
    check('case1 destination operatingAccount = 8479028400', case1 && dst(case1).operatingAccount.accountId === '8479028400', case1 && JSON.stringify(case1.body.destinations));
    check('case1 operatingAccount type = GOOGLE_ADS', case1 && dst(case1).operatingAccount.accountType === 'GOOGLE_ADS');
    check('case1 productDestinationId = 7700922855 (Job Won)', case1 && dst(case1).productDestinationId === '7700922855', case1 && dst(case1).productDestinationId);
    check('case1 gclid forwarded via adIdentifiers', case1 && ev(case1).adIdentifiers.gclid === 'Cj0KCQjw_testGCLID_jobwon');
    check('case1 has required transactionId', case1 && !!ev(case1).transactionId, case1 && ev(case1).transactionId);
    check('case1 transactionId = contact id (stable dedupe)', case1 && ev(case1).transactionId === 'cnt_1', case1 && ev(case1).transactionId);
    check('case1 value forwarded = 4500 (real currency)', case1 && ev(case1).conversionValue === 4500);
    check('case1 currency = GBP', case1 && ev(case1).currency === 'GBP');
    check('case1 has eventTimestamp (RFC3339 ISO)', case1 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(ev(case1).eventTimestamp), case1 && ev(case1).eventTimestamp);
    check('case1 NO developer-token header (Data Manager)', case1 && !case1.headers['developer-token']);
    check('case1 sent Authorization Bearer', case1 && /^Bearer mock-access-token$/.test(case1.headers.authorization || ''));

    const case2 = find('Cj0KCQjw_testGCLID_visit');
    check('case2 default value 50 forwarded', case2 && ev(case2).conversionValue === 50);
    check('case2 productDestinationId = 7700922852 (Site Visit Booked)', case2 && dst(case2).productDestinationId === '7700922852', case2 && dst(case2).productDestinationId);
    check('case2 transactionId present (fallback, no contact_id)', case2 && !!ev(case2).transactionId);

    const case3 = find('Cj0KCQjw_nested');
    check('case3 nested gclid forwarded', case3 && ev(case3).adIdentifiers.gclid === 'Cj0KCQjw_nested');
    check('case3 value 1200 forwarded', case3 && ev(case3).conversionValue === 1200);
    check('case3 productDestinationId = 7700922855 (Job Won)', case3 && dst(case3).productDestinationId === '7700922855');
  } finally {
    cleanup(next, mockDm);
  }

  console.log('\n' + '='.repeat(70));
  console.log(`  RESULT: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error('\nFATAL:', err.message || err); process.exit(1); });
