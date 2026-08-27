/**
 * Local lead audit logger.
 *
 * Appends a single structured record per accepted lead to a local JSON-lines
 * audit file. This is a deliberately minimal, side-effect-only observability
 * helper — it never blocks or fails the primary lead pipeline (GHL/email
 * dispatch). Every filesystem operation is wrapped so a disk write error (full
 * disk, read-only FS on serverless, missing dir) is swallowed and logged, never
 * thrown or returned to the caller.
 *
 * Format is newline-delimited JSON (JSONL), one object per line, so the file is
 * append-only and safe against concurrency without in-process locking. Each
 * record is self-contained: timestamp, source route, contact fields, and the
 * captured gclid (raw, never transformed) for offline-conversion auditing.
 */
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = path.join(process.cwd(), 'data');
const AUDIT_FILE = path.join(AUDIT_DIR, 'leads-audit.jsonl');

export interface LeadSubmissionLog {
  timestamp: string;
  route: string;
  name?: string;
  phone?: string;
  email?: string;
  postcode?: string;
  service?: string;
  gclid?: string | null;
}

/**
 * Append one lead record to the local audit file.
 *
 * @param route  The source API route label (e.g. "send-quote").
 * @param payload The validated lead fields. Only the known audit fields are
 *                copied out; anything else is ignored so we never persist
 *                honeypot/turnstile/token values.
 *
 * @returns void — never throws.
 */
export function logLeadSubmission(route: string, payload: Record<string, unknown>): void {
  try {
    const record: LeadSubmissionLog = {
      timestamp: new Date().toISOString(),
      route,
      name: asString(payload.name),
      phone: asString(payload.phone),
      email: asString(payload.email),
      postcode: asString(payload.postcode),
      service: asString(payload.service_type ?? payload.service_needed ?? payload.serviceNeeded ?? payload.roof_type ?? payload.roofType),
      gclid: asString(payload.gclid),
    };

    fs.mkdirSync(AUDIT_DIR, { recursive: true });
    fs.appendFileSync(AUDIT_FILE, JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    // Disk write failure must never break the lead response path.
    console.warn('[lead-audit] append failed:', err instanceof Error ? err.message : err);
  }
}

/** Coerce an unknown value to a trimmed string, or undefined if it has no text. */
function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s.length > 0 ? s : undefined;
}
