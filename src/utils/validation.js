/**
 * Small validation helpers. Each rule returns an error message or '' — forms
 * combine them per field and show the first failure inline.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.-]{7,}$/;

export const required = (msg = 'This field is required.') => (v) =>
  (Array.isArray(v) ? v.length : String(v ?? '').trim()) ? '' : msg;
export const email = (msg = 'Enter a valid email address, like name@example.com.') => (v) =>
  !v || EMAIL_RE.test(String(v).trim()) ? '' : msg;
export const phone = (msg = 'Enter a valid phone number.') => (v) =>
  !v || (PHONE_RE.test(v) && v.replace(/\D/g, '').length >= 7) ? '' : msg;
export const minLength = (n, msg) => (v) =>
  !v || String(v).trim().length >= n ? '' : msg || `Please enter at least ${n} characters.`;
export const maxLength = (n, msg) => (v) =>
  !v || String(v).length <= n ? '' : msg || `Please keep this under ${n} characters.`;
export const notBefore = (minIso, msg = 'Choose today or a later date.') => (v) =>
  !v || v >= minIso ? '' : msg;
export const matches = (getOther, msg = 'These values don’t match.') => (v, values) =>
  v === getOther(values) ? '' : msg;
export const checked = (msg = 'Please confirm to continue.') => (v) => (v ? '' : msg);

/** Reads a nested value: get({ origin: { city: 'X' } }, 'origin.city') → 'X'. */
export const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** Returns a copy of obj with the nested path set. */
export function setPath(obj, path, value) {
  const [head, ...rest] = path.split('.');
  if (!rest.length) return { ...obj, [head]: value };
  return { ...obj, [head]: setPath(obj?.[head] ?? {}, rest.join('.'), value) };
}

/** Runs a { path: [rules] } schema and returns { path: message } for failures. */
export function validate(values, schema) {
  const errors = {};
  for (const [path, rules] of Object.entries(schema)) {
    for (const rule of [].concat(rules)) {
      const msg = rule(getPath(values, path), values);
      if (msg) { errors[path] = msg; break; }
    }
  }
  return errors;
}
