import { forbidden, tooMany } from '../lib/errors.js';

/** Basic security headers for every API response. */
export function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
  });
  next();
}

/**
 * CSRF protection: state-changing requests must carry the X-Requested-With header
 * the frontend always sends. Browsers won't add custom headers to cross-site form
 * posts, and session cookies are SameSite=Lax as a second layer.
 */
export function requireAjax(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') return next(forbidden('Request blocked.'));
  return next();
}

/**
 * Small per-instance rate limiter (fixed window). On serverless each instance has
 * its own memory, so this slows down abuse rather than enforcing an exact limit;
 * login attempts are additionally locked per account in the database.
 */
export function rateLimit({ windowMs, max, key = (req) => req.ip }) {
  const hits = new Map();
  return (req, _res, next) => {
    const now = Date.now();
    const k = `${req.path}:${key(req)}`;
    const entry = hits.get(k);
    if (!entry || entry.reset < now) {
      hits.set(k, { count: 1, reset: now + windowMs });
      if (hits.size > 5000) hits.clear();
      return next();
    }
    entry.count += 1;
    return entry.count > max ? next(tooMany()) : next();
  };
}
