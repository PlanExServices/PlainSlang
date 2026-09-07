// Simple in-process rate limiter (fixed window per IP) — network-abuse
// prevention for write endpoints and forced verifies (spec U-03).
// In-memory is adequate for a single-instance deployment; a multi-instance
// deployment should move this to the database or an edge rule.

const g = globalThis.__plainslangRates || (globalThis.__plainslangRates = new Map());

function clientKey(request, bucket) {
  // SECURITY: proxies APPEND to x-forwarded-for, so the leftmost entry is
  // client-supplied and spoofable. Behind exactly one trusted proxy (Render,
  // Cloudflare) the rightmost entry is the connecting IP the proxy saw.
  // Prefer platform-set single-value headers when present.
  const cfIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  const realIp = request.headers.get('x-real-ip'); // many proxies
  let ip = cfIp || realIp;
  if (!ip) {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
      const parts = fwd.split(',').map((s) => s.trim()).filter(Boolean);
      ip = parts[parts.length - 1] || 'local'; // rightmost = added by our proxy
    } else {
      ip = 'local';
    }
  }
  return `${bucket}:${ip}`;
}

/**
 * Returns null when allowed, or a Response(429) when over the limit.
 * @param {Request} request
 * @param {string} bucket  logical bucket name, e.g. 'write' or 'verify'
 * @param {number} limit   max requests per window
 * @param {number} windowMs window length in ms
 */
export function rateLimit(request, bucket, limit, windowMs) {
  const key = clientKey(request, bucket);
  const now = Date.now();
  let entry = g.get(key);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
    g.set(key, entry);
  }
  entry.count += 1;

  // opportunistic cleanup so the map cannot grow unbounded
  if (g.size > 5000) {
    for (const [k, v] of g) {
      if (now - v.start >= windowMs) g.delete(k);
    }
  }

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
    return new Response(
      JSON.stringify({ error: 'Too many requests — slow down and try again.' }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': String(Math.max(retryAfter, 1)),
        },
      }
    );
  }
  return null;
}
