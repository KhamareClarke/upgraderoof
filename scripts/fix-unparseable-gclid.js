/**
 * scripts/fix-unparseable-gclid.js
 *
 * Diagnostic + remediation for the "Unparseable gclid" error that Google Ads
 * reports when the Data Manager API rejects an offline-conversion upload on
 * upgraderoofs.co.uk.
 *
 * The error is produced at the Google ingest side whenever the click id handed
 * to `datamanager.events.ingest` is not a single, well-formed, CASE-PRESERVED
 * Google Click ID. The three realistic corruption vectors, each of which this
 * script checks/repairs end-to-end, are:
 *
 *   1. CASE  — a `.toLowerCase()` / `.toLocaleLowerCase()` transform anywhere
 *              in the capture path. A gclid is a case-sensitive base64-ish
 *              token; lowercasing it ("cj0kcqj..." instead of "Cj0KCQj...") is
 *              the #1 cause of "Unparseable gclid".
 *
 *   2. MUTATION — URL re-encoding (double-encode), trimming, or redirect
 *              stripping of the `?gclid=` query parameter either client-side
 *              (capture) or server-side (next.config.js redirects).
 *
 *   3. CONFIG — the Google Ads conversion action ("Site Visit Booked") being
 *              the wrong `type` (must be a click/offline-import action, not a
 *              website/call action) or `status` REMOVED, so Google cannot map
 *              the raw gclid to a click in the customer account.
 *
 * The script authenticates twice with the credentials in `.env.local`:
 *   - Google Ads API (v22) via the manager OAuth web client + developer token
 *     to INSPECT the "Site Visit Booked" conversion action on customer 8479028400.
 *   - Data Manager OAuth (scope datamanager) to VERIFY the token that backs
 *     `uploadOfflineConversion()` exchanges successfully.
 *
 * It then statically audits the codebase for corruption vectors and applies
 * two idempotent repairs:
 *   a. a first-party-cookie write/read of the RAW gclid in lib/tracking.ts, and
 *   b. a pre-ingest `validateGclid()` guard in app/api/ghl-webhook/route.ts
 *      that rejects malformed click ids before they reach Google.
 *
 * Usage:
 *   node scripts/fix-unparseable-gclid.js            # diagnose + report only
 *   node scripts/fix-unparseable-gclid.js --apply    # also apply code fixes
 *   node scripts/fix-unparseable-gclid.js --json     # machine-readable report
 *
 * Idempotent: --apply is a no-op on already-patched files (marker-comment guard).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const fs = require('fs');
const path = require('path');
const https = require('https');
const { google } = require('googleapis');

const ROOT = path.resolve(__dirname, '..');
const API_VERSION = 'v22';
const ADS_HOST = 'googleads.googleapis.com';

const TRACKING_FILE = path.join(ROOT, 'lib', 'tracking.ts');
const WEBHOOK_FILE = path.join(ROOT, 'app', 'api', 'ghl-webhook', 'route.ts');
const NEXT_CONFIG_FILE = path.join(ROOT, 'next.config.js');

// Idempotence markers (mirror prior fix scripts).
const COOKIE_MARKER = 'GCLID_COOKIE_KEY';
const GUARD_MARKER = 'validateGclid';

// The target conversion action (from .env.local, with fallback).
const SITE_VISIT_ACTION_ID = (process.env.GADS_CONV_SITE_VISIT || '7700922852').replace(/\D/g, '');
const JOB_WON_ACTION_ID = (process.env.GADS_CONV_JOB_WON || '7700922855').replace(/\D/g, '');
const TARGET_CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');

const APPLY = process.argv.includes('--apply');
const JSON_OUT = process.argv.includes('--json');

// ---------------------------------------------------------------------------
// helpers — HTTPS + report accumulators
// ---------------------------------------------------------------------------

const report = {
  generatedAt: null,
  customer: TARGET_CUSTOMER_ID,
  sections: {},
  issues: [],
  fixes: [],
};

function note(section, key, detail) {
  if (!report.sections[section]) report.sections[section] = {};
  report.sections[section][key] = detail;
}

function issue(severity, section, title, detail) {
  report.issues.push({ severity, section, title, detail });
}

function httpRequest(host, method, postPath, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = bodyObj ? JSON.stringify(bodyObj) : null;
    const opts = {
      host,
      path: postPath,
      method,
      headers: {
        ...headers,
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function explainAdsError(body) {
  const errs = (body && body.error && body.error.details &&
    body.error.details.flatMap((d) => d.errors || [])) || [];
  if (!errs.length && body && body.error) {
    return [`${body.error.status || body.error.code}: ${body.error.message}`];
  }
  return errs.map((e) => e.message);
}

/** A well-formed Google Click ID: case-sensitive base64-ish token, 20–128 chars. */
const GCLID_RE = /^[A-Za-z0-9_-]{20,128}$/;

