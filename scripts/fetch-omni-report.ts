/**
 * scripts/fetch-omni-report.ts
 *
 * UNIFIED OMNI-CHANNEL WEEKLY TELEMETRY & REPORTING — upgraderoofs.co.uk
 *
 * Pulls one consolidated weekly report across every acquisition + engagement
 * channel and prints a single clean terminal table:
 *
 *   (A) Google Search Console  — organic clicks / impressions / CTR / average
 *       position for the reporting window, growth vs. the prior two equal
 *       windows, plus top town + service queries.
 *   (B) GoHighLevel pipeline   — inbound interactions registered in the GHL
 *       sub-account: form submissions (contacts), inbound SMS + WhatsApp
 *       conversations, and inbound call logs. Individual contact notes are
 *       parsed to extract the service/roof-type requested and the
 *       call/message direction (inbound vs. outbound).
 *   (C) Google Ads + GCLID     — attribution breakdown: how many inbound
 *       interactions resolve to a gclid (paid) vs organic; GCLID tag lineage.
 *   (D) Automated alerts       — threshold warnings when calls, forms, or
 *       organic clicks fall below a baseline.
 *
 * READ-ONLY across all systems. Nothing is written, mutated, or rate-limited.
 * Does NOT touch backend routing or rate limiters.
 *
 * Run:  npx tsx scripts/fetch-omni-report.ts [startDate]
 *   startDate defaults to "2026-08-23". Accepts YYYY-MM-DD (window = 5 days).
 */

import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';

// Prefer an explicit .env.local load (matches other scripts); fall back to the
// ambient environment when the file is absent.
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const dotenv = require('dotenv');
  dotenv.config({ path: envPath, quiet: true });
}

// ── common types ─────────────────────────────────────────────────────────────
type QueryRow = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  keys?: string[];
};

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

interface Interaction {
  channel: 'form' | 'whatsapp' | 'sms' | 'phone';
  ts: string;
  name: string;
  source: string;
  attributed: boolean; // resolves to a gclid → paid
  service?: string; // extracted from notes for forms / message/call direction for comms
}

// ── env / creds (lazy so report can still render partial data) ──────────────
const GHL_LOCATION_ID = (process.env.GHL_LOCATION_ID || '').trim();
const GHL_API_KEY = (process.env.GHL_API_KEY || '').trim();
const GSC_SITE_URL = (process.env.GSC_SITE_URL || '').trim();
const GSC_CREDS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'google-service-account.json');

const GADS = {
  customerId: (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, ''),
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
  loginCustomerId: (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/\D/g, ''),
};

const ADS_API_VERSION = 'v22';
const ADS_HOST = 'googleads.googleapis.com';

// Report window (module scope so the GSC/GHL/GAds fetch helpers can all see it).
// Set once in main() from the CLI arg; defaults to a 5-day window.
const WINDOW_MS = 5 * 24 * 60 * 60 * 1000;
let START_EPOCH = Date.parse('2026-08-23T00:00:00.000Z');

// ── tiny helpers ─────────────────────────────────────────────────────────────
function banner(title: string): void {
  console.log('\n' + '='.repeat(78));
  console.log('  ' + title);
  console.log('='.repeat(78));
}

function note(message: string): void {
  console.log('  ' + message);
}

function warn(message: string): void {
  console.log('  ⚠ ' + message);
}

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('en-GB') : String(n);
}

function pct(n: number): string {
  return Number.isFinite(n) ? (n * 100).toFixed(1) + '%' : '—';
}

function pos(n: number): string {
  return Number.isFinite(n) ? n.toFixed(1) : '—';
}

// ── (A) Google Search Console — searchanalytics.query via service account ────
async function gscQuery(
  searchconsole: any,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions?: string[],
  rowLimit = 200,
): Promise<QueryRow[]> {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      startRow: 0,
    },
  });
  return (res?.data?.rows || []).map((r: any) => ({
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
    keys: r.keys,
  }));
}

