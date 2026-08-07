import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';

const ghl = require('@/lib/ghl-client.js');

/**
 * app/api/ghl-webhook/route.ts
 *
 * Receives GoHighLevel workflow triggers fired when an opportunity's stage
 * changes (e.g. to "Site Visit Booked" or "Job Won"), and uploads an
 * OFFLINE CONVERSION back to Google Ads via the DATA MANAGER API
 * (datamanager.googleapis.com/v1/events:ingest) — the successor to the legacy
 * ConversionUploadService.UploadClickConversions (restricted on this account).
 * The stage maps to a fixed conversion action, so Google can attribute the
 * closed revenue to the original click (gclid).
 *
 * GHL setup:
 *   Opportunities → Workflow → trigger "Opportunity Status Changed" /
 *   "Stage Changed" → action "Send Webhook" → POST to
 *   https://www.upgraderoofs.co.uk/api/ghl-webhook
 *   Include the contact's gclid custom field and the new stage name in the
 *   webhook payload (see expected body below).
 *
 * Expected GHL webhook payload (JSON) — tolerant of GHL's nesting:
 *   {
 *     "contact_id": "...",            // GHL contact id
 *     "stage": "Job Won",             // new stage name (or opportunity.stage.name)
 *     "gclid": "Cj0KCQ...",           // from contact custom field
 *     "value": 4500,                  // optional deal value (GBP)
 *     "email": "...", "phone": "..."  // optional, for logging
 *   }
 *
 * Env required (server, Data Manager — NOT the legacy Ads API):
 *   GOOGLE_ADS_CUSTOMER_ID, GOOGLE_DM_CLIENT_ID, GOOGLE_DM_CLIENT_SECRET,
 *   GOOGLE_DM_REFRESH_TOKEN  (refresh token scoped to `datamanager`)
 *   (optional) GHL_WEBHOOK_SECRET        — shared secret to verify callers
 *
 * Response model: the route replies 202 { acknowledged } immediately and
 * ingests into Data Manager FIRE-AND-FORGET in the background. Failures are
 * logged via emitFleetIngest, never surfaced to GHL (so GHL doesn't retry).
 */

// OAuth token URL is injectable so tests can point the token exchange at a mock.
const OAUTH_TOKEN_URL = process.env.GADS_OAUTH_TOKEN_URL || 'https://oauth2.googleapis.com/token';

// Stage names that trigger an offline conversion upload. Each maps to its own
// Google Ads conversion action (created for offline import) so "Site Visit
// Booked" and "Job Won" report as separate goals with their own values.
// conversionActionId matches the live actions in customer 8479028400; the env
// vars allow override without a code change.
const CUSTOMER_ID_DIGITS = (process.env.GOOGLE_ADS_CUSTOMER_ID || '8479028400').replace(/\D/g, '');
const STAGE_CONVERSIONS: Array<{ match: RegExp; label: string; defaultValue: number; conversionActionId: string }> = [
  {
    match: /site\s*visit\s*booked/i,
    label: 'Site Visit Booked',
    defaultValue: 50,
    conversionActionId: (process.env.GADS_CONV_SITE_VISIT || '7700922852'),
  },
  {
    match: /job\s*won/i,
    label: 'Job Won',
    defaultValue: 1200,
    conversionActionId: (process.env.GADS_CONV_JOB_WON || '7700922855'),
  },
];

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** Pull a field out of a GHL webhook payload tolerantly (flat or nested). */
function pick(body: any, ...paths: string[][]): string | undefined {
  for (const path of paths) {
    let cur: any = body;
    let ok = true;
    for (const key of path) {
      if (cur == null || typeof cur !== 'object' || !(key in cur)) { ok = false; break; }
      cur = cur[key];
    }
    if (ok && cur != null && cur !== '') return String(cur);
  }
  return undefined;
}

