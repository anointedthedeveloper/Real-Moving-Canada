import { connectDb } from '../db.js';
import { readSession } from '../lib/auth.js';
import { unauthorized, forbidden } from '../lib/errors.js';
import { User } from '../models/index.js';

/**
 * Loads the signed-in user (if any) onto req.user. Sessions issued before the
 * last password change are rejected, so resetting a password signs out other devices.
 */
export async function loadUser(req, _res, next) {
  const session = readSession(req);
  if (!session?.sub) return next();
  await connectDb();
  const user = await User.findById(session.sub).select('+passwordChangedAt');
  if (!user) return next();
  if (user.passwordChangedAt && session.iat * 1000 < user.passwordChangedAt.getTime() - 1000) return next();
  req.user = user;
  return next();
}

export function requireAuth(req, _res, next) {
  return req.user ? next() : next(unauthorized());
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  return roles.includes(req.user.role) ? next() : next(forbidden());
};