function gclidIsWellFormed(raw) {
  if (typeof raw !== 'string') return { ok: false, reason: 'not a string' };
  const s = raw.trim();
  if (!s) return { ok: false, reason: 'empty after trim' };
  // Genuine gclids essentially always carry an uppercase char. A fully
  // lowercase token is the smoking gun for a .toLowerCase() transform upstream.
  if (s === s.toLowerCase() && s !== s.toUpperCase()) {
    return { ok: false, reason: 'appears lowercased (gclid is case-sensitive)' };
  }
  if (!GCLID_RE.test(s)) {
    return { ok: false, reason: `fails charset/length rule (${s.length} chars)` };
  }
  return { ok: true, value: s };
}

function humanReadableSection(title, map, indent = '  ') {
  const lines = [`${indent}${title}`];
  for (const [k, v] of Object.entries(map)) {
    const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
    lines.push(`${indent}  • ${k}: ${value}`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 1. GOOGLE ADS API — inspect "Site Visit Booked" conversion action
// ---------------------------------------------------------------------------

async function inspectConversionAction(oauth2) {
  const { token: accessToken } = await oauth2.getAccessToken();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }

  const res = await httpRequest(
    ADS_HOST,
    'POST',
    `/${API_VERSION}/customers/${TARGET_CUSTOMER_ID}/googleAds:searchStream`,
    headers,
    {
      query: `SELECT conversion_action.resource_name, conversion_action.id, conversion_action.name,
                     conversion_action.status, conversion_action.type, conversion_action.category,
                     conversion_action.include_in_conversions_metric, conversion_action.counting_type
              FROM conversion_action
              WHERE conversion_action.id IN (${SITE_VISIT_ACTION_ID}, ${JOB_WON_ACTION_ID})`,
    }
  );

  if (res.status !== 200) {
    const err = explainAdsError(res.body).join(' | ');
    issue('error', 'google-ads-api', 'conversion action inspect failed', `HTTP ${res.status}: ${err}`);
    return null;
  }

  const rows = (Array.isArray(res.body) ? res.body : [res.body]).flatMap((b) => b.results || []);
  const actions = rows.map((r) => r.conversionAction || {});
  return actions;
}

function assessConversionAction(ca) {
  const id = (ca.id || '').toString();
  const name = ca.name || '(unnamed)';
  const type = ca.type || '';
  const status = ca.status || '';

  // A click/offline-import action must be type UPLOAD_CLICKS. Other values
  // (WEBSITE_CALL, UPLOAD_CALLS, GOOGLE_ANALYTICS_*, APP_*, etc.) cannot be
  // attributed against a raw gclid and produce "Unparseable gclid".
  const typeIsClickBased = type === 'UPLOAD_CLICKS';
  const statusOk = status === 'ENABLED';

  note('conversion-actions', name, {
    id,
    type,
    status,
    type_is_click_based: typeIsClickBased,
    include_in_conversions: ca.includeInConversionsMetric,
    counting_type: ca.countingType,
  });

  if (!typeIsClickBased) {
    issue('error', 'google-ads-api', `"${name}" has wrong conversion action type`,
      `type=${type || '(missing)'}. Offline click uploads require type UPLOAD_CLICKS; `
      + `an action of type ${type || 'unknown'} cannot resolve a raw gclid and yields "Unparseable gclid". `
      + `Recreate the action as an offline click-conversion or fix its type.`);
  }
  if (!statusOk) {
    issue('error', 'google-ads-api', `"${name}" is ${status || 'not ENABLED'}`,
      `status=${status || '(missing)'}. A non-ENABLED action rejects uploads.`);
  }
  return { name, id, type, status, ok: typeIsClickBased && statusOk };
}

// ---------------------------------------------------------------------------
// 2. DATA MANAGER — verify the offline-conversion OAuth token exchanges
// ---------------------------------------------------------------------------

async function verifyDataManagerToken() {
  const clientId = process.env.GOOGLE_DM_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DM_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DM_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    issue('error', 'data-manager', 'Data Manager OAuth env vars missing',
      'GOOGLE_DM_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN not set in .env.local. '
      + 'uploadOfflineConversion() will throw and no offline conversion can upload.');
    note('data-manager', 'token_exchange', 'SKIPPED (env missing)');
    return null;
  }

  const tokenUrl = process.env.DM_OAUTH_TOKEN_URL || process.env.GADS_OAUTH_TOKEN_URL || 'https://oauth2.googleapis.com/token';
  const host = tokenUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const postPath = '/' + tokenUrl.replace(/^https?:\/\/[^/]+\//, '');

  const res = await httpRequest(host, 'POST', postPath, { 'Content-Type': 'application/x-www-form-urlencoded' }, null);
  // Note: httpRequest JSON-encodes. For form-encoded OAuth we must send raw
  // form data, so fall through to a dedicated form encoder if JSON body is
  // rejected. Simpler: use URLSearchParams via a manual request here.
  // (Google OAuth ignores Content-Type JSON for a form endpoint and rejects.)
  if (res.status !== 200) {
    // Re-try with proper form encoding.
    const form = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString();
    const retry = await new Promise((resolve, reject) => {
      const req = https.request({
        host,
        path: postPath,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(form) },
      }, (r) => {
        let data = '';
        r.on('data', (c) => (data += c));
        r.on('end', () => { let p; try { p = JSON.parse(data); } catch { p = { raw: data }; } resolve({ status: r.statusCode, body: p }); });
      });
      req.on('error', reject);
      req.write(form);
      req.end();
    });
    if (retry.status !== 200 || !retry.body.access_token) {
      issue('error', 'data-manager', 'Data Manager token exchange failed',
        `HTTP ${retry.status}: ${JSON.stringify(retry.body).slice(0, 200)}. `
        + 'Regenerate with scripts/generate-dm-token.js (scope https://www.googleapis.com/auth/datamanager).');
      note('data-manager', 'token_exchange', `FAILED (HTTP ${retry.status})`);
      return null;
    }
    note('data-manager', 'token_exchange', 'OK (access token obtained)');
    return { accessToken: retry.body.access_token, ok: true };
  }
  note('data-manager', 'token_exchange', 'OK');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 3. STATIC AUDIT — corruption vectors across capture, form, and upload path
// ---------------------------------------------------------------------------

function auditCodebase() {
  const trackingSrc = fs.existsSync(TRACKING_FILE) ? fs.readFileSync(TRACKING_FILE, 'utf8') : '';
  const webhookSrc = fs.existsSync(WEBHOOK_FILE) ? fs.readFileSync(WEBHOOK_FILE, 'utf8') : '';
  const nextCfg = fs.existsSync(NEXT_CONFIG_FILE) ? fs.readFileSync(NEXT_CONFIG_FILE, 'utf8') : '';

  // (a) lowercase transforms in the capture/upload files
  const lowerTracking = (trackingSrc.match(/\.toLowerCase\(|\.toLocaleLowerCase\(/g) || []).length;
  const lowerWebhook = (webhookSrc.match(/\.toLowerCase\(|\.toLocaleLowerCase\(/g) || []).length;
  note('static-audit', 'lowercase_transform', { lib_tracking: lowerTracking, ghl_webhook_route: lowerWebhook });
  if (lowerTracking || lowerWebhook) {
    issue('error', 'static-audit', 'lowercase transform present in gclid path',
      `toLowerCase() found ${lowerTracking}× in lib/tracking.ts and ${lowerWebhook}× in route.ts. `
      + 'A lowercase gclid is the canonical "Unparseable gclid" trigger.');
  }

  // (b) re-encoding / encodeURIComponent on gclid
  const reencode = /encodeURIComponent\(\s*.*gclid|gclid\s*.*encodeURIComponent/gi.test(trackingSrc + webhookSrc)
    || /encodeURI\s*\(/i.test(trackingSrc + webhookSrc);
  note('static-audit', 're_encoding', reencode ? 'FOUND (inspect)' : 'none of gclid');
  // The cookie write uses encodeURIComponent — that is CORRECT (cookie-safe) and
  // is decoded symmetrically in getGclidFromCookie(), so flag it as benign.
  note('static-audit', 'cookie_encode_is_benign', 'encodeURIComponent only wraps the cookie value; getGclidFromCookie() decodes it symmetrically.');

  // (c) redirect stripping in next.config.js
  const redirectCount = (nextCfg.match(/source:\s*/g) || []).length;
  const hasQueryFilter = (nextCfg.match(/has:\s*/g) || []).length > 0;
  note('static-audit', 'server_redirects', {
    rule_count: redirectCount,
    query_filter_rules: hasQueryFilter,
  });
  if (hasQueryFilter) {
    issue('warning', 'static-audit', 'next.config.js redirects use `has` query filters',
      'A redirect whose `has` matches the query string could drop ?gclid=. Review to ensure capture still sees gclid before any such redirect.');
  }

  // (d) markers — whether prior fixes are present
  const cookiePatched = trackingSrc.includes(COOKIE_MARKER);
  const guardPatched = webhookSrc.includes(GUARD_MARKER);
  note('static-audit', 'first_party_cookie_present', cookiePatched);
  note('static-audit', 'pre_ingest_guard_present', guardPatched);

  return { trackingSrc, webhookSrc, cookiePatched, guardPatched };
}

// ---------------------------------------------------------------------------
// 4. REMEDIATION — idempotent patches
// ---------------------------------------------------------------------------

function patchTracking(trackingSrc) {
  if (trackingSrc.includes(COOKIE_MARKER)) return { file: TRACKING_FILE, changed: false, reason: 'already patched' };
  if (!APPLY) return { file: TRACKING_FILE, changed: false, reason: 'dry-run (pass --apply to write)' };

  let src = trackingSrc;
  const keyAnchor = `const GCLID_TS_KEY = 'ur_gclid_ts';`;
  if (!src.includes(keyAnchor)) return { file: TRACKING_FILE, changed: false, reason: 'ERROR: GCLID_TS_KEY anchor missing — file drifted' };

  src = src.replace(keyAnchor, keyAnchor + `
// First-party cookie name for the same gclid. A cookie survives redirects and
// private/cleared localStorage far better than localStorage alone, so it is
// the authoritative store; localStorage is kept as a secondary read fallback.
const GCLID_COOKIE_KEY = 'ur_gclid';
const GCLID_COOKIE_MAX_AGE = String(90 * 24 * 60 * 60); // 90 days, in seconds`);

  src = src.replace(
    `      window.localStorage.setItem(GCLID_STORAGE_KEY, gclid);
      window.localStorage.setItem(GCLID_TS_KEY, String(Date.now()));`,
    `      window.localStorage.setItem(GCLID_STORAGE_KEY, gclid);
      window.localStorage.setItem(GCLID_TS_KEY, String(Date.now()));
      // First-party cookie — raw, unaltered gclid, 90-day Max-Age, path=/.
      // encodeURIComponent here is COOKIE-SAFE encoding only; getGclidFromCookie()
      // decodes it symmetrically, so the token is preserved case+charset exactly.
      document.cookie =
        GCLID_COOKIE_KEY + '=' + encodeURIComponent(gclid) +
        '; path=/; max-age=' + GCLID_COOKIE_MAX_AGE +
        '; samesite=lax';`
  );

  const readAnchor = `    const value = window.localStorage.getItem(GCLID_STORAGE_KEY);`;
  if (!src.includes(readAnchor)) return { file: TRACKING_FILE, changed: false, reason: 'ERROR: getGclid() read anchor missing — file drifted' };
  src = src.replace(readAnchor, `    const cookieValue = getGclidFromCookie();
    const value = cookieValue || window.localStorage.getItem(GCLID_STORAGE_KEY);`);

  const helperAnchor = `export function getGclid(): string | null {`;
  if (!src.includes(helperAnchor)) return { file: TRACKING_FILE, changed: false, reason: 'ERROR: getGclid() anchor missing' };
  src = src.replace(helperAnchor, `/** Read the raw gclid back out of the first-party cookie, if present. */
function getGclidFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith(GCLID_COOKIE_KEY + '='));
    if (!match) return null;
    return decodeURIComponent(match.slice(GCLID_COOKIE_KEY.length + 1));
  } catch {
    return null;
  }
}

export function getGclid(): string | null {`);

  fs.writeFileSync(TRACKING_FILE, src);
  return { file: TRACKING_FILE, changed: true, reason: 'added raw first-party cookie write/read (90-day TTL)' };
}

function patchWebhook(webhookSrc) {
  if (webhookSrc.includes(GUARD_MARKER)) return { file: WEBHOOK_FILE, changed: false, reason: 'already patched' };
  if (!APPLY) return { file: WEBHOOK_FILE, changed: false, reason: 'dry-run (pass --apply to write)' };

  let src = webhookSrc;

  const guardAnchor = `function jsonError(message: string, status = 400) {`;
  if (!src.includes(guardAnchor)) return { file: WEBHOOK_FILE, changed: false, reason: 'ERROR: jsonError() anchor missing — file drifted' };
  const guardFn = `const GCLID_RE = /^[A-Za-z0-9_-]{20,128}$/;

/**
 * Validate a Google Click ID BEFORE it is handed to the Data Manager ingest
 * endpoint. Data Manager fast-fails the ENTIRE request on a single bad event
 * (no partial-failure row), so we reject malformed / lowercased / double-encoded
 * / gbraid-shaped tokens here and log them locally instead of corrupting the
 * whole upload.
 */
function validateGclid(raw: string): { ok: true; value: string } | { ok: false; reason: string } {
  const s = (raw || '').trim();
  if (!s) return { ok: false, reason: 'gclid is empty' };
  if (s === s.toLowerCase() && s !== s.toUpperCase()) {
    return { ok: false, reason: 'gclid appears lowercased — gclid is case-sensitive' };
  }
  if (!GCLID_RE.test(s)) {
    return { ok: false, reason: 'gclid fails charset/length rule (' + s.length + ' chars)' };
  }
  return { ok: true, value: s };
}
`;
  src = src.replace(guardAnchor, guardFn + guardAnchor);

  const postAnchor = `  const value = rawValue != null && !isNaN(Number(rawValue)) ? Number(rawValue) : conv.defaultValue;`;
  if (!src.includes(postAnchor)) return { file: WEBHOOK_FILE, changed: false, reason: 'ERROR: POST() value-anchor missing — file drifted' };
  const guardBlock = `  const gclidCheck = validateGclid(gclid);
  if (!gclidCheck.ok) {
    console.error('[ghl-webhook] rejecting malformed gclid for "' + conv.label + '": ' + gclidCheck.reason);
    await emitFleetIngest({
      event_type: 'ghl_offline_conversion_skipped',
      summary: 'GHL "' + conv.label + '" — malformed gclid rejected (' + gclidCheck.reason + ')',
      payload: { stage, contactId, email, phone, gclid: (gclid || '').slice(0, 12) + '…', reason: gclidCheck.reason },
    });
    return NextResponse.json({ success: false, ignored: true, reason: 'malformed gclid: ' + gclidCheck.reason }, { status: 422 });
  }

  const value = rawValue != null && !isNaN(Number(rawValue)) ? Number(rawValue) : conv.defaultValue;`;
  src = src.replace(postAnchor, guardBlock);

  src = src.replace(
    `      gclid,
      conversionActionId: conv.conversionActionId,`,
    `      gclid: gclidCheck.value,
      conversionActionId: conv.conversionActionId,`
  );

  fs.writeFileSync(WEBHOOK_FILE, src);
  return { file: WEBHOOK_FILE, changed: true, reason: 'added validateGclid() pre-ingest guard + local rejection/logging' };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const now = new Date().toISOString();
  report.generatedAt = now;

  // --- static audit first (always safe, no network) ---
  const { trackingSrc, webhookSrc, cookiePatched, guardPatched } = auditCodebase();

  // --- Google Ads API + Data Manager (network) ---
  let actionFindings = null;
  let dmResult = null;
  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_ADS_CLIENT_ID,
      process.env.GOOGLE_ADS_CLIENT_SECRET
    );
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN });
    const actions = await inspectConversionAction(oauth2);
    if (actions && actions.length) {
      actionFindings = actions.map(assessConversionAction);
    } else {
      note('conversion-actions', 'lookup_result', 'No conversion_action rows returned (may not exist / wrong customer scope)');
      issue('warning', 'google-ads-api', 'conversion action not found',
        `No conversion_action matched ids ${SITE_VISIT_ACTION_ID}, ${JOB_WON_ACTION_ID} on customer ${TARGET_CUSTOMER_ID}. `
        + 'Confirm the ids match the live account and the OAuth user can see the action.');
    }
  } catch (err) {
    issue('error', 'google-ads-api', 'API auth/inspect failed', err.message);
  }

  try {
    dmResult = await verifyDataManagerToken();
  } catch (err) {
    issue('error', 'data-manager', 'token verification threw', err.message);
  }

  // --- remediation ---
  const tRes = patchTracking(trackingSrc);
  const wRes = patchWebhook(webhookSrc);
  report.fixes = [tRes, wRes].filter((r) => r.changed).map((r) => ({
    file: path.relative(ROOT, r.file),
    reason: r.reason,
  }));
  if (tRes.changed) note('remediation', path.relative(ROOT, tRes.file), tRes.reason);
  if (wRes.changed) note('remediation', path.relative(ROOT, wRes.file), wRes.reason);
  if (!report.fixes.length && APPLY) {
    note('remediation', 'no_changes', 'No patches needed — both cookie capture and the pre-ingest guard are already present.');
  }

  // --- validation cases (self-test of the guard logic) ---
  const cases = [
    ['valid (uppercase+lowercase+digits)', 'Cj0KCQiA2onjBhDLARIsAOzP5Y9xZ8nBfL2kQmTvR6wY1dHc3sNpJ0uE4gA7bX5iOe9MlWaKr', 'ok'],
    ['lowercased (transform corruption)', 'cj0kcqia2onjbhdlariso9p5y9xz8nbf2kqmtvr6wy1dhc3snpj0ue4ga7bx5io', 'reject'],
    ['too short / gbraid-shaped', 'gbraid12345', 'reject'],
    ['empty', '', 'reject'],
  ];
  note('validation', 'cases', cases.map(([n, gclid, expect]) => {
    const v = gclidIsWellFormed(gclid);
    const got = v.ok ? 'ok' : 'reject';
    return { name: n, gclid: gclid.slice(0, 10) + '…', expect, got, pass: got === expect };
  }));

  // --- output ---
  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('================================================================');
  console.log(' U N P A R S E A B L E   G C L I D   —   D I A G N O S T I C');
  console.log('================================================================');
  console.log(`Generated:  ${now}`);
  console.log(`Customer:   ${TARGET_CUSTOMER_ID}`);
  console.log(`Site Visit Booked action: ${SITE_VISIT_ACTION_ID}`);
  console.log(`Job Won action:          ${JOB_WON_ACTION_ID}\n`);

  console.log('── 1. Conversion action inspection (Google Ads API) ─────────────');
  if (actionFindings && actionFindings.length) {
    for (const f of actionFindings) {
      console.log(`  • ${f.name} (${f.id})`);
      console.log(`      type=${f.type}  status=${f.status}  wellformed_${f.ok ? 'PASS' : 'FAIL'}`);
    }
  } else {
    console.log('  (no rows returned — see issues below)');
  }
  console.log(humanReadableSection('conversion action detail', report.sections['conversion-actions'] || {}, '  '));

  console.log('\n── 2. Data Manager OAuth ──────────────────────────────────────────');
  console.log(humanReadableSection('data manager', report.sections['data-manager'] || {}, '  '));

  console.log('\n── 3. Static codebase audit ───────────────────────────────────────');
  console.log(humanReadableSection('static audit', report.sections['static-audit'] || {}, '  '));

  console.log('\n── 4. gclid validation self-test ──────────────────────────────────');
  for (const c of report.sections.validation.cases) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} → expected ${c.expect}, got ${c.got}`);
  }

  console.log('\n── Issues ─────────────────────────────────────────────────────────');
  if (!report.issues.length) {
    console.log('  (none)');
  } else {
    for (const i of report.issues) {
      console.log(`  [${i.severity.toUpperCase()}] ${i.section} — ${i.title}`);
      console.log(`        ${i.detail}`);
    }
  }

  console.log('\n── Remediation ────────────────────────────────────────────────────');
  if (!APPLY) {
    console.log('  Dry run. Re-run with --apply to write code fixes.');
    if (!cookiePatched) console.log('    • would add raw first-party cookie capture in lib/tracking.ts');
    if (!guardPatched) console.log('    • would add pre-ingest validateGclid() guard in route.ts');
  } else if (report.fixes.length) {
    for (const f of report.fixes) console.log(`  ✓ ${f.file} — ${f.reason}`);
  } else {
    console.log('  No changes — pipeline already sanitized.');
  }
  console.log('\nDone. Run `npm run typecheck` after --apply to confirm no type errors.');
}

main().catch((err) => {
  console.error('\nFATAL:', err && err.message ? err.message : err);
  process.exit(1);
});
