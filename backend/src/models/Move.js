import mongoose from 'mongoose';
import { placeSchema, publicJson } from './shared.js';

/** A customer's move, from request through to move day. `stage`: 0 request · 1 quote · 2 booked · 3 move day. */
const moveSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quoteRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuoteRequest' },
  origin: placeSchema,
  destination: placeSchema,
  moveDate: String,
  arrivalWindow: String,
  services: [String],
  status: { type: String, enum: ['Draft', 'Upcoming', 'In progress', 'Completed', 'Cancelled'], default: 'Draft' },
  stage: { type: Number, min: 0, max: 3, default: 0 },
}, { timestamps: true });

publicJson(moveSchema);

export default mongoose.models.Move || mongoose.model('Move', moveSchema);
