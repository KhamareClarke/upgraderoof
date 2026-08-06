/**
 * lib/ghl/invoices.js
 *
 * GHL v2 Invoices / Estimates helper for upgraderoofs.co.uk.
 * Generates a digital roof estimate (GHL "estimate" / invoice) for a won
 * lead so the customer receives a professional quote document automatically.
 *
 * All functions return { ok, ... } and never throw.
 */

const client = require('../ghl-client');

/**
 * Create a draft estimate/invoice for a contact.
 *
 * @param {object} opts
 * @param {string} opts.contactId        GHL contact id (required)
 * @param {string} opts.name             customer name (for the document title)
 * @param {Array<{name:string,description?:string,price:number,qty?:number}>} opts.items
 *                                       line items, e.g. [{name:'Tile roof replacement', price:6500, qty:1}]
 * @param {string} [opts.title]          document title (default "Roofing Estimate")
 * @param {string} [opts.currency]       default 'GBP'
 * @param {string} [opts.dueDate]        ISO date for payment/validity
 * @param {string} [opts.notes]          terms / notes shown on the document
 * @param {boolean}[opts.send]           if true, also issue/send to the customer
 */
async function createEstimate(opts) {
  const locationId = client.locationId();
  if (!locationId) return { ok: false, error: 'not configured' };
  if (!opts.contactId) return { ok: false, error: 'contactId required' };
  if (!Array.isArray(opts.items) || !opts.items.length) return { ok: false, error: 'at least one line item required' };

  const items = opts.items.map(it => ({
    name: it.name,
    description: it.description,
    // GHL expects amounts in the currency's major unit for estimates.
    price: it.price,
    qty: it.qty != null ? it.qty : 1,
  }));
  const total = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);

  const payload = {
    locationId,
    contactId: opts.contactId,
    title: opts.title || `Roofing Estimate — ${opts.name || 'Customer'}`,
    currency: opts.currency || 'GBP',
    items,
    total,
    status: opts.send ? 'sent' : 'draft',
  };
  if (opts.dueDate) payload.dueDate = opts.dueDate;
  if (opts.notes) payload.notes = opts.notes;

  const res = await client.post('/invoices/', payload);
  const inv = res.data && (res.data.invoice || res.data);
  return {
    ok: res.ok,
    invoice: inv,
    id: inv && (inv.id || inv._id),
    total,
    status: res.status,
    error: res.error || (res.ok ? undefined : JSON.stringify(res.data).slice(0, 300)),
  };
}

/**
 * Send an existing draft estimate/invoice to the customer.
 */
async function sendEstimate(invoiceId) {
  const locationId = client.locationId();
  if (!locationId) return { ok: false, error: 'not configured' };
  const res = await client.post(`/invoices/${encodeURIComponent(invoiceId)}/send`, { locationId });
  return { ok: res.ok, status: res.status, error: res.error };
}

/**
 * List recent invoices/estimates for the location (read-only, for diagnostics).
 */
async function listInvoices(limit = 10) {
  const locationId = client.locationId();
  if (!locationId) return { ok: false, invoices: [] };
  // GHL invoices list requires altId (the location id) + altType, and offset
  // as a string. limit is a string too.
  const q = `altId=${encodeURIComponent(locationId)}&altType=location&limit=${limit}&offset=0`;
  const res = await client.get(`/invoices/?${q}`);
  return { ok: res.ok, invoices: (res.data && res.data.invoices) || [], status: res.status };
}

module.exports = { createEstimate, sendEstimate, listInvoices };
