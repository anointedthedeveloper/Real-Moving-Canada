import { get, post, ApiError, isNotConnected } from './apiClient.js';
import { COMPANY } from '../constants/company.js';

/**
 * Customer authentication against the /api/auth endpoints. If the auth service
 * can't be reached, calls reject with a friendly message and nobody is shown as
 * signed in.
 */
const UNAVAILABLE = `We couldn’t reach your account right now. Please try again in a few minutes, or call us at ${COMPANY.phone}.`;

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
