import cors from 'cors';
import { config } from '../config.js';
import { forbidden, tooMany } from '../lib/errors.js';

/**
 * CORS: only the website's own origins may call the API with cookies. Requests
 * without an Origin header (server-to-server, curl, health checks) are allowed.
 */
export const corsPolicy = cors({
  origin(origin, callback) {
    callback(null, !origin || config.corsOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With'],
  maxAge: 86400,
});

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
 * the frontend always sends (browsers won't add custom headers to cross-site form
 * posts), and if the browser says where the request came from, it must be one of
 * the allowed website origins.
 */
export function requireAjax(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') return next(forbidden('Request blocked.'));
  const origin = req.get('Origin');
  if (origin && !config.corsOrigins.includes(origin.replace(/\/+$/, ''))) return next(forbidden('Request blocked.'));
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
