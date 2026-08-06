/**
 * lib/ghl-client.js
 *
 * Central GoHighLevel (GHL) v2 REST client for upgraderoofs.co.uk.
 * Single source of truth for base URL, auth, and Version headers — every
 * GHL module (opportunities, invoices, blogs) and API route imports this.
 *
 * Env (in .env.local):
 *   GHL_LOCATION_ID   location / sub-account id
 *   GHL_API_KEY       Private Integration token (location-scoped)
 *
 * Design: all request helpers return { ok, status, data } and NEVER throw,
 * so a GHL outage degrades gracefully instead of breaking lead capture.
 */

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

function creds() {
  const locationId = (process.env.GHL_LOCATION_ID || '').trim();
  const token = (process.env.GHL_API_KEY || '').trim();
  if (!locationId || !token) return null;
  return { locationId, token };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Version: API_VERSION,
    'Version-Header': API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * Core request helper. Never throws.
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {string} path   e.g. '/contacts/upsert'
 * @param {object} [body] JSON body for POST/PUT
 * @returns {Promise<{ok:boolean,status:number,data:any,error?:string}>}
 */
async function request(method, path, body) {
  const c = creds();
  if (!c) {
    return { ok: false, status: 0, data: null, error: 'GHL_LOCATION_ID / GHL_API_KEY not set' };
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: headers(c.token),
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return { ok: res.status >= 200 && res.status < 300, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err instanceof Error ? err.message : String(err) };
  }
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const put = (path, body) => request('PUT', path, body);
const del = (path) => request('DELETE', path);

/** Current location id, or null if unconfigured. */
function locationId() {
  const c = creds();
  return c ? c.locationId : null;
}

/** True if GHL credentials are present. */
function isConfigured() {
  return creds() !== null;
}

module.exports = { BASE_URL, API_VERSION, request, get, post, put, del, locationId, isConfigured };
