import { API_BASE } from './config.js';

/** Error thrown for any failed API request. `fields` maps field names to messages. */
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

/** Message shown when an endpoint doesn't exist yet (the backend isn't connected). */
export const NOT_CONNECTED = 'not_connected';

/**
 * Minimal REST client. Sends the X-Requested-With header a CSRF guard can check,
 * uses same-origin cookies, and normalises error responses into ApiError.
 */
export async function api(path, { method = 'GET', body, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      signal,
      credentials: 'include', // the API is on its own domain (api.realmovingcanada.ca)
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('We couldn’t reach the server. Check your connection and try again.', 0);
  }

  let data = null;
  if (res.status !== 204) {
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  }
  // A static host answers unknown /api routes with HTML (the app shell or a 404 page):
  // treat that as "no backend yet" rather than as a successful response.
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (res.ok && !isJson && res.status !== 204) {
    throw new ApiError(NOT_CONNECTED, 404);
  }
  if (!res.ok) {
    if (res.status === 404 && !isJson) throw new ApiError(NOT_CONNECTED, 404);
    const e = data?.error || data || {};
    const fallback = res.status === 429 ? 'Too many requests. Please wait a moment and try again.' : 'Something went wrong. Please try again.';
    throw new ApiError(e.message || fallback, res.status, e.fields || {});
  }
  return data;
}

export const get = (path, opts) => api(path, opts);
export const post = (path, body, opts) => api(path, { ...opts, method: 'POST', body: body ?? {} });
export const put = (path, body, opts) => api(path, { ...opts, method: 'PUT', body: body ?? {} });

export const isNotConnected = (err) => err?.message === NOT_CONNECTED;
