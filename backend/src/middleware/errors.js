import mongoose from 'mongoose';
import { ZodError } from 'zod';

/** JSON 404 for unknown /api routes (so the frontend never mistakes it for a page). */
export function apiNotFound(_req, res) {
  res.status(404).json({ error: { message: 'Not found.' } });
}

/**
 * Turns any thrown error into `{ error: { message, fields } }` — the shape the
 * frontend's api client reads. Unexpected errors are logged and hidden.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const fields = {};
    err.issues.forEach((i) => { const key = i.path.join('.'); if (key && !fields[key]) fields[key] = i.message; });
    return res.status(400).json({ error: { message: 'Please check the highlighted fields and try again.', fields } });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ error: { message: 'Not found.' } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'The request could not be read.' } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'That request is too large.' } });
  }
  const status = err?.status || 500;
  if (status >= 500 && !err?.expose) console.error('[api]', err);
  const message = err?.expose
    ? err.message
    : status === 503
      ? 'This service is temporarily unavailable. Please try again shortly.'
      : 'Something went wrong. Please try again.';
  return res.status(status).json({ error: { message, ...(err?.fields ? { fields: err.fields } : {}) } });
}
