import { Router } from 'express';
import { connectDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { Move, Quote, Booking, Payment, Document, Conversation, Activity, User, QuoteRequest } from '../models/index.js';
import { conflict, notFound, unavailable } from '../lib/errors.js';
import { profileSchema, settingsSchema, messageSchema } from '../lib/validation.js';

const router = Router();
router.use(requireAuth);
router.use(async (_req, _res, next) => { await connectDb(); next(); });

const mine = (req) => ({ userId: req.user._id });
const money = (cents) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);

/** Quote requests that haven't become a move yet are shown as draft moves. */
const requestAsMove = (r) => ({
  id: r.reference,
  origin: r.origin,
  destination: r.destination,
  moveDate: r.moveDate,
  status: 'Draft',
  stage: 0,
  services: r.services,
});

router.get('/overview', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const [move, quote, booking, due, activity] = await Promise.all([
    Move.findOne({ ...mine(req), status: { $in: ['Upcoming', 'In progress'] }, moveDate: { $gte: today } }).sort({ moveDate: 1 }),
    Quote.findOne(mine(req)).sort({ createdAt: -1 }),
    Booking.findOne(mine(req)).sort({ createdAt: -1 }),
    Payment.findOne({ ...mine(req), status: 'Due' }).sort({ dueDate: 1 }),
    Activity.find(mine(req)).sort({ at: -1 }).limit(6),
  ]);
  res.json({
    upcomingMove: move,
    summary: {
      moveDate: move?.moveDate, moveId: move?.reference, moveStatus: move?.status,
      quoteStatus: quote?.status, quoteId: quote?.reference,
      bookingStatus: booking?.status, bookingId: booking?.reference,
      paymentStatus: due ? 'Action needed' : undefined, amountDue: due ? money(due.amountCents) : undefined,
    },
    activity,
  });
});

router.get('/moves', async (req, res) => {
  const [moves, requests] = await Promise.all([
    Move.find(mine(req)).sort({ moveDate: -1 }),
    QuoteRequest.find({ ...mine(req), status: { $in: ['new', 'reviewing'] } }).sort({ createdAt: -1 }),
  ]);
  const linked = new Set(moves.map((m) => String(m.quoteRequestId)));
  res.json({ moves: [...moves.map((m) => m.toJSON()), ...requests.filter((r) => !linked.has(String(r._id))).map(requestAsMove)] });
});

router.get('/quotes', async (req, res) => {
  res.json({ quotes: await Quote.find(mine(req)).sort({ createdAt: -1 }) });
});

router.post('/quotes/:reference/accept', async (req, res) => {
  const quote = await Quote.findOne({ ...mine(req), reference: req.params.reference });
  if (!quote) throw notFound('Quote not found.');
  if (quote.status !== 'Ready') throw conflict('This quote can’t be accepted right now.');
  if (quote.validUntil && quote.validUntil < new Date()) throw conflict('This quote has expired. Please contact us for an updated quote.');
  quote.status = 'Accepted';
  quote.acceptedAt = new Date();
  await quote.save();
  await Activity.create({ userId: req.user._id, type: 'quote', title: 'Quote accepted', reference: quote.reference });
  res.json({ quote });
});

router.get('/bookings', async (req, res) => {
  res.json({ bookings: await Booking.find(mine(req)).sort({ moveDate: -1 }) });
});

router.get('/payments', async (req, res) => {
  res.json({ payments: await Payment.find(mine(req)).sort({ createdAt: -1 }) });
});

/** Card payments need a payment provider (e.g. Stripe) — see README "Backend". */
router.post('/payments', () => {
  throw unavailable('Online payments aren’t available yet. Please call us to pay by phone.');
});

router.get('/documents', async (req, res) => {
  res.json({ documents: await Document.find(mine(req)).sort({ updatedAt: -1 }) });
});

/** File uploads need file storage (e.g. Vercel Blob or S3) — see README "Backend". */
router.post('/documents', () => {
  throw unavailable('Document uploads aren’t available yet. Please email the document to us.');
});

router.get('/messages', async (req, res) => {
  res.json({ conversations: await Conversation.find(mine(req)).sort({ updatedAt: -1 }) });
});

router.post('/messages/:reference', async (req, res) => {
  const { body } = messageSchema.parse(req.body);
  const convo = await Conversation.findOne({ ...mine(req), reference: req.params.reference });
  if (!convo) throw notFound('Conversation not found.');
  convo.messages.push({ from: 'customer', body });
  convo.unreadForTeam = true;
  convo.unreadForCustomer = false;
  await convo.save();
  res.status(201).json({ conversation: convo });
});

router.get('/profile', async (req, res) => {
  const activeMoves = await Move.countDocuments({ ...mine(req), status: { $in: ['Upcoming', 'In progress'] } });
  res.json({ profile: { ...req.user.toJSON(), activeMoves } });
});

router.put('/profile', async (req, res) => {
  const data = profileSchema.parse(req.body);
  if (data.email !== req.user.email && await User.exists({ email: data.email, _id: { $ne: req.user._id } })) {
    throw conflict('That email is used by another account.', { email: 'That email is used by another account.' });
  }
  Object.assign(req.user, data);
  await req.user.save();
  res.json({ profile: req.user });
});

router.put('/settings', async (req, res) => {
  const { notifications } = settingsSchema.parse(req.body);
  req.user.notifications = notifications;
  await req.user.save();
  res.json({ notifications: req.user.notifications });
});

export default router;
