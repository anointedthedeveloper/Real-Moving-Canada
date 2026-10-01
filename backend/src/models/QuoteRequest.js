import mongoose from 'mongoose';
import { placeSchema, publicJson } from './shared.js';

/** A request submitted through the website's quote form, before staff price it. */
const quoteRequestSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  contact: {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, index: true },
    phone: { type: String, trim: true, maxlength: 30 },
    contactMethod: { type: String, trim: true, maxlength: 20 },
  },
  wantsAccount: { type: Boolean, default: false },
  origin: placeSchema,
  destination: placeSchema,
  moveDate: String,
  moveType: String,
  services: [{ type: String, maxlength: 60 }],
  heavyItems: { type: String, maxlength: 500 },
  storageDetails: { type: String, maxlength: 500 },
  notes: { type: String, maxlength: 3000 },
  status: { type: String, enum: ['new', 'reviewing', 'quoted', 'closed'], default: 'new', index: true },
}, { timestamps: true });

publicJson(quoteRequestSchema);

export default mongoose.models.QuoteRequest || mongoose.model('QuoteRequest', quoteRequestSchema);
