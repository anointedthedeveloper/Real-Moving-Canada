import { Router } from 'express';
import { connectDb } from '../db.js';
import { config } from '../config.js';
import { User, PasswordReset, QuoteRequest, Activity } from '../models/index.js';
import { hashPassword, checkPassword, burnPasswordCheck, startSession, endSession } from '../lib/auth.js';
import { conflict, unauthorized, badRequest, tooMany } from '../lib/errors.js';
import { randomToken, sha256 } from '../lib/ids.js';
import { sendEmail, emailLayout } from '../lib/email.js';
import { signupSchema, loginSchema, forgotSchema, resetSchema } from '../lib/validation.js';
import { rateLimit } from '../middleware/security.js';

const router = Router();
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const RESET_TTL_MINUTES = 60;

/** Shape returned to the frontend for the signed-in customer. */
export const sessionUser = (u) => ({ id: String(u._id), firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role });

/** Quote requests sent with the same email before the account existed are attached to it. */
async function linkEarlierRequests(user) {
  await QuoteRequest.updateMany({ 'contact.email': user.email, userId: { $exists: false } }, { $set: { userId: user._id } });
}

router.get('/session', (req, res) => {
  res.json({ user: req.user ? sessionUser(req.user) : null });
});

router.post('/signup', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), async (req, res) => {
  const data = signupSchema.parse(req.body);
  await connectDb();
  if (await User.exists({ email: data.email })) {
    throw conflict('An account with this email already exists.', { email: 'An account with this email already exists. Try signing in instead.' });
  }
  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash: await hashPassword(data.password),
    passwordChangedAt: new Date(Date.now() - 2000),
  });
  await linkEarlierRequests(user);
  await Activity.create({ userId: user._id, type: 'account', title: 'Account created' });
  startSession(res, user);
  res.status(201).json({ user: sessionUser(user) });
});

router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), async (req, res) => {
  const { email, password, remember } = loginSchema.parse(req.body);
  await connectDb();
  const user = await User.findOne({ email }).select('+passwordHash +failedLogins +lockUntil');
  if (!user) {
    await burnPasswordCheck(password);
    throw unauthorized('Email or password is incorrect.');
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw tooMany(`Too many failed attempts. Try again in ${LOCK_MINUTES} minutes, or reset your password.`);
  }
  if (!(await checkPassword(password, user.passwordHash))) {
    const failed = (user.failedLogins || 0) + 1;
    await User.updateOne({ _id: user._id }, failed >= MAX_FAILED_LOGINS
      ? { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) }
      : { failedLogins: failed });
    throw unauthorized('Email or password is incorrect.');
  }
  await User.updateOne({ _id: user._id }, { failedLogins: 0, $unset: { lockUntil: 1 }, lastLoginAt: new Date() });
  await linkEarlierRequests(user);
  startSession(res, user, { remember });
  res.json({ user: sessionUser(user) });
});

router.post('/logout', (_req, res) => {
  endSession(res);
  res.status(204).end();
});

/** Always answers the same way, so it can't be used to find out who has an account. */
router.post('/forgot-password', rateLimit({ windowMs: 60 * 60 * 1000, max: 8 }), async (req, res) => {
  const { email } = forgotSchema.parse(req.body);
  await connectDb();
  const user = await User.findOne({ email });
  if (user) {
    const token = randomToken();
    await PasswordReset.deleteMany({ userId: user._id, usedAt: { $exists: false } });
    await PasswordReset.create({ userId: user._id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000) });
    const url = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your Real Moving Canada password',
      text: `Hi ${user.firstName},\n\nUse this link to choose a new password (it expires in ${RESET_TTL_MINUTES} minutes):\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
      html: emailLayout('Reset your password', [`Hi ${user.firstName},`, `Use the button below to choose a new password. The link expires in ${RESET_TTL_MINUTES} minutes.`, 'If you didn’t ask for this, you can ignore this email — your password won’t change.'], { url, label: 'Choose a new password' }),
    });
  }
  res.json({ ok: true });
});

router.post('/reset-password', rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }), async (req, res) => {
  const { token, password } = resetSchema.parse(req.body);
  await connectDb();
  const reset = await PasswordReset.findOne({ tokenHash: sha256(token), usedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
  if (!reset) throw badRequest('This reset link is invalid or has expired. Please request a new one.');
  await User.updateOne({ _id: reset.userId }, {
    passwordHash: await hashPassword(password),
    passwordChangedAt: new Date(),
    failedLogins: 0,
    $unset: { lockUntil: 1 },
  });
  reset.usedAt = new Date();
  await reset.save();
  await PasswordReset.deleteMany({ userId: reset.userId, usedAt: { $exists: false } });
  endSession(res);
  res.json({ ok: true });
});

export default router;
