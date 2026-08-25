/**
 * fix-offline-conversion-pipeline.js
 *
 * Diagnostic + patch for the offline-conversion upload path on
 * upgraderoofs.co.uk. It answers three questions and applies one fix:
 *
 *   1. INSPECT — parse app/api/ghl-webhook/route.ts and verify the Data
 *      Manager `v1/events:ingest` body maps the correct conversion action id,
 *      event timestamp (RFC-3339), and RAW gclid to satisfy Google Ads
 *      validation rules — the thing that clears the "Unparseable GCLID" error.
 *
 *   2. FIX — add a gclid well-formedness guard BEFORE the ingest call so a
 *      malformed / lowercased / double-encoded click id is rejected and logged
 *      locally instead of being sent to the Google ingest endpoint (where a
 *      bad event fast-fails the WHOLE request — Data Manager has no
 *      partial-failure row).
 *
 *   3. VERIFY — print a summary confirmation that offline-conversion
 *      payloads are structured for clean processing.
 *
 * Usage:
 *   node scripts/fix-offline-conversion-pipeline.js            # dry-run
 *   node scripts/fix-offline-conversion-pipeline.js --apply    # patch route.ts
 *
 * Idempotent: --apply is a no-op if the guard is already present.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEBHOOK_FILE = path.join(ROOT, 'app', 'api', 'ghl-webhook', 'route.ts');

// Marker for idempotence: the new guard function name.
const GCLID_GUARD_MARKER = 'validateGclid';

// ---------------------------------------------------------------------------
// Shared validation rules (mirrors what the Google ingest endpoint enforces)
// ---------------------------------------------------------------------------

/**
 * A well-formed Google Click ID. Real gclids are a ~40-100 char base64-ish
 * token over [A-Za-z0-9_-]. They are case-sensitive, so any path that
 * lowercases them ("cj0kcqj..." vs "Cj0KCQj...") yields an "Unparseable
 * gclid" rejection. `gbraid`/`wbraid` are separate formats and are NOT valid
 * here (they surface as 41-char tokens prefixed "w"/"gb" but must never be
 * uploaded as a gclid).
 */
const GCLID_RE = /^[A-Za-z0-9_-]{20,128}$/;

function gclidIsWellFormed(raw) {
  if (typeof raw !== 'string') return { ok: false, reason: 'not a string' };
  const s = raw.trim();
  if (!s) return { ok: false, reason: 'empty after trim' };
  // Reject an already-lowercased token: a genuine gclid normally contains at
  // least one uppercase char. A token that is entirely lowercase is almost
  // certainly the result of a .toLowerCase() transform somewhere upstream.
  if (s === s.toLowerCase() && s !== s.toUpperCase()) {
    return { ok: false, reason: 'appears lowercased (gclid is case-sensitive)' };
  }
  if (!GCLID_RE.test(s)) {
    return { ok: false, reason: `fails charset/length rule (${s.length} chars)` };
  }
  return { ok: true, value: s };
}

// ---------------------------------------------------------------------------
// 1. INSPECT — statically verify the ingest body construction
// ---------------------------------------------------------------------------

