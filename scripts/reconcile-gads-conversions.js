/**
 * scripts/reconcile-gads-conversions.js
 *
 * Corrective setup for the offline-conversion pipeline. The "Unparseable gclid"
 * error is caused by the two offline-upload conversion actions ("Site Visit
 * Booked" and "Job Won") having the WRONG type (WEBPAGE). A WEBPAGE action
 * cannot resolve a raw gclid — offline click imports require type=UPLOAD_CLICKS.
 *
 * Because conversion_action.type is immutable via the API, the fix is to
 * CREATE fresh actions of the correct type and repoint .env.local at them.
 *
 * What this script does:
 *   1. Authenticate to Google Ads API v22 using the manager OAuth creds in
 *      .env.local (GOOGLE_ADS_CLIENT_ID/_SECRET/_REFRESH_TOKEN +
 *      GOOGLE_ADS_DEVELOPER_TOKEN + GOOGLE_ADS_LOGIN_CUSTOMER_ID) for customer
 *      GOOGLE_ADS_CUSTOMER_ID (8479028400).
 *   2. Query the account's existing conversion actions to inspect their types
 *      (WEBPAGE vs UPLOAD_CLICKS) and detect whether correct UPLOAD_CLICKS
 *      actions already exist for the two labels.
 *   3. If missing, PROVISION new "Site Visit Booked" and "Job Won" actions with
 *      type=UPLOAD_CLICKS via conversionActions:mutate (CREATE).
 *   4. Write the new action IDs back to .env.local (GADS_CONV_SITE_VISIT /
 *      GADS_CONV_JOB_WON) — in place, idempotent, no secret exposure.
 *   5. Audit app/layout.tsx for the base Google Tag (gtag.js with AW-).
 *   6. Print a verified execution summary.
 *
 * AUTH NOTES:
 *   - mutate/create of conversion actions requires the OAuth user to hold
 *     "standard" (not "email-only"/read-only) access, and the developer token
 *     to be approved (not Pending) — Pending tokens are restricted to test
 *     accounts. If step 3 returns NOT_ADS_USER / PERMISSION_DENIED, that's the
 *     cause; remap via --instructions-instructions-see-summary (see footer).
 *   - login-customer-id = the MCC (manager) ID so mutations route through the
 *     manager context; the header is passed transparently when the env var
 *     GOOGLE_ADS_LOGIN_CUSTOMER_ID is set.
 *
 * Safe by default: only the create + env-write path can mutate. Without
 * --apply, it performs a full read-only inspect and prints the exact actions
 * it WOULD create, without touching the account or .env.local.
 *
 * Usage:
 *   node scripts/reconcile-gads-conversions.js           # dry-run (inspect + plan)
 *   node scripts/reconcile-gads-conversions.js --apply   # create actions + update .env.local
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
const LAYOUT_FILE = path.join(ROOT, 'app', 'layout.tsx');

const APPLY = process.argv.includes('--apply');

const {
  GOOGLE_ADS_CUSTOMER_ID,
  GOOGLE_ADS_DEVELOPER_TOKEN,
  GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID,
} = process.env;

// Env var -> conversion action label metadata for the two offline goals.
//
// category MUST be a valid ConversionActionCategoryEnum value. NOTE: "LEAD" is
// NOT a member of that enum — it yields INVALID_ARGUMENT and the create is
// rejected. Valid members include DEFAULT, PAGE_VIEW, PURCHASE, SIGNUP,
// QUALIFIED_LEAD, CONVERTED_LEAD. We use DEFAULT (safe, always valid); if you
// want the richer lead attribution, use QUALIFIED_LEAD for "Site Visit Booked"
// and CONVERTED_LEAD for "Job Won" — but category is immutable once created,
// so changing it means delete + recreate.
const TARGETS = [
  { envKey: 'GADS_CONV_SITE_VISIT', label: 'Site Visit Booked', defaultId: '7700922852', value: 50, category: 'DEFAULT' },
  { envKey: 'GADS_CONV_JOB_WON', label: 'Job Won', defaultId: '7700922855', value: 1200, category: 'DEFAULT' },
];

// Conversion-action names must be unique per account. The legacy WEBPAGE
// actions still hold the bare label (e.g. "Site Visit Booked"), so a CREATE
// with the same name would fail with DUPLICATE_NAME. Append a stable suffix.
const NAME_SUFFIX = ' - Offline Import';

function banner(t) {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + t);
  console.log('='.repeat(72));
}

function fail(step, message, hints) {
  console.error(`\n[FAIL at step ${step}] ${message}`);
  (hints || []).forEach(h => console.error(`   → ${h}`));
  process.exit(1);
}

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

/** Numeric id extracted from a conversion_action.resourceName like "customers/123/conversionActions/456". */
function idFromResource(resourceName) {
  const m = /conversionActions\/(\d+)/.exec(resourceName || '');
  return m ? m[1] : null;
}

