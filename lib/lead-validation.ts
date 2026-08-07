/**
 * lib/lead-validation.ts
 *
 * Server-side spam / junk-lead validation for the lead-capture routes.
 * The honeypot + in-memory rate limiter alone were letting bot submissions
 * through (serverless instances reset the rate-limit Map on cold start, and
 * bots rotate IPs / skip hidden fields). These checks validate the actual
 * content of a lead, which is far harder for a bot to fake convincingly.
 *
 * All checks are pure functions returning a reason string on failure, or null
 * when the value looks legitimate. The route decides the HTTP response.
 */

// --- UK phone ---------------------------------------------------------------
// Validate on digits only. Normalise to the National Significant Number (NSN,
// no trunk 0 / country code) then check length + a valid UK leading digit.
// UK NSNs are 10 digits (with a few 9-digit ranges); mobiles start 7,
// geographic start 1/2, non-geographic 3/8/9.

export function invalidPhoneReason(phone: unknown): string | null {
  if (typeof phone !== 'string') return 'phone missing';
  const digits = phone.replace(/\D/g, '');
  // Normalise: strip country code (44) then any single trunk 0.
  let nsn = digits.startsWith('0044') ? digits.slice(4)
    : digits.startsWith('44') && digits.length > 10 ? digits.slice(2)
    : digits;
  if (nsn.startsWith('0')) nsn = nsn.slice(1);
  if (nsn.length < 9 || nsn.length > 10) return `phone length ${nsn.length} out of range`;
  // Reject obvious repeated/sequential junk (e.g. 0000000000, 1234567890).
  if (/^(\d)\1{8,}$/.test(nsn)) return 'phone is a repeated digit';
  if (/123456789|987654321/.test(nsn)) return 'phone is sequential';
  // Must start with a valid UK NSN leading digit.
  if (!/^[123789]/.test(nsn)) return 'phone not a UK format';
  return null;
}

// --- UK postcode ------------------------------------------------------------
// Standard UK postcode regex (outcode + incode), case-insensitive.
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function invalidPostcodeReason(postcode: unknown): string | null {
  if (typeof postcode !== 'string' || !postcode.trim()) return 'postcode missing';
  const p = postcode.trim();
  if (!UK_POSTCODE.test(p)) return 'postcode not a UK format';
  return null;
}

// --- Name -------------------------------------------------------------------
// Catches gibberish / keyboard-mash / single-char / numeric "names" that bots
// submit, while allowing real multi-word and hyphenated/apostrophe names.
export function invalidNameReason(name: unknown): string | null {
  if (typeof name !== 'string') return 'name missing';
  const n = name.trim();
  if (n.length < 2) return 'name too short';
  if (n.length > 80) return 'name too long';
  if (/\d/.test(n)) return 'name contains digits';
  // Must contain at least one vowel or a recognised name particle — pure
  // consonant strings (e.g. "qwrtypsdfg") are almost always bot junk.
  if (!/[aeiouy]/i.test(n)) return 'name has no vowels';
  // Reject long runs of the same character (e.g. "aaaaaa").
  if (/(.)\1{3,}/i.test(n)) return 'name has repeated characters';
  // Reject if it looks like random case-mashed gibberish: no spaces and a
  // high ratio of consonant clusters. Keep this lenient to avoid false
  // positives on real surnames.
  const letters = n.replace(/[^a-z]/gi, '');
  if (letters.length >= 6 && !/\s/.test(n)) {
    const consonantClusters = letters.match(/[bcdfghjklmnpqrstvwxz]{4,}/gi);
    if (consonantClusters && consonantClusters.length > 0) return 'name looks like gibberish';
  }
  return null;
}

// --- UK email ----------------------------------------------------------------
// Mirrors the client-side check in EnhancedContactSection so the server is the
// source of truth. Accepts standard local@domain.tld addresses.
const UK_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function invalidEmailReason(email: unknown): string | null {
  if (typeof email !== 'string' || !email.trim()) return 'email missing';
  const e = email.trim();
  if (e.length > 254) return 'email too long';
  if (!UK_EMAIL.test(e)) return 'email not a valid format';
  return null;
}

// --- Submission timing (anti-honeypot speed check) ---------------------------
// Bots fire submissions instantly; humans take >1.5s. The client stamps the
// page-load time (window load / first render) into `_ts` and the server rejects
// any request that claims to have arrived in under MIN_SUBMIT_MS.
export const MIN_SUBMIT_MS = 1500;

/** Returns a failure reason when the submission looks too fast, else null. */
export function invalidSubmissionTimingReason(fields: { _ts?: unknown }): string | null {
  const raw = fields?._ts;
  if (typeof raw !== 'number' || !isFinite(raw as number)) {
    // No timestamp means no client stamping — treat as suspect, but reject with
    // a distinct reason so route logging can see the mode.
    return 'no submission timestamp';
  }
  const elapsed = Date.now() - (raw as number);
  if (elapsed < MIN_SUBMIT_MS) return 'submission too fast';
  return null;
}

// --- Aggregate ---------------------------------------------------------------
export interface LeadFields {
  name?: unknown;
  phone?: unknown;
  postcode?: unknown;
}

/**
 * Validate a lead's core fields. Returns a list of failure reasons (empty =
 * lead looks legitimate). Routes treat a non-empty list as spam.
 */
export function validateLead(fields: LeadFields): string[] {
  const reasons: string[] = [];
  const name = invalidNameReason(fields.name);
  const phone = invalidPhoneReason(fields.phone);
  const postcode = invalidPostcodeReason(fields.postcode);
  if (name) reasons.push(name);
  if (phone) reasons.push(phone);
  if (postcode) reasons.push(postcode);
  return reasons;
}
