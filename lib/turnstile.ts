/**
 * lib/turnstile.ts
 *
 * Cloudflare Turnstile verification for the lead-capture API routes.
 *
 * The gate is opt-in via environment variables: if `TURNSTILE_SECRET_KEY` is
 * unset, verification is skipped and every submission is treated as though it
 * passed. This keeps local/dev and any environment that hasn't yet provisioned
 * a site key working unchanged.
 *
 * Client side renders the widget only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is
 * set (see the form components), so a missing key is invisible to the user.
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const secretKey = process.env.TURNSTILE_SECRET_KEY;

let warnedMissingSecret = false;

/**
 * Verify a Turnstile token. Returns:
 *   - `{ ok: true }` when the gate is disabled (no secret key) or the token is
 *     genuinely valid,
 *   - `{ ok: false, reason }` when configured and the token is missing/invalid.
 *
 * Never throws — a Cloudflare outage must not cost a real lead, so a failed
 * verify call degrades to `ok: true`.
 */
export async function verifyTurnstile(token: unknown): Promise<{ ok: boolean; reason?: string }> {
  // Gate disabled — no secret key. Skip verification entirely.
  if (!secretKey) {
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — CAPTCHA gate disabled');
    }
    return { ok: true };
  }

  if (typeof token !== 'string' || !token.trim()) {
    return { ok: false, reason: 'token missing' };
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token.trim(),
        // ip is optional; omitted to avoid passing through proxy-forwarded
        // addresses that Cloudflare may reject.
      }),
    });

    // Cloudflare returns status 200 even for a failed token, with the verdict
    // in the body. A non-200 (or network failure) degrades to allow.
    if (!res.ok) {
      return { ok: true, reason: 'verifier unavailable' };
    }

    const data = await res.json();
    if (data && data.success === true) {
      return { ok: true };
    }

    const codes = Array.isArray(data?.['error-codes']) ? data['error-codes'].join(',') : '';
    return { ok: false, reason: `challenge failed${codes ? ` (${codes})` : ''}` };
  } catch (err) {
    // Do not fail closed on a transient error — that would block real leads.
    console.warn('[turnstile] verification error:', err);
    return { ok: true, reason: 'verifier error' };
  }
}