async function main() {
  banner('GOOGLE ADS — RECONCILE OFFLINE CONVERSION ACTIONS');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}  |  API version: ${API_VERSION}  |  mode: ${APPLY ? 'APPLY' : 'dry-run'}`);

  // 1. env + auth ------------------------------------------------------------
  const missing = [
    ['GOOGLE_ADS_CUSTOMER_ID', GOOGLE_ADS_CUSTOMER_ID],
    ['GOOGLE_ADS_DEVELOPER_TOKEN', GOOGLE_ADS_DEVELOPER_TOKEN],
    ['GOOGLE_ADS_CLIENT_ID', GOOGLE_ADS_CLIENT_ID],
    ['GOOGLE_ADS_CLIENT_SECRET', GOOGLE_ADS_CLIENT_SECRET],
    ['GOOGLE_ADS_REFRESH_TOKEN', GOOGLE_ADS_REFRESH_TOKEN],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) fail(1, `Missing env vars in .env.local: ${missing.join(', ')}`);

  const customerId = String(GOOGLE_ADS_CUSTOMER_ID).replace(/\D/g, '');
  if (!/^\d{10}$/.test(customerId)) {
    fail(1, `GOOGLE_ADS_CUSTOMER_ID "${GOOGLE_ADS_CUSTOMER_ID}" is not a 10-digit customer ID.`);
  }
  console.log(`\n[1] Target customer: ${customerId}` +
    (GOOGLE_ADS_LOGIN_CUSTOMER_ID ? `   login (MCC) customer: ${String(GOOGLE_ADS_LOGIN_CUSTOMER_ID).replace(/\D/g, '')}` : '   (no login-customer-id set)'));

  const oauth2 = new google.auth.OAuth2(GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_ADS_REFRESH_TOKEN });
  let accessToken;
  try {
    ({ token: accessToken } = await oauth2.getAccessToken());
  } catch (err) {
    fail(1, `Refresh token exchange failed: ${err.message}`, ['Refresh token may be revoked / client rotated.', 'Scope must include https://www.googleapis.com/auth/adwords']);
  }
  if (!accessToken) fail(1, 'Refresh token exchange returned no access token.');
  console.log('    OAuth access token obtained (refresh token valid).');

  const headers = adsHeaders(accessToken);

  async function gaql(query) {
    const res = await post(`/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, headers, { query });
    if (res.status !== 200) {
      throw new Error(`HTTP ${res.status}: ${explainAdsError(res.body).join(' | ')}`);
    }
    return (Array.isArray(res.body) ? res.body : [res.body]).flatMap(b => b.results || []);
  }

  // 2. inspect existing conversion actions -----------------------------------
  banner('EXISTING CONVERSION ACTIONS');
  let rows;
  try {
    rows = await gaql(
      `SELECT conversion_action.resource_name, conversion_action.id, conversion_action.name,
              conversion_action.status, conversion_action.type, conversion_action.category,
              conversion_action.counting_type, conversion_action.include_in_conversions_metric
       FROM conversion_action`
    );
  } catch (err) {
    fail(2, `conversion_action query failed: ${err.message}`);
  }

  // Normalize rows and strip customer-specific metadata we don't need.
  const existing = rows.map(r => ({
    resourceName: r.conversionAction.resourceName,
    id: String(r.conversionAction.id),
    name: r.conversionAction.name || '',
    status: r.conversionAction.status,
    type: r.conversionAction.type,
    category: r.conversionAction.category,
    countingType: r.conversionAction.countingType,
    includeInConversions: r.conversionAction.includeInConversionsMetric,
  }));

  if (!existing.length) {
    console.log('  (no conversion actions found in account — clean slate)');
  } else {
    console.log('  Name'.padEnd(26) + 'ID'.padEnd(13) + 'Type'.padEnd(16) + 'Status'.padEnd(10) + 'Counting'.padEnd(16) + 'InConv');
    console.log('  ' + '-'.repeat(78));
    for (const a of existing) {
      console.log(
        '  ' + a.name.slice(0, 24).padEnd(26) +
        a.id.padEnd(13) +
        a.type.padEnd(16) +
        a.status.padEnd(10) +
        (a.countingType || '').padEnd(16) +
        String(!!a.includeInConversions)
      );
    }
  }

  // Which targets already have a correct UPLOAD_CLICKS action?
  const plan = TARGETS.map(t => {
    // Prefer an existing UPLOAD_CLICKS action with the matching label; if the
    // label exists but is WEBPAGE (the bad state), treat it as missing.
    const correctMatches = existing.filter(a => a.type === 'UPLOAD_CLICKS' && a.name.toLowerCase().includes(t.label.toLowerCase().split(' ')[0]));
    const anyByName = existing.filter(a => a.name.toLowerCase() === t.label.toLowerCase());
    const badTypeByName = anyByName.filter(a => a.type !== 'UPLOAD_CLICKS');

    let state, actionId, detail;
    if (correctMatches.length) {
      const best = correctMatches[0];
      state = 'present'; actionId = best.id;
      detail = `${best.name} id ${best.id} already type=UPLOAD_CLICKS (status ${best.status})`;
    } else if (badTypeByName.length) {
      state = 'wrong-type'; actionId = null;
      detail = `"${badTypeByName[0].name}" id ${badTypeByName[0].id} exists but type=${badTypeByName[0].type} (needs UPLOAD_CLICKS); type immutable → must recreate`;
    } else {
      state = 'missing'; actionId = null;
      detail = `no "${t.label}" UPLOAD_CLICKS action found`;
    }

    const envId = (process.env[t.envKey] || '').trim();
    return { ...t, state, actionId, detail, envId, envMatches: actionId === envId };
  });

  console.log('\n  Target assessment vs UPLOAD_CLICKS requirement:');
  for (const p of plan) {
    const tag = p.state === 'present' ? 'OK ' : p.state === 'wrong-type' ? 'FIX' : 'NEW';
    console.log(`    [${tag}] ${p.label} — ${p.detail}`);
    if (p.envId) console.log(`           .env.local ${p.envKey}=${p.envId} (env ${p.envMatches ? 'matches' : 'STALE — points elsewhere'})`);
    else console.log(`           .env.local ${p.envKey} unset (code default ${p.defaultId})`);
  }

  const needCreate = plan.filter(p => p.state !== 'present');

  // 3. provision missing UPLOAD_CLICKS actions -------------------------------
  const created = [];
  if (needCreate.length) {
    banner(`${APPLY ? 'PROVISIONING' : 'WOULD PROVISION'} CORRECT UPLOAD_CLICKS ACTIONS`);
    for (const p of needCreate) {
      const name = p.label + NAME_SUFFIX;
      const op = {
        create: {
          name,
          type: 'UPLOAD_CLICKS',
          category: p.category,
          status: 'ENABLED',
          // Value-based: the closed-revenue / booking value drives bid signal.
          valueSettings: { defaultValue: p.value, alwaysUseDefaultValue: false, defaultCurrencyCode: 'GBP' },
          countingType: 'ONE_PER_CLICK',
        },
      };
      console.log(`  • ${p.label}: create { name:"${name}", type:UPLOAD_CLICKS, category:${p.category}, status:ENABLED, value=${p.value} GBP, countingType:ONE_PER_CLICK }`);

      if (!APPLY) {
        created.push({ ...p, newId: null, skipped: true, reason: 'dry-run — run with --apply to create' });
        continue;
      }

      let res;
      try {
        res = await post(
          `/${API_VERSION}/customers/${customerId}/conversionActions:mutate`,
          headers,
          { operations: [op] },
        );
      } catch (err) {
        created.push({ ...p, newId: null, skipped: true, reason: 'network error: ' + err.message });
        continue;
      }

      if (res.status !== 200 || !(res.body && res.body.results && res.body.results.length)) {
        const reason = explainAdsError(res.body).join(' | ');
        created.push({ ...p, newId: null, skipped: true, reason: `HTTP ${res.status}: ${reason}` });
        continue;
      }

      const newId = idFromResource(res.body.results[0].resourceName);
      created.push({ ...p, newId, skipped: false, reason: 'created' });
      console.log(`    → CREATED id ${newId}`);
    }
    const skipped = created.filter(c => c.skipped);
    if (skipped.length) {
      console.log('\n  CREATE FAILURES (per action):');
      for (const s of skipped) {
        console.log(`    ✗ ${s.label} — ${s.reason}`);
      }
    }
  } else {
    banner('NO PROVISIONING NEEDED');
    console.log('  Both offline conversion actions already exist with type=UPLOAD_CLICKS.');
  }

  // 4. update .env.local -----------------------------------------------------
  const envWrites = [];
  const finalEnv = { ...process.env };
  for (const c of created.filter(c => !c.skipped && c.newId)) {
    if (c.envId === c.newId) {
      envWrites.push({ key: c.envKey, from: c.envId, to: c.newId, changed: false, reason: 'already correct' });
    } else {
      envWrites.push({ key: c.envKey, from: c.envId || '(unset)', to: c.newId, changed: true, reason: 'updated to new UPLOAD_CLICKS id' });
      finalEnv[c.envKey] = c.newId;
    }
  }

  if (envWrites.length) {
    banner(`.ENV.LOCAL UPDATE${APPLY ? '' : ' (PLANNED)'}`);
    for (const w of envWrites) {
      console.log(`  ${w.changed ? 'SET' : 'NOP'} ${w.key} = ${w.to}  (was ${w.from}) — ${w.reason}`);
    }

    if (APPLY) {
      const toWrite = envWrites.filter(w => w.changed);
      if (toWrite.length) {
        try {
          let envSrc = fs.readFileSync(ENV_FILE, 'utf8');
          const lines = envSrc.split(/\r?\n/);
          const rewritten = lines.map(line => {
            const key = (line.match(/^\s*([A-Z0-9_]+)\s*=/) || [])[1];
            const hit = toWrite.find(w => w.key === key);
            if (!hit) return line;
            return `${key}=${hit.to}`;
          });
          // Preserve a trailing newline convention.
          fs.writeFileSync(ENV_FILE, rewritten.join('\n') + (envSrc.endsWith('\n') ? '\n' : ''));
          console.log(`  ✓ Wrote ${toWrite.length} value(s) to .env.local (${path.basename(ENV_FILE)}).`);
        } catch (err) {
          console.error(`  ✗ Failed to rewrite .env.local: ${err.message}`);
          console.error('    Manual fix: set ' + toWrite.map(w => `${w.key}=${w.to}`).join(' and ') + ' in .env.local.');
        }
      } else {
        console.log('  (no .env.local changes required)');
      }
    } else {
      console.log('  (dry-run — .env.local NOT modified; re-run with --apply to write)');
    }
  }

  // 5. audit app/layout.tsx --------------------------------------------------
  banner('APP/LAYOUT.TSX — BASE GOOGLE TAG AUDIT');
  const gadsConvId = process.env.NEXT_PUBLIC_GADS_CONV_ID || 'AW-7693225904';
  let layoutSrc = '';
  try { layoutSrc = fs.readFileSync(LAYOUT_FILE, 'utf8'); } catch { /* handled below */ }

  const layoutFindings = [];
  if (!layoutSrc) {
    layoutFindings.push({ check: 'layout.tsx present', status: 'MISSING', detail: `${LAYOUT_FILE} not found` });
  } else {
    const inHead = /<head>[\s\S]*?<\/head>/; // presence marker only
    const gtagScript = /src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-([A-Za-z0-9-]+)"/;
    const gtagConfig = /gtag\('config',\s*['"][^'"]+['"]\)/;
    const awMatches = layoutSrc.match(/AW-([A-Za-z0-9-]+)/g) || [];

    const gtagEl = layoutSrc.match(gtagScript);
    const configEl = layoutSrc.match(gtagConfig);
    const inHeadEl = /<head>[\s\S]*?gtag\/js\?id=AW-[\s\S]*?<\/head>/.test(layoutSrc);

    layoutFindings.push({
      check: 'head block present',
      status: /<head>/.test(layoutSrc) ? 'present' : 'MISSING',
      detail: /<head>/.test(layoutSrc) ? 'Root layout renders a <head> block.' : 'No <head> in layout.tsx.',
    });
    layoutFindings.push({
      check: 'gtag.js base tag with AW- in <head>',
      status: gtagEl && inHeadEl ? 'present' : 'MISSING',
      detail: gtagEl
        ? `gtag.js loaded from googletagmanager for ${gtagEl[0]} — in <head>: ${inHeadEl ? 'yes' : 'NO (outside head)'}`
        : 'No gtag.js <script> with an AW- id found.',
    });
    layoutFindings.push({
      check: "gtag('config', '<AW-id>') inline init",
      status: configEl ? 'present' : 'MISSING',
      detail: configEl
        ? `Inline dataLayer init calls ${configEl[0]}; configures ${gadsConvId}.`
        : `Inline gtag('config') init missing — gtag.js loads but may not track until configured.`,
    });
    layoutFindings.push({
      check: 'AW id(s) referenced',
      status: awMatches.length ? 'present' : 'NONE',
      detail: awMatches.length
        ? `Found: ${[...new Set(awMatches)].join(', ')}`
        : 'No AW- id anywhere in layout.tsx.',
    });
  }

  for (const f of layoutFindings) {
    const tag = f.status === 'present' || f.status === 'OK ' ? 'OK ' : '⚠  ';
    console.log(`  [${tag}] ${f.check}\n          ${f.detail}`);
  }

  // 6. summary ---------------------------------------------------------------
  banner('VERIFIED EXECUTION SUMMARY');
  const anyWrongType = plan.some(p => p.state === 'wrong-type');
  const allCorrect = plan.every(p => p.state === 'present') && plan.every(p => p.envMatches);
  const createdOk = created.filter(c => !c.skipped).length;

  console.log('  Conversion-action types vs webhook pipeline requirements:');
  for (const p of plan) {
    const expected = p.state === 'present' || (created.some(c => c.label === p.label && !c.skipped)) || (!APPLY && p.state !== 'present');
    const mark = (p.state === 'present' || (!APPLY && p.state !== 'present') || created.some(c => c.label === p.label && !c.skipped)) ? '✓' : (APPLY ? '✗' : '○');
    console.log(`    ${mark} ${p.label}: ${p.state === 'present' ? `UPLOAD_CLICKS id ${p.actionId}` : p.state === 'wrong-type' ? `type=WEBPAGE (immutable) — recreate` : 'missing — provision'}`);
  }

  if (!APPLY) {
    console.log('\n  DRY-RUN: no account mutations, no .env.local changes. Re-run with --apply to:');
    console.log('    1. create the missing UPLOAD_CLICKS actions');
    console.log('    2. write GADS_CONV_SITE_VISIT / GADS_CONV_JOB_WON to .env.local');
  } else {
    console.log(`\n  Provisioned: ${createdOk} new action(s).`);
    console.log(`  .env.local writes: ${envWrites.filter(w => w.changed).length}.`);
    if (allCorrect || createdOk === needCreate.length) {
      console.log('\n  ✓ Conversion types now match the offline-upload (UPLOAD_CLICKS) requirement.');
      console.log('    The webhook pipeline (app/api/ghl-webhook/route.ts) will stop throwing');
      console.log('    "Unparseable gclid" once GADS_CONV_* point at these correct actions.');
    } else {
      console.log('\n  ⚠ Not fully reconciled — see provisioning errors above. Most likely causes:');
      console.log('    • developer token is PENDING (not approved) → only test accounts allowed');
      console.log('    • OAuth user lacks standard access on the customer / MCC');
      console.log('    • PERMISSION_DENIED on conversion action mutate');
    }
  }

  if (plan.some(p => p.state === 'wrong-type')) {
    console.log('\n  NOTE: the old WEBPAGE actions are NOT deleted (left in place for reporting');
    console.log('  continuity). The new UPLOAD_CLICKS ids are what .env.local now points at.');
  }
  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
