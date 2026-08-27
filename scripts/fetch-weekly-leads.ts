/**
 * scripts/fetch-weekly-leads.ts
 *
 * Temporary operational script — queries GoHighLevel (GHL) v2 directly for the
 * leads captured into the location's Contacts between a start date and today,
 * and prints a telemetry report: total volume, breakdown by source / service /
 * GCLID attribution, plus a clean text table.
 *
 * This deliberately mirrors lib/ghl.ts (same host, API version, and bearer-auth
 * header shape) so the report reflects exactly what the production lead pipeline
 * wrote into GHL — contacts.upsert with website-lead tags, a native gclid, and a
 * lead-context note attached post-upsert via POST /contacts/{id}/notes.
 *
 * Contract notes (verified against the live GHL v2 API):
 *   - GET /contacts/?locationId={id}&limit=N returns { contacts, meta, traceId }
 *     (NO `total` field). `startDate`/`endDate` are silently ignored; `page`,
 *     `orderBy`, `order`, `startAfter` all return HTTP 422.
 *   - POST /contacts/search only supports the operators eq, not_eq, contains,
 *     not_contains, wildcard, not_wildcard. There is NO numeric/range operator,
 *     so "created on/after X" cannot be filtered server-side.
 *   - Therefore we fetch the full contact list with `limit=100` and filter the
 *     date client-side on `dateAdded`.
 *   - The `gclid` native field is NOT returned by the list endpoint, and
 *     `customFields` is `[]` for every contact. Attribution is derived from the
 *     `google-ads-lead` tag; the `source` field carries the form origin.
 *   - Service/roof-type lives in each contact's NOTE body (attached by
 *     lib/ghl.ts post-upsert), fetched here via GET /contacts/{id}/notes and
 *     parsed from the "Service:" / "Service needed:" / "Roof type:" lines.
 *
 * Run:  npx tsx scripts/fetch-weekly-leads.ts [startDate]
 *   startDate defaults to "2026-08-23". Accepts YYYY-MM-DD.
 *
 * Auth is read-only: nothing is created or mutated.
 */

import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';

// Prefer an explicit .env.local load (matches other scripts) but fall back to
// the ambient environment (Vercel/CI) when the file is absent.
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const dotenv = require('dotenv');
  dotenv.config({ path: envPath, quiet: true });
}

const HOST = 'services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

interface GhlContact {
  id?: string;
  contactId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  tags?: string[];
  source?: string;
  gclid?: string;
  dateAdded?: string;
  dateUpdated?: string;
  createdAt?: string;
  customFields?: Array<{ id?: string; value?: string }>;
  [key: string]: unknown;
}

interface GhlNote {
  id?: string;
  body?: string;
  bodyText?: string;
  dateAdded?: string;
  [key: string]: unknown;
}

// ── env / creds ──────────────────────────────────────────────────────────────
const LOCATION_ID = (process.env.GHL_LOCATION_ID || '').trim();
const API_KEY = (process.env.GHL_API_KEY || '').trim();

function banner(title: string): void {
  console.log('\n' + '='.repeat(72));
  console.log('  ' + title);
  console.log('='.repeat(72));
}

function fail(message: string): never {
  console.error('\n[FAIL] ' + message);
  process.exit(1);
}

