/**
 * Server configuration from environment variables (see `.env.example`). Required
 * values are checked when first used, so a missing setting produces a clear 503
 * instead of a crash.
 */
const env = process.env;

const list = (value) => String(value || '').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);

const frontendUrl = (env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
const sameSite = ['lax', 'strict', 'none'].includes(String(env.COOKIE_SAMESITE).toLowerCase())
  ? String(env.COOKIE_SAMESITE).toLowerCase()
  : 'lax';

export const config = {
  isProd: env.NODE_ENV === 'production',
  port: Number(env.PORT) || 4000,
  mongoUri: env.MONGODB_URI || '',
  mongoDb: env.MONGODB_DB || 'realmovingcanada',
  jwtSecret: env.JWT_SECRET || '',
  /** Main website address — used in password-reset links. */
  frontendUrl,
  /** Website origins allowed to call the API with cookies (CORS). */
  corsOrigins: [...new Set([frontendUrl, ...list(env.CORS_ORIGINS)])],
  /** "none" is needed when the website and API are on different domains; it requires HTTPS. */
  cookieSameSite: sameSite,
  cookieSecure: sameSite === 'none' || env.NODE_ENV === 'production',
  sessionCookie: 'rmc_session',
  /** Email (Resend). Without a key, emails are logged instead of sent. */
  resendApiKey: env.RESEND_API_KEY || '',
  emailFrom: env.EMAIL_FROM || 'Real Moving Canada <no-reply@realmovingcanada.ca>',
  staffEmail: env.STAFF_NOTIFY_EMAIL || '',
};

export class ConfigError extends Error {
  constructor(name) {
    super(`Server setting ${name} is missing.`);
    this.name = 'ConfigError';
    this.status = 503;
    this.expose = false;
  }
}

/** Throws a ConfigError if a required setting is missing or too weak. */
export function requireSetting(name) {
  if (name === 'MONGODB_URI' && !config.mongoUri) throw new ConfigError(name);
  if (name === 'JWT_SECRET' && config.jwtSecret.length < 32) throw new ConfigError(name);
}
