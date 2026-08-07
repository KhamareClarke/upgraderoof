/**
 * scripts/test-ghl-webhook-live.js
 *
 * LIVE smoke test for the DEPLOYED /api/ghl-webhook (not the mock).
 * Sends a fabricated (golden) gclid through a "Site Visit Booked" stage-shift
 * and reports what the production endpoint returns.
 *
 * WHY A GOLDEN GCLID: the gclid below is a made-up string, NOT a real click id
 * from a real ad. When the route forwards it to Google Ads via the Data Manager
 * API async ingest (action 7700922852 "Site Visit Booked"), the webhook replies
 * 202 immediately and the ingest happens FIRE-AND-FORGET. A fake gclid maps to
 * no real click, so NO conversion is ever recorded against real spend.
 * i.e. this test proves the deployed route accepts the golden webhook and
 * enqueues the async Data Manager ingest end-to-end, without crediting a lead.
 *
 * NOTE: because the route now returns 202 (acknowledged) rather than awaiting
 * and echoing the Ads verdict, this test proves ACCEPTANCE + enqueue, not the
 * Data Manager credit result. To see the async ingest outcome, check the route
 * logs / fleet-ingest (ghl_offline_conversion vs ghl_offline_conversion_error).
 *
 * HOW TO RUN:
 *   node scripts/test-ghl-webhook-live.js                # uses GHL_WEBHOOK_SECRET from .env.local if set, else plain
 *   node scripts/test-ghl-webhook-live.js <secret>       # pass the prod secret explicitly if not in .env.local
 *
 * ENDPOINT:
 *   https://www.upgraderoofs.co.uk/api/ghl-webhook
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });

const ENDPOINT = process.env.GHL_WEBHOOK_URL || 'https://www.upgraderoofs.co.uk/api/ghl-webhook';
const secret = process.argv[2] || process.env.GHL_WEBHOOK_SECRET || '';

// Fabricated click id — deliberately not a real gclid. 90-char Ads-style string.
const goldenGclid = 'Cj0KCQjw_testgoldengclid_' + 'x'.repeat(64);

async function post(payload, useSecret) {
  const headers = { 'Content-Type': 'application/json' };
  if (useSecret) headers['x-ghl-secret'] = useSecret;
  const res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify(payload) });
  let json = {};
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

(async () => {
  console.log('='.repeat(70));
  console.log('  LIVE /api/ghl-webhook SMOKE TEST (golden gclid)');
  console.log('='.repeat(70));
  console.log('  endpoint :', ENDPOINT);
  console.log('  secret   :', secret ? `provided (${secret.length} chars)` : 'NONE PROVIDED');
  console.log('  gclid    :', goldenGclid.slice(0, 24) + '… (fabricated, no real click)\n');

  // 1. Basic reachability (GET self-description)
  const getRes = await fetch(ENDPOINT);
  let getJson = {};
  try { getJson = await getRes.json(); } catch {}
  console.log('GET ' + ENDPOINT);
  console.log('  -> HTTP', getRes.status, JSON.stringify(getJson));
  const reachable = getRes.ok;
  if (!reachable) {
    console.error('\nEndpoint not reachable — check it is deployed at this URL.');
    process.exit(1);
  }

  // 2. Golden Site Visit webhook, with secret if we have one.
  const payload = { stage: 'Site Visit Booked', gclid: goldenGclid, email: 'goldentest@upgraderoofs.co.uk', phone: '01270 000000', contact_id: 'golden-test-contact' };
  console.log('\nPOST golden "Site Visit Booked" (secret = ' + (secret ? 'sent' : 'none') + ')');
  const r = await post(payload, secret);

  console.log('  -> HTTP', r.status, JSON.stringify(r.json));

  // Interpret the outcome.
  if (r.status === 401) {
    console.log('\nRESULT: Unauthorized — endpoint REQUIRES a secret. Good (secure), but the secret you passed did not match prod.');
    console.log('  If GHL_WEBHOOK_SECRET is set in Vercel but not here, pass it as arg 2, e.g.');
    console.log('  node scripts/test-ghl-webhook-live.js <prod-secret>');
    process.exit(2);
  }
  if (r.status === 200 && (r.json.ignored === true)) {
    // Two flavours of 'ignored': no gclid (not us) or secret mismatch handled above.
    console.log('\nRESULT: Endpoint ANSWERED 200 ignored=true. Unexpected for a valid gclid — inspect the json above.');
    process.exit(3);
  }
  if (r.status === 202 && r.json.success === true && r.json.acknowledged === true && r.json.async === true && r.json.conversion && r.json.conversion.stage === 'Site Visit Booked') {
    console.log('\nRESULT: LIVE END-TO-END OK (202 acknowledged).');
    console.log('  - Deployed route reachable + parsed the golden webhook.');
    console.log('  - Accepted (with%s secret) and returned 202 acknowledged.', secret ? '' : 'OUT a');
    console.log('  - Asynchronous Data Manager ingest enqueued for action 7700922852 "Site Visit Booked".');
    console.log('  - The fake gclid maps to no real click, so NO conversion is credited against spend.');
    console.log('  - To see the async ingest verdict, check route logs / fleet-ingest:');
    console.log('      ghl_offline_conversion            -> accepted (requestId)');
    console.log('      ghl_offline_conversion_error      -> Data Manager rejected (403/400)');
    if (!secret) {
      console.log('\n  ⚠ IMPORTANT: it answered WITHOUT a secret -> production /api/ghl-webhook is CURRENTLY OPEN.');
      console.log('    Set GHL_WEBHOOK_SECRET in Vercel now (and update the GHL workflow webhook to send x-ghl-secret).');
    }
    process.exit(0);
  }

  console.log('\nRESULT: Unexpected response — see json above.');
  process.exit(9);
})().catch(e => { console.error('FATAL:', e.message || e); process.exit(1); });
