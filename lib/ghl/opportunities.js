/**
 * lib/ghl/opportunities.js
 *
 * GHL v2 Opportunities / pipeline helper for upgraderoofs.co.uk.
 * Creates and updates opportunities so every web lead lands in the sales
 * pipeline, and lets the webhook reason about stage shifts.
 *
 * All functions return { ok, ... } and never throw.
 */

const client = require('../ghl-client');

/** List pipelines (with stages) for the location. */
async function listPipelines() {
  const locationId = client.locationId();
  if (!locationId) return { ok: false, pipelines: [], error: 'not configured' };
  const res = await client.get(`/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`);
  return { ok: res.ok, pipelines: (res.data && res.data.pipelines) || [], status: res.status, error: res.error };
}

/**
 * Find a pipeline + stage by human-readable stage name (case-insensitive).
 * Returns { pipeline, stage } or nulls if not found.
 */
async function findStageByName(stageName) {
  const { pipelines } = await listPipelines();
  const re = new RegExp('^' + String(stageName).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  for (const p of pipelines) {
    for (const s of p.stages || []) {
      if (re.test(s.name)) return { pipeline: p, stage: s };
    }
  }
  return { pipeline: null, stage: null };
}

/**
 * Create an opportunity for a contact in the given pipeline/stage.
 * @param {object} opts
 * @param {string} opts.contactId   GHL contact id
 * @param {string} opts.name        opportunity title, e.g. "John Smith — Roof Quote"
 * @param {string} [opts.pipelineId]
 * @param {string} [opts.stageId]
 * @param {number} [opts.value]     monetary value (GBP)
 * @param {string} [opts.status]    'open' | 'won' | 'lost' | 'abandoned'
 */
async function createOpportunity(opts) {
  const locationId = client.locationId();
  if (!locationId) return { ok: false, error: 'not configured' };
  const payload = {
    locationId,
    contactId: opts.contactId,
    name: opts.name,
    pipelineId: opts.pipelineId,
    pipelineStageId: opts.stageId,
    monetaryValue: opts.value,
    status: opts.status || 'open',
  };
  const res = await client.post('/opportunities/', payload);
  const opp = res.data && (res.data.opportunity || res.data);
  return { ok: res.ok, opportunity: opp, id: opp && opp.id, status: res.status, error: res.error || (res.ok ? undefined : JSON.stringify(res.data).slice(0, 300)) };
}

/**
 * Update an opportunity's stage (used when a lead progresses).
 */
async function updateOpportunityStage(opportunityId, stageId, status) {
  const payload = { pipelineStageId: stageId };
  if (status) payload.status = status;
  const res = await client.put(`/opportunities/${encodeURIComponent(opportunityId)}`, payload);
  return { ok: res.ok, opportunity: res.data && (res.data.opportunity || res.data), status: res.status, error: res.error };
}

/**
 * Search opportunities for a contact (to avoid duplicates / find existing).
 */
async function getContactOpportunities(contactId) {
  const locationId = client.locationId();
  if (!locationId) return { ok: false, opportunities: [] };
  const res = await client.get(`/opportunities/search?location_id=${encodeURIComponent(locationId)}&contact_id=${encodeURIComponent(contactId)}`);
  return { ok: res.ok, opportunities: (res.data && res.data.opportunities) || [], status: res.status };
}

/**
 * Enroll a freshly-created lead into the GHL speed-to-lead workflow, which
 * owns the instant SMS / call response. Configure the workflow id via
 * GHL_SPEED_TO_LEAD_WORKFLOW_ID. Non-blocking; returns { triggered, reason }.
 *
 * GHL v2 enrolls contacts into a workflow via the workflows contact endpoint.
 */
async function triggerSpeedToLead(contactId, context = {}) {
  const workflowId = (process.env.GHL_SPEED_TO_LEAD_WORKFLOW_ID || '').trim();
  if (!contactId) return { triggered: false, reason: 'no contactId' };
  if (!workflowId) return { triggered: false, reason: 'GHL_SPEED_TO_LEAD_WORKFLOW_ID not set' };
  try {
    const res = await client.post(`/workflows/${encodeURIComponent(workflowId)}/contacts`, {
      contactId,
      ...(context.source ? { source: context.source } : {}),
    });
    return { triggered: res.ok, status: res.status, reason: res.ok ? undefined : (res.error || JSON.stringify(res.data).slice(0, 200)) };
  } catch (err) {
    return { triggered: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

module.exports = {
  listPipelines,
  findStageByName,
  createOpportunity,
  updateOpportunityStage,
  getContactOpportunities,
  triggerSpeedToLead,
};