function sumQ(rows: QueryRow[]): { clicks: number; impressions: number; ctr: number; position: number } {
  let clicks = 0;
  let impressions = 0;
  for (const r of rows) {
    clicks += r.clicks;
    impressions += r.impressions;
  }
  const ctr = impressions ? clicks / impressions : 0;
  const position = rows.length
    ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / (impressions || 1)
    : 0;
  return { clicks, impressions, ctr, position };
}

async function fetchGsc(allMissed: string[], google: any): Promise<{
  ok: boolean;
  curr?: ReturnType<typeof sumQ>;
  prev?: ReturnType<typeof sumQ>;
  prev2?: ReturnType<typeof sumQ>;
  queries?: QueryRow[];
}> {
  try {
    if (!GSC_SITE_URL) throw new Error('GSC_SITE_URL not set');
    if (!fs.existsSync(GSC_CREDS_PATH)) throw new Error(`service-account key not found at ${GSC_CREDS_PATH}`);

    // Service-account auth — authoritative for GSC in this repo (same account
    // the GBP path uses). Only require read scope.
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      keyFile: GSC_CREDS_PATH,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    // The official `googleapis` searchconsole client supports a `auth` option;
    // pass the authed client directly so it signs requests.
    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    const D = 5 * 24 * 60 * 60 * 1000;
    const today = START_EPOCH + 5 * D; // exclusive upper bound of the report window
    const e = new Date(today - 1).toISOString().slice(0, 10); // end = last day of window

    const iso = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
    const win = {
      curr: { s: iso(START_EPOCH), e },
      prev: { s: iso(START_EPOCH - D), e: iso(START_EPOCH - 1) },
      prev2: { s: iso(START_EPOCH - 2 * D), e: iso(START_EPOCH - D - 1) },
    };

    // A longer 28-day window for the top town/service query table (more stable)
    // than the 5-day report window.
    const qs = iso(START_EPOCH - 23 * D);
    const qe = e;

    const [currRows, prevRows, prev2Rows] = await Promise.all([
      gscQuery(searchconsole, GSC_SITE_URL, win.curr.s, win.curr.e),
      gscQuery(searchconsole, GSC_SITE_URL, win.prev.s, win.prev.e),
      gscQuery(searchconsole, GSC_SITE_URL, win.prev2.s, win.prev2.e),
    ]);

    let queries: QueryRow[] = [];
    try {
      queries = await gscQuery(searchconsole, GSC_SITE_URL, qs, qe, ['query'], 500);
    } catch (err: any) {
      warn(`top-query pull failed (${err?.message?.slice(0, 80)}) — continuing without it`);
    }

    return {
      ok: true,
      curr: sumQ(currRows),
      prev: sumQ(prevRows),
      prev2: sumQ(prev2Rows),
      queries,
    };
  } catch (err: any) {
    allMissed.push('GSC');
    warn(`GSC query failed — ${err?.message || err}`);
    return { ok: false };
  }
}

// ── (B/C) GoHighLevel — contacts + conversations + calls + notes ─────────────
function ghlHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${GHL_API_KEY}`,
    Version: '2021-07-28',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function ghlGet(path: string): Promise<{ status: number; body: any }> {
  const HOST = 'services.leadconnectorhq.com';
  const res = await fetch(`https://${HOST}${path}`, {
    method: 'GET',
    headers: ghlHeaders(),
    cache: 'no-store',
  });
  const text = await res.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

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

// Normalise the many possible contact timestamp field names to the earliest.
function contactTs(c: GhlContact): string {
  return c.dateAdded || c.dateUpdated || c.createdAt || '';
}

