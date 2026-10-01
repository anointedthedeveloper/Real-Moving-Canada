import mongoose from 'mongoose';
import { placeSchema, publicJson } from './shared.js';

/** A priced quote prepared by staff for a move. Amounts are stored in cents. */
const quoteSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  moveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Move' },
  moveReference: String,
  origin: placeSchema,
  destination: placeSchema,
  preferredDate: String,
  totalCents: { type: Number, min: 0 },
  currency: { type: String, default: 'CAD' },
  services: [String],
  validUntil: Date,
  status: { type: String, enum: ['In review', 'Ready', 'Accepted', 'Declined', 'Archived', 'Expired'], default: 'In review' },
  documentUrl: String,
  acceptedAt: Date,
}, { timestamps: true });

publicJson(quoteSchema, (out) => ({
  ...out,
  moveId: out.moveReference,
  date: out.createdAt,
  total: out.totalCents == null ? null : out.totalCents / 100,
  downloadUrl: out.documentUrl,
}));

export default mongoose.models.Quote || mongoose.model('Quote', quoteSchema);
