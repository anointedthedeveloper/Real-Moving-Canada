import { Router } from 'express';
import { connectDb } from '../db.js';
import { config } from '../config.js';
import { QuoteRequest, Review, Activity } from '../models/index.js';
import { reference } from '../lib/ids.js';
import { unavailable } from '../lib/errors.js';
import { sendEmail } from '../lib/email.js';
import { quoteRequestSchema, reviewSchema } from '../lib/validation.js';
import { rateLimit } from '../middleware/security.js';

const router = Router();

const PROVINCES = [
  ['BC', 'British Columbia', 'West Coast'], ['AB', 'Alberta', 'Prairies'], ['SK', 'Saskatchewan', 'Prairies'],
  ['MB', 'Manitoba', 'Prairies'], ['ON', 'Ontario', 'Central Canada'], ['QC', 'Quebec', 'Central Canada'],
  ['NB', 'New Brunswick', 'Atlantic Canada'], ['NS', 'Nova Scotia', 'Atlantic Canada'], ['PE', 'Prince Edward Island', 'Atlantic Canada'],
  ['NL', 'Newfoundland and Labrador', 'Atlantic Canada'], ['YT', 'Yukon', 'Northern Canada'], ['NT', 'Northwest Territories', 'Northern Canada'],
  ['NU', 'Nunavut', 'Northern Canada'],
];

router.get('/service-areas', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({ areas: PROVINCES.map(([code, name, region]) => ({ code, name, region, isActive: true, cities: [] })) });
});

/**
 * Instant estimates need the company's pricing (rates per home size, distance,
 * season and service). Until those rates are provided this answers 503, and the
 * website offers a quote request instead of an instant price.
 */
router.post('/estimate', () => {
  throw unavailable('Instant estimates aren’t available right now.');
});

/** Quote requests from the website. Saved for the team and linked to the customer's account. */
router.post('/quotes', rateLimit({ windowMs: 60 * 60 * 1000, max: 15 }), async (req, res) => {
  const data = quoteRequestSchema.parse(req.body);
  if (data._gotcha) return res.status(201).json({ reference: reference('QR') }); // spam trap: pretend success
  await connectDb();
  const request = await QuoteRequest.create({
    reference: reference('QR'),
    userId: req.user?._id,
    contact: { firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, contactMethod: data.contactMethod },
    wantsAccount: data.createAccount,
    origin: data.origin,
    destination: data.destination,
    moveDate: data.moveDate,
    moveType: data.moveType,
    services: data.services,
    heavyItems: data.heavyItems,
    storageDetails: data.storageDetails,
    notes: data.notes,
  });
  if (req.user) await Activity.create({ userId: req.user._id, type: 'quote', title: 'Quote request submitted', reference: request.reference });
  if (config.staffEmail) {
    const route = `${data.origin.city}, ${data.origin.province} → ${data.destination.city}, ${data.destination.province}`;
    await sendEmail({
      to: config.staffEmail,
      replyTo: data.email,
      subject: `New quote request ${request.reference} — ${data.firstName} ${data.lastName}`,
      text: `${data.firstName} ${data.lastName} (${data.email}, ${data.phone})\n${route}\nMove date: ${data.moveDate}\nServices: ${data.services.join(', ') || '—'}\nNotes: ${data.notes || '—'}`,
    });
  }
  res.status(201).json({ reference: request.reference });
});

router.get('/reviews', async (req, res) => {
  await connectDb();
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 30);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const filter = { status: 'published' };
  const [reviews, total, stats] = await Promise.all([
    Review.find(filter).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([{ $match: filter }, { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }]),
  ]);
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    summary: { count: stats[0]?.count || 0, average: stats[0]?.average ?? null },
    reviews,
    pagination: { page, totalPages: Math.max(Math.ceil(total / limit), 1), total },
  });
});

router.post('/reviews', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req, res) => {
  const data = reviewSchema.parse(req.body);
  if (data._gotcha) return res.status(201).json({ ok: true });
  await connectDb();
  await Review.create({ name: data.name, email: data.email, rating: data.rating, title: data.title, body: data.body });
  res.status(201).json({ ok: true });
});

export default router;