// Parse an individual contact's notes to extract (a) a service/roof-type and
// (b) direction hints. GHL stores lead detail in notes; the list endpoint
// returns customFields=[] so this is the only reliable per-lead source.
function extractFromText(text: string): { service?: string; dir: 'inbound' | 'outbound' | null } {
  const s = String(text || '').toLowerCase();
  let dir: 'inbound' | 'outbound' | null = null;
  if (/\b(inbound|incoming|received|incoming call|incoming message)\b/.test(s)) dir = 'inbound';
  else if (/\b(outbound|outgoing|placed|voicemail left|callback)\b/.test(s)) dir = 'outbound';

  let service: string | undefined;
  const map: Array<[RegExp, string]> = [
    [/chimney/, 'chimney'],
    [/flat roof|\bflat\b/, 'flat roof'],
    [/gutter/, 'gutter'],
    [/fascia|soffit/, 'fascia/soffit'],
    [/skylight|roof window/, 'skylight'],
    [/slate/, 'slate'],
    [/tile/, 'tile'],
    [/\bnew roof\b|re-roof|reroof|replacement/, 'new roof'],
    [/repair|leak/, 'repair/leak'],
    [/\bepdm\b|rubber/, 'epdm'],
    [/emergency/, 'emergency'],
  ];
  for (const [re, label] of map) {
    if (re.test(s)) { service = label; break; }
  }
  return { service, dir };
}

