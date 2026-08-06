/**
 * scripts/test-ghl-push-lead.js
 *
 * Pushes ONE clearly-labelled test lead ("Test Lead - Safe to Delete") into
 * the live GoHighLevel account via POST /contacts/upsert — the same endpoint
 * lib/ghl.ts uses in production — and prints the exact HTTP status and full
 * response payload to the terminal.
 *
 * Run:  node scripts/test-ghl-push-lead.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), quiet: true });
const https = require('https');

const HOST = 'services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

const { GHL_LOCATION_ID, GHL_API_KEY } = process.env;

const LEAD = {
  locationId: GHL_LOCATION_ID,
  firstName: 'Test Lead',
  lastName: '- Safe to Delete',
  name: 'Test Lead - Safe to Delete',
  phone: '07000000000',
  email: 'testlead.safetodelete@upgraderoofs-test.invalid',
  postalCode: 'CW11 4NE',
  tags: ['test-lead', 'safe-to-delete'],
  source: 'api_connection_test',
};

function post(path, token, bodyObj) {
  const body = JSON.stringify(bodyObj);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST,
        path,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Version: API_VERSION,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(body),
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
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(66));
  console.log('  GHL CONTACT UPSERT — LIVE CONNECTION TEST');
  console.log('='.repeat(66));
  console.log(`Date:     ${new Date().toISOString()}`);
  console.log(`Host:     ${HOST}`);
  console.log(`Version:  ${API_VERSION}`);
  console.log(`Location: ${GHL_LOCATION_ID || '(MISSING)'}`);

  if (!GHL_LOCATION_ID || !GHL_API_KEY) {
    console.error('\nFATAL: GHL_LOCATION_ID and/or GHL_API_KEY missing from .env.local');
    process.exit(1);
  }

  console.log('\n--- Request payload (POST /contacts/upsert) ---');
  console.log(JSON.stringify(LEAD, null, 2));

  let res;
  try {
    res = await post('/contacts/upsert', GHL_API_KEY, LEAD);
  } catch (err) {
    console.error('\n--- TRANSPORT FAILURE (no HTTP response) ---');
    console.error(err instanceof Error ? (err.stack || err.message) : err);
    process.exit(1);
  }

  console.log('\n--- Response ---');
  console.log(`HTTP STATUS: ${res.status}`);
  console.log('RESPONSE PAYLOAD:');
  console.log(JSON.stringify(res.body, null, 2));

  const contact = res.body && (res.body.contact || res.body);
  const contactId = contact && (contact.id || contact.contactId);

  console.log('\n--- Verdict ---');
  if ((res.status === 200 || res.status === 201) && contactId) {
    console.log(`✅ SUCCESS — contact upserted. id: ${contactId}`);
    console.log('   CRM sync is greenlit. Test lead is tagged "test-lead" / "safe-to-delete".');
  } else if (res.status === 401 || res.status === 403) {
    console.log('❌ AUTH FAILED — check GHL_API_KEY (Private Integration token) is valid');
    console.log('   and scoped to this location with contacts.write.');
    process.exit(1);
  } else if (res.status === 422) {
    console.log('❌ VALIDATION FAILED — GHL rejected a field in the payload (see above).');
    process.exit(1);
  } else {
    console.log(`❌ UNEXPECTED STATUS ${res.status} — see payload above.`);
    process.exit(1);
  }
}

main();