// --- Data Manager (Google Ads offline conversions) ---------------------------
// Migrated 2026-08-07 from the legacy ConversionUploadService.UploadClickConversions
// (restricted on this account: "use the Data Manager API").
// Docs: https://developers.google.com/data-manager/api/devguides/events/google-ads/offline
//   Endpoint : POST datamanager.googleapis.com/v1/events:ingest
//   Scope    : https://www.googleapis.com/auth/datamanager  (NOT adwords)
//   NOTE     : NO developer-token header. Value is REAL currency (e.g. 50.0,
//              not micros). gclid -> events[].adIdentifiers.gclid. Timestamp is
//              RFC3339. Conversion action id -> destinations[].productDestinationId.
//              Error model is FAST-FAIL (whole request rejected on bad event) and
//              ASYNC (returns a requestId, not the upload result).
// Creds: GOOGLE_DM_CLIENT_ID / GOOGLE_DM_CLIENT_SECRET / GOOGLE_DM_REFRESH_TOKEN.

const DM_HOST = (process.env.DM_API_HOST || 'datamanager.googleapis.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const DM_PROTOCOL = (process.env.DM_API_PROTOCOL || 'https').replace(/:\/\/$/, '');
const DM_BASE = `${DM_PROTOCOL}://${DM_HOST}`;
const DM_INGEST_PATH = '/v1/events:ingest';

async function getDmAccessToken(): Promise<string> {
  const { GOOGLE_DM_CLIENT_ID, GOOGLE_DM_CLIENT_SECRET, GOOGLE_DM_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_DM_CLIENT_ID || !GOOGLE_DM_CLIENT_SECRET || !GOOGLE_DM_REFRESH_TOKEN) {
    throw new Error('Data Manager OAuth env vars (GOOGLE_DM_*) not configured');
  }
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_DM_CLIENT_ID,
      client_secret: GOOGLE_DM_CLIENT_SECRET,
      refresh_token: GOOGLE_DM_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Data Manager token exchange failed: ${JSON.stringify(data).slice(0, 200)}`);
  }
  // Guard against a refresh token minted for the wrong scope.
  const scope: string = data.scope || '';
  if (scope && !scope.includes('datamanager')) {
    throw new Error(`Data Manager refresh token has wrong scope: "${scope}" (need datamanager)`);
  }
  return data.access_token;
}

/**
 * Ingest EVENTs into the Data Manager API (async, fast-fail). Resolves with the
 * { status, requestId, error } outcome WITHOUT throwing on an Ads-400/403 so the
 * webhook caller is never surfaced the Ads error path.
 */
async function ingestEvents(opts: {
  gclid: string;
  transactionId: string;        // REQUIRED by Data Manager — stable id for dedupe
  productDestinationId: string; // Ad units conversion action id
  eventTimestamp: string;       // RFC3339
  value: number;                // real currency, not micros
  currency?: string;
}): Promise<{ status: number; ok: boolean; requestId?: string; error?: string }> {
  const customerId = CUSTOMER_ID_DIGITS;
  if (!customerId) throw new Error('GOOGLE_ADS_CUSTOMER_ID not set');

  const accessToken = await getDmAccessToken();
  const body = {
    destinations: [{
      operatingAccount: { accountId: customerId, accountType: 'GOOGLE_ADS' },
      productDestinationId: opts.productDestinationId,
    }],
    events: [{
      adIdentifiers: { gclid: opts.gclid },
      transactionId: opts.transactionId,
      eventTimestamp: opts.eventTimestamp,
      conversionValue: opts.value,
      currency: opts.currency || 'GBP',
    }],
  };

  let res: Response;
  try {
    res = await fetch(`${DM_BASE}${DM_INGEST_PATH}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { status: 0, ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  let data: any = {};
  try { data = await res.json(); } catch { /* non-JSON body */ }

  // fast-fail / auth errors -> capture and return (NOT throw) so the route can
  // reply 202 + log, without 502ing the GHL webhook.
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data).slice(0, 400);
    return { status: res.status, ok: false, error: `events:ingest ${res.status}: ${msg}` };
  }
  // Async fast-fail model: success returns { requestId } (results return later).
  return { status: res.status, ok: true, requestId: data?.request_id || data?.requestId };
}