async function fetchGhl(allMissed: string[]): Promise<{
  ok: boolean;
  forms?: Interaction[];
  communications?: Interaction[];
  withGclid?: number;
  total?: number;
}> {
  if (!GHL_LOCATION_ID || !GHL_API_KEY) {
    allMissed.push('GHL');
    warn('GHL skipped — GHL_LOCATION_ID / GHL_API_KEY not set');
    return { ok: false };
  }

  // 1. Contacts (forms) — full list, filter client-side on dateAdded.
  const listRes = await ghlGet(`/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`);
  if (listRes.status !== 200) {
    allMissed.push('GHL');
    warn(`GHL contacts failed — HTTP ${listRes.status}`);
    return { ok: false };
  }

  const raw: GhlContact[] = Array.isArray(listRes.body?.contacts)
    ? listRes.body.contacts
    : Array.isArray(listRes.body)
      ? listRes.body
      : [];

  const forms: Interaction[] = [];
  for (const c of raw) {
    const ts = contactTs(c);
    const tsMs = ts ? Date.parse(ts) : Number.NaN;
    const inWindow = Number.isNaN(tsMs) ? false : tsMs >= START_EPOCH && tsMs < START_EPOCH + 5 * 24 * 60 * 60 * 1000;
    if (!inWindow) continue;

    // Fetch the individual contact for its notes (service extraction).
    const id = c.id || c.contactId;
    let service: string | undefined;
    if (id) {
      try {
        const one = await ghlGet(`/contacts/${id}`);
        if (one.status === 200) {
          const b = one.body?.contact || one.body;
          const txt = [b.notes, b.note, b.customFields?.map((f: any) => f.value).join(' ')]
            .filter(Boolean).join(' ');
          service = extractFromText(txt).service || extractFromText(String(b.dnd ? '' : '')).service;
          // Most lead detail actually lives in GHL notes as HTML/comments; the
          // above best-effort covers the common shapes.
          const htmlNotes = typeof b.notes === 'string' ? b.notes : '';
          service = service || extractFromText(htmlNotes).service;
        }
      } catch {
        /* individual-note fetch non-fatal */
      }
    }

    forms.push({
      channel: 'form',
      ts,
      name: (c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '(no name)').slice(0, 40),
      source: sourceOf(c),
      attributed: hasGclid(c),
      service,
    });
  }

  // 2. Conversations (SMS + WhatsApp) — message-level search.
  const communications: Interaction[] = [];
  try {
    const convRes = await ghlGet(`/conversations/search?locationId=${GHL_LOCATION_ID}&limit=100`);
    if (convRes.status === 200) {
      const convs = convRes.body?.conversations || [];
      for (const conv of convs) {
        const ch = String(conv.channel || conv.type || '').toLowerCase();
        const isSms = ch.includes('sms');
        const isWa = ch.includes('whatsapp') || ch.includes('wa');
        if (!isSms && !isWa) continue;
        const channel = isWa ? 'whatsapp' : 'sms';
        const msgs = conv.messages || [];
        const lastInbound = msgs
          .filter((m: any) => m.direction === 'inbound' || m.directionInbound === true || /inbound/i.test(String(m.direction || '')))
          .sort((a: any, b: any) => Date.parse(b.dateAdded || b.createdAt || '') - Date.parse(a.dateAdded || a.createdAt || ''))[0];
        const ts = (lastInbound || conv).dateAdded || conv.createdAt || '';
        const tsMs = ts ? Date.parse(ts) : Number.NaN;
        if (!Number.isNaN(tsMs) && !(tsMs >= START_EPOCH && tsMs < START_EPOCH + 5 * 24 * 60 * 60 * 1000)) continue;

        communications.push({
          channel,
          ts,
          name: (conv.contactName || conv.name || '(unknown)').slice(0, 40),
          source: 'conversation',
          attributed: false,
          service: extractFromText(JSON.stringify(msgs?.slice(0, 3) || '')).service,
        });
      }
    } else {
      warn(`GHL conversations HTTP ${convRes.status} — skipping SMS/WhatsApp`);
    }
  } catch (err: any) {
    warn(`GHL conversations failed — ${err?.message || err}`);
  }

  // 3. Call logs — calls arrive via the call-tracking webhook, which upserts an
  //    inbound-call-tagged contact and attaches a note of the form:
  //      "Inbound call: {duration}s, source {paid|organic}, destination {num}"
  //    (plus a gclid on the contact when the call resolved to an ads click).
  //    We surface those contacts as `phone` interactions and parse duration +
  //    paid/organic attribution from the note so the report shows total inbound
  //    calls + caller attribution alongside forms.
  const CALL_TAG_RE = /(inbound-call|call-tracking)/i;
  const contactsWithCallTag = raw.filter((c) => (c.tags || []).some((t) => CALL_TAG_RE.test(t)));
  for (const c of contactsWithCallTag) {
    const ts = contactTs(c);
    const tsMs = ts ? Date.parse(ts) : Number.NaN;
    if (Number.isNaN(tsMs) || !(tsMs >= START_EPOCH && tsMs < START_EPOCH + 5 * 24 * 60 * 60 * 1000)) continue;
    const name = (c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '(no name)').slice(0, 40);
    if (communications.some((m) => m.channel === 'phone' && m.name === name)) continue;

    // Attribute the call paid/organic: a gclid (native field or ads tag) wins,
    // else fall back to the "source paid|organic" token in the call note.
    let attributed = hasGclid(c);
    let service: string | undefined;
    if (c.id || c.contactId) {
      try {
        const notesRes = await ghlGet(`/contacts/${c.id || c.contactId}/notes`);
        const notes: Array<{ body?: string; bodyText?: string }> =
          Array.isArray(notesRes.body?.notes) ? notesRes.body.notes : [];
        const text = notes.map((n) => n.body || n.bodyText || '').join('\n');
        if (!attributed && /source\s+paid\b/i.test(text)) attributed = true;
        const dur = text.match(/Inbound call:\s*([^,]+)/i)?.[1]?.trim();
        if (dur && /\d/.test(dur)) service = undefined; // duration is not a service
        // Duration is informational; keep service extraction separate so we
        // don't miscount it as a roof-type. No service label expected on calls.
      } catch {
        /* notes fetch non-fatal */
      }
    }

    communications.push({
      channel: 'phone',
      ts,
      name,
      source: sourceOf(c) === 'unknown' ? 'phone_call' : sourceOf(c),
      attributed,
      service,
    });
  }

  const withGclid = forms.filter((f) => f.attributed).length;
  return {
    ok: true,
    forms,
    communications,
    withGclid,
    total: raw.length,
  };
}

