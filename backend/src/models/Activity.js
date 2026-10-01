import mongoose from 'mongoose';

/** Entries for the portal's "Recent activity" list. */
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['quote', 'booking', 'document', 'payment', 'message', 'account'], required: true },
  title: { type: String, required: true, maxlength: 160 },
  reference: String,
  at: { type: Date, default: Date.now },
});

activitySchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) { return { id: String(ret._id), type: ret.type, title: ret.title, reference: ret.reference, at: ret.at }; },
});

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema);
