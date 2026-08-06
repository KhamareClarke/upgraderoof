import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';

const ghl = require('@/lib/ghl-client.js');

/**
 * app/api/ghl-webhook/route.ts
 *
 * Receives GoHighLevel workflow triggers fired when an opportunity's stage
 * changes (e.g. to "Site Visit Booked" or "Job Won"), and uploads an
 * OFFLINE CONVERSION back to Google Ads (API v22) against the existing
 * "Calls from ads" conversion action — so Google can attribute the closed
 * revenue to the original click (gclid).
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
 * Env required (server):
 *   GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEVELOPER_TOKEN,
 *   GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN
 *   (optional) GOOGLE_ADS_LOGIN_CUSTOMER_ID  — MCC manager id
 *   (optional) GHL_WEBHOOK_SECRET            — shared secret to verify callers
 *   (optional) GADS_OFFLINE_CONV_ACTION      — conversion action resource/id
 *                                              (defaults to "Calls from ads")
 */

const ADS_API_VERSION = 'v22';
// Host is injectable so tests can point the upload at a local mock without
// touching real Google Ads. Defaults to production (https). A mock over plain
// HTTP can set GADS_API_PROTOCOL=http.
const ADS_HOST = (process.env.GADS_API_HOST || 'googleads.googleapis.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const ADS_PROTOCOL = (process.env.GADS_API_PROTOCOL || 'https').replace(/:\/\/$/, '');
const ADS_BASE = `${ADS_PROTOCOL}://${ADS_HOST}`;
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

// --- Google Ads auth + offline conversion upload -----------------------------

async function getAdsAccessToken(): Promise<string> {
  const { GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN) {
    throw new Error('Google Ads OAuth env vars not configured');
  }
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_ADS_CLIENT_ID,
      client_secret: GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Ads token exchange failed: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.access_token;
}

function adsHeaders(accessToken: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    'Content-Type': 'application/json',
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, '');
  }
  return h;
}

/**
 * Resolve the conversion action resource name for "Calls from ads" (or the
 * override in GADS_OFFLINE_CONV_ACTION) so we upload against the right action.
 */
async function resolveConversionAction(headers: Record<string, string>, customerId: string): Promise<string> {
  const override = (process.env.GADS_OFFLINE_CONV_ACTION || '').trim();
  if (override) {
    // Accept either a bare numeric id or a full resource name.
    return override.startsWith('customers/')
      ? override
      : `customers/${customerId}/conversionActions/${override.replace(/\D/g, '')}`;
  }
  const query = `
    SELECT conversion_action.resource_name, conversion_action.name
    FROM conversion_action
    WHERE conversion_action.name = 'Calls from ads'
    LIMIT 1`;
  const res = await fetch(
    `${ADS_BASE}/${ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`,
    { method: 'POST', headers, body: JSON.stringify({ query }) }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`conversion_action lookup failed: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const rows = (Array.isArray(data) ? data : [data]).flatMap((b: any) => b.results || []);
  const rn = rows[0] && rows[0].conversionAction && rows[0].conversionAction.resourceName;
  if (!rn) throw new Error('Conversion action "Calls from ads" not found in account');
  return rn;
}

/**
 * Upload a click (offline) conversion to Google Ads v22.
 */
async function uploadOfflineConversion(opts: {
  gclid: string;
  conversionAction: string;
  conversionDateTime: string;
  value: number;
  currency?: string;
}): Promise<void> {
  const customerId = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/\D/g, '');
  if (!customerId) throw new Error('GOOGLE_ADS_CUSTOMER_ID not set');
  const accessToken = await getAdsAccessToken();
  const headers = adsHeaders(accessToken);
  const conversionAction = opts.conversionAction || await resolveConversionAction(headers, customerId);

  const operation = {
    create: {
      gclid: opts.gclid,
      conversionAction,
      conversionDateTime: opts.conversionDateTime,
      conversionValue: opts.value,
      currencyCode: opts.currency || 'GBP',
    },
  };
  const res = await fetch(
    `${ADS_BASE}/${ADS_API_VERSION}/customers/${customerId}/conversionUploads:uploadClickConversions`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ conversions: [operation.create], partialFailure: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`uploadClickConversions failed: ${JSON.stringify(data).slice(0, 400)}`);
  }
  if (data.partialFailureError) {
    throw new Error(`offline conversion rejected: ${data.partialFailureError.message || JSON.stringify(data.partialFailureError).slice(0, 300)}`);
  }
}

/** Format "YYYY-MM-DD HH:mm:ss+00:00" as the Ads API expects. */
function adsDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+00:00`;
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

  try {
    // Route each stage to its own conversion action (Site Visit Booked / Job Won).
    const conversionAction = `customers/${CUSTOMER_ID_DIGITS}/conversionActions/${conv.conversionActionId}`;
    await uploadOfflineConversion({
      gclid,
      conversionAction,
      conversionDateTime: adsDateTime(new Date()),
      value,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ghl-webhook] offline conversion upload failed:', msg);
    await emitFleetIngest({
      event_type: 'ghl_offline_conversion_error',
      summary: `Offline conversion upload FAILED for "${conv.label}" (gclid ${gclid.slice(0, 12)}…): ${msg}`,
      payload: { stage, gclid, value, error: msg },
    });
    return jsonError(`Upload failed: ${msg}`, 502);
  }

  await emitFleetIngest({
    event_type: 'ghl_offline_conversion',
    summary: `Offline conversion uploaded: "${conv.label}" — £${value} credited to gclid ${gclid.slice(0, 12)}…`,
    payload: { stage: conv.label, gclid, value, contactId, email, phone },
  });

  return NextResponse.json({
    success: true,
    conversion: { stage: conv.label, value, currency: 'GBP', gclid: gclid.slice(0, 12) + '…' },
  }, { status: 200 });
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