// ── (C) Google Ads — GAQL — campaign-level clicks/impressions/cost + conv ──
async function fetchGads(allMissed: string[]): Promise<{
  ok: boolean;
  clicks?: number;
  impressions?: number;
  cost?: number;
  conversions?: number;
  withGclid?: number;
  log?: string[];
}> {
  try {
    if (!GADS.customerId || !GADS.developerToken || !GADS.clientId || !GADS.clientSecret || !GADS.refreshToken) {
      throw new Error('one or more GOOGLE_ADS_* env vars missing');
    }
    const { google } = require('googleapis');
    const oauth2 = new google.auth.OAuth2(GADS.clientId, GADS.clientSecret);
    oauth2.setCredentials({ refresh_token: GADS.refreshToken });
    const { token } = await oauth2.getAccessToken();
    if (!token) throw new Error('refresh-token exchange returned no access token');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'developer-token': GADS.developerToken,
    };
    if (GADS.loginCustomerId) headers['login-customer-id'] = GADS.loginCustomerId;

    const post = async (query: string): Promise<any[]> => {
      const res = await fetch(`https://${ADS_HOST}/${ADS_API_VERSION}/customers/${GADS.customerId}/googleAds:searchStream`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const body: any = await res.json().catch(() => ({}));
      if (res.status !== 200) {
        throw new Error(`GAQL HTTP ${res.status}: ${JSON.stringify(body).slice(0, 220)}`);
      }
      return (Array.isArray(body) ? body : [body]).flatMap((b: any) => b.results || []);
    };

    // Report-window segment. Note the window is Aug 23-27 2026 (5 days).
    const reportStart = START_EPOCH;
    const reportEnd = START_EPOCH + 5 * 24 * 60 * 60 * 1000 - 1;
    const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    const cond = `segments.date BETWEEN '${iso(reportStart)}' AND '${iso(reportEnd)}'`;

    let rows: any[] = [];
    try {
      rows = await post(
        `SELECT metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions
         FROM campaign
         WHERE ${cond}`
      );
    } catch (err: any) {
      // Fall back to last-30-days if the BETWEEN clause is rejected on this account.
      warn(`GAQL report-window query failed (${err?.message?.slice(0, 80)}); using LAST_30_DAYS`);
      rows = await post(
        `SELECT metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions
         FROM campaign
         WHERE segments.date DURING LAST_30_DAYS`
      );
    }

    let clicks = 0, impressions = 0, cost = 0, conversions = 0;
    for (const r of rows) {
      const m = r.metrics || {};
      clicks += Number(m.clicks || 0);
      impressions += Number(m.impressions || 0);
      cost += Number(m.costMicros || 0) / 1e6;
      conversions += Number(m.conversions || 0);
    }

    return { ok: true, clicks, impressions, cost, conversions, log: [`${rows.length} campaign row(s)`] };
  } catch (err: any) {
    allMissed.push('GAds');
    warn(`Google Ads skipped — ${err?.message || err}`);
    return { ok: false };
  }
}

// ── helpers for town/service query classification ────────────────────────────
const TOWN_PATTERNS: Array<[RegExp, string]> = [
  [/sandbach/, 'Sandbach'], [/crewe/, 'Crewe'], [/middlewich/, 'Middlewich'],
  [/congleton/, 'Congleton'], [/nantwich/, 'Nantwich'], [/alsager/, 'Alsager'],
  [/holmes chapel/, 'Holmes Chapel'], [/cheshire/, 'Cheshire'], [/stoke/, 'Stoke'],
  [/winsford/, 'Winsford'], [/knutsford/, 'Knutsford'], [/macclesfield/, 'Macclesfield'],
];
const SERVICE_PATTERNS: Array<[RegExp, string]> = [
  [/chimney/, 'chimney'], [/flat roof|flat roofing/, 'flat roof'], [/gutter/, 'gutter'],
  [/fascia|soffit/, 'fascia/soffit'], [/skylight|roof window/, 'skylight'], [/slate/, 'slate'],
  [/roof tile|tile roof|tiling/, 'tile'], [/re-roof|reroof|new roof|replacement/, 'new roof'],
  [/repair/, 'repair'], [/leak/, 'repair'], [/emergency/, 'emergency'],
  [/epdm|rubber/, 'epdm'], [/roofers?/, 'roofer'],
];

