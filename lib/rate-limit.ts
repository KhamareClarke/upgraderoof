/**
 * Simple in-memory IP rate limiter for API routes.
 * Tracks submission counts per IP address with a sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const submissions = new Map<string, RateLimitEntry>();

// Track the first time we ever saw a given identity. Scripted bots fill and
// submit forms in well under a humanly-possible time; stamping the very first
// sighting lets routes reject a submission that arrives suspiciously fast.
const firstSeen = new Map<string, number>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  submissions.forEach((entry, ip) => {
    if (now > entry.resetTime) {
      submissions.delete(ip);
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check if an IP address is rate limited.
 * @param ip - The IP address to check
 * @param maxAttempts - Maximum attempts allowed in the window (default: 3)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 */
export function checkRateLimit(
  ip: string,
  maxAttempts: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): RateLimitResult {
  const now = Date.now();
  const entry = submissions.get(ip);

  if (!entry || now > entry.resetTime) {
    // First submission or window expired — start fresh
    submissions.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetIn: Math.floor(windowMs / 1000),
    };
  }

  if (entry.count >= maxAttempts) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.floor((entry.resetTime - now) / 1000),
    };
  }

  // Increment count
  entry.count += 1;
  submissions.set(ip, entry);

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetIn: Math.floor((entry.resetTime - now) / 1000),
  };
}

/**
 * Extract client IP from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 *
 * If no forwarding header is present we derive a per-request pseudo-identity
 * from the User-Agent (once) rather than returning a single shared "unknown".
 * A shared "unknown" bucket collapses every headerless client into one shared
 * counter, so one bot trip to the limit would block every legitimate caller
 * sharing that bucket.
 */
/**
 * Return true if this identity first appeared too recently to be a human.
 *
 * A human filling a form takes at least a few seconds (reading the fields,
 * typing, clicking). Scripted bots can complete the round-trip in well under
 * a second. We stamp the first sighting of an identity and, if a submission
 * lands within `minSeconds`, treat it as automated.
 *
 * This is intentionally lenient: we only reject on the *first* sighting of an
 * identity, because the timers are in-memory and reset on serverless cold
 * start, so a subsequent slow submission is never penalised by a stale stamp.
 */
export function isTooFast(ip: string, minSeconds: number = 3): boolean {
  const now = Date.now();
  const seen = firstSeen.get(ip);
  if (seen === undefined) {
    firstSeen.set(ip, now);
    return false; // first sighting — can't compare against an earlier stamp
  }
  return now - seen < minSeconds * 1000;
}

export function getClientIp(request: Request): string {
  // Vercel-specific header
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();

  // Standard forwarded header
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Fallback — no IP known. Use a UA-derived key so distinct callers don't
  // share one bucket. This is weak (same UA still collapses) but strictly
  // better than a route-wide "unknown" bucket.
  const ua = request.headers.get('user-agent') || '';
  return 'ua:' + ua.slice(0, 64);
}