/**
 * Trigger a GHL workflow / conversation action for Voice AI follow-up when a
 * lead hits a key stage. GHL v2 has no direct "place Voice AI call" endpoint,
 * so we enqueue the contact into a GHL workflow (which owns the Voice AI
 * call step) via the conversations/workflow surface. Non-blocking.
 *
 * Configure the target workflow id via GHL_VOICE_AI_WORKFLOW_ID. If unset,
 * we just log the intent (no-op) so the webhook never fails on this path.
 */
async function triggerVoiceAiWorkflow(opts: { contactId?: string; stage: string; phone?: string; email?: string }) {
  const workflowId = (process.env.GHL_VOICE_AI_WORKFLOW_ID || '').trim();
  if (!opts.contactId) return { triggered: false, reason: 'no contactId' };
  if (!ghl.isConfigured()) return { triggered: false, reason: 'ghl not configured' };
  if (!workflowId) {
    return { triggered: false, reason: 'GHL_VOICE_AI_WORKFLOW_ID not set — set it to the workflow that owns the Voice AI call step' };
  }
  try {
    // Enroll the contact into the workflow that triggers the Voice AI call.
    const res = await ghl.post('/conversations/messages', {
      locationId: ghl.locationId(),
      contactId: opts.contactId,
      type: 'Workflow',
      workflowId,
      direction: 'outbound',
      message: `Voice AI follow-up for stage: ${opts.stage}`,
    });
    return { triggered: res.ok, status: res.status, reason: res.ok ? undefined : (res.error || 'workflow trigger rejected') };
  } catch (err) {
    return { triggered: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

// --- Handler ------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  // Optional shared-secret verification (set GHL_WEBHOOK_SECRET and send it as
  // a header or ?secret= from the GHL workflow).
  const expectedSecret = (process.env.GHL_WEBHOOK_SECRET || '').trim();
  if (expectedSecret) {
    const provided =
      request.headers.get('x-ghl-secret') ||
      new URL(request.url).searchParams.get('secret') ||
      pick(body, ['secret']);
    if (provided !== expectedSecret) {
      return jsonError('Unauthorized', 401);
    }
  }

  const stage = pick(body, ['stage'], ['opportunity', 'stage', 'name'], ['opportunity', 'stage'], ['new_stage'], ['status']);
  const gclid = pick(body, ['gclid'], ['contact', 'gclid'], ['customField', 'gclid'], ['customFields', 'gclid'], ['contact', 'customField', 'gclid']);
  const contactId = pick(body, ['contact_id'], ['contactId'], ['contact', 'id']);
  const email = pick(body, ['email'], ['contact', 'email']);
  const phone = pick(body, ['phone'], ['contact', 'phone']);
  const rawValue = pick(body, ['value'], ['opportunity', 'value'], ['deal_value'], ['monetary_value']);

  if (!stage) {
    return jsonError('No stage in payload — expected "stage" or opportunity.stage.name', 422);
  }

  // Log EVERY pipeline stage shift (not just conversion stages) for funnel
  // visibility, and fire Voice AI follow-up on conversion stages.
  const conv = STAGE_CONVERSIONS.find(c => c.match.test(stage));
  await emitFleetIngest({
    event_type: 'ghl_stage_shift',
    summary: `Pipeline stage → "${stage}" for ${contactId || email || phone || 'unknown contact'}${conv ? ' [conversion stage]' : ''}`,
    payload: { stage, isConversionStage: !!conv, contactId, email, phone, value: rawValue },
  });

  if (conv) {
    // Fire Voice AI follow-up (non-blocking — never blocks the conversion path).
    triggerVoiceAiWorkflow({ contactId, stage: conv.label, phone, email })
      .then(r => {
        if (!r.triggered) console.log(`[ghl-webhook] Voice AI not triggered: ${r.reason}`);
      })
      .catch(err => console.warn('[ghl-webhook] Voice AI trigger error:', err));
  }

  if (!conv) {
    // Not a stage we convert on — acknowledge so GHL doesn't retry, but do nothing.
    return NextResponse.json({ success: true, ignored: true, logged: true, reason: `stage "${stage}" not a conversion stage` }, { status: 200 });
  }

  if (!gclid) {
    await emitFleetIngest({
      event_type: 'ghl_offline_conversion_skipped',
      summary: `GHL "${conv.label}" for contact ${contactId || email || phone || 'unknown'} — no gclid, cannot upload offline conversion`,
      payload: { stage, contactId, email, phone },
    });
    return NextResponse.json({ success: true, ignored: true, reason: 'no gclid on contact — lead did not originate from a Google Ads click' }, { status: 200 });
  }

  const value = rawValue != null && !isNaN(Number(rawValue)) ? Number(rawValue) : conv.defaultValue;

  // FIRE-AND-FORGET (per decision 2026-08-07): reply 202 immediately and ingest
  // into the Data Manager API in the background. Google cannot callback a
  // suspended serverless response, so we must NOT eagerly await the Ads upload —
  // doing so would hang/timeout the webhook reply. Failures are logged via
  // emitFleetIngest instead of 502ing GHL (GHL would then retry and double-up).
  const submittedAt = new Date().toISOString();
  // transactionId is REQUIRED by Data Manager and used for dedupe/idempotency.
  // Use the GHL contact id when available (stable per lead); else a unique id.
  const transactionId = contactId || `ghlwebhook_${submittedAt.replace(/\D/g, '')}_${gclid.slice(0, 8)}`;
  const q = { gclid, transactionId, productDestinationId: conv.conversionActionId, eventTimestamp: submittedAt, value };

  ingestEvents(q)
    .then(out => {
      if (out.ok) {
        console.log(`[ghl-webhook] DM events:ingest accepted (${conv.label}) requestId=${out.requestId || 'n/a'} gclid=${gclid.slice(0, 12)}…`);
        return emitFleetIngest({
          event_type: 'ghl_offline_conversion',
          summary: `Offline conversion submitted to Data Manager: "${conv.label}" — £${value} (gclid ${gclid.slice(0, 12)}…, requestId ${out.requestId || 'n/a'})`,
          payload: { stage: conv.label, gclid, value, currency: 'GBP', contactId, email, phone, requestId: out.requestId, submittedAt },
        });
      }
      console.error('[ghl-webhook] DM events:ingest failed:', out.status, out.error);
      return emitFleetIngest({
        event_type: 'ghl_offline_conversion_error',
        summary: `Offline conversion submit FAILED for "${conv.label}" (gclid ${gclid.slice(0, 12)}…): ${out.error}`,
        payload: { stage, gclid, value, error: out.error, requestId: out.requestId, submittedAt },
      });
    })
    .catch(err => {
      // Token exchange or config errors. We swallow so the 202 is already sent.
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[ghl-webhook] DM ingest threw:', msg);
      emitFleetIngest({
        event_type: 'ghl_offline_conversion_error',
        summary: `Offline conversion submit threw for "${conv.label}": ${msg}`,
        payload: { stage, gclid, value, error: msg, submittedAt },
      }).catch(() => {});
    });

  return NextResponse.json({
    success: true,
    acknowledged: true,
    async: true,
    conversion: { stage: conv.label, value, currency: 'GBP', gclid: gclid.slice(0, 12) + '…' },
    note: 'Acknowledged — ingesting offline conversion asynchronously via Data Manager.',
  }, { status: 202 });
}

// GHL workflow testers sometimes probe with GET — answer usefully.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'ghl-webhook',
    convertsOnStages: STAGE_CONVERSIONS.map(c => c.label),
    expects: 'POST { stage, gclid, value?, contact_id?, email?, phone? }',
  });
}