const HEADERS = {
  Authorization: '',
  Version: API_VERSION,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function ghlGet(path: string): Promise<{ status: number; body: any }> {
  const res = await fetch(`https://${HOST}${path}`, {
    method: 'GET',
    headers: { ...HEADERS, Authorization: `Bearer ${API_KEY}` },
    cache: 'no-store',
  });
  const text = await res.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

// ── source / attribution derivation (no custom fields on the list payload) ──
function sourceOf(c: GhlContact): string {
  if (c.source && String(c.source).trim()) return String(c.source).trim();
  const tags = c.tags || [];
  if (tags.includes('cheshire-roof-quote')) return 'quote_form';
  if (tags.includes('special-offer')) return 'special_offer';
  if (tags.includes('contact-form')) return 'contact_form';
  return 'unknown';
}

function hasGclid(c: GhlContact): boolean {
  if (c.gclid && String(c.gclid).trim()) return true;
  return (c.tags || []).includes('google-ads-lead');
}

// ── note / service parsing ───────────────────────────────────────────────────
/**
 * lib/ghl.ts attaches the lead context as a note with these label schemes:
 *   send-quote:        "Service: {service_type}\nRoof type: {roof_type}\n\n{message}"
 *   send-contact:      "Subject: {subject}\nService needed: {service_needed}\nRoof type: {roof_type}\n\n{message}"
 *   send-special-offer:"Service needed: {serviceNeeded}\nRoof type: {roofType}\nSame-day callback: ..."
 *
 * We extract the first non-"n/a" value from whichever label the note carries,
 * falling back to roof type when the service label is absent/blank.
 */
function parseService(note: GhlNote): string | undefined {
  const text = note.body || note.bodyText || '';
  const pick = (re: RegExp): string | undefined => {
    const m = text.match(re);
    if (!m) return undefined;
    const v = (m[1] || '').trim();
    if (!v || v.toLowerCase() === 'n/a') return undefined;
    return v;
  };
  return (
    pick(/^Service\s*:\s*(.+)$/m) ||
    pick(/^Service needed\s*:\s*(.+)$/m) ||
    pick(/^Roof type\s*:\s*(.+)$/m)
  );
}

async function fetchServiceFor(contact: GhlContact): Promise<string> {
  const id = contact.id || contact.contactId;
  if (!id) return '(no contact id)';
  const res = await ghlGet(`/contacts/${encodeURIComponent(id)}/notes`);
  if (res.status !== 200) return '(notes fetch error)';
  const notes: GhlNote[] = Array.isArray(res.body?.notes) ? res.body.notes : [];
  for (const n of notes) {
    const s = parseService(n);
    if (s) return s;
  }
  return '(not captured)';
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const argStart = process.argv[2];
  const START_DATE = argStart || '2026-08-23';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(START_DATE)) {
    fail(`Invalid start date "${START_DATE}" — expected YYYY-MM-DD.`);
  }
  const START_EPOCH = Date.parse(START_DATE + 'T00:00:00.000Z');
  if (Number.isNaN(START_EPOCH)) fail(`Invalid start date "${START_DATE}" — unparseable.`);

  banner('GOHIGHLEVEL — WEEKLY LEAD REPORT');
  const today = new Date().toISOString().slice(0, 10);
  console.log(
    `Window : ${START_DATE}  →  ${today}   |   Location : ${LOCATION_ID || '(unset)'}`
  );

  if (!LOCATION_ID || !API_KEY) {
    fail('Missing GHL_LOCATION_ID / GHL_API_KEY in .env.local (or the environment).');
  }

  // 1. Fetch the full contact list (limit 100 is ample; the location holds a
  //    handful). GHL ignores date params and rejects pagination params, so we
  //    retrieve everything and filter on dateAdded client-side.
  banner('QUERY');
  const res = await ghlGet(`/contacts/?locationId=${LOCATION_ID}&limit=100`);

  if (res.status !== 200) {
    console.error(
      `[contacts] HTTP ${res.status}: ${JSON.stringify(res.body).slice(0, 500)}`
    );
    fail(`GET /contacts/ failed — HTTP ${res.status}.`);
  }

  const raw: GhlContact[] = Array.isArray(res.body?.contacts)
    ? res.body.contacts
    : Array.isArray(res.body)
      ? res.body
      : [];

  console.log(`Fetched ${raw.length} contact(s) from GHL (pre-filter).`);

  if (!raw.length) {
    console.log('No contacts found in the location.');
    return;
  }

  // 2. Client-side date filter on dateAdded (fall back to dateUpdated/createdAt).
  const normalizeDate = (c: GhlContact): string | undefined =>
    c.dateAdded || c.dateUpdated || c.createdAt || undefined;

  const contacts = raw
    .map((c) => ({ ...c, _ts: normalizeDate(c) }))
    .filter((c) => {
      if (!c._ts) return true; // no timestamp → include but flag
      return Date.parse(c._ts) >= START_EPOCH;
    })
    .sort((a, b) => Date.parse(a._ts || '') - Date.parse(b._ts || ''));

  if (!contacts.length) {
    console.log(`No contacts within the ${START_DATE} → ${today} window.`);
    return;
  }

  // 3. Enrich each in-window contact with its service, parsed from notes.
  banner('ENRICH (notes → service)');
  const enriched = [];
  for (const c of contacts) {
    const service = await fetchServiceFor(c);
    const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '(no name)';
    console.log(`  ${name.padEnd(24)} service: ${service}`);
    enriched.push({ ...c, _service: service });
  }

  // ── aggregate metrics ──────────────────────────────────────────────────────
  const total = enriched.length;
  const bySource = new Map<string, number>();
  const byService = new Map<string, number>();
  let withGclid = 0;
  let withoutGclid = 0;

  for (const c of enriched) {
    const src = sourceOf(c);
    bySource.set(src, (bySource.get(src) || 0) + 1);

    const svc = c._service || '(not captured)';
    byService.set(svc, (byService.get(svc) || 0) + 1);

    if (hasGclid(c)) withGclid += 1;
    else withoutGclid += 1;
  }

  // ── render summary ─────────────────────────────────────────────────────────
  banner('SUMMARY');
  console.log(`Total leads in window       : ${total}`);
  console.log(`  Google Ads (GCLID tag)    : ${withGclid}`);
  console.log(`  Organic / no GCLID        : ${withoutGclid}`);

  console.log('\nBy source:');
  for (const [k, v] of Array.from(bySource.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(k).padEnd(18)} ${String(v).padStart(3)}`);
  }

  console.log('\nBy service requested:');
  for (const [k, v] of Array.from(byService.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(k).padEnd(28)} ${String(v).padStart(3)}`);
  }

  // ── render detail table ────────────────────────────────────────────────────
  banner('LEAD DETAIL');
  const tsCol = 'timestamp';
  const nameCol = 'name';
  const phoneCol = 'phone';
  const srcCol = 'source';
  const svcCol = 'service';
  const atCol = 'attr';

  console.log(
    `${tsCol.padEnd(20)} ${nameCol.padEnd(22)} ${phoneCol.padEnd(16)} ${srcCol.padEnd(14)} ${svcCol.padEnd(24)} ${atCol}`
  );
  console.log('-'.repeat(72));

  for (const c of enriched) {
    const ts = c._ts ? c._ts.replace('T', ' ').slice(0, 19) : '(no ts)';
    const name = (c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '(no name)').slice(0, 21);
    const phone = (c.phone || c.postalCode || '').slice(0, 15);
    const src = sourceOf(c).slice(0, 13);
    const svc = (c._service || '(not captured)').slice(0, 23);
    const attr = hasGclid(c) ? 'ads' : 'organic';
    console.log(
      `${ts.padEnd(20)} ${name.padEnd(22)} ${phone.padEnd(16)} ${src.padEnd(14)} ${svc.padEnd(24)} ${attr}`
    );
  }

  console.log('');
}

main().catch((err) => {
  console.error('\nFATAL:', err && err.message ? err.message : err);
  process.exit(1);
});
