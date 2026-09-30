import { get, post, ApiError, isNotConnected } from './apiClient.js';

/**
 * Customer authentication. These call the /api/auth endpoints a backend will provide;
 * until then every call rejects with an honest "not available yet" message and
 * nobody is ever shown as signed in.
 */
const UNAVAILABLE = 'Customer accounts aren’t available yet. To request a move, use Get a quote — no account needed.';

const wrap = (promise) => promise.catch((err) => {
  if (isNotConnected(err)) throw new ApiError(UNAVAILABLE, 503);
  throw err;
});

export const fetchSession = () => get('/auth/session').then((d) => d?.user || null).catch(() => null);
export const login = ({ email, password, remember }) => wrap(post('/auth/login', { email, password, remember })).then((d) => d.user);
export const signup = (details) => wrap(post('/auth/signup', details)).then((d) => d.user);
export const logout = () => post('/auth/logout').catch(() => null);
export const requestPasswordReset = ({ email }) => wrap(post('/auth/forgot-password', { email }));
export const resetPassword = ({ token, password }) => wrap(post('/auth/reset-password', { token, password }));
