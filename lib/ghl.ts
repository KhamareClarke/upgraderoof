/**
 * lib/ghl.ts
 *
 * Server-side GoHighLevel (GHL) v2 client for upgraderoofs.co.uk.
 * Pushes incoming form leads into GHL Contacts with campaign tags and
 * the captured gclid, so the sales pipeline and Google Ads offline
 * conversions stay in sync.
 *
 * Env (in .env.local):
 *   GHL_LOCATION_ID   location / sub-account id
 *   GHL_API_KEY       Private Integration token (location-scoped)
 *
 * All functions are non-throwing: a GHL outage must never lose a lead,
 * so failures are logged and swallowed (the caller still emails + saves).
 */

const HOST = 'services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

export interface GhlLeadInput {
  name: string;
  email?: string;
  phone?: string;
  postcode?: string;
  /** Campaign tags to apply, e.g. ['google-ads-lead', 'cheshire-roof-quote']. */
  tags: string[];
  /** Click ID captured from the landing URL (Google Ads offline conversions). */
  gclid?: string;
  /** Free-text source label, e.g. 'quote_form', 'contact_form', 'special_offer'. */
  source?: string;
  /** Any extra context to drop into the contact's notes / custom fields. */
  notes?: string;
  customFields?: Record<string, string>;
}

function creds(): { locationId: string; token: string } | null {
  const locationId = (process.env.GHL_LOCATION_ID || '').trim();
  const token = (process.env.GHL_API_KEY || '').trim();
  if (!locationId || !token) return null;
  return { locationId, token };
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function ghlFetch(
  path: string,
  method: 'GET' | 'POST' | 'PUT',
  token: string,
  bodyObj?: unknown
): Promise<{ status: number; body: any }> {
  const body = bodyObj ? JSON.stringify(bodyObj) : undefined;
  const res = await fetch(`https://${HOST}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  return { status: res.status, body: parsed };
}

/**
 * Upsert a lead into GHL Contacts. Uses POST /contacts/upsert which
 * dedupes on email/phone within the location, so repeat submissions
 * update the same contact rather than creating duplicates.
 *
 * Returns the GHL contact id on success, null on any failure.
 */
export async function pushLeadToGhl(input: GhlLeadInput): Promise<string | null> {
  const c = creds();
  if (!c) {
    console.warn('[ghl] skipped — GHL_LOCATION_ID / GHL_API_KEY not set');
    return null;
  }

  const { firstName, lastName } = splitName(input.name);

  // gclid is a NATIVE GHL contact field (contact.gclid) — send it top-level,
  // NOT inside customFields (GHL rejects a custom field named 'gclid').
  //
  // Remaining custom fields must reference their account-specific field IDs in
  // a `customFields: [{id, value}]` array. IDs are configurable via env since
  // they differ per GHL location (created once per account).
  const CUSTOM_FIELD_IDS: Record<string, string | undefined> = {
    gclid: process.env.GHL_CF_GCLID, // readable copy (native gclid is write-only)
    postcode: process.env.GHL_CF_POSTCODE,
    service_type: process.env.GHL_CF_SERVICE_TYPE,
    roof_type: process.env.GHL_CF_ROOF_TYPE,
    service_needed: process.env.GHL_CF_SERVICE_NEEDED,
  };
  const customFieldsArr: Array<{ id: string; value: string }> = [];
  const extra = { ...(input.customFields || {}) };
  if (input.postcode) extra['postcode'] = input.postcode;
  if (input.gclid) extra['gclid'] = input.gclid; // readable custom-field copy
  for (const [key, value] of Object.entries(extra)) {
    const id = CUSTOM_FIELD_IDS[key];
    if (id && value != null && value !== '') customFieldsArr.push({ id, value: String(value) });
  }

  const payload: Record<string, unknown> = {
    locationId: c.locationId,
    firstName,
    lastName,
    name: input.name,
    email: input.email,
    phone: input.phone,
    postalCode: input.postcode,
    tags: input.tags,
    source: input.source || 'website',
  };
  if (input.gclid) payload['gclid'] = input.gclid;
  if (customFieldsArr.length) payload['customFields'] = customFieldsArr;
  // NOTE: 'notes' is NOT accepted by /contacts/upsert (422). Notes are added
  // via the separate contact-notes endpoint after upsert — see below.

  try {
    const res = await ghlFetch('/contacts/upsert', 'POST', c.token, payload);
    if (res.status !== 200 && res.status !== 201) {
      console.warn(`[ghl] upsert returned ${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);
      return null;
    }
    const contact = res.body.contact || res.body;
    const id = contact.id || contact.contactId || null;
    console.log(`[ghl] lead upserted → contact ${id} (tags: ${input.tags.join(', ')})`);

    // Attach the lead context as a contact note (separate endpoint — upsert
    // rejects a 'notes' property). Non-blocking; failure here is harmless.
    if (id && input.notes) {
      ghlFetch(`/contacts/${encodeURIComponent(id)}/notes`, 'POST', c.token, { body: input.notes, userId: undefined })
        .then(r => { if (r.status !== 200 && r.status !== 201) console.warn(`[ghl] note add returned ${r.status}`); })
        .catch(err => console.warn('[ghl] note add failed:', err instanceof Error ? err.message : err));
    }
    return id;
  } catch (err) {
    console.warn('[ghl] upsert failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Fetch pipelines + stages for the location. Used by the webhook to map
 * stage ids → names so it can react to "Job Won" / "Site Visit Booked".
 */
export async function getPipelines(): Promise<Array<{ id: string; name: string; stages: Array<{ id: string; name: string }> }>> {
  const c = creds();
  if (!c) return [];
  try {
    const res = await ghlFetch(`/opportunities/pipelines?locationId=${encodeURIComponent(c.locationId)}`, 'GET', c.token);
    if (res.status !== 200) return [];
    return res.body.pipelines || [];
  } catch {
    return [];
  }
}
