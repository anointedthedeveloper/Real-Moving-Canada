/**
 * Server configuration from environment variables. Required values are checked
 * when first used, so a missing setting produces a clear 503 instead of a crash.
 *
 * Set these in Vercel → Project → Settings → Environment Variables, and in a local
 * `.env` file for development (see `.env.example`).
 */
const env = process.env;

export const config = {
  isProd: env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production',
  mongoUri: env.MONGODB_URI || '',
  mongoDb: env.MONGODB_DB || 'realmovingcanada',
  jwtSecret: env.JWT_SECRET || '',
  /** Public site address, used in password-reset links. */
  appUrl: (env.APP_URL || env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  /** Email (Resend). Without a key, emails are logged instead of sent. */
  resendApiKey: env.RESEND_API_KEY || '',
  emailFrom: env.EMAIL_FROM || 'Real Moving Canada <no-reply@realmovingcanada.ca>',
  staffEmail: env.STAFF_NOTIFY_EMAIL || '',
  sessionCookie: 'rmc_session',
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