function classifyTown(q: string): string {
  const t = TOWN_PATTERNS.find(([re]) => re.test(q));
  return t ? t[1] : '(no town)';
}
function classifyService(q: string): string {
  const s = SERVICE_PATTERNS.find(([re]) => re.test(q));
  return s ? s[1] : '(no service)';
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const argStart = process.argv[2];
  const START_DATE = argStart || '2026-08-23';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(START_DATE)) {
    process.stderr.write(`Invalid start date "${START_DATE}" — expected YYYY-MM-DD.\n`);
    process.exit(1);
  }
  START_EPOCH = Date.parse(START_DATE + 'T00:00:00.000Z');
  if (Number.isNaN(START_EPOCH)) {
    process.stderr.write(`Invalid start date "${START_DATE}" — unparseable.\n`);
    process.exit(1);
  }

  banner('UNIFIED OMNI-CHANNEL WEEKLY REPORT — upgraderoofs.co.uk');
  note(`Window: ${START_DATE} → ${START_DATE.slice(0, 4)}-${String(Number(START_DATE.slice(5, 7))).padStart(2, '0')}-${String(Math.min(Number(START_DATE.slice(8, 10)) + 4, 31)).padStart(2, '0')}`);
  note(`Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`);
  note(`GSC property: ${GSC_SITE_URL || '(unset)'}   Location: ${GHL_LOCATION_ID || '(unset)'}`);

  const allMissed: string[] = [];

  // Eager-load `googleapis` once (GSC needs the searchconsole client).
  let google: any = null;
  try { google = require('googleapis').google; } catch { google = null; }

  // Run all three in parallel for latency.
  const noGsc = { ok: false as const, curr: undefined, prev: undefined, prev2: undefined, queries: undefined };
  const [gsc, ghl, gads] = await Promise.all([
    google ? fetchGsc(allMissed, google) : Promise.resolve(noGsc),
    fetchGhl(allMissed),
    fetchGads(allMissed),
  ]);

  // ── (A) GSC ────────────────────────────────────────────────────────────────
  banner('(A) GOOGLE SEARCH CONSOLE — ORGANIC SEARCH');
  if (!gsc.ok) {
    note('GSC unavailable this run (see warnings above).');
  } else {
    const c = gsc.curr!;
    const p = gsc.prev!;
    const p2 = gsc.prev2!;
    const growth = (cur: number, base: number) => {
      if (!base) return '—';
      return ((cur - base) / base * 100).toFixed(1) + '%';
    };
    console.log(`  Clicks          : ${fmt(c.clicks)}`);
    console.log(`  Impressions     : ${fmt(c.impressions)}`);
    console.log(`  CTR             : ${pct(c.ctr)}`);
    console.log(`  Avg position    : ${pos(c.position)}`);
    console.log(`  vs prior window  : clicks ${c.clicks - p.clicks >= 0 ? '+' : ''}${fmt(c.clicks - p.clicks)} (${growth(c.clicks, p.clicks)});  impressions ${c.impressions - p.impressions >= 0 ? '+' : ''}${fmt(c.impressions - p.impressions)} (${growth(c.impressions, p.impressions)})`);
    console.log(`  vs 2 windows ago : clicks ${growth(c.clicks, p2.clicks)};  impressions ${growth(c.impressions, p2.impressions)}`);

    // Top queries (last 28 days)
    if (gsc.queries && gsc.queries.length) {
      const top = gsc.queries.sort((a, b) => b.clicks - a.clicks).slice(0, 10);
      console.log(`\n  Top organic queries (28d, by clicks):`);
      console.log(`    ${'Query'.padEnd(44)} ${'Clicks'.padStart(7)} ${'Impr'.padStart(8)} ${'Pos'.padStart(6)}`);
      console.log('    ' + '-'.repeat(70));
      for (const q of top) {
        const key = (q.keys && q.keys[0]) || '';
        console.log(`    ${key.slice(0, 43).padEnd(44)} ${String(q.clicks).padStart(7)} ${String(q.impressions).padStart(8)} ${pos(q.position).padStart(6)}`);
      }
    }

    // Tally top town + service intent from the 28d query set.
    const townTally = new Map<string, number>();
    const svcTally = new Map<string, number>();
    for (const q of gsc.queries || []) {
      const key = (q.keys && q.keys[0]) || '';
      const t = classifyTown(key);
      const s = classifyService(key);
      if (t !== '(no town)') townTally.set(t, (townTally.get(t) || 0) + q.clicks);
      if (s !== '(no service)') svcTally.set(s, (svcTally.get(s) || 0) + q.clicks);
    }
    const topTowns = Array.from(townTally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topSvcs = Array.from(svcTally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (topTowns.length) {
      console.log(`\n  Top town queries (28d):  ` + topTowns.map(([t, v]) => `${t} (${v})`).join('  '));
    }
    if (topSvcs.length) {
      console.log(`  Top service queries (28d):  ` + topSvcs.map(([t, v]) => `${t} (${v})`).join('  '));
    }
  }

  // ── (B) GHL inbound interactions ───────────────────────────────────────────
  banner('(B) GOHIGHLEVEL — INBOUND INTERACTIONS');
  if (!ghl.ok) {
    note('GHL unavailable this run (see warnings above).');
  } else {
    const forms = ghl.forms || [];
    const comms = ghl.communications || [];
    const total = forms.length + comms.length;
    const formCount = forms.length;
    const waCount = comms.filter((m) => m.channel === 'whatsapp').length;
    const smsCount = comms.filter((m) => m.channel === 'sms').length;
    const callCount = comms.filter((m) => m.channel === 'phone').length;

    console.log(`  Total inbound interactions : ${total}`);
    console.log(`    Form submissions         : ${formCount}`);
    console.log(`    WhatsApp messages        : ${waCount}`);
    console.log(`    SMS messages             : ${smsCount}`);
    console.log(`    Call logs (tagged)       : ${callCount}`);

    // Note parse → service histogram
    const serviceTally = new Map<string, number>();
    for (const i of [...forms, ...comms]) {
      if (i.service) serviceTally.set(i.service, (serviceTally.get(i.service) || 0) + 1);
    }
    if (serviceTally.size) {
      console.log(`\n  Service / roof-type requested (from notes + messages):`);
      for (const [k, v] of Array.from(serviceTally.entries()).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${k.padEnd(22)} ${v}`);
      }
    } else {
      console.log(`\n  (no service/roof-type extracted — notes may be empty or unstructured)`);
    }

    // Detail table for forms
    if (forms.length) {
      console.log(`\n  Form leads detail:`);
      console.log(`    ${'Timestamp'.padEnd(20)} ${'Name'.padEnd(24)} ${'Source'.padEnd(16)} ${'Attr'.padEnd(9)} ${'Service'}`);
      console.log('    ' + '-'.repeat(74));
      for (const f of forms) {
        console.log(`    ${f.ts.replace('T', ' ').slice(0, 19).padEnd(20)} ${f.name.padEnd(24)} ${f.source.slice(0, 15).padEnd(16)} ${(f.attributed ? 'ads' : 'organic').padEnd(9)} ${f.service || ''}`);
      }
    }

    // Detail table for communications
    if (comms.length) {
      console.log(`\n  Communication details:`);
      console.log(`    ${'Channel'.padEnd(12)} ${'Timestamp'.padEnd(20)} ${'Name'.padEnd(24)} ${'Service'}`);
      console.log('    ' + '-'.repeat(64));
      for (const m of comms) {
        console.log(`    ${m.channel.padEnd(12)} ${m.ts.replace('T', ' ').slice(0, 19).padEnd(20)} ${m.name.padEnd(24)} ${m.service || ''}`);
      }
    }
  }

  // ── (C) Google Ads + GCLID attribution ─────────────────────────────────────
  banner('(C) GOOGLE ADS + GCLID ATTRIBUTION');
  if (!gads.ok) {
    note('Google Ads unavailable this run (see warnings above).');
  } else {
    console.log(`  Campaign clicks    : ${fmt(gads.clicks || 0)}`);
    console.log(`  Impressions        : ${fmt(gads.impressions || 0)}`);
    console.log(`  Cost               : £${(gads.cost || 0).toFixed(2)}`);
    console.log(`  Conversions        : ${(gads.conversions || 0).toFixed(1)}`);
  }
  if (ghl.ok) {
    const forms = ghl.forms || [];
    const paid = ghl.withGclid || 0;
    const organic = forms.length - paid;
    console.log(`\n  GHL attribution (form leads, ${forms.length} total):`);
    console.log(`    Paid (gclid tag)    : ${paid}`);
    console.log(`    Organic (no gclid)  : ${Math.max(0, organic)}`);
    if (forms.length) {
      console.log(`    Paid share          : ${pct(forms.length ? paid / forms.length : 0)}`);
    }
  }

  // ── (D) alerts ─────────────────────────────────────────────────────────────
  banner('(D) AUTOMATED ALERTS');
  const alerts: string[] = [];

  // Baselines are 28-day daily averages scaled to a 5-day window, estimated
  // from history where available; conservative defaults otherwise.
  const CLICK_BASELINE = 5; // organic clicks / 5 days — flag if fully dry
  const FORM_BASELINE = 1; // forms / 5 days
  const CALL_BASELINE = 1; // calls / 5 days

  if (gsc.ok) {
    if (gsc.curr!.clicks === 0) alerts.push(`Organic clicks at ZERO for the window (baseline ${CLICK_BASELINE})`);
    else if (gsc.curr!.clicks < CLICK_BASELINE) alerts.push(`Organic clicks (${gsc.curr!.clicks}) below baseline ${CLICK_BASELINE}`);
  }
  if (ghl.ok) {
    const forms = ghl.forms || [];
    const calls = (ghl.communications || []).filter((m) => m.channel === 'phone').length;
    if (forms.length < FORM_BASELINE) alerts.push(`Form submissions (${forms.length}) below baseline ${FORM_BASELINE}`);
    if (calls < CALL_BASELINE) alerts.push(`Call logs (${calls}) below baseline ${CALL_BASELINE}`);
  }

  if (!alerts.length) {
    note('No thresholds breached. ✅');
  } else {
    for (const a of alerts) console.log(`  ⚠ ${a}`);
  }

  // Summary banner
  banner('SUMMARY');
  if (allMissed.length) {
    note(`Channels not reported (missing env/creds): ${Array.from(new Set(allMissed)).join(', ')}`);
  }
  const ghlOk = ghl.ok;
  const gscOk = gsc.ok;
  const gadsOk = gads.ok;
  note(`GSC: ${gscOk ? 'OK' : 'SKIPPED'}  ·  GHL: ${ghlOk ? 'OK' : 'SKIPPED'}  ·  Google Ads: ${gadsOk ? 'OK' : 'SKIPPED'}`);
  console.log('');
}

main().catch((err) => {
  console.error('\nFATAL:', err && err.message ? err.message : err);
  process.exit(1);
});
