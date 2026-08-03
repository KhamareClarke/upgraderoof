/**
 * Simple in-memory IP rate limiter for API routes.
 * Tracks submission counts per IP address with a sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const submissions = new Map<string, RateLimitEntry>();

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
 */
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

  // Fallback
  return 'unknown';
}
