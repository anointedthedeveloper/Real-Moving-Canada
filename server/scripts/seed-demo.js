/**
 * Creates a demo customer with a sample move, quote, booking, payment, document and
 * conversation, so the portal can be shown working end to end:
 *   npm run seed:demo
 * Sign in as demo@realmovingcanada.test / DemoMove2026!  — refuses to run against
 * production unless --force is given. Re-running replaces the demo data.
 */
import { connectDb, disconnectDb } from '../db.js';
import { config } from '../config.js';
import { hashPassword } from '../lib/auth.js';
import { reference } from '../lib/ids.js';
import { User, Move, Quote, Booking, Payment, Document, Conversation, Activity, QuoteRequest } from '../models/index.js';

if (config.isProd && !process.argv.includes('--force')) {
  console.error('Refusing to seed demo data in production. Use --force if you really mean it.');
  process.exit(1);
}

const EMAIL = 'demo@realmovingcanada.test';
const PASSWORD = 'DemoMove2026!';
const days = (n) => new Date(Date.now() + n * 864e5);
const isoDay = (n) => days(n).toISOString().slice(0, 10);

await connectDb();
const existing = await User.findOne({ email: EMAIL });
if (existing) {
  const q = { userId: existing._id };
  await Promise.all([Move, Quote, Booking, Payment, Document, Conversation, Activity, QuoteRequest].map((M) => M.deleteMany(q)));
  await existing.deleteOne();
}

const user = await User.create({
  firstName: 'Jordan', lastName: 'Smith', email: EMAIL, passwordHash: await hashPassword(PASSWORD),
  passwordChangedAt: new Date(Date.now() - 5000), phone: '(306) 555-0123', city: 'Saskatoon', province: 'SK', contactMethod: 'email',
});
const origin = { address: '120 Example Cres', city: 'Saskatoon', province: 'SK', postalCode: 'S7N 0A1', propertyType: 'house', rooms: 'three_bed' };
const destination = { address: '45 Sample Ave SW', city: 'Calgary', province: 'AB', postalCode: 'T2P 1J9', propertyType: 'condo', rooms: 'two_bed' };
const services = ['Packing / Unpacking', 'Loading / Unloading', 'Furniture Disassembly / Reassembly'];

const move = await Move.create({ reference: reference('MV'), userId: user._id, origin, destination, moveDate: isoDay(21), arrivalWindow: '8:00 – 10:00 am', services, status: 'Upcoming', stage: 2 });
const quote = await Quote.create({ reference: reference('Q'), userId: user._id, moveId: move._id, moveReference: move.reference, origin, destination, preferredDate: move.moveDate, totalCents: 245000, services, validUntil: days(14), status: 'Accepted', acceptedAt: days(-3) });
await Quote.create({ reference: reference('Q'), userId: user._id, moveId: move._id, moveReference: move.reference, origin, destination, preferredDate: move.moveDate, totalCents: 32000, services: ['Storage (2 weeks)'], validUntil: days(10), status: 'Ready' });
const booking = await Booking.create({ reference: reference('BK'), userId: user._id, moveId: move._id, moveReference: move.reference, quoteId: quote._id, origin, destination, moveDate: move.moveDate, arrivalWindow: move.arrivalWindow, status: 'Confirmed' });
await Payment.create({ reference: reference('INV'), userId: user._id, bookingId: booking._id, bookingReference: booking.reference, kind: 'invoice', amountCents: 122500, status: 'Due', dueDate: days(14) });
await Payment.create({ reference: reference('PAY'), userId: user._id, bookingId: booking._id, bookingReference: booking.reference, kind: 'payment', amountCents: 122500, status: 'Paid', paidAt: days(-2) });
await Document.create({ userId: user._id, reference: quote.reference, name: 'Moving quote', category: 'quote', fileType: 'PDF', size: '180 KB' });
await Conversation.create({
  reference: reference('MSG'), userId: user._id, subject: 'Move details', moveReference: move.reference, unreadForCustomer: true,
  messages: [
    { from: 'customer', body: 'Hi, can the crew arrive before 9 am?', sentAt: days(-2) },
    { from: 'team', body: 'Yes — we’ve set your arrival window to 8:00 – 10:00 am and the crew will call when they’re on the way.', sentAt: days(-1) },
  ],
});
await Activity.insertMany([
  { userId: user._id, type: 'quote', title: 'Quote accepted', reference: quote.reference, at: days(-3) },
  { userId: user._id, type: 'booking', title: 'Booking confirmed', reference: booking.reference, at: days(-2) },
  { userId: user._id, type: 'message', title: 'New message from our team', reference: move.reference, at: days(-1) },
]);

console.log(`Demo data ready. Sign in as ${EMAIL} / ${PASSWORD}`);
await disconnectDb();
