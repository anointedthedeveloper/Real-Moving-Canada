import mongoose from 'mongoose';
import { publicJson } from './shared.js';

/** Amounts due, payments, invoices and receipts. Amounts are stored in cents. */
const paymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  bookingReference: String,
  kind: { type: String, enum: ['invoice', 'payment', 'receipt'], default: 'invoice' },
  amountCents: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'CAD' },
  status: { type: String, enum: ['Due', 'Processing', 'Paid', 'Failed', 'Refunded'], default: 'Due' },
  dueDate: Date,
  paidAt: Date,
  fileUrl: String,
  provider: String,
  providerRef: String,
}, { timestamps: true });

publicJson(paymentSchema, (out) => {
  const { providerRef: _ref, provider: _p, ...rest } = out;
  return {
    ...rest,
    bookingId: out.bookingReference,
    amount: out.amountCents / 100,
    date: out.paidAt || out.createdAt,
    type: out.kind === 'payment' ? 'payment' : 'document',
  };
});

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
