import mongoose from 'mongoose';
import { placeSchema, publicJson } from './shared.js';

const bookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  moveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Move' },
  moveReference: String,
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  origin: placeSchema,
  destination: placeSchema,
  moveDate: String,
  arrivalWindow: String,
  contactPhone: String,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

publicJson(bookingSchema, (out) => ({ ...out, moveId: out.moveReference }));

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
