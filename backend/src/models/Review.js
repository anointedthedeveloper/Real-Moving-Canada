import mongoose from 'mongoose';

/** Customer reviews. Submitted as `pending`; staff publish them. */
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 100 },
  body: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending', index: true },
  publishedAt: Date,
}, { timestamps: true });

/** Public shape: first name and last initial only, never the email. */
reviewSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const [first, ...rest] = String(ret.name).trim().split(/\s+/);
    const last = rest.at(-1);
    return {
      id: String(ret._id),
      rating: ret.rating,
      title: ret.title,
      body: ret.body,
      displayName: last ? `${first} ${last[0]}.` : first,
      date: ret.publishedAt || ret.createdAt,
    };
  },
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
