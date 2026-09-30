import { FORMSPREE_ENDPOINT } from './config.js';

const isConfigured = () => /^https:\/\/formspree\.io\/f\/\w+$/.test(FORMSPREE_ENDPOINT);

export class FormspreeError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'FormspreeError';
    this.fields = fields;
  }
}

/**
 * Posts a flat object of form fields to Formspree as JSON.
 * `subject` becomes the email subject line (Formspree's `_subject` field).
 */
export async function submitToFormspree(data, { subject } = {}) {
  if (!isConfigured()) {
    throw new FormspreeError('This form isn’t connected yet. Set VITE_FORMSPREE_ENDPOINT to start receiving submissions.');
  }
  const payload = { ...data };
  if (subject) payload._subject = subject;

  let res;
  try {
    res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new FormspreeError('We couldn’t reach the server. Check your connection and try again.');
  }
  if (res.ok) return true;

  let body = null;
  try { body = await res.json(); } catch { /* non-JSON error body */ }
  const fields = {};
  (body?.errors || []).forEach((e) => { if (e.field) fields[e.field] = e.message; });
  const message = body?.errors?.map((e) => e.message).filter(Boolean).join(' ')
    || 'We couldn’t send your request. Please try again, or call us directly.';
  throw new FormspreeError(message, fields);
}
