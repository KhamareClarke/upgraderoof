/**
 * scripts/rename-offline-goals.js
 *
 * Reconciles the two offline-upload conversion actions to the desired names
 * WITHOUT recreating them. The account currently has only two ENABLED
 * UPLOAD_CLICKS actions, both legacy-named:
 *
 *   - 7734043333  "offline (Upload)"      category=QUALIFIED_LEAD   (biddable primary)
 *   - 7734064497  "offline (Upload) (1)"  category=CONVERTED_LEAD   (biddable primary)
 *
 * These are the two that serve as the account's biddable/primary conversion
 * goals (QUALIFIED_LEAD~WEBSITE and CONVERTED_LEAD~WEBSITE). The user's desired
 * labels are "Site Visit Booked - Offline Import" and "Job Won - Offline Import".
 * The previously-created actions with those names (7734044623 / 7734044626) are
 * now status=REMOVED, so rather than re-enable them, we adopt the two ENABLED
 * legacy actions and RENAME them to match.
 *
 * Renames are done via conversionActions:mutate UPDATE with updateMask "name".
 * (name is mutable; type/category are immutable — we leave those untouched so
 *  the QUALIFIED_LEAD / CONVERTED_LEAD categories stay mapped to the biddable
 *  account-default goals.)
 *
 * Safe by default: without --apply, prints exactly what it would rename and
 * does not touch the account. Also rewrites .env.local GADS_CONV_SITE_VISIT /
 * GADS_CONV_JOB_WON to point at the adopted (renamed) enabled actions.
 *
 * Usage:
 *   node scripts/rename-offline-goals.js           # dry-run (inspect + plan)
 *   node scripts/rename-offline-goals.js --apply   # rename actions + update .env.local
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_VERSION = 'v22';
const HOST = 'googleads.googleapis.com';
const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');

const APPLY = process.argv.includes('--apply');

const {
  GOOGLE_ADS_CUSTOMER_ID,
  GOOGLE_ADS_DEVELOPER_TOKEN,
  GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID,
} = process.env;

// Desired mapping: (enabled legacy action to adopt) -> (new name, env key).
// Order matters: QUALIFIED_LEAD = "Site Visit Booked" (booking lead),
//                CONVERTED_LEAD = "Job Won" (closed revenue).
const ADOPT = [
  { id: '7734043333', newName: 'Site Visit Booked (Offline)', envKey: 'GADS_CONV_SITE_VISIT' },
  { id: '7734064497', newName: 'Job Won (Offline)', envKey: 'GADS_CONV_JOB_WON' },
];

function post(path, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const req = https.request(
      {
        host: HOST,
        path,
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function adsHeaders(accessToken) {
  const h = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }
  return h;
}

function explainAdsError(body) {
  const errs = (body && body.error && body.error.details &&
    body.error.details.flatMap(d => d.errors || [])) || [];
  if (!errs.length && body && body.error) {
    return [`${body.error.status || body.error.code}: ${body.error.message}`];
  }
  return errs.map(e => {
    const code = e.errorCode ? Object.entries(e.errorCode).map(([k, v]) => `${k}=${v}`).join(',') : '';
    return `${e.message}${code ? `  [${code}]` : ''}`;
  });
}

async function gaql(customerId, headers, query) {
  const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}: ${explainAdsError(res.body).join(' | ')}`);
  }
  return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
}

async function main() {
  const customerId = String(GOOGLE_ADS_CUSTOMER_ID).replace(/\D/g, '');
  if (!/^\d{10}$/.test(customerId)) {
    console.error(`GOOGLE_ADS_CUSTOMER_ID "${GOOGLE_ADS_CUSTOMER_ID}" is not a 10-digit customer id.`);
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();
  const headers = adsHeaders(accessToken);

  console.log(`\nMode: ${APPLY ? 'APPLY (renames + env writes)' : 'DRY-RUN (inspect only)'}`);
  console.log(`Customer: ${customerId}\n`);

  // Read current ENABLED actions to confirm the adopt targets are still valid.
  const rows = await gaql(customerId, headers,
    `SELECT conversion_action.resource_name, conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.type, conversion_action.category FROM conversion_action`);

  const byId = {};
  for (const r of rows) {
    const a = r.conversionAction;
    byId[String(a.id)] = a;
  }

  const results = [];
  for (const t of ADOPT) {
    const a = byId[t.id];
    if (!a) {
      results.push({ ...t, ok: false, reason: `id ${t.id} not found in account` });
      continue;
    }
    if (a.status !== 'ENABLED') {
      results.push({ ...t, ok: false, reason: `id ${t.id} "…" is status=${a.status} (expected ENABLED)` });
      continue;
    }
    if (a.type !== 'UPLOAD_CLICKS') {
      results.push({ ...t, ok: false, reason: `id ${t.id} type=${a.type} (expected UPLOAD_CLICKS)` });
      continue;
    }
    results.push({ ...t, ok: true, currentName: a.name, resourceName: a.resourceName });
  }

  console.log('  Adopt targets (currently ENABLED UPLOAD_CLICKS):');
  for (const r of results) {
    if (r.ok) {
      console.log(`    ✓ ${r.id}  "${r.currentName}"  →  "${r.newName}"  [category mapping retained]`);
    } else {
      console.log(`    ✗ ${r.id}  ${r.reason}`);
    }
  }

  const valid = results.filter(r => r.ok);
  if (valid.length !== ADOPT.length) {
    console.error(`\n  ${ADOPT.length - valid.length} adopt target(s) invalid — cannot proceed safely.`);
    process.exit(1);
  }

  // 1. perform renames --------------------------------------------------------
  let renameOk = 0;
  for (const r of valid) {
    const op = {
      update: {
        resourceName: r.resourceName,
        name: r.newName,
      },
      updateMask: 'name',
    };
    r.envNewId = r.id;
    r.envOld = (process.env[r.envKey] || '').trim();

    if (!APPLY) {
      console.log(`    [dry-run] would UPDATE ${r.id} name → "${r.newName}"`);
      continue;
    }

    const res = await post(`/${API_VERSION}/customers/${customerId}/conversionActions:mutate`, headers, { operations: [op] });
    if (res.status !== 200 || !(res.body && res.body.results && res.body.results.length)) {
      r.renameError = explainAdsError(res.body).join(' | ');
      console.error(`    ✗ rename ${r.id} failed — HTTP ${res.status}: ${r.renameError}`);
      continue;
    }
    renameOk++;
    console.log(`    ✓ renamed ${r.id} → "${r.newName}"`);
  }

  // Rewrite .env.local if any rename succeeded.
  if (APPLY && renameOk) {
    const changed = valid.filter(r => r.renameError === undefined && r.envOld !== r.id);
    const dupSafe = function dedupTargets() {
      const seen = new Set();
      return valid.filter(r => {
        if (seen.has(r.envKey)) return false;
        seen.add(r.envKey);
        return true;
      });
    };
    const writes = dupSafe().filter(r => r.renameError === undefined);
    if (writes.length) {
      let envSrc = fs.readFileSync(ENV_FILE, 'utf8');
      const lines = envSrc.split(/\r?\n/);
      const rewritten = lines.map(line => {
        const key = (line.match(/^\s*([A-Z0-9_]+)\s*=/) || [])[1];
        const hit = writes.find(w => w.envKey === key);
        if (!hit) return line;
        return `${key}=${hit.id}`;
      });
      fs.writeFileSync(ENV_FILE, rewritten.join('\n') + (envSrc.endsWith('\n') ? '\n' : ''));
      console.log(`\n  ✓ Wrote .env.local: ${writes.map(w => `${w.envKey}=${w.id}`).join(', ')}`);
    }
  } else if (APPLY && !renameOk) {
    console.log('\n  No renames succeeded — .env.local left unchanged.');
  }

  console.log(`\nSummary: ${renameOk} renamed${APPLY ? '' : ' (dry-run: nothing mutated)'}.`);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