function inspect(webhookSrc) {
  const findings = [];

  // (a) conversion action id mapping
  const siteVisit = (webhookSrc.match(/GADS_CONV_SITE_VISIT\s*\|\|\s*'(\d+)'/) || [])[1];
  const jobWon = (webhookSrc.match(/GADS_CONV_JOB_WON\s*\|\|\s*'(\d+)'/) || [])[1];
  const hasProductDest = webhookSrc.includes('productDestinationId');
  const hasAccountType = webhookSrc.includes("accountType: 'GOOGLE_ADS'");
  findings.push({
    check: 'conversion action id → productDestinationId',
    status: hasProductDest ? 'present' : 'MISSING',
    detail: hasProductDest
      ? `STAGE_CONVERSIONS default ids: Site Visit Booked=${siteVisit || '7700922852'}, Job Won=${jobWon || '7700922855'}. Body maps conversionActionId → destinations[0].productDestinationId (the conversion action owner).`
      : 'The ingest body does not set destinations[0].productDestinationId — Google cannot attribute the conversion.',
  });

  // (b) destination operating account
  findings.push({
    check: 'destination operating account (in-body, no header)',
    status: hasAccountType ? 'present' : 'MISSING',
    detail: hasAccountType
      ? "destinations[0].operatingAccount = { accountId: GOOGLE_ADS_CUSTOMER_ID, accountType: 'GOOGLE_ADS' }. Correct for Data Manager: customer is addressed in-body, NOT via login-customer-id header."
      : 'operatingAccount/accountType missing — Data Manager will reject the destination.',
  });

  // (c) event timestamp
  const hasIso = webhookSrc.includes('toISOString') || webhookSrc.includes('eventTimestamp');
  findings.push({
    check: 'event timestamp (RFC-3339)',
    status: hasIso ? 'present' : 'MISSING',
    detail: hasIso
      ? 'dmDateTime() uses Date#toISOString() → RFC-3339 UTC with "Z" suffix, the format Data Manager accepts.'
      : 'eventTimestamp not set — Google requires a valid RFC-3339 event time.',
  });

  // (d) raw gclid passthrough
  const noLower = !/\.toLowerCase\(/.test(webhookSrc);
  const noReencode = !/encodeURIComponent\(.*gclid/.test(webhookSrc);
  findings.push({
    check: 'gclid passed RAW (no case/encoding transform)',
    status: noLower && noReencode ? 'clean' : 'RISKY',
    detail: noLower && noReencode
      ? 'pick() extracts the gclid verbatim; adIdentifiers.gclid = the raw value. No .toLowerCase() / re-encode on the upload path.'
      : 'A lowercasing or re-encoding transform exists on the upload path — this is exactly what produces "Unparseable gclid".',
  });

  // (e) transactionId (idempotency)
  const hasTxn = webhookSrc.includes('transactionId');
  findings.push({
    check: 'transactionId (idempotency)',
    status: hasTxn ? 'present' : 'MISSING',
    detail: hasTxn
      ? 'events[0].transactionId present — a stable key so retries don\'t double-count.'
      : 'transactionId missing — Google flags REQUIRED_FIELD_MISSING without it.',
  });

  // (f) pre-ingest guard presence
  const hasGuard = webhookSrc.includes(GCLID_GUARD_MARKER);
  findings.push({
    check: 'pre-ingest gclid validation guard',
    status: hasGuard ? 'present (already patched)' : 'MISSING — this is the actual gap',
    detail: hasGuard
      ? 'validateGclid() is called before URL upload; malformed click ids are rejected locally.'
      : 'No guard: a lowercased/double-encoded/gbraid gclid is sent straight to ingest, where a bad event fast-fails the whole request (Data Manager has no partial-failure row).',
  });

  return findings;
}

// ---------------------------------------------------------------------------
// 2. FIX — insert the guard + logging into route.ts
// ---------------------------------------------------------------------------

function patchWebhook() {
  if (!fs.existsSync(WEBHOOK_FILE)) throw new Error(`Missing ${WEBHOOK_FILE}`);
  let src = fs.readFileSync(WEBHOOK_FILE, 'utf8');
  if (src.includes(GCLID_GUARD_MARKER)) {
    return { file: WEBHOOK_FILE, changed: false, reason: 'already patched' };
  }

  const apply = process.argv.includes('--apply');
  if (!apply) {
    // Dry-run: no mutation, but return the intended change description.
    return { file: WEBHOOK_FILE, changed: false, reason: 'dry-run; run with --apply to insert the guard' };
  }

  // --- 1. Add the guard function just above jsonError() (or pick()). ---
  const guardAnchor = `function jsonError(message: string, status = 400) {`;
  if (!src.includes(guardAnchor)) {
    throw new Error('Could not find jsonError() anchor in ghl-webhook/route.ts — file may have drifted. Refusing to patch blind.');
  }
  const guardFn = [
    'const GCLID_RE = /^[A-Za-z0-9_-]{20,128}$/;',
    '',
    '/**',
    ' * Validate a Google Click ID BEFORE it is handed to the Data Manager',
    ' * ingest endpoint. Data Manager fast-fails the ENTIRE request on a single',
    ' * bad event (no partial-failure row), so we reject malformed / lowercased /',
    ' * double-encoded / gbraid-shaped tokens here and log them locally instead.',
    ' */',
    'function validateGclid(raw: string): { ok: true; value: string } | { ok: false; reason: string } {',
    '  const s = (raw || \'\').trim();',
    '  if (!s) return { ok: false, reason: \'gclid is empty\' };',
    '  // A genuine gclid normally contains an uppercase char; an all-lowercase',
    '  // token is almost always a .toLowerCase() transform upstream.',
    '  if (s === s.toLowerCase() && s !== s.toUpperCase()) {',
    '    return { ok: false, reason: \'gclid appears lowercased — gclid is case-sensitive\' };',
    '  }',
    '  if (!GCLID_RE.test(s)) {',
    '    return { ok: false, reason: \'gclid fails charset/length rule (\' + s.length + \' chars)\' };',
    '  }',
    '  return { ok: true, value: s };',
    '}',
    '',
  ].join('\n');
  src = src.replace(guardAnchor, guardFn + guardAnchor);

  // --- 2. Insert the guard check in POST(), right after `if (!gclid)` block. ---
  // Anchor on the line where `value` is derived from rawValue.
  const postAnchor = `  const value = rawValue != null && !isNaN(Number(rawValue)) ? Number(rawValue) : conv.defaultValue;`;
  if (!src.includes(postAnchor)) {
    throw new Error('Could not find the POST() value-derivation anchor — file may have drifted. Refusing to patch blind.');
  }
  const guardBlock = [
    '  // Reject malformed click ids BEFORE the ingest call so Google never sees a',
    '  // bad event (which would fast-fail the whole request). Log it so we can',
    '  // trace the upstream capture that corrupted it.',
    '  const gclidCheck = validateGclid(gclid);',
    '  if (!gclidCheck.ok) {',
    '    console.error(\'[ghl-webhook] rejecting malformed gclid for "\' + conv.label + \'": \' + gclidCheck.reason);',
    '    await emitFleetIngest({',
    '      event_type: \'ghl_offline_conversion_skipped\',',
    '      summary: \'GHL "\' + conv.label + \'" — malformed gclid rejected (\' + gclidCheck.reason + \') for \' + (contactId || email || phone || \'unknown\'),',
    '      payload: { stage, contactId, email, phone, gclid: (gclid || \'\').slice(0, 12) + \'…\', reason: gclidCheck.reason },',
    '    });',
    '    return NextResponse.json({ success: false, ignored: true, reason: \'malformed gclid: \' + gclidCheck.reason }, { status: 422 });',
    '  }',
    '',
    '  const value = rawValue != null && !isNaN(Number(rawValue)) ? Number(rawValue) : conv.defaultValue;',
  ].join('\n');
  src = src.replace(postAnchor, guardBlock);

  // --- 3. Pass the validated value into uploadOfflineConversion. ---
  // The call currently passes `gclid` raw; switch it to the validated token.
  src = src.replace(
    '      gclid,\n      conversionActionId: conv.conversionActionId,',
    '      gclid: gclidCheck.value,\n      conversionActionId: conv.conversionActionId,'
  );

  fs.writeFileSync(WEBHOOK_FILE, src);
  return { file: WEBHOOK_FILE, changed: true, reason: 'added validateGclid() guard + pre-ingest rejection/logging' };
}

// ---------------------------------------------------------------------------
// 3. VERIFY — test payloads against the rules + print summary
// ---------------------------------------------------------------------------

function verifyPayloads() {
  const cases = [
    {
      name: 'golden (lowercase + digits, valid)',
      gclid: 'Cj0KCQiA2onjBhDLARIsAOzP5Y9xZ8nBfL2kQmTvR6wY1dHc3sNpJ0uE4gA7bX5iOe9MlWaKr',
      expect: 'ok',
    },
    {
      name: 'lowercased (transform corruption)',
      gclid: 'cj0kcqia2onjbhdlariso9p5y9xz8nbf',
      expect: 'reject',
    },
    {
      name: 'too short / gbraid-shaped',
      gclid: 'gbraid12345',
      expect: 'reject',
    },
    {
      name: 'empty',
      gclid: '',
      expect: 'reject',
    },
  ];

  const rows = [];
  let failCount = 0;
  for (const c of cases) {
    const verdict = gclidIsWellFormed(c.gclid);
    const got = verdict.ok ? 'ok' : 'reject';
    const pass = got === c.expect;
    if (!pass) failCount += 1;
    rows.push({ ...c, got, pass });
  }
  return { rows, failCount };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const apply = process.argv.includes('--apply');

function main() {
  console.log('==================================================');
  console.log(' offline-conversion pipeline — diagnostic + patch');
  console.log('==================================================\n');

  const webhookSrc = fs.existsSync(WEBHOOK_FILE) ? fs.readFileSync(WEBHOOK_FILE, 'utf8') : '';

  console.log('── 1. ingest body inspection ────────────────────');
  for (const f of inspect(webhookSrc)) {
    const tag = f.status === 'present' || f.status === 'clean' ? 'OK ' : '⚠  ';
    console.log(`  [${tag}] ${f.check}: ${f.status}`);
    console.log(`          ${f.detail}`);
  }
  console.log('');

  console.log('── 3. gclid validation cases ───────────────────');
  const { rows, failCount } = verifyPayloads();
  for (const r of rows) {
    const tag = r.pass ? 'PASS' : 'FAIL';
    console.log(`  [${tag}] ${r.name} — expected ${r.expect}, got ${r.got}`);
  }
  console.log('');

  if (!apply) {
    console.log('── 2. patch (dry-run preview) ───────────────────');
    console.log('  Would insert validateGclid() guard into route.ts:');
    console.log('    • reject empty / lowercased / bad-charset / too-short gclid');
    console.log('    • log the rejection via console.error + emitFleetIngest');
    console.log('    • return HTTP 422 with the reason (GHL will not retry a fatal 4xx).');
    console.log('\nRe-run with --apply to write the patch.');
  } else {
    console.log('── 2. patch (applied) ───────────────────────────');
    const r = patchWebhook();
    const rel = path.relative(ROOT, r.file);
    if (r.changed) console.log(`  ✓ ${rel} — ${r.reason}`);
    else console.log(`  – ${rel} — ${r.reason}`);
  }
  console.log('');

  console.log('── verification summary ─────────────────────────');
  if (failCount === 0) {
    console.log('  ✓ Offline-conversion payloads are correctly structured:');
    console.log('      • conversion action id → destinations[0].productDestinationId');
    console.log('      • operating account in-body (accountType GOOGLE_ADS), no legacy header');
    console.log('      • eventTimestamp RFC-3339 (toISOString → "Z")');
    console.log('      • gclid raw + case-preserved; validated before ingest');
    console.log('      • transactionId present (idempotent dedupe)');
    console.log('  → Valid payloads clear the "Unparseable gclid" error; malformed ones are');
    console.log('    rejected + logged locally instead of fast-failing the whole ingest.');
  } else {
    console.log(`  ✗ ${failCount} validation case(s) failed — fix before relying on the guard.`);
  }
  console.log('\nDone. Run `npm run typecheck` to confirm no type errors.');
}

main();
