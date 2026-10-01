import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config, requireSetting } from '../config.js';

const BCRYPT_ROUNDS = 12;
const DAY = 24 * 60 * 60;

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const checkPassword = (password, hash) => bcrypt.compare(password, hash);

/** A dummy hash so failed lookups take as long as real password checks (no user enumeration by timing). */
let dummyHash;
export async function burnPasswordCheck(password) {
  dummyHash ||= await bcrypt.hash('placeholder-password-for-timing', BCRYPT_ROUNDS);
  await bcrypt.compare(password, dummyHash);
  return false;
}

/**
 * Signs the session token and sets it as an httpOnly cookie. "Remember me" keeps
 * the session for 30 days; otherwise it lasts one day and ends when the browser closes.
 */
export function startSession(res, user, { remember = false } = {}) {
  requireSetting('JWT_SECRET');
  const maxAge = remember ? 30 * DAY : DAY;
  const token = jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, { expiresIn: maxAge });
  res.cookie(config.sessionCookie, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/',
    ...(remember ? { maxAge: maxAge * 1000 } : {}),
  });
}

export function endSession(res) {
  res.clearCookie(config.sessionCookie, { httpOnly: true, secure: config.cookieSecure, sameSite: config.cookieSameSite, path: '/' });
}

/** Returns the token payload, or null when the cookie is missing, invalid or expired. */
export function readSession(req) {
  const token = req.cookies?.[config.sessionCookie];
  if (!token || !config.jwtSecret) return null;
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}
