import mongoose from 'mongoose';
import { publicJson } from './shared.js';

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reference: String,
  name: { type: String, required: true, maxlength: 200 },
  category: { type: String, enum: ['move', 'quote', 'invoice', 'upload'], default: 'upload' },
  fileType: String,
  size: String,
  url: String,
  storageKey: String,
  uploadedBy: { type: String, enum: ['customer', 'staff'], default: 'staff' },
}, { timestamps: true });

publicJson(documentSchema, (out, doc) => {
  const { storageKey: _k, ...rest } = out;
  return { ...rest, id: String(doc._id) };
});

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
